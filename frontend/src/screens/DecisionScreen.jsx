// frontend/src/screens/DecisionScreen.jsx
// Screen 2: Decision Display per Thinker 2 spec §1.2 & §5.2.

import React from 'react';
import DecisionBadge from '../components/DecisionBadge';
import ReasonCodeList from '../components/ReasonCodeList';
import ScoringDetail from '../components/ScoringDetail';

export default function DecisionScreen({ passport, onGoToAuditor, onGoToApplication }) {
  if (!passport) {
    return (
      <div className="screen-container">
        <div className="card-box empty-state-box">
          <h3 className="section-title">No decision yet.</h3>
          <p className="caption-text">Submit an application first to view decision details.</p>
          <button
            type="button"
            className="btn btn-primary mt-4"
            onClick={onGoToApplication}
          >
            Go to Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <div className="card-box decision-card">
        <div className="decision-top-header">
          <div>
            <span className="caption-text">Decision Result</span>
            <h2 className="screen-title">Credit Evaluation</h2>
          </div>
          <div className="decision-badge-wrap">
            <DecisionBadge decision={passport.decision} />
          </div>
        </div>

        <div className="decision-score-panel">
          <div className="score-hero">
            <span className="score-big">{passport.score}</span>
            <span className="score-denom">/ 100</span>
          </div>

          <div className="decision-id-hero">
            <span className="id-label">Decision ID</span>
            <span className="id-code font-mono">{passport.decisionId}</span>
            <span className="id-caption">Save this ID for audit.</span>
          </div>
        </div>

        <div className="meta-card-row">
          <div className="meta-col">
            <span className="meta-title">Applicant</span>
            <span className="meta-info">{passport.applicantName || '—'}</span>
          </div>
          <div className="meta-col">
            <span className="meta-title">Monitored Group</span>
            <span className="meta-info font-medium">{passport.demographicGroup}</span>
            <span className="sub-caption">monitored only — never used in the credit decision</span>
          </div>
          <div className="meta-col">
            <span className="meta-title">Policy Version</span>
            <span className="meta-info font-mono">{passport.policyVersion}</span>
          </div>
          <div className="meta-col">
            <span className="meta-title">Algorithm Version</span>
            <span className="meta-info font-mono">{passport.algorithmVersion}</span>
          </div>
          <div className="meta-col">
            <span className="meta-title">Date</span>
            <span className="meta-info font-mono text-xs">{new Date(passport.createdAt).toUTCString()}</span>
          </div>
        </div>

        <div className="decision-reasons-section">
          <h3 className="section-title">Why this decision</h3>
          <ReasonCodeList reasonCodes={passport.reasonCodes} />
        </div>

        <ScoringDetail features={passport.features} />

        <div className="form-actions-split mt-6">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onGoToApplication}
          >
            New Application
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onGoToAuditor(passport.decisionId)}
          >
            Go to Auditor / Replay
          </button>
        </div>
      </div>
    </div>
  );
}
