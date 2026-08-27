const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository");
const AppError = require("../utils/AppError");

async function listUsers() {
  return userRepository.findAllWithoutPassword();
}

async function createUser({ name, email, password, role }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AppError("Email already exist", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.createUser({
    name,
    email,
    password: hashedPassword,
    role,
    isActive: true,
  });

  const { password: _, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
}

async function updateUser(id, { name, email, role, isActive }) {
  const user = await userRepository.updateById(id, {
    name,
    email,
    role,
    isActive,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

async function deactivateUser(id, currentUserId) {
  if (id === currentUserId) {
    throw new AppError("You cannot deactivate your own account", 400);
  }

  const user = await userRepository.deactivateById(id);

  if (!user) {
    throw new AppError("User not found", 400);
  }

  return { message: "User deactivated successfully", user };
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
};
