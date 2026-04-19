/* ============================================================
   MedAI Nexus — App Router & Core Utilities
   ============================================================ */

const API_BASE = '/api';

// ---- Page Registry ----
// Uses lazy function lookup via window[] so scripts loaded after app.js
// can still be called correctly at navigation time.
const PAGES = {
  dashboard:    { title: 'Dashboard',            fn: 'renderDashboard' },
  patients:     { title: 'Patients',             fn: 'renderPatients' },
  appointments: { title: 'Appointments',         fn: 'renderAppointments' },
  'ai-checker': { title: 'AI Symptom Checker',   fn: 'renderAIChecker' },
  drugs:        { title: 'Drug Lookup',          fn: 'renderDrugs' },
  analytics:    { title: 'Analytics',            fn: 'renderAnalytics' },
  news:         { title: 'Health News',          fn: 'renderNews' }
};

let currentPage = 'dashboard';
let sidebarCollapsed = false;

// ---- Router ----
function navigate(page) {
  if (!PAGES[page]) page = 'dashboard';
  currentPage = page;

  // Update nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
    if (el.id === `nav-${page}`) el.classList.add('active');
  });

  // Update breadcrumb
  document.getElementById('currentPage').textContent = PAGES[page].title;

  // Show loading
  const container = document.getElementById('pageContainer');
  container.innerHTML = `<div class="page-loading"><div class="loading-spinner"></div><span>Loading...</span></div>`;

  // Render page — resolve function lazily via window[] so all scripts are loaded first
  setTimeout(() => {
    const renderFn = window[PAGES[page].fn];
    if (typeof renderFn === 'function') {
      renderFn(container);
    } else {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Page not found</div><div class="empty-desc">Render function "${PAGES[page].fn}" is not available.</div></div>`;
    }
    lucide.createIcons();
  }, 150);

  // Update URL hash
  window.location.hash = page;
}

// ---- Hash-based routing ----
window.addEventListener('hashchange', () => {
  const page = window.location.hash.replace('#', '') || 'dashboard';
  navigate(page);
});

// ---- Nav click handlers ----
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const page = el.id.replace('nav-', '');
    navigate(page);
  });
});

// ---- Sidebar toggle ----
document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
document.getElementById('menuBtn').addEventListener('click', () => {
  if (window.innerWidth <= 900) {
    document.getElementById('sidebar').classList.toggle('mobile-open');
  } else {
    toggleSidebar();
  }
});

function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  document.getElementById('sidebar').classList.toggle('collapsed', sidebarCollapsed);
  document.getElementById('mainContent').classList.toggle('expanded', sidebarCollapsed);
}

// ---- Live Clock ----
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const el = document.getElementById('topbarTime');
  if (el) el.textContent = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

// ---- Refresh button ----
document.getElementById('refreshBtn').addEventListener('click', () => {
  navigate(currentPage);
  showToast('Page refreshed', 'success');
});

// ============================================================
// API Utilities
// ============================================================
async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  return res.json();
}

// ============================================================
// Toast Notifications
// ============================================================
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), duration);
}

// ============================================================
// Modal Helpers
// ============================================================
function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.getElementById('modalBackdrop').classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.getElementById('modalBackdrop').classList.remove('active');
}

document.getElementById('modalBackdrop').addEventListener('click', () => {
  document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  document.getElementById('modalBackdrop').classList.remove('active');
});

document.getElementById('closePatientModal').addEventListener('click', () => closeModal('patientModal'));
document.getElementById('closeApptModal').addEventListener('click', () => closeModal('appointmentModal'));

// ============================================================
// Utility Functions
// ============================================================
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function getRiskBadge(risk) {
  const map = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-success' };
  return `<span class="badge ${map[risk] || 'badge-muted'}">${risk || 'low'}</span>`;
}

function getStatusBadge(status) {
  const map = {
    confirmed: 'badge-success', pending: 'badge-warning',
    completed: 'badge-muted', cancelled: 'badge-danger'
  };
  return `<span class="badge ${map[status] || 'badge-muted'}">${status}</span>`;
}

function parseJsonField(field) {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try { return JSON.parse(field); } catch { return []; }
}

function renderConditionTags(conditions) {
  const list = parseJsonField(conditions);
  if (!list.length) return '<span class="text-muted" style="font-size:13px">None</span>';
  return `<div class="conditions-list">${list.map(c => `<span class="condition-tag">${c}</span>`).join('')}</div>`;
}

function animateNumber(el, target, duration = 1000) {
  const start = parseInt(el.textContent) || 0;
  const step = (target - start) / (duration / 16);
  let current = start;
  const timer = setInterval(() => {
    current += step;
    if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.round(current);
  }, 16);
}

// ============================================================
// Auth Guard & User Session
// ============================================================
function getUser() {
  try { return JSON.parse(localStorage.getItem('medai_user')) || null; }
  catch { return null; }
}

function logout() {
  localStorage.removeItem('medai_user');
  window.location.href = '/login.html';
}

function populateUser(user) {
  if (!user) return;
  // Sidebar user info
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');
  const avatarEl = document.getElementById('sidebarUserAvatar');
  if (nameEl) nameEl.textContent = user.name || 'Dr. Admin';
  if (roleEl) roleEl.textContent = user.role || 'Chief Medical Officer';
  if (avatarEl) avatarEl.textContent = user.avatar || user.name?.substring(0, 2) || 'DR';
}

// ============================================================
// Init
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Auth guard — redirect to login if no session
  const user = getUser();
  if (!user || !user.loggedIn) {
    window.location.href = '/login.html';
    return;
  }

  // Populate user details in sidebar
  populateUser(user);

  // Wire logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Navigate to hash or dashboard
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(hash);
  lucide.createIcons();
});

