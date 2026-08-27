function validateCreateRecordBody(body) {
  const { nameOfSchool, schoolCode, yearOfGraduation } = body || {};
  return { nameOfSchool, schoolCode, yearOfGraduation };
}

module.exports = { validateCreateRecordBody };
