// frontend/src/components/NavBar.jsx
import React from 'react';

const TABS = [
  { id: 'application', label: '1. Application' },
  { id: 'decision', label: '2. Decision' },
  { id: 'auditor', label: '3. Auditor / Replay' },
  { id: 'fairness', label: '4. Fairness' },
];

export default function NavBar({ activeScreen, onNavigate }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="brand-logo">ThinCred</span>
          <span className="brand-tagline">Credit Decisioning Engine</span>
        </div>
        <nav className="nav-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeScreen === tab.id}
              className={`nav-tab-btn ${activeScreen === tab.id ? 'active' : ''}`}
              onClick={() => onNavigate(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
