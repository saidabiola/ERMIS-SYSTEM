const AuditLog = require("../models/AuditLog");

async function create(data) {
  return AuditLog.create(data);
}

async function findPaginated({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(),
  ]);

  return { items, total };
}

async function countSince(date) {
  return AuditLog.countDocuments({ createdAt: { $gte: date } });
}

module.exports = {
  create,
  findPaginated,
  countSince,
};
