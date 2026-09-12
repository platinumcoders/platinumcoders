// backend/seed/seed.js
// Database seed script per Appendix A §8 (E6: npm run seed).
// Seeds PV-001 and 40 genuine passports with exact quotas (7 APPROVE / 8 REVIEW / 5 DECLINE per group).

require('dotenv').config();
const { connectDB, getDB, closeDB } = require('../config/db');
const { validateApplicationRequest } = require('../validation/validateRequest');
const { evaluateFinancials, r2, r4 } = require('../engine/evaluate');
const { ALGORITHM_VERSION } = require('../engine/policyCheck');
const { getNextDecisionId, resetDecisionCounter } = require('../services/counter');

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

const BASE_PROFILES = [
  // 1. APPROVE (~98)
  { incomeSixMonths: [90000, 90000, 90000, 90000, 90000, 90000], monthsAtIncomeSource: 48, monthlyRent: 18000, monthlyUtilities: 4000, monthlyOtherExpenses: 20000, rentOnTimeCount: 12, utilityOnTimeCount: 12, savingsBalance: 250000, monthlyDebtPayments: 3000 },
  // 2. APPROVE (~86)
  { incomeSixMonths: [65000, 65000, 65000, 65000, 65000, 65000], monthsAtIncomeSource: 30, monthlyRent: 14000, monthlyUtilities: 3000, monthlyOtherExpenses: 18000, rentOnTimeCount: 11, utilityOnTimeCount: 12, savingsBalance: 120000, monthlyDebtPayments: 6000 },
  // 3. APPROVE (~77)
  { incomeSixMonths: [55000, 55000, 55000, 55000, 55000, 55000], monthsAtIncomeSource: 24, monthlyRent: 12000, monthlyUtilities: 3000, monthlyOtherExpenses: 17000, rentOnTimeCount: 10, utilityOnTimeCount: 11, savingsBalance: 60000, monthlyDebtPayments: 6000 },
  // 4. REVIEW (~62)
  { incomeSixMonths: [50000, 50000, 50000, 50000, 50000, 50000], monthsAtIncomeSource: 18, monthlyRent: 11000, monthlyUtilities: 3000, monthlyOtherExpenses: 18000, rentOnTimeCount: 9, utilityOnTimeCount: 10, savingsBalance: 45000, monthlyDebtPayments: 8000 },
  // 5. REVIEW (~58)
  { incomeSixMonths: [45000, 45000, 45000, 45000, 45000, 45000], monthsAtIncomeSource: 12, monthlyRent: 10000, monthlyUtilities: 2500, monthlyOtherExpenses: 17500, rentOnTimeCount: 9, utilityOnTimeCount: 10, savingsBalance: 40000, monthlyDebtPayments: 7000 },
  // 6. REVIEW (~52)
  { incomeSixMonths: [42000, 42000, 42000, 42000, 42000, 42000], monthsAtIncomeSource: 10, monthlyRent: 9000, monthlyUtilities: 2000, monthlyOtherExpenses: 19000, rentOnTimeCount: 9, utilityOnTimeCount: 9, savingsBalance: 30000, monthlyDebtPayments: 7000 },
  // 7. DECLINE (~26)
  { incomeSixMonths: [28000, 28000, 28000, 28000, 28000, 28000], monthsAtIncomeSource: 8, monthlyRent: 8000, monthlyUtilities: 2000, monthlyOtherExpenses: 15000, rentOnTimeCount: 6, utilityOnTimeCount: 7, savingsBalance: 8000, monthlyDebtPayments: 9000 },
  // 8. REVIEW (~51)
  { incomeSixMonths: [35000, 12000, 48000, 9000, 30000, 16000], monthsAtIncomeSource: 36, monthlyRent: 7000, monthlyUtilities: 1500, monthlyOtherExpenses: 10000, rentOnTimeCount: 10, utilityOnTimeCount: 11, savingsBalance: 15000, monthlyDebtPayments: 4000 },
  // 9. DECLINE (~49)
  { incomeSixMonths: [60000, 60000, 60000, 60000, 60000, 60000], monthsAtIncomeSource: 24, monthlyRent: 12000, monthlyUtilities: 3000, monthlyOtherExpenses: 15000, rentOnTimeCount: 11, utilityOnTimeCount: 11, savingsBalance: 20000, monthlyDebtPayments: 26000 },
  // 10. DECLINE (~11)
  { incomeSixMonths: [18000, 9000, 22000, 6000, 15000, 20000], monthsAtIncomeSource: 3, monthlyRent: 6000, monthlyUtilities: 1000, monthlyOtherExpenses: 11000, rentOnTimeCount: 5, utilityOnTimeCount: 7, savingsBalance: 2000, monthlyDebtPayments: 8000 },
  // 11. APPROVE (~96 - no rent N/A path)
  { incomeSixMonths: [75000, 75000, 75000, 75000, 75000, 75000], monthsAtIncomeSource: 60, monthlyRent: 0, monthlyUtilities: 3000, monthlyOtherExpenses: 25000, rentOnTimeCount: 0, utilityOnTimeCount: 12, savingsBalance: 200000, monthlyDebtPayments: 2000 },
  // 12. REVIEW (~66 - no utilities N/A path)
  { incomeSixMonths: [48000, 48000, 48000, 48000, 48000, 48000], monthsAtIncomeSource: 15, monthlyRent: 14000, monthlyUtilities: 0, monthlyOtherExpenses: 18000, rentOnTimeCount: 10, utilityOnTimeCount: 0, savingsBalance: 35000, monthlyDebtPayments: 5000 },
  // 13. APPROVE (~90)
  { incomeSixMonths: [65000, 65000, 65000, 65000, 65000, 65000], monthsAtIncomeSource: 30, monthlyRent: 14000, monthlyUtilities: 3000, monthlyOtherExpenses: 18000, rentOnTimeCount: 11, utilityOnTimeCount: 12, savingsBalance: 200000, monthlyDebtPayments: 6000 },
  // 14. APPROVE (~83)
  { incomeSixMonths: [65000, 65000, 65000, 65000, 65000, 65000], monthsAtIncomeSource: 30, monthlyRent: 14000, monthlyUtilities: 3000, monthlyOtherExpenses: 18000, rentOnTimeCount: 9, utilityOnTimeCount: 12, savingsBalance: 120000, monthlyDebtPayments: 6000 },
  // 15. APPROVE (~81)
  { incomeSixMonths: [55000, 55000, 55000, 55000, 55000, 55000], monthsAtIncomeSource: 24, monthlyRent: 12000, monthlyUtilities: 3000, monthlyOtherExpenses: 17000, rentOnTimeCount: 10, utilityOnTimeCount: 11, savingsBalance: 150000, monthlyDebtPayments: 6000 },
  // 16. REVIEW (~64)
  { incomeSixMonths: [50000, 50000, 50000, 50000, 50000, 50000], monthsAtIncomeSource: 18, monthlyRent: 11000, monthlyUtilities: 3000, monthlyOtherExpenses: 18000, rentOnTimeCount: 9, utilityOnTimeCount: 10, savingsBalance: 90000, monthlyDebtPayments: 8000 },
  // 17. REVIEW (~55)
  { incomeSixMonths: [45000, 45000, 45000, 45000, 45000, 45000], monthsAtIncomeSource: 12, monthlyRent: 10000, monthlyUtilities: 2500, monthlyOtherExpenses: 17500, rentOnTimeCount: 7, utilityOnTimeCount: 10, savingsBalance: 40000, monthlyDebtPayments: 7000 },
  // 18. DECLINE (~44)
  { incomeSixMonths: [42000, 42000, 42000, 42000, 42000, 42000], monthsAtIncomeSource: 10, monthlyRent: 9000, monthlyUtilities: 2000, monthlyOtherExpenses: 19000, rentOnTimeCount: 9, utilityOnTimeCount: 9, savingsBalance: 30000, monthlyDebtPayments: 10000 },
  // 19. DECLINE (~23)
  { incomeSixMonths: [28000, 28000, 28000, 28000, 28000, 28000], monthsAtIncomeSource: 8, monthlyRent: 8000, monthlyUtilities: 2000, monthlyOtherExpenses: 15000, rentOnTimeCount: 4, utilityOnTimeCount: 7, savingsBalance: 8000, monthlyDebtPayments: 9000 },
  // 20. REVIEW (~53)
  { incomeSixMonths: [35000, 12000, 48000, 9000, 30000, 16000], monthsAtIncomeSource: 36, monthlyRent: 7000, monthlyUtilities: 1500, monthlyOtherExpenses: 10000, rentOnTimeCount: 10, utilityOnTimeCount: 11, savingsBalance: 40000, monthlyDebtPayments: 4000 }
];

