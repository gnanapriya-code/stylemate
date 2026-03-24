const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- CONFIG ---
const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// 1. USER WARDROBE (Visible in App)
const WARDROBE_FILE = path.join(DATA_DIR, "wardrobe.json");
// 2. TRAINING DATASET (Hidden, used for AI logic)
const DATASET_FILE = path.join(DATA_DIR, "dataset.json");

const DESIGNS_FILE = path.join(DATA_DIR, "designs.json");
const FAVORITES_FILE = path.join(DATA_DIR, "favorites.json");
const AVATAR_FILE = path.join(DATA_DIR, "avatar.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

[WARDROBE_FILE, DATASET_FILE, DESIGNS_FILE, FAVORITES_FILE, AVATAR_FILE].forEach(file => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
});

// --- MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    // Keep original name if possible for dataset matching, else timestamp
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// --- HELPERS ---
function readData(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) { return []; }
}

function writeData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// --- ROUTES ---

// 1. GET WARDROBE (Only returns USER items, hides Dataset)
app.get("/api/wardrobe", (req, res) => {
  const items = readData(WARDROBE_FILE);
  res.json(items);
});

// 2. SAVE USER ITEM (Goes to wardrobe.json)
app.post("/api/wardrobe", (req, res) => {
  const items = readData(WARDROBE_FILE);
  const newItem = { id: Date.now().toString(), ...req.body };
  items.push(newItem);
  writeData(WARDROBE_FILE, items);
  res.json(newItem);
});

// 3. BATCH SAVE USER ITEMS (Bulk Upload from Frontend)
app.post("/api/wardrobe/batch", (req, res) => {
  const items = readData(WARDROBE_FILE);
  const newItems = req.body.map(item => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    ...item
  }));
  const updatedItems = [...items, ...newItems];
  writeData(WARDROBE_FILE, updatedItems);
  res.json({ count: newItems.length });
});

// 4. DATASET IMPORT (Internal Route for your script)
app.post("/api/dataset/import", (req, res) => {
  const dataset = readData(DATASET_FILE);
  // Add new dataset items without overwriting user wardrobe
  const newItems = req.body;
  const updatedDataset = [...dataset, ...newItems];
  writeData(DATASET_FILE, updatedDataset);
  console.log(`🧠 AI Model Updated: Added ${newItems.length} items to Training Dataset.`);
  res.json({ success: true, count: newItems.length });
});

// 5. CLEAR USER WARDROBE (Does NOT delete dataset)
app.delete("/api/wardrobe/clear", (req, res) => {
  writeData(WARDROBE_FILE, []);
  res.json({ success: true });
});

// 6. DELETE ITEM
app.delete("/api/wardrobe/:id", (req, res) => {
  const items = readData(WARDROBE_FILE);
  writeData(WARDROBE_FILE, items.filter(i => i.id !== req.params.id));
  res.json({ success: true });
});

// --- FAVORITES & OTHERS ---
app.get("/api/favorites", (req, res) => res.json(readData(FAVORITES_FILE)));
app.post("/api/favorites", (req, res) => {
  const favs = readData(FAVORITES_FILE);
  favs.push({ id: Date.now().toString(), ...req.body });
  writeData(FAVORITES_FILE, favs);
  res.json({ success: true });
});
app.delete("/api/favorites/:id", (req, res) => {
  const favs = readData(FAVORITES_FILE);
  writeData(FAVORITES_FILE, favs.filter(f => f.id !== req.params.id));
  res.json({ success: true });
});

app.get("/api/designs", (req, res) => res.json(readData(DESIGNS_FILE)));
app.post("/api/designs", (req, res) => {
  const data = readData(DESIGNS_FILE);
  data.push({ id: Date.now(), ...req.body });
  writeData(DESIGNS_FILE, data);
  res.json({ success: true });
});

app.get("/api/avatar", (req, res) => res.json(readData(AVATAR_FILE)[0] || {}));
app.post("/api/avatar", (req, res) => {
  writeData(AVATAR_FILE, [{ id: "user", ...req.body }]);
  res.json({ success: true });
});

// --- SERVE IMAGES ---
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ file_url: `http://localhost:4000/uploads/${req.file.filename}` });
});
app.use("/uploads", express.static(UPLOADS_DIR));

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));