const Record = require("../models/Record");

async function findAll(query = {}) {
  return Record.find(query).sort({ createdAt: -1 });
}

async function findById(id) {
  return Record.findById(id);
}

async function create(data) {
  const record = new Record(data);
  await record.save();
  return record;
}

module.exports = {
  findAll,
  findById,
  create,
};
