const recordRepository = require("../repositories/recordRepository");
const AppError = require("../utils/AppError");

async function listRecords(search) {
  let query = {};

  if (search) {
    query = {
      $or: [
        { nameOfSchool: { $regex: search, $options: "i" } },
        { schoolCode: { $regex: search, $options: "i" } },
        { yearOfGraduation: { $regex: search, $options: "i" } },
      ],
    };
  }

  return recordRepository.findAll(query);
}

async function getRecordById(id) {
  const record = await recordRepository.findById(id);
  if (!record) {
    throw new AppError("Record not found", 404);
  }
  return record;
}

async function createRecord({ nameOfSchool, schoolCode, yearOfGraduation, file, uploadedBy }) {
  return recordRepository.create({
    nameOfSchool,
    schoolCode,
    yearOfGraduation,
    file: file || null,
    uploadedBy,
  });
}

module.exports = {
  listRecords,
  getRecordById,
  createRecord,
};
