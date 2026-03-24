import os
import torch
import torchvision.transforms as transforms
from torch.utils.data import Dataset, DataLoader
import json
from PIL import Image
import numpy as np
from pathlib import Path

class FashionDataset(Dataset):
    """Combined DeepFashion and Polyvore dataset loader"""
    
    def __init__(self, data_dir, dataset_type="all", split="train", transform=None, image_size=256):
        """
        Args:
            data_dir: Path to dataset directory
            dataset_type: 'deepfashion', 'polyvore', or 'all'
            split: 'train', 'val', or 'test'
            transform: Image transformations
            image_size: Target image size
        """
        self.data_dir = Path(data_dir)
        self.split = split
        self.transform = transform
        self.image_size = image_size
        self.images = []
        self.labels = []
        
        # Load DeepFashion
        if dataset_type in ["deepfashion", "all"]:
            self._load_deepfashion()
        
        # Load Polyvore
        if dataset_type in ["polyvore", "all"]:
            self._load_polyvore()
        
        print(f"Loaded {len(self.images)} images for {split} split")
    
    def _load_deepfashion(self):
        """Load DeepFashion dataset structure"""
        deepfashion_path = self.data_dir / "DeepFashion"
        
        if not deepfashion_path.exists():
            print(f"Warning: DeepFashion path not found: {deepfashion_path}")
            return
        
        # DeepFashion expects images in images/ folder
        images_dir = deepfashion_path / "images"
        if not images_dir.exists():
            print(f"Warning: DeepFashion images folder not found")
            return
        
        # Get all image files
        image_files = list(images_dir.glob("**/*.jpg")) + list(images_dir.glob("**/*.png"))
        
        # Split into train/val/test
        np.random.seed(42)
        indices = np.random.permutation(len(image_files))
        train_split = int(0.8 * len(image_files))
        val_split = int(0.9 * len(image_files))
        
        if self.split == "train":
            split_indices = indices[:train_split]
        elif self.split == "val":
            split_indices = indices[train_split:val_split]
        else:
            split_indices = indices[val_split:]
        
        for idx in split_indices:
            img_path = image_files[idx]
            # Extract category from folder structure (if available)
            category = img_path.parent.name
            self.images.append(str(img_path))
            self.labels.append(category)
    
    def _load_polyvore(self):
        """Load Polyvore dataset structure"""
        polyvore_path = self.data_dir / "Polyvore"
        
        if not polyvore_path.exists():
            print(f"Warning: Polyvore path not found: {polyvore_path}")
            return
        
        # Polyvore structure: images/ and json metadata
        images_dir = polyvore_path / "images"
        if not images_dir.exists():
            print(f"Warning: Polyvore images folder not found")
            return
        
        # Get outfit jsons
        json_files = list(polyvore_path.glob("*.json"))
        
        outfits = []
        for json_file in json_files:
            try:
                with open(json_file, 'r') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        outfits.extend(data)
                    else:
                        outfits.append(data)
            except Exception as e:
                print(f"Error loading {json_file}: {e}")
        
        # Extract item images from outfits
        np.random.seed(42)
        outfit_indices = np.random.permutation(len(outfits))
        train_split = int(0.8 * len(outfits))
        val_split = int(0.9 * len(outfits))
        
        if self.split == "train":
            split_indices = outfit_indices[:train_split]
        elif self.split == "val":
            split_indices = outfit_indices[train_split:val_split]
        else:
            split_indices = outfit_indices[val_split:]
        
        for idx in split_indices:
            outfit = outfits[idx]
            items = outfit.get('items', [])
            for item in items:
                img_id = item.get('image')
                if img_id:
                    img_path = images_dir / f"{img_id}.jpg"
                    if img_path.exists():
                        category = item.get('category', 'unknown')
                        self.images.append(str(img_path))
                        self.labels.append(category)
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        img_path = self.images[idx]
        label = self.labels[idx]
        
        try:
            image = Image.open(img_path).convert('RGB')
            
            if self.transform:
                image = self.transform(image)
            else:
                # Default transform
                image = transforms.ToTensor()(image)
            
            return {
                'image': image,
                'label': label,
                'path': img_path
            }
        except Exception as e:
            print(f"Error loading image {img_path}: {e}")
            # Return a dummy image on error
            dummy_image = torch.zeros(3, self.image_size, self.image_size)
            return {
                'image': dummy_image,
                'label': 'error',
                'path': img_path
            }


def get_transforms(image_size=256, augment=True):
    """Get image transformations for training and validation"""
    
    if augment:
        train_transform = transforms.Compose([
            transforms.Resize((image_size, image_size)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    else:
        train_transform = transforms.Compose([
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    val_transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    return train_transform, val_transform


def get_dataloader(data_dir, batch_size=32, num_workers=4, image_size=256, dataset_type="all"):
    """Create data loaders for training and validation"""
    
    train_transform, val_transform = get_transforms(image_size, augment=True)
    
    # Training dataset
    train_dataset = FashionDataset(
        data_dir,
        dataset_type=dataset_type,
        split="train",
        transform=train_transform,
        image_size=image_size
    )
    
    # Validation dataset
    val_dataset = FashionDataset(
        data_dir,
        dataset_type=dataset_type,
        split="val",
        transform=val_transform,
        image_size=image_size
    )
    
    # Test dataset
    test_dataset = FashionDataset(
        data_dir,
        dataset_type=dataset_type,
        split="test",
        transform=val_transform,
        image_size=image_size
    )
    
    # Data loaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True
    )
    
    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True
    )
    
    return train_loader, val_loader, test_loader
