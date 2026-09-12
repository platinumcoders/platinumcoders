# ThinCred

Reproducible Credit Decisioning for Thin-File Borrowers.

ThinCred provides transparent, deterministic, and auditable credit scoring for thin-file applicants using cash-flow, rent, and utility payment signals.

## Architecture

- **Backend**: Node.js + Express (ackend/) on port 5000
- **Frontend**: React + Vite (rontend/) on port 5173
- **Database**: MongoDB Atlas with unique decision passports and policy versioning

## Screens

1. **Application**: Collects applicant financials and monitored demographic data.
2. **Decision**: Deterministic credit score (0-100), decision band (APPROVE / REVIEW / DECLINE), and structured reason codes.
3. **Auditor / Replay**: Decision passport lookup and exact historical replay verification (REPLAY VERIFIED).
4. **Fairness & Bias Monitoring**: Aggregate demographic parity summary and counterfactual invariance testing.

## Getting Started

### 1. Backend Setup
`ash
cd backend
npm install
npm run seed     # Seeds PV-001 policy and 40 benchmark passports
npm start        # Starts server on port 5000
`

### 2. Frontend Setup
`ash
cd frontend
npm install
npm run dev      # Starts Vite dev server on port 5173
`

Visit http://localhost:5173 in your browser.