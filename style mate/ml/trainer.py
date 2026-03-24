import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import CosineAnnealingLR, StepLR
import time
from pathlib import Path
import json
from datetime import datetime

class Trainer:
    """Training loop for fashion models"""
    
    def __init__(self, model, train_loader, val_loader, config):
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.config = config
        self.device = torch.device(config.get('device', 'cuda' if torch.cuda.is_available() else 'cpu'))
        
        # Move model to device
        self.model = self.model.to(self.device)
        
        # Loss function
        self.criterion = nn.CrossEntropyLoss()
        
        # Optimizer
        lr = config['training']['learning_rate']
        wd = config['training']['weight_decay']
        
        if config['optimizer']['type'] == 'adam':
            self.optimizer = optim.Adam(self.model.parameters(), lr=lr, weight_decay=wd)
        else:
            self.optimizer = optim.SGD(
                self.model.parameters(),
                lr=lr,
                momentum=config['optimizer']['momentum'],
                weight_decay=wd
            )
        
        # Scheduler
        if config['scheduler']['type'] == 'cosine':
            self.scheduler = CosineAnnealingLR(
                self.optimizer,
                T_max=config['training']['epochs']
            )
        else:
            self.scheduler = StepLR(
                self.optimizer,
                step_size=config['scheduler']['step_size'],
                gamma=config['scheduler']['gamma']
            )
        
        # Metrics
        self.history = {
            'train_loss': [],
            'val_loss': [],
            'train_acc': [],
            'val_acc': []
        }
        self.best_val_acc = 0
        self.checkpoint_dir = Path('checkpoints')
        self.checkpoint_dir.mkdir(exist_ok=True)
    
    def train_epoch(self, epoch):
        """Train for one epoch"""
        self.model.train()
        total_loss = 0
        correct = 0
        total = 0
        
        for batch_idx, batch in enumerate(self.train_loader):
            images = batch['image'].to(self.device)
            labels = batch['label']
            
            # Convert string labels to indices (for demo; in production use label encoder)
            label_indices = torch.tensor([hash(l) % 1000 for l in labels]).to(self.device)
            
            # Forward pass
            self.optimizer.zero_grad()
            logits, embeddings = self.model(images)
            loss = self.criterion(logits, label_indices)
            
            # Backward pass
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            self.optimizer.step()
            
            # Metrics
            total_loss += loss.item()
            _, predicted = torch.max(logits, 1)
            correct += (predicted == label_indices).sum().item()
            total += label_indices.size(0)
            
            if batch_idx % 10 == 0:
                print(f"Epoch [{epoch}] Batch [{batch_idx}/{len(self.train_loader)}] Loss: {loss.item():.4f}")
        
        avg_loss = total_loss / len(self.train_loader)
        avg_acc = correct / total if total > 0 else 0
        
        return avg_loss, avg_acc
    
    def validate(self):
        """Validate the model"""
        self.model.eval()
        total_loss = 0
        correct = 0
        total = 0
        
        with torch.no_grad():
            for batch in self.val_loader:
                images = batch['image'].to(self.device)
                labels = batch['label']
                
                label_indices = torch.tensor([hash(l) % 1000 for l in labels]).to(self.device)
                
                logits, embeddings = self.model(images)
                loss = self.criterion(logits, label_indices)
                
                total_loss += loss.item()
                _, predicted = torch.max(logits, 1)
                correct += (predicted == label_indices).sum().item()
                total += label_indices.size(0)
        
        avg_loss = total_loss / len(self.val_loader) if len(self.val_loader) > 0 else 0
        avg_acc = correct / total if total > 0 else 0
        
        return avg_loss, avg_acc
    
    def train(self, num_epochs):
        """Train for multiple epochs"""
        start_time = time.time()
        
        for epoch in range(num_epochs):
            # Train
            train_loss, train_acc = self.train_epoch(epoch)
            
            # Validate
            val_loss, val_acc = self.validate()
            
            # Update scheduler
            self.scheduler.step()
            
            # Record metrics
            self.history['train_loss'].append(train_loss)
            self.history['train_acc'].append(train_acc)
            self.history['val_loss'].append(val_loss)
            self.history['val_acc'].append(val_acc)
            
            print(f"\nEpoch [{epoch+1}/{num_epochs}]")
            print(f"  Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f}")
            print(f"  Val Loss:   {val_loss:.4f} | Val Acc:   {val_acc:.4f}")
            
            # Save best model
            if val_acc > self.best_val_acc:
                self.best_val_acc = val_acc
                self.save_checkpoint(epoch, val_acc, is_best=True)
                print(f"  ✓ Best model saved!")
            
            # Regular checkpoint
            if (epoch + 1) % 10 == 0:
                self.save_checkpoint(epoch, val_acc, is_best=False)
        
        elapsed_time = time.time() - start_time
        print(f"\nTraining completed in {elapsed_time/3600:.2f} hours")
        
        return self.history
    
    def save_checkpoint(self, epoch, val_acc, is_best=False):
        """Save model checkpoint"""
        checkpoint = {
            'epoch': epoch,
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'val_acc': val_acc,
            'timestamp': datetime.now().isoformat()
        }
        
        filename = 'best_model.pt' if is_best else f'checkpoint_epoch_{epoch}.pt'
        filepath = self.checkpoint_dir / filename
        torch.save(checkpoint, filepath)
        print(f"Checkpoint saved: {filepath}")
    
    def load_checkpoint(self, checkpoint_path):
        """Load model checkpoint"""
        checkpoint = torch.load(checkpoint_path, map_location=self.device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        print(f"Checkpoint loaded from {checkpoint_path}")
    
    def save_history(self, filepath='training_history.json'):
        """Save training history"""
        with open(filepath, 'w') as f:
            json.dump(self.history, f, indent=2)
        print(f"Training history saved to {filepath}")


def train_fashion_model(config_path, model_type='classifier'):
    """Main training function"""
    import yaml
    from data_loader import get_dataloader
    from models import create_model
    
    # Load config
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    # Create data loaders
    print("Loading datasets...")
    train_loader, val_loader, test_loader = get_dataloader(
        data_dir='dataset',
        batch_size=config['data']['batch_size'],
        num_workers=config['data']['num_workers'],
        image_size=config['data']['image_size']
    )
    
    # Create model
    print("Creating model...")
    model = create_model(
        model_type=model_type,
        num_classes=config['model']['num_classes'],
        embedding_dim=config['model']['embedding_dim'],
        pretrained=config['model']['pretrained']
    )
    
    # Train
    print("Starting training...")
    trainer = Trainer(model, train_loader, val_loader, config)
    history = trainer.train(config['training']['epochs'])
    
    # Save history
    trainer.save_history()
    
    return trainer, history
