// frontend/src/components/PassportView.jsx
// Stored Decision Passport view per Thinker 2 spec §1.3.

import React from 'react';
import DecisionBadge from './DecisionBadge';
import ReasonCodeList from './ReasonCodeList';
import FinancialSnapshotTable from './FinancialSnapshotTable';
import FeaturesTable from './FeaturesTable';

export default function PassportView({ passport }) {
  if (!passport) return null;

  return (
    <div className="passport-view-card">
      <div className="passport-header-row">
        <div>
          <span className="passport-label">Decision ID</span>
          <span className="passport-id font-mono">{passport.decisionId}</span>
        </div>
        <div>
          <span className="passport-label">Applicant Name</span>
          <span className="passport-value">{passport.applicantName || '—'}</span>
        </div>
        <div>
          <span className="passport-label">Demographic Group</span>
          <span className="passport-value">{passport.demographicGroup}</span>
          <span className="sub-caption">monitored only — never used in the credit decision</span>
        </div>
        <div>
          <span className="passport-label">Timestamp</span>
          <span className="passport-value font-mono">{new Date(passport.createdAt).toUTCString()}</span>
        </div>
      </div>

      <div className="passport-result-row">
        <div className="score-box">
          <span className="score-num">{passport.score}</span>
          <span className="score-denom">/ 100</span>
        </div>
        <div className="decision-box">
          <DecisionBadge decision={passport.decision} />
        </div>
        <div className="version-box">
          <p><strong>Policy Version:</strong> <span className="font-mono">{passport.policyVersion}</span></p>
          <p><strong>Algorithm Version:</strong> <span className="font-mono">{passport.algorithmVersion}</span></p>
        </div>
      </div>

      <div className="passport-section">
        <h4 className="detail-subheading">Stored Reason Codes</h4>
        <ReasonCodeList reasonCodes={passport.reasonCodes} />
      </div>

      <FinancialSnapshotTable financialSnapshot={passport.financialSnapshot} />
      <FeaturesTable features={passport.features} />
    </div>
  );
}
