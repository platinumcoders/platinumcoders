// frontend/src/App.jsx
// Main application shell with state-based routing per Thinker 2 spec §2 & §3.

import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import ApplicationScreen from './screens/ApplicationScreen';
import DecisionScreen from './screens/DecisionScreen';
import AuditorScreen from './screens/AuditorScreen';
import FairnessScreen from './screens/FairnessScreen';

const PROGRESS_MAP = {
  application: 25,
  decision: 50,
  auditor: 75,
  fairness: 100,
};

const SCREEN_TITLES = {
  application: 'Credit application',
  decision: 'Credit decision result',
  auditor: 'Decision passport & replay',
  fairness: 'Fairness & bias monitoring',
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState('application');
  const [lastPassport, setLastPassport] = useState(null);
  const [auditorDecisionId, setAuditorDecisionId] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('thincred-theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('thincred-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDark = () => {
    setDarkMode(prev => !prev);
  };

  const handleEvaluated = (passport) => {
    setLastPassport(passport);
    setActiveScreen('decision');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToAuditor = (decisionId) => {
    setAuditorDecisionId(decisionId || '');
    setActiveScreen('auditor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToApplication = () => {
    setActiveScreen('application');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (screen) => {
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`app-shell ${darkMode ? 'dark' : ''}`} id="app">
      <NavBar
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        darkMode={darkMode}
        onToggleDark={toggleDark}
      />

      <main className="main-container">
        <div className="page-intro">
          <div>
            <span className="eyebrow">THINCRED / WORKSPACE</span>
            <h1>{SCREEN_TITLES[activeScreen]}</h1>
            <p>
              {activeScreen === 'application'
                ? 'Turn everyday financial signals into a clear, explainable decision.'
                : 'Review every decision with the clarity and control your team expects.'}
            </p>
          </div>
          <div className="intro-meta">
            <span className="live-pill">
              <span className="status-dot"></span>
              LIVE ENVIRONMENT
            </span>
            <span className="mono-text">PV-001 • v1.0.0</span>
          </div>
        </div>

        <div className="progress-rail">
          <div
            className="progress-fill"
            style={{ width: `${PROGRESS_MAP[activeScreen] || 25}%` }}
          ></div>
        </div>

        {activeScreen === 'application' && (
          <ApplicationScreen onEvaluated={handleEvaluated} />
        )}
        {activeScreen === 'decision' && (
          <DecisionScreen
            passport={lastPassport}
            onGoToAuditor={handleGoToAuditor}
            onGoToApplication={handleGoToApplication}
          />
        )}
        {activeScreen === 'auditor' && (
          <AuditorScreen initialDecisionId={auditorDecisionId} />
        )}
        {activeScreen === 'fairness' && (
          <FairnessScreen />
        )}
      </main>

      <footer className="footer">
        <span>ThinCred</span>
        <span>Reproducible credit decisioning for thin-file borrowers</span>
        <span className="mono-text">BUILD 1.0.0</span>
      </footer>
    </div>
  );
}

