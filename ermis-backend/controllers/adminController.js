const adminService = require("../services/adminService");
const {
  validateCreateUserBody,
  validateUpdateUserBody,
} = require("../validators/adminValidator");
const AppError = require("../utils/AppError");

async function listUsers(req, res) {
  try {
    const users = await adminService.listUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function createUser(req, res) {
  try {
    const data = validateCreateUserBody(req.body);
    const user = await adminService.createUser(data);
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function updateUser(req, res) {
  try {
    const data = validateUpdateUserBody(req.body);
    const user = await adminService.updateUser(req.params.id, data);
    res.json(user);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function deactivateUser(req, res) {
  try {
    const result = await adminService.deactivateUser(
      req.params.id,
      req.user.id
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
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
};
