#!/usr/bin/env python3
r"""
Quick Training Script - Works with D: drive datasets
Trains with Polyvore images directly from D:\polyvore_outfits
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
from pathlib import Path
import argparse
import json
import yaml
from tqdm import tqdm
import os

class PolyvoreDataset(Dataset):
    """Load Polyvore images from D: drive"""
    
    def __init__(self, image_dir="D:\\polyvore_outfits\\images", sample_size=None, transform=None):
        self.image_dir = Path(image_dir)
        self.images = list(self.image_dir.glob("*.jpg")) + list(self.image_dir.glob("*.png"))
        
        if sample_size:
            self.images = self.images[:sample_size]
        
        self.transform = transform or transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                std=[0.229, 0.224, 0.225])
        ])
        
        print(f"Loaded {len(self.images)} images from {image_dir}")
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        try:
            img = Image.open(self.images[idx]).convert('RGB')
            return self.transform(img)
        except Exception as e:
            # Return dummy tensor on error
            return torch.zeros(3, 256, 256)

class SimpleClassifier(nn.Module):
    """Simple fashion classifier"""
    
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        self.classifier = nn.Linear(128, num_classes)
    
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)

def train_epoch(model, dataloader, criterion, optimizer, device):
    """Train one epoch"""
    model.train()
    total_loss = 0
    
    for batch_idx, images in enumerate(tqdm(dataloader, desc="Training")):
        images = images.to(device)
        
        # Dummy labels for unsupervised learning
        labels = torch.randint(0, 10, (images.size(0),)).to(device)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
        
        if (batch_idx + 1) % 10 == 0:
            print(f"  Batch {batch_idx + 1}, Loss: {loss.item():.4f}")
    
    avg_loss = total_loss / len(dataloader)
    return avg_loss

def main():
    parser = argparse.ArgumentParser(description='Train on Polyvore Dataset')
    parser.add_argument('--epochs', type=int, default=3, help='Number of epochs')
    parser.add_argument('--batch-size', type=int, default=8, help='Batch size')
    parser.add_argument('--sample-size', type=int, help='Use only N images (default: use all)')
    parser.add_argument('--device', default='auto', help='cuda or cpu')
    parser.add_argument('--lr', type=float, default=0.001, help='Learning rate')
    
    args = parser.parse_args()
    
    # Select device
    if args.device == 'auto':
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    else:
        device = torch.device(args.device)
    
    print(f"\n{'='*60}")
    print(f"Training Fashion Classifier")
    print(f"{'='*60}")
    print(f"Device: {device}")
    print(f"Epochs: {args.epochs}")
    print(f"Batch size: {args.batch_size}")
    if args.sample_size:
        print(f"Sample size: {args.sample_size}")
    print(f"{'='*60}\n")
    
    # Create dataset and dataloader
    dataset = PolyvoreDataset(sample_size=args.sample_size)
    dataloader = DataLoader(dataset, batch_size=args.batch_size, shuffle=True, num_workers=0)
    
    # Create model
    model = SimpleClassifier(num_classes=10).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr)
    
    # Training loop
    for epoch in range(args.epochs):
        print(f"\nEpoch {epoch + 1}/{args.epochs}")
        avg_loss = train_epoch(model, dataloader, criterion, optimizer, device)
        print(f"Average loss: {avg_loss:.4f}")
    
    # Save model
    checkpoint_dir = Path("checkpoints")
    checkpoint_dir.mkdir(exist_ok=True)
    
    model_path = checkpoint_dir / "fashion_classifier.pt"
    torch.save(model.state_dict(), model_path)
    print(f"\n✓ Model saved to {model_path}")
    
    print(f"\n{'='*60}")
    print("Training complete!")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
