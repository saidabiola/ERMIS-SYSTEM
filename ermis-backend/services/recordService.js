const recordRepository = require("../repositories/recordRepository");
const approvalRepository = require("../repositories/approvalRepository");
const approvalService = require("./approvalService");
const auditService = require("./auditService");
const storageService = require("./storageService");
const AppError = require("../utils/AppError");

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function buildSearchQuery(search) {
  if (!search || !String(search).trim()) return {};

  const term = String(search).trim();
  const or = [
    { nameOfSchool: { $regex: term, $options: "i" } },
    { schoolCode: { $regex: term, $options: "i" } },
  ];

  const asYear = Number(term);
  if (!Number.isNaN(asYear) && /^\d+$/.test(term)) {
    or.push({ yearOfGraduation: asYear });
  }

  return { $or: or };
}

async function listRecords({ search, page = 1, limit = DEFAULT_LIMIT } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, Number(limit) || DEFAULT_LIMIT));

  const query = buildSearchQuery(search);
  const { items, total } = await recordRepository.findPaginated(query, {
    page: safePage,
    limit: safeLimit,
  });

  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  return {
    records: items,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages,
  };
}

async function getRecordById(id) {
  const record = await recordRepository.findById(id);
  if (!record) {
    throw new AppError("Record not found", 404);
  }
  return record;
}

/**
 * Open attachment for download with role-based rules:
 * - supervisor / admin: may open any attached file (needed to review)
 * - records_officer: only after the record is approved
 *
 * Returns a stream from S3 or local disk via storageService.
 */
async function getFileForDownload(id, actor) {
  const record = await getRecordById(id);

  if (!record.file) {
    throw new AppError("No file attached to this record", 404);
  }

  const role = actor?.role;
  const status = record.status || "approved";
  const canBypassApproval = role === "supervisor" || role === "admin";

  if (!canBypassApproval && status !== "approved") {
    throw new AppError(
      status === "rejected"
        ? "This record was rejected — download is not allowed"
        : "This record is awaiting supervisor approval before it can be downloaded",
      403
    );
  }

  try {
    const { stream, filename, contentType } = await storageService.openDownload(
      record.file
    );
    return { stream, filename, contentType, record };
  } catch (err) {
    console.error("openDownload failed:", err.message);
    throw new AppError("File not found on server", 404);
  }
}

async function createRecord(
  { nameOfSchool, schoolCode, yearOfGraduation, file, uploadedBy },
  actor
) {
  const year = Number(yearOfGraduation);
  const clash = await recordRepository.findBySchoolCodeAndYear(schoolCode, year);
  if (clash) {
    throw new AppError(
      `A record for school code ${schoolCode} already exists for year ${year}`,
      400
    );
  }

  let fileKey = null;
  if (file) {
    fileKey = await storageService.saveUpload(file);
  }

  const record = await recordRepository.create({
    nameOfSchool,
    schoolCode,
    yearOfGraduation: year,
    file: fileKey || "",
    uploadedBy,
    status: "pending",
  });

  await approvalService.requestPublish({ record, actor });

  await auditService.log({
    action: "RECORD_CREATED",
    actor,
    resourceType: "record",
    resourceId: record._id,
    summary: `Uploaded record`,
    metadata: {
      nameOfSchool,
      schoolCode,
      yearOfGraduation: year,
      hasFile: Boolean(fileKey),
      status: "pending",
      storage: storageService.isS3Enabled() ? "s3" : "local",
    },
  });

  return record;
}

async function updateRecord(
  id,
  { nameOfSchool, schoolCode, yearOfGraduation, file },
  actor
) {
  const existing = await recordRepository.findById(id);
  if (!existing) {
    throw new AppError("Record not found", 404);
  }

  const nextCode = schoolCode ?? existing.schoolCode;
  const nextYear = Number(yearOfGraduation ?? existing.yearOfGraduation);

  const clash = await recordRepository.findBySchoolCodeAndYear(nextCode, nextYear);
  if (clash && String(clash._id) !== String(id)) {
    throw new AppError(
      `A record for school code ${nextCode} already exists for year ${nextYear}`,
      400
    );
  }

  const updates = {
    nameOfSchool,
    schoolCode: nextCode,
    yearOfGraduation: nextYear,
  };

  if (file) {
    const newKey = await storageService.saveUpload(file);
    if (existing.file) {
      await storageService.deleteObject(existing.file);
    }
    updates.file = newKey;
  }

  const updated = await recordRepository.updateById(id, updates);

  await auditService.log({
    action: "RECORD_UPDATED",
    actor,
    resourceType: "record",
    resourceId: id,
    summary: `Updated record`,
    metadata: {
      nameOfSchool: updates.nameOfSchool,
      schoolCode: updates.schoolCode,
      yearOfGraduation: updates.yearOfGraduation,
      fileReplaced: Boolean(file),
    },
  });

  return updated;
}

async function deleteRecord(id, actor) {
  const existing = await recordRepository.findById(id);
  if (!existing) {
    throw new AppError("Record not found", 404);
  }

  await recordRepository.deleteById(id);
  await approvalRepository.deleteByRecordId(id);

  if (existing.file) {
    await storageService.deleteObject(existing.file);
  }

  await auditService.log({
    action: "RECORD_DELETED",
    actor,
    resourceType: "record",
    resourceId: id,
    summary: `Deleted record`,
    metadata: {
      nameOfSchool: existing.nameOfSchool,
      schoolCode: existing.schoolCode,
      yearOfGraduation: existing.yearOfGraduation,
    },
  });

  return { message: "Record deleted successfully" };
}

module.exports = {
  listRecords,
  getRecordById,
  getFileForDownload,
  createRecord,
  updateRecord,
  deleteRecord,
};
