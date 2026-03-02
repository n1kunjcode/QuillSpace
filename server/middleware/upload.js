const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "quillspace",
        resource_type: "auto",          // handles images, PDFs, docs
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf", "txt", "doc", "docx"],
        public_id: (req, file) => {
            const base = file.originalname
                .replace(/\.[^/.]+$/, "")
                .replace(/[^a-zA-Z0-9_-]/g, "_");
            return `${Date.now()}-${base}`;
        },
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type."), false);
    }
};

// Cloudinary enforces its own plan limits — no arbitrary cap needed on our end
// Set a generous 50MB multer limit so the multipart parser doesn't reject large PDFs first
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter,
});

module.exports = upload;
