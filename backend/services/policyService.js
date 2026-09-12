// backend/services/policyService.js
// Policy loading and validation per Appendix A §5.2.

const { getDB } = require('../config/db');
const { validatePolicy } = require('../engine/policyCheck');

async function getActivePolicy() {
  const db = getDB();
  const policyDoc = await db.collection('policyVersions').findOne({ isActive: true });

  if (!policyDoc) {
    const err = new Error("No active policy version found. Run 'npm run seed' or insert a policy version.");
    err.statusCode = 500;
    throw err;
  }

  try {
    validatePolicy(policyDoc);
  } catch (valErr) {
    const err = new Error(`Policy '${policyDoc.policyVersion}' is invalid: ${valErr.message}`);
    err.statusCode = 500;
    throw err;
  }

  return policyDoc;
}

async function getPolicyByVersion(versionId) {
  const db = getDB();
  const policyDoc = await db.collection('policyVersions').findOne({ policyVersion: versionId });

  if (!policyDoc) {
    const err = new Error(`Stored policy version '${versionId}' not found — replay cannot proceed.`);
    err.statusCode = 500;
    throw err;
  }

  try {
    validatePolicy(policyDoc);
  } catch (valErr) {
    const err = new Error(`Policy '${versionId}' is invalid: ${valErr.message}`);
    err.statusCode = 500;
    throw err;
  }

  return policyDoc;
}

module.exports = {
  getActivePolicy,
  getPolicyByVersion
};
