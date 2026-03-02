const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
  }

  },
  {
    timestamps: true
  }
);


module.exports = mongoose.model("Folder", folderSchema);
