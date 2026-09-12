// backend/services/counter.js
// Atomic decisionId generation per Appendix A §6.3.

const { getDB } = require('../config/db');

async function getNextDecisionId() {
  const db = getDB();
  const countersCollection = db.collection('counters');

  const result = await countersCollection.findOneAndUpdate(
    { _id: 'decisionId' },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );

  const seq = result.seq;
  const formattedSeq = String(seq).padStart(6, '0');
  return `TC-${formattedSeq}`;
}

async function resetDecisionCounter(seq = 0) {
  const db = getDB();
  const countersCollection = db.collection('counters');

  await countersCollection.updateOne(
    { _id: 'decisionId' },
    { $set: { seq } },
    { upsert: true }
  );
}

module.exports = {
  getNextDecisionId,
  resetDecisionCounter
};
