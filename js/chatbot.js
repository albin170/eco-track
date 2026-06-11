// chatbot.js — AI Sustainability Assistant

const CHAT_RESPONSES = [
  {
    patterns: ['hello','hi','hey','hola','namaste','greetings','good morning','good evening'],
    response: "Hello! 👋 I'm EcoBot, your personal sustainability assistant. Ask me anything about reducing your carbon footprint, eco-friendly habits, or how to use EcoTrack!"
  },
  {
    patterns: ['drive','car','vehicle','commute','20 km','daily drive','km daily','petrol','diesel'],
    response: "🚗 Driving is one of the biggest personal carbon sources! If you drive 20 km daily in a petrol car, that's roughly **1.4 tonnes CO₂/year**.\n\n💡 **Quick wins:**\n• Switch to public transport 2 days/week → save ~18% emissions\n• Carpool with a colleague → halve per-person emissions\n• Try cycling for trips under 5 km — zero emissions!\n• If buying a new car, consider electric — up to 70% lower emissions"
  },
  {
    patterns: ['public transport','bus','metro','train','transit'],
    response: "🚌 Public transport is excellent! A bus produces ~80g CO₂/km per passenger vs ~192g for a petrol car.\n\n**Comparison per 20km trip:**\n• 🚗 Petrol car: ~3.8 kg CO₂\n• 🚌 Bus: ~1.6 kg CO₂\n• 🚇 Metro: ~0.6 kg CO₂\n• 🚲 Cycling: 0 kg CO₂\n\nSwitching to the metro for your daily commute could save **300–500 kg CO₂/year**!"
  },
  {
    patterns: ['cycling','cycle','bike','bicycle','walk','walking'],
    response: "🚲 Brilliant choice! Cycling and walking produce **zero direct emissions** and have health benefits too.\n\n**Is cycling better than public transport?**\nFor both emissions and fitness — yes! But public transport is better if the distance is too long to cycle safely.\n\n**Tips for cycling:**\n• Start with 1–2 days/week\n• Use a cycle lane app for safe routes\n• Even e-bikes are 40× more efficient than cars!"
  },
  {
    patterns: ['flight','fly','airplane','airline','travel','holiday'],
    response: "✈️ Flying is one of the highest-impact activities. A single long-haul return flight can emit **2–3 tonnes CO₂** — sometimes more than a whole year of driving!\n\n**To reduce flight emissions:**\n• Choose direct flights (takeoff uses the most fuel)\n• Fly economy (business class uses ~3× more per seat)\n• Consider train for distances under 700 km\n• If you must fly, offset through verified schemes like Gold Standard\n• Take fewer but longer trips"
  },
  {
    patterns: ['food','eat','diet','meat','vegan','vegetarian','beef'],
    response: "🥗 Food choices have a massive impact! Diet can account for 20–30% of your total footprint.\n\n**Emissions by diet type (kg CO₂/year):**\n• 🥩 Meat-heavy: ~3,300 kg\n• 🍽️ Average omnivore: ~2,500 kg\n• 🥗 Flexitarian: ~1,800 kg\n• 🥦 Vegetarian: ~1,400 kg\n• 🌱 Vegan: ~1,000 kg\n\n**Biggest impact:** Reducing beef and lamb. They produce 20× more CO₂ than plant protein per gram!"
  },
  {
    patterns: ['reduce emissions','lower footprint','reduce carbon','eco friendly','sustainable','green tips'],
    response: "🌍 Great question! Here are the **highest-impact changes** you can make:\n\n**Top 5 by impact:**\n1. 🚗 Drive less / go electric (up to 2t/year)\n2. ✈️ One fewer long-haul flight (1.5–3t)\n3. 🥗 Shift to plant-rich diet (0.5–1.5t)\n4. ☀️ Switch to renewable energy (1–2t)\n5. 🛍️ Buy less, buy second-hand (0.5–1t)\n\nSmall changes × 8 billion people = massive impact! Start with what's easiest for you."
  },
  {
    patterns: ['electricity','energy','solar','renewable','power bill','kwh'],
    response: "⚡ Home energy is typically 20–30% of personal footprints. Here's how to reduce it:\n\n**Quick actions:**\n• Set AC to 24°C — saves 6% per degree\n• Switch to LED bulbs — use 75% less energy\n• Unplug devices on standby — saves ~10% of bill\n• Run laundry in cold water — saves 90% of wash energy\n\n**Big changes:**\n• Rooftop solar can cut home energy emissions by 90%+\n• India's solar irradiance is among the world's highest — great ROI!"
  },
  {
    patterns: ['shopping','clothes','fashion','buy','purchase','plastic','waste'],
    response: "🛍️ Shopping & lifestyle contributes more than most people think!\n\n**Clothing:**\n• Fast fashion = huge carbon cost (1 jeans = ~33 kg CO₂)\n• Buying second-hand reduces that by ~80%\n• Aim for quality over quantity\n\n**General tips:**\n• Repair instead of replacing (saves 300–700 kg per item)\n• Avoid single-use plastics\n• Buy local to reduce delivery emissions\n• The most sustainable product is one you already own!"
  },
  {
    patterns: ['tree','trees','forest','plant','offset'],
    response: "🌳 Trees are amazing carbon absorbers! A mature tree absorbs about **20–25 kg CO₂/year**.\n\n**To offset a 4-tonne footprint, you'd need ~180 trees** — which is why planting alone isn't enough. We need to reduce first, then offset what's left.\n\n**Better than planting:**\n• Reduce your emissions directly\n• Support verified reforestation projects\n• Protect existing old-growth forests\n• Eat less beef (beef farming drives 80% of Amazon deforestation)"
  },
  {
    patterns: ['calculator','calculate','footprint','score','result','co2','carbon'],
    response: "📊 To calculate your carbon footprint, go to the **Calculator** tab! It covers:\n• 🚗 Transportation (car, flights, public transport)\n• 🍽️ Food & diet choices\n• 🏠 Home energy use\n• 🛍️ Shopping habits\n\nYou'll get a grade (A–D), your total CO₂ in tonnes/year, and comparison with global averages. It takes just 2 minutes!"
  },
  {
    patterns: ['challenge','challenges','weekly','tasks','points','badge','reward'],
    response: "🏆 EcoTrack Challenges are short-term eco missions! Check the **Challenges** tab for this week's:\n\n• 🟢 Easy: Carry a reusable water bottle\n• 🟡 Medium: Use public transport for 3 days\n• 🔴 Hard: Zero-plastic week\n\nCompleting challenges earns you **Green Points** and **badges**. Collect enough and you can unlock special certificates! Start with the Easy ones and work your way up."
  },
  {
    patterns: ['simulator','future','earth','slider','impact','predict'],
    response: "🔮 The **Future Earth Simulator** lets you preview your impact before you even make changes!\n\nUse the sliders to:\n• Drive less\n• Eat less meat\n• Switch to renewables\n• Buy fewer new items\n\nYou'll see **real-time** CO₂ reduction, money saved per year, and equivalent trees planted. It's very motivating to see 500 kg reduction just from 2 habit changes!"
  },
  {
    patterns: ['leaderboard','rank','ranking','community','others','compare'],
    response: "🏅 The **Leaderboard** shows how you compare to other EcoTrack users!\n\nUsers are ranked by:\n• Total carbon reduction\n• Completed challenges\n• Community contributions\n\nYour rank improves as you complete daily actions and challenges. The top performers earn exclusive **Climate Champion** badges! Check the Leaderboard tab to see your current ranking."
  },
  {
    patterns: ['water','drought','ocean','sea level'],
    response: "💧 Water and climate are deeply connected! Here's what you can do:\n\n• Take shorter showers (5 min saves ~8L vs 10 min)\n• Fix leaking taps immediately\n• Collect rainwater for plants\n• Avoid water-intensive foods like beef (needs 15,000L per kg!)\n• Support water conservation projects in your area"
  },
  {
    patterns: ['money','save','cost','expensive','cheap','budget'],
    response: "💰 Going green often saves money! Here's the financial case:\n\n• 🚲 Cycling instead of driving: save ₹30,000–50,000/year\n• 💡 LED bulbs: pay back in 2–3 months, last 10 years\n• ☀️ Rooftop solar: ROI in 4–6 years, then 20+ years of free power\n• 🥗 Less meat: vegetarian diet is ~30% cheaper\n• 🛍️ Buy less: obvious savings!\n\nThe most eco-friendly choices are usually the cheapest too."
  },
  {
    patterns: ['climate change','global warming','temperature','co2 effect','greenhouse'],
    response: "🌡️ Climate change is caused by greenhouse gases (mainly CO₂ and methane) trapping heat in our atmosphere.\n\n**Key facts:**\n• Earth is already 1.1°C warmer than pre-industrial levels\n• At 1.5°C, we risk major coral reef die-offs, extreme weather\n• At 2°C, sea level rise threatens 100M+ people\n• Each person's choices matter — the average Indian emits 1.9t, but cutting even 20% is significant\n\nEcoTrack helps you make that difference, one action at a time! 🌱"
  },
  {
    patterns: ['help','what can you do','what do you know','features','functions'],
    response: "🤖 I'm EcoBot! Here's what I can help with:\n\n• 🌍 **Emission tips** — transport, food, energy, shopping\n• 📊 **Calculator guidance** — how to use EcoTrack\n• 🏆 **Challenges & gamification** — points and badges\n• 🔮 **Simulator** — future impact preview\n• 🌡️ **Climate education** — facts and science\n• 💰 **Saving money** through eco choices\n\nJust ask me anything! I'm always happy to help you go greener. 🌿"
  }
];

