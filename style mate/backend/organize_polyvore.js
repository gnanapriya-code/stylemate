/**
 * POLYVORE → WARDROBEAI DATASET BUILDER
 * Creates:
 *  ✔ items.csv   (300 items)
 *  ✔ outfits.csv (200 outfits)
 *  ✔ Copies & renames item images into frontend/public/images/
 */

const fs = require("fs");
const path = require("path");
const csvWriter = require("csv-writer").createObjectCsvWriter;

// ---- CONFIG ----
const POLYVORE_ROOT = "D:/datasets/Polyvore/";
const PROJECT_IMAGES = path.join(__dirname, "../../frontend/public/images/");
const ITEMS_CSV = path.join(__dirname, "data/items.csv");
const OUTFITS_CSV = path.join(__dirname, "data/outfits.csv");

// Create frontend category folders if missing
const CATEGORIES = ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"];

CATEGORIES.forEach((cat) => {
  const folder = path.join(PROJECT_IMAGES, cat);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
});

// Load JSON content
function loadJSON(file) {
  const filePath = path.join(POLYVORE_ROOT, file);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const train = loadJSON("train.json");
const valid = loadJSON("valid.json");
const test = loadJSON("test.json");

// Combine all outfits
const ALL_SET = [...train, ...valid, ...test];

// Map polyvore categories → our categories
function mapCategory(polyCat) {
  const lower = polyCat.toLowerCase();

  if (lower.includes("top")) return "tops";
  if (lower.includes("jeans")) return "bottoms";
  if (lower.includes("pants")) return "bottoms";
  if (lower.includes("skirt")) return "bottoms";
  if (lower.includes("shorts")) return "bottoms";
  if (lower.includes("dress")) return "dresses";
  if (lower.includes("coat")) return "outerwear";
  if (lower.includes("jacket")) return "outerwear";
  if (lower.includes("blazer")) return "outerwear";
  if (lower.includes("shoe")) return "shoes";
  if (lower.includes("heel")) return "shoes";
  if (lower.includes("boot")) return "shoes";
  if (lower.includes("sneaker")) return "shoes";
  return "accessories";
}

// CSV writers
const itemsWriter = csvWriter({
  path: ITEMS_CSV,
  header: [
    { id: "id", title: "id" },
    { id: "image_path", title: "image_path" },
    { id: "category", title: "category" },
    { id: "primary_color", title: "primary_color" },
    { id: "season_tags", title: "season_tags" },
    { id: "occasion_tags", title: "occasion_tags" },
    { id: "pattern", title: "pattern" },
    { id: "formality_score", title: "formality_score" },
  ],
});

const outfitsWriter = csvWriter({
  path: OUTFITS_CSV,
  header: [
    { id: "outfit_id", title: "outfit_id" },
    { id: "top_id", title: "top_id" },
    { id: "bottom_id", title: "bottom_id" },
    { id: "dress_id", title: "dress_id" },
    { id: "outerwear_id", title: "outerwear_id" },
    { id: "shoes_id", title: "shoes_id" },
    { id: "season", title: "season" },
    { id: "occasion", title: "occasion" },
    { id: "is_valid", title: "is_valid" },
    { id: "notes", title: "notes" }
  ],
});

// Utility
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSeason() {
  return JSON.stringify([random(["spring", "summer", "fall", "winter"])]);
}

function generateOccasion() {
  return JSON.stringify([random(["casual", "formal", "classy", "romantic", "party"])]);
}

function generateColor() {
  return random(["white", "black", "red", "pink", "blue", "green", "yellow", "purple", "beige", "navy"]);
}

// MAIN
async function build() {
  console.log("📌 Building dataset using Polyvore…");

  let itemsList = [];
  let counters = {
    tops: 1,
    bottoms: 1,
    dresses: 1,
    outerwear: 1,
    shoes: 1,
    accessories: 1,
  };

  console.log("📸 Extracting first 300 items…");

  // Limit items to 300 for lightweight dataset
  const ITEM_LIMIT = 300;
  let extractedItems = [];

  for (const outfit of ALL_SET) {
    for (const piece of outfit.items) {
      if (extractedItems.length >= ITEM_LIMIT) break;

      const polyCat = piece.category || "accessory";
      const mapped = mapCategory(polyCat);

      const imgName = piece.image.split("/").pop();
      const srcPath = path.join(POLYVORE_ROOT, "images", imgName);

      if (!fs.existsSync(srcPath)) continue;

      const newName = `${mapped}${String(counters[mapped]).padStart(3, "0")}.jpg`;
      counters[mapped]++;

      const destPath = path.join(PROJECT_IMAGES, mapped, newName);
      fs.copyFileSync(srcPath, destPath);

      extractedItems.push({
        id: newName.replace(".jpg", ""),
        image_path: `images/${mapped}/${newName}`,
        category: mapped,
        primary_color: generateColor(),
        season_tags: generateSeason(),
        occasion_tags: generateOccasion(),
        pattern: "solid",
        formality_score: Math.floor(Math.random() * 5) + 1,
      });
    }
  }

  console.log(`✅ Created ${extractedItems.length} items.`);

  await itemsWriter.writeRecords(extractedItems);

  // ------------------------------------
  // OUTFIT GENERATION (200 outfits)
  // ------------------------------------
  console.log("👗 Generating 200 outfits…");

  const tops = extractedItems.filter(i => i.category === "tops");
  const bottoms = extractedItems.filter(i => i.category === "bottoms");
  const dresses = extractedItems.filter(i => i.category === "dresses");
  const outerwear = extractedItems.filter(i => i.category === "outerwear");
  const shoes = extractedItems.filter(i => i.category === "shoes");

  let outfitRows = [];

  for (let i = 1; i <= 200; i++) {
    let season = random(["spring", "summer", "fall", "winter"]);
    let occasion = random(["casual", "formal", "romantic", "classy", "party"]);

    let outfit = {};

    if (Math.random() < 0.3 && dresses.length > 0) {
      let d = random(dresses);
      outfit = {
        outfit_id: `OFT${String(i).padStart(3, "0")}`,
        top_id: "",
        bottom_id: "",
        dress_id: d.id,
        outerwear_id: season === "winter" ? random(outerwear)?.id : "",
        shoes_id: random(shoes)?.id || "",
        season,
        occasion,
        is_valid: true,
        notes: "Dress outfit",
      };
    } else {
      let t = random(tops);
      let b = random(bottoms);
      outfit = {
        outfit_id: `OFT${String(i).padStart(3, "0")}`,
        top_id: t?.id || "",
        bottom_id: b?.id || "",
        dress_id: "",
        outerwear_id: season === "winter" ? random(outerwear)?.id : "",
        shoes_id: random(shoes)?.id || "",
        season,
        occasion,
        is_valid: true,
        notes: "Top + Bottom outfit",
      };
    }

    outfitRows.push(outfit);
  }

  await outfitsWriter.writeRecords(outfitRows);

  console.log("🎉 Dataset completed successfully!");
}

build();
