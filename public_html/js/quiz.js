/* Find Your Colour Quiz
   5 questions → tag-based scoring against the Octagreen palette
   → recommend top 6 colours → deep-link to visualizer.
*/
(function () {
  'use strict';

  // Tagged palette
  var palette = [
    { name: 'Cloud Drift',     code: '#F4F0E8', tags: ['light','neutral','calm','versatile','bright'] },
    { name: 'Coconut',         code: '#F5F1E8', tags: ['light','neutral','warm','calm','bright'] },
    { name: 'Linen White',     code: '#F1ECDF', tags: ['light','neutral','warm','calm','bright'] },
    { name: 'Pearl Mist',      code: '#EDEDE6', tags: ['light','neutral','cool','calm','sophisticated'] },
    { name: 'Soft Vanilla',    code: '#F4EBD5', tags: ['light','warm','cozy','bright'] },
    { name: 'Pure Snow',       code: '#FFFFFF', tags: ['light','neutral','bright','clean','versatile'] },

    { name: 'Forest Whisper',  code: '#5C8362', tags: ['cool','bold','sophisticated','calm','natural'] },
    { name: 'Sage Garden',     code: '#A4B79B', tags: ['light','cool','calm','natural','versatile'] },
    { name: 'Mint Mojito',     code: '#BFD4C0', tags: ['light','cool','calm','playful','natural'] },
    { name: 'Eucalyptus',      code: '#7C9A85', tags: ['cool','calm','natural','sophisticated'] },
    { name: 'Tea Leaf',        code: '#506B4D', tags: ['cool','bold','sophisticated','natural','dark'] },
    { name: 'Aloe Light',      code: '#D5E2C7', tags: ['light','cool','playful','natural'] },
    { name: 'Olive Grove',     code: '#6F7A4A', tags: ['cool','sophisticated','natural','warm'] },
    { name: 'Pistachio',       code: '#C2D6A4', tags: ['light','cool','playful','natural'] },

    { name: 'Coastal Mist',    code: '#A9C2CC', tags: ['light','cool','calm','sophisticated'] },
    { name: 'Ocean Depth',     code: '#365C73', tags: ['cool','bold','sophisticated','dark'] },
    { name: 'Sky Whisper',     code: '#CFE0E8', tags: ['light','cool','calm','playful'] },
    { name: 'Indigo Eve',      code: '#2B3B5C', tags: ['cool','bold','sophisticated','dark'] },
    { name: 'Powder Blue',     code: '#B8D4DD', tags: ['light','cool','calm','playful'] },
    { name: 'Lagoon',          code: '#5A8FA0', tags: ['cool','sophisticated','calm'] },

    { name: 'Terracotta',      code: '#C5704F', tags: ['warm','bold','energetic','cozy'] },
    { name: 'Sunset Apricot',  code: '#E5B286', tags: ['warm','playful','cozy','bright'] },
    { name: 'Amber Glow',      code: '#D49A4F', tags: ['warm','energetic','cozy','bright'] },
    { name: 'Bronze Earth',    code: '#8C6442', tags: ['warm','sophisticated','cozy','natural'] },
    { name: 'Saffron',         code: '#E2A23F', tags: ['warm','energetic','bright','playful'] },
    { name: 'Cinnamon',        code: '#A36645', tags: ['warm','cozy','bold'] },
    { name: 'Rose Quartz',     code: '#D9A8A1', tags: ['light','warm','calm','playful'] },
    { name: 'Coral Reef',      code: '#E8907E', tags: ['warm','energetic','playful','bright'] },

    { name: 'Cement Soft',     code: '#B8B6B0', tags: ['neutral','sophisticated','calm','versatile'] },
    { name: 'Rain Cloud',      code: '#9BA0A1', tags: ['neutral','cool','sophisticated'] },
    { name: 'Charcoal',        code: '#3F4344', tags: ['dark','bold','sophisticated'] },
    { name: 'Stone Wash',      code: '#C4C0B8', tags: ['neutral','calm','sophisticated','versatile'] },
    { name: 'Slate Whisper',   code: '#7C7E7B', tags: ['neutral','sophisticated','calm','dark'] },
    { name: 'Pewter',          code: '#909393', tags: ['neutral','cool','sophisticated'] },
  ];

  // ---------------------------------------------------------
  // Questions
  // ---------------------------------------------------------
  var questions = [
    {
      title: 'Which space are you painting?',
      sub: "We'll tune the palette to suit it.",
      options: [
        { label: '🛋 Living room',  tags: ['versatile','sophisticated'] },
        { label: '🛏 Bedroom',     tags: ['calm','cozy'] },
        { label: '💼 Home office',  tags: ['cool','sophisticated','calm'] },
        { label: '🍳 Kitchen',     tags: ['bright','warm','clean'] },
        { label: "🧸 Kid's room",  tags: ['playful','bright'] },
        { label: '🛁 Bathroom',    tags: ['light','clean','cool'] },
        { label: '🏠 Exterior',    tags: ['natural','bold'] },
      ],
    },
    {
      title: 'What mood are you going for?',
      sub: "Pick the one that resonates most.",
      options: [
        { label: '🧘 Calm and serene',     tags: ['calm','light','cool'] },
        { label: '⚡ Energetic and lively',  tags: ['energetic','bright','warm'] },
        { label: '🍷 Sophisticated and refined', tags: ['sophisticated','dark','bold'] },
        { label: '🔥 Cozy and warm',         tags: ['cozy','warm'] },
        { label: '☀ Bright and fresh',      tags: ['bright','light','clean'] },
      ],
    },
    {
      title: 'How much natural light does the space get?',
      sub: "Darker rooms benefit from lighter colours.",
      options: [
        { label: '☀ Lots of light all day',  tags: ['bold','dark','sophisticated'] },
        { label: '🌤 Decent — a few hours',   tags: ['versatile','calm','natural'] },
        { label: '🌙 Not much / north-facing', tags: ['light','bright','clean'] },
      ],
    },
    {
      title: 'Accent walls?',
      sub: "Do you want a contrast wall, or one harmonious tone?",
      options: [
        { label: '✨ Bold accent wall — make it pop',     tags: ['bold','dark','sophisticated'] },
        { label: '🎨 Subtle tonal — same family',         tags: ['versatile','calm'] },
        { label: '🤍 Single colour all around',           tags: ['clean','calm','versatile'] },
      ],
    },
    {
      title: 'Who lives there?',
      sub: "Helps us pick washable, kid-proof or showpiece colours.",
      options: [
        { label: '👨‍👩‍👧 Family with kids',   tags: ['playful','versatile','warm'] },
        { label: '💑 Couple',               tags: ['sophisticated','cozy'] },
        { label: '🧍 Solo',                 tags: ['bold','sophisticated'] },
        { label: '🥂 Hosting often',        tags: ['warm','sophisticated','energetic'] },
      ],
    },
  ];

  // ---------------------------------------------------------
  // State
  // ---------------------------------------------------------
  var state = {
    step: 0,         // 0..questions.length (last is result)
    tags: {},        // { tag: count }
  };

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  function track(name, params) {
    if (window.dataLayer) window.dataLayer.push(Object.assign({ event: name }, params || {}));
  }

  function render() {
    var stage = document.getElementById('quiz-stage');
    if (!stage) return;
    var bar = document.getElementById('quiz-progress-bar');
    if (bar) bar.style.width = ((state.step) / questions.length * 100) + '%';

    if (state.step >= questions.length) return renderResult();

    var q = questions[state.step];
    stage.innerHTML = '<div class="quiz-step">' +
      '<div class="quiz-step-num">Question ' + (state.step + 1) + ' / ' + questions.length + '</div>' +
      '<h2>' + q.title + '</h2>' +
      '<p class="text-muted">' + q.sub + '</p>' +
      '<div class="quiz-options">' +
        q.options.map(function (opt, i) {
          return '<button class="quiz-option" data-opt="' + i + '">' + opt.label + '</button>';
        }).join('') +
      '</div>' +
      (state.step > 0 ? '<button class="btn btn-ghost quiz-back">← Back</button>' : '') +
    '</div>';
    stage.querySelectorAll('.quiz-option').forEach(function (b) {
      b.addEventListener('click', function () { selectOption(parseInt(b.getAttribute('data-opt'), 10)); });
    });
    var back = stage.querySelector('.quiz-back');
    if (back) back.addEventListener('click', goBack);
    // animate in
    requestAnimationFrame(function () { stage.classList.add('is-in'); });
    setTimeout(function () { stage.classList.remove('is-in'); }, 400);
  }

  function selectOption(idx) {
    var q = questions[state.step];
    var opt = q.options[idx];
    opt.tags.forEach(function (t) { state.tags[t] = (state.tags[t] || 0) + 1; });
    track('quiz_answer', { step: state.step, tag: opt.tags.join(',') });
    state.step++;
    render();
  }

  function goBack() {
    if (state.step === 0) return;
    state.step--;
    // recompute tags from scratch by replaying — simpler: just clear
    state.tags = {};
    render();
  }

  function scoreColour(p) {
    var s = 0;
    var tagList = Object.keys(state.tags);
    p.tags.forEach(function (t) {
      if (state.tags[t]) s += state.tags[t];
    });
    return s;
  }

  function renderResult() {
    var stage = document.getElementById('quiz-stage');
    if (!stage) return;
    track('quiz_complete');

    var ranked = palette.map(function (p) { return { p: p, score: scoreColour(p) }; });
    ranked.sort(function (a, b) { return b.score - a.score; });
    var top = ranked.slice(0, 6).map(function (r) { return r.p; });

    var heroBack = top[0];
    var heroAccent = top.find(function (p) {
      // find one that's tonally different from hero
      var diff = colourDistance(p.code, heroBack.code);
      return diff > 80;
    }) || top[1];

    var visUrl = 'visualizer.html?back=' + heroBack.code.replace('#','') + '&accent=' + heroAccent.code.replace('#','');

    var bar = document.getElementById('quiz-progress-bar');
    if (bar) bar.style.width = '100%';

    stage.innerHTML = '<div class="quiz-step quiz-result">' +
      '<div class="quiz-step-num">All done!</div>' +
      '<h2>Here\'s your palette</h2>' +
      '<p class="text-muted">Based on your answers, these Octagreen shades suit your space best.</p>' +
      '<div class="quiz-palette">' +
        top.map(function (p, i) {
          return '<div class="quiz-palette-card" style="--cc:' + p.code + '">' +
            '<div class="quiz-palette-chip" style="background:' + p.code + '"></div>' +
            '<div class="quiz-palette-info">' +
              '<div class="quiz-palette-name">' + p.name + '</div>' +
              '<div class="quiz-palette-code">' + p.code + '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
      '<div class="quiz-suggested">' +
        '<div><strong>Recommended pairing:</strong></div>' +
        '<div style="display:flex;gap:1rem;align-items:center;margin-top:.5rem">' +
          '<div><span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:' + heroBack.code + ';vertical-align:middle;margin-right:.5rem;border:1px solid var(--c-line)"></span><strong>' + heroBack.name + '</strong> as the main wall</div>' +
        '</div>' +
        '<div style="display:flex;gap:1rem;align-items:center;margin-top:.5rem">' +
          '<div><span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:' + heroAccent.code + ';vertical-align:middle;margin-right:.5rem;border:1px solid var(--c-line)"></span><strong>' + heroAccent.name + '</strong> as the accent</div>' +
        '</div>' +
      '</div>' +
      '<div class="quiz-actions">' +
        '<a href="' + visUrl + '" class="btn btn-primary btn-lg" data-track="quiz_to_visualizer">🎨 See it on a virtual room</a>' +
        '<button class="btn btn-outline btn-lg" id="quiz-restart">↺ Take it again</button>' +
      '</div>' +
    '</div>';

    var restart = document.getElementById('quiz-restart');
    if (restart) restart.addEventListener('click', function () {
      state.step = 0; state.tags = {}; render();
    });
  }

  function colourDistance(a, b) {
    var ah = a.replace('#',''), bh = b.replace('#','');
    if (ah.length === 3) ah = ah[0]+ah[0]+ah[1]+ah[1]+ah[2]+ah[2];
    if (bh.length === 3) bh = bh[0]+bh[0]+bh[1]+bh[1]+bh[2]+bh[2];
    var dr = parseInt(ah.substr(0,2),16) - parseInt(bh.substr(0,2),16);
    var dg = parseInt(ah.substr(2,2),16) - parseInt(bh.substr(2,2),16);
    var db = parseInt(ah.substr(4,2),16) - parseInt(bh.substr(4,2),16);
    return Math.sqrt(dr*dr + dg*dg + db*db);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('quiz-stage')) return;
    render();
  });
})();
