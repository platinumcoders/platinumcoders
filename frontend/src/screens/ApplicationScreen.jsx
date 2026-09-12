// frontend/src/screens/ApplicationScreen.jsx
// Screen 1: Application Form per Thinker 2 spec §1.1 & §5.1.

import React, { useState, useRef } from 'react';
import FinancialFields from '../components/FinancialFields';
import { submitApplication } from '../api';

const DEMO_PROFILES = {
  priya: {
    applicantName: 'Priya Sharma',
    demographicGroup: 'female',
    band: 'REVIEW ~58',
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
  },
  aarav: {
    applicantName: 'Aarav Patel',
    demographicGroup: 'male',
    band: 'APPROVE ~96',
    financials: {
      incomeSixMonths: ['85000', '85000', '85000', '85000', '85000', '85000'],
      monthsAtIncomeSource: '40',
      monthlyRent: '16000',
      rentOnTimeCount: '12',
      monthlyUtilities: '3500',
      utilityOnTimeCount: '12',
      monthlyOtherExpenses: '20000',
      savingsBalance: '220000',
      monthlyDebtPayments: '4000'
    }
  },
  meera: {
    applicantName: 'Meera Iyer',
    demographicGroup: 'female',
    band: 'APPROVE ~85',
    financials: {
      incomeSixMonths: ['60000', '60000', '60000', '60000', '60000', '60000'],
      monthsAtIncomeSource: '24',
      monthlyRent: '0',
      rentOnTimeCount: '0',
      monthlyUtilities: '3000',
      utilityOnTimeCount: '12',
      monthlyOtherExpenses: '18000',
      savingsBalance: '110000',
      monthlyDebtPayments: '5000'
    }
  },
  rahul: {
    applicantName: 'Rahul Verma',
    demographicGroup: 'male',
    band: 'DECLINE ~23',
    financials: {
      incomeSixMonths: ['30000', '28000', '32000', '25000', '30000', '27000'],
      monthsAtIncomeSource: '8',
      monthlyRent: '12000',
      rentOnTimeCount: '6',
      monthlyUtilities: '2500',
      utilityOnTimeCount: '7',
      monthlyOtherExpenses: '12000',
      savingsBalance: '5000',
      monthlyDebtPayments: '11000'
    }
  }
};

const INITIAL_FORM = JSON.parse(JSON.stringify(DEMO_PROFILES.priya));

export default function ApplicationScreen({ onEvaluated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activePreset, setActivePreset] = useState('priya');
  const [isLoadedPulse, setIsLoadedPulse] = useState(false);
  const [loadedBadge, setLoadedBadge] = useState(null);
  const formRef = useRef(null);

  const handleFinancialsChange = (nextFinancials) => {
    setForm(prev => ({ ...prev, financials: nextFinancials }));
  };

  const handleLoadProfile = (key) => {
    const profile = DEMO_PROFILES[key];
    if (profile) {
      setForm(JSON.parse(JSON.stringify(profile)));
      setError(null);
      setActivePreset(key);
      setLoadedBadge({
        name: profile.applicantName,
        band: profile.band
      });
      setIsLoadedPulse(true);
      setTimeout(() => setIsLoadedPulse(false), 1300);

      // Smooth animated scroll down to the populated values
      setTimeout(() => {
        if (formRef.current) {
          const yOffset = -84; // clearance for sticky topbar
          const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
          const targetY = formRef.current.getBoundingClientRect().top + currentScroll + yOffset;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }, 35);
    }
  };

  const handleClearForm = () => {
    setActivePreset(null);
    setLoadedBadge(null);
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
            className={`btn btn-secondary ${activePreset === 'priya' ? 'active-preset' : ''}`}
            onClick={() => handleLoadProfile('priya')}
            disabled={submitting}
            title="Score ~58 (REVIEW)"
          >
            👤 Priya (Review)
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${activePreset === 'aarav' ? 'active-preset' : ''}`}
            onClick={() => handleLoadProfile('aarav')}
            disabled={submitting}
            title="Score ~96 (APPROVE)"
          >
            ⭐ Aarav (Approve)
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${activePreset === 'meera' ? 'active-preset' : ''}`}
            onClick={() => handleLoadProfile('meera')}
            disabled={submitting}
            title="Score ~85 (APPROVE - No Rent)"
          >
            🏡 Meera (Approve - No Rent)
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${activePreset === 'rahul' ? 'active-preset' : ''}`}
            onClick={() => handleLoadProfile('rahul')}
            disabled={submitting}
            title="Score ~23 (DECLINE)"
          >
            ⚠️ Rahul (Decline)
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleClearForm}
            disabled={submitting}
          >
            ✕ Clear
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

      <form
        ref={formRef}
        noValidate
        className={`card form-card ${isLoadedPulse ? 'profile-loaded' : ''}`}
        onSubmit={handleSubmit}
      >
        <div className="form-card-top">
          <div>
            <span className="card-kicker">APPLICATION PROFILE</span>
            <h3>Financial snapshot</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {loadedBadge && (
              <span className="preset-loaded-badge">
                ✨ Loaded {loadedBadge.name} ({loadedBadge.band})
              </span>
            )}
            <span className="secure-chip">🛡 Encrypted intake</span>
          </div>
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

