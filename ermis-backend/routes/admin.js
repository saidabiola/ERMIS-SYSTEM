const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

// All routes below require a valid token and admin role
router.use(protect);
router.use(restrictTo("admin"));

router.get("/users", adminController.listUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deactivateUser);

module.exports = router;
