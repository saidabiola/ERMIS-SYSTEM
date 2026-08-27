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

module.exports = {
  findActiveByEmail,
  findByEmail,
  findById,
  findActiveById,
  findAllWithoutPassword,
  createUser,
  updateById,
  deactivateById,
};
