// frontend/src/components/ReasonCodeList.jsx
// Renders reason codes in exact API-returned canonical order per Appendix A §2.4 & Thinker 2 spec §1.2.

import React from 'react';

export default function ReasonCodeList({ reasonCodes = [] }) {
  if (!reasonCodes || reasonCodes.length === 0) {
    return <p className="text-muted">No reason codes emitted.</p>;
  }

  return (
    <div className="reason-codes-container">
      <p className="caption-text">
        Factor contributions to credit score (structured reason codes; not automated narratives).
      </p>
      <div className="reason-codes-list">
        {reasonCodes.map((item, idx) => {
          const isPositive = item.polarity === 'positive';
          const pointsDisplay = typeof item.points === 'number' ? item.points.toFixed(1) : item.points;

          return (
            <div key={`${item.code}-${idx}`} className={`reason-code-card ${isPositive ? 'is-pos' : 'is-risk'}`}>
              <div className="reason-code-main">
                <span className={`polarity-badge ${isPositive ? 'badge-pos' : 'badge-risk'}`}>
                  {isPositive ? 'positive' : 'risk'}
                </span>
                <span className="reason-code-label">{item.label}</span>
              </div>
              <div className="reason-code-meta">
                <span className="reason-code-code">{item.code}</span>
                <span className="reason-code-points">{pointsDisplay} pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
