const ictService = require("../services/ictService");
const AppError = require("../utils/AppError");

async function getHealth(req, res) {
  try {
    const health = await ictService.getHealth();
    res.status(health.ok ? 200 : 503).json(health);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function createBackup(req, res) {
  try {
    const backup = await ictService.createBackup(req.user.id);
    res.status(201).json(backup);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Backup failed" });
  }
}

async function listBackups(req, res) {
  try {
    const backups = await ictService.listBackups();
    res.json(backups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function getLatestBackup(req, res) {
  try {
    const latest = await ictService.getLatestBackup();
    res.json(latest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function restoreBackup(req, res) {
  try {
    const result = await ictService.restoreBackup(req.params.id, req.user);
    res.json(result);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Restore failed" });
  }
}

module.exports = {
  getHealth,
  createBackup,
  listBackups,
  getLatestBackup,
  restoreBackup,
};
