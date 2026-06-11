// app.js — Main app controller: routing, dashboard, auth UI, toast

// ─── Cached DOM references (populated at DOMContentLoaded) ───
const _dom = {};

// ─── Debounce helper ───
/**
 * Returns a debounced version of fn, only called after `wait` ms of silence.
 * @param {Function} fn
 * @param {number} wait
 * @returns {Function}
 */
function debounce(fn, wait) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

// ─── Safe HTML escape (prevents XSS from user data in innerHTML) ───
/**
 * Escape a string for safe insertion into innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtmlApp(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===================== TAB ROUTING =====================

/**
 * Switch to a named tab section. Updates ARIA attributes and lazy-initialises
 * modules on first visit.
 * @param {string} tabName
 */
function switchTab(tabName) {
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));

  const navBtn  = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
  const section = document.getElementById(`section-${tabName}`);

  if (navBtn) {
    navBtn.classList.add('active');
    navBtn.setAttribute('aria-selected', 'true');
  }
  if (section) section.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Lazy-init new tabs on first visit
  if (tabName === 'challenges')  renderChallenges();
  if (tabName === 'leaderboard') { renderBadges(); renderLeaderboard(); }
  if (tabName === 'simulator')   initSimulator();
  if (tabName === 'hub')         renderHubArticles();
  if (tabName === 'chat')        initChatbot();
  if (tabName === 'insights')    renderInsights();
}

// ===================== DASHBOARD =====================

/**
 * Re-render all dashboard widgets from stored user data.
 */
function updateDashboard() {
  const data = getUserData();
  const fp   = data.footprint;

  if (fp) {
    _dom.heroTotal && (_dom.heroTotal.textContent = (fp.total / 1000).toFixed(1) + 't');
    _dom.globeScore && (_dom.globeScore.textContent = getGrade(fp.tonnes));
    _dom.navEcoScore && (_dom.navEcoScore.textContent = getGrade(fp.tonnes));

    const max = Math.max(fp.transport, fp.food, fp.energy, fp.shopping, 1);
    _setBar('barTransport', (fp.transport / max) * 100);
    _setBar('barFood',      (fp.food      / max) * 100);
    _setBar('barEnergy',    (fp.energy    / max) * 100);
    _setBar('barShopping',  (fp.shopping  / max) * 100);

    _setText('valTransport', (fp.transport / 1000).toFixed(2) + 't');
    _setText('valFood',      (fp.food      / 1000).toFixed(2) + 't');
    _setText('valEnergy',    (fp.energy    / 1000).toFixed(2) + 't');
    _setText('valShopping',  (fp.shopping  / 1000).toFixed(2) + 't');

    _dom.breakdownCta && _dom.breakdownCta.classList.remove('visible');

    // Trees equivalent
    const trees = Math.ceil(fp.total / 22000);
    _setText('treesEquivalent', trees);

    updateComparison(fp.tonnes);
  } else {
    _dom.breakdownCta && _dom.breakdownCta.classList.add('visible');
    _dom.heroTotal  && (_dom.heroTotal.textContent  = '—');
    _dom.globeScore && (_dom.globeScore.textContent = '?');
  }

  updateDashboardStats(data);
}

/** Set a bar fill width (%) by element id. */
function _setBar(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = pct + '%';
}

/** Set element textContent safely by id. */
function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/**
 * Update streak, saved CO₂, points, and trend chart from user data.
 * @param {Object} data
 */
function updateDashboardStats(data) {
  const now   = new Date();
  const month = `${now.getFullYear()}-${now.getMonth()}`;
  const saved = data.monthly?.[month] || 0;

  _dom.heroSaved  && (_dom.heroSaved.textContent  = saved.toFixed(1));
  _dom.heroStreak && (_dom.heroStreak.textContent = data.streak || 0);

  const trendBadge = _dom.trendBadge;
  if (trendBadge) {
    trendBadge.textContent = (data.streak || 0) > 0
      ? `${data.streak} day streak 🔥`
      : 'Start your streak';
  }

  // Points display
  const pts   = typeof getTotalPoints === 'function' ? getTotalPoints(data) : (data.points || 0);
  const ptsEl = _dom.navPoints;
  if (ptsEl) ptsEl.textContent = pts + ' pts';

  // Debounced chart render
  _debouncedTrendChart(data);
}

