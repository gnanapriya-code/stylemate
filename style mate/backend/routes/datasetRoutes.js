const express = require("express");
const router = express.Router();
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

// Helper to load CSV file
function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

router.get("/items", async (req, res) => {
  const file = path.join(__dirname, "../data/items.csv");
  const items = await loadCSV(file);
  res.json(items);
});

router.get("/outfits", async (req, res) => {
  const file = path.join(__dirname, "../data/outfits.csv");
  const outfits = await loadCSV(file);
  res.json(outfits);
});

router.get("/random-outfit", async (req, res) => {
  const file = path.join(__dirname, "../data/outfits.csv");
  const outfits = await loadCSV(file);
  const random = outfits[Math.floor(Math.random() * outfits.length)];
  res.json(random);
});

module.exports = router;
