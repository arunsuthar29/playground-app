// ✅ Node 20, CommonJS style
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import routes
const aiRoutes = require("./routes/ai");
const pptRoutes = require("./routes/ppt");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/ai", aiRoutes);
app.use("/api/ppt", pptRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
