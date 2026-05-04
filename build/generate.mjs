// Static-site generator for Octagreen Nano
// Run: npm run build
// Emits all pages from a single source of truth.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE = 'https://www.octagreennano.com';

/* =========================================================
   Social media — replace these with the real URLs when ready.
   The user said they'd supply real links separately.
   ========================================================= */
const SOCIAL = {
  facebook:  'https://www.facebook.com/octagreennano/',
  instagram: 'https://www.instagram.com/octagreennano/',
  x:         'https://x.com/octagreennano',
  pinterest: 'https://www.pinterest.com/octagreennano/',
  youtube:   'https://www.youtube.com/@octagreennano',
  whatsapp:  'https://wa.me/918606511141',
};

/* =========================================================
   SVG icon library
   ========================================================= */
const ICON = {
  facebook:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.9l-.5 2.9h-2.5v7A10 10 0 0 0 22 12Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>',
  x:         '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>',
  pinterest: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345c-.09.375-.293 1.199-.334 1.366-.053.225-.172.273-.402.165-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0Z"/></svg>',
  youtube:   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  whatsapp:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.667 5.453l-.999 3.648 3.821-1.001zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>',
  phone:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>',
  mail:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  pin:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  star:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21l1.18-6.88-5-4.87 6.91-1.01L12 2z"/></svg>',
  shield:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
  leaf:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 9-9 4 0 7 3 7 7 0 5-4 9-9 9Z"/><path d="M2 22 19 5"/></svg>',
  award:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
  users:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="17" cy="7" r="3"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>',
  globe:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20"/><path d="M12 2a15 15 0 0 0 0 20"/></svg>',
  sun:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
  moon:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  arrowUp:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
};

/* =========================================================
   Picture helper — outputs <picture> with WebP first
   ========================================================= */
function pic(path, alt, opts = {}) {
  const idx = path.lastIndexOf('.');
  const base = path.substring(0, idx);
  const cls = opts.classes ? ` class="${opts.classes}"` : '';
  const loading = opts.loading === 'eager' ? '' : ' loading="lazy" decoding="async"';
  const width = opts.width ? ` width="${opts.width}"` : '';
  const height = opts.height ? ` height="${opts.height}"` : '';
  return `<picture><source srcset="${base}.webp" type="image/webp"><img src="${path}" alt="${alt}"${cls}${loading}${width}${height}></picture>`;
}

/* =========================================================
   Hero background — WebP with JPG fallback via image-set()
   ========================================================= */
function heroBg(filename) {
  const base = filename.replace(/\.(jpe?g|png)$/i, '');
  // Modern browsers use image-set; fallback uses .jpg url
  return `style="background-image: url('images/${base}.jpg'); background-image: image-set(url('images/${base}.webp') type('image/webp'), url('images/${base}.jpg') type('image/jpeg'));"`;
}

/* =========================================================
   No-flash theme initialization (runs before body render)
   ========================================================= */
const themeInit = `<script>(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();</script>`;

/* =========================================================
   GA4 placeholder — instructions to enable analytics later.
   Replace G-XXXXXXXXXX with real Measurement ID, uncomment.
   ========================================================= */
const ga4Placeholder = `
<!-- ============================================================
     ANALYTICS — Google Analytics 4
     1. Get your Measurement ID at https://analytics.google.com
     2. Replace G-XXXXXXXXXX below with your real ID
     3. Uncomment both <script> blocks
     The dataLayer events (theme_toggle, whatsapp_click, call_click,
     form_submit, etc.) are already pushed by js/main.js.
============================================================ -->
<!--
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
-->`;

/* =========================================================
   <head> chunk
   ========================================================= */
