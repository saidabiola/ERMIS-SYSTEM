const approvalRepository = require("../repositories/approvalRepository");
const recordRepository = require("../repositories/recordRepository");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");

function toDto(row) {
  return {
    id: row._id,
    type: row.type,
    status: row.status,
    recordId: row.recordId,
    nameOfSchool: row.nameOfSchool,
    schoolCode: row.schoolCode,
    yearOfGraduation: row.yearOfGraduation,
    requestedByName: row.requestedByName,
    reviewedByName: row.reviewedByName,
    reviewNote: row.reviewNote,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
  };
}

/**
 * Open a RECORD_PUBLISH approval after an officer uploads a record.
 */
async function requestPublish({ record, actor }) {
  return approvalRepository.create({
    type: "RECORD_PUBLISH",
    status: "pending",
    recordId: record._id,
    nameOfSchool: record.nameOfSchool,
    schoolCode: record.schoolCode,
    yearOfGraduation: record.yearOfGraduation,
    requestedBy: actor?.id || null,
    requestedByName: actor?.name || "Unknown",
  });
}

async function listApprovals({ status = "pending", page = 1, limit = 20 } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));

  const query = {};
  if (status && status !== "all") {
    query.status = status;
  }

  const { items, total } = await approvalRepository.findPaginated(query, {
    page: safePage,
    limit: safeLimit,
  });

  const pendingCount = await approvalRepository.countByStatus("pending");

  return {
    approvals: items.map(toDto),
    page: safePage,
    limit: safeLimit,
    total,
    pendingCount,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
}

async function approve(id, actor, reviewNote = "") {
  const approval = await approvalRepository.findById(id);
  if (!approval) {
    throw new AppError("Approval not found", 404);
  }
  if (approval.status !== "pending") {
    throw new AppError("This request has already been reviewed", 400);
  }

  const updated = await approvalRepository.updateById(id, {
    status: "approved",
    reviewedBy: actor?.id || null,
    reviewedByName: actor?.name || "Unknown",
    reviewNote: reviewNote || "",
    reviewedAt: new Date(),
  });

  await recordRepository.updateById(approval.recordId, { status: "approved" });

  await auditService.log({
    action: "RECORD_APPROVED",
    actor,
    resourceType: "record",
    resourceId: approval.recordId,
    summary: "Approved record",
    metadata: {
      nameOfSchool: approval.nameOfSchool,
      schoolCode: approval.schoolCode,
      yearOfGraduation: approval.yearOfGraduation,
      approvalId: String(id),
    },
  });

  return toDto(updated);
}

async function reject(id, actor, reviewNote = "") {
  const approval = await approvalRepository.findById(id);
  if (!approval) {
    throw new AppError("Approval not found", 404);
  }
  if (approval.status !== "pending") {
    throw new AppError("This request has already been reviewed", 400);
  }

  const updated = await approvalRepository.updateById(id, {
    status: "rejected",
    reviewedBy: actor?.id || null,
    reviewedByName: actor?.name || "Unknown",
    reviewNote: reviewNote || "",
    reviewedAt: new Date(),
  });

  await recordRepository.updateById(approval.recordId, { status: "rejected" });

  await auditService.log({
    action: "RECORD_REJECTED",
    actor,
    resourceType: "record",
    resourceId: approval.recordId,
    summary: "Rejected record",
    metadata: {
      nameOfSchool: approval.nameOfSchool,
      schoolCode: approval.schoolCode,
      yearOfGraduation: approval.yearOfGraduation,
      approvalId: String(id),
      reviewNote: reviewNote || "",
    },
  });

  return toDto(updated);
}

module.exports = {
  requestPublish,
  listApprovals,
  approve,
  reject,
};
