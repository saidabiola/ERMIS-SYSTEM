const mongoose = require("mongoose");

/**
 * Supervisor review queue.
 * Created when a records officer uploads a record (RECORD_PUBLISH).
 */
const approvalSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["RECORD_PUBLISH"],
    default: "RECORD_PUBLISH",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    index: true,
  },
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Record",
    required: true,
    index: true,
  },
  nameOfSchool: { type: String, default: "" },
  schoolCode: { type: String, default: "" },
  yearOfGraduation: { type: Number },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  requestedByName: { type: String, default: "Unknown" },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  reviewedByName: { type: String, default: "" },
  reviewNote: { type: String, default: "" },
  reviewedAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model("Approval", approvalSchema);