const head = ({ title, description, slug, ogImage = 'images/1920x960.jpg', extraJsonLd = '' }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="x-ua-compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#2D8E5F" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0E1814" media="(prefers-color-scheme: dark)">

<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${SITE}/${slug}">

<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${SITE}/${slug}">
<meta property="og:image" content="${SITE}/${ogImage}">
<meta property="og:site_name" content="Octagreen Nano Products India Pvt. Ltd.">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${SITE}/${ogImage}">

<link rel="icon" href="images/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="images/apple-touch-icon.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/main.css">

${themeInit}
${extraJsonLd}
${ga4Placeholder}
</head>
<body>
<div class="scroll-progress" aria-hidden="true"></div>`;

/* =========================================================
   Header chunk — used on every page
   ========================================================= */
const header = `
<div class="topbar">
  <div class="container topbar-flex">
    <div class="topbar-left">
      <span class="item">${ICON.phone} Toll-Free 1800 313 6949</span>
      <span class="item">${ICON.mail} mail@octagreennano.com</span>
      <span class="item">${ICON.clock} Mon – Sat, 09:30 – 17:30</span>
    </div>
    <div class="topbar-right">
      <a href="career.html">Careers</a>
      <a href="BeADealer.html">Become a Dealer</a>
      <div class="topbar-social" aria-label="Social media">
        <a href="${SOCIAL.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ICON.facebook}</a>
        <a href="${SOCIAL.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.instagram}</a>
        <a href="${SOCIAL.x}" target="_blank" rel="noopener" aria-label="X (Twitter)">${ICON.x}</a>
        <a href="${SOCIAL.pinterest}" target="_blank" rel="noopener" aria-label="Pinterest">${ICON.pinterest}</a>
        <a href="${SOCIAL.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${ICON.youtube}</a>
      </div>
    </div>
  </div>
</div>
<header class="site-header">
  <div class="container nav-row">
    <a class="brand" href="index.html" aria-label="Octagreen Nano home">
      <img class="logo-light" src="images/logo.png" alt="Octagreen Nano logo" width="180" height="48">
      <img class="logo-dark" src="images/logo-light.png" alt="Octagreen Nano logo" width="180" height="48">
    </a>
    <ul class="primary-nav" id="primaryNav">
      <li><a href="index.html">Home</a></li>
      <li class="has-submenu">
        <a class="nav-link" href="aboutoctagreen.html">About <span class="caret"></span></a>
        <ul class="submenu">
          <li><a href="aboutoctagreen.html">Our Company</a></li>
          <li><a href="awards.html">Awards & Recognition</a></li>
          <li><a href="faq.html">FAQs</a></li>
        </ul>
      </li>
      <li class="has-submenu">
        <a class="nav-link" href="index.html#products">Products <span class="caret"></span></a>
        <ul class="submenu">
          <li><a href="firstcoatinteriorprimer.html">First Coat Interior Primer</a></li>
          <li><a href="gulmohareconomyinterioremulsion.html">Gulmohar Economy Interior</a></li>
          <li><a href="daffodilremiuminterioremulsion.html">Daffodil Premium Interior</a></li>
          <li><a href="magicshineuxuryinterioremulsion.html">Magic Shine Luxury Interior</a></li>
          <li><a href="firstcoatexteriorprimer.html">First Coat Exterior Primer</a></li>
          <li><a href="aurasuperiorexterioremulsion.html">Aura Superior Exterior</a></li>
          <li><a href="allweatherweatherproofexterioremulsion.html">All Weather Exterior</a></li>
          <li><a href="ultraguardwaterproofexterioremulsion.html">Ultra Guard Waterproof</a></li>
          <li><a href="colours.html">Colour Palette</a></li>
        </ul>
      </li>
      <li class="has-submenu">
        <a class="nav-link" href="izonil.html">Waterproofing <span class="caret"></span></a>
        <ul class="submenu">
          <li><a href="izonil.html">Izonil Waterproof Plaster</a></li>
          <li><a href="ultramasticcoat.html">Ultra Mastic Coat</a></li>
        </ul>
      </li>
      <li class="has-submenu">
        <a class="nav-link" href="ExpertPaitingService.html">Services <span class="caret"></span></a>
        <ul class="submenu">
          <li><a href="ExpertPaitingService.html">Expert Painting Services</a></li>
          <li><a href="paint-services-kochi.html">Painters in Kochi</a></li>
        </ul>
      </li>
      <li class="has-submenu">
        <a class="nav-link" href="visualizer.html">Tools <span class="caret"></span></a>
        <ul class="submenu">
          <li><a href="visualizer.html">Wall Colour Visualizer</a></li>
          <li><a href="quiz.html">Find Your Colour Quiz</a></li>
          <li><a href="calculator.html">Paint Calculator</a></li>
          <li><a href="compare.html">Compare Products</a></li>
          <li><a href="colours.html">Colour Palette</a></li>
        </ul>
      </li>
      <li><a href="BeADealer.html">Dealers</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <div class="nav-cta">
      <button class="theme-toggle" type="button" aria-label="Toggle dark mode">${ICON.moon}${ICON.sun}</button>
      <a class="phone" href="tel:+918606511141" data-track="header_call">${ICON.phone} +91 86065 11141</a>
      <a href="contact-quote.html" class="btn btn-primary">Get a Quote</a>
      <button class="nav-toggle" aria-controls="primaryNav" aria-expanded="false" aria-label="Toggle menu"><span></span></button>
    </div>
  </div>
</header>`;

/* =========================================================
   Banner / breadcrumb
   ========================================================= */
const banner = ({ eyebrow, title, crumbs }) => `
<section class="page-banner">
  <div class="container page-banner-inner">
    ${eyebrow ? `<span class="eyebrow" style="background:rgba(255,255,255,0.18);color:#fff">${eyebrow}</span>` : ''}
    <h1>${title}</h1>
    <ol class="breadcrumb">
      ${crumbs.map((c, i) => i < crumbs.length - 1
        ? `<li><a href="${c.href}">${c.label}</a></li>`
        : `<li>${c.label}</li>`).join('')}
    </ol>
  </div>
</section>`;

/* =========================================================
   Footer + scripts + FAB
   ========================================================= */
const footerAndScripts = `
<aside class="recently-viewed" data-favourites></aside>
<aside class="recently-viewed" data-recently-viewed></aside>
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="images/logo-light.png" alt="Octagreen Nano logo" width="180" height="48">
        <p>Octagreen Nano Products India Pvt. Ltd. — manufacturer of eco-friendly, low-VOC paints &amp; waterproofing solutions. Made in India, kinder to the planet.</p>
        <div class="footer-social" aria-label="Follow us">
          <a href="${SOCIAL.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ICON.facebook}</a>
          <a href="${SOCIAL.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.instagram}</a>
          <a href="${SOCIAL.x}" target="_blank" rel="noopener" aria-label="X (Twitter)">${ICON.x}</a>
          <a href="${SOCIAL.pinterest}" target="_blank" rel="noopener" aria-label="Pinterest">${ICON.pinterest}</a>
          <a href="${SOCIAL.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${ICON.youtube}</a>
          <a href="${SOCIAL.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON.whatsapp}</a>
        </div>
      </div>
      <div>
        <h4>Products</h4>
        <ul class="footer-list">
          <li><a href="izonil.html">Izonil Waterproof Plaster</a></li>
          <li><a href="ultramasticcoat.html">Ultra Mastic Coat</a></li>
          <li><a href="ultraguardwaterproofexterioremulsion.html">Ultra Guard Exterior</a></li>
          <li><a href="allweatherweatherproofexterioremulsion.html">All Weather Exterior</a></li>
          <li><a href="magicshineuxuryinterioremulsion.html">Magic Shine Interior</a></li>
          <li><a href="daffodilremiuminterioremulsion.html">Daffodil Premium Interior</a></li>
          <li><a href="gulmohareconomyinterioremulsion.html">Gulmohar Economy Interior</a></li>
          <li><a href="colours.html">Colour Palette</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul class="footer-list">
          <li><a href="aboutoctagreen.html">About</a></li>
          <li><a href="awards.html">Awards</a></li>
          <li><a href="faq.html">FAQs</a></li>
          <li><a href="ExpertPaitingService.html">Painting Services</a></li>
          <li><a href="BeADealer.html">Become a Dealer</a></li>
          <li><a href="career.html">Careers</a></li>
          <li><a href="News&amp;Events.html">News &amp; Events</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="privacy.html">Privacy Policy</a></li>
          <li><a href="terms.html">Terms of Use</a></li>
        </ul>
      </div>
      <div>
        <h4>Reach Us</h4>
        <ul class="footer-list footer-contact">
          <li>${ICON.pin}<span><strong style="color:#fff">HO:</strong> #39 NGEF Lane, Indira Nagar, Bengaluru 560038</span></li>
          <li>${ICON.pin}<span><strong style="color:#fff">Branch:</strong> Shakthi Enclave, Perandoor Road, Elamakkara P.O., Kochi 682026</span></li>
          <li>${ICON.phone}<span><a href="tel:+918606511141">+91 86065 11141</a><br><a href="tel:18003136949">Toll-Free 1800 313 6949</a></span></li>
          <li>${ICON.mail}<span><a href="mailto:mail@octagreennano.com">mail@octagreennano.com</a></span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div>&copy; <span data-year>2026</span> Octagreen Nano Products India Pvt. Ltd. — All rights reserved.</div>
      <div class="legal">
        <a href="privacy.html">Privacy</a>
        <a href="terms.html">Terms</a>
        <a href="contact.html">Contact</a>
      </div>
    </div>
  </div>
</footer>

<div class="fab-stack">
  <a class="fab whatsapp" href="${SOCIAL.whatsapp}?text=Hi%20Octagreen,%20I%27d%20like%20a%20quote." target="_blank" rel="noopener" aria-label="WhatsApp us" data-track="whatsapp">${ICON.whatsapp}</a>
  <a class="fab call" href="tel:+918606511141" aria-label="Call us" data-track="fab_call">${ICON.phone}</a>
  <a class="fab top" href="#" aria-label="Back to top">${ICON.arrowUp}</a>
</div>

<!-- Chatbot widget -->
<div class="chatbot" id="chatbot">
  <button class="chatbot-toggle" id="chatbot-toggle" aria-label="Open Octagreen helper" aria-expanded="false">
    <span class="chatbot-icon-open"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
    <span class="chatbot-icon-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
    <span class="chatbot-pulse"></span>
  </button>
  <div class="chatbot-panel" role="dialog" aria-label="Octagreen helper" aria-hidden="true">
    <div class="chatbot-header">
      <div>
        <strong>Octagreen Helper</strong>
        <span style="display:block;font-size:.78rem;opacity:.85">We typically reply in seconds</span>
      </div>
    </div>
    <div class="chatbot-body" id="chatbot-body"></div>
    <div class="chatbot-footer">
      <a href="${SOCIAL.whatsapp}?text=Hi%20Octagreen!" target="_blank" rel="noopener" data-track="chatbot_whatsapp">Or chat on WhatsApp →</a>
    </div>
  </div>
</div>

<!-- Comparison drawer -->
<div class="compare-drawer" id="compare-drawer" hidden>
  <div class="compare-drawer-content">
    <div class="compare-drawer-list" id="compare-drawer-list"></div>
    <div class="compare-drawer-actions">
      <button class="btn btn-ghost btn-sm" id="compare-drawer-clear">Clear</button>
      <a href="compare.html" class="btn btn-primary">Compare →</a>
    </div>
  </div>
</div>

<!-- Confetti canvas (one-shot on form success) -->
<canvas class="confetti-canvas" aria-hidden="true"></canvas>

<script src="js/main.js"></script>
</body>
</html>`;

/* =========================================================
   Honeypot — hidden field plus existing required fields
   ========================================================= */
const honeypot = `<div class="hp-field" aria-hidden="true"><label>Don't fill this in: <input type="text" name="company_website" tabindex="-1" autocomplete="off"></label></div>`;

/* =========================================================
   Common bits used across pages
   ========================================================= */
const trustBar = `
<div class="trust-bar">
  <div class="trust-item">${ICON.award}<div><div class="tlabel">Most Promising Brand</div><div class="tdesc">Industry Outlook</div></div></div>
  <div class="trust-item">${ICON.leaf}<div><div class="tlabel">Low-VOC, Lead-free</div><div class="tdesc">Eco-friendly formulation</div></div></div>
  <div class="trust-item">${ICON.shield}<div><div class="tlabel">15+ Years</div><div class="tdesc">Trusted across India</div></div></div>
  <div class="trust-item">${ICON.users}<div><div class="tlabel">1000+ Projects</div><div class="tdesc">Homes &amp; commercial</div></div></div>
</div>`;

/* =========================================================
   Page: Home
   ========================================================= */
function homePage() {
  const orgJsonLd = `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Octagreen Nano Products India Pvt. Ltd.',
  url: SITE + '/',
  logo: SITE + '/images/logo.png',
  description: 'Manufacturer of eco-friendly, low-VOC paints and waterproofing solutions in India.',
  sameAs: Object.values(SOCIAL),
  telephone: ['+91-8606511141', '1800-313-6949', '0484-2539439'],
  email: 'mail@octagreennano.com',
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '47', bestRating: '5' },
  address: [
    { '@type': 'PostalAddress', streetAddress: '48/2138, A, A1, A2, Shakthi Enclave, Perandoor Road, Elamakkara P.O.', addressLocality: 'Kochi', addressRegion: 'Kerala', postalCode: '682026', addressCountry: 'IN' },
    { '@type': 'PostalAddress', streetAddress: '#39, NGEF Lane, Indira Nagar', addressLocality: 'Bengaluru', addressRegion: 'Karnataka', postalCode: '560038', addressCountry: 'IN' },
  ],
}, null, 2)}
</script>`;

  const reviewsJsonLd = `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Octagreen Nano Eco-Friendly Paints',
  brand: { '@type': 'Brand', name: 'Octagreen Nano' },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '47' },
  review: [
    { '@type': 'Review', reviewRating: { '@type': 'Rating', ratingValue: '5' }, author: { '@type': 'Person', name: 'K. Gopinath' }, reviewBody: 'The work quality, supervision and completion schedule were excellent. Customer satisfaction taken to the level of customer delight.' },
    { '@type': 'Review', reviewRating: { '@type': 'Rating', ratingValue: '5' }, author: { '@type': 'Person', name: 'Raj Krishnan' }, reviewBody: 'The waterproofing and painting work at Carnival Infopark Phase 2 has been highly effective. Chemicals supplied were of really good quality.' },
    { '@type': 'Review', reviewRating: { '@type': 'Rating', ratingValue: '5' }, author: { '@type': 'Person', name: 'Sreeraj M. R.' }, reviewBody: 'Octagreen successfully completed fire-rated painting at Indian Naval Academy, CIAL, CUSAT and IISER data centres. Performance and workmanship are of appreciable standards.' },
  ],
}, null, 2)}
</script>`;

  return head({
    title: 'Octagreen Nano — Eco-Friendly Paints & Waterproofing in Kerala | Low-VOC Paints India',
    description: 'Octagreen Nano is a Kerala-based manufacturer of eco-friendly, low-VOC interior, exterior and waterproofing paints. Award-winning green paint brand serving India for 15+ years. Get a free site quote.',
    slug: '',
    extraJsonLd: orgJsonLd + '\n' + reviewsJsonLd,
  })
  + header
  + `
<section class="hero" id="hero">
  <div class="hero-slide is-active" ${heroBg('1920x960.jpg')}></div>
  <div class="hero-slide" ${heroBg('1920x960_2.jpg')}></div>
  <div class="hero-slide" ${heroBg('1920x960_3.jpg')}></div>
  <div class="hero-slide" ${heroBg('1920x960_4.jpg')}></div>
  <div class="particles" aria-hidden="true"></div>
  <div class="container">
    <div class="hero-content">
      <span class="eyebrow">Industry Outlook · Most Promising Paint Brand</span>
      <h1>Eco-friendly paints, made for India's <span class="brush-stroke">homes &amp; industries</span>.</h1>
      <p>Octagreen Nano manufactures low-VOC, water-based interior, exterior and waterproofing paints — engineered with nano-technology, kinder to your family and the planet.</p>
      <div class="hero-actions">
        <a href="visualizer.html" class="btn btn-primary btn-lg" data-magnetic="14">Try the Visualizer</a>
        <a href="contact-quote.html" class="btn btn-on-dark btn-lg" data-magnetic="10">Free Site Quote</a>
      </div>
    </div>
  </div>
  <div class="hero-dots" role="tablist" aria-label="Hero slides">
    <button class="hero-dot is-active" aria-label="Slide 1"></button>
    <button class="hero-dot" aria-label="Slide 2"></button>
    <button class="hero-dot" aria-label="Slide 3"></button>
    <button class="hero-dot" aria-label="Slide 4"></button>
  </div>
  <div class="hero-trust"><div class="container"><div class="hero-trust-row">
    <span>${ICON.award} Industry Outlook Award</span>
    <span>${ICON.leaf} Low-VOC · Lead-free</span>
    <span>${ICON.shield} 15+ Years Trusted</span>
    <span>${ICON.users} 1000+ Projects</span>
  </div></div></div>
</section>

<section class="section feature-cards">
  <div class="container">
    <div class="row-grid grid-3">
      <div class="feature-card reveal"><div class="icon">${ICON.star}</div><h3>Quality-Driven</h3><p>Every batch is tested for adhesion, weather resistance and finish. Continuous customer feedback drives our R&amp;D.</p></div>
      <div class="feature-card reveal"><div class="icon">${ICON.leaf}</div><h3>Eco-Friendly Formula</h3><p>Water-based, low-VOC, lead-free paints. Safe for kids, expectant mothers, and the air your family breathes.</p></div>
      <div class="feature-card reveal"><div class="icon">${ICON.users}</div><h3>Customer Focused</h3><p>End-to-end support — from colour consultation to expert applicators and after-sales service across Kerala &amp; India.</p></div>
    </div>
  </div>
</section>

<section class="section section-muted" id="about">
  <div class="container container-sm text-center">
    <div class="reveal">
      <span class="eyebrow">About Octagreen</span>
      <h2>Be Green. Be Octagreen.</h2>
      <div class="divider center"></div>
      <p class="lead">Octagreen Nano is a leading specialist in eco-friendly coatings — engineered with monolithic silica nano-technology to deliver durability, weatherability and low-VOC safety in every can.</p>
      <p>Trusted by infrastructure companies, architects, builders and government consultants across India, our paints meet industrial performance demands without harming the environment. From homes in Kochi to data centres for the Indian Naval Academy, we bring all-round goodness — for you and the planet.</p>
      <div class="stats" style="text-align:center">
        <div class="stat"><div class="num"><span class="count-up" data-count="15">15</span><span style="color:var(--c-primary)">+</span></div><div class="label">Years experience</div></div>
        <div class="stat"><div class="num"><span class="count-up" data-count="1000">1000</span><span style="color:var(--c-primary)">+</span></div><div class="label">Projects delivered</div></div>
        <div class="stat"><div class="num"><span class="count-up" data-count="2">2</span></div><div class="label">Manufacturing units</div></div>
        <div class="stat"><div class="num"><span class="count-up" data-count="0">0</span></div><div class="label">Lead &amp; mercury</div></div>
      </div>
      <div class="mt-3">
        <a href="aboutoctagreen.html" class="btn btn-primary">Learn more</a>
        <a href="awards.html" class="btn btn-ghost">Awards & recognition →</a>
      </div>
    </div>
  </div>
</section>

<section class="section" id="products">
  <div class="container">
    <div class="section-title reveal">
      <span class="eyebrow">Our Range</span>
      <h2>Paints &amp; coatings for every surface</h2>
      <p>From budget-friendly interior emulsions to industrial waterproofing — a complete eco-friendly portfolio with starting prices to fit every project.</p>
    </div>

    <div class="product-filter reveal" role="tablist" aria-label="Filter products by category">
      <button class="is-active" data-filter="all">All products</button>
      <button data-filter="interior">Interior</button>
      <button data-filter="exterior">Exterior</button>
      <button data-filter="waterproofing">Waterproofing</button>
      <button data-filter="primer">Primer</button>
    </div>

    <div class="row-grid grid-3">
      ${productCard('izonil.html', 'Waterproofing', 'images/izonil.jpg', 'Izonil Waterproof Plaster', '100% waterproof, breathable, dehumidifying plastering mortar — replaces general-purpose plaster and waterproof membranes in one step.')}
      ${productCard('ultramasticcoat.html', 'Waterproofing', 'images/UltraMasticCoat.jpg', 'Ultra Mastic Coat', 'High-performance acrylic elastomeric waterproof membrane — bridges cracks, blocks moisture, lets walls breathe.')}
      ${productCard('ultraguardwaterproofexterioremulsion.html', 'Exterior', 'images/UltraGuard.jpg', 'Ultra Guard Waterproof Exterior', '100% acrylic, anti-fungal, anti-algae glossy emulsion. Elastomeric, UV-stable, with excellent waterproofing.')}
      ${productCard('allweatherweatherproofexterioremulsion.html', 'Exterior', 'images/AllWeather.jpg', 'All Weather Exterior Emulsion', "High-acrylic, soft-sheen, weather-resistant emulsion ideal for India's extreme climates.")}
      ${productCard('aurasuperiorexterioremulsion.html', 'Exterior', 'images/Aura.jpg', 'Aura Superior Exterior', 'Smooth-matt exterior emulsion — durable, water-repellent, UV &amp; algae resistant with excellent coverage.')}
      ${productCard('magicshineuxuryinterioremulsion.html', 'Interior', 'images/MagicShine.jpg', 'Magic Shine Luxury Interior', 'High-acrylic, glossy luxury emulsion with very high washability and elastomeric crack-cover.')}
      ${productCard('daffodilremiuminterioremulsion.html', 'Interior', 'images/Dafodilss.jpg', 'Daffodil Premium Interior', 'Soft-sheen interior emulsion — durable, water-repellent and bacteria-resistant for a premium finish.')}
      ${productCard('gulmohareconomyinterioremulsion.html', 'Interior', 'images/GulMohar.jpg', 'Gulmohar Economy Interior', 'Matt-finish interior emulsion — cost-effective, durable, with great coverage for everyday homes.')}
      ${productCard('firstcoatinteriorprimer.html', 'Primer', 'images/FirstCoatInterior.jpg', 'First Coat Interior Primer', 'Water-based acrylic primer with outstanding adhesion — the perfect undercoat for interior finishes.')}
    </div>

    <div class="text-center mt-3">
      <a href="firstcoatexteriorprimer.html" class="btn btn-outline">View Exterior Primer →</a>
      <a href="colours.html" class="btn btn-ghost">Browse colour palette →</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-title reveal">
      <span class="eyebrow">Free Online Tools</span>
      <h2>Plan your project in 3 minutes</h2>
      <p>Try our colours on a virtual room, calculate exactly how much paint you need, and request a quote with one tap.</p>
    </div>
    <div class="row-grid grid-2">
      <a href="visualizer.html" class="product-card reveal spotlight-host" data-tilt>
        <div class="media" style="background:linear-gradient(135deg,#5C8362,#A4B79B);aspect-ratio:16/9">
          <span class="tag">Interactive</span>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:3.5rem;text-shadow:0 4px 16px rgba(0,0,0,0.25)">🎨</div>
        </div>
        <div class="body">
          <h3>Wall Colour Visualizer</h3>
          <p>Try any of 36+ Octagreen shades on a real living room, bedroom or exterior — see how it looks before you buy. Save the result, share to WhatsApp.</p>
          <span class="more">Open the Visualizer</span>
        </div>
      </a>
      <a href="calculator.html" class="product-card reveal spotlight-host" data-tilt>
        <div class="media" style="background:linear-gradient(135deg,#365C73,#5A8FA0);aspect-ratio:16/9">
          <span class="tag">Smart estimate</span>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:3.5rem;text-shadow:0 4px 16px rgba(0,0,0,0.25)">🧮</div>
        </div>
        <div class="body">
          <h3>Paint Coverage Calculator</h3>
          <p>Tell us your room dimensions, doors, windows. We tell you exactly how many litres you need, which packs to buy, and the indicative cost — live as you adjust.</p>
          <span class="more">Open the Calculator</span>
        </div>
      </a>
    </div>
  </div>
</section>

<section class="section section-tint">
  <div class="container">
    <div class="split reverse">
      <div class="reveal">
        <span class="eyebrow">Eco-Friendly Coatings</span>
        <h2>Why low-VOC matters for your family</h2>
        <div class="divider"></div>
        <p>Volatile Organic Compounds (VOCs) are the chemicals you smell in fresh paint — and they linger long after the walls dry. They contribute to indoor air pollution, ozone formation and respiratory issues.</p>
        <p>Octagreen paints are <strong>water-based, low-VOC and odour-light</strong>. Safe for nurseries, hospitals and offices. No more &ldquo;new paint headache.&rdquo; Just clean walls, clean air.</p>
        <ul style="list-style:none;padding:0;margin:0">
          <li style="padding:.4rem 0;display:flex;gap:.6rem;align-items:flex-start"><span style="color:var(--c-primary);font-weight:700">✓</span> Lead-free, mercury-free formulation</li>
          <li style="padding:.4rem 0;display:flex;gap:.6rem;align-items:flex-start"><span style="color:var(--c-primary);font-weight:700">✓</span> Anti-fungal, anti-algae, washable surfaces</li>
          <li style="padding:.4rem 0;display:flex;gap:.6rem;align-items:flex-start"><span style="color:var(--c-primary);font-weight:700">✓</span> Quick-drying — repaint within 4 hours</li>
          <li style="padding:.4rem 0;display:flex;gap:.6rem;align-items:flex-start"><span style="color:var(--c-primary);font-weight:700">✓</span> Tintable to thousands of custom colours</li>
        </ul>
        <div class="mt-3">
          <a href="aboutoctagreen.html" class="btn btn-primary">Read the science</a>
        </div>
      </div>
      <div class="split-media reveal">${pic('images/1920x960_3.jpg', 'Eco-friendly Octagreen paints applied to a wall')}</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-title reveal">
      <span class="eyebrow">Our Work</span>
      <h2>Projects we are proud of</h2>
      <p>From premium residential apartments to landmark commercial complexes — Octagreen colours stand the test of time.</p>
    </div>
    <div class="row-grid grid-3">
      ${projectCard('contact.html', 'images/OracleTVM.jpg', 'Oracle Office', 'Trivandrum')}
      ${projectCard('contact.html', 'images/NoelTouch.jpg', 'Noel Touch Stone', 'Vazhakkala')}
      ${projectCard('contact.html', 'images/ExpressGarden.jpg', 'Express Garden', 'Kochi')}
      ${projectCard('contact.html', 'images/FederalGarden.jpg', 'Federal Garden', 'Aluva')}
      ${projectCard('contact.html', 'images/JGTApartment.jpg', 'JGT Apartment', 'Kochi')}
      ${projectCard('contact.html', 'images/Cheloor.jpg', 'Cheloor Golden Enclave', 'Thrissur')}
    </div>
  </div>
</section>

<section class="section section-muted">
  <div class="container">
    <div class="section-title reveal">
      <span class="eyebrow">Customer Voices</span>
      <h2>What our customers say</h2>
      <p>★★★★★ Average 4.8 / 5 from 47+ projects</p>
    </div>
    <div class="testimonials">
      ${testimonialCard('"The work quality, supervision and completion schedule in executing the entire job was very much appreciated. Customer care and customer satisfaction were taken to the level of customer delight by the team."', 'images/Gopinath.jpg', 'K. Gopinath', 'Mercy Garden')}
      ${testimonialCard('"The waterproofing and painting work done at Phase 2, Carnival Infopark, Kakkanad by Octagreen has been highly effective and the chemicals supplied were of really good quality."', 'images/Carnival.jpg', 'Raj Krishnan', 'CEO, Carnival Soft Pvt. Ltd.')}
      ${testimonialCard('"Octagreen successfully completed fire-rated painting at Indian Naval Academy, CIAL, CUSAT and IISER data centres. The product performance and workmanship are of appreciable standards."', 'images/FITech.jpg', 'Sreeraj M. R.', 'Director – Projects, Fi-Tech')}
      ${testimonialCard('"I would like to thank the team for the excellent work put in for the beautification of our twin-flat complex Federal Gardens located in the prime centre of Aluva town."', 'images/Antony.jpg', 'T. Antony Joy', 'President, Federal Garden')}
      ${testimonialCard('"The fresh new look our building has attained is due to your Octagreen products applied effectively. Thank you for the painting of Mercy Gardens, Elamakkara."', 'images/Ramaswami.jpg', 'K. C. Ramaswami', 'Architect, Kochi')}
      <div class="testimonial reveal" style="background:var(--c-primary);color:#fff;border-color:var(--c-primary)">
        <p class="text" style="color:#fff">Ready to give your walls the Octagreen finish?</p>
        <div class="person"><div><a href="contact-quote.html" class="btn btn-light">Get a free quote</a></div></div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-title reveal">
      <span class="eyebrow">Trusted By</span>
      <h2>Architects, builders &amp; developers</h2>
    </div>
    <div class="marquee reveal" aria-hidden="false">
      <div class="marquee-track">
        ${[1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8].map(n => `<div class="marquee-item">${pic('images/partners' + n + '.jpg', 'Client ' + n)}</div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="section section-tight">
  <div class="container">
    <div class="cta-banner reveal">
      <div>
        <span class="eyebrow" style="background:rgba(255,255,255,0.18);color:#fff">Free Site Visit</span>
        <h2>Get a free quote in under 24 hours</h2>
        <p>Tell us about your project — interior, exterior or waterproofing — and our experts will give you a no-obligation site quote.</p>
      </div>
      <div class="actions">
        <a href="contact-quote.html" class="btn btn-light btn-lg">Request a quote</a>
        <a href="tel:+918606511141" class="btn btn-on-dark btn-lg" data-track="cta_call">Call +91 86065 11141</a>
      </div>
    </div>
  </div>
</section>

<section class="section section-tight">
  <div class="container">
    <div class="info-cards">
      <div class="info-card"><div class="icon">${ICON.phone}</div><div><h4>Call us</h4><div class="body"><a href="tel:+918606511141">+91 86065 11141</a><br><a href="tel:18003136949">Toll-Free 1800 313 6949</a></div></div></div>
      <div class="info-card"><div class="icon">${ICON.pin}</div><div><h4>Visit us</h4><div class="body">Shakthi Enclave, Perandoor Road, Elamakkara P.O., Kochi 682026, Kerala</div></div></div>
      <div class="info-card"><div class="icon">${ICON.mail}</div><div><h4>Email us</h4><div class="body">Sales: <a href="mailto:mail@octagreennano.com">mail@octagreennano.com</a><br>General: <a href="mailto:prathish@octagreennano.com">prathish@octagreennano.com</a></div></div></div>
    </div>
  </div>
</section>`
  + footerAndScripts;
}

/* helpers used by homepage */
function productCard(href, tag, img, name, desc, cat) {
  var category = (cat || tag).toLowerCase();
  return `<div class="product-card reveal spotlight-host" data-tilt data-cat="${category}" data-product-slug="${href}">
    <button class="card-fav" type="button" aria-label="Save to favourites" data-fav="${href}" title="Save"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
    <button class="card-cmp" type="button" aria-label="Add to compare" data-cmp="${href}" title="Compare"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></button>
    <a href="${href}" class="product-card-link">
      <div class="media"><span class="tag">${tag}</span>${pic(img, name)}</div>
      <div class="body">
        <h3>${name}</h3>
        <p>${desc}</p>
        <span class="more">Learn more</span>
      </div>
    </a>
  </div>`;
}
function projectCard(href, img, name, location) {
  return `<a href="${href}" class="project-card reveal">${pic(img, name + ', ' + location)}<div class="caption"><div class="name">${name}</div><div class="meta">${location}</div></div></a>`;
}
function testimonialCard(text, img, name, role) {
  return `<div class="testimonial reveal">
    <div class="stars">★★★★★</div>
    <p class="text">${text}</p>
    <div class="person">
      ${pic(img, name)}
      <div><div class="name">${name}</div><div class="role">${role}</div></div>
    </div>
  </div>`;
}

/* =========================================================
   Page: Izonil (custom — distinct from generic productPage)
   ========================================================= */
function izonilPage() {
  const jsonLd = `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Product',
  name: 'Izonil Waterproof Plaster', image: SITE + '/images/izonil.jpg',
  description: '100% waterproof, breathable, dehumidifying plastering mortar based on Portland cement, silica sand and natural admixture (Izocomponent), reinforced with PP fibres. Resistant to 1 BAR water pressure. EN 998-1 certified.',
  brand: { '@type': 'Brand', name: 'Octagreen Nano' },
  manufacturer: { '@type': 'Organization', name: 'Octagreen Nano Products India Pvt. Ltd.' },
}, null, 2)}
</script>`;

  return head({
    title: 'Izonil Waterproof Plaster — 100% Waterproof, Breathable Plastering Mortar | Octagreen Nano',
    description: 'Izonil is a 100% waterproof, breathable, dehumidifying plastering mortar that replaces general-purpose plaster and waterproof membranes. Resistant to 1 BAR water pressure. EN 998-1 certified.',
    slug: 'izonil.html', ogImage: 'images/izonil.jpg', extraJsonLd: jsonLd,
  })
  + header
  + banner({ eyebrow: 'Waterproofing', title: 'Izonil Waterproof Plaster', crumbs: [{ href: 'index.html', label: 'Home' }, { href: 'izonil.html', label: 'Waterproofing' }, { label: 'Izonil' }] })
  + `
