# 🔗 Disk Space Solution - Using D: Drive Datasets

## Problem
Your C: drive is too small for the full datasets. Both Polyvore (378K images) and DeepSeek are too large.

## Solution
Train directly from D: drive without copying. Here are three options:

---

## Option 1: Train with Polyvore Only (RECOMMENDED - Fast Start)
Using the Polyvore dataset on D: drive immediately.

### Step 1: Update training config
```yaml
# ml/config.yaml
# Change this line:
data_root: "../dataset"
# To this:
data_root: "D:"  # or use D:\\polyvore_outfits
```

### Step 2: Modify data_loader to use D: drive
```python
# In ml/data_loader.py - update the _load_polyvore method:

def _load_polyvore(self):
    """Load Polyvore from D: drive"""
    # Try project first, fallback to D:
    polyvore_path = Path("D:\\polyvore_outfits")  # Direct D: drive path
    
    images_dir = polyvore_path / "images"
    if not images_dir.exists():
        print(f"Error: {images_dir} not found")
        return
    
    # Rest of method stays the same...
```

### Step 3: Run training
```powershell
cd C:\Users\DELL\Desktop\stylemate\ml
python train.py --config config.yaml --model-type classifier --epochs 5 --batch-size 8
```

---

## Option 2: Extract DeepSeek First (Better for Speed)
If you want DeepFashion/DeepSeek data too:

```powershell
# Extract to temp location on D:
Expand-Archive -Path "D:\Deepseek.zip" -DestinationPath "D:\DeepSeek_extracted" -Force

# This creates D:\DeepSeek_extracted\images\
```

Then update config to use both:
```python
# ml/train.py
from data_loader import get_dataloader

# Load Polyvore from D:
train_loader = get_dataloader(
    dataset_type='polyvore',
    data_root='D:',  # Point to D: drive
    batch_size=16,
    split='train'
)
```

---

## Option 3: Create Hard Links (Windows Only)
Instead of symlinks (which need admin), use hard links:

```powershell
# Create hard link junction (admin required)
cmd /c mklink /d "C:\Users\DELL\Desktop\stylemate\dataset\Polyvore\images" "D:\polyvore_outfits\images"
```

---

## Current Status

✅ **Polyvore ready** (D:\polyvore_outfits\images - 378K images)
✅ **DeepSeek available** (D:\Deepseek.zip - 6.36GB, needs extraction)
⏳ **Recommended**: Start training with Polyvore only

---

## Quick Start Command

### Using mounted D: drive directly:
```powershell
cd C:\Users\DELL\Desktop\stylemate\ml
python -c "
from data_loader import FashionDataset
from pathlib import Path
import torchvision.transforms as transforms

# Load 100 images from Polyvore as test
ds = FashionDataset(
    data_dir=Path('D:\\polyvore_outfits'),
    dataset_type='polyvore',
    split='train',
    image_size=256
)
print(f'Loaded {len(ds.images)} images')
"
```

---

## Training with Limited Disk Space

### For smaller batch training:
```bash
python train.py \
  --config config.yaml \
  --model-type classifier \
  --epochs 3 \
  --batch-size 8 \
  --dataset-type polyvore \
  --data-root D:
```

### Monitor resources:
```powershell
# Watch GPU/RAM during training
Get-Process python | Select-Object ProcessName, WorkingSet, @{Name="Memory(MB)";Expression={$_.WorkingSet/1MB}}
```

---

## Troubleshooting

### "No such file or directory: D:\polyvore_outfits"
Make sure:
- D: drive is mounted/available
- File paths use backslashes: `D:\polyvore_outfits` (not `D:/`)
- For Python, escape or use raw string: `Path("D:\\polyvore_outfits")`

### "Permission denied"  
- Symlinks need admin, try hard links instead
- Or just point training directly to D: path

### Training too slow
- D: drive speed depends on external drive type (USB 2.0 vs 3.0)
- Copy 5-10% sample to C: for initial testing
- Use smaller batch size if RAM limited

---

## Recommended Workflow

**Phase 1 - Test (Today)**
```bash
# Train with 1000 Polyvore images
python train.py --batch-size 8 --epochs 1 --data-root D:
```

**Phase 2 - Full Training (Once verified)**  
```bash
# Extract DeepSeek to D:
powershell Expand-Archive -Path D:\Deepseek.zip -DestinationPath D: -Force

# Train on both datasets
python train.py --batch-size 16 --epochs 10 --dataset-type all
```

**Phase 3 - Deploy**
```bash
# Export model to frontend
python inference.py --export-embeddings --output ../frontend/src/assets/model/
```
