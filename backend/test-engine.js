// backend/test-engine.js
// Verification of pure engine and validation against Appendix A.

const assert = require('assert');
const { validatePolicy } = require('./engine/policyCheck');
const { evaluateFinancials } = require('./engine/evaluate');
const { validateFinancials } = require('./engine/validateFinancials');
const { validateApplicationRequest, validateCounterfactualRequest } = require('./validation/validateRequest');

const PV_001 = {
  policyVersion: 'PV-001',
  description: 'Initial ThinCred policy — 8-factor linear scorecard',
  createdAt: '2026-01-10T00:00:00.000Z',
  isActive: true,
  weights: {
    'INCOME-LEVEL': 12,
    'INCOME-STABILITY': 10,
    'INCOME-VOLATILITY': 10,
    'CASHFLOW-SURPLUS': 18,
    'RENT-CONSISTENCY': 15,
    'UTILITY-CONSISTENCY': 10,
    'SAVINGS-BUFFER': 10,
    'DEBT-BURDEN': 15
  },
  thresholds: {
    approveScoreMin: 70,
    reviewScoreMin: 50,
    positiveFactorScoreMin: 0.6,
    paymentWindowMonths: 12,
    paymentToleranceRatio: 0.25
  },
  bands: {
    incomeFloorMonthly: 10000,
    incomeFullMonthly: 100000,
    stabilityFloorMonths: 6,
    stabilityFullMonths: 36,
    volatilityBestCV: 0.05,
    volatilityWorstCV: 0.5,
    surplusFullRatio: 0.3,
    savingsFloorMonths: 0.5,
    savingsFullMonths: 6,
    burdenBestRatio: 0.1,
    burdenWorstRatio: 0.4
  }
};

console.log('1. Testing Policy Validation...');
assert.strictEqual(validatePolicy(PV_001), true);
console.log('   Policy PV-001 is valid.');

console.log('2. Testing Golden Case (§1.8)...');
const priyaFinancials = {
  incomeSixMonths: [45000, 45000, 45000, 45000, 45000, 45000],
  monthsAtIncomeSource: 12,
  monthlyRent: 10000,
  monthlyUtilities: 2500,
  monthlyOtherExpenses: 17500,
  rentOnTimeCount: 9,
  utilityOnTimeCount: 10,
  savingsBalance: 40000,
  monthlyDebtPayments: 7000
};

const finError = validateFinancials(priyaFinancials);
assert.strictEqual(finError, null, `Financial validation failed: ${finError}`);

const result = evaluateFinancials(priyaFinancials, PV_001);

console.log('   Score:', result.score, '(expected 58)');
console.log('   Decision:', result.decision, '(expected REVIEW)');
assert.strictEqual(result.score, 58, 'Score must be 58');
assert.strictEqual(result.decision, 'REVIEW', 'Decision must be REVIEW');

// Verify Reason Codes
console.log('   Reason codes count:', result.reasonCodes.length, '(expected 8)');
assert.strictEqual(result.reasonCodes.length, 8);

const expectedFirstCode = {
  code: 'SAVINGS-BUFFER-RISK',
  label: 'Low savings buffer',
  polarity: 'risk',
  points: 1.1
};

console.log('   First reason code:', result.reasonCodes[0]);
assert.deepStrictEqual(result.reasonCodes[0], expectedFirstCode, 'First code must match §1.8');

// Verify N/A Factor Redistribution (Row 11 from §8)
console.log('3. Testing N/A Factor Redistribution (no rent)...');
const noRentFinancials = {
  incomeSixMonths: [75000, 75000, 75000, 75000, 75000, 75000],
  monthsAtIncomeSource: 60,
  monthlyRent: 0,
  monthlyUtilities: 3000,
  monthlyOtherExpenses: 25000,
  rentOnTimeCount: 0,
  utilityOnTimeCount: 12,
  savingsBalance: 200000,
  monthlyDebtPayments: 2000
};

const resultNoRent = evaluateFinancials(noRentFinancials, PV_001);
console.log('   No rent score:', resultNoRent.score, 'decision:', resultNoRent.decision);
assert.strictEqual(resultNoRent.decision, 'APPROVE');
assert.deepStrictEqual(resultNoRent.features.inactiveFactorCodes, ['RENT-CONSISTENCY']);
assert.strictEqual(resultNoRent.features.weightScaleFactor, 1.1765);
assert.strictEqual(resultNoRent.reasonCodes.length, 7);

console.log('4. Testing Request Validation Rules (§7.1, §7.7)...');
// Golden Test Case 11: E1 without demographicGroup
let err11 = validateApplicationRequest({ financials: priyaFinancials });
assert.strictEqual(err11, "demographicGroup is required and must be 'female' or 'male'.");
console.log('   Test Case 11 passed:', err11);

// Golden Test Case 12: E1 with monthlyRent: 0, rentOnTimeCount: 5
let err12 = validateApplicationRequest({
  demographicGroup: 'female',
  financials: {
    ...priyaFinancials,
    monthlyRent: 0,
    rentOnTimeCount: 5
  }
});
assert.strictEqual(err12, 'rentOnTimeCount must be 0 when monthlyRent is 0.');
console.log('   Test Case 12 passed:', err12);

// Golden Test Case 10: E5 with demographicA = demographicB
let err10 = validateCounterfactualRequest({
  demographicA: 'female',
  demographicB: 'female',
  financials: priyaFinancials
});
assert.strictEqual(err10, 'demographicA and demographicB must be different values.');
console.log('   Test Case 10 passed:', err10);

console.log('\n--- ALL TESTS PASSED SUCCESSFULLY ---');
