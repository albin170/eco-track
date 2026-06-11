'use strict';
/**
 * gamification.js — Badges, Points & Leaderboard
 *
 * All badge and leaderboard data is static/trusted — but all DOM construction
 * uses safe element creation (no innerHTML with user-supplied data).
 */

/** @type {Array<{id:string, emoji:string, name:string, desc:string, color:string, check:Function}>} */
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
    check: (data) => getTotalActions(data) >= 10
  },
  {
    id: 'eco-traveler',
    emoji: '🚲',
    name: 'Eco Traveler',
    desc: 'Complete 5 transport actions',
    color: '#8b5cf6',
    check: (data) => {
      const transportIds = ['walk-bike', 'public-transit', 'carpool', 'work-from-home'];
      let count = 0;
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
    check: (data) => getTotalActions(data) >= 50
  }
];

/** Simulated community leaderboard (static, no user data) */
const SIMULATED_LEADERBOARD = [
  { username: 'EcoWarrior_Priya',  avatar: 'PR', color: '#22c55e', points: 2840, badges: 7, actions: 94, reduction: 3.2 },
  { username: 'GreenMind_Arjun',   avatar: 'AR', color: '#06b6d4', points: 2610, badges: 6, actions: 87, reduction: 2.9 },
  { username: 'SustainableSneha',  avatar: 'SN', color: '#8b5cf6', points: 2200, badges: 6, actions: 73, reduction: 2.5 },
  { username: 'NatureFirst_Rahul', avatar: 'RH', color: '#f59e0b', points: 1980, badges: 5, actions: 66, reduction: 2.1 },
  { username: 'ClimateHero_Meera', avatar: 'ME', color: '#ef4444', points: 1760, badges: 5, actions: 58, reduction: 1.8 },
  { username: 'ZeroWaste_Vikram',  avatar: 'VI', color: '#10b981', points: 1540, badges: 4, actions: 51, reduction: 1.5 },
  { username: 'EcoLeader_Ananya',  avatar: 'AN', color: '#f97316', points: 1320, badges: 4, actions: 44, reduction: 1.3 },
  { username: 'GreenPath_Kiran',   avatar: 'KI', color: '#3b82f6', points: 1100, badges: 3, actions: 37, reduction: 1.1 },
  { username: 'PlantBased_Divya',  avatar: 'DI', color: '#a855f7', points: 890,  badges: 3, actions: 29, reduction: 0.9 },
  { username: 'EcoStart_Rohit',    avatar: 'RO', color: '#22c55e', points: 620,  badges: 2, actions: 20, reduction: 0.6 },
];

/** Initialise gamification module. */
function initGamification() {
  renderBadges();
  renderLeaderboard();
}

/**
 * Count total eco actions completed across all days.
 * @param {Object} data
 * @returns {number}
 */
function getTotalActions(data) {
  let total = 0;
  Object.values(data.actions || {}).forEach(day => total += day.length);
  return total;
}

/**
 * Calculate total green points from actions and completed challenges.
 * @param {Object} data
 * @returns {number}
 */
function getTotalPoints(data) {
  let points = 0;
  Object.values(data.actions || {}).forEach(day => {
    day.forEach(id => {
      const action = ECO_ACTIONS.find(a => a.id === id);
      if (action) points += action.points;
    });
  });
  (data.completedChallenges || []).forEach(() => points += 100);
  return points;
}

/**
 * Check all badge conditions against current user data and award any newly unlocked badges.
 */
function checkAndAwardBadges() {
  const data          = getUserData();
  const currentBadges = data.badges || [];
  const newBadges     = [];

  data.points = getTotalPoints(data);

  for (const badge of BADGES) {
    if (!currentBadges.includes(badge.id) && badge.check(data)) {
      currentBadges.push(badge.id);
      newBadges.push(badge);
    }
  }

  data.badges = currentBadges;
  saveUserData(null, data);

  newBadges.forEach((badge, i) => {
    setTimeout(() => showBadgeToast(badge), i * 1200);
  });

  renderBadges();
  renderLeaderboard();
}

/**
 * Show a badge-unlock toast notification using safe DOM methods.
 * @param {{ emoji: string, name: string, desc: string }} badge
 */
function showBadgeToast(badge) {
  const el = document.getElementById('toast');
  if (!el) return;

  // Build toast content safely — no innerHTML with user data
  el.textContent = '';
  const wrap   = document.createElement('div');
  wrap.style.cssText = 'display:flex;align-items:center;gap:0.6rem;';

  const ico    = document.createElement('span');
  ico.style.fontSize = '1.5rem';
  ico.textContent    = badge.emoji;
  ico.setAttribute('aria-hidden', 'true');

  const info   = document.createElement('div');
  const title  = document.createElement('div');
  title.style.cssText = 'font-weight:700;font-size:0.9rem;';
  title.textContent   = 'Badge Unlocked! ' + badge.name;
  const sub    = document.createElement('div');
  sub.style.cssText   = 'font-size:0.75rem;opacity:0.8;';
  sub.textContent     = badge.desc;

  info.appendChild(title);
  info.appendChild(sub);
  wrap.appendChild(ico);
  wrap.appendChild(info);
  el.appendChild(wrap);

  el.classList.add('show', 'toast--badge');
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    el.classList.remove('show', 'toast--badge');
  }, 4000);
}

