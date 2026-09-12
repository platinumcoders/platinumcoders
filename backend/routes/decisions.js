// backend/routes/decisions.js
// Route E2: GET /api/decisions/:decisionId (Appendix A §7.3)
// Route E3: POST /api/decisions/:decisionId/replay (Appendix A §7.4)

const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { getPolicyByVersion } = require('../services/policyService');
const { evaluateFinancials } = require('../engine/evaluate');
const { ALGORITHM_VERSION } = require('../engine/policyCheck');

// E2: GET /api/decisions/:decisionId
router.get('/:decisionId', async (req, res) => {
  try {
    const { decisionId } = req.params;
    const db = getDB();

    const passport = await db.collection('decisions').findOne(
      { decisionId },
      { projection: { _id: 0 } }
    );

    if (!passport) {
      return res.status(404).json({ error: `Decision ${decisionId} not found.` });
    }

    return res.status(200).json(passport);
  } catch (err) {
    console.error('Unhandled error in GET /api/decisions/:decisionId:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// E3: POST /api/decisions/:decisionId/replay
router.post('/:decisionId/replay', async (req, res) => {
  try {
    const { decisionId } = req.params;
    const db = getDB();

    const storedPassport = await db.collection('decisions').findOne(
      { decisionId },
      { projection: { _id: 0 } }
    );

    if (!storedPassport) {
      return res.status(404).json({ error: `Decision ${decisionId} not found.` });
    }

    // Load stored policy version (never the active one!)
    const storedPolicyDoc = await getPolicyByVersion(storedPassport.policyVersion);

    // Replay evaluation using current engine code and stored financial snapshot
    const replayResult = evaluateFinancials(storedPassport.financialSnapshot, storedPolicyDoc);

    const scoreMatches = replayResult.score === storedPassport.score;
    const decisionMatches = replayResult.decision === storedPassport.decision;

    const verdict = (scoreMatches && decisionMatches) ? 'REPLAY VERIFIED' : 'REPLAY MISMATCH';

    const differences = [];
    if (!scoreMatches) {
      differences.push(`score: original=${storedPassport.score}, replay=${replayResult.score}`);
    }
    if (!decisionMatches) {
      differences.push(`decision: original=${storedPassport.decision}, replay=${replayResult.decision}`);
    }

    const algorithmChanged = storedPassport.algorithmVersion !== ALGORITHM_VERSION;

    const responseBody = {
      decisionId: storedPassport.decisionId,
      verdict,
      original: {
        score: storedPassport.score,
        decision: storedPassport.decision,
        reasonCodes: storedPassport.reasonCodes,
        policyVersion: storedPassport.policyVersion,
        algorithmVersion: storedPassport.algorithmVersion,
        createdAt: storedPassport.createdAt
      },
      replay: {
        score: replayResult.score,
        decision: replayResult.decision,
        reasonCodes: replayResult.reasonCodes,
        policyVersion: storedPassport.policyVersion,
        algorithmVersion: ALGORITHM_VERSION
      },
      algorithmChanged,
      differences,
      replayedAt: new Date().toISOString()
    };

    return res.status(200).json(responseBody);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('Unhandled error in POST /api/decisions/:decisionId/replay:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
