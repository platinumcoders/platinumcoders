// frontend/src/components/CounterfactualPanel.jsx
// Counterfactual invariance test panel per Thinker 2 spec §1.4 & §2.

import React from 'react';
import FinancialFields from './FinancialFields';
import DecisionBadge from './DecisionBadge';
import ReasonCodeList from './ReasonCodeList';

export default function CounterfactualPanel({
  form,
  onChange,
  submitting,
  result,
  error,
  onSubmit
}) {
  const handleDemographicChange = (key, value) => {
    onChange({ ...form, [key]: value });
  };

  const handleFinancialsChange = (nextFinancials) => {
    onChange({ ...form, financials: nextFinancials });
  };

  return (
    <div className="counterfactual-panel">
      <div className="card-box">
        <h3 className="section-title">Counterfactual Invariance Test</h3>
        <p className="caption-text">
          Tests engine invariance by evaluating identical financial inputs under swapped demographic attributes.
        </p>

        <div className="demographic-swap-grid">
          <div className="field-block">
            <label className="field-label" htmlFor="demographicA">Demographic Group A</label>
            <select
              id="demographicA"
              value={form.demographicA}
              onChange={(e) => handleDemographicChange('demographicA', e.target.value)}
              disabled={submitting}
            >
              <option value="female">female</option>
              <option value="male">male</option>
            </select>
          </div>

          <div className="field-block">
            <label className="field-label" htmlFor="demographicB">Demographic Group B</label>
            <select
              id="demographicB"
              value={form.demographicB}
              onChange={(e) => handleDemographicChange('demographicB', e.target.value)}
              disabled={submitting}
            >
              <option value="female">female</option>
              <option value="male">male</option>
            </select>
          </div>
        </div>

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
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? 'Running…' : 'Run Counterfactual Test'}
          </button>
        </div>
      </div>

      {result && (
        <div className="card-box result-card">
          <div className="cf-header-bar">
            <span className={`badge-pill ${result.identical ? 'badge-pill-success' : 'badge-pill-danger'}`}>
              {result.identical ? 'Identical' : 'Differ'}
            </span>
            <span className="cf-verdict-text font-semibold">{result.verdict}</span>
          </div>

          <div className="side-by-side-grid">
            {(result.runs || []).map((run, idx) => (
              <div key={idx} className="comparison-column">
                <h4 className="column-title">
                  Run {idx + 1}: <span className="text-primary font-bold">{run.demographicGroup}</span>
                </h4>
                <div className="comparison-metric-row">
                  <span className="metric-label">Score:</span>
                  <span className="metric-val">{run.score} / 100</span>
                </div>
                <div className="comparison-metric-row">
                  <span className="metric-label">Decision:</span>
                  <DecisionBadge decision={run.decision} />
                </div>
                <div className="comparison-reasons">
                  <h5 className="sub-title">Reason Codes</h5>
                  <ReasonCodeList reasonCodes={run.reasonCodes} />
                </div>
              </div>
            ))}
          </div>

          <div className="cf-footer">
            <span><strong>Policy Version:</strong> <span className="font-mono">{result.policyVersion}</span></span>
            <span><strong>Algorithm Version:</strong> <span className="font-mono">{result.algorithmVersion}</span></span>
            <span><strong>Evaluated At:</strong> <span className="font-mono">{new Date(result.evaluatedAt).toUTCString()}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
