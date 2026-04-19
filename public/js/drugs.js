/* ============================================================
   Drug Lookup Page
   ============================================================ */

async function renderDrugs(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title gradient-text">Drug Information Lookup</h1>
        <p class="page-subtitle">Powered by OpenFDA — Search drug labels, warnings, and interactions</p>
      </div>
      <span class="badge badge-success" style="font-size: 13px; padding: 8px 16px;">FDA Database</span>
    </div>

    <!-- Search bar -->
    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <div class="search-container" style="flex: 1;">
          <i data-lucide="search" size="16" class="search-icon"></i>
          <input type="text" id="drugSearchInput" class="form-input" placeholder="Search drug name e.g. Aspirin, Ibuprofen, Metformin..." style="padding-left: 38px;" />
        </div>
        <button class="btn btn-primary" id="drugSearchBtn" onclick="searchDrug()">
          <i data-lucide="search" size="16"></i> Search
        </button>
      </div>
      <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">
        Powered by the FDA's openFDA API — Contains information from 1M+ drug labels
      </div>
    </div>

    <!-- Popular drugs -->
    <div class="card" style="margin-bottom: 24px;" id="popularDrugsSection">
      <h2 class="section-title" style="margin-bottom: 16px;">🔥 Popular Drug Searches</h2>
      <div id="popularDrugsList" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
        <div class="loading-spinner" style="margin: 20px auto; grid-column: 1/-1;"></div>
      </div>
    </div>

    <!-- Results -->
    <div id="drugResults"></div>
  `;

  lucide.createIcons();

  // Enter key search
  document.getElementById('drugSearchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchDrug();
  });

  loadPopularDrugs();
}

async function loadPopularDrugs() {
  try {
    const data = await apiGet('/drugs/popular');
    const el = document.getElementById('popularDrugsList');
    if (!el || !data.success) return;

    el.innerHTML = data.data.map(d => `
      <button class="drug-popular-card" onclick="quickSearchDrug('${d.name}')" style="
        background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md);
        padding: 16px; text-align: left; cursor: pointer; transition: var(--transition);
        font-family: var(--font-sans); color: var(--text-primary); width: 100%;
      " onmouseover="this.style.borderColor='var(--border-primary)'; this.style.background='var(--bg-card-hover)'"
         onmouseout="this.style.borderColor='var(--border)'; this.style.background='var(--bg-card)'">
        <div style="font-size: 22px; margin-bottom: 8px;">${d.icon}</div>
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${d.name}</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">${d.use}</div>
        <span class="badge badge-primary" style="font-size: 10px;">${d.category}</span>
      </button>
    `).join('');
  } catch(e) { /* ignore */ }
}

function quickSearchDrug(name) {
  document.getElementById('drugSearchInput').value = name;
  searchDrug();
}

async function searchDrug() {
  const query = document.getElementById('drugSearchInput').value.trim();
  if (!query) { showToast('Please enter a drug name', 'warning'); return; }

  const btn = document.getElementById('drugSearchBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div> Searching...';

  const results = document.getElementById('drugResults');
  results.innerHTML = `
    <div class="card" style="text-align: center; padding: 40px;">
      <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto 12px;"></div>
      <div style="color: var(--text-secondary);">Querying FDA database...</div>
    </div>`;

  try {
    const data = await apiGet(`/drugs/search?q=${encodeURIComponent(query)}`);
    const eventsData = await apiGet(`/drugs/adverse-events?drug=${encodeURIComponent(query)}`);

    if (!data.success || !data.data?.length) {
      results.innerHTML = `
        <div class="card">
          <div class="empty-state">
            <div class="empty-icon">💊</div>
            <div class="empty-title">No results for "${query}"</div>
            <div class="empty-desc">Try a different drug name or check your spelling. The FDA database contains generic and brand names.</div>
          </div>
        </div>`;
      return;
    }

    const events = eventsData.data || [];

    results.innerHTML = data.data.map((drug, idx) => `
      <div class="card" style="margin-bottom: 20px;">
        <!-- Drug Header -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
              <h2 style="font-size: 22px; font-weight: 800;">${drug.brand_name}</h2>
              <span class="badge badge-primary">${drug.route || 'Oral'}</span>
            </div>
            <div style="font-size: 14px; color: var(--text-secondary);">Generic: <strong>${drug.generic_name}</strong> · Manufacturer: ${drug.manufacturer}</div>
          </div>
        </div>

        <!-- Drug info grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
          <div class="drug-info-block">
            <div class="drug-info-label">📋 Purpose / Indications</div>
            <div class="drug-info-value">${drug.purpose || drug.indications || 'Not specified'}</div>
          </div>
          <div class="drug-info-block">
            <div class="drug-info-label">💊 Dosage & Administration</div>
            <div class="drug-info-value">${drug.dosage}</div>
          </div>
        </div>

        <div class="drug-info-block" style="border-left: 3px solid var(--accent-red); margin-bottom: 12px;">
          <div class="drug-info-label" style="color: var(--accent-red);">⚠️ Warnings</div>
          <div class="drug-info-value">${drug.warnings}</div>
        </div>

        <div class="drug-info-block" style="border-left: 3px solid var(--accent-amber); margin-bottom: 12px;">
          <div class="drug-info-label" style="color: var(--accent-amber);">🔄 Drug Interactions</div>
          <div class="drug-info-value">${drug.drug_interactions}</div>
        </div>

        <div class="drug-info-block" style="margin-bottom: 12px;">
          <div class="drug-info-label">😞 Adverse Reactions</div>
          <div class="drug-info-value">${drug.adverse_reactions}</div>
        </div>

        ${events.length ? `
          <div class="drug-info-block">
            <div class="drug-info-label">📊 FDA Reported Adverse Events (Top)</div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
              ${events.slice(0, 8).map(e => `
                <div style="display: flex; align-items: center; gap: 6px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-full); padding: 4px 12px; font-size: 12px;">
                  <span style="color: var(--accent-red);">${e.reaction}</span>
                  <span style="color: var(--text-muted); font-family: var(--font-mono);">${e.count.toLocaleString()}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="background: rgba(59,130,246,0.07); border: 1px solid rgba(59,130,246,0.2); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 12px; color: var(--text-muted); margin-top: 16px;">
          ℹ️ Source: U.S. Food & Drug Administration (openFDA) · Always consult your pharmacist or physician before taking any medications.
        </div>
      </div>
    `).join('');

    // Hide popular section
    const popSection = document.getElementById('popularDrugsSection');
    if (popSection) popSection.style.display = 'none';

  } catch(err) {
    results.innerHTML = `<div class="card"><div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Error</div><div class="empty-desc">${err.message}</div></div></div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="search" size="16"></i> Search';
    lucide.createIcons();
  }
}
