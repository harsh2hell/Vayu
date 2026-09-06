"""
ResNet18 Cyclone Morphology Classifier Training Pipeline (Phase 3B).
Trained strictly on the 4 scientifically supported classes:
  0: Eye Pattern
  1: Curved Band Pattern
  2: Shear Pattern
  3: Calm Baseline
Explicitly records:
  CDO: INSUFFICIENT DATA
  Embedded Center: INSUFFICIENT DATA
"""
import os
import json
import time
import hashlib
from typing import Dict, List, Tuple, Any

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from PIL import Image

from .models.dvorak_classifier import DvorakResNetClassifier, PHASE3B_CLASSES, INSUFFICIENT_CLASSES
from .preprocessor import get_satellite_transform

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SATELLITE_MANIFEST_PATH = os.path.join(BASE_DIR, "data", "datasets", "satellite", "satellite_manifest.json")
CHECKPOINT_DIR = os.path.join(os.path.dirname(__file__), "checkpoints", "phase3b")
CHECKPOINT_PATH = os.path.join(CHECKPOINT_DIR, "vayu_morph_resnet18_p3b.pt")
META_PATH = os.path.join(CHECKPOINT_DIR, "classifier_training_meta.json")

CLASS_NAME_TO_IDX = {
    "Eye": 0,
    "Curved Band": 1,
    "Shear": 2,
    "Calm": 3
}
IDX_TO_CLASS_NAME = {v: k for k, v in CLASS_NAME_TO_IDX.items()}

class Phase3BClassificationDataset(Dataset):
    def __init__(self, manifest_path: str, split: str = "train", transform=None):
        self.split = split
        self.transform = transform or get_satellite_transform((224, 224))
        self.samples = []

        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)

        for item in manifest["images"]:
            if item["split"] == split:
                abs_path = os.path.join(BASE_DIR, item["file"])
                m_class = item.get("morphology_class")
                if os.path.exists(abs_path) and m_class in CLASS_NAME_TO_IDX:
                    self.samples.append({
                        "file": abs_path,
                        "rel_file": item["file"],
                        "storm": item["storm"],
                        "channel": item["channel"],
                        "morphology_class": m_class,
                        "class_idx": CLASS_NAME_TO_IDX[m_class]
                    })

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample = self.samples[idx]
        img = Image.open(sample["file"]).convert("RGB")
        tensor = self.transform(img)
        target = torch.tensor(sample["class_idx"], dtype=torch.long)
        return tensor, target, sample["storm"], sample["morphology_class"]

def evaluate_classifier(model: DvorakResNetClassifier, dataloader: DataLoader, device: str = "cpu") -> Dict[str, Any]:
    model.eval()
    num_classes = len(CLASS_NAME_TO_IDX)
    confusion = np.zeros((num_classes, num_classes), dtype=int)
    total = 0
    correct = 0

    with torch.no_grad():
        for images, targets, storms, class_names in dataloader:
            images = images.to(device)
            targets = targets.to(device)
            logits, _ = model.forward_features(images)
            preds = torch.argmax(logits, dim=-1)

            for t, p in zip(targets.cpu().numpy(), preds.cpu().numpy()):
                confusion[t, p] += 1
                if t == p:
                    correct += 1
                total += 1

    per_class = {}
    f1_list = []
    for c_idx, c_name in IDX_TO_CLASS_NAME.items():
        tp = confusion[c_idx, c_idx]
        fp = np.sum(confusion[:, c_idx]) - tp
        fn = np.sum(confusion[c_idx, :]) - tp
        prec = tp / max(tp + fp, 1) if (tp + fp) > 0 else 0.0
        rec = tp / max(tp + fn, 1) if (tp + fn) > 0 else 0.0
        f1 = 2 * prec * rec / max(prec + rec, 1e-6) if (prec + rec) > 0 else 0.0
        support = int(np.sum(confusion[c_idx, :]))

        per_class[c_name] = {
            "precision": round(prec * 100.0, 2),
            "recall": round(rec * 100.0, 2),
            "f1": round(f1 * 100.0, 2),
            "support": support
        }
        if support > 0:
            f1_list.append(f1)

    macro_f1 = float(np.mean(f1_list)) * 100.0 if f1_list else 0.0
    acc = (correct / max(total, 1)) * 100.0

    return {
        "samples_evaluated": total,
        "overall_accuracy": round(acc, 2),
        "macro_f1": round(macro_f1, 2),
        "per_class_metrics": per_class,
        "confusion_matrix": confusion.tolist(),
        "class_labels": [IDX_TO_CLASS_NAME[i] for i in range(num_classes)]
    }

