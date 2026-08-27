function validateCreateUserBody(body) {
  const { name, email, password, role } = body || {};
  return { name, email, password, role };
}

function validateUpdateUserBody(body) {
  const { name, email, role, isActive } = body || {};
  return { name, email, role, isActive };
}

module.exports = {
  validateCreateUserBody,
  validateUpdateUserBody,
};
