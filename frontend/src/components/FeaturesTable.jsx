// frontend/src/components/FeaturesTable.jsx
// Stored features table for Auditor screen per Thinker 2 spec §1.3.

import React from 'react';

export default function FeaturesTable({ features }) {
  if (!features) return null;

  return (
    <div className="features-table-wrapper">
      <h4 className="detail-subheading">Computed Intermediate Features</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Factor</th>
            <th className="text-right">Factor Score</th>
            <th className="text-right">Max Points</th>
            <th className="text-right">Points Earned</th>
          </tr>
        </thead>
        <tbody>
          {(features.factorResults || []).map((fr) => (
            <tr key={fr.factor}>
              <td className="font-mono">{fr.factor}</td>
              <td className="text-right">{typeof fr.factorScore === 'number' ? fr.factorScore.toFixed(4) : fr.factorScore}</td>
              <td className="text-right">{typeof fr.maxPoints === 'number' ? fr.maxPoints.toFixed(2) : fr.maxPoints}</td>
              <td className="text-right">{typeof fr.points === 'number' ? fr.points.toFixed(1) : fr.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="meta-block">
        <p><strong>Weight Scale Factor:</strong> {features.weightScaleFactor}</p>
        <p><strong>Active Factors:</strong> {features.activeFactorCodes?.join(', ')}</p>
        <p><strong>Inactive Factors:</strong> {features.inactiveFactorCodes?.length > 0 ? features.inactiveFactorCodes.join(', ') : 'None'}</p>
      </div>
    </div>
  );
}
