// backend/validation/validateRequest.js
// Shared validation for E1 and E5 request bodies per Appendix A §7.1.
// Checks run in fixed order; returns first failure message or null.

const { validateFinancials } = require('../engine/validateFinancials');

const ALLOWED_TOP_LEVEL_E1 = new Set(['applicantName', 'demographicGroup', 'financials']);
const ALLOWED_TOP_LEVEL_E5 = new Set(['demographicA', 'demographicB', 'financials']);

function validateApplicationRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'financials is required and must be an object.';
  }

  // 1. No unknown top-level fields
  for (const key of Object.keys(body)) {
    if (!ALLOWED_TOP_LEVEL_E1.has(key)) {
      return `Unknown field '${key}'.`;
    }
  }

  // 2. applicantName, if present: string, 1–100 chars after trim
  if (body.applicantName !== undefined && body.applicantName !== null) {
    if (typeof body.applicantName !== 'string' || body.applicantName.trim().length === 0 || body.applicantName.trim().length > 100) {
      return 'applicantName must be a string of 1 to 100 characters.';
    }
  }

  // 3. demographicGroup required, "female" or "male"
  if (body.demographicGroup !== 'female' && body.demographicGroup !== 'male') {
    return "demographicGroup is required and must be 'female' or 'male'.";
  }

  // 4–16. financials validation
  return validateFinancials(body.financials);
}

function validateCounterfactualRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'financials is required and must be an object.';
  }

  // 1. No unknown top-level fields
  for (const key of Object.keys(body)) {
    if (!ALLOWED_TOP_LEVEL_E5.has(key)) {
      return `Unknown field '${key}'.`;
    }
  }

  // 3'. demographicA
  if (body.demographicA !== 'female' && body.demographicA !== 'male') {
    return "demographicA is required and must be 'female' or 'male'.";
  }

  // 3'. demographicB
  if (body.demographicB !== 'female' && body.demographicB !== 'male') {
    return "demographicB is required and must be 'female' or 'male'.";
  }

  // 3'. distinct values
  if (body.demographicA === body.demographicB) {
    return 'demographicA and demographicB must be different values.';
  }

  // 4–16. financials validation
  return validateFinancials(body.financials);
}

module.exports = {
  validateApplicationRequest,
  validateCounterfactualRequest
};
