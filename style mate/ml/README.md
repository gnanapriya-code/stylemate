# Fashion Model Training Pipeline

Complete ML training setup for StyleMate using DeepFashion and Polyvore datasets.

## 📁 Project Structure

```
ml/
├── config.yaml           # Training configuration
├── requirements.txt      # Python dependencies
├── data_loader.py        # Dataset loaders for DeepFashion & Polyvore
├── models.py             # Model architectures
├── trainer.py            # Training loop and utilities
├── train.py              # Main training script
├── inference.py          # Inference and prediction pipeline
├── README.md             # This file
└── checkpoints/          # Saved model checkpoints (auto-created)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ml
pip install -r requirements.txt
```

### 2. Upload & Organize Datasets

**Option A: Interactive Python Script (Easiest)**
```bash
python upload_dataset.py
```

**Option B: Windows Batch File**
```bash
upload_dataset.bat
```

**Option C: Command Line**
```bash
python upload_dataset.py deepfashion "C:\path\to\deepfashion.zip"
python upload_dataset.py polyvore "C:\path\to\polyvore.zip"
python upload_dataset.py status
```

### 3. Prepare Datasets

#### DeepFashion Dataset
1. Download from: http://mmlab.ie.cuhk.edu.hk/projects/DeepFashion.html
2. Extract to: `dataset/DeepFashion/`
3. Expected structure:
   ```
   dataset/DeepFashion/
   ├── images/              # Clothing images
   ├── list_bbox_inshop_clothes.txt
   └── ...
   ```

#### Polyvore Dataset
1. Download from: https://github.com/omermelamud/polyvore_outfits
2. Extract to: `dataset/Polyvore/`
3. Expected structure:
   ```
   dataset/Polyvore/
   ├── images/              # Outfit item images
   ├── train_outfits.json
   ├── val_outfits.json
   └── ...
   ```

### 3. Start Training

**Option A: Basic training (Fashion Classifier)**
```bash
python train.py --config config.yaml
```

**Option B: Custom parameters**
```bash
python train.py --config config.yaml \
    --model-type classifier \
    --device cuda \
    --epochs 50 \
    --batch-size 32
```

**Option C: Resume from checkpoint**
```bash
python train.py --config config.yaml --checkpoint checkpoints/best_model.pt
```

### 4. Training Monitor

Training metrics are saved in `training_history.json`. View with:

```python
import json
with open('training_history.json') as f:
    history = json.load(f)
    print(history)
```

## 🤖 Available Models

### 1. FashionClassifier (Default)
- ResNet50 backbone
- Fashion item classification
- Embedding layer for feature extraction
- **Use case:** Classify clothing type, color, style

```bash
python train.py --model-type classifier
```

### 2. FashionSimilarityModel
- Siamese network architecture
- Learn similarity between items
- **Use case:** Find similar outfits, recommendation system

```bash
python train.py --model-type similarity
```

### 3. OutfitGenerator
- LSTM-based sequence generation
- Generate complete outfit sequences
- **Use case:** Suggest full outfits based on partial input

```bash
python train.py --model-type outfit_generator
```

## 📊 Configuration

Edit `config.yaml` to customize:

```yaml
model:
  backbone: "resnet50"
  embedding_dim: 256
  num_classes: 1000

training:
  epochs: 50
  batch_size: 32
  learning_rate: 0.001

data:
  image_size: 256
  num_workers: 4
```

## 🔍 Inference

Use trained model for predictions:

```python
from inference import FashionInference

# Load model
inferencer = FashionInference('checkpoints/best_model.pt', model_type='classifier')

# Single image prediction
result = inferencer.predict_single('path/to/image.jpg')
print(result)

# Find similar images
similar = inferencer.find_similar('query.jpg', gallery_images, top_k=5)
for img_path, similarity in similar:
    print(f"{img_path}: {similarity:.4f}")

# Export all embeddings
from inference import export_embeddings
embeddings = export_embeddings('checkpoints/best_model.pt', image_list)
```

## 📈 Training Tips

1. **Data Augmentation:** Enable in config for better generalization
2. **Learning Rate:** Start with 0.001, reduce if overfitting
3. **Batch Size:** Use 32 or 64 depending on GPU memory
4. **Warmup:** Use warmup_epochs for stable training
5. **Validation Split:** Recommend 80/10/10 train/val/test

## 🐛 Troubleshooting

### CUDA Out of Memory
- Reduce batch_size in config.yaml
- Use --device cpu flag to train on CPU
- Reduce image_size

### Datasets Not Loading
- Verify folder structure matches documentation
- Check image file format (jpg, png supported)
- Ensure file permissions are correct

### Slow Training
- Enable mixed precision training
- Use more num_workers
- Reduce image_size
- Use smaller backbone (ResNet18 instead of ResNet50)

## 📝 License

This training pipeline is part of StyleMate project.
