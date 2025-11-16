const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// GET /api/home/summary
router.get("/summary", (req, res) => {
  try {
    const filePath = path.join(__dirname, "..", "home.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    console.error("Error GET /api/home/summary:", err);
    res.status(500).json({ message: "Tidak bisa load summary home" });
  }
});

module.exports = router;
