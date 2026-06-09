// gamification.js — Badges, Points, Leaderboard

const BADGES = [
  {
    id: 'first-action',
    emoji: '🌱',
    name: 'Green Beginner',
    desc: 'Complete your first eco action',
    color: '#22c55e',
    check: (data) => Object.values(data.actions || {}).some(day => day.length > 0)
  },
  {
    id: 'calculator-done',
    emoji: '⭐',
    name: 'Footprint Mapped',
    desc: 'Calculate your carbon footprint',
    color: '#f59e0b',
    check: (data) => !!data.footprint
  },
  {
    id: 'ten-actions',
    emoji: '♻️',
    name: 'Recycling Hero',
    desc: 'Complete 10 eco actions total',
    color: '#06b6d4',
    check: (data) => {
      let total = 0;
      Object.values(data.actions || {}).forEach(day => total += day.length);
      return total >= 10;
    }
  },
  {
    id: 'eco-traveler',
    emoji: '🚲',
    name: 'Eco Traveler',
    desc: 'Complete 5 transport actions',
    color: '#8b5cf6',
    check: (data) => {
      let count = 0;
      const transportIds = ['walk-bike','public-transit','carpool','work-from-home'];
      Object.values(data.actions || {}).forEach(day => {
        day.forEach(id => { if (transportIds.includes(id)) count++; });
      });
      return count >= 5;
    }
  },
  {
    id: 'streak-7',
    emoji: '🔥',
    name: 'Streak Master',
    desc: 'Maintain a 7-day action streak',
    color: '#ef4444',
    check: (data) => (data.streak || 0) >= 7
  },
  {
    id: 'challenge-1',
    emoji: '🏆',
    name: 'Challenge Accepted',
    desc: 'Complete your first weekly challenge',
    color: '#fbbf24',
    check: (data) => (data.completedChallenges || []).length >= 1
  },
  {
    id: 'points-500',
    emoji: '💚',
    name: 'Green Warrior',
    desc: 'Earn 500 Green Points',
    color: '#16a34a',
    check: (data) => (data.points || 0) >= 500
  },
  {
    id: 'climate-champion',
    emoji: '🌍',
    name: 'Climate Champion',
    desc: 'Complete 50 eco actions total',
    color: '#0ea5e9',
    check: (data) => {
      let total = 0;
      Object.values(data.actions || {}).forEach(day => total += day.length);
      return total >= 50;
    }
  }
];

const SIMULATED_LEADERBOARD = [
  { username: 'EcoWarrior_Priya',   avatar: 'PR', color: '#22c55e', points: 2840, badges: 7, actions: 94, reduction: 3.2 },
  { username: 'GreenMind_Arjun',    avatar: 'AR', color: '#06b6d4', points: 2610, badges: 6, actions: 87, reduction: 2.9 },
  { username: 'SustainableSneha',   avatar: 'SN', color: '#8b5cf6', points: 2200, badges: 6, actions: 73, reduction: 2.5 },
  { username: 'NatureFirst_Rahul',  avatar: 'RH', color: '#f59e0b', points: 1980, badges: 5, actions: 66, reduction: 2.1 },
  { username: 'ClimateHero_Meera',  avatar: 'ME', color: '#ef4444', points: 1760, badges: 5, actions: 58, reduction: 1.8 },
  { username: 'ZeroWaste_Vikram',   avatar: 'VI', color: '#10b981', points: 1540, badges: 4, actions: 51, reduction: 1.5 },
  { username: 'EcoLeader_Ananya',   avatar: 'AN', color: '#f97316', points: 1320, badges: 4, actions: 44, reduction: 1.3 },
  { username: 'GreenPath_Kiran',    avatar: 'KI', color: '#3b82f6', points: 1100, badges: 3, actions: 37, reduction: 1.1 },
  { username: 'PlantBased_Divya',   avatar: 'DI', color: '#a855f7', points: 890,  badges: 3, actions: 29, reduction: 0.9 },
  { username: 'EcoStart_Rohit',     avatar: 'RO', color: '#22c55e', points: 620,  badges: 2, actions: 20, reduction: 0.6 },
];

function initGamification() {
  renderBadges();
  renderLeaderboard();
}

function getTotalActions(data) {
  let total = 0;
  Object.values(data.actions || {}).forEach(day => total += day.length);
  return total;
}

