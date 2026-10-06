const auditLogRepository = require("../repositories/auditLogRepository");

/**
 * Write one audit event.
 * Never throws to the caller — logging must not break the main action.
 */
async function log({
  action,
  actor,
  resourceType = "record",
  resourceId = "",
  summary,
  metadata = {},
}) {
  try {
    await auditLogRepository.create({
      action,
      actorId: actor?.id || null,
      actorName: actor?.name || "Unknown",
      actorRole: actor?.role || "",
      resourceType,
      resourceId: resourceId ? String(resourceId) : "",
      summary,
      metadata,
    });
  } catch (err) {
    console.error("Audit log write failed:", err.message);
  }
}

/**
 * List recent audit events (for supervisor / admin).
 */
async function listLogs({ page = 1, limit = 20 } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));

  const { items, total } = await auditLogRepository.findPaginated({
    page: safePage,
    limit: safeLimit,
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayCount = await auditLogRepository.countSince(startOfToday);

  return {
    logs: items.map((row) => ({
      id: row._id,
      action: row.action,
      actorName: row.actorName,
      actorRole: row.actorRole,
      resourceType: row.resourceType,
      resourceId: row.resourceId,
      summary: row.summary,
      metadata: row.metadata,
      createdAt: row.createdAt,
    })),
    page: safePage,
    limit: safeLimit,
    total,
    todayCount,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
}

module.exports = {
  log,
  listLogs,
};
