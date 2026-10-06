const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  nameOfSchool: {
    type: String,
    required: true,
    trim: true,
  },
  schoolCode: {
    type: String,
    required: true,
    trim: true,
    // NOT unique alone — same school can have many years
  },
  yearOfGraduation: {
    type: Number,
    required: true,
  },
  file: {
    type: String,
    default: "",
  },
  /**
   * Supervisor publish workflow:
   * pending → awaiting review after officer upload
   * approved → accepted into the official set
   * rejected → declined by supervisor
   * Existing records without a status behave as approved (default).
   */
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved",
    index: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  role: {
    type: String,
    enum: ["RECORDS OFFICER", "SUPERVISOR", "ICT OFFICER", "ADMIN"],
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Same school code + same year = duplicate; different years = OK
recordSchema.index(
  { schoolCode: 1, yearOfGraduation: 1 },
  { unique: true }
);

module.exports = mongoose.model("Record", recordSchema);