<div data-product-info data-product-slug="izonil.html" data-product-name="Izonil Waterproof Plaster" data-product-image="images/izonil.jpg" hidden></div>
<section class="section">
  <div class="container">
    <div class="layout-sidebar left-sidebar">
      <aside class="sidebar">
        <div class="sidebar-widget">
          <h4>Waterproofing Range</h4>
          <ul class="sidebar-list">
            <li><a href="izonil.html" class="active">Izonil Waterproof Plaster</a></li>
            <li><a href="ultramasticcoat.html">Ultra Mastic Coat</a></li>
          </ul>
        </div>
        <div class="sidebar-widget">
          <h4>Downloads</h4>
          <a href="images/IZONILHARD.pdf" class="btn btn-secondary btn-block" download data-track="product_pdf">📄 Download Izonil TDS (PDF)</a>
          <a href="images/WeAreOctagreen.pdf" class="btn btn-outline btn-block" download style="margin-top:.6rem" data-track="company_brochure">📘 Company Brochure (PDF)</a>
        </div>
        <div class="sidebar-widget">
          <h4>Need help?</h4>
          <p style="margin:0 0 1rem;color:var(--c-muted);font-size:.92rem">Speak to our waterproofing experts for site-specific advice.</p>
          <a href="tel:+918606511141" class="btn btn-primary btn-block" data-track="sidebar_call">Call +91 86065 11141</a>
          <a href="contact-quote.html" class="btn btn-outline btn-block" style="margin-top:.6rem">Request a Quote</a>
        </div>
      </aside>

      <article class="article">
        <div class="brand-badge">
          <img src="images/izogreen-logo.jpg" alt="Izogreen" loading="eager" width="44" height="44">
          Izogreen Technology
        </div>

        <div class="video-card" data-video="images/izonil-video.mp4">
          <button class="video-poster" type="button" aria-label="Play Izogreen demo video" data-track="izonil_video">
            <picture>
              <source srcset="images/izonil.webp" type="image/webp">
              <img src="images/izonil.jpg" alt="Izogreen Waterproof Plaster — click to watch demo" loading="lazy" decoding="async">
            </picture>
            <span class="video-overlay"></span>
            <span class="video-play-btn"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 22 12 6 21 6 3"/></svg></span>
            <span class="video-meta"><span class="video-eyebrow">▶ Watch demo</span><div class="video-title-text">See Izogreen waterproofing in action</div></span>
          </button>
        </div>

        <h2>Izonil Waterproof Plaster</h2>
        <p>Industrially dry-mixed 100% waterproof breathable plastering mortar with dehumidifying ability — based on Portland cement, silica sand, the unique natural admixture (Izocomponent) and reinforced with PP fibres. For external/internal and positive/negative application as a one-step replacement for general-purpose plastering mortars, renovation plastering mortars and diffusion-closed waterproof membranes.</p>

        <h4>Description</h4>
        <p>100% waterproof plastering mortar (resistant against water pressure of 1 BAR / 0.1 MPa with water penetration less than 1 mm) and dehumidifying plastering mortar (with high volume of micropores allowing permanent dehumidifying of wet substrates). Meets the requirements of EN 998-1 as renovation plaster. Provides a long-term solution to water penetration and ventilation/drying of wet walls. Contains no harmful or toxic ingredients — suitable for direct contact with drinking water.</p>

        <h4>Surface preparation</h4>
        <p>Designed for vertical substrates (brick, light concrete block, rough concrete) and horizontal substrates (concrete floors and roofs). The substrate must be solid, free of dirt, oil, grease, dust, paint and loose parts. Moisten thoroughly immediately before applying the fresh plaster mixture, then apply a thin Portland-cement adhesive bridge a few millimetres thick. Apply the plaster before the cement bridge hardens.</p>

        <h4>Mixing</h4>
        <p>Use a gravity mixer or hand-held electric mixer. Add water first — 4.0–4.7 litres per 25 kg of dry plaster. Gravity mixer: add water, then powder, mix for at least 10 minutes. Hand-held: add water, then powder, mix for 5 minutes; rest 5 minutes; mix again for 1 minute. Use within 3 hours.</p>

        <h4>Application</h4>
        <p>Apply manually with standard plastering tools or by plastering machine pump. Use a 5×5 mm fibreglass mesh (~145 g/m²) at corners, joints, around windows and doors — or across the whole area. Up to 3 layers, total thickness max 30 mm. One layer is 10–15 mm. Apply each new layer at least 24 hours after the previous one. Apply at +5 °C to +25 °C; protect from rain for 24 hours; do not apply in direct sun, strong wind or freezing weather.</p>

        <h4>Cleaning &amp; care</h4>
        <p>Clean tools with water before the plaster hardens. Hardened material can only be removed mechanically. Protect freshly applied plaster from rapid drying for at least 48 hours.</p>

        <h4>Final coating</h4>
        <p>Let plaster dry for at least 3 weeks before final coating. Use highly breathable / diffusion-open paints (silicate, cement or lime paints). For tile finishes, roughen the surface, use standard tile adhesive, and grout with breathable grout to preserve breathability.</p>

        <h2>Advantages</h2>
        <ul>
          <li>World-unique plastering mortar — simultaneously 100% waterproof, breathable and dehumidifying</li>
          <li>Resistant to penetration of rain water and running water</li>
          <li>Resistant to water under pressure up to 1 BAR (EN 12390-8 — penetration &lt; 1 mm in 72 h)</li>
          <li>Meets EN 998-1 for general-purpose AND renovation plastering mortar simultaneously</li>
          <li>Highly breathable — low water-vapour diffusion coefficient</li>
          <li>Excellent adhesion; minimal waste during application</li>
          <li>Resistant to salt crystallisation; sulphur-resistant</li>
          <li>Applicable on damp surfaces, manually or by plastering machine</li>
          <li>Above-ground &amp; underground; externally &amp; internally; positive &amp; negative side</li>
          <li>Non-toxic — suitable for direct contact with drinking water</li>
        </ul>

        <h2>Technical Data Sheet</h2>
        <table class="tds-table">
          <thead><tr><th>Property</th><th>Specification</th></tr></thead>
          <tbody>
            <tr><td>Appearance / colour</td><td>Powder / grey</td></tr>
            <tr><td>Chemical composition</td><td>Silica sand, Portland cement, natural Izocomponent, PP fibres</td></tr>
            <tr><td>Silica sand particle size</td><td>0–0.6 mm (Soft) · 0–2 mm (Rough)</td></tr>
            <tr><td>Packaging</td><td>25 kg paper bag</td></tr>
            <tr><td>Shelf life</td><td>Minimum 18 months</td></tr>
            <tr><td>Water / powder ratio</td><td>4.0–4.7 L water per 25 kg dry plaster</td></tr>
            <tr><td>Pot life / workability</td><td>Min. 3 hours at 20 °C</td></tr>
            <tr><td>Layer thickness</td><td>One layer 10–15 mm; max 3 layers totalling 30 mm</td></tr>
            <tr><td>Coverage</td><td>At 10 mm: 12.5 kg/m² (25 kg = 2 m²) · At 20 mm: 25 kg/m² (25 kg = 1 m²)</td></tr>
          </tbody>
        </table>

        <div class="cta-banner reveal" style="margin-top:2rem">
          <div><h2 style="font-size:1.5rem">Plan a waterproofing project?</h2><p>Our team can survey your site and recommend the right Izonil specification.</p></div>
          <div class="actions">
            <a href="contact-quote.html" class="btn btn-light">Request a Quote</a>
            <a href="${SOCIAL.whatsapp}?text=Hi%20Octagreen,%20I%27d%20like%20a%20quote%20for%20Izonil." target="_blank" rel="noopener" class="btn btn-on-dark" data-track="product_whatsapp">WhatsApp us</a>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>`
  + footerAndScripts;
}

/* =========================================================
   Generic product page template
   ========================================================= */
function productPage(p) {
  const sidebarItems = [
    { href: 'firstcoatinteriorprimer.html', label: 'First Coat Interior Primer' },
    { href: 'gulmohareconomyinterioremulsion.html', label: 'Gulmohar Economy Interior' },
    { href: 'daffodilremiuminterioremulsion.html', label: 'Daffodil Premium Interior' },
    { href: 'magicshineuxuryinterioremulsion.html', label: 'Magic Shine Luxury Interior' },
    { href: 'firstcoatexteriorprimer.html', label: 'First Coat Exterior Primer' },
    { href: 'aurasuperiorexterioremulsion.html', label: 'Aura Superior Exterior' },
    { href: 'allweatherweatherproofexterioremulsion.html', label: 'All Weather Exterior' },
    { href: 'ultraguardwaterproofexterioremulsion.html', label: 'Ultra Guard Waterproof' },
  ];

  const jsonLd = `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Product',
  name: p.name, image: SITE + '/' + p.image, description: p.description,
  brand: { '@type': 'Brand', name: 'Octagreen Nano' },
  manufacturer: { '@type': 'Organization', name: 'Octagreen Nano Products India Pvt. Ltd.' },
}, null, 2)}
</script>`;

  return head({ title: `${p.name} — Octagreen Nano`, description: p.metaDescription || p.description, slug: p.slug, ogImage: p.image, extraJsonLd: jsonLd })
  + header
  + banner({ eyebrow: p.category, title: p.name, crumbs: [{ href: 'index.html', label: 'Home' }, { href: 'index.html#products', label: 'Products' }, { label: p.name }] })
  + `
