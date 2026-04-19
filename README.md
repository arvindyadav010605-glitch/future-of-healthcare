# 🏥 MedAI Nexus — Future of Healthcare

> **Hackathon Project** | AI-powered next-generation healthcare platform

A full-stack, production-ready healthcare platform combining AI diagnostics, real-time patient monitoring, smart appointment management, and drug safety analytics.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure API keys (optional — app works in demo mode)
# Edit .env and add your keys

# 3. Seed the database with demo data
node server/seed.js

# 4. Start the server
node server/server.js

# 5. Open browser at http://localhost:3000
```

---

## ✨ Features

| Module | Description |
|---|---|
| 📊 **Dashboard** | Live vitals (updates every 3s), critical alerts, health tips, stats |
| 👥 **Patients** | Full CRUD patient records, risk scoring, conditions, allergies |
| 📅 **Appointments** | Book, filter, update appointments by date/status/department |
| 🤖 **AI Symptom Checker** | Gemini AI health assessment with triage levels + chat |
| 💊 **Drug Lookup** | FDA database search, adverse events, interaction warnings |
| 📈 **Analytics** | Chart.js visualizations of patient trends & demographics |
| 📰 **Health News** | Latest health news via NewsAPI (real or demo mode) |

---

## 🔑 API Keys (Optional)

The app works fully in **demo mode** without API keys.

| API | Purpose | Get Key |
|---|---|---|
| Google Gemini | AI symptom analysis | [aistudio.google.com](https://aistudio.google.com) |
| NewsAPI | Health news | [newsapi.org](https://newsapi.org) |
| OpenFDA | Drug lookup | **Free, no key needed** |

Add keys to `.env`:
```
GEMINI_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, Vanilla CSS (Dark Glassmorphism), Vanilla JS |
| **Backend** | Node.js + Express.js |
| **Database** | SQLite3 via @databases/sqlite |
| **AI** | Google Gemini 1.5 Flash |
| **Drug Data** | OpenFDA API |
| **Charts** | Chart.js 4 |
| **Icons** | Lucide Icons |

---

## 📁 Project Structure

```
├── server/
│   ├── server.js          # Express app entry point
│   ├── database.js        # SQLite schema & connection
│   ├── seed.js            # Demo data seeder
│   └── routes/
│       ├── patients.js    # Patient CRUD
│       ├── appointments.js# Appointment management
│       ├── ai.js          # Gemini AI symptom checker
│       ├── drugs.js       # OpenFDA drug lookup
│       └── news.js        # NewsAPI health feed
├── public/
│   ├── index.html         # SPA shell
│   ├── css/styles.css     # Design system
│   └── js/
│       ├── app.js         # SPA router
│       ├── dashboard.js   # Dashboard page
│       ├── patients.js    # Patient management
│       ├── appointments.js# Appointments
│       ├── ai-checker.js  # AI symptom tool
│       ├── drugs.js       # Drug lookup
│       ├── analytics.js   # Charts & analytics
│       └── news.js        # Health news
├── data/medai.db          # SQLite database (auto-created)
└── .env                   # API keys config
```

---

## 🎨 Design

- **Theme**: Deep space dark (`#060b18`) with indigo/violet accents
- **Style**: Glassmorphism cards with animated background orbs
- **Typography**: Inter (Google Fonts)
- **Animations**: Live vitals, page transitions, chart reveals

---

*Built for the Future of Healthcare Hackathon 🏆*
# future-of-healthcare
