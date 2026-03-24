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

// FILES
const WARDROBE_FILE = path.join(DATA_DIR, "wardrobe.json");
const DATASET_FILE = path.join(DATA_DIR, "dataset.json");
const DESIGNS_FILE = path.join(DATA_DIR, "designs.json");
const FAVORITES_FILE = path.join(DATA_DIR, "favorites.json");
const AVATAR_FILE = path.join(DATA_DIR, "avatar.json");
const PLANS_FILE = path.join(DATA_DIR, "plans.json"); // <--- NEW FILE

// Ensure folders exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Initialize DB files
[WARDROBE_FILE, DATASET_FILE, DESIGNS_FILE, FAVORITES_FILE, AVATAR_FILE, PLANS_FILE].forEach(file => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
});

// --- MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// --- HELPERS ---
function readData(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) || [];
  } catch (e) { return []; }
}

function writeData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// --- ROUTES ---

// Wardrobe
app.get("/api/wardrobe", (req, res) => res.json(readData(WARDROBE_FILE)));
app.post("/api/wardrobe", (req, res) => {
  const items = readData(WARDROBE_FILE);
  const newItem = { id: Date.now().toString(), ...req.body };
  items.push(newItem);
  writeData(WARDROBE_FILE, items);
  res.json(newItem);
});
app.post("/api/wardrobe/batch", (req, res) => {
  const items = readData(WARDROBE_FILE);
  const newItems = req.body.map(item => ({
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
    ...item
  }));
  writeData(WARDROBE_FILE, [...items, ...newItems]);
  res.json({ success: true });
});
app.delete("/api/wardrobe/clear", (req, res) => {
  writeData(WARDROBE_FILE, []);
  res.json({ success: true });
});
app.delete("/api/wardrobe/:id", (req, res) => {
  const items = readData(WARDROBE_FILE);
  writeData(WARDROBE_FILE, items.filter(i => i.id !== req.params.id));
  res.json({ success: true });
});

// Dataset
app.get("/api/dataset", (req, res) => res.json(readData(DATASET_FILE)));

// Favorites
app.get("/api/favorites", (req, res) => res.json(readData(FAVORITES_FILE)));
app.post("/api/favorites", (req, res) => {
  const d = readData(FAVORITES_FILE);
  d.push({ id: Date.now().toString(), ...req.body });
  writeData(FAVORITES_FILE, d);
  res.json({ success: true });
});
app.delete("/api/favorites/:id", (req, res) => {
  const d = readData(FAVORITES_FILE);
  writeData(FAVORITES_FILE, d.filter(i => i.id !== req.params.id));
  res.json({ success: true });
});

// Designs
app.get("/api/designs", (req, res) => res.json(readData(DESIGNS_FILE)));
app.post("/api/designs", (req, res) => {
  const d = readData(DESIGNS_FILE);
  d.push({ id: Date.now(), ...req.body });
  writeData(DESIGNS_FILE, d);
  res.json({ success: true });
});

// Avatar
app.get("/api/avatar", (req, res) => res.json(readData(AVATAR_FILE)[0] || {}));
app.post("/api/avatar", (req, res) => {
  writeData(AVATAR_FILE, [{ id: "user", ...req.body }]);
  res.json({ success: true });
});

// --- NEW: PLANS ROUTES ---
app.get("/api/plans", (req, res) => res.json(readData(PLANS_FILE)));
app.post("/api/plans", (req, res) => {
  const plans = readData(PLANS_FILE);
  const newPlan = { 
    id: Date.now().toString(), 
    created_date: new Date().toISOString(),
    status: 'active',
    ...req.body 
  };
  plans.push(newPlan);
  writeData(PLANS_FILE, plans);
  res.json(newPlan);
});
app.delete("/api/plans/:id", (req, res) => {
  const plans = readData(PLANS_FILE);
  writeData(PLANS_FILE, plans.filter(p => p.id !== req.params.id));
  res.json({ success: true });
});

// Uploads
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const ext = path.extname(req.file.originalname) || ".jpg";
  const newPath = `${req.file.path}${ext}`;
  fs.renameSync(req.file.path, newPath);
  res.json({ file_url: `http://localhost:4000/uploads/${req.file.filename}${ext}` });
});
app.use("/uploads", express.static(UPLOADS_DIR));

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));