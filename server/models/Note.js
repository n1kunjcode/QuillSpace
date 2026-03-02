const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      default: ""
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null
    },
    attachments: [
      {
        originalName: String,
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]

  },

  {
    timestamps: true
  },


);

module.exports = mongoose.model("Note", noteSchema);