function getTotalPoints(data) {
  let points = 0;
  Object.values(data.actions || {}).forEach(day => {
    day.forEach(id => {
      const action = ECO_ACTIONS.find(a => a.id === id);
      if (action) points += action.points;
    });
  });
  // Add challenge points
  (data.completedChallenges || []).forEach(() => points += 100);
  return points;
}

function checkAndAwardBadges() {
  const data = getUserData();
  const currentBadges = data.badges || [];
  const newBadges = [];

  // Recalculate points
  const points = getTotalPoints(data);
  data.points = points;

  for (const badge of BADGES) {
    if (!currentBadges.includes(badge.id) && badge.check(data)) {
      currentBadges.push(badge.id);
      newBadges.push(badge);
    }
  }

  data.badges = currentBadges;
  saveUserData(null, data);

  // Show badge unlock toasts
  newBadges.forEach((badge, i) => {
    setTimeout(() => showBadgeToast(badge), i * 1200);
  });

  // Re-render if badges section is visible
  renderBadges();
  renderLeaderboard();
}

function showBadgeToast(badge) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.6rem;">
      <span style="font-size:1.5rem;">${badge.emoji}</span>
      <div>
        <div style="font-weight:700;font-size:0.9rem;">Badge Unlocked! ${badge.name}</div>
        <div style="font-size:0.75rem;opacity:0.8;">${badge.desc}</div>
      </div>
    </div>
  `;
  el.classList.add('show', 'toast--badge');
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    el.classList.remove('show', 'toast--badge');
  }, 4000);
}

function renderBadges() {
  const container = document.getElementById('badgesGrid');
  if (!container) return;

  const data = getUserData();
  const earnedIds = data.badges || [];

  container.innerHTML = '';
  BADGES.forEach(badge => {
    const earned = earnedIds.includes(badge.id);
    const div = document.createElement('div');
    div.className = 'badge-card' + (earned ? ' badge-earned' : ' badge-locked');
    div.style.setProperty('--badge-color', badge.color);
    div.innerHTML = `
      <div class="badge-emoji">${badge.emoji}</div>
      <div class="badge-name">${badge.name}</div>
      <div class="badge-desc">${badge.desc}</div>
      ${earned ? '<div class="badge-status">✅ Earned</div>' : '<div class="badge-status">🔒 Locked</div>'}
    `;
    container.appendChild(div);
  });
}

function renderLeaderboard() {
  const container = document.getElementById('leaderboardList');
  if (!container) return;

  const user = getCurrentUser();
  const data = getUserData();
  const userPoints = getTotalPoints(data);
  const userBadges = (data.badges || []).length;
  const userActions = getTotalActions(data);

  // Insert user into leaderboard
  const allUsers = [...SIMULATED_LEADERBOARD];
  const userEntry = {
    username: user ? user.username : 'You',
    avatar: user ? getAvatarInitials(user.username) : 'ME',
    color: user ? getAvatarColor(user.username) : '#22c55e',
    points: userPoints,
    badges: userBadges,
    actions: userActions,
    reduction: data.footprint ? parseFloat(((data.footprint.total / 1000) * 0.2).toFixed(1)) : 0,
    isYou: true
  };

  allUsers.push(userEntry);
  allUsers.sort((a, b) => b.points - a.points);

  container.innerHTML = '';
  allUsers.slice(0, 12).forEach((entry, index) => {
    const rank = index + 1;
    const row = document.createElement('div');
    row.className = 'lb-row' + (entry.isYou ? ' lb-row--you' : '');
    const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

    row.innerHTML = `
      <div class="lb-rank">${medalEmoji}</div>
      <div class="lb-avatar" style="background:${entry.color}">${entry.avatar}</div>
      <div class="lb-info">
        <div class="lb-name">${entry.username}${entry.isYou ? ' <span class="you-tag">You</span>' : ''}</div>
        <div class="lb-sub">${entry.actions} actions · ${entry.badges} badges</div>
      </div>
      <div class="lb-points">
        <span class="lb-pts-num">${entry.points.toLocaleString()}</span>
        <span class="lb-pts-label">pts</span>
      </div>
    `;
    container.appendChild(row);
  });

  // Update user rank display
  const userRank = allUsers.findIndex(e => e.isYou) + 1;
  const rankEl = document.getElementById('userRankDisplay');
  if (rankEl) rankEl.textContent = '#' + userRank + ' of ' + allUsers.length;

  const ptsEl = document.getElementById('userPointsDisplay');
  if (ptsEl) ptsEl.textContent = userPoints.toLocaleString() + ' pts';
}
