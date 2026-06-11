/**
 * insights.js — Personalised insights engine
 *
 * Builds a set of insight cards tailored to the user's actual footprint data
 * and lifestyle selections captured during the calculator flow.
 */

/** Initialise the insights module (called on app startup). */
function initInsights() {
  renderInsights();
}

/**
 * Render all insight cards into the #insightsGrid container.
 */
function renderInsights() {
  const grid = document.getElementById('insightsGrid');
  if (!grid) return;

  const data     = getUserData();
  const fp       = data.footprint;
  const insights = buildInsights(fp);

  grid.innerHTML = '';
  insights.forEach(insight => grid.appendChild(createInsightCard(insight)));
}

/**
 * Create a single insight card DOM element from an insight data object.
 * Uses safe DOM construction (no innerHTML) to prevent XSS.
 * @param {{ level: string, levelLabel: string, title: string, text: string, metric?: { num: string, label: string } }} insight
 * @returns {HTMLElement}
 */
function createInsightCard(insight) {
  const card = document.createElement('div');
  card.className = 'insight-card';
  card.setAttribute('role', 'article');

  const badge       = document.createElement('div');
  badge.className   = `insight-badge badge-${insight.level}`;
  badge.textContent = insight.levelLabel;

  const title       = document.createElement('div');
  title.className   = 'insight-title';
  title.textContent = insight.title;

  const text        = document.createElement('div');
  text.className    = 'insight-text';
  text.textContent  = insight.text;

  card.appendChild(badge);
  card.appendChild(title);
  card.appendChild(text);

  if (insight.metric) {
    const metric  = document.createElement('div');
    metric.className = 'insight-metric';

    const num     = document.createElement('span');
    num.className = 'im-num';
    num.textContent = insight.metric.num;

    const lbl     = document.createElement('span');
    lbl.className = 'im-label';
    lbl.textContent = insight.metric.label;

    metric.appendChild(num);
    metric.appendChild(lbl);
    card.appendChild(metric);
  }

  if (insight.quickWin) {
    const qw       = document.createElement('div');
    qw.className   = 'insight-quick-win';
    qw.textContent = '⚡ Quick Win: ' + insight.quickWin;
    card.appendChild(qw);
  }

  return card;
}

/**
 * Build the full ordered list of insight objects from the user's footprint.
 *
 * Priority order:
 *   1. Positive reinforcement (if already doing well)
 *   2. High-priority personal insights (transport / food / energy / shopping)
 *   3. Specific behaviour insights (flights, diet, shopping)
 *   4. Quick Win recommendation
 *   5. General educational insights
 *
 * @param {Object|null} fp — footprint object from calculationResult, or null
 * @returns {Array<Object>}
 */
