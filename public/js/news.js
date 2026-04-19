/* ============================================================
   Health News Page
   ============================================================ */

async function renderNews(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title gradient-text">Health News & Research</h1>
        <p class="page-subtitle">Latest breakthroughs in medicine, technology, and wellness</p>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="renderNews(document.getElementById('pageContainer'))">
        <i data-lucide="refresh-cw" size="14"></i> Refresh
      </button>
    </div>

    <div id="newsGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
      ${[1,2,3,4,5,6].map(() => `
        <div class="card" style="animation: pulse-dot 1.5s infinite;">
          <div style="height: 14px; background: var(--border); border-radius: 4px; width: 40%; margin-bottom: 16px;"></div>
          <div style="height: 18px; background: var(--border); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="height: 12px; background: var(--border); border-radius: 4px; width: 90%; margin-bottom: 6px;"></div>
          <div style="height: 12px; background: var(--border); border-radius: 4px; width: 70%;"></div>
        </div>`).join('')}
    </div>
  `;

  lucide.createIcons();

  try {
    const data = await apiGet('/news');
    const grid = document.getElementById('newsGrid');
    if (!grid) return;

    if (!data.success || !data.data?.length) {
      grid.innerHTML = `<div class="card" style="grid-column: 1/-1;">
        <div class="empty-state"><div class="empty-icon">📰</div><div class="empty-title">No news available</div></div>
      </div>`;
      return;
    }

    grid.innerHTML = data.data.map((article, i) => `
      <a href="${article.url}" target="_blank" rel="noopener" style="text-decoration: none;" class="news-card"
         onclick="${article.url === '#' ? 'event.preventDefault()' : ''}">
        <div class="news-category">${article.category || article.source || 'Health News'}</div>
        <div class="news-title">${article.title}</div>
        <div class="news-desc">${article.description || ''}</div>
        <div class="news-meta">
          <i data-lucide="clock" size="12"></i>
          <span>${formatRelativeTime(article.publishedAt)}</span>
          ${article.source ? `<span>·</span><span>${article.source}</span>` : ''}
          ${data.demo_mode ? '<span class="badge badge-muted" style="font-size: 10px; margin-left: auto;">Demo</span>' : ''}
        </div>
      </a>
    `).join('');

    lucide.createIcons();
  } catch(err) {
    showToast('News fetch failed', 'error');
  }
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
