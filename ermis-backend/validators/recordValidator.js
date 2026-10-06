function validateCreateRecordBody(body) {
  const { nameOfSchool, schoolCode, yearOfGraduation } = body || {};
  return { nameOfSchool, schoolCode, yearOfGraduation };
}

function validateUpdateRecordBody(body) {
  const { nameOfSchool, schoolCode, yearOfGraduation } = body || {};
  return { nameOfSchool, schoolCode, yearOfGraduation };
}

module.exports = {
  validateCreateRecordBody,
  validateUpdateRecordBody,
};
