/* Wall Paint Visualizer
   - 7 SVG room scenes
   - Photo-upload mode with flood-fill + multiply blend
   - Time-of-day filter (day / dusk / evening)
   - URL-driven state (?scene=&back=&accent=)
   - Save PNG with watermark, copy share link, WhatsApp deep-link, quote deep-link
*/
(function () {
  'use strict';

  // ---------------------------------------------------------
  // Palette (synced with css/main.css colours.html page)
  // ---------------------------------------------------------
  var palette = [
    { name: 'Cloud Drift',     code: '#F4F0E8' },
    { name: 'Coconut',         code: '#F5F1E8' },
    { name: 'Linen White',     code: '#F1ECDF' },
    { name: 'Pearl Mist',      code: '#EDEDE6' },
    { name: 'Soft Vanilla',    code: '#F4EBD5' },
    { name: 'Pure Snow',       code: '#FFFFFF' },
    { name: 'Forest Whisper',  code: '#5C8362' },
    { name: 'Sage Garden',     code: '#A4B79B' },
    { name: 'Mint Mojito',     code: '#BFD4C0' },
    { name: 'Eucalyptus',      code: '#7C9A85' },
    { name: 'Tea Leaf',        code: '#506B4D' },
    { name: 'Aloe Light',      code: '#D5E2C7' },
    { name: 'Olive Grove',     code: '#6F7A4A' },
    { name: 'Pistachio',       code: '#C2D6A4' },
    { name: 'Coastal Mist',    code: '#A9C2CC' },
    { name: 'Ocean Depth',     code: '#365C73' },
    { name: 'Sky Whisper',     code: '#CFE0E8' },
    { name: 'Indigo Eve',      code: '#2B3B5C' },
    { name: 'Powder Blue',     code: '#B8D4DD' },
    { name: 'Lagoon',          code: '#5A8FA0' },
    { name: 'Terracotta',      code: '#C5704F' },
    { name: 'Sunset Apricot',  code: '#E5B286' },
    { name: 'Amber Glow',      code: '#D49A4F' },
    { name: 'Bronze Earth',    code: '#8C6442' },
    { name: 'Saffron',         code: '#E2A23F' },
    { name: 'Cinnamon',        code: '#A36645' },
    { name: 'Rose Quartz',     code: '#D9A8A1' },
    { name: 'Coral Reef',      code: '#E8907E' },
    { name: 'Cement Soft',     code: '#B8B6B0' },
    { name: 'Rain Cloud',      code: '#9BA0A1' },
    { name: 'Charcoal',        code: '#3F4344' },
    { name: 'Stone Wash',      code: '#C4C0B8' },
    { name: 'Slate Whisper',   code: '#7C7E7B' },
    { name: 'Pewter',          code: '#909393' },
  ];

  function nameForCode(code) {
    var n = (palette.find(function (p) { return p.code.toLowerCase() === (code || '').toLowerCase(); }) || {}).name;
    return n || code;
  }

  // ---------------------------------------------------------
  // SVG scene builders
  // ---------------------------------------------------------
  function defs() {
    return '<defs>' +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcdcf0"/><stop offset="1" stop-color="#e6f1f8"/></linearGradient>' +
      '<pattern id="wood" patternUnits="userSpaceOnUse" width="80" height="500"><rect width="80" height="500" fill="#a87c4f"/><line x1="0" y1="0" x2="0" y2="500" stroke="rgba(0,0,0,0.15)" stroke-width="2"/></pattern>' +
      '<pattern id="tile" patternUnits="userSpaceOnUse" width="40" height="40"><rect width="40" height="40" fill="#e8e6e0"/><rect width="40" height="40" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1"/></pattern>' +
    '</defs>';
  }

  function sceneLiving(o) {
    return '' +
      '<polygon points="0,500 800,500 800,360 0,360" fill="url(#wood)"/>' +
      '<rect x="0" y="0" width="800" height="360" fill="' + o.wallBack + '" data-surface="back-wall"/>' +
      '<polygon points="640,360 800,360 800,0 640,40" fill="' + o.wallAccent + '" data-surface="accent-wall"/>' +
      '<rect x="80" y="60" width="240" height="220" fill="url(#sky)"/>' +
      '<g stroke="#fff" stroke-width="6" fill="none"><rect x="80" y="60" width="240" height="220"/><line x1="200" y1="60" x2="200" y2="280"/><line x1="80" y1="170" x2="320" y2="170"/></g>' +
      '<rect x="450" y="80" width="120" height="100" fill="#fff" stroke="#b9a986" stroke-width="6"/>' +
      '<circle cx="495" cy="115" r="12" fill="#5C8362"/>' +
      '<polygon points="475,160 525,120 555,160" fill="#7C9A85"/>' +
      '<rect x="350" y="320" width="320" height="120" fill="#5a6e7c" rx="10"/>' +
      '<rect x="345" y="300" width="80" height="60" fill="#7a8e9c" rx="8"/>' +
      '<rect x="430" y="300" width="80" height="60" fill="#7a8e9c" rx="8"/>' +
      '<rect x="515" y="300" width="80" height="60" fill="#7a8e9c" rx="8"/>' +
      '<rect x="600" y="300" width="80" height="60" fill="#7a8e9c" rx="8"/>' +
      '<rect x="350" y="430" width="320" height="40" fill="#3a4d57" rx="6"/>' +
      '<line x1="290" y1="440" x2="290" y2="220" stroke="#3a3a3a" stroke-width="3"/>' +
      '<polygon points="270,180 310,180 320,220 260,220" fill="#F4A949"/>' +
      '<rect x="80" y="380" width="80" height="60" fill="#8b6f4e" rx="4"/>' +
      '<path d="M120,380 Q90,310 70,335 Q105,300 120,330 Q135,300 170,335 Q150,310 120,380 Z" fill="#5a8a4a"/>' +
      '<path d="M120,380 Q105,335 95,355 Q115,330 120,350 Q125,330 145,355 Q135,335 120,380 Z" fill="#6fa05c"/>';
  }

  function sceneBedroom(o) {
    return '' +
      '<polygon points="0,500 800,500 800,380 0,380" fill="#9b7048"/>' +
      '<rect x="0" y="0" width="800" height="380" fill="' + o.wallBack + '" data-surface="back-wall"/>' +
      '<rect x="220" y="0" width="380" height="380" fill="' + o.wallAccent + '" data-surface="accent-wall"/>' +
      '<rect x="240" y="180" width="340" height="160" fill="#7d5a3c" rx="8"/>' +
      '<rect x="250" y="190" width="320" height="140" fill="#8c684a" rx="6"/>' +
      '<rect x="200" y="340" width="420" height="100" fill="#fff"/>' +
      '<rect x="200" y="340" width="420" height="14" fill="#e7dcc6"/>' +
      '<rect x="240" y="280" width="100" height="60" fill="#fff" stroke="#e7dcc6" stroke-width="2" rx="6"/>' +
      '<rect x="370" y="280" width="100" height="60" fill="#fff" stroke="#e7dcc6" stroke-width="2" rx="6"/>' +
      '<rect x="490" y="290" width="80" height="50" fill="#F4A949" rx="6"/>' +
      '<rect x="120" y="350" width="80" height="90" fill="#5d4126" rx="4"/>' +
      '<rect x="620" y="350" width="80" height="90" fill="#5d4126" rx="4"/>' +
      '<rect x="148" y="320" width="24" height="30" fill="#3a3a3a"/>' +
      '<polygon points="135,320 185,320 195,290 125,290" fill="#F4A949"/>' +
      '<rect x="648" y="320" width="24" height="30" fill="#3a3a3a"/>' +
      '<polygon points="635,320 685,320 695,290 625,290" fill="#F4A949"/>' +
      '<rect x="60" y="80" width="120" height="160" fill="#fff" stroke="#b9a986" stroke-width="6"/>' +
      '<rect x="640" y="80" width="120" height="160" fill="#fff" stroke="#b9a986" stroke-width="6"/>' +
      '<circle cx="120" cy="160" r="35" fill="#A4B79B"/>' +
      '<rect x="660" y="120" width="80" height="80" fill="#5C8362"/>';
  }

  function sceneOffice(o) {
    return '' +
      '<polygon points="0,500 800,500 800,360 0,360" fill="url(#wood)"/>' +
      '<rect x="0" y="0" width="800" height="360" fill="' + o.wallBack + '" data-surface="back-wall"/>' +
      '<rect x="180" y="100" width="440" height="200" fill="' + o.wallAccent + '" data-surface="accent-wall"/>' +
      '<rect x="120" y="270" width="560" height="14" fill="#5d4126"/>' +
      '<rect x="140" y="284" width="120" height="180" fill="#3a3a3a"/>' +
      '<rect x="540" y="284" width="120" height="180" fill="#3a3a3a"/>' +
      '<rect x="320" y="160" width="180" height="110" fill="#1a1a1a" rx="4"/>' +
      '<rect x="328" y="166" width="164" height="98" fill="#365C73" rx="2"/>' +
      '<rect x="395" y="270" width="30" height="14" fill="#2a2a2a"/>' +
      '<rect x="370" y="282" width="80" height="6" fill="#444"/>' +
      '<ellipse cx="400" cy="500" rx="60" ry="10" fill="rgba(0,0,0,0.2)"/>' +
      '<rect x="355" y="380" width="90" height="20" fill="#3a3a3a" rx="4"/>' +
      '<rect x="385" y="400" width="30" height="60" fill="#3a3a3a"/>' +
      '<rect x="320" y="320" width="160" height="80" fill="#5a6e7c" rx="8"/>' +
      '<rect x="40" y="320" width="60" height="100" fill="#8b6f4e" rx="4"/>' +
      '<path d="M70,320 Q40,250 25,275 Q60,235 70,265 Q85,235 115,275 Q100,250 70,320 Z" fill="#5C8362"/>' +
      '<rect x="700" y="160" width="60" height="120" fill="#7d5a3c"/>' +
      '<rect x="700" y="160" width="60" height="30" fill="#a8865c"/>' +
      '<rect x="700" y="200" width="60" height="30" fill="#a8865c"/>' +
      '<rect x="700" y="240" width="60" height="30" fill="#a8865c"/>';
  }

  function sceneKitchen(o) {
    return '' +
      '<polygon points="0,500 800,500 800,400 0,400" fill="#cfd0d0"/>' +
      '<rect x="0" y="0" width="800" height="400" fill="' + o.wallBack + '" data-surface="back-wall"/>' +
      '<rect x="80" y="220" width="640" height="60" fill="' + o.wallAccent + '" data-surface="accent-wall"/>' +
      '<rect x="60" y="280" width="680" height="40" fill="#3a3a3a"/>' +
      '<rect x="60" y="320" width="680" height="80" fill="#7d5a3c"/>' +
      '<rect x="60" y="320" width="80" height="80" fill="#7d5a3c" stroke="#5d4126" stroke-width="2"/>' +
      '<rect x="160" y="320" width="80" height="80" fill="#7d5a3c" stroke="#5d4126" stroke-width="2"/>' +
      '<rect x="260" y="320" width="80" height="80" fill="#7d5a3c" stroke="#5d4126" stroke-width="2"/>' +
      '<rect x="500" y="320" width="80" height="80" fill="#7d5a3c" stroke="#5d4126" stroke-width="2"/>' +
      '<rect x="600" y="320" width="80" height="80" fill="#7d5a3c" stroke="#5d4126" stroke-width="2"/>' +
      '<rect x="120" y="60" width="240" height="160" fill="#a8865c" stroke="#7d5a3c" stroke-width="2"/>' +
      '<rect x="500" y="60" width="180" height="160" fill="#a8865c" stroke="#7d5a3c" stroke-width="2"/>' +
      '<line x1="240" y1="60" x2="240" y2="220" stroke="#7d5a3c" stroke-width="2"/>' +
      '<line x1="590" y1="60" x2="590" y2="220" stroke="#7d5a3c" stroke-width="2"/>' +
      '<rect x="380" y="320" width="100" height="80" fill="#1a1a1a"/>' +
      '<circle cx="400" cy="345" r="8" fill="#444"/>' +
      '<circle cx="430" cy="345" r="8" fill="#444"/>' +
      '<circle cx="400" cy="375" r="8" fill="#444"/>' +
      '<circle cx="430" cy="375" r="8" fill="#444"/>' +
      '<polygon points="370,80 490,80 470,160 390,160" fill="#3a3a3a"/>' +
      '<rect x="400" y="160" width="60" height="60" fill="#4a4a4a"/>';
  }

  function sceneBath(o) {
    return '' +
      '<polygon points="0,500 800,500 800,380 0,380" fill="url(#tile)"/>' +
      '<rect x="0" y="0" width="800" height="240" fill="' + o.wallBack + '" data-surface="back-wall"/>' +
      '<rect x="0" y="240" width="800" height="140" fill="' + o.wallAccent + '" data-surface="accent-wall"/>' +
      '<line x1="0" y1="280" x2="800" y2="280" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>' +
      '<line x1="0" y1="320" x2="800" y2="320" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>' +
      '<line x1="200" y1="240" x2="200" y2="380" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>' +
      '<line x1="400" y1="240" x2="400" y2="380" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>' +
      '<line x1="600" y1="240" x2="600" y2="380" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>' +
      '<rect x="160" y="280" width="240" height="100" fill="#fff" rx="6"/>' +
      '<ellipse cx="280" cy="320" rx="60" ry="14" fill="#cce5f5"/>' +
      '<rect x="240" y="290" width="80" height="40" fill="#cfd0d0" rx="4"/>' +
      '<rect x="180" y="80" width="200" height="160" fill="#cce5f5" stroke="#fff" stroke-width="6"/>' +
      '<rect x="270" y="50" width="20" height="30" fill="#444"/>' +
      '<circle cx="280" cy="60" r="14" fill="#F4A949" opacity="0.85"/>' +
      '<rect x="500" y="260" width="240" height="120" fill="#fff" rx="40"/>' +
      '<rect x="520" y="280" width="200" height="80" fill="#cce5f5" rx="20"/>' +
      '<rect x="640" y="60" width="80" height="120" fill="#fff" stroke="#cfd0d0" stroke-width="2"/>';
  }

  function sceneKids(o) {
    return '' +
      '<polygon points="0,500 800,500 800,380 0,380" fill="url(#wood)"/>' +
      '<rect x="0" y="0" width="800" height="380" fill="' + o.wallBack + '" data-surface="back-wall"/>' +
      '<rect x="100" y="0" width="400" height="380" fill="' + o.wallAccent + '" data-surface="accent-wall"/>' +
      '<circle cx="200" cy="120" r="40" fill="#F4A949" opacity="0.9"/>' +
      '<circle cx="220" cy="120" r="35" fill="' + o.wallAccent + '"/>' +
      '<g fill="#fff" opacity="0.9">' +
        '<circle cx="350" cy="80" r="4"/>' +
        '<circle cx="380" cy="160" r="3"/>' +
        '<circle cx="430" cy="100" r="4"/>' +
        '<circle cx="120" cy="180" r="3"/>' +
        '<circle cx="160" cy="240" r="3"/>' +
        '<circle cx="450" cy="220" r="3"/>' +
      '</g>' +
      '<rect x="180" y="280" width="280" height="100" fill="#fff"/>' +
      '<rect x="180" y="280" width="280" height="14" fill="#F4A949"/>' +
      '<rect x="200" y="240" width="80" height="50" fill="#fff" stroke="#e7dcc6" stroke-width="2" rx="6"/>' +
      '<rect x="500" y="320" width="160" height="60" fill="#5C8362"/>' +
      '<rect x="540" y="290" width="40" height="40" fill="#F4A949" rx="4"/>' +
      '<circle cx="600" cy="310" r="20" fill="#e11d48"/>' +
      '<rect x="540" y="100" width="200" height="14" fill="#7d5a3c"/>' +
      '<rect x="560" y="60" width="40" height="40" fill="#5C8362"/>' +
      '<rect x="620" y="50" width="40" height="50" fill="#365C73"/>' +
      '<circle cx="700" cy="80" r="20" fill="#F4A949"/>';
  }

  function sceneExterior(o) {
    return '' +
      '<rect x="0" y="0" width="800" height="500" fill="url(#sky)"/>' +
      '<rect x="0" y="380" width="800" height="120" fill="#7a9a4c"/>' +
      '<path d="M0,380 Q200,360 400,380 T800,380" fill="#88a85b"/>' +
      '<rect x="120" y="160" width="440" height="240" fill="' + o.wallBack + '" data-surface="back-wall"/>' +
      '<rect x="120" y="160" width="440" height="20" fill="' + o.wallAccent + '" data-surface="accent-wall"/>' +
      '<rect x="120" y="380" width="440" height="20" fill="' + o.wallAccent + '" data-surface="accent-wall"/>' +
      '<polygon points="100,160 580,160 540,80 140,80" fill="#7d5a3c"/>' +
      '<polygon points="100,160 580,160 540,80 140,80" fill="rgba(0,0,0,0.15)"/>' +
      '<rect x="300" y="280" width="80" height="120" fill="#5d4126"/>' +
      '<circle cx="370" cy="340" r="3" fill="#F4A949"/>' +
      '<rect x="160" y="220" width="80" height="80" fill="#cfe5f5" stroke="#fff" stroke-width="5"/>' +
      '<line x1="200" y1="220" x2="200" y2="300" stroke="#fff" stroke-width="3"/>' +
      '<line x1="160" y1="260" x2="240" y2="260" stroke="#fff" stroke-width="3"/>' +
      '<rect x="440" y="220" width="80" height="80" fill="#cfe5f5" stroke="#fff" stroke-width="5"/>' +
      '<line x1="480" y1="220" x2="480" y2="300" stroke="#fff" stroke-width="3"/>' +
      '<line x1="440" y1="260" x2="520" y2="260" stroke="#fff" stroke-width="3"/>' +
      '<rect x="560" y="240" width="140" height="160" fill="' + o.wallBack + '" data-surface="back-wall"/>' +
      '<rect x="580" y="280" width="100" height="100" fill="#3a3a3a" stroke="#fff" stroke-width="3"/>' +
      '<rect x="50" y="320" width="14" height="80" fill="#5d4126"/>' +
      '<circle cx="57" cy="310" r="50" fill="#5C8362"/>' +
      '<circle cx="40" cy="290" r="35" fill="#7C9A85"/>' +
      '<circle cx="80" cy="295" r="35" fill="#7C9A85"/>' +
      '<circle cx="700" cy="80" r="40" fill="#F4A949" opacity="0.85"/>';
  }

  var scenes = {
    living:   { label: 'Living Room', build: sceneLiving },
    bedroom:  { label: 'Bedroom',     build: sceneBedroom },
    office:   { label: 'Office',      build: sceneOffice },
    kitchen:  { label: 'Kitchen',     build: sceneKitchen },
    bath:     { label: 'Bathroom',    build: sceneBath },
    kids:     { label: "Kid's Room",  build: sceneKids },
    exterior: { label: 'Exterior',    build: sceneExterior },
  };

  var TIME_FILTERS = {
    day:     'none',
    dusk:    'sepia(0.18) saturate(1.05) brightness(0.92) contrast(1.05)',
    evening: 'sepia(0.32) saturate(0.9) brightness(0.7) contrast(1.1)',
  };

  // ---------------------------------------------------------
  // State
  // ---------------------------------------------------------
  var state = {
    mode: 'preset',          // 'preset' | 'photo'
    scene: 'living',
    surface: 'back-wall',
    colours: { 'back-wall': '#F4F0E8', 'accent-wall': '#5C8362' },
    lastChosen: { name: 'Cloud Drift', code: '#F4F0E8' },
    time: 'day',
    photo: null,             // { canvas, ctx, originalImageData, masks: [] }
  };

  function readURL() {
    var url = new URL(window.location.href);
    var s = url.searchParams.get('scene');
    var b = url.searchParams.get('back');
    var a = url.searchParams.get('accent');
    var t = url.searchParams.get('time');
    if (s && scenes[s]) state.scene = s;
    if (b && /^#?[0-9A-Fa-f]{6}$/.test(b)) state.colours['back-wall'] = b.startsWith('#') ? b : '#' + b;
    if (a && /^#?[0-9A-Fa-f]{6}$/.test(a)) state.colours['accent-wall'] = a.startsWith('#') ? a : '#' + a;
    if (t && TIME_FILTERS[t]) state.time = t;
  }

  function buildShareURL() {
    var url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('scene', state.scene);
    url.searchParams.set('back', state.colours['back-wall'].replace('#', ''));
    url.searchParams.set('accent', state.colours['accent-wall'].replace('#', ''));
    if (state.time !== 'day') url.searchParams.set('time', state.time);
    return url.toString();
  }

  // ---------------------------------------------------------
  // Render preset SVG scene
  // ---------------------------------------------------------
  function renderStage() {
    var stage = document.getElementById('vis-stage');
    if (!stage) return;
    if (state.mode === 'photo') return renderPhoto();

    var sceneBody = scenes[state.scene].build({
      wallBack: state.colours['back-wall'],
      wallAccent: state.colours['accent-wall'],
    });
    stage.style.filter = TIME_FILTERS[state.time];
    stage.innerHTML = '<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" id="vis-svg" preserveAspectRatio="xMidYMid meet">' + defs() + sceneBody + '</svg>';

    renderSummary();
  }

  function renderSummary() {
    var summary = document.getElementById('vis-summary');
    if (!summary) return;
    var b = state.colours['back-wall'];
    var a = state.colours['accent-wall'];
    summary.innerHTML =
      '<div><strong>Back wall:</strong> <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:' + b + ';vertical-align:middle;margin:0 4px;border:1px solid var(--c-line)"></span>' + nameForCode(b) + ' <span style="font-family:monospace;font-size:.85em;opacity:.8">' + b + '</span></div>' +
      '<div><strong>Accent:</strong> <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:' + a + ';vertical-align:middle;margin:0 4px;border:1px solid var(--c-line)"></span>' + nameForCode(a) + ' <span style="font-family:monospace;font-size:.85em;opacity:.8">' + a + '</span></div>';
  }

  function renderTabs() {
    var host = document.getElementById('vis-tabs');
    if (!host) return;
    if (state.mode === 'photo') { host.innerHTML = ''; host.style.display = 'none'; return; }
    host.style.display = '';
    host.innerHTML = Object.keys(scenes).map(function (key) {
      var active = key === state.scene ? ' is-active' : '';
      return '<button class="scene-tab' + active + '" data-scene="' + key + '">' + scenes[key].label + '</button>';
    }).join('');
    host.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { state.scene = b.getAttribute('data-scene'); renderTabs(); renderStage(); });
    });
  }

  function renderSurfacePicker() {
    var host = document.getElementById('vis-surfaces');
    if (!host) return;
    if (state.mode === 'photo') {
      host.innerHTML = '<p class="text-muted" style="font-size:.85rem;margin:0">In photo mode, just click a wall in the photo — we\'ll detect the area and apply your selected colour.</p>';
      return;
    }
    var surfaces = [
      { id: 'back-wall', label: 'Back wall' },
      { id: 'accent-wall', label: 'Accent / trim' },
    ];
    host.innerHTML = surfaces.map(function (s) {
      return '<button data-surface-id="' + s.id + '"' + (s.id === state.surface ? ' class="is-active"' : '') + '>' + s.label + '</button>';
    }).join('');
    host.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { state.surface = b.getAttribute('data-surface-id'); renderSurfacePicker(); });
    });
  }

  function renderSwatches() {
    var host = document.getElementById('vis-swatches');
    if (!host) return;
    var activeColour = state.mode === 'preset' ? state.colours[state.surface] : state.lastChosen.code;
    host.innerHTML = palette.map(function (p) {
      var isActive = (activeColour || '').toLowerCase() === p.code.toLowerCase() ? ' is-active' : '';
      return '<button class="' + isActive + '" style="background:' + p.code + '" data-color="' + p.code + '" data-name="' + p.name + '" title="' + p.name + ' · ' + p.code + '" aria-label="' + p.name + '"></button>';
    }).join('');
    host.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var code = b.getAttribute('data-color');
        var name = b.getAttribute('data-name');
        state.lastChosen = { name: name, code: code };
        if (state.mode === 'preset') {
          state.colours[state.surface] = code;
          renderStage();
        } else {
          // photo mode — colour will apply on next click on canvas
          renderSummary();
        }
        renderSwatches();
        track('visualizer_apply', { surface: state.surface, color: code });
      });
    });
  }

  // ---------------------------------------------------------
  // Photo upload mode
  // ---------------------------------------------------------
  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll('.vis-mode-tab').forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-mode') === mode); });
    var photoUI = document.getElementById('vis-photo-upload');
    if (photoUI) photoUI.hidden = (mode !== 'photo');
    renderTabs();
    renderSurfacePicker();
    if (mode === 'preset') {
      renderStage();
    } else {
      renderPhoto();
    }
    renderSwatches();
  }

  function handlePhotoFile(file) {
    if (!file || !/^image\//.test(file.type)) {
      alert('Please choose a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Photo is over 10 MB. Please choose a smaller image.');
      return;
    }
    var reader = new FileReader();
    reader.onload = function (ev) {
      var img = new Image();
      img.onload = function () {
        var maxW = 1200, maxH = 800;
        var ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        var w = Math.round(img.width * ratio);
        var h = Math.round(img.height * ratio);
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        state.photo = {
          canvas: canvas,
          ctx: ctx,
          original: ctx.getImageData(0, 0, w, h),
          masks: [],
        };
        var tools = document.getElementById('vis-photo-tools');
        if (tools) tools.hidden = false;
        renderPhoto();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function renderPhoto() {
    var stage = document.getElementById('vis-stage');
    if (!stage) return;
    stage.style.filter = TIME_FILTERS[state.time];
    if (!state.photo) {
      stage.innerHTML = '<div class="vis-photo-empty"><p class="text-muted text-center" style="padding:3rem 1rem">Upload a photo above to get started.</p></div>';
      return;
    }
    // Draw masks fresh each render
    var photo = state.photo;
    var w = photo.canvas.width, h = photo.canvas.height;
    var imgData = new ImageData(new Uint8ClampedArray(photo.original.data), w, h);
    var data = imgData.data;
    for (var i = 0; i < photo.masks.length; i++) {
      var mask = photo.masks[i];
      var col = hexToRgb(mask.colour);
      var visited = mask.mask;
      for (var p = 0; p < visited.length; p++) {
        if (!visited[p]) continue;
        var di = p * 4;
        // multiply blend
        data[di]     = (data[di]     * col.r) / 255;
        data[di + 1] = (data[di + 1] * col.g) / 255;
        data[di + 2] = (data[di + 2] * col.b) / 255;
      }
    }
    photo.ctx.putImageData(imgData, 0, 0);
    // Mount canvas into stage (replace previous)
    stage.innerHTML = '';
    photo.canvas.id = 'vis-photo-canvas';
    photo.canvas.style.width = '100%';
    photo.canvas.style.height = 'auto';
    photo.canvas.style.borderRadius = '12px';
    photo.canvas.style.cursor = 'crosshair';
    stage.appendChild(photo.canvas);
    photo.canvas.onclick = onPhotoClick;
    renderSummary();
  }

  function onPhotoClick(e) {
    if (!state.photo) return;
    var canvas = state.photo.canvas;
    var rect = canvas.getBoundingClientRect();
    var sx = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    var sy = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    if (sx < 0 || sy < 0 || sx >= canvas.width || sy >= canvas.height) return;
    showBusy(true);
    // Yield a frame so the spinner actually paints before BFS blocks
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        try {
          var visited = floodFill(state.photo.original, sx, sy, 30);
          state.photo.masks.push({ mask: visited, colour: state.lastChosen.code });
          renderPhoto();
          track('visualizer_photo_paint', { color: state.lastChosen.code });
        } finally {
          showBusy(false);
        }
      });
    });
  }

  function showBusy(on) {
    var stage = document.getElementById('vis-stage');
    if (!stage) return;
    var busy = stage.querySelector('.visualizer-busy');
    if (!busy) {
      busy = document.createElement('div');
      busy.className = 'visualizer-busy';
      busy.innerHTML = '<div class="spinner"></div>Detecting wall…';
      stage.appendChild(busy);
    }
    busy.classList.toggle('is-active', on);
  }

  function floodFill(imageData, sx, sy, tolerance) {
    var w = imageData.width, h = imageData.height;
    var data = imageData.data;
    var startIdx = (sy * w + sx) * 4;
    var sR = data[startIdx], sG = data[startIdx + 1], sB = data[startIdx + 2];
    var visited = new Uint8Array(w * h);
    var queue = new Int32Array(w * h * 2);
    var head = 0, tail = 0;
    queue[tail++] = sx; queue[tail++] = sy;
    var tol2 = tolerance * tolerance;
    while (head < tail) {
      var cx = queue[head++], cy = queue[head++];
      if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
      var pi = cy * w + cx;
      if (visited[pi]) continue;
      var di = pi * 4;
      var dr = data[di] - sR, dg = data[di + 1] - sG, db = data[di + 2] - sB;
      if (dr * dr + dg * dg + db * db > tol2) continue;
      visited[pi] = 1;
      if (tail < queue.length - 8) {
        queue[tail++] = cx + 1; queue[tail++] = cy;
        queue[tail++] = cx - 1; queue[tail++] = cy;
        queue[tail++] = cx; queue[tail++] = cy + 1;
        queue[tail++] = cx; queue[tail++] = cy - 1;
      }
    }
    return visited;
  }

  function hexToRgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return { r: parseInt(h.substr(0, 2), 16), g: parseInt(h.substr(2, 2), 16), b: parseInt(h.substr(4, 2), 16) };
  }

  // ---------------------------------------------------------
  // Save PNG
  // ---------------------------------------------------------
  function savePNG() {
    if (state.mode === 'preset') savePresetPNG();
    else savePhotoPNG();
  }

  function savePresetPNG() {
    var svg = document.getElementById('vis-svg');
    if (!svg) return;
    var data = new XMLSerializer().serializeToString(svg);
    var blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = 1600; canvas.height = 1000;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = TIME_FILTERS[state.time] === 'none' ? 'none' : TIME_FILTERS[state.time];
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(15, 42, 29, 0.6)';
      ctx.font = '600 28px sans-serif';
      ctx.fillText('Octagreen Nano · octagreennano.com', 24, canvas.height - 24);
      canvas.toBlob(function (b) {
        download(b, 'octagreen-' + state.scene + '.png');
        URL.revokeObjectURL(url);
      });
    };
    img.src = url;
    track('visualizer_save', { mode: 'preset', scene: state.scene });
  }

  function savePhotoPNG() {
    if (!state.photo) return;
    var src = state.photo.canvas;
    var canvas = document.createElement('canvas');
    canvas.width = src.width; canvas.height = src.height;
    var ctx = canvas.getContext('2d');
    ctx.filter = TIME_FILTERS[state.time] === 'none' ? 'none' : TIME_FILTERS[state.time];
    ctx.drawImage(src, 0, 0);
    ctx.filter = 'none';
    ctx.fillStyle = 'rgba(15, 42, 29, 0.6)';
    ctx.font = '600 18px sans-serif';
    ctx.fillText('Octagreen Nano · octagreennano.com', 12, canvas.height - 12);
    canvas.toBlob(function (b) {
      download(b, 'octagreen-photo.png');
    });
    track('visualizer_save', { mode: 'photo' });
  }

  function download(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  // ---------------------------------------------------------
  // Share
  // ---------------------------------------------------------
  function copyShareLink() {
    var url = buildShareURL();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { toast('🔗 Share link copied!'); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      toast('🔗 Share link copied!');
    }
    track('visualizer_share_link');
  }

  function shareWhatsApp() {
    var msg;
    if (state.mode === 'preset') {
      msg = 'Hi Octagreen, I love this colour for my ' + scenes[state.scene].label.toLowerCase() + '! Back wall: ' +
        nameForCode(state.colours['back-wall']) + ' (' + state.colours['back-wall'] + '), accent: ' +
        nameForCode(state.colours['accent-wall']) + ' (' + state.colours['accent-wall'] + '). Preview: ' + buildShareURL();
    } else {
      msg = 'Hi Octagreen, I tried this colour on my photo: ' + nameForCode(state.lastChosen.code) + ' (' + state.lastChosen.code + '). Can you share a quote?';
    }
    window.open('https://wa.me/918606511141?text=' + encodeURIComponent(msg), '_blank');
    track('visualizer_whatsapp');
  }

  function getQuote() {
    var summary = scenes[state.scene] ? scenes[state.scene].label : 'Custom photo';
    summary += ' · back ' + state.colours['back-wall'] + ' · accent ' + state.colours['accent-wall'];
    var url = 'contact-quote.html?colour=' + encodeURIComponent(summary);
    window.location.href = url;
    track('visualizer_quote');
  }

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('is-visible'); });
    setTimeout(function () { t.classList.remove('is-visible'); setTimeout(function () { t.remove(); }, 400); }, 2200);
  }

  function track(name, params) {
    if (window.dataLayer) window.dataLayer.push(Object.assign({ event: name }, params || {}));
  }

  // ---------------------------------------------------------
  // Time-of-day
  // ---------------------------------------------------------
  function setTime(t) {
    state.time = t;
    document.querySelectorAll('.vis-time-tab').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-time') === t); });
    var stage = document.getElementById('vis-stage');
    if (stage) stage.style.filter = TIME_FILTERS[t];
    track('visualizer_time', { time: t });
  }

  // ---------------------------------------------------------
  // Boot
  // ---------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('vis-stage')) return;

    readURL();

    renderTabs();
    renderSurfacePicker();
    renderStage();
    renderSwatches();

    document.querySelectorAll('.vis-mode-tab').forEach(function (t) {
      t.addEventListener('click', function () { setMode(t.getAttribute('data-mode')); });
    });
    document.querySelectorAll('.vis-time-tab').forEach(function (t) {
      t.addEventListener('click', function () { setTime(t.getAttribute('data-time')); });
    });

    var saveBtn = document.getElementById('vis-save');
    var waBtn = document.getElementById('vis-wa');
    var quoteBtn = document.getElementById('vis-quote');
    var shareBtn = document.getElementById('vis-share-link');
    if (saveBtn) saveBtn.addEventListener('click', savePNG);
    if (waBtn) waBtn.addEventListener('click', shareWhatsApp);
    if (quoteBtn) quoteBtn.addEventListener('click', getQuote);
    if (shareBtn) shareBtn.addEventListener('click', copyShareLink);

    // Photo input wiring
    var fileInput = document.getElementById('vis-photo-input');
    var dropzone = document.getElementById('vis-photo-dropzone');
    var undoBtn = document.getElementById('vis-photo-undo');
    var resetBtn = document.getElementById('vis-photo-reset');
    var replaceBtn = document.getElementById('vis-photo-replace');
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files[0]) handlePhotoFile(fileInput.files[0]);
      });
    }
    if (dropzone) {
      ['dragover', 'drop'].forEach(function (ev) { dropzone.addEventListener(ev, function (e) { e.preventDefault(); }); });
      dropzone.addEventListener('dragover', function () { dropzone.classList.add('is-drag'); });
      dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('is-drag'); });
      dropzone.addEventListener('drop', function (e) {
        dropzone.classList.remove('is-drag');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handlePhotoFile(e.dataTransfer.files[0]);
      });
    }
    if (undoBtn) undoBtn.addEventListener('click', function () {
      if (state.photo && state.photo.masks.length) { state.photo.masks.pop(); renderPhoto(); }
    });
    if (resetBtn) resetBtn.addEventListener('click', function () {
      if (state.photo) { state.photo.masks = []; renderPhoto(); }
    });
    if (replaceBtn) replaceBtn.addEventListener('click', function () {
      if (fileInput) fileInput.click();
    });
  });
})();
