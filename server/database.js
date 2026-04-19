const {default: createSqlite, sql} = require('@databases/sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/medai.db');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

async function getDb() {
  if (!db) {
    db = createSqlite(DB_PATH);
  }
  return db;
}

async function initializeDatabase() {
  const database = await getDb();

  await database.query(sql`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      blood_type TEXT NOT NULL,
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      address TEXT DEFAULT '',
      conditions TEXT DEFAULT '[]',
      allergies TEXT DEFAULT '[]',
      risk_level TEXT DEFAULT 'low',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.query(sql`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      patient_name TEXT NOT NULL,
      doctor TEXT NOT NULL,
      department TEXT NOT NULL,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.query(sql`
    CREATE TABLE IF NOT EXISTS vitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      heart_rate INTEGER,
      systolic INTEGER,
      diastolic INTEGER,
      temperature REAL,
      spo2 INTEGER,
      glucose INTEGER,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.query(sql`
    CREATE TABLE IF NOT EXISTS health_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      action TEXT NOT NULL,
      description TEXT DEFAULT '',
      severity TEXT DEFAULT 'info',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database initialized successfully');
  return database;
}

module.exports = { getDb, initializeDatabase };