<div data-product-info data-product-slug="${p.slug}" data-product-name="${p.name}" data-product-image="${p.image}" hidden></div>
<section class="section">
  <div class="container">
    <div class="layout-sidebar left-sidebar">
      <aside class="sidebar">
        <div class="sidebar-widget">
          <h4>Product Range</h4>
          <ul class="sidebar-list">
            ${sidebarItems.map(item => `<li><a href="${item.href}"${item.href === p.slug ? ' class="active"' : ''}>${item.label}</a></li>`).join('\n            ')}
          </ul>
        </div>
        ${p.pdf ? `<div class="sidebar-widget">
          <h4>Downloads</h4>
          <a href="${p.pdf}" class="btn btn-secondary btn-block" download data-track="product_pdf">📄 ${p.pdfLabel}</a>
          <a href="images/WeAreOctagreen.pdf" class="btn btn-outline btn-block" download style="margin-top:.6rem" data-track="company_brochure">📘 Company Brochure (PDF)</a>
        </div>` : ''}
        <div class="sidebar-widget">
          <h4>Need help?</h4>
          <p style="margin:0 0 1rem;color:var(--c-muted);font-size:.92rem">Speak to our paint experts for site-specific advice and a free quote.</p>
          <a href="tel:+918606511141" class="btn btn-primary btn-block" data-track="sidebar_call">Call +91 86065 11141</a>
          <a href="contact-quote.html" class="btn btn-outline btn-block" style="margin-top:.6rem">Request a Quote</a>
        </div>
      </aside>

      <article class="article">
        ${pic(p.image, p.name)}
        <h2>${p.name}</h2>

        <h4>Description</h4>
        <p>${p.description}</p>

        <h4>Benefits</h4>
        <p>${p.benefits}</p>

        <div class="row-grid grid-2" style="margin-top:1.5rem">
          <div>
            <h3>Usage</h3>
            <ul>${p.usage.map(u => `<li>${u}</li>`).join('\n              ')}</ul>
          </div>
          <div>
            <h3>Surface preparation &amp; application</h3>
            <ul>${p.application.map(a => `<li>${a}</li>`).join('\n              ')}</ul>
          </div>
        </div>

        <h2>Technical Data Sheet</h2>
        <table class="tds-table">
          <thead><tr><th>Property</th><th>Specification</th></tr></thead>
          <tbody>${p.tds.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('\n            ')}</tbody>
        </table>

        <div class="cta-banner reveal" style="margin-top:2rem">
          <div><h2 style="font-size:1.5rem">Interested in ${p.name}?</h2><p>Get a no-obligation quote, dealer locations, or a colour consultation from our experts.</p></div>
          <div class="actions">
            <a href="contact-quote.html" class="btn btn-light">Request a Quote</a>
            <a href="${SOCIAL.whatsapp}?text=Hi%20Octagreen,%20I%27d%20like%20to%20know%20more%20about%20${encodeURIComponent(p.name)}." target="_blank" rel="noopener" class="btn btn-on-dark" data-track="product_whatsapp">WhatsApp us</a>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>`
  + footerAndScripts;
}

/* =========================================================
   Generic content page wrapper
   ========================================================= */
function genericPage({ title, metaDescription, slug, banner: bnr, body, jsonLd }) {
  return head({ title, description: metaDescription, slug, extraJsonLd: jsonLd || '' }) + header + (bnr ? banner(bnr) : '') + body + footerAndScripts;
}

/* =========================================================
   Product data (shared)
   ========================================================= */
const usageInteriorBase = [
  'Finish/Usage: Interior',
  'Type: Water-based interior emulsion',
  'Colours: 4 bases (white, light, medium, dark) — tintable to thousands of custom shades',
  'Limitations: Not recommended for floors or decks',
  'Surfaces: Interior plaster, drywall, concrete, masonry, hardboard siding, gypsum board',
  'Surface prep: Clean, dry, free of wax/grease/oil/loose paint. Repair cracks with suitable filler.',
  'Storage: Cool, dry place',
  'Packing: 20 L · 10 L · 4 L · 1 L',
];
const usageExteriorBase = [
  'Finish/Usage: Exterior',
  'Type: Water-based exterior emulsion',
  'Colours: 4 bases (white, light, medium, dark) — tintable to thousands of custom shades',
  'Limitations: Not recommended for floors or decks',
  'Surfaces: Exterior plaster, drywall, concrete, masonry, hardboard siding, gypsum board',
  'Surface prep: Clean, dry, free of wax/grease/oil/loose paint. Repair cracks with suitable filler.',
  'Storage: Cool, dry place',
  'Packing: 20 L · 10 L · 4 L · 1 L',
];
const applicationStandard = [
  'New work: Use one coat of primer over wall putty + 2 finish coats',
  'Refinish: Lightly sand glossy surfaces; wash chalky surfaces thoroughly',
  'Surface temperature: Ambient — avoid frost, fog or damp conditions',
  'Application: Stir well. Brush or roller. Apply 1 coat primer + 2 coats finish.',
  'Thinning: Use clean water — approx. 400–500 ml per litre for brush/roller',
  'Drying time: Surface dust-free in 4 hours. Recoat after 4 hours.',
  'Clean-up: Tools wash with soap and water',
];

const tdsCommon = [
  ['Thinning ratio', '1 : 0.4'],
  ['Application method', 'Brush / Roller'],
  ['Application temperature', 'Room temperature'],
  ['Application viscosity', '20"'],
  ['Drying time (surface dry)', '4 hours'],
  ['Minimum recoat time', '4 hours'],
  ['Brushability / flow / opacity', 'Excellent'],
  ['UV stability', '300 hrs+'],
];

const products = [
  {
    slug: 'ultramasticcoat.html', name: 'Ultra Mastic Coat', category: 'Waterproofing',
    image: 'images/UltraMasticCoat.jpg',
    pdf: 'images/Octagreen__Exterior_Leaflet_Final.pdf', pdfLabel: 'Download Exterior Leaflet (PDF)',
    metaDescription: 'High-performance acrylic elastomeric waterproof membrane — bridges cracks, blocks moisture, lets walls breathe. UV resistant, non-toxic, easy to apply.',
    description: 'Ultra Mastic Coat is a non-toxic, environmentally friendly, high-molecular-weight, high-performance acrylic-based waterproofing elastomeric membrane. This silicon-modified pure-emulsion coating is engineered to act as a one-way membrane — allowing trapped moisture to escape while preventing moisture ingress into the substrate.',
    benefits: 'Easy and safe to apply with no noxious fumes — multiple coats can be applied on the same day for higher dry-film thickness. UV resistant, corrosion resistant, fire resistant, stain resistant, non-toxic and odourless. Provides excellent waterproofing and additional thermal insulation.',
    usage: ['Finish: Fine-textured satin in White and Grey','Type: Single-component, water-based acrylic elastomeric','Limitations: Not recommended on substrates permanently submerged in water','Substrates: Concrete rooftops, parapet walls, planter boxes, lashings, gutters, corrugated iron roofs, asbestos sheets','Storage: Cool, dry place'],
    application: ['Surface must be clean, dry and free of loose particles, oil and grease','Apply by brush or roller — multiple coats permitted same-day','Bridges hairline cracks and existing micro-cracks','Thinning: With clean water as required','Drying time: Surface dries in 4 hours','Clean-up: Wash tools with soap and water'],
    tds: [['Type', 'Acrylic elastomeric waterproof membrane'],['Finish', 'Satin'],['Available colours', 'White, Grey'],['Method of application', 'Brush / Roller'],['UV resistance', 'Excellent'],['Heat / fire / stain resistance', 'Excellent'],['Drying time (surface dry)', '4 hours'],['Minimum recoat time', '4 hours'],['Toxicity', 'Non-toxic, odourless']],
  },
  {
    slug: 'allweatherweatherproofexterioremulsion.html', name: 'All Weather Weatherproof Exterior Emulsion', category: 'Exterior',
    image: 'images/AllWeather.jpg',
    pdf: 'images/Octagreen__Exterior_Leaflet_Final.pdf', pdfLabel: 'Download Exterior Leaflet (PDF)',
    metaDescription: 'High-acrylic, soft-sheen, weather-resistant exterior emulsion. Low VOC, anti-fungal, anti-algae — built for India\'s extreme climates.',
    description: 'All Weather Exterior Emulsion is a high-acrylic, anti-fungal, anti-algae, soft-sheen emulsion with very high weather-resistant properties. A water-based, highly modified acrylic emulsion that prevents moss and algae growth and stays beautiful in extreme climatic conditions.',
    benefits: 'Very high resistance to weathering (UV, fungus, water) and blistering. Low VOC. High coverage with desirable ease of application. Additional features include high water repellence and quick drying.',
    usage: usageExteriorBase.concat(['Practical coverage: 70–80 sqft per litre (2 coats), depending on substrate porosity']),
    application: applicationStandard,
    tds: [['Type', 'Superior Exterior Emulsion'], ...tdsCommon, ['Specific gravity', '1.25 at 25 °C'], ['Viscosity', '73 KU at 25 °C'], ['Coverage area', '70–80 sqft / litre / 2 coats'], ['Gloss', 'Glossy / soft sheen'], ['Alkali resistance (NH₄OH vapour, 10% NaOH)', 'Passed IS+']],
  },
  {
    slug: 'aurasuperiorexterioremulsion.html', name: 'Aura Superior Exterior Emulsion', category: 'Exterior',
    image: 'images/Aura.jpg',
    pdf: 'images/Octagreen__Exterior_Leaflet_Final.pdf', pdfLabel: 'Download Exterior Leaflet (PDF)',
    metaDescription: 'Smooth-matt exterior emulsion — durable, water-repellent, UV and algae resistant with excellent coverage. Cost-effective premium exterior paint.',
    description: 'Aura Exterior Emulsion with smooth matt finish is durable, water-repellent, UV-resistant and resistant to fungus, algae and bacteria — with very good coverage, ideally suited for exterior surfaces.',
    benefits: 'Resistance to weathering (UV, fungus, water) and blistering. Low VOC. High coverage area. Easy to apply. Cost-effective without compromising performance.',
    usage: usageExteriorBase.concat(['Practical coverage: 60–70 sqft per litre (2 coats), depending on substrate porosity']),
    application: applicationStandard,
    tds: [['Type', 'Regular Exterior Emulsion'], ...tdsCommon, ['Specific gravity', '1.20–1.25 at 25 °C'], ['Viscosity', '106 KU at 25 °C'], ['Coverage area', '60–70 sqft / litre / 2 coats'], ['Gloss', 'Smooth matt']],
  },
  {
    slug: 'ultraguardwaterproofexterioremulsion.html', name: 'Ultra Guard Waterproof Exterior Emulsion', category: 'Exterior',
    image: 'images/UltraGuard.jpg',
    pdf: 'images/Octagreen__Exterior_Leaflet_Final.pdf', pdfLabel: 'Download Exterior Leaflet (PDF)',
    metaDescription: 'Ultra Guard is a 100% acrylic, anti-fungal, anti-algae glossy exterior emulsion with elastomeric crack-bridging and waterproofing properties.',
    description: 'Ultra Guard Waterproof Emulsion is a 100% acrylic, anti-fungal, anti-algae, glossy emulsion with very high waterproofing properties. Highly durable, water-repellent, UV-resistant, fungus/algae/bacteria-resistant, thermally insulating, elastomeric and anti-sticking.',
    benefits: 'Outstanding adhesion — embeds into the surface rather than forming a film. High resistance to weathering and blistering. Low VOC. High coverage. Elastomeric (covers cracks) and anti-sticking. Produces an all-season, breathable finish.',
    usage: usageExteriorBase.concat(['Practical coverage: 70–80 sqft per litre (2 coats), depending on substrate porosity']),
    application: applicationStandard,
    tds: [['Type', '100% Acrylic Waterproof Emulsion'], ...tdsCommon, ['Specific gravity', '1.25 at 25 °C'], ['Viscosity', '73 KU at 25 °C'], ['Coverage area', '70–80 sqft / litre / 2 coats'], ['Gloss', 'Glossy'], ['Elastomeric crack bridging', 'Yes'], ['Alkali resistance', 'Passed IS+']],
  },
  {
    slug: 'magicshineuxuryinterioremulsion.html', name: 'Magic Shine Luxury Interior Emulsion', category: 'Interior',
    image: 'images/MagicShine.jpg',
    pdf: 'images/Octagreen_Interior_Leaflet_Final.pdf', pdfLabel: 'Download Interior Leaflet (PDF)',
    metaDescription: 'Magic Shine is a high-acrylic, glossy, washable luxury interior emulsion with elastomeric crack-cover. Premium finish, low-VOC.',
    description: 'Magic Shine Luxury Interior Emulsion is a high-acrylic, glossy emulsion with very high washability — designed for premium interior finishes.',
    benefits: 'Very high resistance to weathering (UV, fungus, water) and blistering. Low VOC. High coverage area with desirable ease of application. Elastomeric (stretchable paint that covers cracks). Quick-drying. All-season, breathable finish.',
    usage: usageInteriorBase.concat(['Practical coverage: 120–130 sqft per litre (2 coats), depending on substrate porosity']),
    application: applicationStandard,
    tds: [['Type', 'Luxury Interior Emulsion'], ...tdsCommon, ['Specific gravity', '1.10 at 25 °C'], ['Viscosity', '73 KU at 25 °C'], ['Coverage area', '120–130 sqft / litre / 2 coats'], ['Gloss', 'High gloss'], ['Washability', 'Very high']],
  },
  {
    slug: 'daffodilremiuminterioremulsion.html', name: 'Daffodil Premium Interior Emulsion', category: 'Interior',
    image: 'images/Dafodilss.jpg',
    pdf: 'images/Octagreen_Interior_Leaflet_Final.pdf', pdfLabel: 'Download Interior Leaflet (PDF)',
    metaDescription: 'Daffodil Premium Interior Emulsion — soft-sheen finish, durable, water-repellent, UV-resistant and bacteria-resistant. Premium interior paint.',
    description: 'Daffodil Premium Interior Emulsion with soft-sheen finish is durable, water-repellent, UV-resistant and resistant to fungus, algae and bacteria — with very good coverage, best suited for premium interior surfaces.',
    benefits: 'Very high resistance to weathering (UV, fungus, water) and blistering. Low VOC. High coverage area with desirable ease of application — characterise this premium emulsion.',
    usage: usageInteriorBase.concat(['Practical coverage: 110–120 sqft per litre (2 coats), depending on substrate porosity']),
    application: applicationStandard,
    tds: [['Type', 'Premium Interior Emulsion'], ...tdsCommon, ['Specific gravity', '1.10 at 25 °C'], ['Viscosity', '73 KU at 25 °C'], ['Coverage area', '110–120 sqft / litre / 2 coats'], ['Gloss', 'Soft sheen']],
  },
  {
    slug: 'gulmohareconomyinterioremulsion.html', name: 'Gulmohar Economy Interior Emulsion', category: 'Interior',
    image: 'images/GulMohar.jpg',
    pdf: 'images/Octagreen_Interior_Leaflet_Final.pdf', pdfLabel: 'Download Interior Leaflet (PDF)',
    metaDescription: 'Gulmohar Economy Interior Emulsion — matt-finish, durable, cost-effective, with great coverage for everyday homes.',
    description: 'Gulmohar Economy Interior Emulsion with matt finish is durable, water-repellent, UV-resistant and resistant to fungus, algae and bacteria — with very good coverage, best suited for everyday interior surfaces.',
    benefits: 'Resistance to weathering (UV, fungus, water) and blistering. Low VOC. High coverage area with desirable ease of application. Very cost-effective.',
    usage: usageInteriorBase.concat(['Practical coverage: 90–110 sqft per litre (2 coats), depending on substrate porosity']),
    application: applicationStandard,
    tds: [['Type', 'Economy Interior Emulsion'], ...tdsCommon, ['Specific gravity', '1.10 at 25 °C'], ['Coverage area', '90–110 sqft / litre / 2 coats'], ['Gloss', 'Matt']],
  },
  {
    slug: 'firstcoatinteriorprimer.html', name: 'First Coat Interior Primer', category: 'Primer',
    image: 'images/FirstCoatInterior.jpg',
    pdf: 'images/Octagreen_Interior_Leaflet_Final.pdf', pdfLabel: 'Download Interior Leaflet (PDF)',
    metaDescription: 'First Coat Interior Primer — water-based acrylic primer with outstanding adhesion. The perfect undercoat for interior emulsion finishes.',
    description: 'A water-based acrylic interior primer of the finest quality — durable, water-repellent and resistant to fungus, algae and bacteria. The ideal undercoat for a wide variety of interior surfaces.',
    benefits: 'Outstanding adhesion thanks to a very high surface area of fine acrylic materials — it embeds into the surface rather than forming a film. High resistance to weathering and blistering. Low VOC. High coverage and easy application.',
    usage: ['Finish/Usage: Interior','Type: Water-based interior primer','Colour: White','Practical coverage: 120–160 sqft per litre per coat, depending on substrate porosity','Limitations: Not recommended for floors or decks','Surfaces: Interior plaster, drywall, concrete, masonry','Storage: Cool, dry place','Packing: 20 L · 10 L · 4 L · 1 L'],
    application: applicationStandard,
    tds: [['Type', 'Water-based Interior Primer'], ...tdsCommon, ['Specific gravity', '1.10 at 25 °C'], ['Coverage area', '120–160 sqft / litre / coat'], ['Gloss', 'Matt']],
  },
  {
    slug: 'firstcoatexteriorprimer.html', name: 'First Coat Exterior Primer', category: 'Primer',
    image: 'images/FirstCoatExterior.jpg',
    pdf: 'images/Octagreen__Exterior_Leaflet_Final.pdf', pdfLabel: 'Download Exterior Leaflet (PDF)',
    metaDescription: 'First Coat Exterior Primer — water-based acrylic primer with outstanding adhesion. Ideal undercoat for exterior emulsion finishes.',
    description: 'A water-based acrylic exterior primer of the finest quality — durable, water-repellent and resistant to fungus, algae and bacteria. The ideal undercoat for a wide variety of exterior surfaces.',
    benefits: 'Outstanding adhesion thanks to a very high surface area of fine acrylic materials — it embeds into the surface rather than forming a film. High resistance to weathering, UV and blistering. Low VOC. High coverage and easy application.',
    usage: ['Finish/Usage: Exterior','Type: Water-based exterior primer','Colour: White','Practical coverage: 110–140 sqft per litre per coat, depending on substrate porosity','Limitations: Not recommended for floors or decks','Surfaces: Exterior plaster, drywall, concrete, masonry','Storage: Cool, dry place','Packing: 20 L · 10 L · 4 L · 1 L'],
    application: applicationStandard,
    tds: [['Type', 'Water-based Exterior Primer'], ...tdsCommon, ['Specific gravity', '1.10 at 25 °C'], ['Coverage area', '110–140 sqft / litre / coat'], ['Gloss', 'Matt']],
  },
];

/* =========================================================
   Info pages
   ========================================================= */
const infoPages = [
  {
    slug: 'aboutoctagreen.html',
    title: 'About Octagreen Nano — Eco-Friendly Paint Manufacturer in Kerala, India',
    metaDescription: 'Learn about Octagreen Nano, a leading manufacturer of eco-friendly, low-VOC paints and waterproofing solutions in India. Be Green. Be Octagreen.',
    banner: { eyebrow: 'About Us', title: 'Our Company', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'About' }] },
    body: `
<section class="section">
  <div class="container">
    <div class="row-grid grid-3 reveal">
      <div class="feature-card"><div class="icon">${ICON.star}</div><h3>Quality Driven</h3><p>Continuous customer feedback drives our R&amp;D. Every batch is tested to industrial standards.</p></div>
      <div class="feature-card"><div class="icon">${ICON.users}</div><h3>Customer Focused</h3><p>From colour consultation to expert applicators — we adhere our process to your satisfaction.</p></div>
      <div class="feature-card"><div class="icon">${ICON.globe}</div><h3>Global Sourcing</h3><p>Raw materials from internationally recognised suppliers — quality you can see and feel.</p></div>
    </div>
    <div class="mt-3">${trustBar}</div>
  </div>
</section>

