function validateLoginBody(body) {
  const { email, password } = body || {};
  return { email, password };
}

module.exports = { validateLoginBody };
