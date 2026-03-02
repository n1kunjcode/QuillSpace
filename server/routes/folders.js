const express = require("express");
const Folder = require("../models/Folder");
const Note = require("../models/Note");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/*
  CREATE FOLDER
*/
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Folder name required" });
    }

    const folder = new Folder({
      name: name.trim(),
      userId: req.user._id
    });

    await folder.save();

    res.status(201).json(folder);
  } catch (err) {
    console.error("CREATE FOLDER ERROR:", err);
    res.status(500).json({ message: "Failed to create folder" });
  }
});

/*
  GET ALL FOLDERS
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const folders = await Folder.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    res.json(folders);
  } catch (err) {
    console.error("FETCH FOLDER ERROR:", err);
    res.status(500).json({ message: "Failed to fetch folders" });
  }
});

/*
  DELETE FOLDER
  - Instead of deleting notes,
    we move them to loose (folderId = null)
*/
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // 🔥 DELETE ALL NOTES IN THIS FOLDER
    await Note.deleteMany({
      folderId: folder._id,
      userId: req.user._id
    });

    await folder.deleteOne();

    res.json({ message: "Folder and its notes deleted" });
  } catch (err) {
    console.error("DELETE FOLDER ERROR:", err);
    res.status(500).json({ message: "Failed to delete folder" });
  }
});

/*
  RENAME FOLDER
*/
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Folder name required" });
    }

    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name: name.trim() },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    res.json(folder);
  } catch (err) {
    console.error("RENAME FOLDER ERROR:", err);
    res.status(500).json({ message: "Failed to rename folder" });
  }
});

module.exports = router;
