/* ============================================================
   Patients Page
   ============================================================ */

let allPatients = [];
let patientSearchTimeout = null;

async function renderPatients(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title gradient-text">Patient Management</h1>
        <p class="page-subtitle">Manage patient records, vitals, and medical history</p>
      </div>
      <button class="btn btn-primary" id="addPatientBtn">
        <i data-lucide="user-plus" size="16"></i> Add Patient
      </button>
    </div>

    <!-- Filters -->
    <div class="card card-sm" style="margin-bottom: 20px;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <div class="search-container" style="flex: 1; min-width: 200px;">
          <i data-lucide="search" size="16" class="search-icon"></i>
          <input type="text" class="form-input" id="patientSearch" placeholder="Search by name, email, or phone..." />
        </div>
        <select class="form-input" id="riskFilter" style="width: 160px;">
          <option value="">All Risk Levels</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>
        <button class="btn btn-secondary btn-sm" onclick="loadPatientsTable()">
          <i data-lucide="refresh-cw" size="14"></i> Refresh
        </button>
      </div>
    </div>

    <!-- Stats bar -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;" id="patientStats"></div>

    <!-- Table -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <div class="table-wrapper" style="border: none;">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Age / Gender</th>
              <th>Blood Type</th>
              <th>Conditions</th>
              <th>Risk Level</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="patientsTableBody">
            <tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--text-muted);">
              <div class="loading-spinner" style="margin: 0 auto;"></div>
            </td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  lucide.createIcons();

  // Event listeners
  document.getElementById('addPatientBtn').addEventListener('click', () => openAddPatient());
  document.getElementById('patientSearch').addEventListener('input', (e) => {
    clearTimeout(patientSearchTimeout);
    patientSearchTimeout = setTimeout(() => loadPatientsTable(), 400);
  });
  document.getElementById('riskFilter').addEventListener('change', () => loadPatientsTable());

  // Patient form submit
  document.getElementById('patientForm').addEventListener('submit', savePatient);

  await loadPatientStats();
  await loadPatientsTable();
}

async function loadPatientStats() {
  try {
    const data = await apiGet('/patients/stats/summary');
    if (!data.success) return;
    const el = document.getElementById('patientStats');
    if (!el) return;

    const riskMap = {};
    (data.data.byRisk || []).forEach(r => riskMap[r.risk_level] = r.count);

    el.innerHTML = `
      <div class="stat-card primary" style="padding: 14px 16px;">
        <div class="stat-icon primary" style="width: 40px; height: 40px;"><i data-lucide="users" size="18"></i></div>
        <div class="stat-body"><div class="stat-value" style="font-size: 22px;">${data.data.total}</div><div class="stat-label">Total Patients</div></div>
      </div>
      <div class="stat-card warning" style="padding: 14px 16px;">
        <div class="stat-icon danger" style="width: 40px; height: 40px;"><i data-lucide="alert-circle" size="18"></i></div>
        <div class="stat-body"><div class="stat-value" style="font-size: 22px;">${riskMap.high || 0}</div><div class="stat-label">High Risk</div></div>
      </div>
      <div class="stat-card info" style="padding: 14px 16px;">
        <div class="stat-icon warning" style="width: 40px; height: 40px;"><i data-lucide="minus-circle" size="18"></i></div>
        <div class="stat-body"><div class="stat-value" style="font-size: 22px;">${riskMap.medium || 0}</div><div class="stat-label">Medium Risk</div></div>
      </div>
      <div class="stat-card success" style="padding: 14px 16px;">
        <div class="stat-icon success" style="width: 40px; height: 40px;"><i data-lucide="check-circle" size="18"></i></div>
        <div class="stat-body"><div class="stat-value" style="font-size: 22px;">${riskMap.low || 0}</div><div class="stat-label">Low Risk</div></div>
      </div>
    `;
    lucide.createIcons();
  } catch(e) { /* ignore */ }
}

