// calculator.js — Footprint calculation logic

// ─── Named constants ───
/** SVG arc circumference for the results ring (2π × r85). */
const RESULTS_RING_CIRCUMFERENCE = 534;
/** Maximum tonnes used to normalise the results ring fill. */
const MAX_TONNES_DISPLAY = 20;

let currentPanel       = 0;
let calculationResult  = null;

// ─── Cached element references (populated in initCalculator) ───
const _sliderCache = {};

// ─── Selection states for pill groups ───
const pillSelections = {
  carType:          'petrol',
  publicTransport:  'rarely',
  dietType:         'omnivore',
  localFood:        'rarely',
  foodWaste:        'lots',
  homeType:         'apartment',
  energySource:     'grid',
  acUse:            'heavy',
  ledLights:        'none',
  clothingBuy:      'minimal',
  electronicsBuy:   'none',
  secondHand:       'never',
  onlineShopping:   'mostly-online'
};

/**
 * Initialise the carbon footprint calculator: wire sliders and pill groups.
 */
function initCalculator() {
  const sliderDefs = [
    { id: 'carKm',        displayId: 'carKmVal',        label: 'km driven per week' },
    { id: 'flightShort',  displayId: 'flightShortVal',  label: 'short-haul flights per year' },
    { id: 'flightLong',   displayId: 'flightLongVal',   label: 'long-haul flights per year' },
    { id: 'meatFreq',     displayId: 'meatFreqVal',     label: 'red meat meals per week' },
    { id: 'electricBill', displayId: 'electricBillVal', label: 'monthly electricity bill in rupees' }
  ];

  sliderDefs.forEach(def => wireSlider(def));

  // Wire pill groups
  document.querySelectorAll('.option-pills').forEach(group => {
    group.setAttribute('role', 'radiogroup');
    group.querySelectorAll('.pill').forEach(pill => {
      pill.setAttribute('role', 'radio');
      pill.setAttribute('aria-checked', pill.classList.contains('active') ? 'true' : 'false');
      pill.addEventListener('click', function () {
        group.querySelectorAll('.pill').forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-checked', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-checked', 'true');
        pillSelections[group.id] = this.dataset.val;
      });
    });
  });
}

/**
 * Wire a single slider element: cache references, bind input event, set ARIA.
 * @param {{ id: string, displayId: string, label: string }} def
 */
function wireSlider({ id, displayId, label }) {
  const slider  = document.getElementById(id);
  const display = document.getElementById(displayId);
  if (!slider || !display) return;

  // Cache for fast access
  _sliderCache[id] = { slider, display };

  // ARIA
  slider.setAttribute('aria-label', label);
  slider.setAttribute('aria-valuenow',  slider.value);
  slider.setAttribute('aria-valuemin',  slider.min);
  slider.setAttribute('aria-valuemax',  slider.max);

  slider.addEventListener('input', function () {
    display.textContent = this.value;
    this.setAttribute('aria-valuenow', this.value);
    updateSliderFill(this);
  });

  updateSliderFill(slider);
}

/**
 * Update the CSS custom property that drives the slider's fill gradient.
 * @param {HTMLInputElement} slider
 */
function updateSliderFill(slider) {
  const min = parseFloat(slider.min) || 0;
  const max = parseFloat(slider.max) || 100;
  const val = parseFloat(slider.value) || 0;
  const pct = ((val - min) / (max - min)) * 100;
  slider.style.setProperty('--slider-pct', pct + '%');
}

/**
 * Navigate to a calculator step panel, updating step indicators.
 * @param {number} index — zero-based step index
 */
function nextPanel(index) {
  const panels = document.querySelectorAll('.calc-panel');
  const steps  = document.querySelectorAll('.calc-step');

  panels.forEach(p => p.classList.remove('active'));
  steps.forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i < index) s.classList.add('done');
    if (i === index) s.classList.add('active');
  });

  if (panels[index]) panels[index].classList.add('active');
  currentPanel = index;

  document.getElementById('section-calculator')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Read the current numeric value of a slider by element ID.
 * @param {string} id
 * @returns {number}
 */
function getSliderVal(id) {
  const cached = _sliderCache[id];
  if (cached) return parseFloat(cached.slider.value) || 0;
  return parseFloat(document.getElementById(id)?.value) || 0;
}

/**
 * Calculate the user's carbon footprint from slider and pill values.
 * Stores the result in `calculationResult` and renders the results panel.
 */
