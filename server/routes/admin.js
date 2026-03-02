const express = require("express");
const User = require("../models/User");
const Note = require("../models/Note");
const Folder = require("../models/Folder");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// All admin routes require both auth + admin flag
router.use(authMiddleware, adminMiddleware);

// ── GET /api/admin/users ─────────────────────────────────────────────
// Returns list of all users with their note count and last login info
router.get("/users", async (req, res) => {
    try {
        const users = await User.find({})
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        // Get note count per user in one aggregation query
        const noteCounts = await Note.aggregate([
            { $group: { _id: "$userId", count: { $sum: 1 } } },
        ]);
        const countMap = {};
        noteCounts.forEach((item) => {
            countMap[item._id.toString()] = item.count;
        });

        const usersWithStats = users.map((u) => ({
            ...u,
            noteCount: countMap[u._id.toString()] || 0,
        }));

        res.json(usersWithStats);
    } catch (err) {
        console.error("Admin users error:", err.message);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// ── GET /api/admin/users/:userId/notes ──────────────────────────────
// Returns all notes for a specific user
router.get("/users/:userId/notes", async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        const notes = await Note.find({ userId }).sort({ updatedAt: -1 }).lean();

        res.json({ user, notes });
    } catch (err) {
        console.error("Admin notes error:", err.message);
        res.status(500).json({ message: "Failed to fetch notes" });
    }
});

// ── DELETE /api/admin/users/:userId ─────────────────────────────────
// Deletes a user and all their notes and folders
router.delete("/users/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent admin from deleting their own account
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot delete your own admin account" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        await Note.deleteMany({ userId });
        await Folder.deleteMany({ userId });
        await User.findByIdAndDelete(userId);

        res.json({ message: `User "${user.name}" and all their data has been deleted` });
    } catch (err) {
        console.error("Admin delete user error:", err.message);
        res.status(500).json({ message: "Failed to delete user" });
    }
});

module.exports = router;
