// frontend/src/components/FinancialSnapshotTable.jsx
// Stored financial snapshot table per Thinker 2 spec §1.3.

import React from 'react';

export default function FinancialSnapshotTable({ financialSnapshot }) {
  if (!financialSnapshot) return null;

  return (
    <div className="snapshot-table-wrapper">
      <h4 className="detail-subheading">Stored Financial Snapshot</h4>
      <table className="data-table">
        <tbody>
          <tr>
            <td>Income 6 Months (Oldest → Recent)</td>
            <td className="text-right font-mono">
              [{financialSnapshot.incomeSixMonths?.map(n => `₹${n.toLocaleString()}`).join(', ')}]
            </td>
          </tr>
          <tr>
            <td>Months at Income Source</td>
            <td className="text-right font-mono">{financialSnapshot.monthsAtIncomeSource} months</td>
          </tr>
          <tr>
            <td>Monthly Rent</td>
            <td className="text-right font-mono">₹{financialSnapshot.monthlyRent?.toLocaleString()}</td>
          </tr>
          <tr>
            <td>On-Time Rent Payments (last 12 mo)</td>
            <td className="text-right font-mono">{financialSnapshot.rentOnTimeCount} / 12</td>
          </tr>
          <tr>
            <td>Monthly Utilities</td>
            <td className="text-right font-mono">₹{financialSnapshot.monthlyUtilities?.toLocaleString()}</td>
          </tr>
          <tr>
            <td>On-Time Utility Payments (last 12 mo)</td>
            <td className="text-right font-mono">{financialSnapshot.utilityOnTimeCount} / 12</td>
          </tr>
          <tr>
            <td>Other Monthly Expenses</td>
            <td className="text-right font-mono">₹{financialSnapshot.monthlyOtherExpenses?.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Savings Balance</td>
            <td className="text-right font-mono">₹{financialSnapshot.savingsBalance?.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Monthly Debt Payments (EMI)</td>
            <td className="text-right font-mono">₹{financialSnapshot.monthlyDebtPayments?.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