function calculateFootprint() {
  const ef = EMISSION_FACTORS;

  // --- Transport ---
  const weeklyKm        = getSliderVal('carKm');
  const annualCarKm     = weeklyKm * 52;
  const carEmissions    = annualCarKm * (ef.transport.car[pillSelections.carType] || 0);
  const shortFlightEm   = getSliderVal('flightShort') * ef.transport.flightShort;
  const longFlightEm    = getSliderVal('flightLong')  * ef.transport.flightLong;
  const ptMultiplier    = ef.transport.publicTransport[pillSelections.publicTransport] || 1;
  const transportTotal  = (carEmissions + shortFlightEm + longFlightEm) * ptMultiplier;

  // --- Food ---
  const dietBase   = ef.food.diet[pillSelections.dietType] || 2500;
  const extraMeat  = getSliderVal('meatFreq') * 52 * ef.food.meatServingKg;
  const localMulti = ef.food.localFood[pillSelections.localFood]  || 1;
  const wasteMulti = ef.food.foodWaste[pillSelections.foodWaste]  || 1;
  const foodTotal  = (dietBase + extraMeat) * localMulti * wasteMulti;

  // --- Energy ---
  const monthlyBill  = getSliderVal('electricBill');
  const annualKwh    = monthlyBill * 12 * ef.energy.billToKwh;
  const solarMulti   = ef.energy.energySource[pillSelections.energySource] || 1;
  const acAddition   = ef.energy.acUse[pillSelections.acUse]               || 0;
  const ledSaving    = ef.energy.led[pillSelections.ledLights]              || 0;
  const totalKwh     = annualKwh + acAddition + ledSaving;
  const energyTotal  = Math.max(0, totalKwh * ef.energy.gridFactor * solarMulti);

  // --- Shopping ---
  const clothingTotal    = ef.shopping.clothing[pillSelections.clothingBuy]         || 0;
  const electronicsTotal = ef.shopping.electronics[pillSelections.electronicsBuy]   || 0;
  const shHandSaving     = ef.shopping.secondHand[pillSelections.secondHand]        || 0;
  const onlineAddition   = ef.shopping.onlineShopping[pillSelections.onlineShopping]|| 0;
  const shoppingTotal    = Math.max(0, clothingTotal + electronicsTotal + shHandSaving + onlineAddition);

  const grandTotal  = transportTotal + foodTotal + energyTotal + shoppingTotal;
  const totalTonnes = grandTotal / 1000;

  calculationResult = {
    transport: Math.round(transportTotal),
    food:      Math.round(foodTotal),
    energy:    Math.round(energyTotal),
    shopping:  Math.round(shoppingTotal),
    total:     Math.round(grandTotal),
    tonnes:    parseFloat(totalTonnes.toFixed(2)),
    // Store pill selections for personalised insights
    selections: { ...pillSelections },
    flightLong: getSliderVal('flightLong'),
    meatFreq:   getSliderVal('meatFreq')
  };

  showResults(calculationResult);
  nextPanel(4);
}

/**
 * Render the results panel with animated ring, grade, breakdown, and tips.
 * @param {Object} result — output from calculateFootprint()
 */
function showResults(result) {
  // Animate ring
  const arc      = document.getElementById('resultsArc');
  const fraction = Math.min(result.tonnes / MAX_TONNES_DISPLAY, 1);
  const offset   = RESULTS_RING_CIRCUMFERENCE * (1 - fraction);

  setTimeout(() => {
    arc.style.transition     = 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)';
    arc.style.strokeDashoffset = offset;
  }, 100);

  // Ring colour by grade
  const grade       = getGrade(result.tonnes);
  const gradeColors = { A: '#4ade80', B: '#22d3ee', C: '#fbbf24', D: '#f87171' };
  arc.style.stroke  = gradeColors[grade] || '#4ade80';

  document.getElementById('resultsTonnes').textContent = result.tonnes;
  document.getElementById('globeScore').textContent    = grade;

  const gradeEl  = document.getElementById('resultsGrade');
  const gradeMsg = document.getElementById('resultsGradeLabel');
  gradeEl.textContent = grade;
  gradeEl.className   = 'results-grade grade-' + grade;

  const messages = {
    A: 'Excellent! You\'re well below the global average.',
    B: 'Good. You\'re doing better than most. Keep going!',
    C: 'Average. There\'s good room to reduce further.',
    D: 'High impact. Focus on the biggest categories first.'
  };
  gradeMsg.textContent = messages[grade];

  // Breakdown cards
  const breakdown = document.getElementById('resultsBreakdown');
  breakdown.innerHTML = '';
  const sections = [
    { icon: '🚗', label: 'Transport',    val: result.transport },
    { icon: '🍽️', label: 'Food',         val: result.food },
    { icon: '🏠', label: 'Home Energy',  val: result.energy },
    { icon: '🛍️', label: 'Shopping',     val: result.shopping }
  ];
  sections.forEach(s => {
    const div       = document.createElement('div');
    div.className   = 'rb-card';
    const icon      = document.createElement('span');
    icon.className  = 'rb-icon';
    icon.textContent = s.icon;
    const info      = document.createElement('div');
    info.className  = 'rb-info';
    const lbl       = document.createElement('div');
    lbl.className   = 'rb-label';
    lbl.textContent = s.label;
    const val       = document.createElement('div');
    val.className   = 'rb-val';
    val.textContent = (s.val / 1000).toFixed(2) + ' t CO₂';
    info.appendChild(lbl);
    info.appendChild(val);
    div.appendChild(icon);
    div.appendChild(info);
    breakdown.appendChild(div);
  });

  // Tips section (safe DOM construction — no innerHTML)
  const tips   = generateTips(result);
  const tipsEl = document.getElementById('resultsTips');
  tipsEl.innerHTML = '';
  const heading = document.createElement('h4');
  heading.textContent = '💡 Top things you can do';
  tipsEl.appendChild(heading);

  tips.forEach(t => {
    const item    = document.createElement('div');
    item.className = 'tip-item';
    const ic      = document.createElement('span');
    ic.className  = 'tip-icon';
    ic.textContent = t.icon;
    const body    = document.createElement('div');
    const txt     = document.createElement('div');
    txt.className = 'tip-text';
    txt.textContent = t.text;
    const sav     = document.createElement('div');
    sav.className = 'tip-saving';
    sav.textContent = 'Potential saving: ' + t.saving;
    body.appendChild(txt);
    body.appendChild(sav);
    item.appendChild(ic);
    item.appendChild(body);
    tipsEl.appendChild(item);
  });
}

