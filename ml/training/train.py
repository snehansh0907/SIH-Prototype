"""
Krishi Sarthak - Reproducible Training Pipeline
Architecture: MobileNetV2 Transfer Learning on Agricultural Plant Pathology Dataset
Dataset: PlantVillage Dataset (38 Classes)
Export: PyTorch (.pth) and ONNX (.onnx) format
"""

import os
import time
import json
import argparse
from typing import Tuple, Dict, Any

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader, random_split
    from torchvision import datasets, transforms, models
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

# Hyperparameters & Constants
NUM_CLASSES = 38
IMAGE_SIZE = 224
BATCH_SIZE = 32
DEFAULT_EPOCHS = 15
LEARNING_RATE = 1e-4
WEIGHT_DECAY = 1e-4

def get_data_transforms() -> Tuple[Any, Any]:
    """Builds training (augmented) and validation image transformation pipelines."""
    train_transforms = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomResizedCrop(IMAGE_SIZE, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])

    val_transforms = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])

    return train_transforms, val_transforms

def build_model(num_classes: int = NUM_CLASSES) -> nn.Module:
    """Instantiates MobileNetV2 pretrained on ImageNet and replaces classification head."""
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    
    # Freeze initial feature extraction layers for fine-tuning
    for param in model.features[:10].parameters():
        param.requires_grad = False
        
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 512),
        nn.ReLU(),
        nn.Dropout(p=0.2),
        nn.Linear(512, num_classes)
    )
    return model

def train_epoch(model, loader, criterion, optimizer, device):
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
        
    return running_loss / total, correct / total

def validate_epoch(model, loader, criterion, device):
    model.eval()
    running_loss, correct, total = 0.0, 0, 0
    
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)
            
    return running_loss / total, correct / total

def export_to_onnx(model, output_path: str, device: str = 'cpu'):
    """Exports trained PyTorch model to standard ONNX format."""
    model.eval()
    dummy_input = torch.randn(1, 3, IMAGE_SIZE, IMAGE_SIZE, device=device)
    
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['pixel_values'],
        output_names=['logits'],
        dynamic_axes={'pixel_values': {0: 'batch_size'}, 'logits': {0: 'batch_size'}}
    )
    print(f"[Export] Saved ONNX model successfully -> {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Krishi Sarthak Crop Disease Training Pipeline")
    parser.add_argument("--data_dir", type=str, default="./data/PlantVillage", help="Path to PlantVillage color image folder")
    parser.add_argument("--output_dir", type=str, default="./models", help="Directory to save model artifacts")
    parser.add_argument("--epochs", type=int, default=DEFAULT_EPOCHS)
    parser.add_argument("--batch_size", type=int, default=BATCH_SIZE)
    parser.add_argument("--lr", type=float, default=LEARNING_RATE)
    args = parser.parse_args()

    if not TORCH_AVAILABLE:
        print("[Error] PyTorch and torchvision are required for model training. Install via: pip install torch torchvision")
        return

    os.makedirs(args.output_dir, exist_ok=True)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"[Training] Using compute device: {device}")

    if not os.path.exists(args.data_dir):
        print(f"[Notice] Dataset directory '{args.data_dir}' not found.")
        print("To download the open PlantVillage dataset:")
        print("  1. Clone: git clone https://github.com/spMohanty/PlantVillage-Dataset.git")
        print("  2. Point --data_dir to 'PlantVillage-Dataset/raw/color'")
        return

    train_tf, val_tf = get_data_transforms()
    full_dataset = datasets.ImageFolder(args.data_dir, transform=train_tf)
    
    # 80/10/10 Train/Validation/Test split
    total_size = len(full_dataset)
    train_size = int(0.8 * total_size)
    val_size = int(0.1 * total_size)
    test_size = total_size - train_size - val_size
    
    train_set, val_set, test_set = random_split(full_dataset, [train_size, val_size, test_size])
    val_set.dataset.transform = val_tf
    test_set.dataset.transform = val_tf
    
    train_loader = DataLoader(train_set, batch_size=args.batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_set, batch_size=args.batch_size, shuffle=False, num_workers=2)
    
    model = build_model(num_classes=len(full_dataset.classes)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=WEIGHT_DECAY)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)
    
    best_acc = 0.0
    for epoch in range(1, args.epochs + 1):
        t0 = time.time()
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = validate_epoch(model, val_loader, criterion, device)
        scheduler.step()
        
        elapsed = time.time() - t0
        print(f"Epoch {epoch:02d}/{args.epochs:02d} [{elapsed:.1f}s] - Train Loss: {train_loss:.4f} Acc: {train_acc*100:.2f}% | Val Loss: {val_loss:.4f} Acc: {val_acc*100:.2f}%")
        
        if val_acc > best_acc:
            best_acc = val_acc
            pth_path = os.path.join(args.output_dir, "crop_disease_mobilenetv2_best.pth")
            torch.save(model.state_dict(), pth_path)
            
    # Export best model to ONNX
    onnx_path = os.path.join(args.output_dir, "crop_disease_mobilenetv2.onnx")
    export_to_onnx(model.to('cpu'), onnx_path, device='cpu')

if __name__ == '__main__':
    main()
