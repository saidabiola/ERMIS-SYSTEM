const Approval = require("../models/Approval");

async function create(data) {
  return Approval.create(data);
}

async function findById(id) {
  return Approval.findById(id);
}

async function findPaginated(query = {}, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Approval.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Approval.countDocuments(query),
  ]);
  return { items, total };
}

async function countByStatus(status) {
  return Approval.countDocuments({ status });
}

async function updateById(id, data) {
  return Approval.findByIdAndUpdate(id, data, { new: true });
}

async function deleteByRecordId(recordId) {
  return Approval.deleteMany({ recordId });
}

module.exports = {
  create,
  findById,
  findPaginated,
  countByStatus,
  updateById,
  deleteByRecordId,
};
