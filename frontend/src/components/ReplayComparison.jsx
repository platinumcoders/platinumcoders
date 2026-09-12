// frontend/src/components/ReplayComparison.jsx
// Side-by-side original vs replay comparison per Thinker 2 spec §1.3.

import React from 'react';
import DecisionBadge from './DecisionBadge';
import ReasonCodeList from './ReasonCodeList';

export default function ReplayComparison({ result }) {
  if (!result) return null;

  const isVerified = result.verdict === 'REPLAY VERIFIED';

  return (
    <div className="replay-comparison-card">
      <div className={`verdict-banner ${isVerified ? 'verdict-verified' : 'verdict-mismatch'}`}>
        <span className="verdict-icon">{isVerified ? '🛡' : '⚠'}</span>
        <span className="verdict-text">{result.verdict}</span>
      </div>

      {result.algorithmChanged && (
        <div className="alert-box alert-info">
          Algorithm version changed since this decision was made.
        </div>
      )}

      {result.differences && result.differences.length > 0 && (
        <div className="alert-box alert-error">
          <p className="font-semibold">Mismatches detected:</p>
          <ul className="diff-list">
            {result.differences.map((diff, idx) => (
              <li key={idx} className="font-mono">{diff}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="side-by-side-grid">
        {/* Original Column */}
        <div className="comparison-column">
          <h4 className="column-title">Original Stored Passport</h4>
          <div className="comparison-metric-row">
            <span className="metric-label">Score:</span>
            <span className="metric-val">{result.original.score} / 100</span>
          </div>
          <div className="comparison-metric-row">
            <span className="metric-label">Decision:</span>
            <DecisionBadge decision={result.original.decision} />
          </div>
          <div className="comparison-metric-row">
            <span className="metric-label">Policy Version:</span>
            <span className="font-mono">{result.original.policyVersion}</span>
          </div>
          <div className="comparison-metric-row">
            <span className="metric-label">Algorithm Version:</span>
            <span className="font-mono">{result.original.algorithmVersion}</span>
          </div>
          <div className="comparison-metric-row">
            <span className="metric-label">Created At:</span>
            <span className="font-mono text-sm">{new Date(result.original.createdAt).toUTCString()}</span>
          </div>
          <div className="comparison-reasons">
            <h5 className="sub-title">Original Reason Codes</h5>
            <ReasonCodeList reasonCodes={result.original.reasonCodes} />
          </div>
        </div>

        {/* Replay Column */}
        <div className="comparison-column">
          <h4 className="column-title">Recomputed Replay</h4>
          <div className="comparison-metric-row">
            <span className="metric-label">Score:</span>
            <span className="metric-val">{result.replay.score} / 100</span>
          </div>
          <div className="comparison-metric-row">
            <span className="metric-label">Decision:</span>
            <DecisionBadge decision={result.replay.decision} />
          </div>
          <div className="comparison-metric-row">
            <span className="metric-label">Policy Version:</span>
            <span className="font-mono">{result.replay.policyVersion}</span>
          </div>
          <div className="comparison-metric-row">
            <span className="metric-label">Algorithm Version:</span>
            <span className="font-mono">{result.replay.algorithmVersion}</span>
          </div>
          <div className="comparison-reasons">
            <h5 className="sub-title">Replay Reason Codes</h5>
            <ReasonCodeList reasonCodes={result.replay.reasonCodes} />
          </div>
        </div>
      </div>

      <div className="replay-footer">
        <span><strong>Replayed At:</strong> <span className="font-mono">{new Date(result.replayedAt).toUTCString()}</span></span>
      </div>
    </div>
  );
}
