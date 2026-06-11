// hub.js — Learning Hub

const HUB_ARTICLES = [
  {
    id: 'climate-basics',
    emoji: '🌡️',
    category: 'Science',
    title: 'Climate Change Basics',
    desc: 'Understand the greenhouse effect, carbon cycle, and why 1.5°C matters.',
    readTime: '5 min',
    content: `<h3>What is Climate Change?</h3>
<p>Climate change refers to long-term shifts in global temperatures and weather patterns. Since the 1800s, human activities—especially burning fossil fuels—have been the main driver of climate change.</p>
<h3>The Greenhouse Effect</h3>
<p>Greenhouse gases (CO₂, methane, nitrous oxide) act like a blanket around Earth, trapping heat from the sun. Without them, Earth would be -18°C. With too many, we overheat.</p>
<h3>Why 1.5°C Matters</h3>
<p>Earth is already 1.1°C warmer than pre-industrial levels. At 1.5°C we risk major coral reef die-offs and extreme weather. At 2°C, 100M+ people face sea-level flooding. Every fraction of a degree matters.</p>
<h3>Your Role</h3>
<p>The average Indian emits 1.9 tonnes CO₂/year. The world average is 4 tonnes. Paris Agreement target is under 1 tonne per person by 2050. Using EcoTrack helps you understand and reduce your contribution.</p>`,
    quiz: [
      { q: 'What is the current global temperature rise above pre-industrial levels?', opts: ['0.5°C','1.1°C','2.0°C','3.5°C'], ans: 1 },
      { q: 'What is the Paris Agreement target temperature limit?', opts: ['1.0°C','1.5°C','2.5°C','3.0°C'], ans: 1 },
      { q: 'What is the biggest driver of modern climate change?', opts: ['Volcanoes','Solar flares','Burning fossil fuels','Deforestation'], ans: 2 }
    ]
  },
  {
    id: 'renewable-energy',
    emoji: '☀️',
    category: 'Energy',
    title: 'Renewable Energy Guide',
    desc: 'Solar, wind, and how switching to clean energy transforms your footprint.',
    readTime: '6 min',
    content: `<h3>Why Renewable Energy?</h3>
<p>Energy production is the largest source of global CO₂ emissions. Switching to renewables is one of the fastest ways to decarbonize. India is among the world's best locations for solar energy.</p>
<h3>Solar Power</h3>
<p>Rooftop solar panels can reduce a home's carbon footprint by 1–2 tonnes/year. With India's net metering policy, you can sell excess power back to the grid. Typical ROI: 4–6 years, lifespan: 25+ years.</p>
<h3>Wind & Other Sources</h3>
<p>India is the 4th largest wind energy producer globally. Community wind projects are growing. Hydro and biogas are also part of the mix.</p>
<h3>What You Can Do Today</h3>
<ul>
<li>Switch to a green energy provider if available</li>
<li>Install rooftop solar (subsidies available under PM Surya Ghar Yojana)</li>
<li>Buy Energy Star rated appliances</li>
<li>Reduce overall consumption first</li>
</ul>`,
    quiz: [
      { q: 'What is the typical payback period for rooftop solar in India?', opts: ['1–2 years','4–6 years','10–12 years','20+ years'], ans: 1 },
      { q: 'India is the ___ largest wind energy producer globally?', opts: ['1st','2nd','3rd','4th'], ans: 3 },
      { q: 'What does "net metering" allow you to do?', opts: ['Measure your net worth','Sell excess solar power to the grid','Track your monthly bill','Charge EVs for free'], ans: 1 }
    ]
  },
  {
    id: 'sustainable-eating',
    emoji: '🥗',
    category: 'Food',
    title: 'Sustainable Eating',
    desc: 'How your plate choices impact the planet — and what to eat instead.',
    readTime: '7 min',
    content: `<h3>Food & The Climate</h3>
<p>The global food system accounts for ~26% of greenhouse gas emissions. Your individual diet is one of the most powerful levers you have — switching from meat-heavy to plant-rich can cut food emissions by 50%.</p>
<h3>The Problem with Beef</h3>
<p>Beef produces 60kg CO₂e per 100g protein — 20× more than legumes. Beef farming also drives 80% of Amazon deforestation. One beef burger = driving 50 km in a petrol car.</p>
<h3>The Plant-Based Advantage</h3>
<p>You don't have to go fully vegan. Even shifting to flexitarian (mostly plant, occasional meat) cuts food emissions by ~30%. Legumes, tofu, and eggs are high-protein, low-emission alternatives.</p>
<h3>Buy Local & Seasonal</h3>
<p>Food miles are real. Seasonal local produce avoids cold storage and long transport chains. Farmers markets and local co-ops are great options.</p>`,
    quiz: [
      { q: 'Beef produces how many times more CO₂ per gram of protein vs legumes?', opts: ['5×','10×','20×','50×'], ans: 2 },
      { q: 'What % of Amazon deforestation is driven by beef farming?', opts: ['20%','50%','80%','95%'], ans: 2 },
      { q: 'What diet reduces food emissions by ~30% vs omnivore?', opts: ['Vegan','Vegetarian','Flexitarian','Pescatarian'], ans: 2 }
    ]
  },
  {
    id: 'sustainable-shopping',
    emoji: '🛍️',
    category: 'Lifestyle',
    title: 'Conscious Consumption',
    desc: 'Fast fashion, electronics, and how to shop without wrecking the planet.',
    readTime: '5 min',
    content: `<h3>The Hidden Carbon of What We Buy</h3>
<p>Every product has a "carbon shadow" — the emissions from raw materials, manufacturing, shipping, and disposal. A single smartphone requires ~70kg CO₂ to make. A pair of jeans: ~33kg CO₂.</p>
<h3>Fast Fashion Crisis</h3>
<p>The fashion industry produces 10% of global carbon emissions — more than aviation and shipping combined. Fast fashion encourages buying cheap clothes and discarding them quickly.</p>
<h3>What to Do</h3>
<ul>
<li><strong>Buy less:</strong> The most sustainable item is one you don't buy</li>
<li><strong>Buy second-hand:</strong> Thrifting reduces clothing emissions by ~80%</li>
<li><strong>Repair:</strong> Fixing shoes, clothes, and electronics avoids new production</li>
<li><strong>Borrow & share:</strong> Use libraries, tool lending, and rental services</li>
<li><strong>Buy quality:</strong> One long-lasting item beats three short-lived ones</li>
</ul>`,
    quiz: [
      { q: 'How much CO₂ does manufacturing one smartphone require?', opts: ['7kg','70kg','700kg','7 tonnes'], ans: 1 },
      { q: 'The fashion industry produces roughly what % of global carbon emissions?', opts: ['1%','5%','10%','25%'], ans: 2 },
      { q: 'Buying second-hand reduces clothing emissions by approximately?', opts: ['20%','50%','80%','95%'], ans: 2 }
    ]
  },
  {
    id: 'carbon-neutral',
    emoji: '🌍',
    category: 'Action',
    title: 'Going Carbon Neutral',
    desc: 'Understand offsets, footprint reduction roadmap, and net-zero living.',
    readTime: '8 min',
    content: `<h3>What is Carbon Neutrality?</h3>
<p>Being carbon neutral means balancing your emissions with carbon removal — either by reducing them to zero or offsetting what remains through verified projects.</p>
<h3>The Reduction Hierarchy</h3>
<p><strong>Avoid → Reduce → Replace → Offset</strong></p>
<p>Offsets are a last resort, not a silver bullet. Buying carbon credits doesn't mean business-as-usual is fine — first reduce what you can.</p>
<h3>Verified Offsets</h3>
<p>If you must offset, choose Gold Standard or Verified Carbon Standard (VCS) certified projects. Common examples: reforestation, clean cooking stoves, solar in developing countries.</p>
<h3>Your Path to Net-Zero</h3>
<ol>
<li>Calculate your footprint (use EcoTrack's calculator)</li>
<li>Identify your top 2–3 emission sources</li>
<li>Make 1 big change per quarter</li>
<li>Track your progress monthly</li>
<li>Offset what you can't yet eliminate</li>
</ol>`,
    quiz: [
      { q: 'What is the correct hierarchy for carbon reduction?', opts: ['Offset → Reduce → Avoid','Avoid → Reduce → Replace → Offset','Replace → Avoid → Offset','Offset everything'], ans: 1 },
      { q: 'What certification should you look for in carbon offsets?', opts: ['ISO 9001','Gold Standard or VCS','BIS Certification','Carbon Zero Seal'], ans: 1 },
      { q: 'Net-zero means:', opts: ['Zero emissions','Balancing emissions with carbon removal','Only using renewables','Planting trees'], ans: 1 }
    ]
  },
  {
    id: 'water-biodiversity',
    emoji: '💧',
    category: 'Science',
    title: 'Water & Biodiversity',
    desc: 'How climate change threatens water supply and ecosystems — and what helps.',
    readTime: '5 min',
    content: `<h3>Water Under Threat</h3>
<p>Climate change is intensifying droughts, floods, and disrupting the water cycle. By 2050, 5 billion people may face water shortages for at least one month per year.</p>
<h3>Biodiversity Loss</h3>
<p>We're in the 6th mass extinction. Species are going extinct 1,000× faster than the natural rate. Coral reefs, which shelter 25% of ocean species, will largely disappear at 2°C warming.</p>
<h3>What You Can Do</h3>
<ul>
<li>Reduce meat (livestock uses 70% of agricultural land)</li>
<li>Avoid products with palm oil (drives tropical deforestation)</li>
<li>Save water at home — shorter showers, fix leaks</li>
<li>Support reforestation projects</li>
<li>Choose sustainable seafood (look for MSC certified)</li>
<li>Avoid pesticide-heavy produce</li>
</ul>`,
    quiz: [
      { q: 'By 2050, how many people may face water shortages?', opts: ['1 billion','2 billion','5 billion','8 billion'], ans: 2 },
      { q: 'Current species extinction is how many times faster than natural rates?', opts: ['10×','100×','1,000×','10,000×'], ans: 2 },
      { q: 'What % of agricultural land does livestock use?', opts: ['30%','50%','70%','90%'], ans: 2 }
    ]
  }
];

