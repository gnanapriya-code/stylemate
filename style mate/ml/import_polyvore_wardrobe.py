"""
Import Polyvore dataset images into wardrobe.json
Scans images and creates wardrobe entries with metadata
"""

import os
import json
import random
from pathlib import Path
from PIL import Image

# Paths
POLYVORE_IMAGES_DIR = "D:\\polyvore_outfits\\images"
CATEGORIES_FILE = "C:\\Users\\DELL\\Desktop\\stylemate\\dataset\\Polyvore\\polyvore_outfits\\categories.csv"
WARDROBE_OUTPUT = "C:\\Users\\DELL\\Desktop\\stylemate\\backend\\data\\wardrobe.json"

# Category mapping
CATEGORY_MAPPING = {
    "accessories": "accessories",
    "bags": "accessories",
    "belts": "accessories",
    "boots": "shoes",
    "coats": "outerwear",
    "dresses": "dresses",
    "flats": "shoes",
    "handbags": "accessories",
    "hats": "accessories",
    "heels": "shoes",
    "jeans": "bottoms",
    "pants": "bottoms",
    "scarves": "accessories",
    "shirts": "tops",
    "shoes": "shoes",
    "shorts": "bottoms",
    "skirts": "bottoms",
    "sneakers": "shoes",
    "sweaters": "tops",
    "sweatshirts": "tops",
    "t-shirts": "tops",
    "tops": "tops",
    "underwear": "accessories",
}

def get_category_from_filename(filename):
    """Extract category from image filename"""
    name_lower = filename.lower()
    
    for key, value in CATEGORY_MAPPING.items():
        if key in name_lower:
            return value
    
    # Default categories based on pattern
    if any(x in name_lower for x in ["top", "shirt", "blouse", "sweater"]):
        return "tops"
    elif any(x in name_lower for x in ["pant", "jean", "trouser", "slack"]):
        return "bottoms"
    elif any(x in name_lower for x in ["dress"]):
        return "dresses"
    elif any(x in name_lower for x in ["shoe", "boot", "sneaker", "heel", "flat"]):
        return "shoes"
    elif any(x in name_lower for x in ["coat", "jacket", "blazer", "cardigan"]):
        return "outerwear"
    else:
        return "accessories"

def get_color_from_filename(filename):
    """Extract color hint from filename"""
    colors = ["black", "white", "blue", "red", "green", "yellow", "pink", "purple", "gray", "brown", "navy", "beige", "cream", "gold", "silver"]
    name_lower = filename.lower()
    
    for color in colors:
        if color in name_lower:
            return color
    return "multi"

def import_polyvore_images(sample_size=None):
    """Import Polyvore images into wardrobe.json"""
    
    wardrobe = []
    item_id = 1000  # Start IDs from 1000 to avoid collision with existing items
    
    try:
        # Get list of all images
        image_files = [f for f in os.listdir(POLYVORE_IMAGES_DIR) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        print(f"Found {len(image_files)} images in Polyvore dataset")
        
        # Shuffle and optionally sample
        random.shuffle(image_files)
        if sample_size:
            image_files = image_files[:sample_size]
        
        print(f"Processing {len(image_files)} images...")
        
        for idx, filename in enumerate(image_files):
            if (idx + 1) % 1000 == 0:
                print(f"  Processed {idx + 1}/{len(image_files)} images...")
            
            image_path = os.path.join(POLYVORE_IMAGES_DIR, filename)
            
            # Extract metadata
            category = get_category_from_filename(filename)
            color = get_color_from_filename(filename)
            
            # Create wardrobe entry
            item = {
                "id": str(item_id),
                "item_name": f"{category.capitalize()} - {filename.split('.')[0][:50]}",
                "category": category,
                "color": color,
                "style": random.choice(["casual", "formal", "sportswear", "streetwear"]),
                "season": [random.choice(["spring", "summer", "fall", "winter"])],
                "image_url": f"file:///{image_path}",  # Local file path
                "image_path": image_path,
                "source": "polyvore"
            }
            
            wardrobe.append(item)
            item_id += 1
        
        print(f"\nGenerated {len(wardrobe)} wardrobe items")
        
        # Save to wardrobe.json
        os.makedirs(os.path.dirname(WARDROBE_OUTPUT), exist_ok=True)
        with open(WARDROBE_OUTPUT, 'w', encoding='utf-8') as f:
            json.dump(wardrobe, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved {len(wardrobe)} items to {WARDROBE_OUTPUT}")
        return wardrobe
        
    except Exception as e:
        print(f"❌ Error importing images: {e}")
        return []

if __name__ == "__main__":
    import sys
    
    # Check if sample size specified
    sample_size = None
    if len(sys.argv) > 1:
        try:
            sample_size = int(sys.argv[1])
        except:
            pass
    
    print(f"Starting Polyvore import (sample_size={sample_size})...")
    wardrobe = import_polyvore_images(sample_size=sample_size)
    print(f"\nWardrobe populated with {len(wardrobe)} items!")
