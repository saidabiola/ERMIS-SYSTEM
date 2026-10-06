const Record = require("../models/Record");

async function findAll(query = {}) {
  return Record.find(query).sort({ createdAt: -1 });
}

/**
 * Page of records + total matching count
 * skip = how many to jump over; limit = page size.
 */
async function findPaginated(query = {}, { page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Record.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Record.countDocuments(query),
  ]);

  return { items, total };
}

async function findById(id) {
  return Record.findById(id);
}

async function create(data) {
  const record = new Record(data);
  await record.save();
  return record;
}

async function deleteAll() {
  return Record.deleteMany({});
}

async function insertMany(docs) {
  if (!docs.length) return [];
  return Record.insertMany(docs, { ordered: false });
}

async function updateById(id, data) {
  return Record.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

async function deleteById(id) {
  return Record.findByIdAndDelete(id);
}

async function findBySchoolCodeAndYear(schoolCode, yearOfGraduation) {
  return Record.findOne({
    schoolCode,
    yearOfGraduation: Number(yearOfGraduation),
  });
}

async function countAll() {
  return Record.countDocuments();
}

module.exports = {
  findAll,
  findPaginated,
  findById,
  create,
  deleteAll,
  insertMany,
  updateById,
  deleteById,
  findBySchoolCodeAndYear,
  countAll,
};
