// challenges.js — Weekly Eco Challenges

const WEEKLY_CHALLENGES = [
  {
    id: 'reusable-bottle',
    category: 'easy',
    emoji: '🧴',
    name: 'Carry a Reusable Bottle',
    desc: 'Use a reusable water bottle instead of buying single-use plastic bottles every day this week.',
    target: 7,
    unit: 'days',
    points: 150,
    impactKg: 2.5,
    badge: null
  },
  {
    id: 'meatless-monday',
    category: 'easy',
    emoji: '🥗',
    name: 'Meatless Monday',
    desc: 'Go completely plant-based every Monday for this month. Discover delicious vegetarian recipes!',
    target: 4,
    unit: 'Mondays',
    points: 200,
    impactKg: 5.0,
    badge: null
  },
  {
    id: 'public-transport-week',
    category: 'medium',
    emoji: '🚌',
    name: 'Public Transport 3 Days',
    desc: 'Leave your car at home and use buses, metro, or trains for at least 3 days this week.',
    target: 3,
    unit: 'days',
    points: 300,
    impactKg: 8.4,
    badge: null
  },
  {
    id: 'car-free-fridays',
    category: 'medium',
    emoji: '🚗',
    name: 'Car-Free Fridays',
    desc: 'Every Friday this month, go car-free. Walk, cycle, or take public transit for all your trips.',
    target: 4,
    unit: 'Fridays',
    points: 350,
    impactKg: 12.0,
    badge: null
  },
  {
    id: 'zero-plastic-week',
    category: 'hard',
    emoji: '♻️',
    name: 'Zero-Plastic Week',
    desc: 'Avoid all single-use plastics for an entire week. Bring your own bags, containers and bottles.',
    target: 7,
    unit: 'days',
    points: 500,
    impactKg: 4.0,
    badge: 'challenge-1'
  },
  {
    id: 'electricity-saver',
    category: 'hard',
    emoji: '⚡',
    name: 'Cut Electricity 20%',
    desc: 'Reduce your electricity usage by 20% this month by unplugging standby devices and using natural light.',
    target: 30,
    unit: 'days',
    points: 600,
    impactKg: 18.0,
    badge: 'challenge-1'
  }
];

function initChallenges() {
  renderChallenges();
}

function renderChallenges() {
  const container = document.getElementById('challengesGrid');
  if (!container) return;

  const data = getUserData();
  const progress = data.challengeProgress || {};
  const completed = data.completedChallenges || [];

  container.innerHTML = '';

  WEEKLY_CHALLENGES.forEach(challenge => {
    const isCompleted = completed.includes(challenge.id);
    const currentProgress = progress[challenge.id] || 0;
    const pct = Math.min((currentProgress / challenge.target) * 100, 100);

    const card = document.createElement('div');
    card.className = `challenge-card challenge-${challenge.category}${isCompleted ? ' challenge-done' : ''}`;

    const categoryLabel = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' }[challenge.category];

    card.innerHTML = `
      <div class="challenge-card-header">
        <span class="challenge-emoji">${challenge.emoji}</span>
        <span class="challenge-difficulty">${categoryLabel}</span>
      </div>
      <div class="challenge-name">${challenge.name}</div>
      <div class="challenge-desc">${challenge.desc}</div>
      <div class="challenge-progress-wrap">
        <div class="challenge-progress-bar">
          <div class="challenge-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="challenge-progress-text">${currentProgress} / ${challenge.target} ${challenge.unit}</div>
      </div>
      <div class="challenge-footer">
        <div class="challenge-rewards">
          <span class="reward-pill">⭐ ${challenge.points} pts</span>
          <span class="reward-pill">🌱 -${challenge.impactKg} kg CO₂</span>
        </div>
        ${isCompleted
          ? '<div class="challenge-done-badge">✅ Completed!</div>'
          : `<button class="btn-challenge-log" onclick="logChallengeProgress('${challenge.id}')">Log Progress +1</button>`
        }
      </div>
    `;
    container.appendChild(card);
  });
}

function logChallengeProgress(challengeId) {
  const data = getUserData();
  if (!data.challengeProgress) data.challengeProgress = {};
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
