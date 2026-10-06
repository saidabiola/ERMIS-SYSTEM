const Backup = require("../models/Backup");

async function create(data) {
  return Backup.create(data);
}

/** Newest first — for history list */
async function findAll() {
  return Backup.find().sort({ createdAt: -1 });
}

/** Most recent successful backup — for the "Last backup" tile */
async function findLatestSuccess() {
  return Backup.findOne({ status: "success" }).sort({ createdAt: -1 });
}

async function findById(id) {
  return Backup.findById(id);
}

module.exports = {
  create,
  findAll,
  findLatestSuccess,
  findById,
};
