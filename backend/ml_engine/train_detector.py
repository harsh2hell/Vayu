"""
Cyclone Center Localization & Objectness Training Pipeline (Phase 3B).
Trained strictly on Phase 3A Real Satellite Benchmark Dataset with storm-disjoint splits.
Zero synthetic frames, zero mock labels.
"""
import os
import json
import math
import time
import hashlib
from typing import Dict, List, Tuple, Any

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from PIL import Image

from .models.center_detector import CycloneCenterDetector
from .preprocessor import get_satellite_transform

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SATELLITE_MANIFEST_PATH = os.path.join(BASE_DIR, "data", "datasets", "satellite", "satellite_manifest.json")
CHECKPOINT_DIR = os.path.join(os.path.dirname(__file__), "checkpoints", "phase3b")
CHECKPOINT_PATH = os.path.join(CHECKPOINT_DIR, "vayu_detector_mobilenetv3_p3b.pt")
META_PATH = os.path.join(CHECKPOINT_DIR, "detector_training_meta.json")

class Phase3BSatelliteDataset(Dataset):
    """
    PyTorch Dataset for Phase 3A satellite imagery and ground truth bounding boxes.
    """
    def __init__(self, manifest_path: str, split: str = "train", transform=None):
        self.split = split
        self.transform = transform or get_satellite_transform((224, 224))
        self.samples = []

        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)

        for item in manifest["images"]:
            if item["split"] == split:
                abs_path = os.path.join(BASE_DIR, item["file"])
                if os.path.exists(abs_path):
                    self.samples.append({
                        "file": abs_path,
                        "rel_file": item["file"],
                        "storm": item["storm"],
                        "channel": item["channel"],
                        "objectness": float(item["objectness"]),
                        "cx": float(item["target_center_norm_x"]),
                        "cy": float(item["target_center_norm_y"]),
                        "vmax": float(item["intensity_knots"]),
                        "mslp": float(item["mslp_hpa"]),
                        "bbox": item["bbox"],
                        "center_lat": item.get("center_lat"),
                        "center_lon": item.get("center_lon"),
                    })

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample = self.samples[idx]
        img = Image.open(sample["file"]).convert("RGB")
        tensor = self.transform(img)

        # Bounding box extent: default 0.35 normalized width/height for cyclone, 0.1 for calm
        w = 0.35 if sample["objectness"] == 1.0 else 0.10
        h = 0.35 if sample["objectness"] == 1.0 else 0.10

        target = {
            "objectness": torch.tensor([sample["objectness"]], dtype=torch.float32),
            "center": torch.tensor([sample["cx"], sample["cy"]], dtype=torch.float32),
            "bbox": torch.tensor([sample["cx"], sample["cy"], w, h], dtype=torch.float32),
            "vmax": torch.tensor([sample["vmax"]], dtype=torch.float32),
            "mslp": torch.tensor([sample["mslp"]], dtype=torch.float32),
            "storm": sample["storm"],
            "channel": sample["channel"],
            "bbox_geo": sample["bbox"],
            "center_lat": sample["center_lat"] if sample["center_lat"] is not None else -999.0,
            "center_lon": sample["center_lon"] if sample["center_lon"] is not None else -999.0
        }
        return tensor, target

def evaluate_detector(model: CycloneCenterDetector, dataloader: DataLoader, device: str = "cpu") -> Dict[str, Any]:
    model.eval()
    tp = 0
    fp = 0
    tn = 0
    fn = 0
    calm_total = 0
    calm_fp = 0
    cle_pixels = []
    cle_km_list = []

    with torch.no_grad():
        for images, targets in dataloader:
            images = images.to(device)
            out = model(images)

            probs = out["cyclone_probability"].cpu().numpy().flatten()
            centers = out["center"].cpu().numpy()
            gt_obj = targets["objectness"].numpy().flatten()
            gt_center = targets["center"].numpy()

            for i in range(len(probs)):
                pred_obj = 1.0 if probs[i] >= 0.50 else 0.0
                actual_obj = gt_obj[i]

                if actual_obj == 1.0:
                    if pred_obj == 1.0:
                        tp += 1
                        # Compute Center Localization Error
                        px_err = math.sqrt((centers[i][0] - gt_center[i][0])**2 + (centers[i][1] - gt_center[i][1])**2) * 512.0
                        cle_pixels.append(px_err)

                        # Bounding box km scale: span of longitude * 111 * cos(lat)
                        b_geo = [float(targets["bbox_geo"][j][i]) for j in range(4)] # [min_lat, min_lon, max_lat, max_lon]
                        dlat_km = (b_geo[2] - b_geo[0]) * 111.0
                        dlon_km = (b_geo[3] - b_geo[1]) * 111.0 * math.cos(math.radians((b_geo[0] + b_geo[2]) / 2.0))
                        km_err = math.sqrt(((centers[i][0] - gt_center[i][0]) * dlon_km)**2 + ((centers[i][1] - gt_center[i][1]) * dlat_km)**2)
                        cle_km_list.append(km_err)
                    else:
                        fn += 1
                else:
                    calm_total += 1
                    if pred_obj == 1.0:
                        fp += 1
                        calm_fp += 1
                    else:
                        tn += 1

    acc = (tp + tn) / max(tp + tn + fp + fn, 1)
    prec = tp / max(tp + fp, 1) if (tp + fp) > 0 else 0.0
    rec = tp / max(tp + fn, 1) if (tp + fn) > 0 else 0.0
    f1 = 2 * prec * rec / max(prec + rec, 1e-6) if (prec + rec) > 0 else 0.0
    mean_cle_px = float(np.mean(cle_pixels)) if cle_pixels else 0.0
    mean_cle_km = float(np.mean(cle_km_list)) if cle_km_list else 0.0
    fpr_calm = calm_fp / max(calm_total, 1) if calm_total > 0 else 0.0

    return {
        "samples_evaluated": tp + tn + fp + fn,
        "true_positives": tp,
        "true_negatives": tn,
        "false_positives": fp,
        "false_negatives": fn,
        "accuracy": round(acc * 100.0, 2),
        "precision": round(prec * 100.0, 2),
        "recall": round(rec * 100.0, 2),
        "f1_score": round(f1 * 100.0, 2),
        "mean_cle_pixels_512": round(mean_cle_px, 2),
        "mean_cle_km": round(mean_cle_km, 2),
        "calm_samples": calm_total,
        "false_positive_rate_calm": round(fpr_calm * 100.0, 2)
    }

