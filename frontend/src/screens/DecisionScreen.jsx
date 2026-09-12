// frontend/src/screens/DecisionScreen.jsx
// Screen 2: Decision Display per Thinker 2 spec §1.2 & §5.2.

import React from 'react';
import ScoringDetail from '../components/ScoringDetail';

export default function DecisionScreen({ passport, onGoToAuditor, onGoToApplication }) {
  if (!passport) {
    return (
      <section className="screen-section">
        <div className="card empty-state-box" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 className="section-title">No decision yet.</h3>
          <p className="caption-text" style={{ color: '#8f8f8f', margin: '8px 0 20px' }}>
            Submit an application first to view decision details.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onGoToApplication}
          >
            Go to Application →
          </button>
        </div>
      </section>
    );
  }

  const score = passport.score;
  const decision = passport.decision; // 'APPROVE' | 'REVIEW' | 'DECLINE'

  // Conic gradient for score circle
  const scoreColor = decision === 'APPROVE' ? '#00a66a' : decision === 'REVIEW' ? '#f5a623' : '#e02424';
  const scoreCircleStyle = {
    background: `radial-gradient(closest-side, var(--bg-card, #fff) 79%, transparent 80% 100%), conic-gradient(${scoreColor} ${score}%, var(--bg-subtle, #f2f2f2) 0)`
  };

  const decisionTitle =
    decision === 'APPROVE'
      ? 'Credit Approved'
      : decision === 'REVIEW'
      ? 'Manual underwriter review'
      : 'Credit Declined';

  // Split reason codes into risks and positives
  const riskCodes = (passport.reasonCodes || []).filter(r => r.polarity === 'risk');
  const positiveCodes = (passport.reasonCodes || []).filter(r => r.polarity === 'positive');

  return (
    <section className="screen-section">
      <div className="section-header">
        <div>
          <span className="eyebrow">02 / DECISION</span>
          <h2>Credit decision result</h2>
          <p>A decision you can explain, defend, and reproduce.</p>
        </div>
        <div className="section-actions">
          <span className="decision-id-tag">
            DECISION ID <strong>{passport.decisionId}</strong>
          </span>
        </div>
      </div>

      <div className="decision-layout">
        {/* Left: Decision summary card */}
        <div className="card decision-summary-card">
          <div className="summary-top">
            <span className="card-kicker">CURRENT OUTCOME</span>
            <span className={`badge badge-${decision.toLowerCase()}`}>
              {decision}
            </span>
          </div>

          <div className="score-row">
            <div className="score-circle" style={scoreCircleStyle}>
              <span className="score-number">{score}</span>
              <span className="score-max">/ 100</span>
            </div>

            <div className="decision-meta">
              <h3>{decisionTitle}</h3>
              <p>Your application was evaluated deterministically using the active policy.</p>
              <div className="version-tags">
                <span>Policy {passport.policyVersion}</span>
                <span>Algorithm v{passport.algorithmVersion}</span>
              </div>
            </div>
          </div>

          <div className="score-scale">
            <span>0</span>
            <div>
              <i style={{ width: `${score}%`, background: scoreColor }}></i>
            </div>
            <span>100</span>
          </div>
        </div>

        {/* Right: Decision side card */}
        <div className="card decision-side-card">
          <span className="card-kicker">DECISION PASSPORT</span>
          <div className="side-stat">
            <span>Created</span>
            <strong>{new Date(passport.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
          </div>
          <div className="side-stat">
            <span>Signals evaluated</span>
            <strong>08</strong>
          </div>
          <div className="side-stat">
            <span>Reproducibility</span>
            <strong className="text-positive">✓ Verified</strong>
          </div>
        </div>
      </div>

      {/* Structured Reason Codes Card */}
      <div className="card reason-codes-card">
        <div className="card-heading-row">
          <div>
            <span className="card-kicker">STRUCTURED EXPLANATION</span>
            <h3>Decision reason codes</h3>
            <p>Ordered, auditable factors behind this outcome.</p>
          </div>
          <span className="no-black-box">🗂 No black box</span>
        </div>

        <div className="reason-codes-grid">
          {/* Risk Factors */}
          <div className="reason-column">
            <div className="reason-column-title">
              <div>
                <h4>Risk factors</h4>
                <span>Factors that require attention</span>
              </div>
              <span className="tone-indicator risk"></span>
            </div>
            <ul className="reason-list">
              {riskCodes.length === 0 ? (
                <li className="reason-item">
                  <div className="reason-content">
                    <span>No adverse risk factors identified.</span>
                  </div>
                </li>
              ) : (
                riskCodes.map((r, i) => (
                  <li key={i} className="reason-item risk">
                    <span className="polarity-tag">RISK</span>
                    <div className="reason-content">
                      <strong>{r.code}</strong>
                      <span>{r.label}</span>
                    </div>
                    <span className="reason-points">+{Number(r.points).toFixed(1)} pts</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Positive Offsets */}
          <div className="reason-column">
            <div className="reason-column-title">
              <div>
                <h4>Positive offsets</h4>
                <span>Signals strengthening the profile</span>
              </div>
              <span className="tone-indicator positive"></span>
            </div>
            <ul className="reason-list">
              {positiveCodes.length === 0 ? (
                <li className="reason-item">
                  <div className="reason-content">
                    <span>No positive offset factors identified.</span>
                  </div>
                </li>
              ) : (
                positiveCodes.map((r, i) => (
                  <li key={i} className="reason-item positive">
                    <span className="polarity-tag">POSITIVE</span>
                    <div className="reason-content">
                      <strong>{r.code}</strong>
                      <span>{r.label}</span>
                    </div>
                    <span className="reason-points">+{Number(r.points).toFixed(1)} pts</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Factor scoring details */}
      <div className="card passport-detail-card" style={{ marginBottom: '16px' }}>
        <ScoringDetail features={passport.features} />
      </div>

      <div className="screen-footer-action">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onGoToApplication}
        >
          New application
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onGoToAuditor(passport.decisionId)}
        >
          Audit / replay decision →
        </button>
      </div>
    </section>
  );
}

