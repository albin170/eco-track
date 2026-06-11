'use strict';
/**
 * challenges.js — Weekly Eco Challenges
 *
 * Renders challenge cards and handles progress logging.
 * All DOM construction uses safe element creation — no innerHTML with user data.
 */

/** @type {Array<Object>} */
const WEEKLY_CHALLENGES = [
  {
    id: 'reusable-bottle', category: 'easy', emoji: '🧴',
    name: 'Carry a Reusable Bottle',
    desc: 'Use a reusable water bottle instead of buying single-use plastic bottles every day this week.',
    target: 7, unit: 'days', points: 150, impactKg: 2.5, badge: null
  },
  {
    id: 'meatless-monday', category: 'easy', emoji: '🥗',
    name: 'Meatless Monday',
    desc: 'Go completely plant-based every Monday for this month. Discover delicious vegetarian recipes!',
    target: 4, unit: 'Mondays', points: 200, impactKg: 5.0, badge: null
  },
  {
    id: 'public-transport-week', category: 'medium', emoji: '🚌',
    name: 'Public Transport 3 Days',
    desc: 'Leave your car at home and use buses, metro, or trains for at least 3 days this week.',
    target: 3, unit: 'days', points: 300, impactKg: 8.4, badge: null
  },
  {
    id: 'car-free-fridays', category: 'medium', emoji: '🚗',
    name: 'Car-Free Fridays',
    desc: 'Every Friday this month, go car-free. Walk, cycle, or take public transit for all your trips.',
    target: 4, unit: 'Fridays', points: 350, impactKg: 12.0, badge: null
  },
  {
    id: 'zero-plastic-week', category: 'hard', emoji: '♻️',
    name: 'Zero-Plastic Week',
    desc: 'Avoid all single-use plastics for an entire week. Bring your own bags, containers and bottles.',
    target: 7, unit: 'days', points: 500, impactKg: 4.0, badge: 'challenge-1'
  },
  {
    id: 'electricity-saver', category: 'hard', emoji: '⚡',
    name: 'Cut Electricity 20%',
    desc: 'Reduce your electricity usage by 20% this month by unplugging standby devices and using natural light.',
    target: 30, unit: 'days', points: 600, impactKg: 18.0, badge: 'challenge-1'
  }
];

/** Initialise challenges module. */
function initChallenges() {
  renderChallenges();
}

/**
 * Render all challenge cards in the #challengesGrid container.
 */
function renderChallenges() {
  const container = document.getElementById('challengesGrid');
  if (!container) return;

  const data      = getUserData();
  const progress  = data.challengeProgress  || {};
  const completed = data.completedChallenges || [];

  container.innerHTML = '';

  WEEKLY_CHALLENGES.forEach(challenge => {
    const isCompleted     = completed.includes(challenge.id);
    const currentProgress = progress[challenge.id] || 0;
    const pct             = Math.min((currentProgress / challenge.target) * 100, 100);

    const categoryLabel   = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' }[challenge.category];

    // ── Card root ──
    const card       = document.createElement('div');
    card.className   = `challenge-card challenge-${challenge.category}${isCompleted ? ' challenge-done' : ''}`;
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', challenge.name + (isCompleted ? ' — completed' : ''));

    // Header
    const hdr        = document.createElement('div');
    hdr.className    = 'challenge-card-header';

    const emojiEl    = document.createElement('span');
    emojiEl.className = 'challenge-emoji';
    emojiEl.textContent = challenge.emoji;
    emojiEl.setAttribute('aria-hidden', 'true');

    const diffEl     = document.createElement('span');
    diffEl.className = 'challenge-difficulty';
    diffEl.textContent = categoryLabel;

    hdr.appendChild(emojiEl);
    hdr.appendChild(diffEl);

    // Name & description
    const nameEl     = document.createElement('div');
    nameEl.className = 'challenge-name';
    nameEl.textContent = challenge.name;

    const descEl     = document.createElement('div');
    descEl.className = 'challenge-desc';
    descEl.textContent = challenge.desc;

    // Progress bar
    const progWrap   = document.createElement('div');
    progWrap.className = 'challenge-progress-wrap';

    const barTrack   = document.createElement('div');
    barTrack.className = 'challenge-progress-bar';
    barTrack.setAttribute('role', 'progressbar');
    barTrack.setAttribute('aria-valuenow', String(Math.round(pct)));
    barTrack.setAttribute('aria-valuemin', '0');
    barTrack.setAttribute('aria-valuemax', '100');
    barTrack.setAttribute('aria-label', challenge.name + ' progress');

    const barFill    = document.createElement('div');
    barFill.className = 'challenge-progress-fill';
    barFill.style.width = pct + '%';
    barTrack.appendChild(barFill);

    const progText   = document.createElement('div');
    progText.className = 'challenge-progress-text';
    progText.textContent = `${currentProgress} / ${challenge.target} ${challenge.unit}`;

    progWrap.appendChild(barTrack);
    progWrap.appendChild(progText);

    // Footer
    const footer     = document.createElement('div');
    footer.className = 'challenge-footer';

    const rewards    = document.createElement('div');
    rewards.className = 'challenge-rewards';

    const ptsPill    = document.createElement('span');
    ptsPill.className = 'reward-pill';
    ptsPill.textContent = `⭐ ${challenge.points} pts`;

    const co2Pill    = document.createElement('span');
    co2Pill.className = 'reward-pill';
    co2Pill.textContent = `🌱 -${challenge.impactKg} kg CO₂`;

    rewards.appendChild(ptsPill);
    rewards.appendChild(co2Pill);
    footer.appendChild(rewards);

    if (isCompleted) {
      const doneBadge    = document.createElement('div');
      doneBadge.className = 'challenge-done-badge';
      doneBadge.textContent = '✅ Completed!';
      footer.appendChild(doneBadge);
    } else {
      const logBtn     = document.createElement('button');
      logBtn.className = 'btn-challenge-log';
      logBtn.textContent = 'Log Progress +1';
      logBtn.setAttribute('aria-label', `Log progress for ${challenge.name}`);
      logBtn.addEventListener('click', () => logChallengeProgress(challenge.id));
      footer.appendChild(logBtn);
    }

    card.appendChild(hdr);
    card.appendChild(nameEl);
    card.appendChild(descEl);
    card.appendChild(progWrap);
    card.appendChild(footer);
    container.appendChild(card);
  });
}

/**
 * Log +1 unit of progress toward a challenge. Completes the challenge when target is reached.
 * @param {string} challengeId
 */
function logChallengeProgress(challengeId) {
  const data = getUserData();
  if (!data.challengeProgress)   data.challengeProgress   = {};
  if (!data.completedChallenges) data.completedChallenges = [];

  const challenge = WEEKLY_CHALLENGES.find(c => c.id === challengeId);
  if (!challenge) return;

  if (data.completedChallenges.includes(challengeId)) {
    showToast('✅ Challenge already completed!');
    return;
  }

  const current = (data.challengeProgress[challengeId] || 0) + 1;
  data.challengeProgress[challengeId] = current;

  if (current >= challenge.target) {
    data.completedChallenges.push(challengeId);
    data.points = (data.points || 0) + challenge.points;
    saveUserData(null, data);
    showToast(`🏆 Challenge Complete! +${challenge.points} Green Points!`);
    checkAndAwardBadges();
  } else {
    saveUserData(null, data);
    const remaining = challenge.target - current;
    showToast(`📈 Progress logged! ${remaining} more ${challenge.unit} to go.`);
  }

  renderChallenges();
  renderLeaderboard();
}
