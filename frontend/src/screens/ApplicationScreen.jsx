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
  applicantName: '',
  demographicGroup: '',
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
};

export default function ApplicationScreen({ onEvaluated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFinancialsChange = (nextFinancials) => {
    setForm(prev => ({ ...prev, financials: nextFinancials }));
  };

  const handleLoadDemo = () => {
    setForm(GOLDEN_PROFILE);
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
    <div className="screen-container">
      <div className="card-box form-card">
        <div className="screen-header">
          <h2 className="screen-title">ThinCred — Application</h2>
          <p className="screen-subtitle">Enter financial information to compute an interpretable credit decision.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">Applicant</h3>
            <div className="fields-grid-2">
              <div className="field-block">
                <label className="field-label" htmlFor="applicantName">Applicant name (optional)</label>
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

              <div className="field-block">
                <label className="field-label">Monitored demographic field</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="demographicGroup"
                      value="female"
                      checked={form.demographicGroup === 'female'}
                      disabled={submitting}
                      onChange={(e) => setForm({ ...form, demographicGroup: e.target.value })}
                    />
                    <span>female</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="demographicGroup"
                      value="male"
                      checked={form.demographicGroup === 'male'}
                      disabled={submitting}
                      onChange={(e) => setForm({ ...form, demographicGroup: e.target.value })}
                    />
                    <span>male</span>
                  </label>
                </div>
                {/* Mandatory label text exact string per Blueprint §4 F1 */}
                <p className="mandatory-demographic-caption">
                  collected for fairness monitoring only — never used in the credit decision.
                </p>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Financial Information</h3>
            <FinancialFields
              values={form.financials}
              onChange={handleFinancialsChange}
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="alert-box alert-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-actions-split">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleLoadDemo}
              disabled={submitting}
            >
              Load demo profile
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Evaluating…' : 'Evaluate Credit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