def train_morphology_classifier(epochs: int = 40, lr: float = 1e-3, seed: int = 42) -> Dict[str, Any]:
    torch.manual_seed(seed)
    np.random.seed(seed)
    device = "cpu"

    print("\n==================================================")
    print("PHASE 3B: AUDITING & RETRAINING RESNET18 MORPHOLOGY CLASSIFIER")
    print("==================================================")
    print(f"Scientific Class Selection:")
    for idx, c_name in IDX_TO_CLASS_NAME.items():
        print(f"  Class {idx}: {c_name} (Authenticated Real Labels)")
    print(f"Declared Insufficient Classes:")
    for inc, reason in INSUFFICIENT_CLASSES.items():
        print(f"  Class '{inc}': {reason}")

    train_ds = Phase3BClassificationDataset(SATELLITE_MANIFEST_PATH, split="train")
    val_ds = Phase3BClassificationDataset(SATELLITE_MANIFEST_PATH, split="validation")
    test_ds = Phase3BClassificationDataset(SATELLITE_MANIFEST_PATH, split="test")

    print(f"\nDataset Provenance: {SATELLITE_MANIFEST_PATH}")
    print(f"  Training Samples:   {len(train_ds)} real satellite frames across {len(set(s['storm'] for s in train_ds.samples))} storms")
    for s in train_ds.samples:
        print(f"    - {s['storm']:14s} | {s['channel']} | class={s['morphology_class']} ({s['class_idx']}) | {os.path.basename(s['file'])}")
    print(f"  Validation Samples: {len(val_ds)} real satellite frames ({list(set(s['storm'] for s in val_ds.samples))})")
    print(f"  Held-out Test:      {len(test_ds)} real satellite frames ({list(set(s['storm'] for s in test_ds.samples))})")

    # Compute inverse class frequency weights
    class_counts = [0] * len(CLASS_NAME_TO_IDX)
    for s in train_ds.samples:
        class_counts[s["class_idx"]] += 1
    total_samples = len(train_ds)
    weights = [total_samples / max(len(CLASS_NAME_TO_IDX) * c, 1) for c in class_counts]
    class_weights_tensor = torch.tensor(weights, dtype=torch.float32).to(device)

    print(f"\nClass Distribution in Training Set:")
    for idx, c_name in IDX_TO_CLASS_NAME.items():
        print(f"  {c_name:12s}: N={class_counts[idx]} | Loss Weight={weights[idx]:.2f}")

    train_loader = DataLoader(train_ds, batch_size=4, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=2, shuffle=False)
    test_loader = DataLoader(test_ds, batch_size=2, shuffle=False)

    model = DvorakResNetClassifier(pretrained=True, num_classes=4).to(device)

    # Freeze shallow convolutional stages
    for param in model.conv1.parameters():
        param.requires_grad = False
    for param in model.layer1.parameters():
        param.requires_grad = False
    for param in model.layer2.parameters():
        param.requires_grad = False

    optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=lr, weight_decay=1e-3)
    criterion = nn.CrossEntropyLoss(weight=class_weights_tensor)

    print(f"\n[Training] Retraining ResNet18 head on real benchmark frames for {epochs} epochs...")
    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0

        for images, targets, _, _ in train_loader:
            images = images.to(device)
            targets = targets.to(device)

            optimizer.zero_grad()
            logits, _ = model.forward_features(images)
            loss = criterion(logits, targets)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        if epoch % 10 == 0 or epoch == 1:
            print(f"  Epoch {epoch:02d}/{epochs} | Cross-Entropy Loss: {avg_loss:.4f}")

    # Evaluate on held-out splits
    print("\n[Evaluation] Evaluating retrained classifier on held-out validation and test sets...")
    val_metrics = evaluate_classifier(model, val_loader, device=device)
    test_metrics = evaluate_classifier(model, test_loader, device=device)

    print(f"  Validation Metrics (MOCHA, OCKHI):")
    print(f"    Accuracy: {val_metrics['overall_accuracy']}% | Macro F1: {val_metrics['macro_f1']}%")
    for c_name, m in val_metrics["per_class_metrics"].items():
        if m["support"] > 0:
            print(f"      {c_name:12s}: Precision {m['precision']}%, Recall {m['recall']}%, F1 {m['f1']}% (N={m['support']})")

    print(f"  Held-out Test Metrics (DANA, BIPARJOY):")
    print(f"    Accuracy: {test_metrics['overall_accuracy']}% | Macro F1: {test_metrics['macro_f1']}%")
    for c_name, m in test_metrics["per_class_metrics"].items():
        if m["support"] > 0:
            print(f"      {c_name:12s}: Precision {m['precision']}%, Recall {m['recall']}%, F1 {m['f1']}% (N={m['support']})")

    print(f"\n  Confusion Matrix (Test Set):")
    print(f"    Labels: {test_metrics['class_labels']}")
    for row in test_metrics["confusion_matrix"]:
        print(f"    {row}")

    # Save Phase 3B checkpoint
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    torch.save(model.state_dict(), CHECKPOINT_PATH)
    sha256 = hashlib.sha256(open(CHECKPOINT_PATH, "rb").read()).hexdigest()

    meta = {
        "model_name": "ResNet18-Dvorak-Morphology",
        "num_classes": 4,
        "classes_trained": [IDX_TO_CLASS_NAME[i] for i in range(len(IDX_TO_CLASS_NAME))],
        "insufficient_classes": INSUFFICIENT_CLASSES,
        "checkpoint_path": CHECKPOINT_PATH,
        "checkpoint_sha256": sha256,
        "parameters_count": sum(p.numel() for p in model.parameters()),
        "epochs": epochs,
        "learning_rate": lr,
        "seed": seed,
        "training_samples": len(train_ds),
        "validation_samples": len(val_ds),
        "test_samples": len(test_ds),
        "validation_metrics": val_metrics,
        "test_metrics": test_metrics,
        "train_storms": list(set(s["storm"] for s in train_ds.samples)),
        "val_storms": list(set(s["storm"] for s in val_ds.samples)),
        "test_storms": list(set(s["storm"] for s in test_ds.samples))
    }

    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    print(f"\n[Checkpoint Saved] -> {CHECKPOINT_PATH} ({os.path.getsize(CHECKPOINT_PATH)/1024/1024:.2f} MB)")
    print(f"  SHA-256: {sha256}")
    print(f"  Metadata: {META_PATH}")

    return meta

if __name__ == "__main__":
    train_morphology_classifier()
