// data.js — Emission factors and static app data

// All emission factors in kg CO2e
const EMISSION_FACTORS = {
  transport: {
    // per km
    car: {
      petrol:   0.192,
      diesel:   0.171,
      hybrid:   0.105,
      electric: 0.053,
      none:     0
    },
    // per flight (round trip average)
    flightShort: 255,
    flightLong:  1600,
    // public transport reduction multipliers
    publicTransport: {
      rarely:    1.0,
      sometimes: 0.88,
      often:     0.72,
      always:    0.55
    }
  },
  food: {
    // base annual kg CO2e by diet
    diet: {
      omnivore:    2500,
      flexitarian: 1800,
      vegetarian:  1400,
      vegan:       1000
    },
    // red meat per serving
    meatServingKg: 3.3,
    mealsPerYear:  1095,
    // local food multiplier
    localFood: {
      rarely:    1.0,
      sometimes: 0.92,
      mostly:    0.82,
      always:    0.73
    },
    // food waste multiplier
    foodWaste: {
      lots:   1.25,
      some:   1.10,
      little: 1.02,
      none:   0.95
    }
  },
  energy: {
    // home type base annual kWh
    homeBase: {
      'apartment':   2400,
      'house-small': 4200,
      'house-large': 7500
    },
    // India grid emission factor kg CO2e per kWh
    gridFactor: 0.82,
    // electricity bill ₹ to kWh (rough: 1 unit ~= ₹8 in India)
    billToKwh: 0.125,
    // solar multiplier
    energySource: {
      'grid':         1.0,
      'partial-solar': 0.55,
      'full-solar':    0.05
    },
    // AC use addition
    acUse: {
      heavy:    800,
      moderate: 400,
      minimal:  100,
      none:     0
    },
    // LED savings (kWh/year)
    led: {
      none: 0,
      some: -150,
      all:  -350
    }
  },
  shopping: {
    // clothing per item kg CO2e
    clothing: {
      minimal:  120,
      moderate: 350,
      frequent: 800
    },
    // electronics
    electronics: {
      none:    0,
      one:     300,
      several: 700
    },
    // second hand reduction
    secondHand: {
      never:     0,
      sometimes: -80,
      often:     -200
    },
    // online delivery addition
    onlineShopping: {
      'mostly-online': 150,
      'mixed':          60,
      'mostly-local':    0
    }
  }
};

