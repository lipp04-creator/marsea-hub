const express = require("express");
const path = require("path");
const fs = require("fs");
const pool = require("../db");

const router = express.Router();

/**
 * GET /api/vessels
 * Utama: ambil dari tabel vessels.
 * Fallback: kalau DB error, baca vessels.json.
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT vessel_id AS id, name, type, lat, lng, eta FROM vessels"
    );
    return res.json(rows);
  } catch (err) {
    console.error("DB error /api/vessels:", err);
  }

  // fallback ke file JSON
  try {
    const filePath = path.join(__dirname, "..", "vessels.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const vessels = JSON.parse(raw);
    return res.json(vessels);
  } catch (fileErr) {
    console.error("Fallback vessels.json error:", fileErr);
    res.status(500).json({ message: "Gagal memuat data vessels" });
  }
});

module.exports = router;
