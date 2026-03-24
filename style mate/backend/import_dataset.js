const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, "data");
const DATASET_FILE = path.join(DATA_DIR, "dataset.json"); // Hidden file
const UPLOADS_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(DATASET_FILE)) fs.writeFileSync(DATASET_FILE, '[]');

let dataset = [];
try { dataset = JSON.parse(fs.readFileSync(DATASET_FILE, 'utf8')); } catch (e) { dataset = []; }

const files = fs.readdirSync(UPLOADS_DIR);
let count = 0;

files.forEach(file => {
    if (file.startsWith('.')) return;
    const url = `http://localhost:4000/uploads/${file}`;
    
    if (!dataset.some(i => i.image_url === url)) {
        const lower = file.toLowerCase();
        let cat = "tops";
        if (lower.includes("pant") || lower.includes("skirt")) cat = "bottoms";
        else if (lower.includes("dress")) cat = "dresses";
        else if (lower.includes("coat")) cat = "outerwear";
        else if (lower.includes("shoe")) cat = "shoes";

        dataset.push({
            id: `train-${Date.now()}-${count}`,
            item_name: file,
            category: cat,
            color: "unknown",
            style: "casual",
            season: ["all"],
            image_url: url,
            is_training: true
        });
        count++;
    }
});

fs.writeFileSync(DATASET_FILE, JSON.stringify(dataset, null, 2));
console.log(`\n✅ Added ${count} items to AI TRAINING DATA (Hidden from Wardrobe).`);