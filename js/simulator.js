'use strict';
/**
 * simulator.js — Future Earth Simulator
 *
 * Provides interactive sliders to model how lifestyle changes affect annual CO₂
 * emissions. All DOM output is text-only — no user data is rendered via innerHTML.
 */

/** @type {Object.<string, {label:string, unit:string, min:number, max:number, step:number, annualKgPerPct:number, moneyPerPct:number, emoji:string}>} */
const SIMULATOR_CONFIG = {
  driveReduction:    { label: 'Drive Less',              unit: '%', min: 0, max: 100, step: 5, annualKgPerPct: 14, moneyPerPct: 600,  emoji: '🚗' },
  meatReduction:     { label: 'Eat Less Meat',            unit: '%', min: 0, max: 100, step: 5, annualKgPerPct: 15, moneyPerPct: 300,  emoji: '🥩' },
  renewableAdoption: { label: 'Switch to Renewables',     unit: '%', min: 0, max: 100, step: 5, annualKgPerPct: 18, moneyPerPct: 400,  emoji: '☀️' },
  buyingReduction:   { label: 'Buy Less New Items',       unit: '%', min: 0, max: 100, step: 5, annualKgPerPct: 6,  moneyPerPct: 800,  emoji: '🛍️' },
  flyingReduction:   { label: 'Fly Less',                 unit: '%', min: 0, max: 100, step: 5, annualKgPerPct: 20, moneyPerPct: 2000, emoji: '✈️' }
};

/** Current slider values (0–100%) for each simulator dimension. */
const simValues = { driveReduction: 0, meatReduction: 0, renewableAdoption: 0, buyingReduction: 0, flyingReduction: 0 };

/** Initialise the simulator (called on first tab visit). */
function initSimulator() {
  renderSimulatorSliders();
  updateSimulatorResults();
}

/**
 * Build the simulator slider UI inside #simSliders.
 * Uses safe DOM construction throughout.
 */
function renderSimulatorSliders() {
  const container = document.getElementById('simSliders');
  if (!container) return;

  container.innerHTML = '';

  Object.entries(SIMULATOR_CONFIG).forEach(([key, config]) => {
    const wrap       = document.createElement('div');
    wrap.className   = 'sim-slider-wrap';

    // Header row
    const header     = document.createElement('div');
    header.className = 'sim-slider-header';

    const icon       = document.createElement('span');
    icon.className   = 'sim-slider-icon';
    icon.textContent = config.emoji;
    icon.setAttribute('aria-hidden', 'true');

    const label      = document.createElement('span');
    label.className  = 'sim-slider-label';
    label.textContent = config.label;

    const val        = document.createElement('span');
    val.className    = 'sim-slider-val';
    val.id           = 'simVal_' + key;
    val.textContent  = '0%';

    header.appendChild(icon);
    header.appendChild(label);
    header.appendChild(val);

    // Slider input
    const slider     = document.createElement('input');
    slider.type      = 'range';
    slider.className = 'sim-slider';
    slider.id        = 'simSlider_' + key;
    slider.min       = String(config.min);
    slider.max       = String(config.max);
    slider.step      = String(config.step);
    slider.value     = '0';
    slider.setAttribute('aria-label', config.label + ' reduction percentage');
    slider.setAttribute('aria-valuenow', '0');
    slider.setAttribute('aria-valuemin', '0');
    slider.setAttribute('aria-valuemax', '100');
    slider.addEventListener('input', function () {
      updateSimSlider(key, this.value);
      this.setAttribute('aria-valuenow', this.value);
    });

    // Tick labels
    const ticks      = document.createElement('div');
    ticks.className  = 'sim-slider-ticks';
    ticks.setAttribute('aria-hidden', 'true');
    ['0%', '25%', '50%', '75%', '100%'].forEach(t => {
      const span    = document.createElement('span');
      span.textContent = t;
      ticks.appendChild(span);
    });

    wrap.appendChild(header);
    wrap.appendChild(slider);
    wrap.appendChild(ticks);
    container.appendChild(wrap);
  });
}

