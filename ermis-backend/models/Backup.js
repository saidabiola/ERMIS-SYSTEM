const mongoose = require("mongoose");

/**
 * One row per backup job — so ICT can see history later.
 * The actual dump lives on disk (filePath); this doc is the metadata.
 */
const backupSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["success", "failed"],
    required: true,
  },
  filePath: {
    type: String,
    default: "",
  },
  sizeBytes: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  errorMessage: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Backup", backupSchema);
