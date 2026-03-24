#!/usr/bin/env python3
"""
Dataset Upload Helper Script
Helps organize and verify DeepSeek and Polyvore datasets
"""

import os
import shutil
import json
from pathlib import Path
import zipfile
import tarfile

class DatasetUploader:
    """Helper class to upload and organize fashion datasets"""
    
    def __init__(self, base_path="dataset"):
        self.base_path = Path(base_path)
        self.deepfashion_path = self.base_path / "DeepFashion"
        self.polyvore_path = self.base_path / "Polyvore"
        
        # Create directories
        self.deepfashion_path.mkdir(parents=True, exist_ok=True)
        self.polyvore_path.mkdir(parents=True, exist_ok=True)
        
        print(f"Dataset base path: {self.base_path.absolute()}")
        print(f"DeepFashion path: {self.deepfashion_path.absolute()}")
        print(f"Polyvore path: {self.polyvore_path.absolute()}")
    
    def extract_zip(self, zip_file, extract_to):
        """Extract zip file to destination"""
        print(f"\nExtracting {zip_file}...")
        try:
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                zip_ref.extractall(extract_to)
            print(f"✓ Successfully extracted to {extract_to}")
            return True
        except Exception as e:
            print(f"✗ Error extracting {zip_file}: {e}")
            return False
    
    def extract_tar(self, tar_file, extract_to):
        """Extract tar file to destination"""
        print(f"\nExtracting {tar_file}...")
        try:
            with tarfile.open(tar_file, 'r:*') as tar_ref:
                tar_ref.extractall(extract_to)
            print(f"✓ Successfully extracted to {extract_to}")
            return True
        except Exception as e:
            print(f"✗ Error extracting {tar_file}: {e}")
            return False
    
    def copy_directory(self, src_path, dest_path):
        """Copy directory recursively"""
        print(f"\nCopying from {src_path} to {dest_path}...")
        try:
            if Path(src_path).exists():
                # If source is a directory, copy its contents
                if Path(src_path).is_dir():
                    for item in Path(src_path).iterdir():
                        if item.is_dir():
                            shutil.copytree(item, dest_path / item.name, dirs_exist_ok=True)
                        else:
                            shutil.copy2(item, dest_path / item.name)
                print(f"✓ Successfully copied")
                return True
            else:
                print(f"✗ Source path not found: {src_path}")
                return False
        except Exception as e:
            print(f"✗ Error copying: {e}")
            return False
    
    def upload_deepfashion(self, source_path):
        """Upload DeepFashion dataset"""
        print("\n" + "="*60)
        print("UPLOADING DeepFashion DATASET")
        print("="*60)
        
        source = Path(source_path)
        
        # Handle zip file
        if source.suffix.lower() == '.zip':
            self.extract_zip(source, self.deepfashion_path)
        # Handle tar file
        elif source.suffix.lower() in ['.tar', '.gz']:
            self.extract_tar(source, self.deepfashion_path)
        # Handle directory
        elif source.is_dir():
            self.copy_directory(source, self.deepfashion_path)
        else:
            print(f"✗ Unknown file type: {source.suffix}")
            return False
        
        # Verify structure
        self.verify_deepfashion()
        return True
    
    def upload_polyvore(self, source_path):
        """Upload Polyvore dataset"""
        print("\n" + "="*60)
        print("UPLOADING Polyvore DATASET")
        print("="*60)
        
        source = Path(source_path)
        
        # Handle zip file
        if source.suffix.lower() == '.zip':
            self.extract_zip(source, self.polyvore_path)
        # Handle tar file
        elif source.suffix.lower() in ['.tar', '.gz']:
            self.extract_tar(source, self.polyvore_path)
        # Handle directory
        elif source.is_dir():
            self.copy_directory(source, self.polyvore_path)
        else:
            print(f"✗ Unknown file type: {source.suffix}")
            return False
        
        # Verify structure
        self.verify_polyvore()
        return True
    
    def verify_deepfashion(self):
        """Verify DeepFashion structure"""
        print("\n" + "-"*60)
        print("VERIFYING DeepFashion DATASET")
        print("-"*60)
        
        images_dir = self.deepfashion_path / "images"
        
        if not images_dir.exists():
            print("⚠ Warning: 'images' folder not found")
            print("Expected structure:")
            print("  DeepFashion/")
            print("  ├── images/          (clothing images)")
            print("  ├── images/Img/      (alternative structure)")
            print("  └── annotation/      (optional metadata)")
            return False
        
        # Count images
        image_extensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']
        image_files = []
        for ext in image_extensions:
            image_files.extend(images_dir.glob(f"**/*{ext}"))
        
        print(f"✓ Found images directory")
        print(f"✓ Total images: {len(image_files)}")
        
        # Check for annotation files
        anno_files = list(self.deepfashion_path.glob("*.txt")) + list(self.deepfashion_path.glob("*.json"))
        if anno_files:
            print(f"✓ Found {len(anno_files)} annotation files")
        
        return True
    
    def verify_polyvore(self):
        """Verify Polyvore structure"""
        print("\n" + "-"*60)
        print("VERIFYING Polyvore DATASET")
        print("-"*60)
        
        images_dir = self.polyvore_path / "images"
        
        if not images_dir.exists():
            print("⚠ Warning: 'images' folder not found")
            print("Expected structure:")
            print("  Polyvore/")
            print("  ├── images/          (outfit item images)")
            print("  ├── *.json           (outfit metadata)")
            print("  └── *.txt            (optional metadata)")
            return False
        
        # Count images
        image_extensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']
        image_files = []
        for ext in image_extensions:
            image_files.extend(images_dir.glob(f"**/*{ext}"))
        
        print(f"✓ Found images directory")
        print(f"✓ Total images: {len(image_files)}")
        
        # Check for JSON files
        json_files = list(self.polyvore_path.glob("*.json"))
        if json_files:
            print(f"✓ Found {len(json_files)} JSON metadata files:")
            for jf in json_files:
                try:
                    with open(jf) as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            print(f"  - {jf.name}: {len(data)} items")
                        else:
                            print(f"  - {jf.name}: metadata file")
                except:
                    print(f"  - {jf.name}: (unreadable)")
        
        return True
    
    def get_status(self):
        """Get current dataset status"""
        print("\n" + "="*60)
        print("DATASET STATUS")
        print("="*60)
        
        # DeepFashion status
        df_images = len(list((self.deepfashion_path / "images").glob("**/*.jpg") if (self.deepfashion_path / "images").exists() else []))
        df_images += len(list((self.deepfashion_path / "images").glob("**/*.png") if (self.deepfashion_path / "images").exists() else []))
        
        if df_images > 0:
            print(f"\n✓ DeepFashion: {df_images} images found")
        else:
            print(f"\n✗ DeepFashion: No images found (empty)")
        
        # Polyvore status
        pv_images = len(list((self.polyvore_path / "images").glob("**/*.jpg") if (self.polyvore_path / "images").exists() else []))
        pv_images += len(list((self.polyvore_path / "images").glob("**/*.png") if (self.polyvore_path / "images").exists() else []))
        
        if pv_images > 0:
            print(f"✓ Polyvore: {pv_images} images found")
        else:
            print(f"✗ Polyvore: No images found (empty)")
        
        print(f"\nTotal images: {df_images + pv_images}")
        
        if df_images > 0 and pv_images > 0:
            print("\n✓ Both datasets are ready for training!")
            return True
        else:
            print("\n⚠ Please upload missing datasets")
            return False


