const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");
const userRepository = require("../repositories/userRepository");
const recordRepository = require("../repositories/recordRepository");
const backupRepository = require("../repositories/backupRepository");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");

const BACKUPS_DIR = path.join(__dirname, "..", "backups");

async function getHealth() {
  const dbReady = mongoose.connection.readyState === 1;

  const [usersCount, recordsCount] = await Promise.all([
    userRepository.countAll(),
    recordRepository.countAll(),
  ]);

  return {
    server: "online",
    database: dbReady ? "online" : "error",
    ok: dbReady,
    stats: {
      users: usersCount,
      records: recordsCount,
    },
    meta: {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
    },
  };
}

/**
 * Create a JSON backup of users (with password hashes) + records.
 */
async function createBackup(userId) {
  try {
    await fs.mkdir(BACKUPS_DIR, { recursive: true });

    const [users, records] = await Promise.all([
      userRepository.findAllForBackup(),
      recordRepository.findAll(),
    ]);

    const payload = {
      createdAt: new Date().toISOString(),
      users,
      records,
    };

    const fileName = `backup-${Date.now()}.json`;
    const filePath = path.join(BACKUPS_DIR, fileName);
    const json = JSON.stringify(payload, null, 2);

    await fs.writeFile(filePath, json, "utf8");

    const sizeBytes = Buffer.byteLength(json, "utf8");

    const backup = await backupRepository.create({
      status: "success",
      filePath: fileName,
      sizeBytes,
      createdBy: userId || null,
    });

    return {
      id: backup._id,
      status: backup.status,
      filePath: backup.filePath,
      sizeBytes: backup.sizeBytes,
      createdAt: backup.createdAt,
    };
  } catch (err) {
    await backupRepository.create({
      status: "failed",
      filePath: "",
      sizeBytes: 0,
      createdBy: userId || null,
      errorMessage: err.message || "Backup failed",
    });
    throw err;
  }
}

async function listBackups() {
  const rows = await backupRepository.findAll();

  return rows.map((b) => ({
    id: b._id,
    status: b.status,
    filePath: b.filePath,
    sizeBytes: b.sizeBytes,
    errorMessage: b.errorMessage,
    createdAt: b.createdAt,
  }));
}

async function getLatestBackup() {
  const latest = await backupRepository.findLatestSuccess();
  if (!latest) return null;

  return {
    id: latest._id,
    status: latest.status,
    filePath: latest.filePath,
    sizeBytes: latest.sizeBytes,
    createdAt: latest.createdAt,
  };
}

/**
 * Restore users + records from a successful backup file.
 * - Users: upsert by email (does not delete extra users)
 * - Records: replace all current records with backup contents
 * Uploaded binary files on disk are NOT restored (filenames only).
 */
async function restoreBackup(backupId, actor) {
  const backup = await backupRepository.findById(backupId);
  if (!backup || backup.status !== "success" || !backup.filePath) {
    throw new AppError("Backup not found or cannot be restored", 404);
  }

  const fullPath = path.join(BACKUPS_DIR, backup.filePath);
  let payload;
  try {
    const raw = await fs.readFile(fullPath, "utf8");
    payload = JSON.parse(raw);
  } catch (_) {
    throw new AppError("Backup file missing or unreadable", 404);
  }

  const users = Array.isArray(payload.users) ? payload.users : [];
  const records = Array.isArray(payload.records) ? payload.records : [];

  let usersUpserted = 0;
  let usersSkipped = 0;

  for (const userDoc of users) {
    const result = await userRepository.upsertFromBackup(userDoc);
    if (result) usersUpserted += 1;
    else usersSkipped += 1;
  }

  await recordRepository.deleteAll();

  const recordDocs = records.map((r) => ({
    _id: r._id,
    nameOfSchool: r.nameOfSchool,
    schoolCode: r.schoolCode,
    yearOfGraduation: r.yearOfGraduation,
    file: r.file || "",
    status: r.status || "approved",
    uploadedBy: r.uploadedBy || undefined,
    role: r.role,
    createdAt: r.createdAt || new Date(),
  }));

  if (recordDocs.length) {
    await recordRepository.insertMany(recordDocs);
  }

  await auditService.log({
    action: "BACKUP_RESTORED",
    actor,
    resourceType: "backup",
    resourceId: backupId,
    summary: "Restored database from backup",
    metadata: {
      filePath: backup.filePath,
      usersUpserted,
      usersSkipped,
      recordsRestored: recordDocs.length,
    },
  });

  return {
    message: "Restore completed",
    backupId,
    usersUpserted,
    usersSkipped,
    recordsRestored: recordDocs.length,
    note:
      "Uploaded files on disk are not restored — only database records/users. Create a fresh backup after major restores.",
  };
}

module.exports = {
  getHealth,
  createBackup,
  listBackups,
  getLatestBackup,
  restoreBackup,
};
