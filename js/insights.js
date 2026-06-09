// insights.js — Personalized insights (updated to use per-user storage)

function initInsights() {
  renderInsights();
}

function renderInsights() {
  const grid = document.getElementById('insightsGrid');
  if (!grid) return;
  const data = getUserData();
  const fp   = data.footprint;

  const insights = buildInsights(fp);
  grid.innerHTML = '';

  insights.forEach(insight => {
    const card = document.createElement('div');
    card.className = 'insight-card';
    card.innerHTML = `
      <div class="insight-badge badge-${insight.level}">${insight.levelLabel}</div>
      <div class="insight-title">${insight.title}</div>
      <div class="insight-text">${insight.text}</div>
      ${insight.metric ? `
        <div class="insight-metric">
          <span class="im-num">${insight.metric.num}</span>
          <span class="im-label">${insight.metric.label}</span>
        </div>
      ` : ''}
    `;
    grid.appendChild(card);
  });
}

function buildInsights(fp) {
  const base = [
    {
      level: 'tip',
      levelLabel: '💡 Did You Know?',
      title: 'Your diet matters more than your car',
      text: 'A plant-based diet can reduce food-related emissions by up to 73%. Switching from a meat-heavy diet to vegetarian saves more CO₂ than going car-free for a year in many cases.',
      metric: { num: '73%', label: 'potential reduction\nfrom going plant-based' }
    },
    {
      level: 'tip',
      levelLabel: '🌍 Global Context',
      title: 'The Paris Agreement target for you',
      text: 'The 2015 Paris Agreement means every person on Earth needs to emit under 1 tonne of CO₂ per year by 2050. The global average today is 4 tonnes. Small consistent actions build toward this.',
      metric: { num: '1.0t', label: 'CO₂ per person\nis the 2050 target' }
    },
    {
      level: 'low',
      levelLabel: '✅ Win',
      title: 'Local food reduces transport emissions',
      text: 'Food transported long distances by air can have 50× the emissions of locally grown food. Buying from your local market or growing your own vegetables makes a real dent.',
      metric: { num: '50×', label: 'higher emissions\nfor air-freighted produce' }
    },
    {
      level: 'med',
      levelLabel: '⚠️ Worth Knowing',
      title: 'One flight undoes months of effort',
      text: 'A single long-haul return flight can produce 1.6 tonnes of CO₂ — equal to months of daily eco-actions. Consider video calls, trains, or fewer but longer trips.',
      metric: { num: '1.6t', label: 'CO₂ per long-haul\nreturn flight' }
    }
  ];

  if (!fp) return base;

  const personal = [];

  if (fp.transport > 2000) {
    personal.unshift({
      level: 'high',
      levelLabel: '🔴 Priority Area',
      title: 'Transport is your biggest footprint source',
      text: `Your transport emits ${(fp.transport/1000).toFixed(1)} tonnes of CO₂ per year. Even swapping 2 commuting days per week to public transport could save 300–600 kg/year.`,
      metric: { num: (fp.transport/1000).toFixed(1) + 't', label: 'CO₂/year from\nyour transport' }
    });
  }

  if (fp.food > 2000) {
    personal.unshift({
      level: 'high',
      levelLabel: '🔴 Priority Area',
      title: 'Your food choices have a big impact',
      text: `You emit ${(fp.food/1000).toFixed(1)} tonnes from food annually. Cutting red meat to once a week and buying seasonal could reduce this by 30–40%.`,
      metric: { num: (fp.food/1000).toFixed(1) + 't', label: 'CO₂/year from\nyour diet' }
    });
  }

  if (fp.energy > 1500) {
    personal.push({
      level: 'med',
      levelLabel: '⚠️ Opportunity',
      title: 'Home energy is worth addressing',
      text: `Your home uses ${(fp.energy/1000).toFixed(1)} tonnes of CO₂ worth of energy. Rooftop solar in India can cut this by 80–95% — and often pays back in 5–7 years.`,
      metric: { num: '80-95%', label: 'energy reduction\nwith rooftop solar' }
    });
  }

  return [...personal, ...base].slice(0, 6);
}
