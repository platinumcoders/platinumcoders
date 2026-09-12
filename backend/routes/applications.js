// backend/routes/applications.js
// Route E1: POST /api/applications per Appendix A §7.2.

const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { validateApplicationRequest } = require('../validation/validateRequest');
const { getActivePolicy } = require('../services/policyService');
const { evaluateFinancials } = require('../engine/evaluate');
const { ALGORITHM_VERSION } = require('../engine/policyCheck');
const { getNextDecisionId } = require('../services/counter');

router.post('/', async (req, res) => {
  try {
    // 1. Fixed order request validation
    const validationError = validateApplicationRequest(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // 2. Load active policy
    const activePolicy = await getActivePolicy();

    // 3. Engine evaluation (PURE: exactly two arguments, financials only)
    const result = evaluateFinancials(req.body.financials, activePolicy);

    // 4. Atomic decision ID generation
    const decisionId = await getNextDecisionId();

    // 5. Construct Decision Passport
    const passport = {
      decisionId,
      applicantName: req.body.applicantName ? req.body.applicantName.trim() : null,
      demographicGroup: req.body.demographicGroup,
      financialSnapshot: req.body.financials,
      features: result.features,
      score: result.score,
      decision: result.decision,
      reasonCodes: result.reasonCodes,
      policyVersion: activePolicy.policyVersion,
      algorithmVersion: ALGORITHM_VERSION,
      createdAt: new Date().toISOString()
    };

    // 6. Persist to MongoDB decisions collection
    const db = getDB();
    await db.collection('decisions').insertOne({ ...passport });

    // 7. Return stored passport (HTTP 201 Created)
    return res.status(201).json(passport);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('Unhandled application error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
