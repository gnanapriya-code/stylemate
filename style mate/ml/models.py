import torch
import torch.nn as nn
import torchvision.models as models
from torch.nn import functional as F

class FashionClassifier(nn.Module):
    """ResNet-based fashion item classifier with embedding layer"""
    
    def __init__(self, num_classes=1000, embedding_dim=256, pretrained=True):
        super(FashionClassifier, self).__init__()
        self.embedding_dim = embedding_dim
        self.num_classes = num_classes
        
        # Load pretrained ResNet50
        self.backbone = models.resnet50(pretrained=pretrained)
        
        # Replace final classification layer
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()  # Remove original fc layer
        
        # Add embedding layer
        self.embedding = nn.Linear(in_features, embedding_dim)
        self.embedding_bn = nn.BatchNorm1d(embedding_dim)
        
        # Classification head
        self.classifier = nn.Linear(embedding_dim, num_classes)
        
        # Dropout for regularization
        self.dropout = nn.Dropout(0.3)
    
    def forward(self, x):
        """Forward pass"""
        # Backbone feature extraction
        features = self.backbone(x)  # [batch_size, in_features]
        
        # Embedding layer
        embedding = self.embedding(features)  # [batch_size, embedding_dim]
        embedding = self.embedding_bn(embedding)
        embedding = F.relu(embedding)
        embedding = self.dropout(embedding)
        
        # Classification
        logits = self.classifier(embedding)  # [batch_size, num_classes]
        
        return logits, embedding
    
    def get_embedding(self, x):
        """Get embedding representation without classification"""
        features = self.backbone(x)
        embedding = self.embedding(features)
        embedding = self.embedding_bn(embedding)
        embedding = F.relu(embedding)
        return embedding


class FashionSimilarityModel(nn.Module):
    """Siamese network for fashion item similarity"""
    
    def __init__(self, embedding_dim=256, pretrained=True):
        super(FashionSimilarityModel, self).__init__()
        self.backbone = models.resnet50(pretrained=pretrained)
        
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()
        
        self.embedding = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, embedding_dim),
            nn.BatchNorm1d(embedding_dim)
        )
    
    def forward(self, x1, x2=None):
        """Forward pass for one or two images"""
        features1 = self.backbone(x1)
        emb1 = F.normalize(self.embedding(features1), p=2, dim=1)
        
        if x2 is None:
            return emb1
        
        features2 = self.backbone(x2)
        emb2 = F.normalize(self.embedding(features2), p=2, dim=1)
        
        return emb1, emb2


class OutfitGenerator(nn.Module):
    """LSTM-based outfit generation model"""
    
    def __init__(self, embedding_dim=256, num_items=1000, hidden_dim=512, num_layers=2):
        super(OutfitGenerator, self).__init__()
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        
        # Item embedding
        self.item_embedding = nn.Embedding(num_items, embedding_dim)
        
        # LSTM encoder-decoder
        self.encoder_lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.3
        )
        
        self.decoder_lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.3
        )
        
        # Output projection
        self.output_proj = nn.Linear(hidden_dim, num_items)
        self.dropout = nn.Dropout(0.3)
    
    def forward(self, outfit_sequence):
        """
        Forward pass
        outfit_sequence: [batch_size, seq_len] - item indices
        """
        # Embed items
        embedded = self.item_embedding(outfit_sequence)  # [batch, seq, emb_dim]
        
        # Encode outfit
        encoder_out, (h_n, c_n) = self.encoder_lstm(embedded)
        
        # Decode next items
        decoder_in = embedded
        decoder_out, _ = self.decoder_lstm(decoder_in, (h_n, c_n))
        
        # Project to item space
        logits = self.output_proj(decoder_out)  # [batch, seq, num_items]
        
        return logits


def create_model(model_type='classifier', num_classes=1000, embedding_dim=256, pretrained=True):
    """Factory function to create models"""
    if model_type == 'classifier':
        return FashionClassifier(num_classes, embedding_dim, pretrained)
    elif model_type == 'similarity':
        return FashionSimilarityModel(embedding_dim, pretrained)
    elif model_type == 'outfit_generator':
        return OutfitGenerator(embedding_dim)
    else:
        raise ValueError(f"Unknown model type: {model_type}")
