/* Paint Coverage Calculator
   Live-updating estimate. Reads sliders + inputs, computes
   wall area, paint litres, recommended pack mix, and renders a
   live SVG floor plan as a visual confirmation.
   No prices anywhere — material requirement only.
*/
(function () {
  'use strict';

  // Coverage rates (sqft per litre, per coat)
  var products = {
    'gulmohar':   { name: 'Gulmohar Economy Interior',   coverage: 100, type: 'interior' },
    'daffodil':   { name: 'Daffodil Premium Interior',   coverage: 115, type: 'interior' },
    'magicshine': { name: 'Magic Shine Luxury Interior', coverage: 125, type: 'interior' },
    'aura':       { name: 'Aura Superior Exterior',      coverage: 65,  type: 'exterior' },
    'allweather': { name: 'All Weather Exterior',        coverage: 75,  type: 'exterior' },
    'ultraguard': { name: 'Ultra Guard Waterproof',      coverage: 75,  type: 'exterior' },
    'fc-int':     { name: 'First Coat Interior Primer',  coverage: 140, type: 'primer' },
    'fc-ext':     { name: 'First Coat Exterior Primer',  coverage: 125, type: 'primer' },
  };

  var state = {
    length: 4, width: 4, height: 3,
    doors: 1, windows: 2,
    coats: 2,
    productKey: 'daffodil',
    units: 'm',
    includePrimer: true,
  };

  var DOOR_AREA_M2 = 1.9;
  var WINDOW_AREA_M2 = 1.4;
  var SQFT_PER_M2 = 10.7639;

  var PACKS = [
    { size: 20, label: '20 L' },
    { size: 10, label: '10 L' },
    { size: 4,  label: '4 L'  },
    { size: 1,  label: '1 L'  },
  ];

  // ---------------------------------------------------------
  // Compute
  // ---------------------------------------------------------
  function compute() {
    var L = state.length, W = state.width, H = state.height;
    if (state.units === 'ft') { L = L * 0.3048; W = W * 0.3048; H = H * 0.3048; }
    var perimeter = 2 * (L + W);
    var grossWall = perimeter * H;
    var deductions = (state.doors * DOOR_AREA_M2) + (state.windows * WINDOW_AREA_M2);
    var netWall = Math.max(0, grossWall - deductions);
    var netWallSqft = netWall * SQFT_PER_M2;
    var ceiling = L * W;
    var ceilingSqft = ceiling * SQFT_PER_M2;
    var totalSqft = netWallSqft + ceilingSqft;

    var product = products[state.productKey];
    var coatedSqft = totalSqft * state.coats;
    var litres = coatedSqft / product.coverage;

    var primerProductKey = product.type === 'exterior' ? 'fc-ext' : 'fc-int';
    var primerProduct = products[primerProductKey];
    var primerLitres = state.includePrimer ? (totalSqft / primerProduct.coverage) : 0;

    var packs = recommendPacks(litres);
    var primerPacks = recommendPacks(primerLitres);

    return {
      L: L, W: W, H: H,
      totalSqft: totalSqft,
      coats: state.coats,
      product: product,
      litres: litres,
      primerProduct: primerProduct,
      primerLitres: primerLitres,
      packs: packs,
      primerPacks: primerPacks,
    };
  }

  function recommendPacks(litres) {
    if (litres <= 0) return [];
    var remaining = Math.ceil(litres);
    var picks = {};
    PACKS.forEach(function (p) {
      var qty = Math.floor(remaining / p.size);
      if (qty > 0) {
        picks[p.size] = (picks[p.size] || 0) + qty;
        remaining -= qty * p.size;
      }
    });
    if (remaining > 0) picks[1] = (picks[1] || 0) + remaining;
    return Object.keys(picks).map(function (s) {
      var size = parseInt(s, 10);
      return { size: size, label: size + ' L', qty: picks[s] };
    }).sort(function (a, b) { return b.size - a.size; });
  }

  function fmtL(n) { return n.toFixed(1) + ' L'; }

  // ---------------------------------------------------------
  // Floor plan (live SVG)
  // ---------------------------------------------------------
  function renderFloorplan(r) {
    var host = document.getElementById('calc-floorplan');
    if (!host) return;
    // Scale to fit a 360×220 box
    var maxW = 360, maxH = 220;
    var pad = 28;
    var L_m = r.L, W_m = r.W;
    var ratio = Math.min((maxW - 2 * pad) / L_m, (maxH - 2 * pad) / W_m);
    var rw = L_m * ratio;
    var rh = W_m * ratio;
    var rx = (maxW - rw) / 2;
    var ry = (maxH - rh) / 2;

    // Door + window markers placed equally along the longest wall
    var doors = state.doors;
    var windows = state.windows;
    var markers = '';
    var xs = function (i, n) { return rx + (rw * (i + 0.5) / n); };
    for (var d = 0; d < doors; d++) {
      var dx = xs(d, doors);
      markers += '<rect x="' + (dx - 7) + '" y="' + (ry + rh - 2) + '" width="14" height="6" fill="#7d5a3c"/>';
      markers += '<path d="M ' + (dx - 7) + ' ' + (ry + rh) + ' Q ' + (dx + 7) + ' ' + (ry + rh) + ' ' + (dx + 7) + ' ' + (ry + rh - 14) + '" fill="none" stroke="rgba(125, 90, 60, 0.4)" stroke-width="1.5" stroke-dasharray="2 2"/>';
    }
    var ws = function (i, n) { return rx + (rw * (i + 0.5) / n); };
    for (var w = 0; w < windows; w++) {
      var wx = ws(w, windows);
      markers += '<rect x="' + (wx - 9) + '" y="' + (ry - 3) + '" width="18" height="6" fill="#7fbfdc" stroke="#fff" stroke-width="1"/>';
    }

    var dim = function (text, x, y) {
      return '<text x="' + x + '" y="' + y + '" fill="var(--c-muted)" font-family="var(--font-display)" font-weight="600" font-size="11" text-anchor="middle">' + text + '</text>';
    };
    var unit = state.units;
    var labelL = state.length.toFixed(1) + ' ' + unit;
    var labelW = state.width.toFixed(1) + ' ' + unit;

    host.innerHTML = '<svg viewBox="0 0 ' + maxW + ' ' + maxH + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="' + rx + '" y="' + ry + '" width="' + rw + '" height="' + rh + '" fill="rgba(255,255,255,0.92)" stroke="rgba(255,255,255,0.6)" stroke-width="2" rx="4"/>' +
      '<rect x="' + rx + '" y="' + ry + '" width="' + rw + '" height="' + rh + '" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-dasharray="4 4"/>' +
      markers +
      dim(labelL, rx + rw / 2, ry - 8) +
      '<g transform="translate(' + (rx - 8) + ',' + (ry + rh / 2) + ') rotate(-90)">' + dim(labelW, 0, 4) + '</g>' +
    '</svg>';
  }

  // ---------------------------------------------------------
  // Render results
  // ---------------------------------------------------------
  function render() {
    var r = compute();
    set('calc-total-sqft', Math.round(r.totalSqft).toLocaleString('en-IN'));
    set('calc-litres', fmtL(r.litres));
    set('calc-primer-litres', fmtL(r.primerLitres));
    set('calc-product-name', r.product.name);
    var packsEl = document.getElementById('calc-packs');
    if (packsEl) packsEl.innerHTML = r.packs.length ? r.packs.map(function (p) { return p.qty + ' × ' + p.label; }).join(' + ') : '—';
    var primerPacksEl = document.getElementById('calc-primer-packs');
    if (primerPacksEl) primerPacksEl.innerHTML = state.includePrimer && r.primerPacks.length ? r.primerPacks.map(function (p) { return p.qty + ' × ' + p.label; }).join(' + ') : '—';
    var coatsEl = document.getElementById('calc-coats-val');
    if (coatsEl) coatsEl.textContent = state.coats;
    renderFloorplan(r);
  }
  function set(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

  // ---------------------------------------------------------
  // Wire inputs
  // ---------------------------------------------------------
  function wire() {
    bindRange('len', 'length');
    bindRange('wid', 'width');
    bindRange('hgt', 'height');
    bindRange('doors', 'doors');
    bindRange('windows', 'windows');

    document.querySelectorAll('[name="coats"]').forEach(function (r) {
      r.addEventListener('change', function () {
        state.coats = parseInt(r.value, 10);
        document.querySelectorAll('label[data-coats-label]').forEach(function (lbl) {
          lbl.classList.toggle('is-active', lbl.getAttribute('data-coats-label') === r.value);
        });
        render();
      });
    });
    var prod = document.getElementById('calc-product');
    if (prod) prod.addEventListener('change', function () { state.productKey = prod.value; render(); });
    var primer = document.getElementById('calc-primer-toggle');
    if (primer) primer.addEventListener('change', function () { state.includePrimer = primer.checked; render(); });

    document.querySelectorAll('[name="units"]').forEach(function (r) {
      r.addEventListener('change', function () {
        if (r.value === state.units) return;
        // Convert current values to new unit
        var conv = r.value === 'ft' ? 3.281 : 1 / 3.281;
        state.length = +(state.length * conv).toFixed(1);
        state.width = +(state.width * conv).toFixed(1);
        state.height = +(state.height * conv).toFixed(1);
        state.units = r.value;

        var L = document.getElementById('len'), W = document.getElementById('wid'), H = document.getElementById('hgt');
        if (state.units === 'ft') {
          L.min = '5'; L.max = '50'; L.step = '1';
          W.min = '5'; W.max = '50'; W.step = '1';
          H.min = '6'; H.max = '14'; H.step = '0.5';
        } else {
          L.min = '1.5'; L.max = '15'; L.step = '0.5';
          W.min = '1.5'; W.max = '15'; W.step = '0.5';
          H.min = '2'; H.max = '4.5'; H.step = '0.1';
        }
        L.value = state.length; W.value = state.width; H.value = state.height;
        document.querySelector('[data-val-for="len"]').textContent = state.length + ' ' + state.units;
        document.querySelector('[data-val-for="wid"]').textContent = state.width + ' ' + state.units;
        document.querySelector('[data-val-for="hgt"]').textContent = state.height + ' ' + state.units;
        render();
      });
    });

    var ctaWA = document.getElementById('calc-share');
    if (ctaWA) ctaWA.addEventListener('click', function () {
      var r = compute();
      var msg = 'Hi Octagreen, I used your calculator. Total area: ' + Math.round(r.totalSqft) + ' sqft. ' +
        'Paint: ' + r.product.name + ' — ' + fmtL(r.litres) + ' (' + r.packs.map(function (p) { return p.qty + '×' + p.label; }).join(' + ') + '). Can you confirm and quote me?';
      window.open('https://wa.me/918606511141?text=' + encodeURIComponent(msg), '_blank');
      if (window.dataLayer) window.dataLayer.push({ event: 'calculator_whatsapp', sqft: Math.round(r.totalSqft) });
    });
    var ctaQuote = document.getElementById('calc-quote');
    if (ctaQuote) ctaQuote.addEventListener('click', function () {
      var r = compute();
      var url = 'contact-quote.html?area=' + encodeURIComponent(Math.round(r.totalSqft) + ' sqft') +
        '&service=' + encodeURIComponent(r.product.name);
      window.location.href = url;
      if (window.dataLayer) window.dataLayer.push({ event: 'calculator_quote', sqft: Math.round(r.totalSqft) });
    });
  }

  function bindRange(id, key) {
    var el = document.getElementById(id);
    if (!el) return;
    el.value = state[key];
    var span = document.querySelector('[data-val-for="' + id + '"]');
    var unit = (key === 'doors' || key === 'windows') ? '' : ' ' + state.units;
    if (span) span.textContent = state[key] + unit;
    el.addEventListener('input', function () {
      state[key] = parseFloat(el.value);
      var u = (key === 'doors' || key === 'windows') ? '' : ' ' + state.units;
      if (span) span.textContent = state[key] + u;
      render();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('calc-product')) return;
    wire();
    render();
  });
})();
