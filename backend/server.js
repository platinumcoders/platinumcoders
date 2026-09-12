// backend/server.js
// ThinCred Express Server per Master Blueprint §6 & §8, Appendix A §7.0.

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');
const applicationsRouter = require('./routes/applications');
const decisionsRouter = require('./routes/decisions');
const fairnessRouter = require('./routes/fairness');

const app = express();
const PORT = process.env.PORT || 5000;

// 2. CORS configuration per deployment guidelines
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*') || origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));


// Body parser with exact 400 error message for malformed JSON
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Request body must be valid JSON.' });
  }
  next(err);
});

// Mount routes
app.use('/api/applications', applicationsRouter);
app.use('/api/decisions', decisionsRouter);
app.use('/api/fairness', fairnessRouter);

// Unknown /api/* route or method -> 404 {"error":"Not found."}
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Root fallback
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

async function startServer() {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      console.warn('WARNING: MONGODB_URI is not set. Database operations will fail until MONGODB_URI is provided in backend/.env');
    }

    app.listen(PORT, () => {
      console.log(`ThinCred Backend running on port ${PORT}`);
      console.log(`Base API URL: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
