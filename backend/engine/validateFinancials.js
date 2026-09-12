// backend/engine/validateFinancials.js
// Pure validation of the financials object per Appendix A §7.1 (Rules 4–16).

const ALLOWED_FINANCIAL_FIELDS = new Set([
  'incomeSixMonths',
  'monthsAtIncomeSource',
  'monthlyRent',
  'monthlyUtilities',
  'monthlyOtherExpenses',
  'rentOnTimeCount',
  'utilityOnTimeCount',
  'savingsBalance',
  'monthlyDebtPayments'
]);

function validateFinancials(financials) {
  // Rule 4: financials required, plain object
  if (!financials || typeof financials !== 'object' || Array.isArray(financials)) {
    return 'financials is required and must be an object.';
  }

  // Rule 5: No unknown fields inside financials
  for (const key of Object.keys(financials)) {
    if (!ALLOWED_FINANCIAL_FIELDS.has(key)) {
      return `Unknown field '${key}' in financials.`;
    }
  }

  // Rule 6: incomeSixMonths
  const { incomeSixMonths } = financials;
  if (
    !Array.isArray(incomeSixMonths) ||
    incomeSixMonths.length !== 6 ||
    !incomeSixMonths.every(val => typeof val === 'number' && Number.isFinite(val) && val >= 0 && val <= 10000000)
  ) {
    return 'incomeSixMonths must be an array of exactly 6 numbers, each between 0 and 10000000.';
  }

  // Rule 7: monthsAtIncomeSource
  const { monthsAtIncomeSource } = financials;
  if (
    typeof monthsAtIncomeSource !== 'number' ||
    !Number.isInteger(monthsAtIncomeSource) ||
    monthsAtIncomeSource < 0 ||
    monthsAtIncomeSource > 600
  ) {
    return 'monthsAtIncomeSource must be an integer between 0 and 600.';
  }

  // Rule 8: monthlyRent
  const { monthlyRent } = financials;
  if (
    typeof monthlyRent !== 'number' ||
    !Number.isFinite(monthlyRent) ||
    monthlyRent < 0 ||
    monthlyRent > 10000000
  ) {
    return 'monthlyRent must be a number between 0 and 10000000.';
  }

  // Rule 9: rentOnTimeCount
  const { rentOnTimeCount } = financials;
  if (
    typeof rentOnTimeCount !== 'number' ||
    !Number.isInteger(rentOnTimeCount) ||
    rentOnTimeCount < 0 ||
    rentOnTimeCount > 12
  ) {
    return 'rentOnTimeCount must be an integer between 0 and 12.';
  }

  // Rule 10: if monthlyRent = 0 then rentOnTimeCount = 0
  if (monthlyRent === 0 && rentOnTimeCount !== 0) {
    return 'rentOnTimeCount must be 0 when monthlyRent is 0.';
  }

  // Rule 11: monthlyUtilities
  const { monthlyUtilities } = financials;
  if (
    typeof monthlyUtilities !== 'number' ||
    !Number.isFinite(monthlyUtilities) ||
    monthlyUtilities < 0 ||
    monthlyUtilities > 10000000
  ) {
    return 'monthlyUtilities must be a number between 0 and 10000000.';
  }

  // Rule 12: utilityOnTimeCount
  const { utilityOnTimeCount } = financials;
  if (
    typeof utilityOnTimeCount !== 'number' ||
    !Number.isInteger(utilityOnTimeCount) ||
    utilityOnTimeCount < 0 ||
    utilityOnTimeCount > 12
  ) {
    return 'utilityOnTimeCount must be an integer between 0 and 12.';
  }

  // Rule 13: if monthlyUtilities = 0 then utilityOnTimeCount = 0
  if (monthlyUtilities === 0 && utilityOnTimeCount !== 0) {
    return 'utilityOnTimeCount must be 0 when monthlyUtilities is 0.';
  }

  // Rule 14: monthlyOtherExpenses
  const { monthlyOtherExpenses } = financials;
  if (
    typeof monthlyOtherExpenses !== 'number' ||
    !Number.isFinite(monthlyOtherExpenses) ||
    monthlyOtherExpenses < 0 ||
    monthlyOtherExpenses > 10000000
  ) {
    return 'monthlyOtherExpenses must be a number between 0 and 10000000.';
  }

  // Rule 15: savingsBalance
  const { savingsBalance } = financials;
  if (
    typeof savingsBalance !== 'number' ||
    !Number.isFinite(savingsBalance) ||
    savingsBalance < 0 ||
    savingsBalance > 1000000000
  ) {
    return 'savingsBalance must be a number between 0 and 1000000000.';
  }

  // Rule 16: monthlyDebtPayments
  const { monthlyDebtPayments } = financials;
  if (
    typeof monthlyDebtPayments !== 'number' ||
    !Number.isFinite(monthlyDebtPayments) ||
    monthlyDebtPayments < 0 ||
    monthlyDebtPayments > 10000000
  ) {
    return 'monthlyDebtPayments must be a number between 0 and 10000000.';
  }

  return null; // Valid
}

module.exports = {
  validateFinancials,
  ALLOWED_FINANCIAL_FIELDS
};