<section class="section section-muted">
  <div class="container container-sm">
    <div class="reveal">
      <span class="eyebrow">Company Overview</span>
      <h2>Be Green. Be Octagreen.</h2>
      <div class="divider"></div>
      <p class="lead">Octagreen Nano is a leading solution provider in specialised coatings — committed to applying nano-technology for the benefit of mankind through practical innovation.</p>
      <p>Our most revolutionary characteristic is the ability to meet industrial performance demands while posing no threat to the environment. This has positioned the company at the forefront of the eco-friendly specialty paint and coating industry. We offer state-of-the-art products in partnership with renowned overseas companies for industries including Power, Oil &amp; Gas, Refineries, Petrochemicals, Chemicals, Fertilizers, Paper &amp; Pulp, Iron &amp; Steel and Cement.</p>
      <p>News of the quality of Octagreen Nano has spread among infrastructure companies, architects, government consultants, developers, builders and painting professionals across India and beyond.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="split reverse">
      <div class="reveal">
        <span class="eyebrow">Eco-Friendly Mission</span>
        <h2>A clean, healthy environment — today and tomorrow</h2>
        <div class="divider"></div>
        <p>Octagreen gives foremost importance to environmental care. Our impeccable range of interior and exterior coatings is <strong>zero-VOC, water-thinnable and very low odour</strong> — safe, non-allergic, and gentle on your family and the planet.</p>
        <p>Volatile Organic Compounds (VOCs) are a known health hazard. They contribute to ground-level ozone, respiratory problems and indoor air pollution. Octagreen replaces VOC-heavy chemistry with modern, water-based formulations that perform without compromise.</p>
        <p>The result? Beautiful walls, breathable rooms, and a smaller footprint on the world we share.</p>
        <a href="contact-quote.html" class="btn btn-primary mt-2">Get a free quote</a>
      </div>
      <div class="split-media reveal">${pic('images/1920x960_3.jpg', 'Eco-friendly paints from Octagreen')}</div>
    </div>
  </div>
</section>

<section class="section section-tight">
  <div class="container">
    <div class="cta-banner">
      <div><h2 style="font-size:1.6rem">Plan a project with Octagreen</h2><p>Download our company brochure or talk to our team for colour consultation, on-site surveys and dealer locations.</p></div>
      <div class="actions">
        <a href="images/WeAreOctagreen.pdf" class="btn btn-light" download data-track="company_brochure">📘 Download Brochure</a>
        <a href="contact-quote.html" class="btn btn-on-dark">Request a Quote</a>
      </div>
    </div>
  </div>
</section>`,
  },

  {
    slug: 'awards.html',
    title: 'Awards & Recognition — Octagreen Nano',
    metaDescription: 'Octagreen Nano was selected by Industry Outlook as one of the Top 10 Most Promising Paint Manufacturers and Suppliers in India.',
    banner: { eyebrow: 'Recognition', title: 'Awards & Recognition', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'Awards' }] },
    body: `
<section class="section">
  <div class="container">
    <div class="split">
      <div class="reveal">
        <span class="eyebrow">Industry Outlook</span>
        <h2>Top 10 Most Promising Paint Brands in India</h2>
        <div class="divider"></div>
        <p>We are proud to announce that Octagreen Nano has been selected by <strong>Industry Outlook</strong> as one of the Top 10 Most Promising Paint Manufacturers and Suppliers in India.</p>
        <p>The Indian paint market is expected to cross ₹75,000 crores in value, driven by urbanisation, growing incomes and a shift from traditional whitewash to modern emulsion paints. Octagreen sits at the forefront of the eco-friendly segment — meeting industrial performance demands without harming the environment.</p>
        <blockquote style="border-left:4px solid var(--c-primary);padding:.5rem 0 .5rem 1.25rem;color:var(--c-text);font-style:italic">We have introduced a service segment to handle painting and coating jobs on-site with experienced contractors. We also pioneered an &ldquo;industry first&rdquo; — buying back empty containers from the site to help the earth decongest.</blockquote>
      </div>
      <div class="reveal">
        <div class="gallery-grid">
          ${pic('images/Award1.jpg', 'Promising Brand award')}
          ${pic('images/Award2.jpg', 'Industry recognition award')}
          ${pic('images/Award3.jpg', 'Octagreen recognition')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section-muted">
  <div class="container text-center">
    <div class="section-title reveal">
      <span class="eyebrow">Our Promise</span>
      <h2>Performance, without harming our environment</h2>
      <p>Octagreen offers customers a broad portfolio from a single source — backed by long-term reliability and around-the-clock support.</p>
    </div>
    <a href="contact-quote.html" class="btn btn-primary btn-lg">Get a quote</a>
  </div>
</section>`,
  },

  {
    slug: 'BeADealer.html',
    title: 'Become an Octagreen Dealer — Paint Dealership Opportunities in India',
    metaDescription: 'Join the Octagreen Nano dealer network. Eco-friendly paints, full product line, attractive margins, training & after-sales support. Apply today.',
    banner: { eyebrow: 'Partnership', title: 'Become a Dealer', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'Become a Dealer' }] },
    body: `
<section class="section">
  <div class="container">
    <div class="split">
      <div class="reveal">
        <div class="gallery-grid">
          ${pic('images/Dealer1.jpg', 'Octagreen dealer network')}
          ${pic('images/Dealer2.jpg', 'Dealer training')}
          ${pic('images/Dealer3.jpg', 'Showroom display')}
          ${pic('images/Dealer4.jpg', 'Customer engagement')}
        </div>
      </div>
      <div class="reveal">
        <span class="eyebrow">Dealer Benefits</span>
        <h2>Partner with India's most promising eco-paint brand</h2>
        <div class="divider"></div>
        <p>Octagreen Nano is committed to applying nanotechnology for the benefit of mankind. Our paints &amp; coatings are robust, long-lasting and environment-friendly — and we share our success with our dealer network.</p>
      </div>
    </div>

    <div class="row-grid grid-3 reveal" style="margin-top:3rem">
      <div class="feature-card"><h4>Full Line Access</h4><p>Stock the complete Octagreen portfolio — interior, exterior, primers and waterproofing.</p></div>
      <div class="feature-card"><h4>Product Innovation</h4><p>First access to every new formulation our R&amp;D team brings to market.</p></div>
      <div class="feature-card"><h4>Eco Edge</h4><p>Differentiate your store with India's leading low-VOC, eco-friendly paint range.</p></div>
      <div class="feature-card"><h4>Attractive Margins</h4><p>Highest profit margins among industry players — we share the success.</p></div>
      <div class="feature-card"><h4>Free Display Stand</h4><p>Attractive in-store display, name board, and Octagreen branding for your counter.</p></div>
      <div class="feature-card"><h4>Annual Tie-Ups</h4><p>Selected dealers participate in our Annual Tie-Up Programmes for added benefits.</p></div>
      <div class="feature-card"><h4>Personal Service</h4><p>Field sales representatives connect you with painting contractors, architects and builders.</p></div>
      <div class="feature-card"><h4>Training &amp; Support</h4><p>Periodic training programmes for shop staff and applicators, plus 24×7 after-sales support.</p></div>
      <div class="feature-card"><h4>Painter Meets</h4><p>Regular painter engagement events to grow your local applicator network.</p></div>
    </div>
  </div>
</section>

<section class="section section-muted">
  <div class="container">
    <div style="max-width:720px;margin:0 auto" class="reveal">
      <span class="eyebrow">Apply Today</span>
      <h2>Tell us about your business</h2>
      <p class="text-muted">A member of our channel team will get in touch within one business day.</p>
      <form data-form="lead" data-mailto="mail@octagreennano.com" data-name="dealer" class="form form-card mt-2">
        <input type="hidden" name="subject" value="Dealer enquiry from octagreennano.com">
        ${honeypot}
        <div class="form-row cols-2">
          <div class="field"><label for="name">Full name *</label><input id="name" name="name" type="text" required></div>
          <div class="field"><label for="phone">Phone *</label><input id="phone" name="phone" type="tel" required></div>
        </div>
        <div class="form-row cols-2">
          <div class="field"><label for="email">Email *</label><input id="email" name="email" type="email" required></div>
          <div class="field"><label for="city">City</label><input id="city" name="city" type="text"></div>
        </div>
        <div class="field"><label for="business">About your business</label><textarea id="business" name="message" placeholder="Existing shop or new venture? Years in trade? Square-feet of retail space? Markets you serve…"></textarea></div>
        <div class="form-status"></div>
        <button type="submit" class="btn btn-primary btn-lg">Send dealer application</button>
      </form>
    </div>
  </div>
</section>`,
  },

  {
    slug: 'career.html',
    title: 'Careers at Octagreen Nano — Join Our Eco-Paint Team',
    metaDescription: 'Join Octagreen Nano. We are looking for talented, self-driven people to learn, engage and contribute to a colourful, challenging world.',
    banner: { eyebrow: 'Careers', title: 'Join the Octagreen team', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'Careers' }] },
    body: `
<section class="section">
  <div class="container container-sm">
    <div class="reveal">
      <span class="eyebrow">Now Hiring</span>
      <h2>Build your career with India's most promising eco-paint brand</h2>
      <div class="divider"></div>
      <p>We are looking for talented, young, self-driven people. Octagreen invites you to learn, engage and contribute to a colourful, challenging world.</p>
      <p>If you are ready to work with us, send your detailed résumé. We will verify your application confidentially and get back to you soon.</p>

      <div class="row-grid grid-3" style="margin:2rem 0">
        <div class="feature-card"><h4>Sales &amp; Channel</h4><p>Build relationships with dealers, architects and contractors across India.</p></div>
        <div class="feature-card"><h4>R&amp;D / Lab</h4><p>Develop next-generation low-VOC formulations with our nano-technology team.</p></div>
        <div class="feature-card"><h4>Site Engineers</h4><p>Lead waterproofing and painting projects on-site with quality and care.</p></div>
      </div>

      <h3 style="margin-top:2rem">Apply now</h3>
      <form data-form="lead" data-mailto="mail@octagreennano.com" data-name="career" class="form form-card">
        <input type="hidden" name="subject" value="Career application from octagreennano.com">
        ${honeypot}
        <div class="form-row cols-2">
          <div class="field"><label for="name">Full name *</label><input id="name" name="name" type="text" required></div>
          <div class="field"><label for="phone">Phone *</label><input id="phone" name="phone" type="tel" required></div>
        </div>
        <div class="form-row cols-2">
          <div class="field"><label for="email">Email *</label><input id="email" name="email" type="email" required></div>
          <div class="field"><label for="role">Role you are interested in</label><input id="role" name="role" type="text" placeholder="e.g. Sales Executive — Kochi"></div>
        </div>
        <div class="field"><label for="message">Your background</label><textarea id="message" name="message" placeholder="Tell us about your experience, current role, and what excites you about Octagreen…"></textarea></div>
        <p class="text-muted" style="font-size:.88rem">After clicking send, please attach your CV in the email window that opens. Or email <a href="mailto:mail@octagreennano.com">mail@octagreennano.com</a> directly.</p>
        <div class="form-status"></div>
        <button type="submit" class="btn btn-primary btn-lg">Submit application</button>
      </form>
    </div>
  </div>
</section>`,
  },

  {
    slug: 'contact.html',
    title: 'Contact Octagreen Nano — Kochi & Bengaluru | +91 8606511141',
    metaDescription: 'Get in touch with Octagreen Nano. Offices in Kochi and Bengaluru. Call +91 8606511141 / 1800 313 6949 or email mail@octagreennano.com.',
    banner: { eyebrow: 'Get in Touch', title: 'Contact Us', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'Contact' }] },
    body: `
<section class="section">
  <div class="container">
    <div class="layout-sidebar">
      <div class="reveal">
        <h2>We'd love to hear from you</h2>
        <p class="text-muted">Whether you need a project quote, dealer location, or a colour consultation — drop us a note and we'll respond within one business day.</p>

        <form data-form="lead" data-mailto="mail@octagreennano.com" data-name="contact" class="form form-card mt-3">
          <input type="hidden" name="subject" value="Enquiry from octagreennano.com (Contact)">
          ${honeypot}
          <div class="form-row cols-2">
            <div class="field"><label for="name">Full name *</label><input id="name" name="name" type="text" required></div>
            <div class="field"><label for="phone">Phone *</label><input id="phone" name="phone" type="tel" required></div>
          </div>
          <div class="form-row cols-2">
            <div class="field"><label for="email">Email *</label><input id="email" name="email" type="email" required></div>
            <div class="field"><label for="topic">I'd like to discuss</label>
              <select id="topic" name="quote_for">
                <option>Interior painting</option><option>Exterior painting</option><option>Waterproofing</option><option>Dealer enquiry</option><option>Other</option>
              </select>
            </div>
          </div>
          <div class="field"><label for="message">Message</label><textarea id="message" name="message" placeholder="Tell us about your project — location, size, timeline…"></textarea></div>
          <div class="form-status"></div>
          <button type="submit" class="btn btn-primary btn-lg">Send message</button>
        </form>
      </div>

      <aside class="sidebar">
        <div class="sidebar-widget"><h4>Branch Office — Kochi</h4>
          <p style="margin:0 0 .5rem">Shakthi Enclave, Perandoor Road, Elamakkara P.O., Kochi 682026, Kerala</p>
          <p style="margin:.25rem 0"><a href="tel:+918606511141">+91 86065 11141</a></p>
          <p style="margin:.25rem 0"><a href="tel:04842539439">0484 2539439</a></p>
          <p style="margin:.25rem 0"><a href="tel:18003136949">Toll-Free 1800 313 6949</a></p>
        </div>
        <div class="sidebar-widget"><h4>Head Office — Bengaluru</h4>
          <p style="margin:0 0 .5rem">#39, NGEF Lane, Indira Nagar, Bengaluru 560038, Karnataka</p>
          <p style="margin:.25rem 0"><a href="tel:08025043280">080 2504 3280</a></p>
        </div>
        <div class="sidebar-widget"><h4>Email</h4>
          <p style="margin:0"><a href="mailto:mail@octagreennano.com">mail@octagreennano.com</a> (Sales)</p>
          <p style="margin:.25rem 0 0"><a href="mailto:prathish@octagreennano.com">prathish@octagreennano.com</a> (General)</p>
        </div>
        <div class="sidebar-widget"><h4>Hours</h4><p style="margin:0">Mon – Sat, 09:30 – 17:30</p></div>
        <div class="sidebar-widget">
          <h4>Brochure</h4>
          <a href="images/WeAreOctagreen.pdf" class="btn btn-secondary btn-block" download data-track="company_brochure">📘 Company Brochure (PDF)</a>
        </div>
      </aside>
    </div>
  </div>
</section>

<section style="height:420px;background:var(--c-bg-tint);position:relative;overflow:hidden">
  <iframe loading="lazy" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15716.501405912886!2d76.2796955388873!3d10.006503285546671!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d71ff7fa4e1%3A0xb0e1757eb985fe5e!2sOctagreen%20Nano%20Products%20India%20Pvt.Ltd!5e0!3m2!1sen!2sin!4v1609831799676!5m2!1sen!2sin" style="position:absolute;inset:0;width:100%;height:100%;border:0" referrerpolicy="no-referrer-when-downgrade" title="Octagreen Nano on Google Maps"></iframe>
</section>`,
  },

  {
    slug: 'contact-quote.html',
    title: 'Get a Free Quote — Painting & Waterproofing | Octagreen Nano',
    metaDescription: 'Request a free, no-obligation site quote for interior, exterior or waterproofing work. Same-day response from Octagreen Nano experts.',
    banner: { eyebrow: 'Free Quote', title: 'Get a free site quote', crumbs: [{ href: 'index.html', label: 'Home' }, { href: 'contact.html', label: 'Contact' }, { label: 'Get a Quote' }] },
    body: `
<section class="section">
  <div class="container">
    <div class="layout-sidebar">
      <div class="reveal">
        <h2>Tell us about your project</h2>
        <p class="text-muted">Free site visit · Same-day response · No-obligation quote</p>

        <form data-form="lead" data-mailto="mail@octagreennano.com" data-name="quote" class="form form-card mt-3">
          <input type="hidden" name="subject" value="Quote request from octagreennano.com">
          ${honeypot}
          <div class="form-row cols-2">
            <div class="field"><label for="name">Full name *</label><input id="name" name="name" type="text" required></div>
            <div class="field"><label for="phone">Phone *</label><input id="phone" name="phone" type="tel" required></div>
          </div>
          <div class="form-row cols-2">
            <div class="field"><label for="email">Email *</label><input id="email" name="email" type="email" required></div>
            <div class="field"><label for="quote_for">Quote for *</label>
              <select id="quote_for" name="quote_for" required>
                <option value="Interior painting">Interior painting</option>
                <option value="Exterior painting">Exterior painting</option>
                <option value="Waterproofing">Waterproofing</option>
                <option value="Other services">Other services</option>
              </select>
            </div>
          </div>
          <div class="form-row cols-2">
            <div class="field"><label for="city">City *</label><input id="city" name="city" type="text" required placeholder="Kochi, Bengaluru, etc."></div>
            <div class="field"><label for="area">Approx. area (sqft)</label><input id="area" name="area" type="text" placeholder="e.g. 1800 sqft"></div>
          </div>
          <div class="field"><label for="message">Project details</label><textarea id="message" name="message" placeholder="Surface type, current condition, preferred timeline, colour ideas…"></textarea></div>
          <div class="form-status"></div>
          <button type="submit" class="btn btn-primary btn-lg">Get my quote</button>
        </form>
      </div>

      <aside class="sidebar">
        <div class="sidebar-widget"><h4>Prefer to call?</h4>
          <p style="margin:0 0 1rem;color:var(--c-muted)">Talk to our project advisor for an instant estimate.</p>
          <a href="tel:+918606511141" class="btn btn-primary btn-block" data-track="sidebar_call">+91 86065 11141</a>
          <a href="tel:18003136949" class="btn btn-outline btn-block" style="margin-top:.6rem">Toll-Free 1800 313 6949</a>
        </div>
        <div class="sidebar-widget"><h4>Or WhatsApp</h4>
          <p style="margin:0 0 1rem;color:var(--c-muted)">Send photos of your wall — get an indicative quote in minutes.</p>
          <a href="${SOCIAL.whatsapp}?text=Hi%20Octagreen,%20I%27d%20like%20a%20quote." target="_blank" rel="noopener" class="btn btn-primary btn-block" style="background:#25D366" data-track="sidebar_whatsapp">Chat on WhatsApp</a>
        </div>
        <div class="sidebar-widget"><h4>What you get</h4>
          <ul style="list-style:none;padding:0;margin:0;font-size:.92rem">
            <li style="padding:.35rem 0;color:var(--c-text)">✓ Free site visit</li>
            <li style="padding:.35rem 0;color:var(--c-text)">✓ Itemised quote</li>
            <li style="padding:.35rem 0;color:var(--c-text)">✓ Colour consultation</li>
            <li style="padding:.35rem 0;color:var(--c-text)">✓ Eco-friendly low-VOC paints</li>
            <li style="padding:.35rem 0;color:var(--c-text)">✓ Skilled applicators</li>
          </ul>
        </div>
        <div class="sidebar-widget">
          <h4>Brochure</h4>
          <a href="images/WeAreOctagreen.pdf" class="btn btn-secondary btn-block" download data-track="company_brochure">📘 Company Brochure (PDF)</a>
        </div>
      </aside>
    </div>
  </div>
</section>`,
  },

  {
    slug: 'feedbackform.html',
    title: 'Customer Feedback — Help Us Get Better | Octagreen Nano',
    metaDescription: 'Tell us how we did. Your feedback shapes the future of Octagreen Nano paints and services.',
    banner: { eyebrow: 'Feedback', title: 'How did we do?', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'Feedback' }] },
    body: `
<section class="section">
  <div class="container container-sm">
    <div class="reveal">
      <h2>Your feedback matters</h2>
      <p class="text-muted">We are committed to making every Octagreen experience excellent. Tell us what worked, what didn't, and what we can do better.</p>

      <form data-form="lead" data-mailto="mail@octagreennano.com" data-name="feedback" class="form form-card mt-3">
        <input type="hidden" name="subject" value="Customer feedback from octagreennano.com">
        ${honeypot}
        <div class="form-row cols-2">
          <div class="field"><label for="name">Full name</label><input id="name" name="name" type="text"></div>
          <div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel"></div>
        </div>
        <div class="form-row cols-2">
          <div class="field"><label for="email">Email *</label><input id="email" name="email" type="email" required></div>
          <div class="field"><label for="topic">Topic</label>
            <select id="topic" name="quote_for"><option>Product quality</option><option>Service experience</option><option>Dealer / store</option><option>Website</option><option>Suggestion</option></select>
          </div>
        </div>
        <div class="field"><label for="message">Your feedback *</label><textarea id="message" name="message" required placeholder="Tell us in your own words…"></textarea></div>
        <div class="form-status"></div>
        <button type="submit" class="btn btn-primary btn-lg">Send feedback</button>
      </form>
    </div>
  </div>
</section>`,
  },

  {
    slug: 'ExpertPaitingService.html',
    title: 'Expert Painting Services — Hassle-Free, Professional Painters | Octagreen',
    metaDescription: 'End-to-end professional painting services from Octagreen — interior, exterior and waterproofing. Tools, painters, paint and supervision included.',
    banner: { eyebrow: 'Professional Service', title: 'Expert Painting Services', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'Painting Services' }] },
    body: `
<section class="section">
  <div class="container">
    <div class="split">
      <div class="reveal">
        <div class="gallery-grid">
          ${pic('images/EP600x400_1.jpg', 'Octagreen painting service in progress')}
          ${pic('images/EP600x400_2.jpg', 'Interior wall preparation')}
          ${pic('images/EP600x400_3.jpg', 'Professional finishing')}
          ${pic('images/EP600x400_4.jpg', 'Completed Octagreen project')}
        </div>
      </div>
      <div class="reveal">
        <span class="eyebrow">Hassle-Free Service</span>
        <h2>Painting done right — start to finish</h2>
        <div class="divider"></div>
        <p>Octagreen offers hassle-free, end-to-end painting services with our expert panel of contractors. Painters, paint, tools, drop sheets and supervision — all from one trusted team.</p>
        <p>Different packages with budget-friendly options to fit your pocket. We help you choose the right paint based on per-sqft cost, finish, washability and durability — for both fresh painting and repainting.</p>
        <a href="contact-quote.html" class="btn btn-primary btn-lg mt-2">Get a free quote</a>
      </div>
    </div>

    <div class="row-grid grid-3 reveal" style="margin-top:3rem">
      <div class="feature-card"><h4>Site Survey</h4><p>Free site visit to assess wall condition, area and your colour preferences.</p></div>
      <div class="feature-card"><h4>Surface Prep</h4><p>Crack filling, sanding, washing, primer — done by trained applicators.</p></div>
      <div class="feature-card"><h4>Quality Paint</h4><p>Low-VOC, water-based Octagreen paints — kinder to your family and the air.</p></div>
      <div class="feature-card"><h4>Skilled Painters</h4><p>Vetted, in-house contractor network — neat work, clean finish.</p></div>
      <div class="feature-card"><h4>On-time Delivery</h4><p>Project schedule shared upfront. Daily updates. Clean handover.</p></div>
      <div class="feature-card"><h4>After-care</h4><p>Touch-up support after handover. Buy-back of empty containers.</p></div>
    </div>
  </div>
</section>

<section class="section section-tight">
  <div class="container">
    <div class="cta-banner">
      <div><h2 style="font-size:1.6rem">Ready to refresh your home?</h2><p>Get a free site visit and a transparent quote in 24 hours.</p></div>
      <div class="actions"><a href="contact-quote.html" class="btn btn-light">Free quote</a><a href="tel:+918606511141" class="btn btn-on-dark" data-track="cta_call">Call +91 86065 11141</a></div>
    </div>
  </div>
</section>`,
  },

  {
    slug: 'News&Events.html',
    title: 'News & Events — Octagreen Nano',
    metaDescription: 'Latest news, project showcases and events from Octagreen Nano — India\'s most promising eco-friendly paint manufacturer.',
    banner: { eyebrow: 'Latest', title: 'News & Events', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'News & Events' }] },
    body: `
<section class="section">
  <div class="container">
    <div class="row-grid grid-2 reveal" style="max-width:880px;margin:0 auto">
      <article class="product-card">
        <a href="awards.html" class="product-card-link">
          <div class="media">${pic('images/Award1.jpg', 'Most Promising Brand award certificate')}</div>
          <div class="body"><h3>Awarded "Most Promising Paint Brand"</h3><p>Octagreen Nano was selected by Industry Outlook as one of the Top 10 Most Promising Paint Manufacturers and Suppliers in India.</p><span class="more">Read more</span></div>
        </a>
      </article>
      <article class="product-card">
        <a href="izonil.html" class="product-card-link">
          <div class="media">${pic('images/izonil.jpg', 'Izonil Waterproof Plaster')}</div>
          <div class="body"><h3>Izonil — waterproof + breathable in one step</h3><p>The dry-mix plastering mortar that replaces general-purpose plaster and waterproof membranes simultaneously. EN 998-1 certified, resistant to 1 BAR water pressure.</p><span class="more">See the product</span></div>
        </a>
      </article>
    </div>
    <div class="text-center" style="margin-top:3rem"><p class="text-muted">Want to feature your project on our News page? <a href="contact.html">Get in touch</a>.</p></div>
  </div>
</section>`,
  },
];

/* =========================================================
   New: FAQ page (with FAQ schema)
   ========================================================= */
const faqs = [
  { q: 'Are Octagreen paints safe for children and pregnant women?', a: 'Yes. All Octagreen interior emulsions are water-based, low-VOC and lead-free. They have very light odour and are safe for nurseries, hospitals and offices. We meet the safety standards for indoor environments.' },
  { q: 'How long does it take for Octagreen paints to dry?', a: 'Most of our emulsions become surface-dust-free in about 4 hours under normal conditions, with a recoat time of 4 hours. Drying may vary with humidity and temperature.' },
  { q: 'How many coats do you recommend?', a: 'For new work, one coat of First Coat primer + two coats of finish emulsion is the recommended system. For repaints, prep the surface (sanding/washing) and apply two coats of finish.' },
  { q: 'How much paint will I need for my home?', a: 'A rough rule: 1 litre covers about 110–140 sqft per coat for interiors and 60–80 sqft per coat for exteriors. Send us your wall area or photos via WhatsApp and we will give you an exact estimate.' },
  { q: 'Do you offer custom colours?', a: 'Yes. Our 4 bases (white / light / medium / dark) are tintable to thousands of custom shades using universal colorants. Visit our <a href="colours.html">colour palette page</a> for popular options.' },
  { q: 'Do Octagreen paints work in coastal Kerala humidity?', a: 'Absolutely. Our exterior range — All Weather, Aura and Ultra Guard — is specifically engineered for monsoon, coastal and high-humidity climates. Anti-fungal, anti-algae, UV-stable.' },
  { q: 'What is Izonil and how is it different from regular plaster?', a: 'Izonil is a 100% waterproof, breathable, dehumidifying plastering mortar. It replaces general-purpose plaster AND a separate waterproof membrane in one step. It resists 1 BAR of water pressure while still letting walls breathe and dry out.' },
  { q: 'Do you provide painting services or just the paint?', a: 'Both. Our <a href="ExpertPaitingService.html">Expert Painting Services</a> include trained applicators, supervision, materials and post-job clean-up. Or buy paint from any of our authorised dealers and use your own painter.' },
  { q: 'What is the warranty on your paints?', a: 'Performance varies by product and substrate. Premium and luxury emulsions typically deliver 5–7 years of finish life; exterior emulsions 5–10 years; primer systems support the full life of the topcoat. Detailed warranty information is shared at the quote stage.' },
  { q: 'How can I become an Octagreen dealer?', a: 'Fill out the form on our <a href="BeADealer.html">Become a Dealer</a> page. Our channel team responds within one business day. We offer attractive margins, training, free display stands and full product line access.' },
  { q: 'Are there minimum order quantities?', a: 'For retail purchases through dealers — no MOQ. For direct project supply or bulk B2B, we offer pricing tiers starting from typical project sizes. Contact us for a quote.' },
  { q: 'Do you ship across India?', a: 'Yes. We supply across India through dealer networks and direct project supply. We have offices in Bengaluru and Kochi.' },
];

function faqPage() {
  const jsonLd = `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({
    '@type': 'Question', name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') },
  })),
}, null, 2)}
</script>`;

  return genericPage({
    title: 'FAQs — Eco-Friendly Paint &amp; Waterproofing Questions | Octagreen Nano',
    metaDescription: 'Common questions about Octagreen eco-friendly paints, waterproofing solutions, drying times, coverage, dealer programmes and painting services. Answered.',
    slug: 'faq.html',
    banner: { eyebrow: 'Help Centre', title: 'Frequently asked questions', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'FAQs' }] },
    jsonLd,
    body: `