/**
 * Generate personalised tip items sorted by highest-emission category.
 * @param {Object} result
 * @returns {Array<{ icon: string, text: string, saving: string }>}
 */
function generateTips(result) {
  const tips   = [];
  const sorted = [
    { key: 'transport', val: result.transport },
    { key: 'food',      val: result.food },
    { key: 'energy',    val: result.energy },
    { key: 'shopping',  val: result.shopping }
  ].sort((a, b) => b.val - a.val);

  const tipBank = {
    transport: [
      { icon: '🚌', text: 'Switch to public transport or carpooling for your daily commute.', saving: '0.5–2 tonnes/year' },
      { icon: '✈️', text: 'Consider cutting one long-haul flight per year.', saving: '1.6 tonnes/flight' },
      { icon: '⚡', text: 'If replacing your car, consider an electric vehicle.', saving: 'Up to 1.5 tonnes/year' }
    ],
    food: [
      { icon: '🥗', text: 'Reduce red meat to 1–2 times per week. Try legumes and tofu as protein.', saving: '0.5–1 tonne/year' },
      { icon: '🌽', text: 'Buy from local farmers markets. Less transport = less CO₂.', saving: '100–300 kg/year' },
      { icon: '🍱', text: 'Plan your meals to cut food waste by half.', saving: '150–400 kg/year' }
    ],
    energy: [
      { icon: '☀️', text: 'Install rooftop solar panels. India has one of the best solar irradiances globally.', saving: 'Up to 1.5 tonnes/year' },
      { icon: '❄️', text: 'Set your AC to 24°C and use ceiling fans to circulate air.', saving: '200–500 kg/year' },
      { icon: '💡', text: 'Replace all remaining bulbs with LED lights immediately.', saving: '100–300 kg/year' }
    ],
    shopping: [
      { icon: '🔄', text: 'Buy second-hand clothes instead of fast fashion. India has great thrift options.', saving: '200–500 kg/year' },
      { icon: '🔧', text: 'Repair electronics and appliances rather than replacing them.', saving: '300–700 kg/item' },
      { icon: '📦', text: 'Batch your online orders to reduce last-mile delivery emissions.', saving: '50–150 kg/year' }
    ]
  };

  // Pick top 2 from highest-emission category, 1 from second
  if (sorted[0]) tips.push(...(tipBank[sorted[0].key] || []).slice(0, 2));
  if (sorted[1]) tips.push((tipBank[sorted[1].key] || [])[0]);
  return tips.filter(Boolean).slice(0, 4);
}

/**
 * Grade a total tonnes CO₂ value: A (≤2t), B (≤4t), C (≤8t), D (>8t).
 * @param {number} tonnes
 * @returns {'A'|'B'|'C'|'D'}
 */
function getGrade(tonnes) {
  if (tonnes <= 2) return 'A';
  if (tonnes <= 4) return 'B';
  if (tonnes <= 8) return 'C';
  return 'D';
}

/**
 * Save the latest calculation result to the user's data store,
 * then navigate to the dashboard.
 */
function saveAndGoToDashboard() {
  if (!calculationResult) return;

  const data   = getUserData();
  data.footprint = calculationResult;
  data.calcDate  = new Date().toISOString();
  data.ecoScore  = getGrade(calculationResult.tonnes);
  saveUserData(null, data);

  checkAndAwardBadges();
  updateDashboard();
  switchTab('dashboard');
  showToast('✅ Footprint saved! Dashboard updated.');
}
