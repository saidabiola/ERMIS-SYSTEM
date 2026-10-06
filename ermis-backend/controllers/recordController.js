const recordService = require("../services/recordService");
const {
  validateCreateRecordBody,
  validateUpdateRecordBody,
} = require("../validators/recordValidator");
const AppError = require("../utils/AppError");

async function listRecords(req, res) {
  try {
    const result = await recordService.listRecords({
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function createRecord(req, res) {
  try {
    const fields = validateCreateRecordBody(req.body);
    const record = await recordService.createRecord(
      {
        ...fields,
        file: req.file || null,
        uploadedBy: req.user.id,
      },
      req.user
    );
    res.status(201).json(record);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    if (err && err.code === 11000) {
      return res.status(400).json({
        message: "A record with this school code and year already exists",
      });
    }
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

async function downloadFile(req, res) {
  try {
    const { stream, filename, contentType } =
      await recordService.getFileForDownload(req.params.id, req.user);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename.replace(/"/g, "")}"`
    );
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    // AWS SDK v3 Body is async iterable / stream
    if (stream && typeof stream.pipe === "function") {
      return stream.pipe(res);
    }

    // Fallback: web stream / async iterable
    const { Readable } = require("stream");
    const nodeStream =
      typeof Readable.fromWeb === "function" && stream?.getReader
        ? Readable.fromWeb(stream)
        : Readable.from(stream);
    return nodeStream.pipe(res);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function updateRecord(req, res) {
  try {
    const fields = validateUpdateRecordBody(req.body);
    const record = await recordService.updateRecord(
      req.params.id,
      {
        ...fields,
        file: req.file || undefined,
      },
      req.user
    );
    res.json(record);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    if (err && err.code === 11000) {
      return res.status(400).json({
        message: "A record with this school code and year already exists",
      });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function deleteRecord(req, res) {
  try {
    const result = await recordService.deleteRecord(req.params.id, req.user);
    res.json(result);
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
  downloadFile,
  updateRecord,
  deleteRecord,
};
