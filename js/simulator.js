// simulator.js — Future Earth Simulator

const SIMULATOR_CONFIG = {
  driveReduction: {
    label: 'Drive Less',
    unit: '%',
    min: 0, max: 100, step: 5,
    annualKgPerPct: 14, // kg CO₂ per 1% reduction (based on avg 1400kg/yr driving)
    moneyPerPct: 600,   // ₹ saved per 1% reduction
    emoji: '🚗'
  },
  meatReduction: {
    label: 'Eat Less Meat',
    unit: '%',
    min: 0, max: 100, step: 5,
    annualKgPerPct: 15,
    moneyPerPct: 300,
    emoji: '🥩'
  },
  renewableAdoption: {
    label: 'Switch to Renewables',
    unit: '%',
    min: 0, max: 100, step: 5,
    annualKgPerPct: 18,
    moneyPerPct: 400,
    emoji: '☀️'
  },
  buyingReduction: {
    label: 'Buy Less New Items',
    unit: '%',
    min: 0, max: 100, step: 5,
    annualKgPerPct: 6,
    moneyPerPct: 800,
    emoji: '🛍️'
  },
  flyingReduction: {
    label: 'Fly Less',
    unit: '%',
    min: 0, max: 100, step: 5,
    annualKgPerPct: 20,
    moneyPerPct: 2000,
    emoji: '✈️'
  }
};

let simValues = { driveReduction: 0, meatReduction: 0, renewableAdoption: 0, buyingReduction: 0, flyingReduction: 0 };

function initSimulator() {
  renderSimulatorSliders();
  updateSimulatorResults();
}

function renderSimulatorSliders() {
  const container = document.getElementById('simSliders');
  if (!container) return;

  container.innerHTML = '';

  Object.entries(SIMULATOR_CONFIG).forEach(([key, config]) => {
    const div = document.createElement('div');
    div.className = 'sim-slider-wrap';
    div.innerHTML = `
      <div class="sim-slider-header">
        <span class="sim-slider-icon">${config.emoji}</span>
        <span class="sim-slider-label">${config.label}</span>
        <span class="sim-slider-val" id="simVal_${key}">0%</span>
      </div>
      <input type="range" class="sim-slider" id="simSlider_${key}"
        min="${config.min}" max="${config.max}" step="${config.step}" value="0"
        oninput="updateSimSlider('${key}', this.value)"
      />
      <div class="sim-slider-ticks">
        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
      </div>
    `;
    container.appendChild(div);
  });
}

function updateSimSlider(key, value) {
  simValues[key] = parseInt(value);
  document.getElementById('simVal_' + key).textContent = value + '%';
  updateSimSlider_fill(key, value);
  updateSimulatorResults();
}

function updateSimSlider_fill(key, value) {
  const slider = document.getElementById('simSlider_' + key);
  if (slider) {
    const pct = (value / 100) * 100;
    slider.style.setProperty('--slider-pct', pct + '%');
  }
}

function updateSimulatorResults() {
  let totalKgSaved = 0;
  let totalMoneySaved = 0;

  Object.entries(SIMULATOR_CONFIG).forEach(([key, config]) => {
    const val = simValues[key] || 0;
    totalKgSaved += (val / 100) * (config.annualKgPerPct * 100);
    totalMoneySaved += (val / 100) * (config.moneyPerPct * 100);
  });

  // Cap at reasonable max
  totalKgSaved = Math.min(totalKgSaved, 8000);
  totalMoneySaved = Math.min(totalMoneySaved, 500000);

  const treeEquivalent = Math.round(totalKgSaved / 22);
  const tonnesSaved = (totalKgSaved / 1000).toFixed(2);
  const pctReduction = Math.min(Math.round((totalKgSaved / 4000) * 100), 100);

  // Animate numbers
  animateNumber('simCo2Saved', totalKgSaved, 0, ' kg');
  animateNumber('simMoneySaved', Math.round(totalMoneySaved), 0, '');
  animateNumber('simTreesSaved', treeEquivalent, 0, '');
  animateNumber('simTonnesSaved', parseFloat(tonnesSaved), 2, ' t');

  // Progress ring
  const ring = document.getElementById('simProgressRing');
  if (ring) {
    const circumference = 2 * Math.PI * 54;
    const offset = circumference * (1 - pctReduction / 100);
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
  }
  const pctEl = document.getElementById('simPctText');
  if (pctEl) pctEl.textContent = pctReduction + '%';

  // Color ring by reduction amount
  if (ring) {
    if (pctReduction >= 50) ring.style.stroke = '#22c55e';
    else if (pctReduction >= 25) ring.style.stroke = '#fbbf24';
    else ring.style.stroke = '#94a3b8';
  }

  // Update impact description
  const desc = document.getElementById('simImpactDesc');
  if (desc) {
    if (totalKgSaved === 0) {
      desc.textContent = 'Move the sliders above to see your potential impact!';
    } else if (totalKgSaved < 500) {
      desc.textContent = `Great start! These changes would give you a meaningful reduction. 🌱`;
    } else if (totalKgSaved < 2000) {
      desc.textContent = `Excellent! These lifestyle changes could significantly reduce your footprint. 🌍`;
    } else {
      desc.textContent = `Outstanding! You'd be making a major contribution to climate action. 🏆`;
    }
  }
}

function animateNumber(id, target, decimals, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseFloat(el.dataset.current || '0');
  const duration = 400;
  const startTime = performance.now();

  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const current = start + (target - start) * eased;
    el.textContent = (decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString()) + suffix;
    el.dataset.current = current;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function resetSimulator() {
  Object.keys(simValues).forEach(key => {
    simValues[key] = 0;
    const slider = document.getElementById('simSlider_' + key);
    const label = document.getElementById('simVal_' + key);
    if (slider) { slider.value = 0; slider.style.setProperty('--slider-pct', '0%'); }
    if (label) label.textContent = '0%';
  });
  updateSimulatorResults();
}
