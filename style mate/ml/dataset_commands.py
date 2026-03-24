#!/usr/bin/env python3
"""
Windows PowerShell helper script
Copy-paste commands for dataset upload
"""

WINDOWS_COMMANDS = """
# ============================================================================
# WINDOWS POWERSHELL COMMANDS FOR DATASET UPLOAD
# ============================================================================
# Copy and paste these commands into PowerShell (run as Administrator)

# 1. CREATE DATASET FOLDER STRUCTURE
# ============================================================================
mkdir C:\\Users\\DELL\\Desktop\\stylemate\\dataset\\DeepFashion\\images
mkdir C:\\Users\\DELL\\Desktop\\stylemate\\dataset\\Polyvore\\images

# 2. EXTRACT ZIP FILES
# ============================================================================
# DeepFashion
$deepfashion_zip = "C:\\path\\to\\deepfashion.zip"  # Change this path
Expand-Archive -Path $deepfashion_zip -DestinationPath C:\\Users\\DELL\\Desktop\\stylemate\\dataset\\DeepFashion

# Polyvore
$polyvore_zip = "C:\\path\\to\\polyvore.zip"  # Change this path
Expand-Archive -Path $polyvore_zip -DestinationPath C:\\Users\\DELL\\Desktop\\stylemate\\dataset\\Polyvore

# 3. COPY FILES TO CORRECT LOCATIONS
# ============================================================================
# If images are in nested folders, flatten them
# DeepFashion
Get-ChildItem -Path C:\\Users\\DELL\\Desktop\\stylemate\\dataset\\DeepFashion -Recurse -Include *.jpg, *.png | 
    Copy-Item -Destination C:\\Users\\DELL\\Desktop\\stylemate\\dataset\\DeepFashion\\images\\ -Force

# Polyvore
Get-ChildItem -Path C:\\Users\\DELL\\Desktop\\stylemate\\dataset\\Polyvore -Recurse -Include *.jpg, *.png | 
    Copy-Item -Destination C:\\Users\\DELL\\Desktop\\stylemate\\dataset\\Polyvore\\images\\ -Force

# 4. RENAME IMAGES TO LOWERCASE (if needed)
# ============================================================================
# DeepFashion
cd C:\\Users\\DELL\\Desktop\\stylemate\\dataset\\DeepFashion\\images
Get-ChildItem -File | ForEach-Object {
    if ($_.Name -ne $_.Name.ToLower()) {
        Rename-Item -Path $_.FullName -NewName $_.Name.ToLower()
    }
}

# Polyvore
cd C:\\Users\\DELL\\Desktop\\stylemate\\dataset\\Polyvore\\images
Get-ChildItem -File | ForEach-Object {
    if ($_.Name -ne $_.Name.ToLower()) {
        Rename-Item -Path $_.FullName -NewName $_.Name.ToLower()
    }
}

# 5. VERIFY UPLOAD
# ============================================================================
# Check DeepFashion images
Write-Host "DeepFashion images:" 
(Get-ChildItem -Path C:\\Users\\DELL\\Desktop\\stylemate\\dataset\\DeepFashion\\images -Recurse | Measure-Object).Count

# Check Polyvore images
Write-Host "Polyvore images:"
(Get-ChildItem -Path C:\\Users\\DELL\\Desktop\\stylemate\\dataset\\Polyvore\\images -Recurse | Measure-Object).Count

# Check total size
Write-Host "Total dataset size:"
"{0:N2} GB" -f ((Get-ChildItem -Path C:\\Users\\DELL\\Desktop\\stylemate\\dataset -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1GB)

# 6. RUN PYTHON VERIFICATION
# ============================================================================
cd C:\\Users\\DELL\\Desktop\\stylemate\\ml
python upload_dataset.py status

# 7. START TRAINING
# ============================================================================
python train.py --config config.yaml --epochs 10 --batch-size 16
"""

# Windows batch version
WINDOWS_BATCH = r"""
REM Dataset Upload Commands (Batch Version)
REM Run as Administrator

@echo off
cd /d C:\Users\DELL\Desktop\stylemate

REM Create folders
mkdir dataset\DeepFashion\images 2>nul
mkdir dataset\Polyvore\images 2>nul

echo.
echo Folders created successfully!
echo.
echo Now use Python script to upload:
echo   python ml/upload_dataset.py
echo.
pause
"""

if __name__ == '__main__':
    # Print commands
    print(WINDOWS_COMMANDS)
    
    # Also save to file
    with open('UPLOAD_COMMANDS.ps1', 'w') as f:
        f.write("# PowerShell Commands for Dataset Upload\n")
        f.write(WINDOWS_COMMANDS)
    
    with open('UPLOAD_COMMANDS.bat', 'w') as f:
        f.write(WINDOWS_BATCH)
    
    print("\n\n✓ Commands saved to:")
    print("  - UPLOAD_COMMANDS.ps1 (PowerShell)")
    print("  - UPLOAD_COMMANDS.bat (Batch)")