async function seed() {
  console.log('=== ThinCred Seed Starting ===');
  await connectDB();
  const db = getDB();

  // 1. Ensure PV-001 exists. Set isActive: true only if no policy is currently active.
  const policyVersions = db.collection('policyVersions');
  const existingPV001 = await policyVersions.findOne({ policyVersion: 'PV-001' });

  if (!existingPV001) {
    const anyActive = await policyVersions.findOne({ isActive: true });
    const pvDoc = { ...PV_001, isActive: !anyActive };
    await policyVersions.insertOne(pvDoc);
    console.log(`Inserted policy PV-001 (isActive: ${pvDoc.isActive})`);
  } else {
    console.log('Policy PV-001 already exists. Leaving unchanged per immutability rule.');
  }

  // Load the active policy
  const activePolicy = await policyVersions.findOne({ isActive: true });
  if (!activePolicy) {
    throw new Error('No active policy found during seed.');
  }

  // 2. Delete all documents from decisions; reset counters to seq: 0
  const decisions = db.collection('decisions');
  await decisions.deleteMany({});
  await resetDecisionCounter(0);
  console.log('Decisions collection cleared, decision counter reset to 0.');

  // 3. Insert 40 passports (20 profiles * 2 demographic groups: female first, then male)
  let applicantIndex = 1;
  const insertedPassports = [];

  for (let i = 0; i < BASE_PROFILES.length; i++) {
    const profile = BASE_PROFILES[i];
    const demographics = ['female', 'male'];

    for (const group of demographics) {
      const applicantName = `Seed Applicant ${String(applicantIndex).padStart(2, '0')}`;
      applicantIndex++;

      const reqBody = {
        applicantName,
        demographicGroup: group,
        financials: profile
      };

      // Validate using exact E1 validation path
      const validationError = validateApplicationRequest(reqBody);
      if (validationError) {
        throw new Error(`Seed validation failed for ${applicantName}: ${validationError}`);
      }

      // Pure engine evaluation (financials + activePolicy only)
      const result = evaluateFinancials(reqBody.financials, activePolicy);

      // Atomic ID generation
      const decisionId = await getNextDecisionId();

      const passport = {
        decisionId,
        applicantName: reqBody.applicantName,
        demographicGroup: reqBody.demographicGroup,
        financialSnapshot: reqBody.financials,
        features: result.features,
        score: result.score,
        decision: result.decision,
        reasonCodes: result.reasonCodes,
        policyVersion: activePolicy.policyVersion,
        algorithmVersion: ALGORITHM_VERSION,
        createdAt: new Date().toISOString()
      };

      await decisions.insertOne(passport);
      insertedPassports.push(passport);
    }
  }

  console.log(`Successfully seeded ${insertedPassports.length} decisions.\n`);

  // 4. Print console summary matching E4
  const groupStats = {
    female: { count: 0, approve: 0, review: 0, decline: 0, scores: [] },
    male: { count: 0, approve: 0, review: 0, decline: 0, scores: [] }
  };

  for (const p of insertedPassports) {
    const g = groupStats[p.demographicGroup];
    g.count++;
    if (p.decision === 'APPROVE') g.approve++;
    if (p.decision === 'REVIEW') g.review++;
    if (p.decision === 'DECLINE') g.decline++;
    g.scores.push(p.score);
  }

  console.log('=== Seed Summary ===');
  console.log(`Total Decisions: ${insertedPassports.length}`);
  for (const group of ['female', 'male']) {
    const s = groupStats[group];
    const avgScore = r2(s.scores.reduce((a, b) => a + b, 0) / s.scores.length);
    const approvalRate = r4(s.approve / s.count);
    const minScore = Math.min(...s.scores);
    const maxScore = Math.max(...s.scores);
    console.log(`Group: ${group}`);
    console.log(`  Applications: ${s.count}`);
    console.log(`  APPROVE: ${s.approve}, REVIEW: ${s.review}, DECLINE: ${s.decline}`);
    console.log(`  Approval Rate: ${approvalRate} (${s.approve}/${s.count})`);
    console.log(`  Average Score: ${avgScore}, Min: ${minScore}, Max: ${maxScore}`);
  }

  await closeDB();
  console.log('\n=== Seed Completed Successfully ===');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Seed script failed:', err);
      process.exit(1);
    });
}

module.exports = seed;
