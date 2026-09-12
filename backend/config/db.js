// backend/config/db.js
// MongoDB connection management and index creation per Master Blueprint §8 & Appendix A §6.

const { MongoClient } = require('mongodb');
require('dotenv').config();

let client = null;
let db = null;

async function connectDB() {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined in backend/.env');
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db();

  console.log(`Connected to MongoDB database: ${db.databaseName}`);
  await initIndexes(db);

  return db;
}

function getDB() {
  if (!db) {
    throw new Error('Database is not connected. Call connectDB() first.');
  }
  return db;
}

async function initIndexes(database) {
  const targetDb = database || db;
  if (!targetDb) return;

  // Appendix A §6.4 Indexes:
  // 1. decisions.decisionId — unique
  await targetDb.collection('decisions').createIndex(
    { decisionId: 1 },
    { unique: true }
  );

  // 2. decisions.demographicGroup — for E4 aggregation
  await targetDb.collection('decisions').createIndex(
    { demographicGroup: 1 }
  );

  // 3. policyVersions.policyVersion — unique
  await targetDb.collection('policyVersions').createIndex(
    { policyVersion: 1 },
    { unique: true }
  );
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  connectDB,
  getDB,
  initIndexes,
  closeDB
};
