const recordService = require("../services/recordService");
const { validateCreateRecordBody } = require("../validators/recordValidator");
const AppError = require("../utils/AppError");

async function listRecords(req, res) {
  try {
    const records = await recordService.listRecords(req.query.search);
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function createRecord(req, res) {
  try {
    const fields = validateCreateRecordBody(req.body);
    const record = await recordService.createRecord({
      ...fields,
      file: req.file ? req.file.filename : null,
      uploadedBy: req.user.id,
    });
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function getRecord(req, res) {
  try {
    const record = await recordService.getRecordById(req.params.id);
    res.json(record);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  listRecords,
  createRecord,
  getRecord,
};
