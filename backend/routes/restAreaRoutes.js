const express = require("express");
const router = express.Router();
const pool    = require("../db");  



/**
 * POST /api/restareas/bookings
 */
router.post("/bookings", async (req, res) => {
  try {
    const {
      restAreaId,
      vesselName,
      vesselType,
      qty,
      eta,
      etd,
      serviceSummary
    } = req.body;

    if (!restAreaId || !vesselName || !vesselType || !qty) {
      return res.status(400).json({ message: "Data pemesanan belum lengkap." });
    }

    const requested_slots = parseInt(qty, 10) || 1;

    // cek rest area
    const [areas] = await pool.query(
      "SELECT id, capacity FROM rest_areas WHERE id = ?",
      [restAreaId]
    );
    if (areas.length === 0) {
      return res.status(400).json({ message: "Rest area tidak ditemukan." });
    }

    // hitung slot terpakai
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(requested_slots),0) AS used
       FROM bookings
       WHERE rest_area_id = ?
         AND status IN ('pending','confirmed')`,
      [restAreaId]
    );

    const used = rows[0].used || 0;
    const capacity = areas[0].capacity;
    const newUsed = used + requested_slots;

    if (newUsed > capacity) {
      return res.status(400).json({
        message: `Slot tidak cukup. Terpakai ${used} dari ${capacity}, permintaan tambahan ${requested_slots}.`
      });
    }

    await pool.query(
      `INSERT INTO bookings
       (rest_area_id, vessel_name, vessel_type, requested_slots, eta, etd, status, service_summary)
       VALUES (?,?,?,?,?,?, 'pending', ?)`,
      [
        restAreaId,
        vesselName,
        vesselType,
        requested_slots,
        eta || null,
        etd || null,
        serviceSummary || null
      ]
    );

    res.json({ message: "Pemesanan berhasil disimpan." });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

/**
 * GET /api/restareas/bookings
 * ?rest_area_id=R1 (opsional)
 * (bisa dipakai buat debug / panel list kapal)
 */
router.get("/bookings", async (req, res) => {
  try {
    const { rest_area_id } = req.query;
    let sql = "SELECT * FROM bookings";
    const params = [];

    if (rest_area_id) {
      sql += " WHERE rest_area_id = ?";
      params.push(rest_area_id);
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

/**
 * GET /api/restareas/bookings/summary
 * summary untuk dashboard
 */
router.get("/bookings/summary", async (req, res) => {
  try {
    // total booking & active
    const [sumRows] = await pool.query(
      `SELECT 
         COUNT(*) AS totalBookings,
         SUM(status IN ('pending','confirmed')) AS activeBookings
       FROM bookings`
    );

    const summary = sumRows[0] || { totalBookings: 0, activeBookings: 0 };

    // kapal unik
    const [uniqueRows] = await pool.query(
      `SELECT COUNT(DISTINCT vessel_name) AS uniqueVessels
       FROM bookings`
    );
    summary.uniqueVessels = (uniqueRows[0] && uniqueRows[0].uniqueVessels) || 0;

    // distribusi per tipe kapal
    const [typeRows] = await pool.query(
      `SELECT vessel_type, COUNT(*) AS count
       FROM bookings
       GROUP BY vessel_type`
    );

    summary.byType = typeRows; // array [{vessel_type:'Passenger', count:5}, ...]

    res.json(summary);
  } catch (err) {
    console.error("Summary bookings error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

module.exports = router;

// ===== UTILIZATION PER REST AREA (UNTUK DASHBOARD) =====
router.get("/utilization", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         r.id,
         r.name,
         r.capacity,
         COALESCE(SUM(
           CASE 
             WHEN b.status IN ('pending','confirmed') 
             THEN b.requested_slots 
             ELSE 0 
           END
         ), 0) AS used
       FROM rest_areas r
       LEFT JOIN bookings b
         ON b.rest_area_id = r.id
       GROUP BY r.id, r.name, r.capacity
       ORDER BY r.id`
    );

    res.json(rows); 
    // contoh response:
    // [
    //   { id: 'R1', name: 'MARSEA Arunika', capacity: 12, used: 3 },
    //   { id: 'R2', name: 'MARSEA Samudra', capacity: 10, used: 4 },
    //   { id: 'R3', name: 'MARSEA Nirwana', capacity: 8,  used: 5 }
    // ]
  } catch (err) {
    console.error("Utilization error:", err);
    res.status(500).json({ message: "Gagal mengambil data rest area." });
  }
});

module.exports = router;