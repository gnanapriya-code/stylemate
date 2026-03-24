#!/usr/bin/env python3
"""
Dataset Linker - Creates symlinks to D: drive datasets to avoid disk space issues
"""

import os
import sys
from pathlib import Path

def create_symlink_polyvore():
    """Create symlink to Polyvore images from D: drive"""
    source_images = Path("D:\\polyvore_outfits\\images")
    dest_folder = Path(__file__).parent.parent / "dataset" / "Polyvore"
    dest_images = dest_folder / "images"
    
    # Create Polyvore folder if needed
    dest_folder.mkdir(parents=True, exist_ok=True)
    
    if source_images.exists():
        if dest_images.exists():
            if dest_images.is_symlink():
                print(f"✓ Symlink already exists: {dest_images}")
                return True
            else:
                print(f"⚠ Path exists but is not a symlink. Removing...")
                import shutil
                shutil.rmtree(dest_images)
        
        try:
            # Try to create symlink
            os.symlink(source_images, dest_images, target_is_directory=True)
            print(f"✓ Created symlink:")
            print(f"  {dest_images} -> {source_images}")
            return True
        except Exception as e:
            print(f"✗ Failed to create symlink: {e}")
            print("Note: You may need to run as Administrator for symlinks on Windows")
            return False
    else:
        print(f"✗ Source not found: {source_images}")
        return False

def create_symlink_deepfashion():
    """Create symlink to DeepSeek dataset from D: drive"""
    source_zip = Path("D:\\Deepseek.zip")
    dest_folder = Path(__file__).parent.parent / "dataset"
    
    if source_zip.exists():
        print(f"✓ Found DeepSeek dataset: {source_zip}")
        print("Note: This is a large zip file. Consider extracting first:")
        print(f"  powershell -Command \"Expand-Archive -Path '{source_zip}' -DestinationPath 'D:\\' -Force\"")
        return True
    else:
        print(f"⚠ DeepSeek zip not found: {source_zip}")
        print("Consider extracting it first to optimize training speed")
        return False

def setup_config_yaml():
    """Update config.yaml to point to D: drive if needed"""
    config_path = Path(__file__).parent / "config.yaml"
    if config_path.exists():
        with open(config_path, 'r') as f:
            content = f.read()
        
        if "D:\\polyvore_outfits" not in content and "dataset/Polyvore" in content:
            print("\n✓ config.yaml is ready for symlinked datasets")
        return True
    return False

if __name__ == "__main__":
    print("=" * 60)
    print("DATASET LINKER - Creating Symlinks for Large Datasets")
    print("=" * 60)
    
    print("\n1. Setting up Polyvore symlink...")
    polyvore_ok = create_symlink_polyvore()
    
    print("\n2. Checking DeepFashion/DeepSeek...")
    deepfashion_ok = create_symlink_deepfashion()
    
    print("\n3. Checking config...")
    setup_config_yaml()
    
    print("\n" + "=" * 60)
    if polyvore_ok:
        print("✓ READY TO TRAIN!")
        print("Run: python train.py --config config.yaml --epochs 10")
    else:
        print("⚠ Setup incomplete. Run as Administrator if symlinks fail.")
    print("=" * 60)
