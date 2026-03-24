#!/usr/bin/env python3
"""
Main training script for fashion model
Usage: python train.py --config config.yaml --model-type classifier
"""

import argparse
import yaml
import torch
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from data_loader import get_dataloader
from models import create_model
from trainer import Trainer


def main():
    parser = argparse.ArgumentParser(description='Train fashion model')
    parser.add_argument('--config', type=str, default='config.yaml', help='Path to config file')
    parser.add_argument('--model-type', type=str, default='classifier', 
                       choices=['classifier', 'similarity', 'outfit_generator'],
                       help='Model type to train')
    parser.add_argument('--device', type=str, default=None, help='cuda or cpu')
    parser.add_argument('--epochs', type=int, default=None, help='Override number of epochs')
    parser.add_argument('--batch-size', type=int, default=None, help='Override batch size')
    parser.add_argument('--checkpoint', type=str, default=None, help='Load from checkpoint')
    
    args = parser.parse_args()
    
    # Load config
    print(f"Loading config from {args.config}...")
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
    
    # Override with command line args
    if args.device:
        config['device'] = args.device
    if args.epochs:
        config['training']['epochs'] = args.epochs
    if args.batch_size:
        config['data']['batch_size'] = args.batch_size
    
    # Set device
    if not torch.cuda.is_available() and config['device'] == 'cuda':
        print("CUDA not available, using CPU")
        config['device'] = 'cpu'
    
    print(f"Device: {config['device']}")
    print(f"Model type: {args.model_type}")
    
    # Create data loaders
    print("\nLoading datasets...")
    try:
        train_loader, val_loader, test_loader = get_dataloader(
            data_dir='dataset',
            batch_size=config['data']['batch_size'],
            num_workers=config['data']['num_workers'],
            image_size=config['data']['image_size']
        )
    except Exception as e:
        print(f"Error loading datasets: {e}")
        print("Make sure your datasets are extracted to dataset/DeepFashion/ and dataset/Polyvore/")
        return
    
    # Create model
    print("\nCreating model...")
    model = create_model(
        model_type=args.model_type,
        num_classes=config['model']['num_classes'],
        embedding_dim=config['model']['embedding_dim'],
        pretrained=config['model']['pretrained']
    )
    
    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    # Create trainer
    trainer = Trainer(model, train_loader, val_loader, config)
    
    # Load checkpoint if provided
    if args.checkpoint:
        print(f"\nLoading checkpoint from {args.checkpoint}...")
        trainer.load_checkpoint(args.checkpoint)
    
    # Train
    print(f"\nStarting training for {config['training']['epochs']} epochs...")
    print("-" * 80)
    
    try:
        history = trainer.train(config['training']['epochs'])
        
        # Save training history
        print("\nSaving training history...")
        trainer.save_history('training_history.json')
        
        print("\n" + "=" * 80)
        print("Training completed successfully!")
        print(f"Best validation accuracy: {trainer.best_val_acc:.4f}")
        print(f"Checkpoints saved in: {trainer.checkpoint_dir}")
        
    except KeyboardInterrupt:
        print("\n\nTraining interrupted by user")
        trainer.save_checkpoint(0, trainer.best_val_acc)
        sys.exit(0)
    except Exception as e:
        print(f"\nError during training: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
