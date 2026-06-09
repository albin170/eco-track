// calculator.js — Footprint calculation logic

let currentPanel = 0;
let calculationResult = null;

// Selection states for pill groups
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

function initCalculator() {
  // Wire up sliders
  const sliders = [
    { id: 'carKm', displayId: 'carKmVal' },
    { id: 'flightShort', displayId: 'flightShortVal' },
    { id: 'flightLong', displayId: 'flightLongVal' },
    { id: 'meatFreq', displayId: 'meatFreqVal' },
    { id: 'electricBill', displayId: 'electricBillVal' }
  ];

  sliders.forEach(({ id, displayId }) => {
    const slider = document.getElementById(id);
    const display = document.getElementById(displayId);
    if (!slider || !display) return;
    slider.addEventListener('input', function() {
      display.textContent = this.value;
      updateSliderFill(this);
    });
    updateSliderFill(slider);
  });

  // Wire up pill groups
  document.querySelectorAll('.option-pills').forEach(group => {
    group.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', function() {
        group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        pillSelections[group.id] = this.dataset.val;
      });
    });
  });
}

function updateSliderFill(slider) {
  const min = parseFloat(slider.min) || 0;
  const max = parseFloat(slider.max) || 100;
  const val = parseFloat(slider.value) || 0;
  const pct = ((val - min) / (max - min)) * 100;
  slider.style.setProperty('--slider-pct', pct + '%');
}

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

  // Scroll calculator into view
  document.getElementById('section-calculator')
          .scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getSliderVal(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function calculateFootprint() {
  const ef = EMISSION_FACTORS;

  // --- Transport ---
  const weeklyKm    = getSliderVal('carKm');
  const annualCarKm = weeklyKm * 52;
  const carEmissions = annualCarKm * (ef.transport.car[pillSelections.carType] || 0);

  const flightShortEmissions = getSliderVal('flightShort') * ef.transport.flightShort;
  const flightLongEmissions  = getSliderVal('flightLong')  * ef.transport.flightLong;

  const ptMultiplier = ef.transport.publicTransport[pillSelections.publicTransport] || 1;
  const transportTotal = (carEmissions + flightShortEmissions + flightLongEmissions) * ptMultiplier;

  // --- Food ---
  const dietBase = ef.food.diet[pillSelections.dietType] || 2500;
  // additional meat
  const extraMeat = getSliderVal('meatFreq') * 52 * ef.food.meatServingKg;
  const localMulti = ef.food.localFood[pillSelections.localFood] || 1;
  const wasteMulti = ef.food.foodWaste[pillSelections.foodWaste] || 1;
  const foodTotal = (dietBase + extraMeat) * localMulti * wasteMulti;

  // --- Energy ---
  const monthlyBill   = getSliderVal('electricBill');
  const annualKwh     = monthlyBill * 12 * ef.energy.billToKwh;
  const solarMulti    = ef.energy.energySource[pillSelections.energySource] || 1;
  const acAddition    = ef.energy.acUse[pillSelections.acUse] || 0;
  const ledSaving     = ef.energy.led[pillSelections.ledLights] || 0;
  const totalKwh      = annualKwh + acAddition + ledSaving;
  const energyTotal   = Math.max(0, totalKwh * ef.energy.gridFactor * solarMulti);

  // --- Shopping ---
  const clothingTotal   = ef.shopping.clothing[pillSelections.clothingBuy]   || 0;
  const electronicsTotal = ef.shopping.electronics[pillSelections.electronicsBuy] || 0;
  const shHandSaving    = ef.shopping.secondHand[pillSelections.secondHand]   || 0;
  const onlineAddition  = ef.shopping.onlineShopping[pillSelections.onlineShopping] || 0;
  const shoppingTotal   = Math.max(0, clothingTotal + electronicsTotal + shHandSaving + onlineAddition);

  const grandTotal = transportTotal + foodTotal + energyTotal + shoppingTotal;
  const totalTonnes = grandTotal / 1000;

  calculationResult = {
    transport: Math.round(transportTotal),
    food:      Math.round(foodTotal),
    energy:    Math.round(energyTotal),
    shopping:  Math.round(shoppingTotal),
    total:     Math.round(grandTotal),
    tonnes:    parseFloat(totalTonnes.toFixed(2))
  };

  showResults(calculationResult);
  nextPanel(4);
}

function showResults(result) {
  // Animate ring
  const arc = document.getElementById('resultsArc');
  const maxTonnes = 20;
  const fraction  = Math.min(result.tonnes / maxTonnes, 1);
  const circumference = 534;
  const offset = circumference * (1 - fraction);

  setTimeout(() => {
    arc.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)';
    arc.style.strokeDashoffset = offset;
  }, 100);

  // Change ring color by grade
  const grade = getGrade(result.tonnes);
  const gradeColors = { A: '#4ade80', B: '#22d3ee', C: '#fbbf24', D: '#f87171' };
  arc.style.stroke = gradeColors[grade] || '#4ade80';

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
    { icon: '🚗', label: 'Transport', val: result.transport },
    { icon: '🍽️', label: 'Food', val: result.food },
    { icon: '🏠', label: 'Home Energy', val: result.energy },
    { icon: '🛍️', label: 'Shopping', val: result.shopping }
  ];
  sections.forEach(s => {
    const div = document.createElement('div');
    div.className = 'rb-card';
    div.innerHTML = `
      <span class="rb-icon">${s.icon}</span>
      <div class="rb-info">
        <div class="rb-label">${s.label}</div>
        <div class="rb-val">${(s.val/1000).toFixed(2)} t CO₂</div>
      </div>
    `;
    breakdown.appendChild(div);
  });

  // Tips section
  const tips = generateTips(result);
  const tipsEl = document.getElementById('resultsTips');
  tipsEl.innerHTML = '<h4>💡 Top things you can do</h4>' + tips.map(t => `
    <div class="tip-item">
      <span class="tip-icon">${t.icon}</span>
      <div>
        <div class="tip-text">${t.text}</div>
        <div class="tip-saving">Potential saving: ${t.saving}</div>
      </div>
    </div>
  `).join('');
}

function generateTips(result) {
  const tips = [];
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
      { icon: '⚡', text: 'If you\'re replacing your car, consider an electric vehicle.', saving: 'Up to 1.5 tonnes/year' }
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

  // Pick top 2 tips from the highest-emission category, 1 from second
  if (sorted[0]) tips.push(...(tipBank[sorted[0].key] || []).slice(0, 2));
  if (sorted[1]) tips.push((tipBank[sorted[1].key] || [])[0]);
  return tips.filter(Boolean).slice(0, 4);
}

function getGrade(tonnes) {
  if (tonnes <= 2)  return 'A';
  if (tonnes <= 4)  return 'B';
  if (tonnes <= 8)  return 'C';
  return 'D';
}

function saveAndGoToDashboard() {
  if (!calculationResult) return;

  const data = getUserData();
  data.footprint = calculationResult;
  data.calcDate  = new Date().toISOString();
  data.ecoScore  = getGrade(calculationResult.tonnes);
  saveUserData(null, data);

  checkAndAwardBadges();
  updateDashboard();
  switchTab('dashboard');
  showToast('✅ Footprint saved! Dashboard updated.');
}