<section class="section">
  <div class="container">
    <div class="faq">
      ${faqs.map(f => `<div class="faq-item"><button class="faq-q" aria-expanded="false">${f.q}</button><div class="faq-a"><p>${f.a}</p></div></div>`).join('\n      ')}
    </div>

    <div class="text-center mt-3">
      <p class="text-muted">Still have questions? We're here to help.</p>
      <a href="contact.html" class="btn btn-primary">Contact us</a>
      <a href="${SOCIAL.whatsapp}?text=Hi%20Octagreen,%20I%20have%20a%20question." target="_blank" rel="noopener" class="btn btn-outline" data-track="faq_whatsapp">WhatsApp us</a>
    </div>
  </div>
</section>`,
  });
}

/* =========================================================
   New: Colour palette page
   ========================================================= */
const palette = {
  whites: [
    ['Cloud Drift', '#F4F0E8'], ['Coconut', '#F5F1E8'], ['Linen White', '#F1ECDF'],
    ['Pure Snow', '#FFFFFF'], ['Soft Vanilla', '#F4EBD5'], ['Pearl Mist', '#EDEDE6'],
  ],
  greens: [
    ['Forest Whisper', '#5C8362'], ['Sage Garden', '#A4B79B'], ['Mint Mojito', '#BFD4C0'],
    ['Eucalyptus', '#7C9A85'], ['Tea Leaf', '#506B4D'], ['Aloe Light', '#D5E2C7'],
    ['Olive Grove', '#6F7A4A'], ['Pistachio', '#C2D6A4'],
  ],
  blues: [
    ['Coastal Mist', '#A9C2CC'], ['Ocean Depth', '#365C73'], ['Sky Whisper', '#CFE0E8'],
    ['Indigo Eve', '#2B3B5C'], ['Powder Blue', '#B8D4DD'], ['Lagoon', '#5A8FA0'],
  ],
  warms: [
    ['Terracotta', '#C5704F'], ['Sunset Apricot', '#E5B286'], ['Amber Glow', '#D49A4F'],
    ['Bronze Earth', '#8C6442'], ['Saffron', '#E2A23F'], ['Cinnamon', '#A36645'],
    ['Rose Quartz', '#D9A8A1'], ['Coral Reef', '#E8907E'],
  ],
  greys: [
    ['Cement Soft', '#B8B6B0'], ['Rain Cloud', '#9BA0A1'], ['Charcoal', '#3F4344'],
    ['Stone Wash', '#C4C0B8'], ['Slate Whisper', '#7C7E7B'], ['Pewter', '#909393'],
  ],
};

function coloursPage() {
  const renderSection = (title, list) => `
<div class="palette-section reveal">
  <h3>${title}</h3>
  <div class="swatch-grid">
    ${list.map(([name, hex]) => `<div class="swatch"><span class="chip" style="background:${hex}"></span><div class="info"><div class="name">${name}</div><div class="code">${hex.toUpperCase()}</div></div></div>`).join('')}
  </div>
</div>`;
  return genericPage({
    title: 'Octagreen Colour Palette — Eco-Friendly Paint Colours for Your Home',
    metaDescription: 'Browse the Octagreen Nano colour palette — popular interior and exterior paint shades. Tintable to thousands of custom colours. Free colour consultation.',
    slug: 'colours.html',
    banner: { eyebrow: 'Colour Palette', title: 'Find your favourite shade', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'Colours' }] },
    body: `
<section class="section">
  <div class="container">
    <div class="section-title reveal">
      <span class="eyebrow">Inspiration</span>
      <h2>Curated Octagreen colour palette</h2>
      <p>Popular shades from our 4-base tinting system. Don't see your favourite? Our 4 bases (white, light, medium, dark) tint to thousands of custom colours using universal colorants.</p>
    </div>
    ${renderSection('Whites &amp; Neutrals', palette.whites)}
    ${renderSection('Greens', palette.greens)}
    ${renderSection('Blues', palette.blues)}
    ${renderSection('Warms', palette.warms)}
    ${renderSection('Greys &amp; Stones', palette.greys)}
    <div class="text-center mt-3">
      <p class="text-muted">Screen colours are indicative only. Order a colour swatch sample for accurate matching.</p>
      <a href="contact-quote.html" class="btn btn-primary">Request a free colour consultation</a>
      <a href="${SOCIAL.whatsapp}?text=Hi%20Octagreen,%20I%27d%20like%20a%20colour%20consultation." target="_blank" rel="noopener" class="btn btn-outline" data-track="colour_whatsapp">WhatsApp us</a>
    </div>
  </div>
</section>`,
  });
}

/* =========================================================
   New: Privacy policy
   ========================================================= */
function privacyPage() {
  return genericPage({
    title: 'Privacy Policy — Octagreen Nano',
    metaDescription: 'How Octagreen Nano collects, uses, and protects your personal information when you use our website or contact us.',
    slug: 'privacy.html',
    banner: { eyebrow: 'Legal', title: 'Privacy Policy', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'Privacy' }] },
    body: `
