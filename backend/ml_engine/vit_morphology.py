import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Tuple, Any

class PatchEmbedding(nn.Module):
    """Splits satellite image into patches and projects into transformer embedding dimension."""
    def __init__(self, img_size: int = 224, patch_size: int = 16, in_channels: int = 3, embed_dim: int = 192):
        super().__init__()
        self.img_size = img_size
        self.patch_size = patch_size
        self.num_patches = (img_size // patch_size) ** 2
        
        self.proj = nn.Conv2d(in_channels, embed_dim, kernel_size=patch_size, stride=patch_size)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # [B, C, H, W] -> [B, embed_dim, grid, grid] -> [B, embed_dim, num_patches] -> [B, num_patches, embed_dim]
        x = self.proj(x).flatten(2).transpose(1, 2)
        return x

class MultiHeadSelfAttention(nn.Module):
    """Multi-Head Self-Attention (MHSA) layer for capturing global spiral cloud correlations."""
    def __init__(self, embed_dim: int = 192, num_heads: int = 6, dropout: float = 0.1):
        super().__init__()
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        self.scale = self.head_dim ** -0.5
        
        self.qkv = nn.Linear(embed_dim, embed_dim * 3)
        self.proj = nn.Linear(embed_dim, embed_dim)
        self.dropout = nn.Dropout(dropout)
        self.last_attn_weights = None

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, N, C = x.shape
        qkv = self.qkv(x).reshape(B, N, 3, self.num_heads, self.head_dim).permute(2, 0, 3, 1, 4)
        q, k, v = qkv[0], qkv[1], qkv[2]
        
        attn = (q @ k.transpose(-2, -1)) * self.scale
        attn = attn.softmax(dim=-1)
        self.last_attn_weights = attn.detach() # Saved for Grad-CAM / Attention map visualization
        attn = self.dropout(attn)
        
        out = (attn @ v).transpose(1, 2).reshape(B, N, C)
        out = self.proj(out)
        return out

class TransformerBlock(nn.Module):
    """Standard Vision Transformer Encoder Block with Pre-LayerNorm."""
    def __init__(self, embed_dim: int = 192, num_heads: int = 6, mlp_ratio: float = 4.0, dropout: float = 0.1):
        super().__init__()
        self.norm1 = nn.LayerNorm(embed_dim)
        self.attn = MultiHeadSelfAttention(embed_dim, num_heads, dropout)
        self.norm2 = nn.LayerNorm(embed_dim)
        
        mlp_hidden_dim = int(embed_dim * mlp_ratio)
        self.mlp = nn.Sequential(
            nn.Linear(embed_dim, mlp_hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(mlp_hidden_dim, embed_dim),
            nn.Dropout(dropout)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = x + self.attn(self.norm1(x))
        x = x + self.mlp(self.norm2(x))
        return x

class VisionTransformerMorphology(nn.Module):
    """
    PatternNet-ViT Architecture for Cyclone Morphological Pattern Recognition.
    Classifies 5 meteorological Dvorak cloud patterns:
      0: Curved Band Pattern
      1: Shear Pattern
      2: Central Dense Overcast (CDO)
      3: Eye Pattern (Warm Core)
      4: Embedded Center Pattern
    """
    DVORAK_CLASSES = [
        "Curved Band Pattern",
        "Shear Pattern",
        "Central Dense Overcast (CDO)",
        "Eye Pattern (Warm Core)",
        "Embedded Center Pattern"
    ]

    def __init__(self, img_size: int = 224, patch_size: int = 16, in_channels: int = 3,
                 num_classes: int = 5, embed_dim: int = 192, depth: int = 4, num_heads: int = 6):
        super().__init__()
        self.patch_embed = PatchEmbedding(img_size, patch_size, in_channels, embed_dim)
        num_patches = self.patch_embed.num_patches
        
        self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))
        self.pos_embed = nn.Parameter(torch.zeros(1, num_patches + 1, embed_dim))
        self.pos_drop = nn.Dropout(p=0.1)
        
        self.blocks = nn.ModuleList([
            TransformerBlock(embed_dim, num_heads) for _ in range(depth)
        ])
        
        self.norm = nn.LayerNorm(embed_dim)
        self.head = nn.Linear(embed_dim, num_classes)
        
        nn.init.trunc_normal_(self.pos_embed, std=0.02)
        nn.init.trunc_normal_(self.cls_token, std=0.02)

    def forward(self, x: torch.Tensor) -> Dict[str, Any]:
        B = x.shape[0]
        x = self.patch_embed(x)
        
        cls_tokens = self.cls_token.expand(B, -1, -1)
        x = torch.cat((cls_tokens, x), dim=1)
        x = self.pos_drop(x + self.pos_embed)
        
        for block in self.blocks:
            x = block(x)
            
        x = self.norm(x)
        cls_feat = x[:, 0]
        logits = self.head(cls_feat)
        probs = F.softmax(logits, dim=-1)
        
        pred_idx = torch.argmax(probs, dim=-1).item()
        
        return {
            "logits": logits,
            "probabilities": probs,
            "predicted_class_index": pred_idx,
            "predicted_class_name": self.DVORAK_CLASSES[pred_idx],
            "feature_embedding": cls_feat
        }