function buildInsights(fp) {
  const base = _buildBaseInsights();
  if (!fp) return base;

  const personal = [];

  // ── Positive reinforcement ──
  if (fp.tonnes <= 1.9) {
    personal.push({
      level: 'low',
      levelLabel: '🌟 Excellent Work',
      title: 'You\'re already below India\'s average!',
      text: `Your footprint of ${fp.tonnes}t CO₂/year is below India's national average of 1.9t. You're making a real difference. Focus on maintaining your habits and inspiring others.`,
      metric: { num: fp.tonnes + 't', label: 'your CO₂/year\nvs 1.9t India avg' }
    });
  }

  // ── High-impact category insights ──
  if (fp.transport > 2000) {
    personal.push({
      level: 'high',
      levelLabel: '🔴 Priority Area',
      title: 'Transport is your biggest footprint source',
      text: `Your transport emits ${(fp.transport/1000).toFixed(1)} tonnes of CO₂ per year. Even swapping 2 commuting days per week to public transport could save 300–600 kg/year.`,
      metric: { num: (fp.transport/1000).toFixed(1) + 't', label: 'CO₂/year from\nyour transport' },
      quickWin: 'Take public transport just twice this week.'
    });
  }

  if (fp.food > 2000) {
    // More specific diet insight
    const dietMsg = fp.selections?.dietType === 'omnivore' && fp.meatFreq > 7
      ? `You eat red meat ${fp.meatFreq}×/week — cutting to 3× could save ~400 kg CO₂/year alone.`
      : `Cutting red meat to once a week and buying seasonal could reduce this by 30–40%.`;
    personal.push({
      level: 'high',
      levelLabel: '🔴 Priority Area',
      title: 'Your food choices have a big impact',
      text: `You emit ${(fp.food/1000).toFixed(1)} tonnes from food annually. ${dietMsg}`,
      metric: { num: (fp.food/1000).toFixed(1) + 't', label: 'CO₂/year from\nyour diet' },
      quickWin: 'Skip meat at your next two meals.'
    });
  }

  if (fp.energy > 1500) {
    personal.push({
      level: 'med',
      levelLabel: '⚠️ Opportunity',
      title: 'Home energy is worth addressing',
      text: `Your home uses ${(fp.energy/1000).toFixed(1)} tonnes of CO₂ worth of energy. Rooftop solar in India can cut this by 80–95% — and often pays back in 5–7 years.`,
      metric: { num: '80-95%', label: 'energy reduction\nwith rooftop solar' },
      quickWin: 'Set your AC to 24°C today.'
    });
  }

  if (fp.shopping > 1000) {
    personal.push({
      level: 'med',
      levelLabel: '⚠️ Opportunity',
      title: 'Shopping & consumption has a hidden impact',
      text: `Your shopping contributes ${(fp.shopping/1000).toFixed(1)} tonnes CO₂/year. Fast fashion and new electronics are the largest drivers. Buying second-hand or delaying purchases has an outsized effect.`,
      metric: { num: (fp.shopping/1000).toFixed(1) + 't', label: 'CO₂/year from\nyour shopping' },
      quickWin: 'Next purchase — check a second-hand platform first.'
    });
  }

  // ── Flight-specific insight ──
  if (fp.flightLong > 2) {
    personal.push({
      level: 'med',
      levelLabel: '✈️ Flights',
      title: 'Long-haul flights dominate your travel footprint',
      text: `With ${fp.flightLong} long-haul flights per year, you're adding ~${(fp.flightLong * 1.6).toFixed(1)} tonnes CO₂ from air travel alone. Consider replacing one trip with a train journey or video conference.`,
      metric: { num: `~${(fp.flightLong * 1.6).toFixed(1)}t`, label: 'CO₂ from\nlong-haul flights' }
    });
  }

  // ── Quick Win card (highest-impact single action) ──
  const quickWinAction = _getBestQuickWin(fp);
  if (quickWinAction) {
    personal.push({
      level: 'tip',
      levelLabel: '⚡ Quickest Win',
      title: quickWinAction.title,
      text: quickWinAction.text,
      metric: quickWinAction.metric
    });
  }

  return [...personal, ...base].slice(0, 7);
}

/**
 * Return the single highest-impact quick-win recommendation based on the
 * user's footprint breakdown.
 * @param {Object} fp
 * @returns {Object|null}
 */
function _getBestQuickWin(fp) {
  const categories = [
    { key: 'transport', val: fp.transport },
    { key: 'food',      val: fp.food },
    { key: 'energy',    val: fp.energy },
    { key: 'shopping',  val: fp.shopping }
  ].sort((a, b) => b.val - a.val);

  const wins = {
    transport: {
      title: 'Try public transport for one week',
      text: 'Replacing your daily car commute with public transport for just one week demonstrates the impact — and can become a habit that saves 500+ kg CO₂/year.',
      metric: { num: '500+ kg', label: 'potential annual\nCO₂ saving' }
    },
    food: {
      title: 'Declare one meatless day per week',
      text: 'A single meat-free day each week can reduce your food emissions by 15–20%. Start with Monday — "Meatless Monday" is a proven habit-formation strategy.',
      metric: { num: '15–20%', label: 'less food\nemissions' }
    },
    energy: {
      title: 'Set AC 2°C higher than normal',
      text: 'Raising your AC thermostat from 22°C to 24°C reduces energy consumption by ~12%. That\'s ~100–200 kg CO₂/year with zero lifestyle sacrifice.',
      metric: { num: '12%', label: 'energy saving\nper 2°C rise' }
    },
    shopping: {
      title: 'Apply a 30-day rule on non-essential purchases',
      text: 'Before buying anything non-essential, wait 30 days. Research shows 60–80% of impulse purchases are never made after this cooling-off period — saving both money and emissions.',
      metric: { num: '60–80%', label: 'of impulse buys\ncancelled' }
    }
  };

  return wins[categories[0]?.key] || null;
}

/**
 * Build the static educational base insights shown to all users.
 * @returns {Array<Object>}
 */
function _buildBaseInsights() {
  return [
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
}
