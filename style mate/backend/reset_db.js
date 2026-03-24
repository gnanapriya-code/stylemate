const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, "data");
const WARDROBE_FILE = path.join(DATA_DIR, "wardrobe.json");

console.log("🔥 Force Clearing Wardrobe Database...");

try {
    // Overwrite file with empty array
    fs.writeFileSync(WARDROBE_FILE, '[]');
    console.log("✅ Success! wardrobe.json has been wiped clean.");
    console.log("👉 Now refresh your browser.");
} catch (e) {
    console.error("❌ Error:", e.message);
}