def train_center_detector(epochs: int = 35, lr: float = 8e-4, seed: int = 42) -> Dict[str, Any]:
    torch.manual_seed(seed)
    np.random.seed(seed)
    device = "cpu"

    print("\n==================================================")
    print("PHASE 3B: AUDITING & RETRAINING CYCLONE CENTER DETECTOR")
    print("==================================================")

    train_ds = Phase3BSatelliteDataset(SATELLITE_MANIFEST_PATH, split="train")
    val_ds = Phase3BSatelliteDataset(SATELLITE_MANIFEST_PATH, split="validation")
    test_ds = Phase3BSatelliteDataset(SATELLITE_MANIFEST_PATH, split="test")

    print(f"Dataset Provenance: {SATELLITE_MANIFEST_PATH}")
    print(f"  Training Samples:   {len(train_ds)} real satellite frames across {len(set(s['storm'] for s in train_ds.samples))} storms")
    for s in train_ds.samples:
        print(f"    - {s['storm']:14s} | {s['channel']} | obj={s['objectness']} | center=({s['cx']:.3f}, {s['cy']:.3f}) | {os.path.basename(s['file'])}")
    print(f"  Validation Samples: {len(val_ds)} real satellite frames ({list(set(s['storm'] for s in val_ds.samples))})")
    print(f"  Held-out Test:      {len(test_ds)} real satellite frames ({list(set(s['storm'] for s in test_ds.samples))})")

    train_loader = DataLoader(train_ds, batch_size=4, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=2, shuffle=False)
    test_loader = DataLoader(test_ds, batch_size=2, shuffle=False)

    model = CycloneCenterDetector(pretrained=True).to(device)

    # Freeze shallow features to preserve pre-trained transfer representation
    for param in model.features[:6].parameters():
        param.requires_grad = False

    optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=lr, weight_decay=1e-3)
    bce_loss = nn.BCELoss()
    l1_loss = nn.SmoothL1Loss()

    print(f"\n[Training] Retraining MobileNetV3 on real benchmark dataset for {epochs} epochs...")
    best_val_loss = float("inf")
    history = []

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        total_bce = 0.0
        total_box = 0.0

        for images, targets in train_loader:
            images = images.to(device)
            optimizer.zero_grad()
            out = model(images)

            t_obj = targets["objectness"].to(device)
            t_center = targets["center"].to(device)

            loss_cls = bce_loss(out["cyclone_probability"], t_obj)
            loss_center = (l1_loss(out["center"], t_center) * t_obj).sum() / max(t_obj.sum().item(), 1.0)

            loss = loss_cls + 4.0 * loss_center
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            total_bce += loss_cls.item()
            total_box += loss_center.item()

        avg_loss = total_loss / len(train_loader)
        if epoch % 5 == 0 or epoch == 1:
            print(f"  Epoch {epoch:02d}/{epochs} | Loss: {avg_loss:.4f} (BCE: {total_bce/len(train_loader):.4f}, Center L1: {total_box/len(train_loader):.4f})")

    # Evaluate on held-out splits
    print("\n[Evaluation] Evaluating retrained detector on held-out validation and test sets...")
    val_metrics = evaluate_detector(model, val_loader, device=device)
    test_metrics = evaluate_detector(model, test_loader, device=device)

    print(f"  Validation Metrics (MOCHA, OCKHI):")
    print(f"    Objectness Accuracy: {val_metrics['accuracy']}% | F1: {val_metrics['f1_score']}%")
    print(f"    Center Localization Error: {val_metrics['mean_cle_pixels_512']} px | {val_metrics['mean_cle_km']} km")
    print(f"  Held-out Test Metrics (DANA, BIPARJOY):")
    print(f"    Objectness Accuracy: {test_metrics['accuracy']}% | F1: {test_metrics['f1_score']}%")
    print(f"    Center Localization Error: {test_metrics['mean_cle_pixels_512']} px | {test_metrics['mean_cle_km']} km")
    print(f"    Calm False-Positive Rate:  {test_metrics['false_positive_rate_calm']}%")

    # Save Phase 3B checkpoint
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    torch.save(model.state_dict(), CHECKPOINT_PATH)
    sha256 = hashlib.sha256(open(CHECKPOINT_PATH, "rb").read()).hexdigest()

    meta = {
        "model_name": "MobileNetV3-Small-CenterFix",
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
    train_center_detector()
