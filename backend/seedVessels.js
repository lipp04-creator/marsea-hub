// backend/seedVessels.js
// Seed data kapal ke tabel `vessels` dari file vessels.json (dummy)

const fs   = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function main() {
  let pool;
  try {
    // 1. KONEKSI LANGSUNG KE DB (GA PAKAI db.js)
    pool = await mysql.createPool({
      host: "localhost",
      user: "root",            // ganti kalau user MySQL kamu beda
      password: "",            // ganti kalau ada password
      database: "marsea_backend", // ⬅️ sesuai info dari kamu
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 2. BACA FILE vessels.json (di root project)
    const filePath = path.join(__dirname, "..", "vessels.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const vessels = JSON.parse(raw);

    console.log(`Muat ${vessels.length} kapal dari vessels.json`);

    // 3. BUAT TABEL vessels KALAU BELUM ADA
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vessels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vessel_id VARCHAR(20) NOT NULL,
        name VARCHAR(100) NOT NULL,
        type ENUM('Passenger','Logistics','Tanker','Operational') NOT NULL,
        lat DOUBLE NOT NULL,
        lng DOUBLE NOT NULL,
        eta VARCHAR(20) DEFAULT NULL
      )
    `);

    // 4. KOSONGKAN TABEL BIAR SINKRON SAMA JSON
    await pool.query("TRUNCATE TABLE vessels");

    // 5. INSERT DATA DARI JSON
    const values = vessels.map(v => [
      v.id,        // vessel_id (contoh: "S-001")
      v.name,
      v.type,
      v.lat,
      v.lng,
      v.eta
    ]);

    if (values.length) {
      await pool.query(
        "INSERT INTO vessels (vessel_id, name, type, lat, lng, eta) VALUES ?",
        [values]
      );
    }

    console.log(`✅ Berhasil seed ${values.length} vessels ke tabel 'vessels' di DB 'marsea_backend'.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seedVessels:", err);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end().catch(() => {});
    }
  }
}

main();
