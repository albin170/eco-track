'use strict';
/**
 * actions.js — Daily eco-action tracking
 *
 * Manages per-day action completion, streak calculation, and monthly CO₂ savings.
 * All DOM construction uses safe element creation — no innerHTML with variable data.
 */

/** Initialise the actions module. */
function initActions() {
  renderActionsGrid('all');
  renderQuickActions();
  initActionsFilter();
}

/**
 * Wire up the category filter buttons.
 */
function initActionsFilter() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-pressed', 'true');
      renderActionsGrid(this.dataset.filter);
    });
    // Ensure initial state is correct
    btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
  });
}

/**
 * Get today's date key in the format "YYYY-M-D".
 * @returns {string}
 */
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * Return the list of action IDs completed today.
 * @returns {string[]}
 */
function getCompletedActions() {
  const data  = getUserData();
  const today = getTodayKey();
  return data.actions?.[today] || [];
}

/**
 * Toggle an action on/off for today.
 * Recalculates monthly savings and streak, then updates the UI.
 * @param {string} actionId
 */
function toggleAction(actionId) {
  const data  = getUserData();
  const today = getTodayKey();

  if (!data.actions)        data.actions = {};
  if (!data.actions[today]) data.actions[today] = [];

  const idx = data.actions[today].indexOf(actionId);
  if (idx === -1) {
    data.actions[today].push(actionId);
  } else {
    data.actions[today].splice(idx, 1);
  }

  // Recalculate monthly savings
  const now   = new Date();
  const month = `${now.getFullYear()}-${now.getMonth()}`;
  if (!data.monthly) data.monthly = {};
  data.monthly[month] = 0;
  Object.keys(data.actions).forEach(dayKey => {
    const [yr, mo] = dayKey.split('-').map(Number);
    if (yr === now.getFullYear() && mo === now.getMonth() + 1) {
      data.actions[dayKey].forEach(id => {
        const a = ECO_ACTIONS.find(act => act.id === id);
        if (a) data.monthly[month] += a.impactKg;
      });
    }
  });

  data.streak = calculateStreak(data.actions);
  saveUserData(null, data);

  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  renderActionsGrid(activeFilter);
  renderQuickActions();
  updateDashboardStats(data);
  checkAndAwardBadges();

  const action = ECO_ACTIONS.find(a => a.id === actionId);
  if (action && idx === -1) {
    showToast(`🌱 +${action.impactKg} kg CO₂ saved! +${action.points} pts`);
  }
}

/**
 * Render the eco-actions grid with optional category filter.
 * Uses safe DOM construction — no innerHTML with variable data.
 * @param {string} filter — category name or 'all'
 */
function renderActionsGrid(filter) {
  const grid      = document.getElementById('actionsGrid');
  if (!grid) return;

  const completed = getCompletedActions();
  const filtered  = filter === 'all'
    ? ECO_ACTIONS
    : ECO_ACTIONS.filter(a => a.category === filter);

  grid.innerHTML = '';

  filtered.forEach(action => {
    const isDone = completed.includes(action.id);

    const card   = document.createElement('div');
    card.className = 'action-card' + (isDone ? ' completed' : '');
    card.id        = 'action-' + action.id;
    card.setAttribute('role', 'checkbox');
    card.setAttribute('aria-checked', isDone ? 'true' : 'false');
    card.setAttribute('aria-label', action.title + (isDone ? ' — completed' : ''));
    card.setAttribute('tabindex', '0');

    // Header
    const hdr      = document.createElement('div');
    hdr.className  = 'action-card-header';
    hdr.setAttribute('aria-hidden', 'true');

    const emojiEl  = document.createElement('span');
    emojiEl.className = 'action-emoji';
    emojiEl.textContent = action.emoji;

    const checkEl  = document.createElement('div');
    checkEl.className = 'action-check';
    checkEl.textContent = isDone ? '✓' : '';

    hdr.appendChild(emojiEl);
    hdr.appendChild(checkEl);

    // Title
    const titleEl  = document.createElement('div');
    titleEl.className = 'action-title';
    titleEl.textContent = action.title;

    // Description
    const descEl   = document.createElement('div');
    descEl.className = 'action-desc';
    descEl.textContent = action.desc;

    // Footer
    const footer   = document.createElement('div');
    footer.className = 'action-footer';
    footer.setAttribute('aria-hidden', 'true');

    const impactEl = document.createElement('span');
    impactEl.className = 'action-impact';
    impactEl.textContent = action.impactText;

    const ptsEl    = document.createElement('span');
    ptsEl.className = 'action-points';
    ptsEl.textContent = '⭐ ' + action.points + ' pts';

    footer.appendChild(impactEl);
    footer.appendChild(ptsEl);

    card.appendChild(hdr);
    card.appendChild(titleEl);
    card.appendChild(descEl);
    card.appendChild(footer);

    card.addEventListener('click',   () => toggleAction(action.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleAction(action.id);
      }
    });

    grid.appendChild(card);
  });
}

/**
 * Render the quick-actions list on the dashboard sidebar.
 * Uses safe DOM construction.
 */
function renderQuickActions() {
  const list      = document.getElementById('quickActionsList');
  if (!list) return;

  const completed = getCompletedActions();
  const sample    = ECO_ACTIONS.slice(0, 5);
  let doneCount   = 0;

  list.innerHTML = '';
  sample.forEach(action => {
    const isDone  = completed.includes(action.id);
    if (isDone) doneCount++;

    const item    = document.createElement('div');
    item.className = 'qa-item' + (isDone ? ' done' : '');
    item.setAttribute('role', 'checkbox');
    item.setAttribute('aria-checked', isDone ? 'true' : 'false');
    item.setAttribute('aria-label', action.title);
    item.setAttribute('tabindex', '0');

    const checkEl = document.createElement('div');
    checkEl.className = 'qa-check';
    checkEl.setAttribute('aria-hidden', 'true');
    checkEl.textContent = isDone ? '✓' : '';

    const labelEl = document.createElement('span');
    labelEl.className = 'qa-label';
    labelEl.textContent = action.emoji + ' ' + action.title;

    const co2El   = document.createElement('span');
    co2El.className = 'qa-co2';
    co2El.textContent = action.impactText;

    item.appendChild(checkEl);
    item.appendChild(labelEl);
    item.appendChild(co2El);

    item.addEventListener('click',   () => toggleAction(action.id));
    item.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleAction(action.id);
      }
    });

    list.appendChild(item);
  });

  const badge = document.getElementById('todayCount');
  if (badge) badge.textContent = `${doneCount} done`;
}

/**
 * Calculate the current action streak by walking backwards from today.
 * A streak day requires at least one completed action.
 * @param {Object.<string, string[]>} actionsObj — map of "YYYY-M-D" → actionId[]
 * @returns {number}
 */
function calculateStreak(actionsObj) {
  if (!actionsObj || typeof actionsObj !== 'object') return 0;
  let streak     = 0;
  const today    = new Date();

  for (let i = 0; i < 365; i++) {
    const d   = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    if (actionsObj[key] && actionsObj[key].length > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
