const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

function readNdwi() {
  const filePath = path.join(__dirname, "..", "ndwi.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// GET /api/ndwi  → buat dashboard (trend)
router.get("/", (req, res) => {
  try {
    const data = readNdwi();
    res.json(data);  // { weeks: [...], values: [...] }
  } catch (err) {
    console.error("Error GET /api/ndwi:", err);
    res.status(500).json({ message: "Gagal load NDWI" });
  }
});

// GET /api/ndwi/latest  → buat KPI map/dashboard
router.get("/latest", (req, res) => {
  try {
    const data = readNdwi();
    const { weeks = [], values = [] } = data;

    if (!weeks.length || !values.length) {
      return res.status(404).json({ message: "Data NDWI kosong" });
    }

    const lastIndex = values.length - 1;
    res.json({
      week: weeks[lastIndex],
      value: values[lastIndex]
    });
  } catch (err) {
    console.error("Error GET /api/ndwi/latest:", err);
    res.status(500).json({ message: "Gagal load NDWI latest" });
  }
});

module.exports = router;
