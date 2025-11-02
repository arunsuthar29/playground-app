
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");


dotenv.config();


const aiRoutes = require("./routes/ai");
const pptRoutes = require("./routes/ppt");

const app = express();

// Middlewares
const allowedOrigins = [
  "https://playground-app-psi.vercel.app", 
  "http://localhost:3000" 
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/ai", aiRoutes);
app.use("/api/ppt", pptRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
