/* ============================================================
   Appointments Page
   ============================================================ */

async function renderAppointments(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title gradient-text">Appointment Management</h1>
        <p class="page-subtitle">Schedule, track, and manage patient appointments</p>
      </div>
      <button class="btn btn-primary" id="addApptBtn">
        <i data-lucide="calendar-plus" size="16"></i> Book Appointment
      </button>
    </div>

    <!-- Stats -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;" id="apptStats"></div>

    <!-- Filters -->
    <div class="card card-sm" style="margin-bottom: 20px;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <select class="form-input" id="apptStatusFilter" style="width: 160px;">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" class="form-input" id="apptDateFilter" style="width: 180px;" />
        <select class="form-input" id="apptDeptFilter" style="width: 180px;">
          <option value="">All Departments</option>
          <option>Cardiology</option>
          <option>Endocrinology</option>
          <option>Pulmonology</option>
          <option>Neurology</option>
          <option>General Medicine</option>
          <option>Orthopedics</option>
          <option>Gynecology</option>
          <option>Nephrology</option>
        </select>
        <button class="btn btn-secondary btn-sm" onclick="loadAppointmentsData()">
          <i data-lucide="refresh-cw" size="14"></i> Refresh
        </button>
        <button class="btn btn-sm" style="background: rgba(20,184,166,0.12); color: var(--accent-teal); border: 1px solid rgba(20,184,166,0.3);" onclick="document.getElementById('apptDateFilter').value=new Date().toISOString().split('T')[0]; loadAppointmentsData();">
          <i data-lucide="calendar" size="14"></i> Today
        </button>
      </div>
    </div>

    <!-- Appointments list -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <div class="table-wrapper" style="border: none;">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Date</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="apptTableBody">
            <tr><td colspan="8" style="text-align:center; padding: 40px;">
              <div class="loading-spinner" style="margin: 0 auto;"></div>
            </td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  lucide.createIcons();

  // Event listeners
  document.getElementById('addApptBtn').addEventListener('click', () => openAddAppt());
  document.getElementById('apptStatusFilter').addEventListener('change', loadAppointmentsData);
  document.getElementById('apptDateFilter').addEventListener('change', loadAppointmentsData);
  document.getElementById('apptDeptFilter').addEventListener('change', loadAppointmentsData);
  document.getElementById('appointmentForm').addEventListener('submit', saveAppointment);

  // Set today as default date
  document.getElementById('apptDate').min = new Date().toISOString().split('T')[0];

  await loadApptStats();
  await loadAppointmentsData();
}

async function loadApptStats() {
  try {
    const data = await apiGet('/appointments/stats/summary');
    if (!data.success) return;
    const el = document.getElementById('apptStats');
    if (!el) return;

    const byStatus = {};
    (data.data.byStatus || []).forEach(s => byStatus[s.status] = s.count);

    el.innerHTML = `
      <div class="stat-card success" style="padding: 14px 16px;">
        <div class="stat-icon success" style="width:40px;height:40px;"><i data-lucide="calendar-check" size="18"></i></div>
        <div class="stat-body"><div class="stat-value" style="font-size:22px;">${data.data.today}</div><div class="stat-label">Today</div></div>
      </div>
      <div class="stat-card primary" style="padding: 14px 16px;">
        <div class="stat-icon primary" style="width:40px;height:40px;"><i data-lucide="clock" size="18"></i></div>
        <div class="stat-body"><div class="stat-value" style="font-size:22px;">${data.data.upcoming}</div><div class="stat-label">Upcoming</div></div>
      </div>
      <div class="stat-card warning" style="padding: 14px 16px;">
        <div class="stat-icon warning" style="width:40px;height:40px;"><i data-lucide="hourglass" size="18"></i></div>
        <div class="stat-body"><div class="stat-value" style="font-size:22px;">${byStatus.pending || 0}</div><div class="stat-label">Pending</div></div>
      </div>
      <div class="stat-card info" style="padding: 14px 16px;">
        <div class="stat-icon info" style="width:40px;height:40px;"><i data-lucide="check-circle-2" size="18"></i></div>
        <div class="stat-body"><div class="stat-value" style="font-size:22px;">${byStatus.completed || 0}</div><div class="stat-label">Completed</div></div>
      </div>
    `;
    lucide.createIcons();
  } catch(e) { /* ignore */ }
}

