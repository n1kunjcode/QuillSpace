const express = require("express");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ── POST /api/upload — store file in Cloudinary ───────────────────
router.post("/", authMiddleware, upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // Cloudinary provides a persistent HTTPS URL directly on req.file
    res.json({
        originalName: req.file.originalname,
        filename: req.file.filename,        // Cloudinary public_id
        path: req.file.path,            // Cloudinary secure URL
        mimetype: req.file.mimetype,
        size: req.file.size,
    });
});

module.exports = router;
