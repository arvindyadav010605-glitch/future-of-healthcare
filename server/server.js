require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize database
const { initializeDatabase } = require('./database');
initializeDatabase();

// Routes
app.use('/api/patients', require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/drugs', require('./routes/drugs'));
app.use('/api/news', require('./routes/news'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MedAI Nexus API is running', timestamp: new Date().toISOString() });
});

// Catch-all: serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🏥 MedAI Nexus is running!`);
  console.log(`   → Local: http://localhost:${PORT}`);
  console.log(`   → API:   http://localhost:${PORT}/api/health\n`);
});