const DEFAULT_RESPONSE = "🌱 That's a great question! While I might not have a specific answer for that, I'd recommend:\n\n1. Checking the **Calculator** to see where your biggest emissions come from\n2. Browsing the **Learning Hub** for articles on that topic\n3. Trying out the **Eco Actions** for daily tips\n\nIs there something more specific about carbon footprints or sustainability I can help with?";

// ── Footprint-aware response patterns ──
const FOOTPRINT_RESPONSES = [
  {
    patterns: ['what should i fix first', 'fix first', 'biggest source', 'worst category', 'most impact'],
    buildResponse: () => {
      const fp = getUserData().footprint;
      if (!fp) return '📊 First, complete the **Calculator** tab to get your footprint breakdown — then I can tell you exactly which category to focus on first!';
      const sorted = [
        { label: 'transport 🚗',    val: fp.transport },
        { label: 'food 🍽️',         val: fp.food },
        { label: 'home energy ⚡',  val: fp.energy },
        { label: 'shopping 🛍️',     val: fp.shopping }
      ].sort((a, b) => b.val - a.val);
      return `🎯 Based on your data, your biggest emission source is **${sorted[0].label}** at ${(sorted[0].val/1000).toFixed(1)}t CO₂/year.\n\nThat's ${Math.round((sorted[0].val / fp.total) * 100)}% of your total footprint. Tackling this first will give you the biggest return. Ask me specifically about reducing your ${sorted[0].label.split(' ')[0].toLowerCase()} footprint!`;
    }
  },
  {
    patterns: ['paris target', 'paris goal', 'paris agreement', 'how close', '1 tonne', '1t goal'],
    buildResponse: () => {
      const fp = getUserData().footprint;
      if (!fp) return '🌍 The Paris Agreement aims for every person to emit under **1 tonne CO₂/year** by 2050. Calculate your footprint first to see how close you are!';
      const gap = fp.tonnes - 1.0;
      if (gap <= 0) return `🌟 Incredible! Your footprint (${fp.tonnes}t) is **already at or below** the Paris 2050 target of 1.0t. You are genuinely making a difference!`;
      return `🌍 The Paris Agreement target is **1.0t CO₂/person/year** by 2050.\n\nYour current footprint: **${fp.tonnes}t**\nGap to close: **${gap.toFixed(1)}t** (${Math.round((gap/fp.tonnes)*100)}% reduction needed)\n\nGood news: the most impactful changes in your ${['transport','food','energy','shopping'].sort((a,b) => (fp[b]||0)-(fp[a]||0))[0]} category could close a big chunk of that gap.`;
    }
  },
  {
    patterns: ['top saving', 'best saving', 'save the most', 'most savings', 'quickest reduction'],
    buildResponse: () => {
      const fp = getUserData().footprint;
      if (!fp) return '💡 To find your top saving opportunity, complete the **Calculator** tab first — then I can give you a personalised answer!';
      const sorted = [
        { label: 'transport',  val: fp.transport, tip: 'switching to public transport 2 days/week → ~500 kg/year' },
        { label: 'food',       val: fp.food,       tip: 'cutting red meat to once/week → ~400 kg/year' },
        { label: 'energy',     val: fp.energy,     tip: 'installing rooftop solar → up to 1.5t/year' },
        { label: 'shopping',   val: fp.shopping,   tip: 'buying second-hand instead of new → ~400 kg/year' }
      ].sort((a, b) => b.val - a.val);
      return `⚡ Your top saving opportunity is in **${sorted[0].label}**!\n\n💡 Recommended action: ${sorted[0].tip}\n\nThis single change could make the biggest dent in your ${fp.tonnes}t footprint. Want detailed tips for your ${sorted[0].label} emissions?`;
    }
  }
];