def interactive_upload():
    """Interactive dataset upload"""
    uploader = DatasetUploader()
    
    print("\n" + "="*60)
    print("FASHION DATASET UPLOAD HELPER")
    print("="*60)
    
    while True:
        print("\nOptions:")
        print("1. Upload DeepFashion dataset")
        print("2. Upload Polyvore dataset")
        print("3. Check dataset status")
        print("4. Exit")
        
        choice = input("\nEnter choice (1-4): ").strip()
        
        if choice == '1':
            source = input("Enter path to DeepFashion (zip/tar/folder): ").strip()
            if source:
                uploader.upload_deepfashion(source)
        
        elif choice == '2':
            source = input("Enter path to Polyvore (zip/tar/folder): ").strip()
            if source:
                uploader.upload_polyvore(source)
        
        elif choice == '3':
            ready = uploader.get_status()
        
        elif choice == '4':
            print("Goodbye!")
            break
        
        else:
            print("Invalid choice")


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        # Command line mode
        if sys.argv[1] == 'deepfashion' and len(sys.argv) > 2:
            uploader = DatasetUploader()
            uploader.upload_deepfashion(sys.argv[2])
        elif sys.argv[1] == 'polyvore' and len(sys.argv) > 2:
            uploader = DatasetUploader()
            uploader.upload_polyvore(sys.argv[2])
        elif sys.argv[1] == 'status':
            uploader = DatasetUploader()
            uploader.get_status()
        else:
            print("Usage:")
            print("  python upload_dataset.py deepfashion <path>")
            print("  python upload_dataset.py polyvore <path>")
            print("  python upload_dataset.py status")
            print("  python upload_dataset.py (interactive mode)")
    else:
        # Interactive mode
        interactive_upload()
