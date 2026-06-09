// actions.js — Daily action tracking (updated to use per-user storage)

function initActions() {
  renderActionsGrid('all');
  renderQuickActions();
  initActionsFilter();
}

function initActionsFilter() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderActionsGrid(this.dataset.filter);
    });
  });
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function getCompletedActions() {
  const data  = getUserData();
  const today = getTodayKey();
  return data.actions?.[today] || [];
}

function toggleAction(actionId) {
  const data  = getUserData();
  const today = getTodayKey();

  if (!data.actions) data.actions = {};
  if (!data.actions[today]) data.actions[today] = [];

  const idx = data.actions[today].indexOf(actionId);
  if (idx === -1) {
    data.actions[today].push(actionId);
  } else {
    data.actions[today].splice(idx, 1);
  }

  // Update saved kg this month
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

  // Streak
  data.streak = calculateStreak(data.actions);

  saveUserData(null, data);

  // Re-render
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  renderActionsGrid(activeFilter);
  renderQuickActions();
  updateDashboardStats(data);

  // Award badges and points
  checkAndAwardBadges();

  const action = ECO_ACTIONS.find(a => a.id === actionId);
  if (action && idx === -1) {
    showToast(`🌱 +${action.impactKg} kg CO₂ saved! +${action.points} pts`);
  }
}

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
    card.id = 'action-' + action.id;
    card.innerHTML = `
      <div class="action-card-header">
        <span class="action-emoji">${action.emoji}</span>
        <div class="action-check">${isDone ? '✓' : ''}</div>
      </div>
      <div class="action-title">${action.title}</div>
      <div class="action-desc">${action.desc}</div>
      <div class="action-footer">
        <span class="action-impact">${action.impactText}</span>
        <span class="action-points">⭐ ${action.points} pts</span>
      </div>
    `;
    card.addEventListener('click', () => toggleAction(action.id));
    grid.appendChild(card);
  });
}

function renderQuickActions() {
  const list      = document.getElementById('quickActionsList');
  if (!list) return;
  const completed = getCompletedActions();
  const sample    = ECO_ACTIONS.slice(0, 5);
  let doneCount   = 0;

  list.innerHTML = '';
  sample.forEach(action => {
    const isDone = completed.includes(action.id);
    if (isDone) doneCount++;
    const item = document.createElement('div');
    item.className = 'qa-item' + (isDone ? ' done' : '');
    item.innerHTML = `
      <div class="qa-check">${isDone ? '✓' : ''}</div>
      <span class="qa-label">${action.emoji} ${action.title}</span>
      <span class="qa-co2">${action.impactText}</span>
    `;
    item.addEventListener('click', () => toggleAction(action.id));
    list.appendChild(item);
  });

  const badge = document.getElementById('todayCount');
  if (badge) badge.textContent = `${doneCount} done`;
}

function calculateStreak(actionsObj) {
  if (!actionsObj) return 0;
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    if (actionsObj[key] && actionsObj[key].length > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
