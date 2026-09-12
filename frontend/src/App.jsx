// frontend/src/App.jsx
// Main application shell with state-based routing per Thinker 2 spec §2 & §3.

import React, { useState } from 'react';
import NavBar from './components/NavBar';
import ApplicationScreen from './screens/ApplicationScreen';
import DecisionScreen from './screens/DecisionScreen';
import AuditorScreen from './screens/AuditorScreen';
import FairnessScreen from './screens/FairnessScreen';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('application');
  const [lastPassport, setLastPassport] = useState(null);
  const [auditorDecisionId, setAuditorDecisionId] = useState('');

  const handleEvaluated = (passport) => {
    setLastPassport(passport);
    setActiveScreen('decision');
  };

  const handleGoToAuditor = (decisionId) => {
    setAuditorDecisionId(decisionId || '');
    setActiveScreen('auditor');
  };

  const handleGoToApplication = () => {
    setActiveScreen('application');
  };

  return (
    <div className="app-shell">
      <NavBar
        activeScreen={activeScreen}
        onNavigate={(screen) => setActiveScreen(screen)}
      />

      <main className="main-content">
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

      <footer className="app-footer">
        <div className="footer-inner">
          <span>ThinCred — Reproducible Credit Decisioning for Thin-File Borrowers</span>
          <span className="footer-policy">Deterministic Scoring Engine • Immutable Audit Trail</span>
        </div>
      </footer>
    </div>
  );
}