/**
 * Update simulator results when a slider changes.
 * @param {string} key — SIMULATOR_CONFIG key
 * @param {string|number} value — new slider value
 */
function updateSimSlider(key, value) {
  simValues[key] = parseInt(value, 10);

  const valEl   = document.getElementById('simVal_' + key);
  if (valEl) valEl.textContent = value + '%';

  _updateSimSliderFill(key, value);
  updateSimulatorResults();
}

/**
 * Update the CSS fill gradient on a simulator slider.
 * @param {string} key
 * @param {string|number} value
 * @private
 */
function _updateSimSliderFill(key, value) {
  const slider = document.getElementById('simSlider_' + key);
  if (slider) slider.style.setProperty('--slider-pct', value + '%');
}

/**
 * Recalculate total savings and update all result display elements.
 */
function updateSimulatorResults() {
  let totalKgSaved    = 0;
  let totalMoneySaved = 0;

  Object.entries(SIMULATOR_CONFIG).forEach(([key, config]) => {
    const val        = simValues[key] || 0;
    totalKgSaved    += (val / 100) * (config.annualKgPerPct * 100);
    totalMoneySaved += (val / 100) * (config.moneyPerPct * 100);
  });

  totalKgSaved    = Math.min(totalKgSaved, 8000);
  totalMoneySaved = Math.min(totalMoneySaved, 500000);

  const treeEquivalent = Math.round(totalKgSaved / 22);
  const tonnesSaved    = (totalKgSaved / 1000).toFixed(2);
  const pctReduction   = Math.min(Math.round((totalKgSaved / 4000) * 100), 100);

  animateNumber('simCo2Saved',    totalKgSaved,              0, ' kg');
  animateNumber('simMoneySaved',  Math.round(totalMoneySaved), 0, '');
  animateNumber('simTreesSaved',  treeEquivalent,             0, '');
  animateNumber('simTonnesSaved', parseFloat(tonnesSaved),    2, ' t');

  // Progress ring
  const ring = document.getElementById('simProgressRing');
  if (ring) {
    const circumference = 2 * Math.PI * 54;
    ring.style.strokeDasharray  = circumference;
    ring.style.strokeDashoffset = circumference * (1 - pctReduction / 100);
    ring.style.stroke = pctReduction >= 50 ? '#22c55e' : pctReduction >= 25 ? '#fbbf24' : '#94a3b8';
  }

  const pctEl = document.getElementById('simPctText');
  if (pctEl) pctEl.textContent = pctReduction + '%';

  const desc = document.getElementById('simImpactDesc');
  if (desc) {
    if (totalKgSaved === 0)         desc.textContent = 'Move the sliders above to see your potential impact!';
    else if (totalKgSaved < 500)    desc.textContent = 'Great start! These changes would give you a meaningful reduction. 🌱';
    else if (totalKgSaved < 2000)   desc.textContent = 'Excellent! These lifestyle changes could significantly reduce your footprint. 🌍';
    else                            desc.textContent = 'Outstanding! You\'d be making a major contribution to climate action. 🏆';
  }
}

/**
 * Animate a numeric display from its current value to a target value.
 * @param {string} id — element ID
 * @param {number} target
 * @param {number} decimals
 * @param {string} suffix
 */
function animateNumber(id, target, decimals, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  const start    = parseFloat(el.dataset.current || '0');
  const duration = 400;
  const startTime = performance.now();

  function step(now) {
    const t       = Math.min((now - startTime) / duration, 1);
    const eased   = 1 - Math.pow(1 - t, 3);
    const current = start + (target - start) * eased;
    el.textContent   = (decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString()) + suffix;
    el.dataset.current = current;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/**
 * Reset all simulator sliders to zero.
 */
function resetSimulator() {
  Object.keys(simValues).forEach(key => {
    simValues[key] = 0;
    const slider   = document.getElementById('simSlider_' + key);
    const label    = document.getElementById('simVal_' + key);
    if (slider) {
      slider.value = 0;
      slider.setAttribute('aria-valuenow', '0');
      slider.style.setProperty('--slider-pct', '0%');
    }
    if (label) label.textContent = '0%';
  });
  updateSimulatorResults();
}