/**
 * Update the Global Comparison card with the user's calculated tonnes.
 * @param {number} tonnes
 */
function updateComparison(tonnes) {
  const maxT = 14.7;
  const pct  = Math.min((tonnes / maxT) * 100, 100);

  _setComparisonRow('compYou', 'compYouBar', pct);
  _setText('compYouVal', tonnes.toFixed(1) + 't');

  const youRow = document.getElementById('compYou');
  if (youRow) youRow.style.display = 'flex';

  let msg = '';
  if (tonnes <= 1.0)      msg = '🌟 You\'re within the Paris 2050 target!';
  else if (tonnes <= 1.9) msg = '👍 Below India\'s average — great start!';
  else if (tonnes <= 4.0) msg = '📊 Below the world average.';
  else                    msg = '⚠️ Above world average. Room to reduce.';

  _setText('compNote', msg);
}

/**
 * Helper to set a comparison bar fill width.
 * @param {string} rowId
 * @param {string} barId
 * @param {number} pct
 */
function _setComparisonRow(rowId, barId, pct) {
  const bar = document.getElementById(barId);
  if (bar) bar.style.width = pct + '%';
}

// ─── Trend chart (debounced to 200 ms) ───
const _debouncedTrendChart = debounce(renderTrendChart, 200);

/**
 * Draw a 7-day CO₂ savings trend chart on a canvas element.
 * @param {Object} data
 */
