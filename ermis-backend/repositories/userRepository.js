const User = require("../models/User");

async function findActiveByEmail(email) {
  return User.findOne({ email, isActive: true });
}

async function findByEmail(email) {
  return User.findOne({ email });
}

async function findById(id) {
  return User.findById(id);
}

async function findActiveById(id) {
  return User.findOne({ _id: id, isActive: true });
}

async function findAllWithoutPassword() {
  return User.find().select("-password");
}

/** Full user docs including password hashes — for backup/restore only */
async function findAllForBackup() {
  return User.find();
}

/**
 * Upsert by email when restoring from a backup file.
 * Keeps hashed passwords so restored accounts can still log in.
 */
async function upsertFromBackup(userDoc) {
  const existing = await User.findOne({ email: userDoc.email });

  if (existing) {
    existing.name = userDoc.name;
    existing.role = userDoc.role;
    existing.isActive = userDoc.isActive !== false;
    if (userDoc.password) {
      existing.password = userDoc.password;
    }
    await existing.save();
    return existing;
  }

  if (!userDoc.password) {
    // Old backups stripped passwords — cannot create a usable account
    return null;
  }

  return User.create({
    _id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    password: userDoc.password,
    role: userDoc.role,
    isActive: userDoc.isActive !== false,
    createdAt: userDoc.createdAt || Date.now(),
  });
}

async function createUser(data) {
  const user = new User(data);
  await user.save();
  return user;
}

async function updateById(id, data) {
  return User.findByIdAndUpdate(id, data, { new: true }).select("-password");
}

async function deactivateById(id) {
  return User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).select("-password");
}

async function countAll() {
  return User.countDocuments();
}

module.exports = {
  findActiveByEmail,
  findByEmail,
  findById,
  findActiveById,
  findAllWithoutPassword,
  findAllForBackup,
  upsertFromBackup,
  createUser,
  updateById,
  deactivateById,
  countAll,
};
