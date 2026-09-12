// backend/routes/fairness.js
// Route E4: GET /api/fairness/summary (Appendix A §7.5)
// Route E5: POST /api/fairness/counterfactual (Appendix A §7.6)
// Adheres strictly to F5: "monitored, never the forbidden p-word".

const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { validateCounterfactualRequest } = require('../validation/validateRequest');
const { getActivePolicy } = require('../services/policyService');
const { evaluateFinancials, r2, r4 } = require('../engine/evaluate');
const { ALGORITHM_VERSION } = require('../engine/policyCheck');

// E4: GET /api/fairness/summary
router.get('/summary', async (req, res) => {
  try {
    const db = getDB();
    const decisions = await db.collection('decisions').find({}).toArray();

    const totalDecisions = decisions.length;
    const generatedAt = new Date().toISOString();

    if (totalDecisions === 0) {
      return res.status(200).json({
        generatedAt,
        totalDecisions: 0,
        groups: []
      });
    }

    // Group decisions by demographicGroup
    const groupMap = new Map();

    for (const doc of decisions) {
      const groupName = doc.demographicGroup;
      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, {
          demographicGroup: groupName,
          applicationCount: 0,
          approveCount: 0,
          reviewCount: 0,
          declineCount: 0,
          scores: []
        });
      }

      const g = groupMap.get(groupName);
      g.applicationCount += 1;
      if (doc.decision === 'APPROVE') g.approveCount += 1;
      else if (doc.decision === 'REVIEW') g.reviewCount += 1;
      else if (doc.decision === 'DECLINE') g.declineCount += 1;

      if (typeof doc.score === 'number' && Number.isFinite(doc.score)) {
        g.scores.push(doc.score);
      }
    }

    // Format groups sorted alphabetically by demographicGroup
    const sortedGroupNames = Array.from(groupMap.keys()).sort();
    const groups = sortedGroupNames.map(groupName => {
      const g = groupMap.get(groupName);
      const appCount = g.applicationCount;

      let approvalRate = null;
      let averageScore = null;
      let minScore = null;
      let maxScore = null;

      if (appCount > 0) {
        approvalRate = r4(g.approveCount / appCount);
      }

      if (g.scores.length > 0) {
        const sumScores = g.scores.reduce((acc, s) => acc + s, 0);
        averageScore = r2(sumScores / g.scores.length);
        minScore = Math.min(...g.scores);
        maxScore = Math.max(...g.scores);
      }

      return {
        demographicGroup: g.demographicGroup,
        applicationCount: g.applicationCount,
        approveCount: g.approveCount,
        reviewCount: g.reviewCount,
        declineCount: g.declineCount,
        approvalRate,
        averageScore,
        minScore,
        maxScore
      };
    });

    return res.status(200).json({
      generatedAt,
      totalDecisions,
      groups
    });
  } catch (err) {
    console.error('Unhandled error in GET /api/fairness/summary:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// E5: POST /api/fairness/counterfactual
router.post('/counterfactual', async (req, res) => {
  try {
    const validationError = validateCounterfactualRequest(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const activePolicy = await getActivePolicy();

    // Call evaluateFinancials twice for each demographic group
    const runA = evaluateFinancials(req.body.financials, activePolicy);
    const runB = evaluateFinancials(req.body.financials, activePolicy);

    const identical = (runA.score === runB.score && runA.decision === runB.decision);

    const verdict = identical
      ? 'OUTCOMES IDENTICAL — monitored demographic had no effect on score or decision'
      : 'OUTCOMES DIFFER — monitored demographic affected score or decision';

    const responseBody = {
      runs: [
        {
          demographicGroup: req.body.demographicA,
          score: runA.score,
          decision: runA.decision,
          reasonCodes: runA.reasonCodes
        },
        {
          demographicGroup: req.body.demographicB,
          score: runB.score,
          decision: runB.decision,
          reasonCodes: runB.reasonCodes
        }
      ],
      identical,
      verdict,
      policyVersion: activePolicy.policyVersion,
      algorithmVersion: ALGORITHM_VERSION,
      evaluatedAt: new Date().toISOString()
    };

    return res.status(200).json(responseBody);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('Unhandled error in POST /api/fairness/counterfactual:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
