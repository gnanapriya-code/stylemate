# How to Upload DeepFashion and Polyvore Datasets

This guide will help you organize and upload your fashion datasets to the StyleMate project.

## 📁 Expected Dataset Structure

```
stylemate/
└── dataset/
    ├── DeepFashion/
    │   ├── images/           ← Put all clothing images here
    │   │   ├── WOMEN-Coats_Jackets-id_00000001.jpg
    │   │   ├── WOMEN-Dresses-id_00000002.jpg
    │   │   └── ...
    │   ├── list_bbox_inshop_clothes.txt    (optional)
    │   └── annotation/                      (optional)
    │
    └── Polyvore/
        ├── images/           ← Put all outfit item images here
        │   ├── 174575_1.jpg
        │   ├── 174575_2.jpg
        │   └── ...
        ├── train_outfits.json
        ├── val_outfits.json
        └── test_outfits.json
```

## 🚀 Quick Upload Methods

### Method 1: Using Python Script (Recommended)

#### Interactive Mode:
```powershell
cd c:\Users\DELL\Desktop\stylemate\ml
python upload_dataset.py
```

Then follow the prompts:
```
Options:
1. Upload DeepFashion dataset
2. Upload Polyvore dataset
3. Check dataset status
4. Exit

Enter choice (1-2): 1
Enter path to DeepFashion (zip/tar/folder): C:\Users\DELL\Downloads\deepfashion.zip
```

#### Command Line Mode:
```powershell
# Upload DeepFashion
python upload_dataset.py deepfashion "C:\Users\DELL\Downloads\deepfashion.zip"

# Upload Polyvore
python upload_dataset.py polyvore "C:\Users\DELL\Downloads\polyvore.zip"

# Check status
python upload_dataset.py status
```

### Method 2: Using Batch File (Windows)

```powershell
cd c:\Users\DELL\Desktop\stylemate\ml
upload_dataset.bat
```

Then select options from the menu.

### Method 3: Manual Upload

#### For DeepFashion:
1. Extract your DeepFashion archive
2. Create folder: `dataset\DeepFashion\images\`
3. Copy all clothing images to `dataset\DeepFashion\images\`
4. (Optional) Copy annotation files to `dataset\DeepFashion\`

#### For Polyvore:
1. Extract your Polyvore archive
2. Create folder: `dataset\Polyvore\images\`
3. Copy all outfit item images to `dataset\Polyvore\images\`
4. Copy JSON metadata files to `dataset\Polyvore\`

## 📦 Dataset Format Support

### Supported File Formats
- ✅ ZIP files (`*.zip`)
- ✅ TAR files (`*.tar`, `*.tar.gz`)
- ✅ Directories (folders)

### Supported Image Formats
- ✅ JPEG (`.jpg`, `.jpeg`)
- ✅ PNG (`.png`)

## 🔍 Verify Your Upload

After uploading, check the status:

```powershell
python upload_dataset.py status
```

Expected output:
```
============================================================
DATASET STATUS
============================================================

✓ DeepFashion: 2,000 images found
✓ Polyvore: 5,000 images found

Total images: 7,000

✓ Both datasets are ready for training!
```

## 📍 Where to Get the Datasets

### DeepFashion Dataset
- **Website:** http://mmlab.ie.cuhk.edu.hk/projects/DeepFashion.html
- **Size:** ~20-50 GB (depending on which version you download)
- **Versions:**
  - Consumer-to-Shop Clothes Retrieval Benchmark
  - In-shop Clothes Retrieval Benchmark
  - Clothing Attribute Prediction

### Polyvore Dataset
- **GitHub:** https://github.com/omermelamud/polyvore_outfits
- **Size:** ~2-5 GB
- **Format:** Images + JSON metadata
- **Alternative:** https://www.kaggle.com/datasets (search "Polyvore")

## 🛠️ Troubleshooting

### Problem: "Folder is empty" error
```
✗ DeepFashion: No images found (empty)
```
**Solution:**
1. Check folder structure (must have `images/` subdirectory)
2. Verify images aren't in nested folders
3. Check file extensions are `.jpg` or `.png`

### Problem: File extraction fails
```
✗ Error extracting zip file: (error message)
```
**Solution:**
1. Download the file again (may be corrupted)
2. Try extracting manually using Windows Explorer or 7-Zip
3. Copy extracted folder using Method 3

### Problem: Images not recognized
```
✗ Total images: 0
```
**Solution:**
1. Check image file extensions (must be `.jpg`, `.png`)
2. Rename all images to lowercase extensions if needed:
```powershell
# PowerShell script to rename images
cd dataset\DeepFashion\images
Get-ChildItem -File | ForEach-Object {
    Rename-Item $_.FullName -NewName $_.Name.ToLower()
}
```

### Problem: Permission denied
```
✗ Error: Permission denied
```
**Solution:**
1. Run PowerShell as Administrator
2. Check file permissions (right-click → Properties → Security)
3. Move dataset to a different location with write permissions

## 📊 Dataset Statistics

### Expected Size After Upload

```
DeepFashion:
├── 800K - 1M images
├── ~50-100 GB on disk
└── Training time: 12-24 hours (GPU)

Polyvore:
├── 20K - 100K outfit items
├── ~2-5 GB on disk
└── Training time: 2-4 hours (GPU)
```

## ✅ Training After Upload

Once datasets are verified:

```powershell
cd c:\Users\DELL\Desktop\stylemate\ml
python train.py --config config.yaml
```

## 🆘 Still Having Issues?

Run these diagnostic commands:

```powershell
# Check Python version
python --version

# Check dataset folder structure
tree ..\dataset /L 3

# Check total image count
(Get-ChildItem -Path ..\dataset -Recurse -Filter *.jpg).Count + (Get-ChildItem -Path ..\dataset -Recurse -Filter *.png).Count

# Check file size
"{0:N2} GB" -f ((Get-ChildItem -Path ..\dataset -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1GB)
```

## 💡 Pro Tips

1. **Organize as you upload:** Keep both datasets in separate folders
2. **Backup original:** Keep original zip/tar files for safety
3. **Use SSD:** Training is faster on SSD storage
4. **Label your versions:** Include date/size info in folder names
5. **Verify integrity:** Always run `upload_dataset.py status` after uploading