<section class="section">
  <div class="container container-sm">
    <article class="article">
      <p class="text-muted">Last updated: <span data-year>2026</span></p>
      <p>This Privacy Policy explains how Octagreen Nano Products India Pvt. Ltd. ("we", "us", "our") collects, uses and protects your personal information when you use our website (octagreennano.com), submit forms, or contact us.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Contact details</strong> — name, phone number, email address, city — when you submit a quote, feedback, dealership or career form.</li>
        <li><strong>Project details</strong> — area, surface type, project description — when you request a quote.</li>
        <li><strong>Technical data</strong> — IP address, browser type, pages visited — collected automatically by our hosting provider and analytics tools.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To respond to your enquiries, provide quotes and complete services you request.</li>
        <li>To send you order updates and project communication where applicable.</li>
        <li>To improve our website and services through aggregate analytics (no individual tracking without consent).</li>
        <li>We do not sell your data.</li>
      </ul>

      <h2>How we store and protect data</h2>
      <p>Personal information is stored securely on our internal CRM and email systems. Access is restricted to authorised employees on a need-to-know basis.</p>

      <h2>Cookies &amp; analytics</h2>
      <p>Our website uses essential cookies for the theme preference (dark/light mode). When analytics is enabled, we use Google Analytics 4 to understand aggregate traffic patterns. No personally identifying data is shared with Google.</p>

      <h2>Your rights</h2>
      <p>You can request access, correction or deletion of your personal data at any time. Email <a href="mailto:mail@octagreennano.com">mail@octagreennano.com</a> with your request and we will respond within one week.</p>

      <h2>Third-party services</h2>
      <p>Our website embeds Google Maps (for our office locations) and may use a form-handling service such as Formspree to deliver form submissions to our inbox. These third parties have their own privacy policies.</p>

      <h2>Updates to this policy</h2>
      <p>We may update this policy from time to time. The "last updated" date at the top will reflect the most recent revision.</p>

      <h2>Contact</h2>
      <p>For privacy-related questions, contact <a href="mailto:mail@octagreennano.com">mail@octagreennano.com</a> or write to us at Octagreen Nano Products India Pvt. Ltd., 48/2138, Shakthi Enclave, Perandoor Road, Elamakkara P.O., Kochi 682026, Kerala.</p>
    </article>
  </div>
</section>`,
  });
}

/* =========================================================
   New: Terms of use
   ========================================================= */
function termsPage() {
  return genericPage({
    title: 'Terms of Use — Octagreen Nano',
    metaDescription: 'The terms governing your use of the Octagreen Nano website and services.',
    slug: 'terms.html',
    banner: { eyebrow: 'Legal', title: 'Terms of Use', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'Terms' }] },
    body: `
<section class="section">
  <div class="container container-sm">
    <article class="article">
      <p class="text-muted">Last updated: <span data-year>2026</span></p>
      <p>These Terms of Use govern your access to and use of the website at octagreennano.com (the "Site"), operated by Octagreen Nano Products India Pvt. Ltd. ("Company", "we", "us"). By using the Site, you agree to these terms.</p>

      <h2>Use of content</h2>
      <p>All content on this Site — including text, images, logos, product specifications and design — is the property of Octagreen Nano Products India Pvt. Ltd. unless otherwise stated. You may view and print pages for personal, non-commercial use. Re-publication or commercial use requires written permission.</p>

      <h2>Product information</h2>
      <p>Product descriptions, technical data and prices are provided in good faith and are correct to the best of our knowledge at the time of publication. They may change without notice. Coverage rates depend on substrate condition. Final pricing is confirmed at the quote stage.</p>

      <h2>Colour reproduction</h2>
      <p>Paint colours shown on this Site are indicative only. Screen colours vary; physical swatch samples should be used for final colour selection.</p>

      <h2>Quotes &amp; services</h2>
      <p>Site quotes are estimates based on the information you provide. A formal site visit may be required for a binding quote. Painting and waterproofing services are subject to our standard terms of engagement, shared at the quote stage.</p>

      <h2>External links</h2>
      <p>The Site may contain links to third-party websites (including social media). We are not responsible for the content or privacy practices of those sites.</p>

      <h2>Limitation of liability</h2>
      <p>The Site is provided "as is". We make no warranties about uninterrupted availability or absolute accuracy. To the maximum extent permitted by law, we are not liable for any indirect or consequential loss arising from your use of the Site.</p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India. Any dispute is subject to the exclusive jurisdiction of the courts at Kochi, Kerala.</p>

      <h2>Contact</h2>
      <p>For questions about these Terms, contact <a href="mailto:mail@octagreennano.com">mail@octagreennano.com</a>.</p>
    </article>
  </div>
</section>`,
  });
}

/* =========================================================
   New: 404
   ========================================================= */
function notFoundPage() {
  return genericPage({
    title: 'Page not found — Octagreen Nano',
    metaDescription: 'Sorry, the page you were looking for could not be found.',
    slug: '404.html',
    body: `
<section class="error-page">
  <div class="container">
    <div class="code">404</div>
    <h1>This page got lost in the paint cans.</h1>
    <p class="text-muted" style="max-width:520px;margin:0 auto 2rem">The link may be broken or the page may have moved. Try one of the routes below.</p>
    <div style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap">
      <a href="index.html" class="btn btn-primary">Go home</a>
      <a href="index.html#products" class="btn btn-outline">Browse products</a>
      <a href="contact.html" class="btn btn-ghost">Contact us</a>
    </div>
  </div>
</section>`,
  });
}

/* =========================================================
   New: Local SEO landing — Painters in Kochi
   ========================================================= */
function kochiLandingPage() {
  const jsonLd = `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'LocalBusiness',
  name: 'Octagreen Nano — Kochi',
  image: SITE + '/images/logo.png',
  url: SITE + '/paint-services-kochi.html',
  telephone: '+91-8606511141',
  address: { '@type': 'PostalAddress', streetAddress: '48/2138, Shakthi Enclave, Perandoor Road, Elamakkara P.O.', addressLocality: 'Kochi', addressRegion: 'Kerala', postalCode: '682026', addressCountry: 'IN' },
  geo: { '@type': 'GeoCoordinates', latitude: '10.0065', longitude: '76.2796' },
  openingHours: 'Mo-Sa 09:30-17:30',
  areaServed: 'Kochi, Ernakulam, Aluva, Kakkanad, Edappally, Vyttila, Kaloor, Thrippunithura',
}, null, 2)}
</script>`;
  return genericPage({
    title: 'Painters in Kochi — Eco-Friendly Painting & Waterproofing Service | Octagreen',
    metaDescription: 'Looking for trusted painters in Kochi? Octagreen Nano provides expert interior, exterior and waterproofing services across Ernakulam, Aluva, Kakkanad and Vyttila. Free quote.',
    slug: 'paint-services-kochi.html',
    banner: { eyebrow: 'Kochi Service Area', title: 'Painters &amp; Waterproofing in Kochi', crumbs: [{ href: 'index.html', label: 'Home' }, { href: 'ExpertPaitingService.html', label: 'Services' }, { label: 'Kochi' }] },
    jsonLd,
    body: `
<section class="section">
  <div class="container">
    <div class="split">
      <div class="reveal">
        <span class="eyebrow">Local · Kochi</span>
        <h2>Eco-friendly painting service across Ernakulam district</h2>
        <div class="divider"></div>
        <p class="lead">Octagreen Nano is headquartered in Elamakkara, Kochi — and we serve homes &amp; commercial projects across the Ernakulam district with low-VOC paints and qualified applicators.</p>
        <p>Whether you're refreshing a 2-bedroom flat in Edappally or sealing a leaky terrace in Aluva, our team can survey your site, recommend the right system from our paint range, and deliver to schedule.</p>
        <div class="row-grid grid-2 mt-3">
          <div><strong>Interior painting</strong><p class="text-muted" style="margin:.25rem 0 0">Free site visit · Itemised quote</p></div>
          <div><strong>Exterior painting</strong><p class="text-muted" style="margin:.25rem 0 0">Weather-resistant systems</p></div>
          <div><strong>Waterproofing</strong><p class="text-muted" style="margin:.25rem 0 0">Terrace · Walls · Bathrooms</p></div>
          <div><strong>Site visit</strong><p class="text-muted" style="margin:.25rem 0 0">Free across Ernakulam district</p></div>
        </div>
        <div class="mt-3"><a href="contact-quote.html" class="btn btn-primary btn-lg">Get a free Kochi quote</a></div>
      </div>
      <div class="split-media reveal">${pic('images/JGTApartment.jpg', 'Octagreen project in Kochi')}</div>
    </div>

    <h2 class="mt-3" style="margin-top:3rem">Areas we serve in &amp; around Kochi</h2>
    <div class="row-grid grid-3 reveal">
      ${['Edappally', 'Kakkanad', 'Aluva', 'Vyttila', 'Kaloor', 'Thrippunithura', 'Palarivattom', 'Vazhakkala', 'Elamakkara', 'Cheranalloor', 'Mattancherry', 'Fort Kochi'].map(area => `<div class="feature-card" style="padding:1rem 1.2rem"><h4 style="margin:0">📍 ${area}</h4></div>`).join('')}
    </div>

    ${trustBar}

    <h2 style="margin-top:3rem">Recent Kochi-area projects</h2>
    <div class="row-grid grid-3 reveal">
      ${projectCard('contact.html', 'images/JGTApartment.jpg', 'JGT Apartment', 'Kochi')}
      ${projectCard('contact.html', 'images/FederalGarden.jpg', 'Federal Garden', 'Aluva')}
      ${projectCard('contact.html', 'images/NoelTouch.jpg', 'Noel Touch Stone', 'Vazhakkala')}
    </div>
  </div>
</section>

<section class="section section-tight">
  <div class="container">
    <div class="cta-banner">
      <div><h2 style="font-size:1.5rem">Free Kochi site visit</h2><p>Tell us your address — we'll send a project advisor within 24 hours.</p></div>
      <div class="actions">
        <a href="contact-quote.html" class="btn btn-light">Get my quote</a>
        <a href="${SOCIAL.whatsapp}?text=Hi%20Octagreen,%20I%27m%20in%20Kochi%20and%20need%20a%20quote." target="_blank" rel="noopener" class="btn btn-on-dark" data-track="kochi_whatsapp">WhatsApp us</a>
      </div>
    </div>
  </div>
</section>`,
  });
}

/* =========================================================
   (Case studies removed — re-enable with real before/after photos.)
   ========================================================= */
function caseStudyPage_DISABLED(c) {
  const jsonLd = `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Article',
  headline: c.title, image: SITE + '/' + c.heroImage,
  author: { '@type': 'Organization', name: 'Octagreen Nano' },
  publisher: { '@type': 'Organization', name: 'Octagreen Nano Products India Pvt. Ltd.', logo: { '@type': 'ImageObject', url: SITE + '/images/logo.png' } },
}, null, 2)}
</script>`;
  return genericPage({
    title: c.title + ' — Octagreen Case Study',
    metaDescription: c.metaDescription,
    slug: c.slug, jsonLd,
    banner: { eyebrow: 'Case Study', title: c.heading, crumbs: [{ href: 'index.html', label: 'Home' }, { href: 'ExpertPaitingService.html', label: 'Services' }, { label: c.heading }] },
    body: `
<section class="section">
  <div class="container">
    <div class="row-grid grid-3 reveal" style="margin-bottom:2.5rem">
      <div class="feature-card"><h4>Location</h4><p>${c.location}</p></div>
      <div class="feature-card"><h4>Scope</h4><p>${c.scope}</p></div>
      <div class="feature-card"><h4>Products used</h4><p>${c.products}</p></div>
    </div>

    <article class="article">
      ${pic(c.heroImage, c.heading, { loading: 'eager' })}
      <h2>The brief</h2>
      <p>${c.brief}</p>
      <h2>Our approach</h2>
      <p>${c.approach}</p>
      <h2>The result</h2>
      <p>${c.result}</p>

      ${c.testimonial ? `<blockquote style="border-left:4px solid var(--c-primary);padding:1rem 0 1rem 1.5rem;background:var(--c-bg-soft);border-radius:0 var(--r-md) var(--r-md) 0;margin:2rem 0">
        <p style="margin:0;font-style:italic;color:var(--c-text)">${c.testimonial.text}</p>
        <p style="margin:1rem 0 0;font-family:var(--font-display);font-weight:700;color:var(--c-ink)">— ${c.testimonial.name}, ${c.testimonial.role}</p>
      </blockquote>` : ''}

      <h2>Related products</h2>
      <ul>${c.relatedProducts.map(p => `<li><a href="${p.href}">${p.label}</a></li>`).join('')}</ul>

      <div class="cta-banner reveal" style="margin-top:2rem">
        <div><h2 style="font-size:1.5rem">Want similar results?</h2><p>Tell us about your project and we'll put together a tailored proposal.</p></div>
        <div class="actions"><a href="contact-quote.html" class="btn btn-light">Request a quote</a><a href="tel:+918606511141" class="btn btn-on-dark" data-track="case_call">Call +91 86065 11141</a></div>
      </div>
    </article>
  </div>
</section>`,
  });
}

/* =========================================================
   New: Visualizer page (uses js/visualizer.js)
   ========================================================= */
function visualizerPage() {
  const jsonLd = `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'WebApplication',
  name: 'Octagreen Wall Colour Visualizer',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any (web)',
  url: SITE + '/visualizer.html',
  description: 'Try Octagreen Nano paint colours on a virtual living room, bedroom or exterior. Free online colour visualizer.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}, null, 2)}
</script>`;
  return genericPage({
    title: 'Wall Colour Visualizer — Try Paint Colours on a Virtual Room | Octagreen',
    metaDescription: 'Free interactive paint visualizer. Try 36+ Octagreen colours on a real-looking living room, bedroom or exterior — see how it looks before you buy.',
    slug: 'visualizer.html', jsonLd,
    banner: { eyebrow: 'Interactive · Free', title: 'Wall Colour Visualizer', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'Visualizer' }] },
    body: `
<section class="section">
  <div class="container">
    <div class="section-title reveal" style="margin-bottom:2rem">
      <p>Pick a room. Pick a surface. Tap a colour. We'll show you exactly how Octagreen will look on your walls — and you can save the result or send it to us on WhatsApp.</p>
    </div>

    <div class="vis-mode-bar">
      <div class="vis-mode-tabs">
        <button class="vis-mode-tab is-active" data-mode="preset">Pre-made room</button>
        <button class="vis-mode-tab" data-mode="photo">Upload your photo</button>
      </div>
      <div class="vis-time-tabs" aria-label="Time of day">
        <button class="vis-time-tab is-active" data-time="day" title="Day"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg></button>
        <button class="vis-time-tab" data-time="dusk" title="Dusk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 1 0 14 7 7 0 0 1 0-14z"/><path d="M2 22h20"/></svg></button>
        <button class="vis-time-tab" data-time="evening" title="Evening"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>
      </div>
    </div>

    <div class="visualizer-shell">
      <div>
        <div class="scene-tabs" id="vis-tabs"></div>
        <div class="vis-photo-upload" id="vis-photo-upload" hidden>
          <input type="file" id="vis-photo-input" accept="image/jpeg,image/png,image/webp" hidden>
          <label for="vis-photo-input" class="vis-photo-dropzone" id="vis-photo-dropzone">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:42px;height:42px;color:var(--c-primary)"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <strong>Drop a room photo here or click to browse</strong>
            <span style="color:var(--c-muted);font-size:.85rem">Then tap on any wall to paint it. Supports JPG / PNG / WebP up to 10 MB.</span>
          </label>
          <div class="vis-photo-tools" hidden id="vis-photo-tools">
            <button class="btn btn-ghost btn-sm" id="vis-photo-undo">↶ Undo last paint</button>
            <button class="btn btn-ghost btn-sm" id="vis-photo-reset">⟲ Start over</button>
            <button class="btn btn-ghost btn-sm" id="vis-photo-replace">📷 Use a different photo</button>
          </div>
        </div>
        <div class="visualizer-stage" id="vis-stage" aria-label="Wall colour preview">
          <p class="text-muted text-center" style="padding:4rem 1rem">Loading visualizer…</p>
        </div>
        <div id="vis-summary" style="margin-top:1rem;display:flex;gap:2rem;flex-wrap:wrap;font-size:.9rem;color:var(--c-muted)"></div>
        <div class="visualizer-actions">
          <button class="btn btn-primary" id="vis-save">📥 Save as image</button>
          <button class="btn btn-outline" id="vis-share-link">🔗 Copy share link</button>
          <button class="btn btn-outline" id="vis-wa" data-track="visualizer_whatsapp">💬 Send to WhatsApp</button>
          <button class="btn btn-ghost" id="vis-quote">Get a quote with this colour →</button>
        </div>
      </div>

      <aside class="visualizer-panel">
        <h4>1. Select a surface</h4>
        <div class="surface-picker" id="vis-surfaces"></div>
        <h4 style="margin-top:1.5rem">2. Pick a colour</h4>
        <div class="swatch-rail" id="vis-swatches"></div>
        <p class="text-muted" style="margin-top:1rem;font-size:.82rem">Screen colours are indicative. Order a real swatch sample for accurate matching. All colours are tintable from our 4-base system.</p>
        <div style="margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid var(--c-line)">
          <h4>Not sure which colour?</h4>
          <a href="quiz.html" class="btn btn-outline btn-block">Take the 60-second colour quiz →</a>
        </div>
      </aside>
    </div>

    <div class="row-grid grid-3 reveal" style="margin-top:3rem">
      <div class="feature-card">
        <h4>Try, don't guess</h4>
        <p>Stop second-guessing colour decisions. See your shade on a real-looking room in seconds.</p>
      </div>
      <div class="feature-card">
        <h4>Save & share</h4>
        <p>Download the preview as a PNG or send it directly to your spouse, designer or our team via WhatsApp.</p>
      </div>
      <div class="feature-card">
        <h4>Quote in one click</h4>
        <p>Like what you see? Carry the colour straight into a project quote — we'll match it from our tinting system.</p>
      </div>
    </div>
  </div>
