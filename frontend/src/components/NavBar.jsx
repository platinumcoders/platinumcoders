// frontend/src/components/NavBar.jsx
import React, { useState } from 'react';

const TABS = [
  { id: 'application', step: '01', label: 'Application' },
  { id: 'decision', step: '02', label: 'Decision' },
  { id: 'auditor', step: '03', label: 'Auditor / Replay' },
  { id: 'fairness', step: '04', label: 'Fairness Monitoring' },
];

export default function NavBar({ activeScreen, onNavigate, darkMode, onToggleDark }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="brand-lockup" onClick={() => onNavigate('application')}>
        <div className="brand-mark"><span></span></div>
        <div>
          <div className="brand-name">ThinCred</div>
          <div className="brand-caption">Decisioning infrastructure</div>
        </div>
      </div>

      <button
        className="mobile-menu"
        onClick={() => setMobileOpen(prev => !prev)}
        aria-label="Toggle navigation"
      >
        &#9776;
      </button>

      <nav className={`main-nav ${mobileOpen ? 'is-open' : ''}`} id="mainNav" aria-label="Primary navigation">
        {TABS.map((tab) => {
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              data-tab={tab.id}
              onClick={() => {
                onNavigate(tab.id);
                setMobileOpen(false);
              }}
            >
              <span className="nav-step">{tab.step}</span>
              <span>{tab.label}</span>
              {isActive && <span className="nav-active-dot"></span>}
            </button>
          );
        })}
      </nav>

      <div className="topbar-right">
        <button
          className="theme-toggle"
          onClick={onToggleDark}
          aria-label="Toggle dark mode"
          type="button"
        >
          <span className={`toggle-track ${darkMode ? 'on' : ''}`}>
            <span className="toggle-thumb">{darkMode ? '☾' : '☀'}</span>
          </span>
          <span className="toggle-label">{darkMode ? 'Dark' : 'Light'}</span>
        </button>
        <div className="topbar-status">
          <span className="status-dot"></span>
          System operational
        </div>
      </div>
    </header>
  );
}

