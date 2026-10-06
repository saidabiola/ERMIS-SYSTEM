const mongoose = require("mongoose");

/**
 * Immutable-ish activity log for production accountability.
 * One document = one action by one user at one time.
 */
const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      "RECORD_CREATED",
      "RECORD_UPDATED",
      "RECORD_DELETED",
      "RECORD_APPROVED",
      "RECORD_REJECTED",
      "BACKUP_RESTORED",
    ],
    index: true,
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  actorName: {
    type: String,
    default: "Unknown",
  },
  actorRole: {
    type: String,
    default: "",
  },
  resourceType: {
    type: String,
    default: "record",
  },
  resourceId: {
    type: String,
    default: "",
  },
  /** Short human-readable line for dashboards */
  summary: {
    type: String,
    required: true,
  },
  /** Optional extras (school code, year, etc.) */
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
