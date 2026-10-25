const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");
const userRepository = require("../repositories/userRepository");
const recordRepository = require("../repositories/recordRepository");
const backupRepository = require("../repositories/backupRepository");
const auditService = require("./auditService");
const storageService = require("./storageService");
const AppError = require("../utils/AppError");

const BACKUPS_DIR = path.join(__dirname, "..", "backups");

function snapshotKeyFor(fileName, objectKey) {
  const folder = String(fileName).replace(/\.json$/, "");
  return `backups/files/${folder}/${objectKey}`;
}

function manifestKeyFor(fileName) {
  return `backups/manifests/${fileName}`;
}

/**
 * Copy one attachment into the backup snapshot.
 * S3: another object in the same bucket. Local: a file under backups/.
 */
async function snapshotAttachment(liveKey, snapshotKey) {
  if (!liveKey) return false;

  if (storageService.isS3Enabled()) {
    return storageService.copyObject(liveKey, snapshotKey);
  }

  const src = path.join(storageService.UPLOADS_DIR, liveKey);
  const dest = path.join(BACKUPS_DIR, snapshotKey);
  try {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
    return true;
  } catch (err) {
    if (err && err.code === "ENOENT") return false;
    throw err;
  }
}

async function restoreAttachment(snapshotKey, liveKey) {
  if (!liveKey || !snapshotKey) return false;

  if (storageService.isS3Enabled()) {
    return storageService.copyObject(snapshotKey, liveKey);
  }

  const src = path.join(BACKUPS_DIR, snapshotKey);
  const dest = path.join(storageService.UPLOADS_DIR, liveKey);
  try {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
    return true;
  } catch (err) {
    if (err && err.code === "ENOENT") return false;
    throw err;
  }
}

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

    const fileName = `backup-${Date.now()}.json`;

    let filesCopied = 0;
    let filesMissing = 0;
    for (const record of records) {
      if (!record.file) continue;
      try {
        const ok = await snapshotAttachment(
          record.file,
          snapshotKeyFor(fileName, record.file)
        );
        if (ok) filesCopied += 1;
        else filesMissing += 1;
      } catch (copyErr) {
        console.error("Backup file snapshot failed:", record.file, copyErr.message);
        filesMissing += 1;
      }
    }

    const payload = {
      createdAt: new Date().toISOString(),
      storage: storageService.isS3Enabled() ? "s3" : "local",
      filesCopied,
      filesMissing,
      users,
      records,
    };

    const filePath = path.join(BACKUPS_DIR, fileName);
    const json = JSON.stringify(payload, null, 2);

    await fs.writeFile(filePath, json, "utf8");

    if (storageService.isS3Enabled()) {
      await storageService.writeBuffer(
        manifestKeyFor(fileName),
        Buffer.from(json, "utf8"),
        "application/json"
      );
    }

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
      filesCopied,
      filesMissing,
      storage: payload.storage,
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
 * Attachments are copied back from the snapshot taken with this backup
 * (S3 prefix or local backups/ folder). Older backups have no snapshot.
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
    const remote = storageService.isS3Enabled()
      ? await storageService.readBuffer(manifestKeyFor(backup.filePath))
      : null;
    if (!remote) {
      throw new AppError("Backup file missing or unreadable", 404);
    }
    payload = JSON.parse(remote.toString("utf8"));
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

  let filesRestored = 0;
  let filesMissing = 0;
  for (const record of recordDocs) {
    if (!record.file) continue;
    const ok = await restoreAttachment(
      snapshotKeyFor(backup.filePath, record.file),
      record.file
    );
    if (ok) filesRestored += 1;
    else filesMissing += 1;
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
      filesRestored,
      filesMissing,
    },
  });

  return {
    message: "Restore completed",
    backupId,
    usersUpserted,
    usersSkipped,
    recordsRestored: recordDocs.length,
    filesRestored,
    filesMissing,
    note:
      filesRestored > 0
        ? "Database and attachment snapshots were restored."
        : "Database restored. This backup had no attachment snapshot (created before file backups). Live S3 files were left as they are.",
  };
}

module.exports = {
  getHealth,
  createBackup,
  listBackups,
  getLatestBackup,
  restoreBackup,
};
