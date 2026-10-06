const auditService = require("../services/auditService");

async function listLogs(req, res) {
  try {
    const result = await auditService.listLogs({
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  listLogs,
};
