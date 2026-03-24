import json
import os

# Fix wardrobe URLs
with open('backend/data/wardrobe.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for item in items:
    filename = os.path.basename(item['image_path'])
    item['image_url'] = f'http://localhost:4000/image/{filename}'

with open('backend/data/wardrobe.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, indent=2)

print(f'✅ Fixed {len(items)} image URLs')
