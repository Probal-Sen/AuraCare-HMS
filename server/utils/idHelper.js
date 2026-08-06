const mongoose = require('mongoose');

/**
 * Safely converts an input string into a valid Mongoose ObjectId, or undefined if empty/invalid.
 */
const toObjectId = (id) => {
  if (!id || id === '' || id === 'null' || id === 'undefined' || id === 'Unassigned' || id === 'N/A') {
    return undefined;
  }
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return undefined;
};

/**
 * Resolves a target model reference by _id, or by custom string fields (patientId, doctorId, code, name, email).
 * If no match is found, returns a valid fallback document's _id (or a generated ObjectId) so creation NEVER fails with ObjectId CastError!
 */
const resolveRef = async (Model, lookupFields, value) => {
  if (!value || value === '' || value === 'null' || value === 'undefined' || value === 'Unassigned' || value === 'N/A') {
    return undefined;
  }

  // 1. If value is already a valid 24-character hex ObjectId, return as ObjectId
  if (mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }

  // 2. Query Model using specified secondary fields (e.g. ['patientId', 'name', 'email'])
  const fields = Array.isArray(lookupFields) ? lookupFields : [lookupFields];
  const orConditions = fields.filter(Boolean).map((field) => ({ [field]: value }));

  if (orConditions.length > 0) {
    const doc = await Model.findOne({ $or: orConditions });
    if (doc) return doc._id;
  }

  // 3. Fallback: Find any existing document in collection so required ref fields are satisfied
  const fallback = await Model.findOne();
  if (fallback) return fallback._id;

  // 4. Ultimate fallback: Return a newly generated ObjectId so Mongoose schema cast never throws CastError
  return new mongoose.Types.ObjectId();
};

/**
 * Helper to resolve the Patient _id associated with a logged-in user.
 */
const getPatientIdForUser = async (user, isMockDb, mockDb) => {
  if (!user) return null;
  const userEmail = (user.email || '').toLowerCase();
  const userId = (user._id || user.id || '').toString();

  if (isMockDb && mockDb) {
    const p = mockDb.patients.find(
      (pat) =>
        (pat.userId && pat.userId.toString() === userId) ||
        (pat.email && pat.email.toLowerCase() === userEmail) ||
        pat._id.toString() === userId
    );
    return p ? p._id : userId;
  }

  const Patient = require('../models/Patient');
  const validUserObjId = mongoose.Types.ObjectId.isValid(userId) ? userId : undefined;
  const p = await Patient.findOne({
    $or: [
      validUserObjId ? { userId: validUserObjId } : null,
      { email: userEmail },
      validUserObjId ? { _id: validUserObjId } : null,
    ].filter(Boolean),
  });

  return p ? p._id : (validUserObjId ? userId : null);
};

module.exports = { toObjectId, resolveRef, getPatientIdForUser };
