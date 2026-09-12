// backend/engine/evaluate.js
// Pure scoring engine per Master Blueprint §3, Appendix A §1.1–§1.6.
// Pure function: exactly two arguments, no database, no clock, no I/O, no randomness.

const { REQUIRED_FACTORS } = require('./policyCheck');
const { getReasonCode, sortReasonCodes } = require('./reasonCodes');

function r1(x) {
  return Math.round(x * 10) / 10;
}

function r2(x) {
  return Math.round(x * 100) / 100;
}

function r4(x) {
  return Math.round(x * 10000) / 10000;
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function evaluateFinancials(financials, policyDocument) {
  if (!financials || typeof financials !== 'object') {
    throw new Error('financials must be an object.');
  }
  if (!policyDocument || typeof policyDocument !== 'object') {
    throw new Error('policyDocument must be an object.');
  }

  const { bands, thresholds, weights } = policyDocument;

  // 1. Derived Quantities
  const incomeSixMonths = financials.incomeSixMonths;
  const meanMonthlyIncome = incomeSixMonths.reduce((sum, val) => sum + val, 0) / 6;

  let incomeCV = undefined;
  if (meanMonthlyIncome > 0) {
    const sumSquaredDiff = incomeSixMonths.reduce((sum, val) => sum + Math.pow(val - meanMonthlyIncome, 2), 0);
    const populationStdev = Math.sqrt(sumSquaredDiff / 6);
    incomeCV = populationStdev / meanMonthlyIncome;
  }

  const totalMonthlyExpenses = financials.monthlyRent + financials.monthlyUtilities + financials.monthlyOtherExpenses;
  const monthlySurplus = meanMonthlyIncome - totalMonthlyExpenses - financials.monthlyDebtPayments;

  const surplusRatio = meanMonthlyIncome > 0 ? (monthlySurplus / meanMonthlyIncome) : 0;

  const paymentWindowMonths = thresholds.paymentWindowMonths || 12;
  const rentOnTimeRatio = financials.rentOnTimeCount / paymentWindowMonths;
  const utilityOnTimeRatio = financials.utilityOnTimeCount / paymentWindowMonths;

  const totalMonthlyOutflow = totalMonthlyExpenses + financials.monthlyDebtPayments;
  const savingsMonthsCovered = totalMonthlyOutflow > 0 ? (financials.savingsBalance / totalMonthlyOutflow) : Infinity;

  let debtToIncomeRatio;
  if (meanMonthlyIncome > 0) {
    debtToIncomeRatio = financials.monthlyDebtPayments / meanMonthlyIncome;
  } else {
    debtToIncomeRatio = financials.monthlyDebtPayments > 0 ? Infinity : 0;
  }

  // 2. Factor Activity Rules
  const isRentActive = financials.monthlyRent > 0;
  const isUtilityActive = financials.monthlyUtilities > 0;

  const activeFactorCodes = [];
  const inactiveFactorCodes = [];

  for (const factor of REQUIRED_FACTORS) {
    if (factor === 'RENT-CONSISTENCY' && !isRentActive) {
      inactiveFactorCodes.push(factor);
    } else if (factor === 'UTILITY-CONSISTENCY' && !isUtilityActive) {
      inactiveFactorCodes.push(factor);
    } else {
      activeFactorCodes.push(factor);
    }
  }

  // 3. Weight Redistribution
  let baseSum = 0;
  for (const factor of activeFactorCodes) {
    baseSum += weights[factor];
  }
  const weightScaleFactor = 100 / baseSum;

  // 4. Normalization and Scoring
  let rawScore = 0;
  const factorResults = [];
  const rawReasonCodes = [];

  for (const factor of activeFactorCodes) {
    let unnormalizedScore = 0;

    switch (factor) {
      case 'INCOME-LEVEL':
        unnormalizedScore = (meanMonthlyIncome - bands.incomeFloorMonthly) / (bands.incomeFullMonthly - bands.incomeFloorMonthly);
        break;

      case 'INCOME-STABILITY':
        unnormalizedScore = (financials.monthsAtIncomeSource - bands.stabilityFloorMonths) / (bands.stabilityFullMonths - bands.stabilityFloorMonths);
        break;

      case 'INCOME-VOLATILITY':
        if (incomeCV === undefined) {
          unnormalizedScore = 0;
        } else {
          unnormalizedScore = (bands.volatilityWorstCV - incomeCV) / (bands.volatilityWorstCV - bands.volatilityBestCV);
        }
        break;

      case 'CASHFLOW-SURPLUS':
        if (meanMonthlyIncome <= 0) {
          unnormalizedScore = 0;
        } else {
          unnormalizedScore = surplusRatio / bands.surplusFullRatio;
        }
        break;

      case 'RENT-CONSISTENCY':
        unnormalizedScore = (rentOnTimeRatio - thresholds.paymentToleranceRatio) / (1 - thresholds.paymentToleranceRatio);
        break;

      case 'UTILITY-CONSISTENCY':
        unnormalizedScore = (utilityOnTimeRatio - thresholds.paymentToleranceRatio) / (1 - thresholds.paymentToleranceRatio);
        break;

      case 'SAVINGS-BUFFER':
        if (savingsMonthsCovered === Infinity) {
          unnormalizedScore = 1;
        } else {
          unnormalizedScore = (savingsMonthsCovered - bands.savingsFloorMonths) / (bands.savingsFullMonths - bands.savingsFloorMonths);
        }
        break;

      case 'DEBT-BURDEN':
        if (meanMonthlyIncome <= 0) {
          unnormalizedScore = financials.monthlyDebtPayments > 0 ? 0 : 1;
        } else {
          unnormalizedScore = (bands.burdenWorstRatio - debtToIncomeRatio) / (bands.burdenWorstRatio - bands.burdenBestRatio);
        }
        break;
    }

    const fScore = clamp01(unnormalizedScore);
    const maxPoints = weights[factor] * weightScaleFactor;
    const points = maxPoints * fScore;
    rawScore += points;

    factorResults.push({
      factor,
      factorScore: r4(fScore),
      maxPoints: r2(maxPoints),
      points: r1(points)
    });

    const polarity = fScore >= thresholds.positiveFactorScoreMin ? 'positive' : 'risk';
    rawReasonCodes.push(getReasonCode(factor, polarity, r1(points)));
  }

  const score = Math.round(rawScore);

  let decision = 'DECLINE';
  if (score >= thresholds.approveScoreMin) {
    decision = 'APPROVE';
  } else if (score >= thresholds.reviewScoreMin) {
    decision = 'REVIEW';
  }

  const reasonCodes = sortReasonCodes(rawReasonCodes);

  const features = {
    meanMonthlyIncome: r2(meanMonthlyIncome),
    incomeCoefficientOfVariation: incomeCV !== undefined ? r4(incomeCV) : 0,
    totalMonthlyExpenses: r2(totalMonthlyExpenses),
    monthlySurplus: r2(monthlySurplus),
    surplusRatio: r4(surplusRatio),
    debtToIncomeRatio: Number.isFinite(debtToIncomeRatio) ? r4(debtToIncomeRatio) : Infinity,
    savingsMonthsCovered: Number.isFinite(savingsMonthsCovered) ? r4(savingsMonthsCovered) : Infinity,
    rentOnTimeRatio: r4(rentOnTimeRatio),
    utilityOnTimeRatio: r4(utilityOnTimeRatio),
    activeFactorCodes,
    inactiveFactorCodes,
    weightScaleFactor: r4(weightScaleFactor),
    factorResults
  };

  return {
    score,
    decision,
    reasonCodes,
    features
  };
}

module.exports = {
  evaluateFinancials,
  r1,
  r2,
  r4,
  clamp01
};