</section>

<script src="js/visualizer.js" defer></script>`,
  });
}

/* =========================================================
   New: Paint coverage calculator (uses js/calculator.js)
   ========================================================= */
function calculatorPage() {
  return genericPage({
    title: 'Paint Coverage Calculator — How Much Paint Do I Need? | Octagreen Nano',
    metaDescription: 'Free paint coverage calculator. Enter your room dimensions, doors and windows — get exact litres needed, recommended pack sizes and an indicative cost.',
    slug: 'calculator.html',
    banner: { eyebrow: 'Interactive · Free', title: 'Paint Coverage Calculator', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'Calculator' }] },
    body: `
<section class="section">
  <div class="container">
    <div class="section-title reveal" style="margin-bottom:2rem">
      <p>Quick, accurate paint estimate in under a minute. Adjust the sliders — the calculator updates live as you go.</p>
    </div>

    <div class="calc-shell">
      <div class="calc-form">
        <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-bottom:1rem">
          <label style="display:inline-flex;gap:.35rem;align-items:center;cursor:pointer"><input type="radio" name="units" value="m" checked> m</label>
          <label style="display:inline-flex;gap:.35rem;align-items:center;cursor:pointer"><input type="radio" name="units" value="ft"> ft</label>
        </div>

        <div class="form" style="gap:1.4rem">
          <div class="range-field">
            <div class="label-row"><label for="len">Room length</label><span class="val" data-val-for="len">4 m</span></div>
            <input type="range" id="len" min="1.5" max="15" step="0.5" value="4">
          </div>
          <div class="range-field">
            <div class="label-row"><label for="wid">Room width</label><span class="val" data-val-for="wid">4 m</span></div>
            <input type="range" id="wid" min="1.5" max="15" step="0.5" value="4">
          </div>
          <div class="range-field">
            <div class="label-row"><label for="hgt">Wall height</label><span class="val" data-val-for="hgt">3 m</span></div>
            <input type="range" id="hgt" min="2" max="4.5" step="0.1" value="3">
          </div>
          <div class="range-field">
            <div class="label-row"><label for="doors">Doors</label><span class="val" data-val-for="doors">1</span></div>
            <input type="range" id="doors" min="0" max="6" step="1" value="1">
          </div>
          <div class="range-field">
            <div class="label-row"><label for="windows">Windows</label><span class="val" data-val-for="windows">2</span></div>
            <input type="range" id="windows" min="0" max="8" step="1" value="2">
          </div>

          <div class="field">
            <label>Number of coats</label>
            <div style="display:flex;gap:.5rem">
              <label style="flex:1;padding:.65rem;border:1.5px solid var(--c-line);border-radius:var(--r-md);text-align:center;cursor:pointer;font-family:var(--font-display);font-weight:600;background:var(--c-surface)"><input type="radio" name="coats" value="1" style="display:none"> 1 coat</label>
              <label style="flex:1;padding:.65rem;border:1.5px solid var(--c-primary);border-radius:var(--r-md);text-align:center;cursor:pointer;font-family:var(--font-display);font-weight:600;background:var(--c-primary-light);color:var(--c-primary-dark)"><input type="radio" name="coats" value="2" checked style="display:none"> 2 coats</label>
              <label style="flex:1;padding:.65rem;border:1.5px solid var(--c-line);border-radius:var(--r-md);text-align:center;cursor:pointer;font-family:var(--font-display);font-weight:600;background:var(--c-surface)"><input type="radio" name="coats" value="3" style="display:none"> 3 coats</label>
            </div>
          </div>

          <div class="field">
            <label for="calc-product">Octagreen paint</label>
            <select id="calc-product">
              <optgroup label="Interior">
                <option value="gulmohar">Gulmohar Economy Interior</option>
                <option value="daffodil" selected>Daffodil Premium Interior</option>
                <option value="magicshine">Magic Shine Luxury Interior</option>
              </optgroup>
              <optgroup label="Exterior">
                <option value="aura">Aura Superior Exterior</option>
                <option value="allweather">All Weather Exterior</option>
                <option value="ultraguard">Ultra Guard Waterproof</option>
              </optgroup>
            </select>
          </div>

          <label style="display:inline-flex;align-items:center;gap:.6rem;font-family:var(--font-display);font-weight:600;color:var(--c-text)">
            <input type="checkbox" id="calc-primer-toggle" checked style="width:18px;height:18px;accent-color:var(--c-primary)">
            Include First Coat primer
          </label>
        </div>
      </div>

      <div class="calc-result">
        <h3>Your estimate</h3>
        <p style="color:rgba(255,255,255,0.85);margin:.25rem 0 0">For <span id="calc-product-name">Daffodil Premium Interior</span> · <span id="calc-coats-val">2</span> coats</p>

        <div id="calc-floorplan" class="calc-floorplan"></div>

        <div class="calc-big"><span id="calc-litres">4.2 L</span></div>
        <div class="calc-row"><span>Total area to paint</span><span class="v"><span id="calc-total-sqft">800</span> sqft</span></div>
        <div class="calc-row"><span>Recommended packs</span><span class="v" id="calc-packs">—</span></div>
        <div class="calc-row"><span>Primer needed</span><span class="v"><span id="calc-primer-litres">—</span> · <span id="calc-primer-packs">—</span></span></div>

        <p style="font-size:.78rem;color:rgba(255,255,255,0.7);margin-top:1rem">Indicative material requirement only. For an itemised quote (including labour and surface prep) talk to our team.</p>

        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1.2rem">
          <button class="btn btn-light" id="calc-quote">Get a real quote →</button>
          <button class="btn btn-on-dark" id="calc-share" data-track="calculator_whatsapp">Share on WhatsApp</button>
        </div>
      </div>
    </div>

    <div class="row-grid grid-3 reveal" style="margin-top:3rem">
      <div class="feature-card">
        <h4>Live updates</h4>
        <p>Move the sliders, the numbers move. No "calculate" button — see the impact of every choice instantly.</p>
      </div>
      <div class="feature-card">
        <h4>Real packs</h4>
        <p>Coverage is computed against actual Octagreen pack sizes (20 L · 10 L · 4 L · 1 L) — no awkward leftover litres.</p>
      </div>
      <div class="feature-card">
        <h4>Skip the calls</h4>
        <p>Send your estimate to our team via WhatsApp with one tap — we'll confirm and add the labour line.</p>
      </div>
    </div>
  </div>
</section>

<script src="js/calculator.js" defer></script>`,
  });
}

/* =========================================================
   New: Quiz page (uses js/quiz.js)
   ========================================================= */
function quizPage() {
  return genericPage({
    title: 'Find Your Colour — 60-Second Quiz | Octagreen Nano',
    metaDescription: '5 quick questions, get a personalised Octagreen colour palette. Try the result instantly in our wall visualizer. Free, no sign-up.',
    slug: 'quiz.html',
    banner: { eyebrow: 'Interactive · Free', title: 'Find your perfect colour', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'Quiz' }] },
    body: `
<section class="section">
  <div class="container container-sm">
    <div class="section-title reveal" style="margin-bottom:2rem">
      <p>5 quick questions about your space, your style, and your lifestyle. We'll match you to a curated palette of Octagreen shades — try them in the visualizer with one click.</p>
    </div>

    <div class="quiz" id="quiz">
      <div class="quiz-progress"><div class="quiz-progress-bar" id="quiz-progress-bar"></div></div>
      <div class="quiz-stage" id="quiz-stage">
        <p class="text-muted text-center" style="padding:3rem 1rem">Loading quiz…</p>
      </div>
    </div>
  </div>
</section>

<script src="js/quiz.js" defer></script>`,
  });
}

/* =========================================================
   New: Compare page (uses js/main.js compare renderer)
   ========================================================= */
function comparePage() {
  // Embed product registry as a JSON island so compare.html can render specs.
  const productRegistry = {};
  // izonil + ultramastic (waterproofing)
  productRegistry['izonil.html'] = {
    name: 'Izonil Waterproof Plaster', image: 'images/izonil.jpg',
    type: 'Waterproofing', finish: 'Powder / grey', coverage: '12.5 kg/m² @ 10mm',
    voc: 'Non-toxic', washability: 'N/A',
    highlight: '100% waterproof + breathable. Replaces general-purpose plaster + waterproof membranes in one step. EN 998-1 certified.',
  };
  for (const p of products) {
    productRegistry[p.slug] = {
      name: p.name, image: p.image,
      type: p.category, finish: extractField(p.tds, 'gloss') || extractField(p.tds, 'finish') || '—',
      coverage: extractField(p.tds, 'coverage') || '—',
      voc: 'Low-VOC', washability: extractField(p.tds, 'washability') || (p.category === 'Interior' ? 'Good' : '—'),
      highlight: p.benefits.split('.').slice(0, 2).join('.') + '.',
    };
  }

  return genericPage({
    title: 'Compare Octagreen Paint Products — Side by Side | Octagreen Nano',
    metaDescription: 'Compare Octagreen paint products side by side — coverage, finish, VOC, washability. Pick the right paint for your project.',
    slug: 'compare.html',
    banner: { eyebrow: 'Interactive', title: 'Compare paint products', crumbs: [{ href: 'index.html', label: 'Home' }, { label: 'Compare' }] },
    body: `
<section class="section">
  <div class="container">
    <div class="section-title reveal" style="margin-bottom:2rem">
      <p>Pick up to 3 products from any product page using the <strong>⇄ Compare</strong> button — they'll appear here side-by-side.</p>
    </div>

    <div id="compare-host">
      <div class="compare-empty">
        <p class="text-muted text-center" style="padding:0 1rem 1.5rem">No products to compare yet. Tap the <strong>⇄</strong> icon on any product card to add it here.</p>
        <h3 class="text-center" style="font-size:1.1rem;margin:1rem 0 1.25rem">Popular products</h3>
        <div class="row-grid grid-3">
          ${productCard('izonil.html', 'Waterproofing', 'images/izonil.jpg', 'Izonil Waterproof Plaster', '100% waterproof, breathable, dehumidifying plastering mortar.')}
          ${productCard('ultraguardwaterproofexterioremulsion.html', 'Exterior', 'images/UltraGuard.jpg', 'Ultra Guard Waterproof Exterior', '100% acrylic, anti-fungal, anti-algae glossy emulsion.')}
          ${productCard('daffodilremiuminterioremulsion.html', 'Interior', 'images/Dafodilss.jpg', 'Daffodil Premium Interior', 'Soft-sheen interior emulsion — durable, water-repellent.')}
        </div>
      </div>
    </div>

    <script type="application/json" id="product-registry">${JSON.stringify(productRegistry)}</script>
  </div>
</section>`,
  });
}

function extractField(tds, key) {
  if (!Array.isArray(tds)) return '';
  const k = key.toLowerCase();
  for (const [name, value] of tds) {
    if (name.toLowerCase().includes(k)) return value;
  }
  return '';
}

const caseStudies = [
  {
    slug: 'case-mercy-garden.html',
    title: 'Mercy Garden — Apartment Repaint, Elamakkara',
    metaDescription: 'How Octagreen restored Mercy Garden\'s twin-flat complex with a low-VOC repaint. Premium interior emulsion + exterior weatherproof system. Kochi case study.',
    heading: 'Mercy Garden — Apartment Repaint',
    heroImage: 'images/Cheloor.jpg',
    location: 'Elamakkara, Kochi',
    scope: 'Full exterior + common-area interior repaint',
    products: 'First Coat Primer · All Weather Exterior · Daffodil Premium Interior',
    brief: 'A residential apartment complex in Elamakkara needed a complete refresh after weather-induced wear. The owners wanted a low-odour, eco-friendly paint system that would not disrupt residents during application — and finishes that would hold up to coastal Kochi humidity.',
    approach: 'Our team conducted a free site survey, identified moisture-affected zones, and prepared a phased schedule that allowed residents to remain in place. We used First Coat Exterior Primer over a properly cleaned and crack-filled substrate, followed by two coats of All Weather Exterior Emulsion. Common-area interiors were finished with Daffodil Premium Interior Emulsion in soft-sheen.',
    result: 'The complex was completed on schedule with zero resident complaints about odour or disruption. The exterior finish has held up beautifully through subsequent monsoons. The owners booked us back for adjacent buildings.',
    testimonial: {
      text: 'The work quality, supervision, perfection and completion schedule in executing the entire work was very much appreciated. "Customer Care, Customer Satisfaction" were taken to the level of customer delight by the team.',
      name: 'K. Gopinath', role: 'Mercy Garden',
    },
    relatedProducts: [
      { href: 'allweatherweatherproofexterioremulsion.html', label: 'All Weather Weatherproof Exterior Emulsion' },
      { href: 'daffodilremiuminterioremulsion.html', label: 'Daffodil Premium Interior Emulsion' },
      { href: 'firstcoatexteriorprimer.html', label: 'First Coat Exterior Primer' },
    ],
  },
  {
    slug: 'case-carnival-infopark.html',
    title: 'Carnival Infopark — Phase 2 Waterproofing, Kakkanad',
    metaDescription: 'How Octagreen waterproofed and finished Carnival Infopark Phase 2 in Kakkanad. Ultra Mastic Coat + Ultra Guard Exterior — case study.',
    heading: 'Carnival Infopark — Phase 2 Waterproofing',
    heroImage: 'images/Carnival.jpg',
    location: 'Kakkanad, Kochi',
    scope: 'Terrace waterproofing + facade emulsion',
    products: 'Ultra Mastic Coat · Ultra Guard Waterproof Exterior · First Coat Primer',
    brief: 'Phase 2 of the Carnival Infopark complex required terrace waterproofing and an exterior facade refresh. The brief: stop water ingress through hairline cracks, deliver a consistent finish across multiple buildings, and keep the IT-park operational throughout the work.',
    approach: 'After surface profiling and crack-treatment, we applied Ultra Mastic Coat as a one-way elastomeric waterproof membrane to the terrace. The facade was primed with First Coat Exterior Primer, then finished with two coats of Ultra Guard Waterproof Exterior Emulsion in the corporate colours. Work was scheduled outside business hours for the most disruptive phases.',
    result: 'Reported zero new ingress events post-completion. Tenant feedback on facade was strongly positive. The Ultra Mastic membrane has been in place for multiple monsoon seasons without re-treatment.',
    testimonial: {
      text: 'The waterproofing and painting work done at Phase 2, Carnival Infopark, Kakkanad by Octagreen has been highly effective and the chemicals supplied were of really good quality.',
      name: 'Raj Krishnan', role: 'CEO, Carnival Soft Pvt. Ltd.',
    },
    relatedProducts: [
      { href: 'ultramasticcoat.html', label: 'Ultra Mastic Coat' },
      { href: 'ultraguardwaterproofexterioremulsion.html', label: 'Ultra Guard Waterproof Exterior' },
      { href: 'firstcoatexteriorprimer.html', label: 'First Coat Exterior Primer' },
    ],
  },
];

/* =========================================================
   Build loop
   ========================================================= */
async function build() {
  await mkdir(ROOT, { recursive: true });
  const out = [];

  // Homepage
  out.push(['index.html', homePage()]);

  // Izonil (custom layout)
  out.push(['izonil.html', izonilPage()]);

  // Generic product pages
  for (const product of products) out.push([product.slug, productPage(product)]);

  // Info pages
  for (const page of infoPages) out.push([page.slug, genericPage(page)]);

  // New static pages
  out.push(['faq.html', faqPage()]);
  out.push(['colours.html', coloursPage()]);
  out.push(['visualizer.html', visualizerPage()]);
  out.push(['calculator.html', calculatorPage()]);
  out.push(['quiz.html', quizPage()]);
  out.push(['compare.html', comparePage()]);
  out.push(['privacy.html', privacyPage()]);
  out.push(['terms.html', termsPage()]);
  out.push(['404.html', notFoundPage()]);
  out.push(['paint-services-kochi.html', kochiLandingPage()]);

  // Write
  for (const [slug, html] of out) {
    await writeFile(join(ROOT, slug), html, 'utf8');
    console.log(`✓ ${slug}`);
  }
  console.log(`\n${out.length} pages built.`);
}

build().catch(err => { console.error(err); process.exit(1); });
