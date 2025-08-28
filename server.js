const express = require("express");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const multer = require("multer");
const { v4: uuid } = require("uuid");
const mime = require("mime-types");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

const app = express();

// Security & performance
app.use(helmet({
  contentSecurityPolicy: false // easy mode for CDN fonts/icons
}));
app.use(compression());
app.use(morgan("dev"));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);  
app.set("layout", "layout"); 

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Multer for uploads (PNG, JPEG, DICOM)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => {
    const ext = mime.extension(file.mimetype) || "bin";
    cb(null, `${uuid()}.${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept png, jpg/jpeg, and dicom (common DICOM type)
    const ok =
      ["image/png", "image/jpeg", "application/dicom", "application/dicom+json"].includes(file.mimetype) ||
      file.originalname.toLowerCase().endsWith(".dcm"); // fallback for .dcm
    if (ok) return cb(null, true);
    cb(new Error("Unsupported file type. Allowed: PNG, JPEG, DICOM (.dcm)"));
  },
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB per file (tune as needed)
});

// ---------- Routes ----------

// Home
app.get("/", (req, res) => {
  res.render("index");
});

// Auth
app.get("/login", (req, res) => res.render("login"));
app.post("/login", (req, res) => {
  // TODO: authenticate
  return res.redirect("/dashboard");
});

app.get("/signup", (req, res) => {
  res.render("signup", { firstName: "", lastName: "", email: "", userType: "" });
});
app.post("/signup", (req, res) => {
  // TODO: create user
  return res.redirect("/login");
});

// Dashboard (placeholder page to try uploads)
app.get("/dashboard", (req, res) => {
  res.render("index"); // reuse home for now or create dashboard.ejs later
});

// Upload imaging
app.post("/upload", upload.array("images", 5), (req, res) => {
  // TODO:
  // - anonymize (strip DICOM metadata)
  // - preprocess (contrast adjustment, resize)
  // - enqueue for AI analysis
  const files = (req.files || []).map(f => ({
    filename: path.basename(f.path),
    mimetype: f.mimetype,
    size: f.size
  }));
  return res.status(200).json({
    message: "Upload received",
    files
  });
});

// Generate AI report (placeholder that mimics your spec)
app.post("/report", (req, res) => {
  const { findingsText = "" } = req.body;

  // Very naive transformation for demo purposes only:
  const translations = [
    {
      doctor: /right lower lobe consolidation with air bronchograms/gi,
      patient: "There is likely pneumonia in the lower part of your right lung."
    },
    {
      doctor: /consolidation/gi,
      patient: "a dense area in the lung, often due to infection (like pneumonia)"
    }
  ];

  const patientFriendly = translations.reduce((acc, rule) => {
    return acc.replace(rule.doctor, rule.patient);
  }, findingsText);

  const report = {
    findings: findingsText || "No acute cardiopulmonary abnormality identified.",
    impression: "Imaging features are most compatible with community-acquired pneumonia.",
    recommendations: [
      "Clinical correlation with symptoms and labs.",
      "Consider follow-up chest X-ray in 6–8 weeks.",
      "Antibiotic therapy per local guidelines."
    ],
    patientExplanation: patientFriendly || "Your lungs look okay overall."
  };

  // TODO: Export as PDF/Docx if needed
  return res.json({ report });
});

// Simple pages in footer (optional placeholders)
app.get("/features", (req, res) => res.render("index"));
app.get("/pricing", (req, res) => res.render("index"));
app.get("/api", (req, res) => res.render("index"));
app.get("/integrations", (req, res) => res.render("index"));
app.get("/about", (req, res) => res.render("index"));
app.get("/careers", (req, res) => res.render("index"));
app.get("/contact", (req, res) => res.render("index"));
app.get("/blog", (req, res) => res.render("index"));
app.get("/help", (req, res) => res.render("index"));
app.get("/docs", (req, res) => res.render("index"));
app.get("/privacy", (req, res) => res.render("index"));
app.get("/terms", (req, res) => res.render("index"));

// Error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.status(400).json({ error: err.message || "Something went wrong." });
  }
  res.status(400).send(err.message || "Something went wrong.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Medo Care running on http://localhost:${PORT}`));
