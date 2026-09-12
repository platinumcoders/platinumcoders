// frontend/src/screens/FairnessScreen.jsx
// Screen 4: Fairness Monitoring per Thinker 2 spec §1.4 & §5.4.
// Adheres strictly to F5: fairness is monitored; the forbidden p-word is prohibited.

import React, { useState, useEffect } from 'react';
import { getFairnessSummary, runCounterfactual } from '../api';
import GroupSummaryTable from '../components/GroupSummaryTable';
import CounterfactualPanel from '../components/CounterfactualPanel';

const GOLDEN_FINANCIALS = {
  incomeSixMonths: ['45000', '45000', '45000', '45000', '45000', '45000'],
  monthsAtIncomeSource: '12',
  monthlyRent: '10000',
  rentOnTimeCount: '9',
  monthlyUtilities: '2500',
  utilityOnTimeCount: '10',
  monthlyOtherExpenses: '17500',
  savingsBalance: '40000',
  monthlyDebtPayments: '7000'
};

export default function FairnessScreen() {
  // Section A State: Group Summary
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // Section B State: Counterfactual Test
  const [cfForm, setCfForm] = useState({
    demographicA: 'female',
    demographicB: 'male',
    financials: GOLDEN_FINANCIALS
  });
  const [cfSubmitting, setCfSubmitting] = useState(false);
  const [cfResult, setCfResult] = useState(null);
  const [cfError, setCfError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await getFairnessSummary();
      setSummary(data);
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleRunCounterfactual = async () => {
    setCfError(null);

    // Rule 3': demographicA and demographicB must be distinct
    if (cfForm.demographicA === cfForm.demographicB) {
      setCfError('Choose two different demographic values.');
      return;
    }

    const fin = cfForm.financials;
    const isRentZero = fin.monthlyRent === 0 || fin.monthlyRent === '0';
    const isUtilZero = fin.monthlyUtilities === 0 || fin.monthlyUtilities === '0';

    const incomeValid =
      Array.isArray(fin.incomeSixMonths) &&
      fin.incomeSixMonths.length === 6 &&
      fin.incomeSixMonths.every(v => v !== '' && !isNaN(Number(v)) && isFinite(Number(v)));

    const otherFieldsValid =
      fin.monthsAtIncomeSource !== '' && !isNaN(Number(fin.monthsAtIncomeSource)) &&
      fin.monthlyRent !== '' && !isNaN(Number(fin.monthlyRent)) &&
      (isRentZero || (fin.rentOnTimeCount !== '' && !isNaN(Number(fin.rentOnTimeCount)))) &&
      fin.monthlyUtilities !== '' && !isNaN(Number(fin.monthlyUtilities)) &&
      (isUtilZero || (fin.utilityOnTimeCount !== '' && !isNaN(Number(fin.utilityOnTimeCount)))) &&
      fin.monthlyOtherExpenses !== '' && !isNaN(Number(fin.monthlyOtherExpenses)) &&
      fin.savingsBalance !== '' && !isNaN(Number(fin.savingsBalance)) &&
      fin.monthlyDebtPayments !== '' && !isNaN(Number(fin.monthlyDebtPayments));

    if (!incomeValid || !otherFieldsValid) {
      setCfError('Please complete all fields before submitting.');
      return;
    }

    const payload = {
      demographicA: cfForm.demographicA,
      demographicB: cfForm.demographicB,
      financials: {
        incomeSixMonths: fin.incomeSixMonths.map(Number),
        monthsAtIncomeSource: Number(fin.monthsAtIncomeSource),
        monthlyRent: Number(fin.monthlyRent),
        rentOnTimeCount: isRentZero ? 0 : Number(fin.rentOnTimeCount),
        monthlyUtilities: Number(fin.monthlyUtilities),
        utilityOnTimeCount: isUtilZero ? 0 : Number(fin.utilityOnTimeCount),
        monthlyOtherExpenses: Number(fin.monthlyOtherExpenses),
        savingsBalance: Number(fin.savingsBalance),
        monthlyDebtPayments: Number(fin.monthlyDebtPayments)
      }
    };

    setCfSubmitting(true);
    try {
      const data = await runCounterfactual(payload);
      setCfResult(data);
    } catch (err) {
      setCfError(err.message);
    } finally {
      setCfSubmitting(false);
    }
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h2 className="screen-title">Fairness Monitoring</h2>
        <p className="screen-subtitle">
          Fairness is monitored. Group outcomes are compared, and the scoring engine's invariance to the monitored demographic field is demonstrated by a counterfactual test.
        </p>
      </div>

      {/* Section A: Group Summary */}
      <div className="card-box fairness-section">
        <div className="section-header-split">
          <h3 className="section-title">Monitoring A — Group Demographic Summary</h3>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchSummary}
            disabled={summaryLoading}
          >
            {summaryLoading ? 'Refreshing…' : 'Refresh Summary'}
          </button>
        </div>

        {summaryLoading && <p className="loading-text">Loading group summary…</p>}
        {summaryError && <div className="alert-box alert-error">{summaryError}</div>}
        {!summaryLoading && !summaryError && <GroupSummaryTable summary={summary} />}
      </div>

      {/* Section B: Counterfactual Test */}
      <div className="fairness-section mt-6">
        <CounterfactualPanel
          form={cfForm}
          onChange={setCfForm}
          submitting={cfSubmitting}
          result={cfResult}
          error={cfError}
          onSubmit={handleRunCounterfactual}
        />
      </div>
    </div>
  );
}
