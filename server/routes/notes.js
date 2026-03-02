const express = require("express");
const Note = require("../models/Note");
const authMiddleware = require("../middleware/auth");
const Folder = require("../models/Folder");

const router = express.Router();

const TITLE_MAX = 500;
const CONTENT_MAX = 500 * 1024; // 500 KB in characters

// ── CREATE ────────────────────────────────────────────────────────
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, folderId } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (title.length > TITLE_MAX) {
      return res.status(400).json({ message: `Title must be under ${TITLE_MAX} characters` });
    }
    if (content && content.length > CONTENT_MAX) {
      return res.status(400).json({ message: "Note content is too large" });
    }

    const note = await Note.create({
      title,
      content: content || "",
      folderId: folderId || null,
      userId: req.user._id,
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to create note" });
  }
});

// ── GET ALL ───────────────────────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { folderId } = req.query;

    const filter = { userId: req.user._id };
    if (folderId) filter.folderId = folderId;

    const notes = await Note.find(filter).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

// ── GET ONE ───────────────────────────────────────────────────────
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });

    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.folderId) {
      await Folder.findByIdAndUpdate(note.folderId, { lastAccessedAt: new Date() });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch note" });
  }
});

// ── UPDATE (full replace) ─────────────────────────────────────────
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content, folderId } = req.body;

    if (title && title.length > TITLE_MAX) {
      return res.status(400).json({ message: `Title must be under ${TITLE_MAX} characters` });
    }
    if (content && content.length > CONTENT_MAX) {
      return res.status(400).json({ message: "Note content is too large" });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, content, folderId, updatedAt: new Date() },
      { new: true }
    );

    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to update note" });
  }
});

// ── PATCH (partial update / autosave) ────────────────────────────
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content, folderId, attachments } = req.body;

    if (title !== undefined && title.length > TITLE_MAX) {
      return res.status(400).json({ message: `Title must be under ${TITLE_MAX} characters` });
    }
    if (content !== undefined && content.length > CONTENT_MAX) {
      return res.status(400).json({ message: "Note content is too large" });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;
    if (folderId !== undefined) updateFields.folderId = folderId;
    if (attachments !== undefined) updateFields.attachments = attachments;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateFields,
      { new: true }
    );

    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to update note" });
  }
});

// ── DELETE ────────────────────────────────────────────────────────
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete note" });
  }
});

module.exports = router;
