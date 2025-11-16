const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// GET /api/services → ganti peran prices.json di frontend
router.get("/", (req, res) => {
  try {
    const filePath = path.join(__dirname, "..", "prices.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw); // array services
    res.json(data);
  } catch (err) {
    console.error("Error GET /api/services:", err);
    res.status(500).json({ message: "Tidak bisa load layanan" });
  }
});

module.exports = router;
