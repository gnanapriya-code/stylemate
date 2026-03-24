@echo off
REM Dataset Upload Helper for Windows
REM This script helps upload DeepFashion and Polyvore datasets

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ============================================================
echo FASHION DATASET UPLOAD HELPER
echo ============================================================
echo.

:menu
echo Options:
echo 1. Upload DeepFashion dataset
echo 2. Upload Polyvore dataset
echo 3. Check dataset status
echo 4. Open dataset folder in explorer
echo 5. Exit
echo.

set /p choice=Enter choice (1-5): 

if "%choice%"=="1" (
    set /p deepfashion_path=Enter path to DeepFashion file or folder: 
    python upload_dataset.py deepfashion "!deepfashion_path!"
    goto menu
)

if "%choice%"=="2" (
    set /p polyvore_path=Enter path to Polyvore file or folder: 
    python upload_dataset.py polyvore "!polyvore_path!"
    goto menu
)

if "%choice%"=="3" (
    python upload_dataset.py status
    goto menu
)

if "%choice%"=="4" (
    start explorer ..\dataset
    goto menu
)

if "%choice%"=="5" (
    exit /b 0
)

echo Invalid choice!
goto menu
