const approvalService = require("../services/approvalService");
const AppError = require("../utils/AppError");

async function listApprovals(req, res) {
  try {
    const result = await approvalService.listApprovals({
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function approve(req, res) {
  try {
    const result = await approvalService.approve(
      req.params.id,
      req.user,
      req.body?.reviewNote
    );
    res.json(result);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function reject(req, res) {
  try {
    const result = await approvalService.reject(
      req.params.id,
      req.user,
      req.body?.reviewNote
    );
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
  listApprovals,
  approve,
  reject,
};