// ── Chatbot State ──
let chatMessages    = [];
let chatInitialized = false;

/**
 * Initialise the chatbot: bind keyboard handler and send a personalised
 * welcome message based on the user's stored footprint.
 */
function initChatbot() {
  if (chatInitialized) return;
  chatInitialized = true;

  const input = document.getElementById('chatInput');
  if (input) {
    input.setAttribute('aria-label', 'Type a message to EcoBot');
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  // Personalised welcome message using stored footprint
  setTimeout(() => {
    const data = getUserData();
    const fp   = data.footprint;
    let intro  = "👋 Hi! I'm **EcoBot**, your AI sustainability assistant.\n\nI can help you with:\n• Reducing your carbon emissions\n• Understanding your footprint\n• Eco-friendly lifestyle tips\n• Using EcoTrack features\n\nWhat would you like to know? 🌿";

    if (fp) {
      const grade  = getGrade(fp.tonnes);
      const sorted = [
        { key: 'transport', val: fp.transport, label: 'transport 🚗' },
        { key: 'food',      val: fp.food,      label: 'food 🍽️' },
        { key: 'energy',    val: fp.energy,    label: 'home energy ⚡' },
        { key: 'shopping',  val: fp.shopping,  label: 'shopping 🛍️' }
      ].sort((a, b) => b.val - a.val);

      intro = `👋 Hi! I'm **EcoBot**. I can see your footprint is **${fp.tonnes}t CO₂/year** (Grade ${grade}).\n\nYour biggest source is **${sorted[0].label}** (${(sorted[0].val/1000).toFixed(1)}t). Ask me how to tackle it, or try one of the chips below! 🌿`;
    }
    addBotMessage(intro);
  }, 400);
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  addUserMessage(text);
  input.value = '';

  // Show typing indicator
  showTypingIndicator();

  // Find best response
  const delay = 600 + Math.random() * 800;
  setTimeout(() => {
    hideTypingIndicator();
    const response = findBestResponse(text);
    addBotMessage(response);
  }, delay);
}

/**
 * Find the best response for a user message.
 * Checks footprint-aware responses first, then static patterns, then default.
 * @param {string} input
 * @returns {string}
 */
function findBestResponse(input) {
  const lower = input.toLowerCase();

  // Check footprint-aware dynamic responses first
  for (const entry of FOOTPRINT_RESPONSES) {
    for (const pattern of entry.patterns) {
      if (lower.includes(pattern)) {
        return entry.buildResponse();
      }
    }
  }

  // Fall back to static responses
  let bestMatch = null;
  let bestScore = 0;
  for (const entry of CHAT_RESPONSES) {
    for (const pattern of entry.patterns) {
      if (lower.includes(pattern)) {
        const score = pattern.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = entry.response;
        }
      }
    }
  }

  return bestMatch || DEFAULT_RESPONSE;
}

