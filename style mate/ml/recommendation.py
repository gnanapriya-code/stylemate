#!/usr/bin/env python3
r"""
Fashion Recommendation API Endpoint
Integrates trained model with Express backend
"""

import pickle
import numpy as np
from PIL import Image
from pathlib import Path
import json
from functools import lru_cache

# Load trained model and scaler
MODEL_PATH = Path(__file__).parent / "checkpoints" / "fashion_classifier.pkl"
SCALER_PATH = Path(__file__).parent / "checkpoints" / "scaler.pkl"
POLYVORE_PATH = Path("D:\\polyvore_outfits\\images")

_model = None
_scaler = None
_image_features_cache = {}

def load_model():
    """Load trained model"""
    global _model, _scaler
    
    if _model is None:
        with open(MODEL_PATH, 'rb') as f:
            _model = pickle.load(f)
    
    if _scaler is None:
        with open(SCALER_PATH, 'rb') as f:
            _scaler = pickle.load(f)
    
    return _model, _scaler

def extract_features(image_path):
    """Extract color histogram features from image"""
    try:
        img = Image.open(image_path).convert('RGB')
        img = img.resize((32, 32))
        img_array = np.array(img)
        
        # Extract color histogram
        hist_r = np.histogram(img_array[:,:,0], bins=32)[0]
        hist_g = np.histogram(img_array[:,:,1], bins=32)[0]
        hist_b = np.histogram(img_array[:,:,2], bins=32)[0]
        
        feature = np.concatenate([hist_r, hist_g, hist_b])
        return feature.reshape(1, -1)
    except Exception as e:
        print(f"Error extracting features: {e}")
        return None

@lru_cache(maxsize=1000)
def get_image_features(image_path):
    """Cache image features"""
    if image_path not in _image_features_cache:
        features = extract_features(image_path)
        if features is not None:
            _image_features_cache[image_path] = features
    return _image_features_cache.get(image_path)

def find_similar_outfits(uploaded_image_path, top_k=5):
    """Find similar outfits in Polyvore dataset"""
    model, scaler = load_model()
    
    # Extract features from uploaded image
    query_features = extract_features(uploaded_image_path)
    if query_features is None:
        return []
    
    query_features_scaled = scaler.transform(query_features)
    
    # Get all Polyvore images
    polyvore_images = sorted(POLYVORE_PATH.glob("*.jpg")) + sorted(POLYVORE_PATH.glob("*.png"))
    
    if not polyvore_images:
        print(f"No images found in {POLYVORE_PATH}")
        return []
    
    print(f"Searching {len(polyvore_images)} Polyvore images...")
    
    # Predict on query
    query_pred = model.predict_proba(query_features_scaled)[0]
    
    # Find images with similar predictions
    scores = []
    for img_path in polyvore_images[:500]:  # Sample first 500 for speed
        try:
            img_features = extract_features(str(img_path))
            if img_features is not None:
                img_features_scaled = scaler.transform(img_features)
                img_pred = model.predict_proba(img_features_scaled)[0]
                
                # Cosine similarity
                similarity = np.dot(query_pred, img_pred) / (
                    np.linalg.norm(query_pred) * np.linalg.norm(img_pred) + 1e-8
                )
                scores.append((str(img_path), similarity))
        except Exception as e:
            continue
    
    # Sort by similarity
    scores.sort(key=lambda x: x[1], reverse=True)
    
    # Return top K
    return [
        {
            "image_path": path,
            "image_name": Path(path).name,
            "similarity_score": float(score)
        }
        for path, score in scores[:top_k]
    ]

if __name__ == "__main__":
    # Test
    print("Testing recommendation system...")
    load_model()
    print("✓ Model loaded")
    
    # Test with first Polyvore image
    test_images = list(POLYVORE_PATH.glob("*.jpg"))[:1]
    if test_images:
        results = find_similar_outfits(str(test_images[0]), top_k=5)
        print(f"\n✓ Found {len(results)} similar outfits:")
        for i, result in enumerate(results, 1):
            print(f"  {i}. {result['image_name']} (similarity: {result['similarity_score']:.4f})")
