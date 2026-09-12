// frontend/src/components/GroupSummaryTable.jsx
// Group demographic summary table per Thinker 2 spec §1.4.

import React from 'react';

export default function GroupSummaryTable({ summary }) {
  if (!summary || summary.totalDecisions === 0 || !summary.groups || summary.groups.length === 0) {
    return (
      <div className="empty-state-card">
        <p>No decisions yet. Run the seed or submit an application.</p>
      </div>
    );
  }

  return (
    <div className="group-summary-wrapper">
      <div className="summary-meta-row">
        <span><strong>Total Decisions Evaluated:</strong> {summary.totalDecisions}</span>
        <span><strong>Generated At:</strong> <span className="font-mono">{new Date(summary.generatedAt).toUTCString()}</span></span>
      </div>

      <div className="table-responsive">
        <table className="data-table summary-table">
          <thead>
            <tr>
              <th>Demographic Group</th>
              <th className="text-right">Applications</th>
              <th className="text-right">Approvals</th>
              <th className="text-right">Reviews</th>
              <th className="text-right">Declines</th>
              <th className="text-right">Approval Rate</th>
              <th className="text-right">Average Score</th>
              <th className="text-right">Score Range</th>
            </tr>
          </thead>
          <tbody>
            {summary.groups.map((g) => {
              const approvalPct = g.approvalRate !== null ? `${(g.approvalRate * 100).toFixed(1)}%` : '—';
              const avgScore = g.averageScore !== null ? g.averageScore.toFixed(2) : '—';
              const scoreRange = g.minScore !== null && g.maxScore !== null ? `${g.minScore} – ${g.maxScore}` : '—';

              return (
                <tr key={g.demographicGroup}>
                  <td className="font-semibold">{g.demographicGroup}</td>
                  <td className="text-right font-mono">{g.applicationCount}</td>
                  <td className="text-right font-mono text-success">{g.approveCount}</td>
                  <td className="text-right font-mono text-warning">{g.reviewCount}</td>
                  <td className="text-right font-mono text-danger">{g.declineCount}</td>
                  <td className="text-right font-mono">{approvalPct}</td>
                  <td className="text-right font-mono">{avgScore}</td>
                  <td className="text-right font-mono">{scoreRange}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