async function loadPatientsTable() {
  const search = document.getElementById('patientSearch')?.value || '';
  const risk = document.getElementById('riskFilter')?.value || '';
  let url = '/patients?limit=50';
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (risk) url += `&risk_level=${encodeURIComponent(risk)}`;

  const tbody = document.getElementById('patientsTableBody');
  if (!tbody) return;

  try {
    const data = await apiGet(url);
    allPatients = data.data || [];

    if (!allPatients.length) {
      tbody.innerHTML = `<tr><td colspan="8">
        <div class="empty-state"><div class="empty-icon">👤</div>
        <div class="empty-title">No patients found</div>
        <div class="empty-desc">Try adjusting your search filters</div></div></td></tr>`;
      return;
    }

    tbody.innerHTML = allPatients.map((p, i) => `
      <tr>
        <td><span style="font-family: var(--font-mono); color: var(--text-muted); font-size: 12px;">#${p.id}</span></td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, var(--primary), var(--accent-violet)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">
              ${p.name.split(' ').map(n=>n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <div style="font-weight: 600; font-size: 14px;">${p.name}</div>
              <div style="font-size: 12px; color: var(--text-muted);">${p.email || '—'}</div>
            </div>
          </div>
        </td>
        <td>${p.age} / ${p.gender}</td>
        <td><span class="badge badge-info">${p.blood_type}</span></td>
        <td>${renderConditionTags(p.conditions)}</td>
        <td>${getRiskBadge(p.risk_level)}</td>
        <td style="font-size: 12px; color: var(--text-muted);">${formatDate(p.created_at)}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-xs" onclick="editPatient(${p.id})"><i data-lucide="pencil" size="12"></i></button>
            <button class="btn btn-danger btn-xs" onclick="deletePatient(${p.id}, '${p.name}')"><i data-lucide="trash-2" size="12"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
    lucide.createIcons();
  } catch(err) {
    showToast('Failed to load patients', 'error');
  }
}

function openAddPatient() {
  document.getElementById('patientModalTitle').textContent = 'Add New Patient';
  document.getElementById('patientForm').reset();
  document.getElementById('patientId').value = '';
  openModal('patientModal');
}

async function editPatient(id) {
  try {
    const data = await apiGet(`/patients/${id}`);
    if (!data.success) return;
    const p = data.data;

    document.getElementById('patientModalTitle').textContent = 'Edit Patient';
    document.getElementById('patientId').value = p.id;
    document.getElementById('patientName').value = p.name;
    document.getElementById('patientAge').value = p.age;
    document.getElementById('patientGender').value = p.gender;
    document.getElementById('patientBloodType').value = p.blood_type;
    document.getElementById('patientPhone').value = p.phone || '';
    document.getElementById('patientEmail').value = p.email || '';
    document.getElementById('patientAddress').value = p.address || '';
    document.getElementById('patientConditions').value = parseJsonField(p.conditions).join(', ');
    document.getElementById('patientAllergies').value = parseJsonField(p.allergies).join(', ');
    document.getElementById('patientRisk').value = p.risk_level;

    openModal('patientModal');
  } catch(e) {
    showToast('Failed to load patient data', 'error');
  }
}

async function savePatient(e) {
  e.preventDefault();
  const id = document.getElementById('patientId').value;
  const conditions = document.getElementById('patientConditions').value
    .split(',').map(s => s.trim()).filter(Boolean);
  const allergies = document.getElementById('patientAllergies').value
    .split(',').map(s => s.trim()).filter(Boolean);

  const payload = {
    name: document.getElementById('patientName').value,
    age: parseInt(document.getElementById('patientAge').value),
    gender: document.getElementById('patientGender').value,
    blood_type: document.getElementById('patientBloodType').value,
    phone: document.getElementById('patientPhone').value,
    email: document.getElementById('patientEmail').value,
    address: document.getElementById('patientAddress').value,
    conditions, allergies,
    risk_level: document.getElementById('patientRisk').value
  };

  try {
    const saveBtn = document.getElementById('savePatientBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div> Saving...';

    let result;
    if (id) {
      result = await apiPut(`/patients/${id}`, payload);
    } else {
      result = await apiPost('/patients', payload);
    }

    if (result.success) {
      closeModal('patientModal');
      showToast(id ? 'Patient updated successfully' : 'Patient added successfully', 'success');
      await loadPatientsTable();
      await loadPatientStats();
    } else {
      showToast('Failed to save patient', 'error');
    }
  } catch(err) {
    showToast('Error saving patient: ' + err.message, 'error');
  } finally {
    const saveBtn = document.getElementById('savePatientBtn');
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i data-lucide="save" size="16"></i> Save Patient'; lucide.createIcons(); }
  }
}

async function deletePatient(id, name) {
  if (!confirm(`Delete patient "${name}"? This will also remove their appointments and vitals.`)) return;
  try {
    const result = await apiDelete(`/patients/${id}`);
    if (result.success) {
      showToast(`${name} deleted`, 'info');
      await loadPatientsTable();
      await loadPatientStats();
    }
  } catch(e) {
    showToast('Delete failed', 'error');
  }
}
