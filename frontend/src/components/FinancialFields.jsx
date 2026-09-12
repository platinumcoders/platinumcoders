// frontend/src/components/FinancialFields.jsx
// Reusable controlled component for the 9 financial fields per Thinker 2 spec §1.1 & §2.
// All monetary fields increment/decrement by 1000 via arrows (step="1000").
// Non-monetary fields (tenure months, count of on-time payments) use step="1".

import React from 'react';

export default function FinancialFields({ values, onChange, disabled = false }) {
  const isRentZero = values.monthlyRent === 0 || values.monthlyRent === '0';
  const isUtilitiesZero = values.monthlyUtilities === 0 || values.monthlyUtilities === '0';

  const handleFieldChange = (field, nextVal) => {
    const updated = { ...values, [field]: nextVal };

    // Appendix A §7.1 order 10 & 13: automatic coupling zeroing
    if (field === 'monthlyRent' && (nextVal === 0 || nextVal === '0')) {
      updated.rentOnTimeCount = '0';
    }
    if (field === 'monthlyUtilities' && (nextVal === 0 || nextVal === '0')) {
      updated.utilityOnTimeCount = '0';
    }

    onChange(updated);
  };

  const handleIncomeChange = (index, nextVal) => {
    const nextIncomes = [...(values.incomeSixMonths || ['', '', '', '', '', ''])];
    nextIncomes[index] = nextVal;
    onChange({ ...values, incomeSixMonths: nextIncomes });
  };

  const toggleRentNotApply = (checked) => {
    if (checked) {
      handleFieldChange('monthlyRent', '0');
    } else {
      handleFieldChange('monthlyRent', '10000');
    }
  };

  const toggleUtilNotApply = (checked) => {
    if (checked) {
      handleFieldChange('monthlyUtilities', '0');
    } else {
      handleFieldChange('monthlyUtilities', '2500');
    }
  };

  return (
    <>
      {/* Form Section 02: Income & stability */}
      <div className="form-section">
        <div className="form-section-heading">
          <span className="section-number">02</span>
          <div>
            <h3>Income &amp; stability</h3>
            <p>Give us six months of income to understand consistency.</p>
          </div>
        </div>

        <label className="field-label">Monthly income for past 6 months (₹)</label>
        <div className="income-grid">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="month-input">
              <span>M{idx + 1}</span>
              <input
                type="number"
                min="0"
                max="10000000"
                step="1000"
                placeholder="0"
                value={values.incomeSixMonths?.[idx] ?? ''}
                disabled={disabled}
                onChange={(e) => handleIncomeChange(idx, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="input-grid-2 single-extra">
          <div className="form-field">
            <label htmlFor="monthsAtIncomeSource">Tenure at current income source (months)</label>
            <input
              id="monthsAtIncomeSource"
              type="number"
              min="0"
              max="600"
              step="1"
              placeholder="e.g. 12"
              value={values.monthsAtIncomeSource ?? ''}
              disabled={disabled}
              onChange={(e) => handleFieldChange('monthsAtIncomeSource', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Form Section 03: Expenses, utilities & debts */}
      <div className="form-section">
        <div className="form-section-heading">
          <span className="section-number">03</span>
          <div>
            <h3>Expenses, utilities &amp; debts</h3>
            <p>Monthly obligations help us calculate resilience.</p>
          </div>
        </div>

        <div className="input-grid-2">
          <div className="form-field">
            <label htmlFor="monthlyRent">Monthly rent (₹)</label>
            <input
              id="monthlyRent"
              type="number"
              min="0"
              max="10000000"
              step="any"
              placeholder="e.g. 10000"
              value={values.monthlyRent ?? ''}
              disabled={disabled}
              onChange={(e) => handleFieldChange('monthlyRent', e.target.value)}
            />
            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={isRentZero}
                disabled={disabled}
                onChange={(e) => toggleRentNotApply(e.target.checked)}
              />
              Rent does not apply
            </label>
          </div>

          <div className="form-field">
            <label htmlFor="rentOnTimeCount">On-time rent payments (last 12 months)</label>
            <input
              id="rentOnTimeCount"
              type="number"
              min="0"
              max="12"
              step="1"
              placeholder={isRentZero ? 'Disabled (rent is 0)' : 'e.g. 9'}
              value={isRentZero ? '0' : (values.rentOnTimeCount ?? '')}
              disabled={disabled || isRentZero}
              onChange={(e) => handleFieldChange('rentOnTimeCount', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="monthlyUtilities">Monthly utilities (₹)</label>
            <input
              id="monthlyUtilities"
              type="number"
              min="0"
              max="10000000"
              step="any"
              placeholder="e.g. 2500"
              value={values.monthlyUtilities ?? ''}
              disabled={disabled}
              onChange={(e) => handleFieldChange('monthlyUtilities', e.target.value)}
            />
            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={isUtilitiesZero}
                disabled={disabled}
                onChange={(e) => toggleUtilNotApply(e.target.checked)}
              />
              Utilities do not apply
            </label>
          </div>

          <div className="form-field">
            <label htmlFor="utilityOnTimeCount">On-time utility payments (last 12 months)</label>
            <input
              id="utilityOnTimeCount"
              type="number"
              min="0"
              max="12"
              step="1"
              placeholder={isUtilitiesZero ? 'Disabled (utilities is 0)' : 'e.g. 10'}
              value={isUtilitiesZero ? '0' : (values.utilityOnTimeCount ?? '')}
              disabled={disabled || isUtilitiesZero}
              onChange={(e) => handleFieldChange('utilityOnTimeCount', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="monthlyOtherExpenses">Other monthly living expenses (₹)</label>
            <input
              id="monthlyOtherExpenses"
              type="number"
              min="0"
              max="10000000"
              step="any"
              placeholder="e.g. 17500"
              value={values.monthlyOtherExpenses ?? ''}
              disabled={disabled}
              onChange={(e) => handleFieldChange('monthlyOtherExpenses', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="monthlyDebtPayments">Existing monthly debt obligations (₹)</label>
            <input
              id="monthlyDebtPayments"
              type="number"
              min="0"
              max="10000000"
              step="any"
              placeholder="e.g. 7000"
              value={values.monthlyDebtPayments ?? ''}
              disabled={disabled}
              onChange={(e) => handleFieldChange('monthlyDebtPayments', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="savingsBalance">Total savings balance (₹)</label>
            <input
              id="savingsBalance"
              type="number"
              min="0"
              max="1000000000"
              step="any"
              placeholder="e.g. 40000"
              value={values.savingsBalance ?? ''}
              disabled={disabled}
              onChange={(e) => handleFieldChange('savingsBalance', e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