function renderTrendChart(data) {
  const canvas      = document.getElementById('trendCanvas');
  const placeholder = document.querySelector('.trend-placeholder');
  if (!canvas) return;

  const actions = data.actions || {};
  const days    = [];
  const values  = [];

  for (let i = 6; i >= 0; i--) {
    const d     = new Date();
    d.setDate(d.getDate() - i);
    const key   = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
    let kg = 0;
    if (actions[key]) {
      actions[key].forEach(id => {
        const a = ECO_ACTIONS.find(act => act.id === id);
        if (a) kg += a.impactKg;
      });
    }
    days.push(label);
    values.push(kg);
  }

  const hasData = values.some(v => v > 0);
  if (!hasData) {
    canvas.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
    return;
  }

  canvas.style.display = 'block';
  if (placeholder) placeholder.style.display = 'none';

  const ctx  = canvas.getContext('2d');
  const w    = canvas.width;
  const h    = canvas.height;
  const pad  = { top: 20, bottom: 30, left: 10, right: 10 };
  const maxV = Math.max(...values, 1);
  const step = (w - pad.left - pad.right) / (days.length - 1);

  ctx.clearRect(0, 0, w, h);
  _drawChartGrid(ctx, w, h, pad);

  // Fill gradient area
  const grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
  grad.addColorStop(0, 'rgba(74,222,128,0.3)');
  grad.addColorStop(1, 'rgba(74,222,128,0.02)');

  ctx.beginPath();
  values.forEach((val, i) => {
    const x = pad.left + i * step;
    const y = pad.top + (1 - val / maxV) * (h - pad.top - pad.bottom);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.left + (values.length - 1) * step, h - pad.bottom);
  ctx.lineTo(pad.left, h - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth   = 2.5;
  ctx.lineJoin    = 'round';
  ctx.lineCap     = 'round';
  values.forEach((val, i) => {
    const x = pad.left + i * step;
    const y = pad.top + (1 - val / maxV) * (h - pad.top - pad.bottom);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots
  values.forEach((val, i) => {
    const x = pad.left + i * step;
    const y = pad.top + (1 - val / maxV) * (h - pad.top - pad.bottom);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle   = '#4ade80';
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur  = 8;
    ctx.fill();
    ctx.shadowBlur  = 0;
  });

  // X-axis labels
  ctx.fillStyle = 'rgba(148,163,184,0.8)';
  ctx.font      = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  days.forEach((label, i) => {
    const x = pad.left + i * step;
    ctx.fillText(label, x, h - 6);
  });
}

/**
 * Draw evenly-spaced horizontal grid lines on a canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {{ top: number, bottom: number, left: number, right: number }} pad
 */
function _drawChartGrid(ctx, w, h, pad) {
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + ((h - pad.top - pad.bottom) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
  }
}

// ===================== TOAST =====================
let toastTimeout;

/**
 * Show a temporary toast notification. Plain-text only — no HTML accepted.
 * @param {string} msg
 */
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg; // textContent (not innerHTML) — XSS safe
  el.setAttribute('aria-live', 'polite');
  el.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove('show'), 3200);
}

// ===================== NAVBAR USER =====================

/**
 * Render the current user's name and avatar in the navigation bar.
 */
function renderNavUser() {
  const user = getCurrentUser();
  if (!user) return;

  const nameEl   = document.getElementById('navUserName');
  const avatarEl = document.getElementById('navUserAvatar');

  if (nameEl)   nameEl.textContent   = escapeHtmlApp(user.username);
  if (avatarEl) {
    avatarEl.textContent          = getAvatarInitials(user.username);
    avatarEl.style.background     = getAvatarColor(user.username);
    avatarEl.setAttribute('aria-label', `${user.username}'s avatar`);
  }
}

// ===================== CHATBOT TOGGLE =====================

/** Open the EcoBot chatbot modal. */
function openChatbot() {
  const modal = document.getElementById('chatbotModal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    initChatbot();
    // Focus the chat input for keyboard users
    setTimeout(() => {
      const input = document.getElementById('chatInput');
      if (input) input.focus();
    }, 150);
  }
}

/** Close the EcoBot chatbot modal. */
function closeChatbot() {
  const modal = document.getElementById('chatbotModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Return focus to the FAB button
    const fab = document.querySelector('.chatbot-fab');
    if (fab) fab.focus();
  }
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', function () {
  // Auth guard
  if (!requireAuth()) return;

  // Cache frequently-accessed DOM elements
  _dom.heroTotal    = document.getElementById('heroTotal');
  _dom.heroSaved    = document.getElementById('heroSaved');
  _dom.heroStreak   = document.getElementById('heroStreak');
  _dom.globeScore   = document.getElementById('globeScore');
  _dom.navEcoScore  = document.getElementById('navEcoScore');
  _dom.navPoints    = document.getElementById('navPoints');
  _dom.trendBadge   = document.getElementById('trendBadge');
  _dom.breakdownCta = document.getElementById('breakdownCta');

  // Render nav user info
  renderNavUser();

  // Nav tab clicks — wire up with ARIA
  const tabList = document.getElementById('navTabs');
  if (tabList) {
    tabList.setAttribute('role', 'tablist');
    tabList.setAttribute('aria-label', 'App sections');
  }
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
    tab.setAttribute('aria-controls', 'section-' + tab.dataset.tab);
    tab.addEventListener('click', function () {
      switchTab(this.dataset.tab);
    });
    // Keyboard: allow arrow-key navigation between tabs
    tab.addEventListener('keydown', function (e) {
      const tabs = [...document.querySelectorAll('.nav-tab')];
      const idx  = tabs.indexOf(this);
      if (e.key === 'ArrowRight') { e.preventDefault(); tabs[(idx + 1) % tabs.length].focus(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); tabs[(idx - 1 + tabs.length) % tabs.length].focus(); }
    });
  });

  // Set ARIA ids on tab panels
  document.querySelectorAll('.tab-section').forEach(section => {
    section.setAttribute('role', 'tabpanel');
    section.setAttribute('tabindex', '0');
  });

  // Load dashboard and initialize sub-modules
  updateDashboard();
  initCalculator();
  initActions();
  initInsights();
  initGamification();
  initChallenges();

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function (e) {
      if (e.target === this) {
        this.classList.remove('open');
        this.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  });

  // Close article modal
  const closeArticleBtn = document.getElementById('closeArticle');
  if (closeArticleBtn) {
    closeArticleBtn.addEventListener('click', closeArticleModal);
  }

  // Escape key closes any open modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => {
        m.classList.remove('open');
        m.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    }
  });

  console.log('%cEcoTrack loaded 🌱', 'color: #4ade80; font-weight: bold; font-size: 14px;');
});
