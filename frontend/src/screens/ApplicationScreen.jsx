// frontend/src/screens/ApplicationScreen.jsx
// Screen 1: Application Form per Thinker 2 spec §1.1 & §5.1.

import React, { useState } from 'react';
import FinancialFields from '../components/FinancialFields';
import { submitApplication } from '../api';

const GOLDEN_PROFILE = {
  applicantName: 'Priya Sharma',
  demographicGroup: 'female',
  financials: {
    incomeSixMonths: ['45000', '45000', '45000', '45000', '45000', '45000'],
    monthsAtIncomeSource: '12',
    monthlyRent: '10000',
    rentOnTimeCount: '9',
    monthlyUtilities: '2500',
    utilityOnTimeCount: '10',
    monthlyOtherExpenses: '17500',
    savingsBalance: '40000',
    monthlyDebtPayments: '7000'
  }
};

const INITIAL_FORM = {
  applicantName: 'Priya Sharma',
  demographicGroup: 'female',
  financials: {
    incomeSixMonths: ['45000', '45000', '45000', '45000', '45000', '45000'],
    monthsAtIncomeSource: '12',
    monthlyRent: '10000',
    rentOnTimeCount: '9',
    monthlyUtilities: '2500',
    utilityOnTimeCount: '10',
    monthlyOtherExpenses: '17500',
    savingsBalance: '40000',
    monthlyDebtPayments: '7000'
  }
};

export default function ApplicationScreen({ onEvaluated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFinancialsChange = (nextFinancials) => {
    setForm(prev => ({ ...prev, financials: nextFinancials }));
  };

  const handleLoadDemo = () => {
    setForm(JSON.parse(JSON.stringify(GOLDEN_PROFILE)));
    setError(null);
  };

  const handleClearForm = () => {
    setForm({
      applicantName: '',
      demographicGroup: 'female',
      financials: {
        incomeSixMonths: ['', '', '', '', '', ''],
        monthsAtIncomeSource: '',
        monthlyRent: '',
        rentOnTimeCount: '',
        monthlyUtilities: '',
        utilityOnTimeCount: '',
        monthlyOtherExpenses: '',
        savingsBalance: '',
        monthlyDebtPayments: ''
      }
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Client pre-check per §1.1
    if (!form.demographicGroup) {
      setError('Please complete all fields before submitting.');
      return;
    }

    const fin = form.financials;
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
      setError('Please complete all fields before submitting.');
      return;
    }

    // 2. Prepare request payload per Appendix A §1.2 & §7.1
    const payload = {
      demographicGroup: form.demographicGroup,
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

    const trimmedName = (form.applicantName || '').trim();
    if (trimmedName.length > 0) {
      payload.applicantName = trimmedName;
    }

    setSubmitting(true);
    try {
      const passport = await submitApplication(payload);
      onEvaluated(passport);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="screen-section">
      <div className="section-header">
        <div>
          <span className="eyebrow">01 / INTAKE</span>
          <h2>Tell us about the applicant</h2>
          <p>A guided intake for cash-flow and payment history. Nothing is hidden behind a black box.</p>
        </div>
        <div className="section-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLoadDemo}
            disabled={submitting}
          >
            ✨ Load Priya's preset
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleClearForm}
            disabled={submitting}
          >
            ✕ Clear form
          </button>
        </div>
      </div>

      <div className="explain-banner">
        <div className="explain-icon">✨</div>
        <div>
          <strong>What is this?</strong>
          <p>
            ThinCred uses stable income, payment habits, and savings signals to create a reproducible credit score. Demographic data is monitored for fairness, never used to decide.
          </p>
        </div>
      </div>

      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="form-card-top">
          <div>
            <span className="card-kicker">APPLICATION PROFILE</span>
            <h3>Financial snapshot</h3>
          </div>
          <span className="secure-chip">🛡 Encrypted intake</span>
        </div>

        {/* Section 01: Applicant identity */}
        <div className="form-section">
          <div className="form-section-heading">
            <span className="section-number">01</span>
            <div>
              <h3>Applicant identity</h3>
              <p>Used to create the decision passport.</p>
            </div>
          </div>

          <div className="input-grid-2">
            <div className="form-field">
              <label htmlFor="applicantName">Full name</label>
              <input
                id="applicantName"
                type="text"
                maxLength={100}
                placeholder="e.g. Priya Sharma"
                value={form.applicantName}
                disabled={submitting}
                onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label htmlFor="demographicGroup">Demographic group</label>
              <select
                id="demographicGroup"
                value={form.demographicGroup}
                disabled={submitting}
                onChange={(e) => setForm({ ...form, demographicGroup: e.target.value })}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              {/* Mandatory label text exact string per Blueprint §4 F1 */}
              <span className="field-disclosure">
                collected for fairness monitoring only — never used in the credit decision.
              </span>
            </div>
          </div>
        </div>

        {/* Sections 02 & 03: Financial Fields */}
        <FinancialFields
          values={form.financials}
          onChange={handleFinancialsChange}
          disabled={submitting}
        />

        {error && (
          <div className="alert-box alert-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-actions">
          <span>✅ Ready to evaluate</span>
          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={submitting}
          >
            {submitting ? 'Evaluating…' : 'Evaluate credit →'}
          </button>
        </div>
      </form>
    </section>
  );
}

