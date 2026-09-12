// frontend/src/screens/AuditorScreen.jsx
// Screen 3: Auditor / Replay per Thinker 2 spec §1.3 & §5.3.

import React, { useState, useEffect } from 'react';
import { getDecision, replayDecision } from '../api';
import ScoringDetail from '../components/ScoringDetail';

export default function AuditorScreen({ initialDecisionId = '' }) {
  const [idInput, setIdInput] = useState(initialDecisionId || 'TC-000001');
  const [passport, setPassport] = useState(null);
  const [replayResult, setReplayResult] = useState(null);
  const [retrieving, setRetrieving] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fetch if navigated with a pre-filled decisionId or initial ID
  useEffect(() => {
    if (initialDecisionId) {
      setIdInput(initialDecisionId);
      handleRetrieve(initialDecisionId);
    } else {
      handleRetrieve('TC-000001');
    }
  }, [initialDecisionId]);

  const handleRetrieve = async (targetId) => {
    const idToFetch = (targetId || idInput || '').trim();
    if (!idToFetch) return;

    setError(null);
    setReplayResult(null);
    setRetrieving(true);

    try {
      const data = await getDecision(idToFetch);
      setPassport(data);
    } catch (err) {
      setPassport(null);
      setError(err.message);
    } finally {
      setRetrieving(false);
    }
  };

  const handleReplay = async () => {
    const targetId = (passport?.decisionId || idInput || '').trim();
    if (!targetId) return;

    setError(null);
    setReplaying(true);

    try {
      const data = await replayDecision(targetId);
      setReplayResult(data);
      if (!passport) {
        // Also fetch passport if not already loaded
        const pass = await getDecision(targetId);
        setPassport(pass);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setReplaying(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRetrieve();
    }
  };

  const isVerified = replayResult?.verdict === 'REPLAY VERIFIED';

  return (
    <section className="screen-section">
      <div className="section-header">
        <div>
          <span className="eyebrow">03 / AUDIT TRAIL</span>
          <h2>Decision passport &amp; replay</h2>
          <p>Inspect immutable records and re-run historical evaluations to verify reproducibility.</p>
        </div>
      </div>

      {/* Lookup Card */}
      <div className="card lookup-card">
        <div>
          <span className="card-kicker">LOOK UP A DECISION</span>
          <h3>Retrieve a stored passport</h3>
        </div>
        <div className="lookup-form">
          <label htmlFor="auditDecisionId">Decision ID</label>
          <input
            id="auditDecisionId"
            type="text"
            className="font-mono"
            placeholder="e.g. TC-000001"
            value={idInput}
            disabled={retrieving}
            onChange={(e) => setIdInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="btn btn-secondary"
            disabled={retrieving || !idInput.trim()}
            onClick={() => handleRetrieve()}
          >
            {retrieving ? 'Retrieving…' : 'Retrieve passport'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={replaying || !idInput.trim()}
            onClick={handleReplay}
          >
            {replaying ? 'Replaying…' : '↻ Run replay verification'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Replay Verdict Banner */}
      {replayResult && (
        <div className={`replay-verdict-banner ${isVerified ? '' : 'divergence'}`}>
          <div className="verdict-icon">
            {isVerified ? '✓' : '✕'}
          </div>
          <div>
            <span className="verdict-badge">
              {replayResult.verdict}
            </span>
            <span className="verdict-message">
              {isVerified
                ? 'Replayed scorecard produced an exact match with the original decision (0 variance).'
                : `Differences detected: ${replayResult.differences?.join(', ') || 'Score or decision band mismatch'}`}
            </span>
          </div>
          <span className="mono-text">0.00 Δ</span>
        </div>
      )}

      {/* Side-by-Side Comparison */}
      {replayResult && (
        <div className="comparison-grid">
          <div className="card comparison-col">
            <span className="card-kicker">Original stored decision</span>
            <p>Recorded at: {new Date(replayResult.original.createdAt).toLocaleString('en-GB')}</p>
            <div className="metric-row">
              <span>Score</span>
              <strong>{replayResult.original.score} / 100</strong>
            </div>
            <div className="metric-row">
              <span>Band</span>
              <strong className={`text-${replayResult.original.decision === 'APPROVE' ? 'positive' : replayResult.original.decision === 'REVIEW' ? 'review' : 'decline'}`}>
                {replayResult.original.decision}
              </strong>
            </div>
            <div className="metric-row">
              <span>Policy version</span>
              <strong>{replayResult.original.policyVersion}</strong>
            </div>
            <div className="metric-row">
              <span>Algorithm</span>
              <strong>{replayResult.original.algorithmVersion}</strong>
            </div>
          </div>

          <div className="card comparison-col">
            <span className="card-kicker">Replayed decision</span>
            <p>Re-evaluated: {new Date(replayResult.replayedAt).toLocaleString('en-GB')}</p>
            <div className="metric-row">
              <span>Score</span>
              <strong>{replayResult.replay.score} / 100</strong>
            </div>
            <div className="metric-row">
              <span>Band</span>
              <strong className={`text-${replayResult.replay.decision === 'APPROVE' ? 'positive' : replayResult.replay.decision === 'REVIEW' ? 'review' : 'decline'}`}>
                {replayResult.replay.decision}
              </strong>
            </div>
            <div className="metric-row">
              <span>Policy version</span>
              <strong>{replayResult.replay.policyVersion}</strong>
            </div>
            <div className="metric-row">
              <span>Algorithm</span>
              <strong>{replayResult.replay.algorithmVersion}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Stored Passport Features & Snapshot Table */}
      {passport && (
        <div className="card passport-detail-card">
          <div className="card-heading-row">
            <div>
              <span className="card-kicker">INPUT FEATURES &amp; WEIGHTS</span>
              <h3>Immutable financial snapshot</h3>
            </div>
            <span className="secure-chip">🛡 Record locked</span>
          </div>

          <div style={{ marginTop: '16px' }}>
            <ScoringDetail features={passport.features} />
          </div>
        </div>
      )}
    </section>
  );
}

