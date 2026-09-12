// frontend/src/screens/AuditorScreen.jsx
// Screen 3: Auditor / Replay per Thinker 2 spec §1.3 & §5.3.

import React, { useState, useEffect } from 'react';
import { getDecision, replayDecision } from '../api';
import PassportView from '../components/PassportView';
import ReplayComparison from '../components/ReplayComparison';

export default function AuditorScreen({ initialDecisionId = '' }) {
  const [idInput, setIdInput] = useState(initialDecisionId);
  const [passport, setPassport] = useState(null);
  const [replayResult, setReplayResult] = useState(null);
  const [retrieving, setRetrieving] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fetch if navigated with a pre-filled decisionId
  useEffect(() => {
    if (initialDecisionId) {
      setIdInput(initialDecisionId);
      handleRetrieve(initialDecisionId);
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
    if (!passport || !passport.decisionId) return;

    setError(null);
    setReplaying(true);

    try {
      const data = await replayDecision(passport.decisionId);
      setReplayResult(data);
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

  return (
    <div className="screen-container">
      <div className="card-box auditor-card">
        <div className="screen-header">
          <h2 className="screen-title">Auditor — Retrieve &amp; Replay</h2>
          <p className="screen-subtitle">Verify historical decisions by re-evaluating stored snapshot data against stored policy documents.</p>
        </div>

        <div className="lookup-search-bar">
          <div className="lookup-input-wrap">
            <input
              type="text"
              className="lookup-input font-mono"
              placeholder="e.g. TC-000001"
              value={idInput}
              disabled={retrieving}
              onChange={(e) => setIdInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={retrieving || !idInput.trim()}
            onClick={() => handleRetrieve()}
          >
            {retrieving ? 'Retrieving…' : 'Retrieve'}
          </button>
        </div>

        {error && (
          <div className="alert-box alert-error" role="alert">
            {error}
          </div>
        )}

        {passport && (
          <div className="retrieved-content">
            <PassportView passport={passport} />

            <div className="replay-action-strip">
              <button
                type="button"
                className="btn btn-primary btn-replay"
                onClick={handleReplay}
                disabled={replaying}
              >
                {replaying ? 'Replaying…' : 'Replay Decision'}
              </button>
            </div>

            {replayResult && (
              <div className="replay-result-section mt-6">
                <ReplayComparison result={replayResult} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
