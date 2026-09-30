"""
Pashu Sarthak - Stage 1 Diagnostic Relevance Gate Training & ONNX Export (SIH26128)
Trains a binary MobileNetV2 classifier to distinguish genuine diagnostic images
from unrelated non-animal/noise images.
"""

import os
import sys
import json
import urllib.request
import numpy as np
from PIL import Image

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms

IMAGE_SIZE = 224
BATCH_SIZE = 16
EPOCHS = 10
LEARNING_RATE = 2e-4

# Build training dataset directory
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'relevance_dataset')
POS_DIR = os.path.join(DATA_DIR, 'crop_leaf')
NEG_DIR = os.path.join(DATA_DIR, 'non_crop')

# Diverse public image URLs for training the relevance gate
POSITIVE_URLS = [
    # PlantVillage crops / leaves (Tomato, Soybean, Corn, Potato, Pepper, Grape, Apple)
    "https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___healthy/0001460a-49a7-4775-aa36-f69b43c70735___GH_HL%20Leaf%20259.1.JPG",
    "https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Late_blight/0003faa8-4b27-4c6e-94b1-9f982646d0ec___RS_Late.B%204946.JPG",
    "https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Leaf_Mold/0022d6a7-d811-45b6-938a-e7ec30de69f8___Crnl_L.Mold%209101.JPG",
    "https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Soybean___healthy/0038890c-ad33-4f9e-9907-2856f6630f98___RS_HL%205072.JPG",
    "https://images.unsplash.com/photo-1592417817098-8f3d6eb22521?w=400&q=80", # Tomato plant
    "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400&q=80", # Green leaf macro
    "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80", # Plant foliage
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80", # Forest leaf
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&q=80", # Fresh leaf
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80", # Plant leaves
    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80", # Agriculture crop
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&q=80", # Field plant
]

NEGATIVE_URLS = [
    # People, animals, vehicles, buildings, food, electronics, text, indoor rooms
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80", # Human face
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", # Person
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80", # Car
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80", # Dog
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80", # Building
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80", # Pizza / food
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80", # Smartphone
    "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80", # Paper / text document
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80", # Living room / chair
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", # Laptop screen
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80", # Circuit board / chip
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80", # Motorcycle
]

def prepare_dataset():
    os.makedirs(POS_DIR, exist_ok=True)
    os.makedirs(NEG_DIR, exist_ok=True)

    # Copy local test images to positives
    test_img_dir = os.path.join(os.path.dirname(__file__), '..', 'test_images')
    if os.path.exists(test_img_dir):
        for f in os.listdir(test_img_dir):
            if f.startswith('Tomato') or f.startswith('Soybean'):
                src = os.path.join(test_img_dir, f)
                dst = os.path.join(POS_DIR, f)
                if not os.path.exists(dst):
                    img = Image.open(src)
                    img.save(dst)

    # Download positives
    for i, url in enumerate(POSITIVE_URLS):
        dst = os.path.join(POS_DIR, f"pos_{i:03d}.jpg")
        if not os.path.exists(dst):
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=5) as resp, open(dst, 'wb') as out:
                    out.write(resp.read())
            except Exception as e:
                pass

    # Download negatives
    for i, url in enumerate(NEGATIVE_URLS):
        dst = os.path.join(NEG_DIR, f"neg_{i:03d}.jpg")
        if not os.path.exists(dst):
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=5) as resp, open(dst, 'wb') as out:
                    out.write(resp.read())
            except Exception as e:
                pass

    # Copy negative test images if present
    neg_test_dir = os.path.join(test_img_dir, 'negatives')
    if os.path.exists(neg_test_dir):
        for f in os.listdir(neg_test_dir):
            src = os.path.join(neg_test_dir, f)
            dst = os.path.join(NEG_DIR, f)
            if not os.path.exists(dst):
                img = Image.open(src)
                img.save(dst)

    pos_count = len([f for f in os.listdir(POS_DIR) if f.lower().endswith(('.jpg', '.png', '.jpeg'))])
    neg_count = len([f for f in os.listdir(NEG_DIR) if f.lower().endswith(('.jpg', '.png', '.jpeg'))])
    print(f"[Dataset] Ready: {pos_count} Positive Crop Images, {neg_count} Negative Non-Crop Images")

class RelevanceDataset(Dataset):
    def __init__(self, transform=None):
        self.samples = []
        self.transform = transform

        for f in os.listdir(NEG_DIR):
            if f.lower().endswith(('.jpg', '.png', '.jpeg')):
                self.samples.append((os.path.join(NEG_DIR, f), 0)) # 0 = Non-Crop

        for f in os.listdir(POS_DIR):
            if f.lower().endswith(('.jpg', '.png', '.jpeg')):
                self.samples.append((os.path.join(POS_DIR, f), 1)) # 1 = Crop / Leaf

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path).convert('RGB')
        if self.transform:
            img = self.transform(img)
        return img, label

def build_relevance_model():
    """Builds MobileNetV2 with binary classification head (0: Non-Crop, 1: Crop)."""
    weights = models.MobileNet_V2_Weights.DEFAULT
    model = models.mobilenet_v2(weights=weights)
    
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(in_features, 128),
        nn.ReLU(),
        nn.Linear(128, 2)
    )
    return model

def train_and_export():
    prepare_dataset()
    
    train_transforms = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomResizedCrop(IMAGE_SIZE, scale=(0.7, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(20),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])

    dataset = RelevanceDataset(transform=train_transforms)
    loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = build_relevance_model().to(device)

    criterion = nn.CrossEntropyLoss(weight=torch.tensor([1.2, 1.0], device=device))
    optimizer = optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-3)

    print("[Training] Fine-tuning Stage 1 Crop Relevance Gate...")
    for epoch in range(1, EPOCHS + 1):
        model.train()
        running_loss, correct, total = 0.0, 0, 0
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

        acc = correct / total if total > 0 else 0
        print(f"Epoch {epoch:02d}/{EPOCHS:02d} - Loss: {running_loss/total:.4f} - Accuracy: {acc*100:.1f}%")

    # Export to ONNX
    model.eval()
    dummy_input = torch.randn(1, 3, IMAGE_SIZE, IMAGE_SIZE, device='cpu')
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(out_dir, exist_ok=True)
    onnx_path = os.path.join(out_dir, 'crop_relevance_mobilenetv2.onnx')

    torch.onnx.export(
        model.to('cpu'),
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['pixel_values'],
        output_names=['logits'],
        dynamic_axes={'pixel_values': {0: 'batch_size'}, 'logits': {0: 'batch_size'}}
    )
    print(f"[Export] Stage 1 Relevance Gate exported successfully -> {onnx_path} ({os.path.getsize(onnx_path)/1e6:.2f} MB)")

if __name__ == '__main__':
    train_and_export()
