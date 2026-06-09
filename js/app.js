// app.js — Main app controller: routing, dashboard, auth UI, toast

// ===================== TAB ROUTING =====================
function switchTab(tabName) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));

  const navBtn  = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
  const section = document.getElementById(`section-${tabName}`);

  if (navBtn)  navBtn.classList.add('active');
  if (section) section.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Lazy-init new tabs on first visit
  if (tabName === 'challenges')  renderChallenges();
  if (tabName === 'leaderboard') { renderBadges(); renderLeaderboard(); }
  if (tabName === 'simulator')   initSimulator();
  if (tabName === 'hub')         renderHubArticles();
  if (tabName === 'chat')        initChatbot();
  if (tabName === 'insights')    { renderInsights(); }
}

// ===================== DASHBOARD =====================
function updateDashboard() {
  const data = getUserData();
  const fp   = data.footprint;

  if (fp) {
    document.getElementById('heroTotal').textContent = (fp.total / 1000).toFixed(1) + 't';
    document.getElementById('globeScore').textContent = getGrade(fp.tonnes);
    document.getElementById('navEcoScore').textContent = getGrade(fp.tonnes);

    const max = Math.max(fp.transport, fp.food, fp.energy, fp.shopping, 1);
    document.getElementById('barTransport').style.width = ((fp.transport / max) * 100) + '%';
    document.getElementById('barFood').style.width      = ((fp.food / max)      * 100) + '%';
    document.getElementById('barEnergy').style.width    = ((fp.energy / max)    * 100) + '%';
    document.getElementById('barShopping').style.width  = ((fp.shopping / max)  * 100) + '%';

    document.getElementById('valTransport').textContent = (fp.transport / 1000).toFixed(2) + 't';
    document.getElementById('valFood').textContent      = (fp.food / 1000).toFixed(2) + 't';
    document.getElementById('valEnergy').textContent    = (fp.energy / 1000).toFixed(2) + 't';
    document.getElementById('valShopping').textContent  = (fp.shopping / 1000).toFixed(2) + 't';

    const cta = document.getElementById('breakdownCta');
    if (cta) cta.classList.remove('visible');

    // Trees equivalent
    const trees = Math.ceil(fp.total / 22000);
    const treesEl = document.getElementById('treesEquivalent');
    if (treesEl) treesEl.textContent = trees;

    updateComparison(fp.tonnes);
  } else {
    const cta = document.getElementById('breakdownCta');
    if (cta) cta.classList.add('visible');
    document.getElementById('heroTotal').textContent = '—';
    document.getElementById('globeScore').textContent = '?';
  }

  updateDashboardStats(data);
}

function updateDashboardStats(data) {
  const now   = new Date();
  const month = `${now.getFullYear()}-${now.getMonth()}`;
  const saved = data.monthly?.[month] || 0;

  document.getElementById('heroSaved').textContent  = saved.toFixed(1);
  document.getElementById('heroStreak').textContent = data.streak || 0;

  const trendBadge = document.getElementById('trendBadge');
  if (trendBadge) {
    trendBadge.textContent = (data.streak || 0) > 0
      ? `${data.streak} day streak 🔥`
      : 'Start your streak';
  }

  // Points display
  const pts = getTotalPoints ? getTotalPoints(data) : (data.points || 0);
  const ptsEl = document.getElementById('navPoints');
  if (ptsEl) ptsEl.textContent = pts + ' pts';

  renderTrendChart(data);
}

function updateComparison(tonnes) {
  const maxT = 14.7;
  const pct  = Math.min((tonnes / maxT) * 100, 100);

  const youRow = document.getElementById('compYou');
  const youBar = document.getElementById('compYouBar');
  const youVal = document.getElementById('compYouVal');
  const note   = document.getElementById('compNote');

  if (youRow) youRow.style.display = 'flex';
  if (youBar) youBar.style.width = pct + '%';
  if (youVal) youVal.textContent = tonnes.toFixed(1) + 't';

  let msg = '';
  if (tonnes <= 1.0)     msg = '🌟 You\'re within the Paris 2050 target!';
  else if (tonnes <= 1.9) msg = '👍 Below India\'s average — great start!';
  else if (tonnes <= 4.0) msg = '📊 Below the world average.';
  else                    msg = '⚠️ Above world average. Room to reduce.';

  if (note) note.textContent = msg;
}

function renderTrendChart(data) {
  const canvas      = document.getElementById('trendCanvas');
  const placeholder = document.querySelector('.trend-placeholder');
  if (!canvas) return;

  const actions = data.actions || {};
  const days    = [];
  const values  = [];

  for (let i = 6; i >= 0; i--) {
    const d    = new Date();
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

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + ((h - pad.top - pad.bottom) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
  }

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

  values.forEach((val, i) => {
    const x = pad.left + i * step;
    const y = pad.top + (1 - val / maxV) * (h - pad.top - pad.bottom);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle   = '#4ade80';
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur  = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  ctx.fillStyle = 'rgba(148,163,184,0.8)';
  ctx.font      = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  days.forEach((label, i) => {
    const x = pad.left + i * step;
    ctx.fillText(label, x, h - 6);
  });
}

// ===================== TOAST =====================
let toastTimeout;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.innerHTML = msg;
  el.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove('show'), 3200);
}

// ===================== NAVBAR USER =====================
function renderNavUser() {
  const user = getCurrentUser();
  if (!user) return;

  const nameEl = document.getElementById('navUserName');
  const avatarEl = document.getElementById('navUserAvatar');

  if (nameEl) nameEl.textContent = user.username;
  if (avatarEl) {
    avatarEl.textContent = getAvatarInitials(user.username);
    avatarEl.style.background = getAvatarColor(user.username);
  }
}

// ===================== CHATBOT TOGGLE =====================
function openChatbot() {
  const modal = document.getElementById('chatbotModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    initChatbot();
  }
}

function closeChatbot() {
  const modal = document.getElementById('chatbotModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', function() {
  // Auth guard
  if (!requireAuth()) return;

  // Render nav user
  renderNavUser();

  // Nav tab clicks
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      switchTab(this.dataset.tab);
    });
  });

  // Load dashboard data and update
  updateDashboard();

  // Init sub-modules
  initCalculator();
  initActions();
  initInsights();
  initGamification();
  initChallenges();

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // Close article modal
  const closeArticleBtn = document.getElementById('closeArticle');
  if (closeArticleBtn) {
    closeArticleBtn.addEventListener('click', closeArticleModal);
  }

  console.log('%cEcoTrack loaded 🌱', 'color: #4ade80; font-weight: bold; font-size: 14px;');
});