/**
 * Render the badges grid (earned and locked) in the leaderboard tab.
 */
function renderBadges() {
  const container = document.getElementById('badgesGrid');
  if (!container) return;

  const data      = getUserData();
  const earnedIds = data.badges || [];
  const earned    = earnedIds.length;

  // Update badge count label
  const countEl = document.getElementById('badgeCountLabel');
  if (countEl) countEl.textContent = earned + ' earned';

  container.innerHTML = '';
  BADGES.forEach(badge => {
    const isEarned = earnedIds.includes(badge.id);

    const div       = document.createElement('div');
    div.className   = 'badge-card' + (isEarned ? ' badge-earned' : ' badge-locked');
    div.style.setProperty('--badge-color', badge.color);
    div.setAttribute('role', 'listitem');
    div.setAttribute('aria-label', badge.name + (isEarned ? ' — earned' : ' — locked'));

    const emoji    = document.createElement('div');
    emoji.className = 'badge-emoji';
    emoji.textContent = badge.emoji;
    emoji.setAttribute('aria-hidden', 'true');

    const name     = document.createElement('div');
    name.className = 'badge-name';
    name.textContent = badge.name;

    const desc     = document.createElement('div');
    desc.className = 'badge-desc';
    desc.textContent = badge.desc;

    const status   = document.createElement('div');
    status.className = 'badge-status';
    status.textContent = isEarned ? '✅ Earned' : '🔒 Locked';

    div.appendChild(emoji);
    div.appendChild(name);
    div.appendChild(desc);
    div.appendChild(status);
    container.appendChild(div);
  });
}

/**
 * Render the community leaderboard list, inserting the current user at the correct rank.
 */
function renderLeaderboard() {
  const container = document.getElementById('leaderboardList');
  if (!container) return;

  const user       = getCurrentUser();
  const data       = getUserData();
  const userPoints = getTotalPoints(data);
  const userBadges = (data.badges || []).length;
  const userActions = getTotalActions(data);

  const allUsers = [...SIMULATED_LEADERBOARD, {
    username:  user ? user.username : 'You',
    avatar:    user ? getAvatarInitials(user.username) : 'ME',
    color:     user ? getAvatarColor(user.username)    : '#22c55e',
    points:    userPoints,
    badges:    userBadges,
    actions:   userActions,
    reduction: data.footprint ? parseFloat(((data.footprint.total / 1000) * 0.2).toFixed(1)) : 0,
    isYou:     true
  }];

  allUsers.sort((a, b) => b.points - a.points);

  container.innerHTML = '';
  allUsers.slice(0, 12).forEach((entry, index) => {
    const rank       = index + 1;
    const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

    const row        = document.createElement('div');
    row.className    = 'lb-row' + (entry.isYou ? ' lb-row--you' : '');
    row.setAttribute('role', 'listitem');

    const rankEl     = document.createElement('div');
    rankEl.className = 'lb-rank';
    rankEl.textContent = medalEmoji;
    rankEl.setAttribute('aria-label', 'Rank ' + rank);

    const avatarEl   = document.createElement('div');
    avatarEl.className = 'lb-avatar';
    avatarEl.style.background = entry.color;
    avatarEl.textContent = entry.avatar;
    avatarEl.setAttribute('aria-hidden', 'true');

    const infoEl     = document.createElement('div');
    infoEl.className = 'lb-info';

    const nameEl     = document.createElement('div');
    nameEl.className = 'lb-name';
    nameEl.textContent = entry.username;

    if (entry.isYou) {
      const youTag    = document.createElement('span');
      youTag.className = 'you-tag';
      youTag.textContent = 'You';
      nameEl.appendChild(youTag);
    }

    const subEl      = document.createElement('div');
    subEl.className  = 'lb-sub';
    subEl.textContent = `${entry.actions} actions · ${entry.badges} badges`;

    infoEl.appendChild(nameEl);
    infoEl.appendChild(subEl);

    const ptsWrap    = document.createElement('div');
    ptsWrap.className = 'lb-points';

    const ptsNum     = document.createElement('span');
    ptsNum.className = 'lb-pts-num';
    ptsNum.textContent = entry.points.toLocaleString();

    const ptsLabel   = document.createElement('span');
    ptsLabel.className = 'lb-pts-label';
    ptsLabel.textContent = 'pts';

    ptsWrap.appendChild(ptsNum);
    ptsWrap.appendChild(ptsLabel);

    row.appendChild(rankEl);
    row.appendChild(avatarEl);
    row.appendChild(infoEl);
    row.appendChild(ptsWrap);
    container.appendChild(row);
  });

  const userRank = allUsers.findIndex(e => e.isYou) + 1;
  const rankEl   = document.getElementById('userRankDisplay');
  const ptsEl    = document.getElementById('userPointsDisplay');
  if (rankEl) rankEl.textContent = '#' + userRank + ' of ' + allUsers.length;
  if (ptsEl)  ptsEl.textContent  = userPoints.toLocaleString() + ' pts';
}
