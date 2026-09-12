// frontend/src/components/DecisionBadge.jsx
import React from 'react';

export default function DecisionBadge({ decision }) {
  const norm = (decision || '').toUpperCase();
  let badgeClass = 'badge-review';
  if (norm === 'APPROVE') badgeClass = 'badge-approve';
  else if (norm === 'DECLINE') badgeClass = 'badge-decline';

  return (
    <span className={`decision-badge ${badgeClass}`}>
      {decision || '—'}
    </span>
  );
}