const ECO_ACTIONS = [
  {
    id: 'walk-bike',
    category: 'transport',
    emoji: '🚶',
    title: 'Walk or bike today',
    desc: 'Skip the car for trips under 3km. Walking and cycling produce zero emissions.',
    impactText: '-1.2 kg CO₂',
    impactKg: 1.2,
    points: 30
  },
  {
    id: 'public-transit',
    category: 'transport',
    emoji: '🚌',
    title: 'Use public transport',
    desc: 'Take the bus, metro, or train instead of driving solo.',
    impactText: '-2.6 kg CO₂',
    impactKg: 2.6,
    points: 40
  },
  {
    id: 'carpool',
    category: 'transport',
    emoji: '🚗',
    title: 'Carpool with someone',
    desc: 'Sharing a ride halves the per-person emissions from your trip.',
    impactText: '-1.5 kg CO₂',
    impactKg: 1.5,
    points: 25
  },
  {
    id: 'work-from-home',
    category: 'transport',
    emoji: '🏠',
    title: 'Work from home',
    desc: 'One day of remote work can save 3–4 kg CO₂ from your commute.',
    impactText: '-3.5 kg CO₂',
    impactKg: 3.5,
    points: 45
  },
  {
    id: 'plant-based-meal',
    category: 'food',
    emoji: '🥗',
    title: 'Eat a plant-based meal',
    desc: 'Replacing one meat meal with a veggie or legume meal saves significant emissions.',
    impactText: '-1.8 kg CO₂',
    impactKg: 1.8,
    points: 35
  },
  {
    id: 'no-beef',
    category: 'food',
    emoji: '🥦',
    title: 'Skip beef today',
    desc: 'Beef is the highest-emission food. One beef meal = driving ~30 km.',
    impactText: '-3.3 kg CO₂',
    impactKg: 3.3,
    points: 50
  },
  {
    id: 'seasonal-food',
    category: 'food',
    emoji: '🌽',
    title: 'Buy local & seasonal produce',
    desc: 'Local seasonal food avoids long transport chains and cold storage emissions.',
    impactText: '-0.5 kg CO₂',
    impactKg: 0.5,
    points: 15
  },
  {
    id: 'reduce-waste',
    category: 'food',
    emoji: '♻️',
    title: 'Use up fridge leftovers',
    desc: 'Food waste produces methane in landfills. Eating leftovers saves food and emissions.',
    impactText: '-0.8 kg CO₂',
    impactKg: 0.8,
    points: 20
  },
  {
    id: 'short-shower',
    category: 'energy',
    emoji: '🚿',
    title: 'Take a shorter shower',
    desc: 'Cut your shower from 10 to 5 minutes and save both water and heating energy.',
    impactText: '-0.4 kg CO₂',
    impactKg: 0.4,
    points: 15
  },
  {
    id: 'unplug-devices',
    category: 'energy',
    emoji: '🔌',
    title: 'Unplug devices on standby',
    desc: 'Standby power can account for 10% of home electricity use.',
    impactText: '-0.3 kg CO₂',
    impactKg: 0.3,
    points: 10
  },
  {
    id: 'ac-temp',
    category: 'energy',
    emoji: '❄️',
    title: 'Set AC to 24°C or above',
    desc: 'Each degree higher saves ~6% of AC electricity. 24°C is recommended by BEE India.',
    impactText: '-0.6 kg CO₂',
    impactKg: 0.6,
    points: 20
  },
  {
    id: 'natural-light',
    category: 'energy',
    emoji: '☀️',
    title: 'Use natural light all day',
    desc: 'Open the curtains! Avoiding artificial lighting during the day cuts electricity use.',
    impactText: '-0.2 kg CO₂',
    impactKg: 0.2,
    points: 8
  },
  {
    id: 'cold-wash',
    category: 'energy',
    emoji: '🫧',
    title: 'Do laundry in cold water',
    desc: 'Cold water washing uses 90% less energy than hot water cycles.',
    impactText: '-0.5 kg CO₂',
    impactKg: 0.5,
    points: 18
  },
  {
    id: 'second-hand',
    category: 'shopping',
    emoji: '🔄',
    title: 'Buy something second-hand',
    desc: 'Thrifting and resale markets extend product life and avoid new manufacturing emissions.',
    impactText: '-4.0 kg CO₂',
    impactKg: 4.0,
    points: 55
  },
  {
    id: 'repair-dont-replace',
    category: 'shopping',
    emoji: '🔧',
    title: 'Repair instead of replacing',
    desc: 'Fixing a broken item avoids the large carbon cost of manufacturing a new one.',
    impactText: '-8.0 kg CO₂',
    impactKg: 8.0,
    points: 80
  },
  {
    id: 'no-single-use',
    category: 'shopping',
    emoji: '🧴',
    title: 'Avoid single-use plastics',
    desc: 'Bring a reusable bag, bottle, and container. Plastic production is energy-intensive.',
    impactText: '-0.3 kg CO₂',
    impactKg: 0.3,
    points: 12
  },
  {
    id: 'digital-detox',
    category: 'shopping',
    emoji: '📱',
    title: 'Delay a purchase decision',
    desc: 'Wait 30 days before buying non-essentials. It often reveals you didn\'t need it.',
    impactText: 'Varies',
    impactKg: 0,
    points: 10
  }
];

const MONTHLY_CHALLENGES = [
  {
    emoji: '🚗',
    name: 'Car-Free Fridays',
    desc: 'Go car-free every Friday this month. Walk, cycle, or take transit for all your trips.',
    target: 4,
    unit: 'Fridays'
  },
  {
    emoji: '🥦',
    name: 'Meatless Mondays',
    desc: 'Eat entirely plant-based every Monday. Challenge yourself with new veggie recipes!',
    target: 4,
    unit: 'Mondays'
  },
  {
    emoji: '⚡',
    name: 'Electricity Saver',
    desc: 'Cut your electricity usage by 15% this month by switching off standby devices.',
    target: 15,
    unit: '% reduction'
  },
  {
    emoji: '🛍️',
    name: 'Zero New Stuff',
    desc: 'Don\'t buy any new manufactured goods this month. Borrow, share, or go second-hand.',
    target: 30,
    unit: 'days'
  }
];
