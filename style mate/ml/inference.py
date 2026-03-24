import torch
import json
from pathlib import Path
from PIL import Image
import torchvision.transforms as transforms
from models import create_model

class FashionInference:
    """Inference pipeline for trained fashion models"""
    
    def __init__(self, model_path, model_type='classifier', device='cuda'):
        self.device = torch.device(device if torch.cuda.is_available() else 'cpu')
        self.model_type = model_type
        
        # Load model
        self.model = create_model(model_type=model_type)
        checkpoint = torch.load(model_path, map_location=self.device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model = self.model.to(self.device)
        self.model.eval()
        
        # Transform
        self.transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def predict_single(self, image_path):
        """Predict on single image"""
        image = Image.open(image_path).convert('RGB')
        image = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            if self.model_type == 'classifier':
                logits, embeddings = self.model(image)
                probs = torch.softmax(logits, dim=1)
                top_k = torch.topk(probs, k=5)
                return {
                    'embeddings': embeddings.cpu().numpy().tolist(),
                    'predictions': top_k.values.cpu().numpy().tolist(),
                    'indices': top_k.indices.cpu().numpy().tolist()
                }
            else:
                embeddings = self.model(image)
                return {
                    'embeddings': embeddings.cpu().numpy().tolist()
                }
    
    def find_similar(self, query_image_path, gallery_images, top_k=5):
        """Find similar images to query"""
        # Get query embedding
        query_image = Image.open(query_image_path).convert('RGB')
        query_image = self.transform(query_image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            query_emb = self.model.get_embedding(query_image) if hasattr(self.model, 'get_embedding') \
                        else self.model(query_image)[1]
            query_emb = torch.nn.functional.normalize(query_emb, p=2, dim=1)
        
        # Get gallery embeddings
        similarities = []
        for img_path in gallery_images:
            gallery_image = Image.open(img_path).convert('RGB')
            gallery_image = self.transform(gallery_image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                gallery_emb = self.model.get_embedding(gallery_image) if hasattr(self.model, 'get_embedding') \
                              else self.model(gallery_image)[1]
                gallery_emb = torch.nn.functional.normalize(gallery_emb, p=2, dim=1)
                
                # Cosine similarity
                similarity = torch.cosine_similarity(query_emb, gallery_emb)
                similarities.append((img_path, similarity.item()))
        
        # Sort by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return similarities[:top_k]


def export_embeddings(model_path, image_paths, output_path='embeddings.json', model_type='classifier'):
    """Export embeddings for all images"""
    inference = FashionInference(model_path, model_type=model_type)
    
    embeddings_dict = {}
    for img_path in image_paths:
        try:
            result = inference.predict_single(img_path)
            embeddings_dict[str(img_path)] = {
                'embeddings': result['embeddings'][0],
                'predictions': result.get('predictions', None),
                'indices': result.get('indices', None)
            }
        except Exception as e:
            print(f"Error processing {img_path}: {e}")
    
    # Save to JSON
    with open(output_path, 'w') as f:
        json.dump(embeddings_dict, f, indent=2)
    
    print(f"Embeddings exported to {output_path}")
    return embeddings_dict
