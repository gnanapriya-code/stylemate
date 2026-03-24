#!/usr/bin/env python3
r"""
Simple Fashion Training - No PyTorch Required
Uses scikit-learn for basic image feature extraction and training
"""

import os
from pathlib import Path
import argparse
import json
import numpy as np
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pickle

class SimpleTrainer:
    """Train simple classifier on fashion images"""
    
    def __init__(self, sample_size=None, verbose=True):
        self.sample_size = sample_size
        self.verbose = verbose
        self.model = None
        self.scaler = None
        
    def load_images(self, image_dir="D:\\polyvore_outfits\\images"):
        """Load images and extract basic features"""
        image_dir = Path(image_dir)
        images = list(image_dir.glob("*.jpg")) + list(image_dir.glob("*.png"))
        
        if self.sample_size:
            images = images[:self.sample_size]
        
        if self.verbose:
            print(f"Loading {len(images)} images...")
        
        X = []
        for idx, img_path in enumerate(images):
            try:
                img = Image.open(img_path).convert('RGB')
                # Resize to 64x64 for faster processing
                img = img.resize((64, 64))
                # Convert to numpy and flatten
                img_array = np.array(img).flatten() / 255.0
                X.append(img_array)
                
                if self.verbose and (idx + 1) % max(1, len(images) // 10) == 0:
                    print(f"  Loaded {idx + 1}/{len(images)} images")
            except Exception as e:
                print(f"  ⚠ Skipped {img_path.name}: {e}")
        
        return np.array(X), images
    
    def extract_color_features(self, image_dir="D:\\polyvore_outfits\\images"):
        """Extract color histogram features"""
        image_dir = Path(image_dir)
        images = list(image_dir.glob("*.jpg")) + list(image_dir.glob("*.png"))
        
        if self.sample_size:
            images = images[:self.sample_size]
        
        if self.verbose:
            print(f"Extracting features from {len(images)} images...")
        
        features = []
        for idx, img_path in enumerate(images):
            try:
                img = Image.open(img_path).convert('RGB')
                img = img.resize((32, 32))
                img_array = np.array(img)
                
                # Extract color histogram (32 bins per channel)
                hist_r = np.histogram(img_array[:,:,0], bins=32)[0]
                hist_g = np.histogram(img_array[:,:,1], bins=32)[0]
                hist_b = np.histogram(img_array[:,:,2], bins=32)[0]
                
                feature = np.concatenate([hist_r, hist_g, hist_b])
                features.append(feature)
                
                if self.verbose and (idx + 1) % max(1, len(images) // 10) == 0:
                    print(f"  Processed {idx + 1}/{len(images)} images")
            except Exception as e:
                print(f"  ⚠ Skipped {img_path.name}: {e}")
        
        return np.array(features)
    
    def train(self, X, y=None, epochs=1):
        """Train classifier"""
        if self.verbose:
            print(f"\nTraining RandomForest classifier...")
            print(f"Feature shape: {X.shape}")
        
        # Generate dummy labels (categories)
        if y is None:
            n_samples = X.shape[0]
            y = np.random.randint(0, 10, n_samples)
        
        # Normalize features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train
        self.model = RandomForestClassifier(
            n_estimators=50,
            max_depth=10,
            n_jobs=-1,
            verbose=1 if self.verbose else 0
        )
        self.model.fit(X_scaled, y)
        
        if self.verbose:
            print(f"✓ Training complete")
            print(f"  Model accuracy (on training): {self.model.score(X_scaled, y):.4f}")
        
        return self.model
    
    def save_model(self, output_dir="checkpoints"):
        """Save trained model"""
        Path(output_dir).mkdir(exist_ok=True)
        
        model_path = Path(output_dir) / "fashion_classifier.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
        
        scaler_path = Path(output_dir) / "scaler.pkl"
        with open(scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        
        if self.verbose:
            print(f"\n✓ Model saved to {model_path}")
            print(f"✓ Scaler saved to {scaler_path}")

def main():
    parser = argparse.ArgumentParser(description='Train Fashion Classifier (No PyTorch)')
    parser.add_argument('--epochs', type=int, default=1, help='Number of epochs')
    parser.add_argument('--sample-size', type=int, help='Use only N images')
    parser.add_argument('--feature-mode', choices=['raw', 'color'], default='color',
                       help='Feature extraction mode')
    
    args = parser.parse_args()
    
    print("\n" + "="*60)
    print("Training Fashion Classifier (Scikit-Learn)")
    print("="*60)
    print(f"Sample size: {args.sample_size or 'all'}")
    print(f"Feature mode: {args.feature_mode}")
    print("="*60 + "\n")
    
    trainer = SimpleTrainer(sample_size=args.sample_size, verbose=True)
    
    # Extract features
    if args.feature_mode == 'raw':
        X, images = trainer.load_images()
    else:
        X = trainer.extract_color_features()
    
    if len(X) == 0:
        print("✗ No images loaded. Check D:\\polyvore_outfits\\images")
        return
    
    # Train
    for epoch in range(args.epochs):
        print(f"\nEpoch {epoch + 1}/{args.epochs}")
        trainer.train(X)
    
    # Save
    trainer.save_model()
    
    print("\n" + "="*60)
    print("✓ Training complete!")
    print("="*60)

if __name__ == "__main__":
    main()