function addUserMessage(text) {
  const container = document.getElementById('chatMessages');
  const msg = document.createElement('div');
  msg.className = 'chat-msg chat-msg--user';
  msg.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div>`;
  container.appendChild(msg);
  scrollChatToBottom();
}

function addBotMessage(text) {
  const container = document.getElementById('chatMessages');
  const msg = document.createElement('div');
  msg.className = 'chat-msg chat-msg--bot';

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar';
  avatar.textContent = '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = formatMarkdown(text);

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  container.appendChild(msg);
  scrollChatToBottom();
}

function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  const ind = document.createElement('div');
  ind.className = 'chat-msg chat-msg--bot';
  ind.id = 'typingIndicator';

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar';
  avatar.textContent = '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble typing-indicator';
  bubble.innerHTML = '<span></span><span></span><span></span>';

  ind.appendChild(avatar);
  ind.appendChild(bubble);
  container.appendChild(ind);
  scrollChatToBottom();
}

function hideTypingIndicator() {
  const ind = document.getElementById('typingIndicator');
  if (ind) ind.remove();
}

function scrollChatToBottom() {
  const container = document.getElementById('chatMessages');
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatMarkdown(text) {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Newlines to <br>
  text = text.replace(/\n/g, '<br>');
  // Bullet points
  text = text.replace(/• /g, '&bull; ');
  return text;
}

// Quick suggestion chips
function sendSuggestion(text) {
  document.getElementById('chatInput').value = text;
  sendChatMessage();
}
