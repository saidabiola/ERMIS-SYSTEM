const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

function isS3Enabled() {
  return Boolean(process.env.S3_BUCKET && String(process.env.S3_BUCKET).trim());
}

function getBucket() {
  return String(process.env.S3_BUCKET).trim();
}

function getRegion() {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "af-south-1";
}

let s3Client = null;

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({ region: getRegion() });
  }
  return s3Client;
}

/** Build a stable object key / relative path for a new upload */
function makeKey(originalname) {
  const ext = path.extname(originalname || "") || "";
  return `records/${Date.now()}${ext}`;
}

/**
 * Resolve a local path under uploads/ without path traversal.
 */
function localPathForKey(key) {
  const safe = path.normalize(String(key)).replace(/^(\.\.(\/|\\|$))+/g, "");
  const full = path.join(UPLOADS_DIR, safe);
  if (path.relative(UPLOADS_DIR, full).startsWith("..")) {
    throw new Error("Invalid storage key");
  }
  return full;
}

/**
 * Persist a multer file (memory: buffer, or disk: path) and return the storage key.
 */
async function saveUpload(file) {
  if (!file) return null;

  const key = makeKey(file.originalname);
  const contentType = file.mimetype || "application/octet-stream";

  if (isS3Enabled()) {
    const body = file.buffer
      ? file.buffer
      : fs.createReadStream(file.path);

    await getS3Client().send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );

    // Clean up temp disk file if multer wrote one
    if (file.path) {
      try {
        await fsPromises.unlink(file.path);
      } catch (_) {
        /* ignore */
      }
    }

    return key;
  }

  // Local disk
  const dest = localPathForKey(key);
  await fsPromises.mkdir(path.dirname(dest), { recursive: true });

  if (file.buffer) {
    await fsPromises.writeFile(dest, file.buffer);
  } else if (file.path) {
    await fsPromises.rename(file.path, dest).catch(async () => {
      await fsPromises.copyFile(file.path, dest);
      await fsPromises.unlink(file.path);
    });
  } else {
    throw new Error("Upload has no buffer or path");
  }

  return key;
}

/**
 * Open a readable stream for download.
 * @returns {{ stream, filename, contentType }}
 */
async function openDownload(key) {
  if (!key) {
    throw new Error("Missing storage key");
  }

  const filename = path.basename(key);

  if (isS3Enabled()) {
    const out = await getS3Client().send(
      new GetObjectCommand({
        Bucket: getBucket(),
        Key: key,
      })
    );
    return {
      stream: out.Body,
      filename,
      contentType: out.ContentType || "application/octet-stream",
    };
  }

  const filePath = localPathForKey(key);
  await fsPromises.access(filePath);
  return {
    stream: fs.createReadStream(filePath),
    filename,
    contentType: "application/octet-stream",
  };
}

/**
 * Copy an existing stored object to another key.
 * Uses Get + Put so the current IAM policy (no s3:CopyObject) is enough.
 * Returns false when the source is missing.
 */
async function copyObject(sourceKey, destKey) {
  if (!sourceKey || !destKey || sourceKey === destKey) return false;

  if (isS3Enabled()) {
    try {
      const out = await getS3Client().send(
        new GetObjectCommand({
          Bucket: getBucket(),
          Key: sourceKey,
        })
      );
      await getS3Client().send(
        new PutObjectCommand({
          Bucket: getBucket(),
          Key: destKey,
          Body: out.Body,
          ContentType: out.ContentType || "application/octet-stream",
        })
      );
      return true;
    } catch (err) {
      if (err && (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404)) {
        return false;
      }
      throw err;
    }
  }

  try {
    const src = localPathForKey(sourceKey);
    const dest = localPathForKey(destKey);
    await fsPromises.mkdir(path.dirname(dest), { recursive: true });
    await fsPromises.copyFile(src, dest);
    return true;
  } catch (err) {
    if (err && err.code === "ENOENT") return false;
    throw err;
  }
}

async function writeBuffer(key, buffer, contentType = "application/json") {
  if (isS3Enabled()) {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return;
  }

  const dest = localPathForKey(key);
  await fsPromises.mkdir(path.dirname(dest), { recursive: true });
  await fsPromises.writeFile(dest, buffer);
}

async function readBuffer(key) {
  if (isS3Enabled()) {
    try {
      const out = await getS3Client().send(
        new GetObjectCommand({
          Bucket: getBucket(),
          Key: key,
        })
      );
      const chunks = [];
      for await (const chunk of out.Body) chunks.push(chunk);
      return Buffer.concat(chunks);
    } catch (err) {
      if (err && (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404)) {
        return null;
      }
      throw err;
    }
  }

  try {
    return await fsPromises.readFile(localPathForKey(key));
  } catch (err) {
    if (err && err.code === "ENOENT") return null;
    throw err;
  }
}

async function deleteObject(key) {
  if (!key) return;

  if (isS3Enabled()) {
    try {
      await getS3Client().send(
        new DeleteObjectCommand({
          Bucket: getBucket(),
          Key: key,
        })
      );
    } catch (_) {
      /* ignore missing */
    }
    return;
  }

  try {
    await fsPromises.unlink(localPathForKey(key));
  } catch (_) {
    /* ignore missing */
  }
}

module.exports = {
  isS3Enabled,
  makeKey,
  saveUpload,
  openDownload,
  copyObject,
  writeBuffer,
  readBuffer,
  deleteObject,
  UPLOADS_DIR,
};