async function loadAppointmentsData() {
  const status = document.getElementById('apptStatusFilter')?.value || '';
  const date = document.getElementById('apptDateFilter')?.value || '';
  const dept = document.getElementById('apptDeptFilter')?.value || '';

  let url = '/appointments?';
  if (status) url += `status=${status}&`;
  if (date) url += `date=${date}&`;
  if (dept) url += `department=${encodeURIComponent(dept)}&`;

  const tbody = document.getElementById('apptTableBody');
  if (!tbody) return;

  try {
    const data = await apiGet(url);
    const appts = data.data || [];

    if (!appts.length) {
      tbody.innerHTML = `<tr><td colspan="8">
        <div class="empty-state"><div class="empty-icon">📅</div>
        <div class="empty-title">No appointments found</div>
        <div class="empty-desc">Adjust filters or book a new appointment</div></div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = appts.map(a => `
      <tr>
        <td><span class="appt-time">${a.appointment_time}</span></td>
        <td><span style="font-weight: 600;">${a.patient_name}</span></td>
        <td>${a.doctor}</td>
        <td><span class="badge badge-primary" style="font-size: 11px;">${a.department}</span></td>
        <td style="font-size: 13px; color: var(--text-secondary);">${formatDate(a.appointment_date)}</td>
        <td>${getStatusBadge(a.status)}</td>
        <td style="font-size: 12px; color: var(--text-muted); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${a.notes || '—'}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-xs" onclick="editAppt(${a.id})"><i data-lucide="pencil" size="12"></i></button>
            <button class="btn btn-danger btn-xs" onclick="deleteAppt(${a.id})"><i data-lucide="trash-2" size="12"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
    lucide.createIcons();
  } catch(err) {
    showToast('Failed to load appointments', 'error');
  }
}

async function openAddAppt() {
  // Load patients into select
  try {
    const data = await apiGet('/patients?limit=100');
    const select = document.getElementById('apptPatient');
    select.innerHTML = '<option value="">Select patient</option>' +
      (data.data || []).map(p => `<option value="${p.id}" data-name="${p.name}">${p.name} (${p.age}, ${p.gender})</option>`).join('');
  } catch(e) { /* ignore */ }

  document.getElementById('apptModalTitle').textContent = 'Book Appointment';
  document.getElementById('appointmentForm').reset();
  document.getElementById('apptId').value = '';
  document.getElementById('apptDate').min = new Date().toISOString().split('T')[0];
  openModal('appointmentModal');
}

async function editAppt(id) {
  // Load patients
  try {
    const pData = await apiGet('/patients?limit=100');
    const select = document.getElementById('apptPatient');
    select.innerHTML = '<option value="">Select patient</option>' +
      (pData.data || []).map(p => `<option value="${p.id}" data-name="${p.name}">${p.name} (${p.age}, ${p.gender})</option>`).join('');
  } catch(e) { /* ignore */ }

  // We'll find the appt from what we already have or refetch
  const appts = await apiGet('/appointments');
  const a = (appts.data || []).find(x => x.id === id);
  if (!a) return;

  document.getElementById('apptModalTitle').textContent = 'Edit Appointment';
  document.getElementById('apptId').value = a.id;
  document.getElementById('apptPatient').value = a.patient_id;
  document.getElementById('apptDoctor').value = [...document.getElementById('apptDoctor').options].find(o => o.text.startsWith(a.doctor))?.value || a.doctor;
  document.getElementById('apptStatus').value = a.status;
  document.getElementById('apptDate').value = a.appointment_date;
  document.getElementById('apptTime').value = a.appointment_time;
  document.getElementById('apptNotes').value = a.notes || '';
  openModal('appointmentModal');
}

async function saveAppointment(e) {
  e.preventDefault();
  const id = document.getElementById('apptId').value;
  const patientSelect = document.getElementById('apptPatient');
  const patientId = patientSelect.value;
  const patientName = patientSelect.options[patientSelect.selectedIndex]?.dataset.name || patientSelect.options[patientSelect.selectedIndex]?.text.split(' (')[0] || '';
  const doctorText = document.getElementById('apptDoctor').value;
  const doctorName = doctorText.split(' — ')[0] || doctorText;
  const dept = document.getElementById('apptDoctor').options[document.getElementById('apptDoctor').selectedIndex]?.dataset?.dept || doctorText.split(' — ')[1] || 'General Medicine';

  const payload = {
    patient_id: parseInt(patientId),
    patient_name: patientName,
    doctor: doctorName,
    department: dept,
    appointment_date: document.getElementById('apptDate').value,
    appointment_time: document.getElementById('apptTime').value,
    status: document.getElementById('apptStatus').value,
    notes: document.getElementById('apptNotes').value
  };

  try {
    let result;
    if (id) {
      result = await apiPut(`/appointments/${id}`, payload);
    } else {
      result = await apiPost('/appointments', payload);
    }

    if (result.success) {
      closeModal('appointmentModal');
      showToast(id ? 'Appointment updated' : 'Appointment booked!', 'success');
      await loadAppointmentsData();
      await loadApptStats();
    } else {
      showToast('Failed to save appointment', 'error');
    }
  } catch(err) {
    showToast('Error: ' + err.message, 'error');
  }
}

async function deleteAppt(id) {
  if (!confirm('Delete this appointment?')) return;
  const result = await apiDelete(`/appointments/${id}`);
  if (result.success) {
    showToast('Appointment deleted', 'info');
    await loadAppointmentsData();
    await loadApptStats();
  }
}
