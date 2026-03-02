const authMiddleware = require("./auth");

// ── Admin guard ──────────────────────────────────────────────────────
// Must be used AFTER authMiddleware (which sets req.user).
// Returns 403 if the authenticated user is not an admin.
const adminMiddleware = async (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

module.exports = adminMiddleware;
