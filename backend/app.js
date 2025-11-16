// app.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const restAreaRoutes = require("./routes/restAreaRoutes");
const vesselRoutes = require("./routes/vesselRoutes");
const ndwiRoutes = require("./routes/ndwiRoutes");
const homeRoutes = require("./routes/homeRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const communityRoutes = require("./routes/communityRoutes");

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/restareas", restAreaRoutes);
app.use("/api/vessels", vesselRoutes);
app.use("/api/ndwi", ndwiRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/community", communityRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok", app: "MARSEA backend" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MARSEA backend running on port ${PORT}`);
});