let hubQuizState = {};

function initHub() {
  renderHubArticles();
}

function renderHubArticles() {
  const container = document.getElementById('hubGrid');
  if (!container) return;

  const data = getUserData();
  const hubProgress = data.hubProgress || {};

  container.innerHTML = '';
  HUB_ARTICLES.forEach(article => {
    const isRead = hubProgress[article.id]?.read || false;
    const quizDone = hubProgress[article.id]?.quizScore !== undefined;

    const card = document.createElement('div');
    card.className = 'hub-card' + (isRead ? ' hub-card--read' : '');
    card.innerHTML = `
      <div class="hub-card-header">
        <span class="hub-emoji">${article.emoji}</span>
        <span class="hub-category">${article.category}</span>
        ${isRead ? '<span class="hub-badge-read">✅ Read</span>' : ''}
      </div>
      <h3 class="hub-title">${article.title}</h3>
      <p class="hub-desc">${article.desc}</p>
      <div class="hub-footer">
        <span class="hub-read-time">⏱ ${article.readTime} read</span>
        ${quizDone ? `<span class="hub-quiz-score">Quiz: ${hubProgress[article.id].quizScore}/3 ✅</span>` : ''}
        <button class="btn-hub-read" onclick="openArticle('${article.id}')">
          ${isRead ? 'Review Article' : 'Read Article →'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function openArticle(articleId) {
  const article = HUB_ARTICLES.find(a => a.id === articleId);
  if (!article) return;

  // Mark as read
  const data = getUserData();
  if (!data.hubProgress) data.hubProgress = {};
  if (!data.hubProgress[articleId]) data.hubProgress[articleId] = {};
  data.hubProgress[articleId].read = true;
  saveUserData(null, data);

  // Show modal
  const modal = document.getElementById('articleModal');
  const body = document.getElementById('articleBody');
  const quizSection = document.getElementById('articleQuiz');
  const title = document.getElementById('articleTitle');

  title.textContent = article.emoji + ' ' + article.title;
  body.innerHTML = article.content;

  // Render quiz
  hubQuizState = { articleId, answers: [], submitted: false };
  quizSection.innerHTML = `<h4 class="quiz-title">📝 Quick Quiz</h4>` +
    article.quiz.map((q, i) => `
      <div class="quiz-question" id="quizQ_${i}">
        <div class="quiz-q-text">${i+1}. ${q.q}</div>
        <div class="quiz-opts">
          ${q.opts.map((opt, j) => `
            <button class="quiz-opt" data-qi="${i}" data-oi="${j}" onclick="selectQuizOpt(${i}, ${j})">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('') +
    `<button class="btn-quiz-submit" id="quizSubmit" onclick="submitQuiz('${articleId}')" disabled>Submit Quiz</button>
     <div id="quizResult" class="quiz-result"></div>`;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  renderHubArticles();
}

function selectQuizOpt(qi, oi) {
  hubQuizState.answers[qi] = oi;

  // Update UI
  const qEl = document.getElementById('quizQ_' + qi);
  qEl.querySelectorAll('.quiz-opt').forEach((btn, j) => {
    btn.classList.toggle('selected', j === oi);
  });

  const article = HUB_ARTICLES.find(a => a.id === hubQuizState.articleId);
  const submitBtn = document.getElementById('quizSubmit');
  if (submitBtn && hubQuizState.answers.filter(a => a !== undefined).length === article.quiz.length) {
    submitBtn.disabled = false;
  }
}

function submitQuiz(articleId) {
  if (hubQuizState.submitted) return;
  hubQuizState.submitted = true;

  const article = HUB_ARTICLES.find(a => a.id === articleId);
  let score = 0;

  article.quiz.forEach((q, i) => {
    const userAns = hubQuizState.answers[i];
    const correct = q.ans;
    const qEl = document.getElementById('quizQ_' + i);
    qEl.querySelectorAll('.quiz-opt').forEach((btn, j) => {
      if (j === correct) btn.classList.add('correct');
      else if (j === userAns && j !== correct) btn.classList.add('wrong');
      btn.disabled = true;
    });
    if (userAns === correct) score++;
  });

  // Save score
  const data = getUserData();
  if (!data.hubProgress) data.hubProgress = {};
  if (!data.hubProgress[articleId]) data.hubProgress[articleId] = {};
  data.hubProgress[articleId].quizScore = score;
  data.points = (data.points || 0) + score * 25;
  saveUserData(null, data);

  const resultEl = document.getElementById('quizResult');
  const messages = ['Keep learning! Try again.','Good effort! Review the article.','Great job! Well done! 🎉'];
  resultEl.innerHTML = `<strong>You scored ${score}/${article.quiz.length}</strong> — ${messages[score - 1] || messages[0]} <br>+${score * 25} Green Points earned!`;
  resultEl.className = 'quiz-result ' + (score === 3 ? 'quiz-result--perfect' : score >= 2 ? 'quiz-result--good' : 'quiz-result--ok');

  document.getElementById('quizSubmit').style.display = 'none';
  checkAndAwardBadges();
  renderHubArticles();
}

function closeArticleModal() {
  const modal = document.getElementById('articleModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
