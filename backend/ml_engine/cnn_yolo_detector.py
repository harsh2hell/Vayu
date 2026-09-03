import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Tuple, Any

class SpatialPyramidPooling(nn.Module):
    """Spatial Pyramid Pooling (SPP) layer extracting multi-scale convective spatial features."""
    def __init__(self, pool_sizes=(5, 9, 13)):
        super().__init__()
        self.pools = nn.ModuleList([nn.MaxPool2d(kernel_size=k, stride=1, padding=k // 2) for k in pool_sizes])

    def forward(self, x):
        features = [x] + [pool(x) for pool in self.pools]
        return torch.cat(features, dim=1)

class CycloneVisionYOLO(nn.Module):
    """
    CycloneVision-YOLO CNN Architecture for Tropical Cyclone Eye Localization & Bounding Regression.
    Processes multi-spectral satellite imagery and outputs:
      1. Cyclone Presence Classification Probability (0 to 1)
      2. Normalized Bounding Box [ymin, xmin, ymax, xmax] & Sub-kilometer Eye Fix
      3. Radiometric Intensity Estimates (Vmax knots, Central MSLP hPa)
    """
    def __init__(self, in_channels: int = 3):
        super().__init__()
        
        # Conv Stage 1
        self.stem = nn.Sequential(
            nn.Conv2d(in_channels, 32, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(32),
            nn.SiLU(),
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(64),
            nn.SiLU()
        )
        
        # Conv Stage 2 - Deep ResNet-style blocks
        self.stage2 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(128),
            nn.SiLU(),
            nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(128),
            nn.SiLU()
        )
        
        # Conv Stage 3
        self.stage3 = nn.Sequential(
            nn.Conv2d(128, 256, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(256),
            nn.SiLU(),
            nn.Conv2d(256, 256, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(256),
            nn.SiLU()
        )
        
        # Spatial Pyramid Pooling Layer
        self.spp = SpatialPyramidPooling(pool_sizes=(5, 9, 13)) # 256 * 4 = 1024 channels
        
        # Feature Bottleneck
        self.bottleneck = nn.Sequential(
            nn.Conv2d(256 * 4, 256, kernel_size=1),
            nn.BatchNorm2d(256),
            nn.SiLU(),
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten()
        )
        
        # Head 1: Cyclone Presence Classifier (Positive / Negative)
        self.classifier_head = nn.Sequential(
            nn.Linear(256, 64),
            nn.SiLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        
        # Head 2: Bounding Box & Eye Offset Regressor [ymin, xmin, ymax, xmax, eye_offset_y, eye_offset_x]
        self.bbox_head = nn.Sequential(
            nn.Linear(256, 128),
            nn.SiLU(),
            nn.Linear(128, 6),
            nn.Sigmoid()
        )
        
        # Head 3: Radiometric Intensity Regressor [Vmax (knots), MSLP (hPa)]
        self.intensity_head = nn.Sequential(
            nn.Linear(256, 64),
            nn.SiLU(),
            nn.Linear(64, 2)
        )

    def forward(self, x: torch.Tensor) -> Dict[str, torch.Tensor]:
        x = self.stem(x)
        x = self.stage2(x)
        x = self.stage3(x)
        x = self.spp(x)
        feats = self.bottleneck(x)
        
        is_cyclone_prob = self.classifier_head(feats)
        bbox_coords = self.bbox_head(feats)
        intensity_raw = self.intensity_head(feats)
        
        # Scale intensity to physical units: Vmax ~ [20, 160] kts, MSLP ~ [890, 1010] hPa
        vmax = 20.0 + torch.relu(intensity_raw[:, 0]) * 1.5
        mslp = 1012.0 - torch.relu(intensity_raw[:, 1]) * 1.2
        
        return {
            "cyclone_probability": is_cyclone_prob,
            "bbox": bbox_coords[:, :4],
            "eye_offset": bbox_coords[:, 4:],
            "vmax_knots": vmax,
            "mslp_hpa": mslp,
            "feature_embedding": feats
        }
