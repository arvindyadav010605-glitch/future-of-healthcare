/* ============================================================
   Dashboard Page
   ============================================================ */

let vitalsInterval = null;

async function renderDashboard(container) {
  // Stop previous vitals interval
  if (vitalsInterval) { clearInterval(vitalsInterval); vitalsInterval = null; }

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title gradient-text">Healthcare Dashboard</h1>
        <p class="page-subtitle">Real-time monitoring & clinical overview — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div class="flex gap-8">
        <button class="btn btn-secondary btn-sm" onclick="navigate('analytics')">
          <i data-lucide="bar-chart-3" size="15"></i> Analytics
        </button>
        <button class="btn btn-primary btn-sm" onclick="navigate('ai-checker')">
          <i data-lucide="brain-circuit" size="15"></i> AI Check
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid" id="dashStats">
      <div class="stat-card primary">
        <div class="stat-icon primary"><i data-lucide="users" size="22"></i></div>
        <div class="stat-body">
          <div class="stat-value" id="statPatients">—</div>
          <div class="stat-label">Total Patients</div>
          <div class="stat-trend up" id="statPatientsNew"></div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon success"><i data-lucide="calendar-check" size="22"></i></div>
        <div class="stat-body">
          <div class="stat-value" id="statToday">—</div>
          <div class="stat-label">Appointments Today</div>
          <div class="stat-trend up" id="statUpcoming"></div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon danger"><i data-lucide="alert-triangle" size="22"></i></div>
        <div class="stat-body">
          <div class="stat-value" id="statHighRisk">—</div>
          <div class="stat-label">High Risk Patients</div>
          <div class="stat-trend down">⬆ Needs attention</div>
        </div>
      </div>
      <div class="stat-card info">
        <div class="stat-icon info"><i data-lucide="activity" size="22"></i></div>
        <div class="stat-body">
          <div class="stat-value">98.2%</div>
          <div class="stat-label">System Uptime</div>
          <div class="stat-trend up">✓ All systems nominal</div>
        </div>
      </div>
    </div>

    <!-- Live Vitals Monitor -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="section-header">
        <div class="flex-center gap-8">
          <h2 class="section-title">Live Patient Vitals Monitor</h2>
          <span class="badge badge-success" style="animation: pulse-dot 1.5s infinite;">● LIVE</span>
        </div>
        <span style="font-size: 12px; color: var(--text-muted);">Updates every 3 seconds</span>
      </div>
      <div class="vitals-grid">
        <div class="vital-card">
          <div class="vital-live-dot"></div>
          <div style="font-size: 24px;">❤️</div>
          <div class="vital-value" id="vHR" style="color: #ef4444;">72</div>
          <div class="vital-unit">bpm</div>
          <div class="vital-label">Heart Rate</div>
          <div class="vital-bar"><div class="vital-bar-fill" id="vHRBar" style="background: #ef4444; width: 65%;"></div></div>
        </div>
        <div class="vital-card">
          <div class="vital-live-dot"></div>
          <div style="font-size: 24px;">🩸</div>
          <div class="vital-value" id="vBP" style="color: #f59e0b;">120/80</div>
          <div class="vital-unit">mmHg</div>
          <div class="vital-label">Blood Pressure</div>
          <div class="vital-bar"><div class="vital-bar-fill" id="vBPBar" style="background: #f59e0b; width: 55%;"></div></div>
        </div>
        <div class="vital-card">
          <div class="vital-live-dot"></div>
          <div style="font-size: 24px;">🌡️</div>
          <div class="vital-value" id="vTemp" style="color: #14b8a6;">36.8</div>
          <div class="vital-unit">°C</div>
          <div class="vital-label">Temperature</div>
          <div class="vital-bar"><div class="vital-bar-fill" id="vTempBar" style="background: #14b8a6; width: 60%;"></div></div>
        </div>
        <div class="vital-card">
          <div class="vital-live-dot"></div>
          <div style="font-size: 24px;">💨</div>
          <div class="vital-value" id="vSpO2" style="color: #6366f1;">98</div>
          <div class="vital-unit">%</div>
          <div class="vital-label">SpO₂ Saturation</div>
          <div class="vital-bar"><div class="vital-bar-fill" id="vSpO2Bar" style="background: #6366f1; width: 98%;"></div></div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Recent Appointments -->
      <div class="card">
        <div class="section-header">
          <h2 class="section-title">Today's Appointments</h2>
          <button class="btn btn-secondary btn-sm" onclick="navigate('appointments')">View All</button>
        </div>
        <div id="dashAppointments">
          <div class="page-loading" style="height: 150px;"><div class="loading-spinner"></div></div>
        </div>
      </div>

      <!-- Alerts / Activity Feed -->
      <div class="card">
        <div class="section-header">
          <h2 class="section-title">⚠️ Critical Alerts</h2>
          <span class="badge badge-danger">3 Active</span>
        </div>
        <div id="dashAlerts">
          <div class="activity-item">
            <div class="activity-dot critical"></div>
            <div class="activity-text"><strong>Kavita Joshi</strong> — Blood pressure 185/112 mmHg. Immediate review required.</div>
            <div class="activity-time">2m ago</div>
          </div>
          <div class="activity-item">
            <div class="activity-dot critical"></div>
            <div class="activity-text"><strong>Arjun Sharma</strong> — Blood glucose spike: 287 mg/dL detected by wearable monitor.</div>
            <div class="activity-time">8m ago</div>
          </div>
          <div class="activity-item">
            <div class="activity-dot high"></div>
            <div class="activity-text"><strong>Suresh Iyer</strong> — Liver enzyme levels critically elevated. Lab results ready for review.</div>
            <div class="activity-time">15m ago</div>
          </div>
          <div class="activity-item">
            <div class="activity-dot high"></div>
            <div class="activity-text"><strong>Rahul Verma</strong> — Irregular heartbeat pattern detected. ECG recommended.</div>
            <div class="activity-time">32m ago</div>
          </div>
          <div class="activity-item">
            <div class="activity-dot info"></div>
            <div class="activity-text"><strong>Ananya Nair</strong> — Levothyroxine dosage adjusted to 75mcg. Follow-up in 4 weeks.</div>
            <div class="activity-time">1h ago</div>
          </div>
          <div class="activity-item">
            <div class="activity-dot info"></div>
            <div class="activity-text"><strong>Meera Agarwal</strong> — Annual physical exam completed. All vitals normal.</div>
            <div class="activity-time">2h ago</div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Tips + Recent Patients -->
    <div class="content-grid">
      <div class="card">
        <div class="section-header">
          <h2 class="section-title">🤖 AI Health Insights</h2>
          <span class="badge badge-primary">AI Powered</span>
        </div>
        <div id="dashTips"><div class="loading-spinner" style="margin: 20px auto;"></div></div>
      </div>
      <div class="card">
        <div class="section-header">
          <h2 class="section-title">Recent Patients</h2>
          <button class="btn btn-secondary btn-sm" onclick="navigate('patients')">View All</button>
        </div>
        <div id="dashPatients"><div class="loading-spinner" style="margin: 20px auto;"></div></div>
      </div>
    </div>
  `;

  lucide.createIcons();
  startLiveVitals();
  await loadDashboardData();
}

function startLiveVitals() {
  vitalsInterval = setInterval(() => {
    const hr = Math.floor(Math.random() * 20 + 65);
    const sys = Math.floor(Math.random() * 20 + 110);
    const dia = Math.floor(Math.random() * 10 + 72);
    const temp = (Math.random() * 0.8 + 36.4).toFixed(1);
    const spo2 = Math.floor(Math.random() * 4 + 95);

    const hrEl = document.getElementById('vHR');
    const bpEl = document.getElementById('vBP');
    const tempEl = document.getElementById('vTemp');
    const spo2El = document.getElementById('vSpO2');

    if (!hrEl) { clearInterval(vitalsInterval); return; }

    hrEl.textContent = hr;
    bpEl.textContent = `${sys}/${dia}`;
    tempEl.textContent = temp;
    spo2El.textContent = spo2;

    // Update bar widths
    document.getElementById('vHRBar').style.width = `${Math.min(100, (hr / 120) * 100)}%`;
    document.getElementById('vBPBar').style.width = `${Math.min(100, (sys / 180) * 100)}%`;
    document.getElementById('vTempBar').style.width = `${Math.min(100, ((parseFloat(temp) - 35) / 5) * 100)}%`;
    document.getElementById('vSpO2Bar').style.width = `${spo2}%`;

    // Color coding
    hrEl.style.color = hr > 100 || hr < 60 ? '#f59e0b' : '#ef4444';
    spo2El.style.color = spo2 < 95 ? '#ef4444' : '#6366f1';
  }, 3000);
}

async function loadDashboardData() {
  try {
    // Load stats
    const [patientStats, apptStats] = await Promise.all([
      apiGet('/patients/stats/summary'),
      apiGet('/appointments/stats/summary')
    ]);

    if (patientStats.success) {
      const el = document.getElementById('statPatients');
      if (el) animateNumber(el, patientStats.data.total);
      const newEl = document.getElementById('statPatientsNew');
      if (newEl) newEl.textContent = `↑ ${patientStats.data.recentWeek} new this week`;

      const riskData = patientStats.data.byRisk || [];
      const highRisk = riskData.find(r => r.risk_level === 'high');
      const hrEl = document.getElementById('statHighRisk');
      if (hrEl) animateNumber(hrEl, highRisk ? highRisk.count : 0);
    }

    if (apptStats.success) {
      const todayEl = document.getElementById('statToday');
      if (todayEl) animateNumber(todayEl, apptStats.data.today);
      const upEl = document.getElementById('statUpcoming');
      if (upEl) upEl.textContent = `${apptStats.data.upcoming} upcoming`;
    }

    // Load today's appointments
    const todayAppts = await apiGet('/appointments/today');
    const apptEl = document.getElementById('dashAppointments');
    if (apptEl && todayAppts.success) {
      if (!todayAppts.data.length) {
        apptEl.innerHTML = `<div class="empty-state" style="padding: 30px 10px;">
          <div class="empty-icon">📅</div>
          <div class="empty-title">No appointments today</div>
        </div>`;
      } else {
        apptEl.innerHTML = todayAppts.data.slice(0, 5).map(a => `
          <div class="appt-card ${a.status}">
            <div class="appt-time">${a.appointment_time}</div>
            <div class="appt-info">
              <div class="appt-name">${a.patient_name}</div>
              <div class="appt-doctor">${a.doctor} · ${a.department}</div>
            </div>
            ${getStatusBadge(a.status)}
          </div>
        `).join('');
      }
    }

    // Load patients
    const patients = await apiGet('/patients?limit=5');
    const patEl = document.getElementById('dashPatients');
    if (patEl && patients.success) {
      patEl.innerHTML = patients.data.map(p => `
        <div class="activity-item" style="cursor: pointer;" onclick="navigate('patients')">
          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, var(--primary), var(--accent-violet)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0;">${p.name.split(' ').map(n=>n[0]).join('')}</div>
          <div class="activity-text">
            <strong>${p.name}</strong>, ${p.age} · ${p.blood_type}
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${p.conditions ? parseJsonField(p.conditions).slice(0,2).join(', ') || 'No conditions' : 'No conditions'}</div>
          </div>
          ${getRiskBadge(p.risk_level)}
        </div>
      `).join('');
    }

    // Load AI tips
    const tips = await apiGet('/ai/health-tips');
    const tipsEl = document.getElementById('dashTips');
    if (tipsEl && tips.success) {
      tipsEl.innerHTML = tips.data.map(t => `
        <div style="display: flex; gap: 12px; padding: 12px; background: var(--bg-card); border-radius: var(--radius-md); margin-bottom: 10px; border: 1px solid var(--border);">
          <span style="font-size: 22px; flex-shrink: 0;">${t.icon}</span>
          <div>
            <div style="font-size: 11px; font-weight: 700; color: var(--primary-light); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">${t.category}</div>
            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">${t.tip}</div>
          </div>
        </div>
      `).join('');
    }

    lucide.createIcons();
  } catch (err) {
    console.error('Dashboard data load error:', err);
    showToast('Some dashboard data failed to load', 'warning');
  }
}
