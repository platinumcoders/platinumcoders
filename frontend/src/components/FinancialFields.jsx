// frontend/src/components/FinancialFields.jsx
// Reusable controlled component for the 9 financial fields per Thinker 2 spec §1.1 & §2.

import React from 'react';

const MONTH_LABELS = [
  'Month 1 (oldest)',
  'Month 2',
  'Month 3',
  'Month 4',
  'Month 5',
  'Month 6 (most recent)'
];

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

  return (
    <div className="financial-fields-section">
      <div className="form-group-full">
        <label className="section-subtitle">Monthly Income History (₹) — 6 Months</label>
        <div className="income-grid">
          {MONTH_LABELS.map((label, idx) => (
            <div key={idx} className="field-block">
              <label className="field-label" htmlFor={`income-${idx}`}>{label}</label>
              <input
                id={`income-${idx}`}
                type="number"
                min="0"
                max="10000000"
                step="any"
                placeholder="₹ Amount"
                value={values.incomeSixMonths?.[idx] ?? ''}
                disabled={disabled}
                onChange={(e) => handleIncomeChange(idx, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="fields-grid-2">
        <div className="field-block">
          <label className="field-label" htmlFor="monthsAtIncomeSource">
            Months with current income source (0–600)
          </label>
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

        <div className="field-block">
          <label className="field-label" htmlFor="monthlyOtherExpenses">
            Other monthly living expenses (₹)
          </label>
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

        <div className="field-block">
          <label className="field-label" htmlFor="monthlyRent">
            Monthly rent (₹, enter 0 if none)
          </label>
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
        </div>

        <div className="field-block">
          <label className="field-label" htmlFor="rentOnTimeCount">
            On-time rent payments in last 12 months (0–12)
          </label>
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

        <div className="field-block">
          <label className="field-label" htmlFor="monthlyUtilities">
            Monthly utility bills (₹, enter 0 if none)
          </label>
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
        </div>

        <div className="field-block">
          <label className="field-label" htmlFor="utilityOnTimeCount">
            On-time utility payments in last 12 months (0–12)
          </label>
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

        <div className="field-block">
          <label className="field-label" htmlFor="savingsBalance">
            Total savings today (₹)
          </label>
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

        <div className="field-block">
          <label className="field-label" htmlFor="monthlyDebtPayments">
            Monthly debt / EMI payments (₹)
          </label>
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
      </div>
    </div>
  );
}
