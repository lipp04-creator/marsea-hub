const express = require("express");

const router = express.Router();

// GET /api/community/feeds
router.get("/feeds", (req, res) => {
  // sementara hardcode, nanti bisa diganti baca file / DB
  const feeds = [
    {
      type: "Report",
      icon: "🛢️",
      title: "Oil Spill Kecil di Zona C",
      body: "Tumpahan minyak terlokalisir, kapal diminta mengurangi kecepatan.",
      meta: "Dilaporkan 2 jam lalu"
    },
    {
      type: "Event",
      icon: "📢",
      title: "Simulasi SAR Bersama BASARNAS",
      body: "Latihan SAR bersama kapal penumpang dan logistik di sekitar Merak.",
      meta: "Dijadwalkan besok 09.00"
    }
  ];

  res.json({ feeds });
});

module.exports = router;
