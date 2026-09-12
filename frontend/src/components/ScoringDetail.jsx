// frontend/src/components/ScoringDetail.jsx
// Collapsible scoring features breakdown per Thinker 2 spec §1.2.

import React, { useState } from 'react';

export default function ScoringDetail({ features }) {
  const [open, setOpen] = useState(false);

  if (!features) return null;

  return (
    <div className="scoring-detail-card">
      <button
        type="button"
        className="collapse-toggle-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>Scoring Detail &amp; Factor Features</span>
        <span className="toggle-icon">{open ? '▲ Collapse' : '▼ Expand'}</span>
      </button>

      {open && (
        <div className="scoring-detail-content">
          <h4 className="detail-subheading">Factor Score &amp; Points Breakdown</h4>
          <table className="data-table">
            <thead>
              <tr>
                <th>Factor</th>
                <th className="text-right">Factor Score (0–1)</th>
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

          <h4 className="detail-subheading">Intermediate Quantities</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Weight Scale Factor</span>
              <span className="metric-val font-mono">{features.weightScaleFactor}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Mean Monthly Income</span>
              <span className="metric-val">₹{features.meanMonthlyIncome?.toLocaleString()}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Income Volatility (CV)</span>
              <span className="metric-val font-mono">{features.incomeCoefficientOfVariation}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Total Monthly Expenses</span>
              <span className="metric-val">₹{features.totalMonthlyExpenses?.toLocaleString()}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Monthly Cash-Flow Surplus</span>
              <span className="metric-val">₹{features.monthlySurplus?.toLocaleString()}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Surplus Ratio</span>
              <span className="metric-val font-mono">{features.surplusRatio}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Debt-to-Income Ratio</span>
              <span className="metric-val font-mono">{features.debtToIncomeRatio}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Savings Months Covered</span>
              <span className="metric-val font-mono">{features.savingsMonthsCovered}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Rent On-Time Ratio</span>
              <span className="metric-val font-mono">{features.rentOnTimeRatio}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Utility On-Time Ratio</span>
              <span className="metric-val font-mono">{features.utilityOnTimeRatio}</span>
            </div>
          </div>

          <div className="meta-block">
            <p><strong>Active Factor Codes:</strong> {features.activeFactorCodes?.join(', ') || 'None'}</p>
            <p><strong>Inactive Factor Codes:</strong> {features.inactiveFactorCodes?.length > 0 ? features.inactiveFactorCodes.join(', ') : 'None (all active)'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
