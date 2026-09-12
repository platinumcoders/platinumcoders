// backend/engine/policyCheck.js
// Validates policy document integrity per Appendix A §5.1 & §5.2.
// Implements frozen ALGORITHM_VERSION constant per §5.3.

const ALGORITHM_VERSION = '1.0.0';

const REQUIRED_FACTORS = [
  'INCOME-LEVEL',
  'INCOME-STABILITY',
  'INCOME-VOLATILITY',
  'CASHFLOW-SURPLUS',
  'RENT-CONSISTENCY',
  'UTILITY-CONSISTENCY',
  'SAVINGS-BUFFER',
  'DEBT-BURDEN'
];

function validatePolicy(policy) {
  if (!policy || typeof policy !== 'object') {
    throw new Error('Policy document must be an object.');
  }

  if (typeof policy.policyVersion !== 'string' || policy.policyVersion.trim().length === 0) {
    throw new Error('policyVersion is required and must be a non-empty string.');
  }

  // Validate weights
  if (!policy.weights || typeof policy.weights !== 'object') {
    throw new Error('weights must be an object containing all 8 factor weights.');
  }

  let totalWeight = 0;
  for (const factor of REQUIRED_FACTORS) {
    const weight = policy.weights[factor];
    if (typeof weight !== 'number' || !Number.isFinite(weight) || weight < 0) {
      throw new Error(`Weight for factor '${factor}' must be a non-negative finite number.`);
    }
    totalWeight += weight;
  }

  if (Math.round(totalWeight) !== 100) {
    throw new Error(`Weights must sum to exactly 100, received sum: ${totalWeight}.`);
  }

  // Validate thresholds
  if (!policy.thresholds || typeof policy.thresholds !== 'object') {
    throw new Error('thresholds must be an object.');
  }

  const {
    approveScoreMin,
    reviewScoreMin,
    positiveFactorScoreMin,
    paymentWindowMonths,
    paymentToleranceRatio
  } = policy.thresholds;

  if (typeof approveScoreMin !== 'number' || !Number.isInteger(approveScoreMin) || approveScoreMin < 0 || approveScoreMin > 100) {
    throw new Error('thresholds.approveScoreMin must be an integer between 0 and 100.');
  }

  if (typeof reviewScoreMin !== 'number' || !Number.isInteger(reviewScoreMin) || reviewScoreMin < 0 || reviewScoreMin > approveScoreMin) {
    throw new Error('thresholds.reviewScoreMin must be an integer between 0 and approveScoreMin.');
  }

  if (typeof positiveFactorScoreMin !== 'number' || positiveFactorScoreMin < 0 || positiveFactorScoreMin > 1) {
    throw new Error('thresholds.positiveFactorScoreMin must be a number between 0 and 1.');
  }

  if (typeof paymentWindowMonths !== 'number' || !Number.isInteger(paymentWindowMonths) || paymentWindowMonths <= 0) {
    throw new Error('thresholds.paymentWindowMonths must be a positive integer.');
  }

  if (typeof paymentToleranceRatio !== 'number' || paymentToleranceRatio < 0 || paymentToleranceRatio >= 1) {
    throw new Error('thresholds.paymentToleranceRatio must be a number >= 0 and < 1.');
  }

  // Validate bands
  if (!policy.bands || typeof policy.bands !== 'object') {
    throw new Error('bands must be an object.');
  }

  const {
    incomeFloorMonthly,
    incomeFullMonthly,
    stabilityFloorMonths,
    stabilityFullMonths,
    volatilityBestCV,
    volatilityWorstCV,
    surplusFullRatio,
    savingsFloorMonths,
    savingsFullMonths,
    burdenBestRatio,
    burdenWorstRatio
  } = policy.bands;

  if (typeof incomeFloorMonthly !== 'number' || typeof incomeFullMonthly !== 'number' || incomeFloorMonthly >= incomeFullMonthly) {
    throw new Error('bands: incomeFloorMonthly must be less than incomeFullMonthly.');
  }

  if (typeof stabilityFloorMonths !== 'number' || typeof stabilityFullMonths !== 'number' || stabilityFloorMonths >= stabilityFullMonths) {
    throw new Error('bands: stabilityFloorMonths must be less than stabilityFullMonths.');
  }

  if (typeof volatilityBestCV !== 'number' || typeof volatilityWorstCV !== 'number' || volatilityBestCV >= volatilityWorstCV) {
    throw new Error('bands: volatilityBestCV must be less than volatilityWorstCV.');
  }

  if (typeof surplusFullRatio !== 'number' || surplusFullRatio <= 0) {
    throw new Error('bands: surplusFullRatio must be a positive number.');
  }

  if (typeof savingsFloorMonths !== 'number' || typeof savingsFullMonths !== 'number' || savingsFloorMonths >= savingsFullMonths) {
    throw new Error('bands: savingsFloorMonths must be less than savingsFullMonths.');
  }

  if (typeof burdenBestRatio !== 'number' || typeof burdenWorstRatio !== 'number' || burdenBestRatio >= burdenWorstRatio) {
    throw new Error('bands: burdenBestRatio must be less than burdenWorstRatio.');
  }

  return true;
}

module.exports = {
  ALGORITHM_VERSION,
  REQUIRED_FACTORS,
  validatePolicy
};
