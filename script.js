// ── FIREBASE ───────────────────────────────────────────────────────────────
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js';
import { getFirestore, collection, doc, getDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// 5-step config decode (reverse of: charCodes → XOR → offset → base64 → reverse)
function _dc(enc, keyName) {
  const b64 = enc.split('').reverse().join('');
  const raw = atob(b64);
  const bytes = Array.from(raw).map(c => c.charCodeAt(0));
  const xorKey = (keyName.length % 127) + 13;
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    let c = (bytes[i] - (i % 37) + 256) & 0xFF;
    c = c ^ xorKey;
    out += String.fromCharCode(c);
  }
  return out;
}

const _e = {
  apiKey:            "kUCS4R4cGh2kH9zZBujgsdGl7k3aM+4h+dogxY4TsVYXvRUdrtlU",
  authDomain:        "==AmVCJVBCojJq3iJW4dPGISwAoMsgzQplXe+JIa6xXc",
  projectId:         "x83MrkDRopHe9N4Z7tHc",
  storageBucket:     "=w4ibOVnae5gPeYgW+HkMKpeEy4Q9s4N30CQ0ZIh5d3a3dHf",
  messagingSenderId: "zETN3ATMuIDLokyJ",
  appId:             "=oCJ3ZyTJZElHFERC5jjEN0Q6koNF2jOBeId2EzNr0iLvwCKq4yJtkyI",
  measurementId:     "TB2Vn5lUTxCMEhTX",
};
const firebaseConfig = Object.fromEntries(
  Object.entries(_e).map(([k, v]) => [k, _dc(v, k)])
);
const { measurementId: _mid, ...firebaseConfigNoGA } = firebaseConfig;

const app = initializeApp(firebaseConfigNoGA);
const db  = getFirestore(app);

// ── ANALYTICS (consent-gated) ──────────────────────────────────────────────
let _analyticsInited = false;
function initAnalytics() {
  if (_analyticsInited) return;
  _analyticsInited = true;
  try {
    const appWithGA = initializeApp({ ...firebaseConfigNoGA, measurementId: _mid }, 'ga-instance');
    getAnalytics(appWithGA);
  } catch(e) {}
}

// ── LANGUAGE ──────────────────────────────────────────────────────────────
// Supported langs: 'ro' | 'eng'  (eng = English fallback)
// Priority: ?lang= param → navigator.language → 'eng'
function _detectLang() {
  const params = new URLSearchParams(window.location.search);
  const param  = (params.get('lang') || '').toLowerCase();
  if (param === 'ro')  return 'ro';
  if (param === 'eng') return 'eng';
  // navigator.language: 'ro', 'ro-RO', 'ro-MD' → 'ro'; everything else → 'eng'
  const nav = (navigator.language || '').toLowerCase();
  return nav === 'ro' || nav.startsWith('ro-') ? 'ro' : 'eng';
}

window.siteLang = _detectLang();

// ── ANIMATED PRICE COUNTER ─────────────────────────────────────────────────
function _animatePrice(el, targetVal, currency) {
  const DURATION = 380; // ms
  const startVal = parseFloat(el.dataset.animVal ?? el.textContent.replace(/[^0-9.]/g, '')) || 0;
  el.dataset.animVal = targetVal;

  if (startVal === targetVal) return;

  if (el._animRaf) cancelAnimationFrame(el._animRaf);

  const startTime = performance.now();

  function step(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / DURATION, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current  = startVal + (targetVal - startVal) * eased;

    el.textContent = currency + Math.round(current);

    if (progress < 1) {
      el._animRaf = requestAnimationFrame(step);
    } else {
      el.textContent     = currency + targetVal;
      el.dataset.animVal = targetVal;
      el._animRaf        = null;
    }
  }

  el._animRaf = requestAnimationFrame(step);
}

// Write lang param into the URL without reloading (preserves all other params)
function _syncLangParam() {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', window.siteLang);
  window.history.replaceState(null, '', url.pathname + url.search);
}
_syncLangParam();

// ── HASH → QUERY REDIRECT ────────────────────────────────────────────────
// Maps old #hash slugs to ?page= equivalents so bookmarked/linked hashes work.
const HASH_PAGE_MAP = {
  '':                 null,          // # alone → home
  'proiecte':         'proiecte',
  'servicii':         'servicii',
  'despre':           'despre',
  'confidentialitate':'confidentialitate',
  'termeni':          'termeni',
  'tehnologie':       'tehnologie',
};

function _redirectHashToQuery() {
  const hash = window.location.hash; // e.g. "#proiecte" or ""
  if (!hash || hash === '#') return false;
  const slug = hash.slice(1).toLowerCase().split('?')[0]; // strip leading #
  if (!(slug in HASH_PAGE_MAP)) return false;
  const url = new URL(window.location.href);
  url.hash = '';  // remove hash
  const page = HASH_PAGE_MAP[slug];
  if (page) url.searchParams.set('page', page);
  else url.searchParams.delete('page');
  window.history.replaceState(null, '', url.pathname + url.search);
  return true;
}

// Run once on page load to handle any incoming #hash URL
_redirectHashToQuery();

// Handle any future hashchange (e.g. browser back/forward to a hashed URL)
window.addEventListener('hashchange', () => {
  _redirectHashToQuery();
  resolveRoute();
});

// Pick the right field value:
// 1. If data[field] is a {ro, en} object → extract by lang
// 2. Check data[field + '_en'] / data[field + '_ro'] suffixed variant
// 3. Fall back to data[field] as-is
function _langVal(data, field) {
  if (!data) return undefined;
  const raw = data[field];
  // Object format saved by admin: { ro: '...', en: '...' }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const pick = window.siteLang === 'ro' ? (raw.ro || raw.en || '') : (raw.en || raw.ro || '');
    return pick || undefined;
  }
  // Suffixed field format: field_en / field_ro
  const suffix = window.siteLang === 'ro' ? '_ro' : '_en';
  if (data[field + suffix] !== undefined && data[field + suffix] !== '')
    return data[field + suffix];
  return raw;
}

// Translations for hardcoded UI strings
const STRINGS = {
  ro: {
    // JS-generated strings
    versiuni:               'versiuni',
    versiuniTitle:          'Versiuni',
    nuExistaProiecte:       'Nu există proiecte momentan.',
    seIncarcaProiecte:      'Se incarca proiectele...',
    nuSauPututIncarca:      'Nu s-au putut incarca proiectele.',
    fisierNedisponibil:     'fisier nedisponibil',
    continutIndisponibil:   'Continut indisponibil momentan.',
    nuSaIncarcatDoc:        'Nu s-a putut incarca documentul.',
    proiectPrivatTitle:     'Proiect privat',
    proiectPrivatSub:       'Acest proiect nu este disponibil public.\nContacteaza autorul pentru acces.',
    statusDone:             'Finalizat',
    statusWip:              'In lucru',
    statusEarly:            'Early access',
    descToggleMore:         'Mai mult',
    descToggleLess:         'Mai puțin',
    copiaza:                'Copiaza',
    descarca:               'Descarca',
    getItOn:                'DISPONIBIL PE',
    proiecte:               'Proiecte',
    solicita:               'Solicita oferta',
    de:                     'de',
    tehnologii:             'Tehnologii',
    nuDescriereAdaugata:    'Nicio descriere adaugata inca pentru aceasta tehnologie.\nPoti adauga continut din panoul de administrare.',
    'sec-proj-label':       'Proiecte recente',
    'sec-proj-headline':    'Proiecte făcute\ncu pasiune în România.',
    'sec-proj-cta':         'Vezi toate proiectele',
    'sec-svc-label':        'Servicii',
    'sec-svc-headline':     'Dezvoltare web\nși mobile pentru tine.',
    'sec-svc-cta':          'Detalii & prețuri',
    // DOM i18n keys (data-i18n)
    'nav-home':             'Acasa',
    'nav-projects':         'Proiecte',
    'nav-services':         'Servicii',
    'nav-about':            'Despre',
    'nav-privacy':          'Confidentialitate',
    'nav-terms':            'Termeni',
    'home-headline':        'Bine ai venit\npe FlorinDev.',
    'home-subtext':         'Proiecte independente de software, modding si localizare. Totul open source, totul in romana.',
    'cta-primary':          'Vezi proiectele',
    'cta-secondary':        'Contacteaza-ma',
    'chip-android':         'Android',
    'chip-gta':             'GTA Modding',
    'chip-dub':             'Dublaje',
    'chip-os':              'Open Source',
    'sec-projects':         'Proiecte',
    'sec-projects-sub':     'Localizari comunitare si moduri pentru jocuri clasice. Click pe un proiect pentru detalii si fisiere.',
    'sec-services':         'Servicii',
    'sec-services-sub':     'Dezvoltare web si aplicatii mobile pentru clienti independenti si mici afaceri.',
    'garantie':             '<strong>Garantie 7 zile:</strong> Daca nu esti multumit de rezultat, iti returnez plata integrala — fara intrebari.',
    'svc-empty':            'FlorinDev nu ofera servicii momentan.',
    'hosting':              'Optiuni hosting recomandate',
    'hosting-ghpages':      'Gratuit pentru site-uri statice. Ideal pentru portofolii si landing pages.',
    'hosting-firebase':     'Plan gratuit generos, CDN global, SSL automat. Recomandat pentru aplicatii.',
    'hosting-vercel':       'Deploy automat din GitHub. Performanta excelenta, plan free disponibil.',
    'hosting-vps':          'Pentru proiecte mari. Configurare si management incluse in pachet.',
    'sec-about':            'Despre',
    'about-fallback':       'Proiect independent de software, modding si localizare in limba romana. Toate proiectele sunt open source si disponibile gratuit.',
    'about-contact':        'Pentru colaborari, intrebari sau feedback: <strong>contact@florin.dev</strong>',
    'private-title':        'Proiect privat',
    'private-sub':          'Acest proiect nu este disponibil public. Contacteaza autorul daca crezi ca ai acces.',
    'back-projects':        'Inapoi la proiecte',
    'back-home':            'Inapoi acasa',
    '404-title':            'Pagina nu a fost gasita',
    '404-sub':              'Adresa pe care ai accesat-o nu exista sau continutul a fost mutat.',
    'svc-extras-title':     'Extra-uri optionale',
    'svc-extras-free':      'Gratuit',
    'footer-tag':           'Proiecte independente de software, modding si localizare.',
    'footer-rights':        'Toate drepturile rezervate.',
    'support-paypal':       'Sustine pe PayPal',
    'support-kofi':         'Sustine pe Ko-fi',
    'cookie-text':    'Folosim servicii externe (Firebase, Google Fonts) pentru funcționarea site-ului. Acceptând, activezi și <strong>Google Analytics</strong> (date anonimizate).',
    'cookie-decline': 'Refuz',
    'cookie-accept':  'Accept',
    'cookie-link':    'Politică de confidențialitate',
    'tab-versions':   'Versiuni',
    'tab-code':       'Cod',
    'tab-license':    'Licență',
    'code-repo':      'Depozit cod',
    'code-files':     'Fișiere în depozit',
    'code-btn':       'Cod',
    'code-no-repo':   'Nu există un depozit de cod configurat.',
    'code-loading':   'Se încarcă fișierele...',
    'code-error':     'Nu s-au putut încărca fișierele depozitului.',
    'license-none':   'Nicio licență specificată pentru acest proiect.',
    'license-loading':'Se încarcă licența...',
    'license-error':  'Nu s-a putut încărca licența.',
    'cat-all':        'Toate',
    'cat-filter':     'Categorie',
  },
  eng: {
    // JS-generated strings
    versiuni:               'versions',
    versiuniTitle:          'Versions',
    nuExistaProiecte:       'No projects available at the moment.',
    seIncarcaProiecte:      'Loading projects...',
    nuSauPututIncarca:      'Could not load projects.',
    fisierNedisponibil:     'file unavailable',
    continutIndisponibil:   'Content currently unavailable.',
    nuSaIncarcatDoc:        'Could not load the document.',
    proiectPrivatTitle:     'Private project',
    proiectPrivatSub:       'This project is not publicly available.\nContact the author for access.',
    statusDone:             'Completed',
    statusWip:              'In progress',
    statusEarly:            'Early access',
    descToggleMore:         'Show more',
    descToggleLess:         'Show less',
    copiaza:                'Copy',
    descarca:               'Download',
    getItOn:                'GET IT ON',
    proiecte:               'Projects',
    solicita:               'Request a quote',
    de:                     'by',
    tehnologii:             'Technologies',
    nuDescriereAdaugata:    'No description added yet for this technology.\nYou can add content from the admin panel.',
    'sec-proj-label':       'Recent projects',
    'sec-proj-headline':    'Projects built\nwith passion in Romania.',
    'sec-proj-cta':         'View all projects',
    'sec-svc-label':        'Services',
    'sec-svc-headline':     'Web & mobile\ndevelopment for you.',
    'sec-svc-cta':          'Details & pricing',
    // DOM i18n keys (data-i18n)
    'nav-home':             'Home',
    'nav-projects':         'Projects',
    'nav-services':         'Services',
    'nav-about':            'About',
    'nav-privacy':          'Privacy',
    'nav-terms':            'Terms',
    'home-headline':        'Welcome\nto FlorinDev.',
    'home-subtext':         'Independent software, modding and localization projects. All open source, all free.',
    'cta-primary':          'View projects',
    'cta-secondary':        'Contact me',
    'chip-android':         'Android',
    'chip-gta':             'GTA Modding',
    'chip-dub':             'Dubbing',
    'chip-os':              'Open Source',
    'sec-projects':         'Projects',
    'sec-projects-sub':     'Community localizations and mods for classic games. Click a project for details and files.',
    'sec-services':         'Services',
    'sec-services-sub':     'Web development and mobile apps for independent clients and small businesses.',
    'garantie':             '<strong>7-day guarantee:</strong> If you\'re not satisfied with the result, I\'ll refund your full payment — no questions asked.',
    'svc-empty':            'FlorinDev is not offering services at the moment.',
    'hosting':              'Recommended hosting options',
    'hosting-ghpages':      'Free for static sites. Ideal for portfolios and landing pages.',
    'hosting-firebase':     'Generous free plan, global CDN, automatic SSL. Recommended for apps.',
    'hosting-vercel':       'Automatic deploy from GitHub. Excellent performance, free plan available.',
    'hosting-vps':          'For large projects. Setup and management included in the package.',
    'sec-about':            'About',
    'about-fallback':       'Independent software, modding and Romanian localization project. All projects are open source and available for free.',
    'about-contact':        'For collaborations, questions or feedback: <strong>contact@florin.dev</strong>',
    'private-title':        'Private project',
    'private-sub':          'This project is not publicly available. Contact the author if you believe you have access.',
    'back-projects':        'Back to projects',
    'back-home':            'Back to home',
    '404-title':            'Page not found',
    '404-sub':              'The address you accessed does not exist or the content has been moved.',
    'svc-extras-title':     'Optional add-ons',
    'svc-extras-free':      'Free',
    'footer-tag':           'Independent software, modding and localization projects.',
    'footer-rights':        'All rights reserved.',
    'support-paypal':       'Support on PayPal',
    'support-kofi':         'Support on Ko-fi',
    'cookie-text':    'We use external services (Firebase, Google Fonts) to run this site. By accepting, you also enable <strong>Google Analytics</strong> (anonymized data).',
    'cookie-decline': 'Decline',
    'cookie-accept':  'Accept',
    'cookie-link':    'Privacy Policy',
    'tab-versions':   'Versions',
    'tab-code':       'Code',
    'tab-license':    'License',
    'code-repo':      'Repository',
    'code-files':     'Repository files',
    'code-btn':       'Code',
    'code-no-repo':   'No code repository configured for this project.',
    'code-loading':   'Loading files...',
    'code-error':     'Could not load repository files.',
    'license-none':   'No license specified for this project.',
    'license-loading':'Loading license...',
    'license-error':  'Could not load license.',
    'cat-all':        'All',
    'cat-filter':     'Category',
  },
};

function t(key) {
  return (STRINGS[window.siteLang] || STRINGS.eng)[key] || key;
}

// Apply i18n to all data-i18n / data-i18n-html / data-i18n-title elements
function translateDOM() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    // For headline with \n → convert to <br>
    if (val.includes('\n')) { el.innerHTML = val.replace(/\n/g, '<br>'); }
    else { el.textContent = val; }
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
}

// ── CONSTANTS ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ── STATE ──────────────────────────────────────────────────────────────────
let INDEX       = [];
let MOD_CACHE   = {};
let currentMod  = null;
let currentPage = 1;
let totalPages  = 1;

let _viewMode    = 'grid'; // 'list' | 'grid'
let _sortOrder   = 'desc'; // 'desc' = New first | 'asc' = Old first
let _sortedIndex = [];         // current sorted copy of INDEX
let _activeCat   = '';         // '' = all; otherwise category key
let _categories  = [];         // [{ key, ro, en }] from index metadata

// ── RELATIVE TIME ─────────────────────────────────────────────────────────
function relativeTime(ts) {
  if (!ts) return '';
  const tsMs = ts > 1e12 ? ts : ts * 1000;
  const diff  = Date.now() - tsMs;
  const sec   = Math.floor(diff / 1000);
  const min   = Math.floor(sec / 60);
  const hr    = Math.floor(min / 60);
  const day   = Math.floor(hr / 24);
  const week  = Math.floor(day / 7);
  const month = Math.floor(day / 30);
  const year  = Math.floor(day / 365);
  if (window.siteLang === 'eng') {
    if (sec < 60)   return 'just now';
    if (min < 60)   return min === 1 ? '1 minute ago'  : `${min} minutes ago`;
    if (hr < 24)    return hr === 1  ? '1 hour ago'    : `${hr} hours ago`;
    if (day < 7)    return day === 1 ? 'yesterday'     : `${day} days ago`;
    if (week < 5)   return week === 1? '1 week ago'    : `${week} weeks ago`;
    if (month < 12) return month === 1 ? '1 month ago' : `${month} months ago`;
    return year === 1 ? '1 year ago' : `${year} years ago`;
  }
  if (sec < 60)   return 'acum cateva secunde';
  if (min < 60)   return min === 1 ? 'acum un minut' : `acum ${min} minute`;
  if (hr < 24)    return hr === 1  ? 'acum o ora'    : `acum ${hr} ore`;
  if (day < 7)    return day === 1 ? 'acum o zi'     : `acum ${day} zile`;
  if (week < 5)   return week === 1? 'acum o saptamana' : `acum ${week} saptamani`;
  if (month < 12) return month === 1 ? 'acum o luna'  : `acum ${month} luni`;
  return year === 1 ? 'acum un an' : `acum ${year} ani`;
}

// ── PROJECT MARKS (synced with admin MARK_PRESETS) ────────────────────────
const AI_MARK_KEYS = new Set(['AI Voice', 'AI Traducere', 'AI Scriptat', 'AI Imagine']);

function normalizeMarks(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(m => m && (m.label || m.key))
    .map(m => ({
      key:   m.key   || m.label,
      label: m.label || m.key,
      color: m.color || 'neutral',
      icon:  m.icon  || '',
    }));
}

function markChipHtml(m, compact) {
  const icon = m.icon ? `<span class="mark-chip-icon">${m.icon}</span>` : '';
  return `<span class="mark-chip ${m.color || 'neutral'}${compact ? ' mark-chip-sm' : ''}">${icon}${m.label}</span>`;
}

function renderMarksHtml(marks, { compact = false, limit = 0 } = {}) {
  const list = limit > 0 ? marks.slice(0, limit) : marks;
  if (!list.length) return '';
  return list.map(m => markChipHtml(m, compact)).join('');
}

// ── AVATAR / COLORS ───────────────────────────────────────────────────────
const AVATAR_COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#0ea5e9','#a855f7','#14b8a6'];
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}
function authorChip(name) {
  const initial = name.trim().charAt(0).toUpperCase();
  const color   = AVATAR_COLORS[hashStr(name) % AVATAR_COLORS.length];
  return `<span class="author-chip"><span class="author-avatar" style="background:${color}">${initial}</span>${name}</span>`;
}

// ── FIRESTORE DOC → MOD OBJECT ────────────────────────────────────────────
function firestoreDocToMod(docId, data) {
  const authorsArr = Array.isArray(data.Authors) ? data.Authors : [];
  const creator    = data.Creator || '';
  const allAuthors = creator ? [creator, ...authorsArr.filter(a => a !== creator)] : authorsArr;
  const authors    = [...new Set(allAuthors)];

  const versionsMap = data.Versions || {};
  const versions = Object.entries(versionsMap)
    .map(([tag, v]) => ({
      tag:    tag.startsWith('v') ? tag : 'v' + tag,
      file:   v.file      || '',
      rawTs:  parseInt(v.timestamp) || 0,
      date:   relativeTime(parseInt(v.timestamp) || 0),
      commit: v.id        || '',
      note:   v.desc      || '',
      url:    v.url       || '',
    }))
    .sort((a, b) => {
      const toNum = s => s.replace(/^v/, '').split('.').map(Number);
      const [aMaj, aMin, aPat] = toNum(a.tag);
      const [bMaj, bMin, bPat] = toNum(b.tag);
      return (bMaj - aMaj) || (bMin - aMin) || (bPat - aPat);
    });

  const latestTag  = versions[0]?.tag || 'v0.0.0';
  const [maj]      = latestTag.replace(/^v/, '').split('.').map(Number);
  const status     = maj >= 1 ? 'done' : (maj === 0 && versions.length >= 2 ? 'wip' : 'early');
  const downloadUrl = status === 'done' && versions[0]?.url ? versions[0].url : null;

  const shortDesc  = _langVal(data, 'short_desc') || '';
  const yearMatch  = shortDesc.match(/\d{4}/);
  const year       = yearMatch ? yearMatch[0] : '';
  // Strip the year (and any surrounding separator like " · " or " - ") from dev text
  // so it doesn't appear twice alongside the dedicated year cell/badge
  const devText    = shortDesc.replace(/\s*[·\-–—]\s*\d{4}|\d{4}\s*[·\-–—]\s*/g, '').trim();
  const marks      = normalizeMarks(data.marks);
  const hasAiMark  = marks.some(m => AI_MARK_KEYS.has(m.key));
  const legacyAi   = !!data.ai_used;

  return {
    id: docId, name: _langVal(data, 'Name') || data.Name || docId, dev: devText, year,
    authors, status, downloadUrl,
    description: _langVal(data, 'desc') || '', image: data.image || '', imageHero: data.imageHero || '', imageHero2: data.imageHero2 || '',
    marks,
    aiUsed: marks.length ? hasAiMark : legacyAi,
    aiDisclaimer: data.ai_disclaimer || 'Voci generate prin AI (voice cloning)',
    versions,
    category:    data.category || null,   // { key, ro, en } or null
    codeEnabled: !!data.codeEnabled,
    codeRepo:    data.codeRepo || '',
    licenseKey:  data.licenseKey || '',
  };
}

// ── DOWNLOAD COUNT ────────────────────────────────────────────────────────
const DENO_URL = 'https://vast-chimp-3549.florinnghitun.deno.net';
const _dlCountCache = {};
const _dlFetching = new Set();

function _fmtDownloads(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n || 0);
}

function _updateDlBadges(id, count) {
  const fmt = _fmtDownloads(count);
  document.querySelectorAll(`.mr-dl-cell[data-proj-id="${id}"] span`).forEach(el => el.textContent = fmt);
  document.querySelectorAll(`.mgc-dl-count[data-proj-id="${id}"] span`).forEach(el => el.textContent = fmt);
  const heroEl = document.getElementById('proj-dl-count');
  if (heroEl && heroEl.dataset.projId === id) {
    const sp = heroEl.querySelector('span');
    if (sp) sp.textContent = fmt;
  }
}

async function _fetchDownloadCount(id) {
  if (_dlFetching.has(id)) return;
  _dlFetching.add(id);
  try {
    const res = await fetch(`${DENO_URL}?id=${encodeURIComponent(id)}`);
    if (!res.ok) return;
    const { downloads } = await res.json();
    _dlCountCache[id] = downloads;
    _updateDlBadges(id, downloads);
  } catch(e) {}
}

async function _trackDownload(id) {
  try {
    console.log('[dl] POST', id);
    const res = await fetch(DENO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId: id }),
    });
    const text = await res.text();
    console.log('[dl] POST response', res.status, text);
    if (!res.ok) return;
    const { downloads } = JSON.parse(text);
    _dlCountCache[id] = downloads;
    _updateDlBadges(id, downloads);
  } catch(e) { console.error('[dl] POST error', e); }
}
window._trackDownload = _trackDownload;

function _mockDownloads(id) {
  if (_dlCountCache[id] !== undefined) return _fmtDownloads(_dlCountCache[id]);
  _fetchDownloadCount(id);
  return '0';
}

const _dlIconSvg = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" style="width:11px;height:11px"><polyline points="6,1.5 6,8"/><polyline points="3,5.5 6,8.5 9,5.5"/><line x1="1.5" y1="10.5" x2="10.5" y2="10.5"/></svg>`;

// ── COVER FALLBACK ────────────────────────────────────────────────────────
function coverThumbFallback(mod) {
  const colors = [
    ['#0b1620','#1f4b5e'],['#26102f','#ff7a4d'],['#241203','#e0a339'],
    ['#101d12','#6f9146'],['#1a0a2e','#6366f1'],['#0f1a2a','#0ea5e9'],
  ];
  const [c1, c2] = colors[hashStr(mod.id) % colors.length];
  return `<div style="width:100%;height:100%;background:linear-gradient(135deg,${c1},${c2});display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:rgba(255,255,255,.6);font-family:'Inter',sans-serif;">${mod.name.charAt(0).toUpperCase()}</div>`;
}
function coverHeroBg(mod) {
  const colors = [
    ['#0b1620','#1f4b5e'],['#26102f','#4a1a40'],['#241203','#5a2e0d'],
    ['#101d12','#1c3018'],['#1a0a2e','#2d2060'],['#0f1a2a','#0c3050'],
  ];
  const [c1, c2] = colors[hashStr(mod.id) % colors.length];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

// ── RENDER MOD LIST ────────────────────────────────────────────────────────
// ── PROJECTS TOOLBAR (sort + view toggle) ─────────────────────────────────
function _ensureProjectsToolbar() {
  if (document.getElementById('proj-toolbar')) return;
  const wrap = document.querySelector('.mod-table-wrap');
  if (!wrap) return;

  const isRo = window.siteLang === 'ro';
  const toolbar = document.createElement('div');
  toolbar.id = 'proj-toolbar';
  toolbar.className = 'proj-toolbar';
  toolbar.innerHTML = `
    <div class="pt-sort">
      <button class="pt-sort-btn${_sortOrder === 'desc' ? ' pt-active' : ''}" id="pt-new" onclick="_setSort('desc')" title="${isRo ? 'Cele mai noi' : 'Newest first'}">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="2" y1="3" x2="11" y2="3"/><line x1="2" y1="7" x2="8" y2="7"/><line x1="2" y1="11" x2="5" y2="11"/></svg>
        ${isRo ? 'Nou' : 'New'}
      </button>
      <button class="pt-sort-btn${_sortOrder === 'asc' ? ' pt-active' : ''}" id="pt-old" onclick="_setSort('asc')" title="${isRo ? 'Cele mai vechi' : 'Oldest first'}">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="2" y1="3" x2="5" y2="3"/><line x1="2" y1="7" x2="8" y2="7"/><line x1="2" y1="11" x2="11" y2="11"/></svg>
        ${isRo ? 'Vechi' : 'Old'}
      </button>
    </div>
    <div class="pt-view">
      <button class="pt-view-btn${_viewMode === 'list' ? ' pt-active' : ''}" id="pt-list" onclick="_setView('list')" title="${isRo ? 'Listă' : 'List view'}">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="2" y1="3.5" x2="13" y2="3.5"/><line x1="2" y1="7.5" x2="13" y2="7.5"/><line x1="2" y1="11.5" x2="13" y2="11.5"/></svg>
      </button>
      <button class="pt-view-btn${_viewMode === 'grid' ? ' pt-active' : ''}" id="pt-grid" onclick="_setView('grid')" title="${isRo ? 'Grilă' : 'Grid view'}">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="8.5" y="1.5" width="5" height="5" rx="1"/><rect x="1.5" y="8.5" width="5" height="5" rx="1"/><rect x="8.5" y="8.5" width="5" height="5" rx="1"/></svg>
      </button>
    </div>`;
  wrap.parentNode.insertBefore(toolbar, wrap);
}

function _setSort(order) {
  if (_sortOrder === order) return;
  _sortOrder = order;
  // Persist sort in URL
  const url = new URL(window.location.href);
  if (order === 'asc') url.searchParams.set('sort', 'old');
  else url.searchParams.delete('sort'); // 'desc' is default, keep URL clean
  window.history.replaceState(null, '', url.pathname + url.search);
  document.getElementById('pt-new')?.classList.toggle('pt-active', order === 'desc');
  document.getElementById('pt-old')?.classList.toggle('pt-active', order === 'asc');
  _applySort();
  currentPage = 1;
  totalPages = Math.max(1, Math.ceil(_sortedIndex.length / PAGE_SIZE));
  renderMods();
  // Only fetch the items on new page 1 that aren't in MOD_CACHE yet
  preloadPage(currentPage);
}
window._setSort = _setSort;

function _setView(mode) {
  if (_viewMode === mode) return;
  _viewMode = mode;
  // Persist view in URL
  const url = new URL(window.location.href);
  if (mode === 'list') url.searchParams.set('view', 'list');
  else url.searchParams.delete('view'); // 'grid' is default, keep URL clean
  window.history.replaceState(null, '', url.pathname + url.search);
  document.getElementById('pt-list')?.classList.toggle('pt-active', mode === 'list');
  document.getElementById('pt-grid')?.classList.toggle('pt-active', mode === 'grid');
  const tableHead = document.querySelector('.mod-table-head');
  if (tableHead) tableHead.style.display = mode === 'grid' ? 'none' : '';
  renderMods();
  // Ensure current page is loaded (items already cached = no extra Firestore calls)
  preloadPage(currentPage);
}
window._setView = _setView;

function _applySort() {
  let src = [...INDEX];
  // Apply category filter (uses MOD_CACHE which may be partial — that's fine,
  // uncached items default to "no category" and will appear under "All")
  if (_activeCat) {
    src = src.filter(entry => {
      const mod = MOD_CACHE[entry.id];
      return mod ? (mod.category?.key === _activeCat) : false;
    });
  }
  _sortedIndex = src.sort((a, b) =>
    _sortOrder === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
  );
}

function _setCat(key) {
  _activeCat = key;
  // Update chip UI
  document.querySelectorAll('.pcat-chip').forEach(el => {
    el.classList.toggle('active', el.dataset.catKey === key);
  });
  _applySort();
  currentPage = 1;
  totalPages = Math.max(1, Math.ceil(_sortedIndex.length / PAGE_SIZE));
  renderMods();
  preloadPage(currentPage);
}
window._setCat = _setCat;

// Called after MOD_CACHE is populated enough to know categories.
// Collects distinct category objects from cached mods and renders the filter row.
function _maybeRenderCatFilter() {
  const filterEl = document.getElementById('proj-cat-filter');
  const chipsEl  = document.getElementById('proj-cat-chips');
  if (!filterEl || !chipsEl) return;

  // Gather categories from all cached mods (preserving insert order)
  const seen = new Map();
  INDEX.forEach(entry => {
    const mod = MOD_CACHE[entry.id];
    if (mod?.category?.key && !seen.has(mod.category.key)) {
      seen.set(mod.category.key, mod.category);
    }
  });

  if (seen.size === 0) {
    filterEl.style.display = 'none';
    return;
  }

  _categories = [...seen.values()];
  filterEl.style.display = '';

  const isRo = window.siteLang === 'ro';
  const allLabel = t('cat-all');
  let html = `<button class="pcat-chip${_activeCat === '' ? ' active' : ''}" data-cat-key="" onclick="_setCat('')">${allLabel}</button>`;
  _categories.forEach(cat => {
    const label = isRo ? (cat.ro || cat.en || cat.key) : (cat.en || cat.ro || cat.key);
    html += `<button class="pcat-chip${_activeCat === cat.key ? ' active' : ''}" data-cat-key="${cat.key}" onclick="_setCat('${cat.key}')">${label}</button>`;
  });
  chipsEl.innerHTML = html;
}

function renderMods() {
  _ensureProjectsToolbar();

  // Keep sorted index in sync
  if (!_sortedIndex.length && INDEX.length) _applySort();
  const source = _sortedIndex.length ? _sortedIndex : INDEX;

  const table = document.getElementById('mod-table');
  table.innerHTML = '';

  // Toggle column header visibility
  const tableHead = document.querySelector('.mod-table-head');
  if (tableHead) tableHead.style.display = _viewMode === 'grid' ? 'none' : '';

  const pageItems = getPageItems(currentPage);
  if (pageItems.length === 0) {
    table.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text-3);font-size:13px">${t('nuExistaProiecte')}</div>`;
    renderPagination();
    return;
  }

  if (_viewMode === 'grid') {
    _renderGrid(table, pageItems);
  } else {
    _renderList(table, pageItems);
  }

  renderPagination();
}

// ── LIST RENDER ───────────────────────────────────────────────────────────
function _renderList(table, pageItems) {
  table.className = 'mod-table-list'; // reset from grid class if toggled
  pageItems.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'mod-row';
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.onclick   = () => { openProject(entry.id); };
    row.onkeydown = e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); openProject(entry.id); } };
    const mod = MOD_CACHE[entry.id];
    const name     = mod ? mod.name     : entry.id;
    const dev      = mod ? mod.dev      : '';
    const year     = mod ? mod.year     : '';
    const verCount = mod ? mod.versions.length : '–';
    const marksInlineHtml = mod && mod.marks?.length
      ? renderMarksHtml(mod.marks, { compact: true, limit: 3 })
      : '';
    const thumbInner = mod && mod.image
      ? `<img src="${mod.image}" alt="${name}" style="width:100%;height:100%;object-fit:cover;display:block">`
      : (mod ? coverThumbFallback(mod) : `<div style="width:100%;height:100%;background:var(--s3)"></div>`);
    const isNew = entry.timestamp && (Date.now() - (entry.timestamp > 1e12 ? entry.timestamp : entry.timestamp * 1000)) < 5 * 24 * 60 * 60 * 1000;
    const newBadgeHtml = isNew && !(mod?.marks?.length) ? `<span class="mr-new-badge">${window.siteLang === 'ro' ? 'Nou' : 'New'}</span>` : '';
    row.innerHTML = `
      <div class="mr-name-cell">
        <div class="mr-cover-thumb">${thumbInner}</div>
        <div class="mr-name-inner">
          <div class="mr-name"><span class="mr-name-text">${name}</span>${marksInlineHtml ? `<span class="mr-name-badges">${marksInlineHtml}</span>` : ''}${newBadgeHtml}</div>
          <div class="mr-dev">${dev}</div>
        </div>
      </div>
      <div class="mr-files-cell"><strong>${verCount}</strong><span>${t('versiuni')}</span></div>
      <div class="mr-dl-cell" data-proj-id="${entry.id}">${_dlIconSvg}<span>${_mockDownloads(entry.id)}</span></div>
      <div class="mr-year-cell">
        <svg class="mr-chevron" style="display:inline-block;vertical-align:middle;margin-left:4px" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="5,3 9,7 5,11"/></svg>
      </div>`;
    table.appendChild(row);
  });
}

// ── GRID RENDER ───────────────────────────────────────────────────────────
// Fill N cards gap-lessly using CSS Grid with auto-fit + 1 wider "featured" card
// when count doesn't divide evenly into equal rows.
function _renderGrid(table, pageItems) {
  const count = pageItems.length;

  // Compute column count from real container width
  const wrap = document.querySelector('.mod-table-wrap');
  const containerW = wrap ? wrap.offsetWidth : 900;
  const cols = containerW >= 720 ? 3 : (containerW >= 480 ? 2 : 1);

  // How many cards are in the last (possibly incomplete) row
  const lastRowCount = count % cols === 0 ? cols : count % cols;
  const lastRowStart = count - lastRowCount; // index of first card in last row

  // Each last-row orphan spans (cols / lastRowCount) columns so they fill the row.
  // Only works cleanly when cols is divisible by lastRowCount.
  // e.g. 10 items, 3 cols → last row has 1 card → it spans 3 (full width is ugly for 1)
  //      10 items, 3 cols → last row has 1 card:
  //        if lastRowCount === 1 → span = cols (full row, normal card, not "wide" hero)
  //        if lastRowCount === 2 → each spans 1 (already even, no action needed since cols=3
  //            but we give each span=1 which is default anyway)
  // Better rule: distribute cols evenly among orphan cards.
  //   spanPerOrphan = Math.floor(cols / lastRowCount)
  //   remainder     = cols % lastRowCount  → first `remainder` cards get +1 span
  const isLastRowFull = lastRowCount === cols;
  const spanBase = isLastRowFull ? 1 : Math.floor(cols / lastRowCount);
  const spanRem  = isLastRowFull ? 0 : cols % lastRowCount;

  table.className = 'mod-grid';
  table.style.setProperty('--mg-cols', cols);
  table.setAttribute('data-cols', cols);

  pageItems.forEach((entry, i) => {
    const mod = MOD_CACHE[entry.id];
    const name     = mod ? mod.name     : entry.id;
    const dev      = mod ? mod.dev      : '';
    const year     = mod ? mod.year     : '';
    const verCount = mod ? mod.versions.length : '–';
    const marksHtml = mod && mod.marks?.length
      ? `<div class="mgc-marks">${renderMarksHtml(mod.marks, { compact: true, limit: 2 })}</div>`
      : '';

    // Hero: use imageHero2 (grid thumbnail) in grid, fall back to imageHero, then image (favicon), then gradient
    const heroSrc = mod && (mod.imageHero2 || mod.imageHero || mod.image);
    const heroInner = heroSrc
      ? `<img src="${heroSrc}" alt="${name}" class="mgc-hero-img">`
      : (mod
          ? `<div class="mgc-hero-fallback" style="background:${coverHeroBg(mod)}">${name.charAt(0).toUpperCase()}</div>`
          : `<div class="mgc-hero-fallback"></div>`);

    // Compute span for this card
    let span = 1;
    if (!isLastRowFull && i >= lastRowStart) {
      const posInLastRow = i - lastRowStart;
      span = spanBase + (posInLastRow < spanRem ? 1 : 0);
    }

    const isNew = entry.timestamp && (Date.now() - (entry.timestamp > 1e12 ? entry.timestamp : entry.timestamp * 1000)) < 5 * 24 * 60 * 60 * 1000;
    const newBadgeHtml = isNew && !(mod?.marks?.length) ? `<span class="mr-new-badge mgc-new-badge">${window.siteLang === 'ro' ? 'Nou' : 'New'}</span>` : '';

    const card = document.createElement('div');
    card.className = 'mgc';
    if (span > 1) card.style.gridColumn = `span ${span}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.onclick   = () => openProject(entry.id);
    card.onkeydown = e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); openProject(entry.id); } };

    card.innerHTML = `
      <div class="mgc-hero">${heroInner}${newBadgeHtml}</div>
      <div class="mgc-body">
        <div class="mgc-name">${name}</div>
        <div class="mgc-dev">${dev}</div>
        ${marksHtml}
        <div class="mgc-footer">
          <span class="mgc-ver"><strong>${verCount}</strong> ${t('versiuni')}</span>
          <span class="mgc-dl-count" data-proj-id="${entry.id}">${_dlIconSvg}<span>${_mockDownloads(entry.id)}</span></span>
        </div>
      </div>`;
    table.appendChild(card);
  });
}

// ── PAGINATION ─────────────────────────────────────────────────────────────
function getPageItems(page) {
  const source = _sortedIndex.length ? _sortedIndex : INDEX;
  const start = (page - 1) * PAGE_SIZE;
  return source.slice(start, start + PAGE_SIZE);
}
function renderPagination() {
  let existing = document.getElementById('mod-pagination');
  if (existing) existing.remove();
  const wrap = document.createElement('div');
  wrap.id = 'mod-pagination';
  wrap.className = 'mod-pagination';
  const pages = [];
  const show = new Set([1, totalPages, currentPage, currentPage-1, currentPage+1].filter(p => p>=1 && p<=totalPages));
  const sorted = [...show].sort((a,b)=>a-b);
  pages.push(`<button class="pg-btn pg-arrow" ${currentPage===1?'disabled':''} onclick="goPage(${currentPage-1})">«</button>`);
  let prev = 0;
  sorted.forEach(p => {
    if (prev && p - prev > 1) pages.push(`<span class="pg-ellipsis">...</span>`);
    pages.push(`<button class="pg-btn ${p===currentPage?'pg-active':''}" onclick="goPage(${p})">${p}</button>`);
    prev = p;
  });
  pages.push(`<button class="pg-btn pg-arrow" ${currentPage===totalPages?'disabled':''} onclick="goPage(${currentPage+1})">»</button>`);
  wrap.innerHTML = pages.join('');
  document.querySelector('.mod-table-wrap').after(wrap);
}
function goPage(page) {
  if (page < 1 || page > totalPages || page === currentPage) return;
  const url = new URL(window.location.href);
  url.searchParams.set('page', 'proiecte');
  url.searchParams.delete('id');
  if (page > 1) {
    url.searchParams.set('pagina', page);
  } else {
    url.searchParams.delete('pagina');
  }
  window.history.pushState(null, '', url.pathname + url.search);
  currentPage = page;
  document.title = _projectsTitle(currentPage);
  renderMods();
  preloadPage(currentPage);
}
window.goPage = goPage;

// ── LOAD INDEX ────────────────────────────────────────────────────────────
async function loadIndex() {
  showModsLoading();
  try {
    const indexDoc = await getDoc(doc(db, 'projects', 'projects'));
    if (!indexDoc.exists()) { INDEX = []; totalPages = 1; renderMods(); return; }
    const data = indexDoc.data();
    const ALL_INDEX_RAW = Object.entries(data)
      .filter(([id, entry]) => id !== '_metadata' && typeof entry === 'object');
    window._ALL_INDEX_RAW = ALL_INDEX_RAW;
    INDEX = ALL_INDEX_RAW.filter(([, entry]) => entry.public === true)
      .map(([id, entry]) => {
        const ts = entry.timestamp;
        return { id, timestamp: typeof ts === 'number' ? ts : (parseInt(ts) || 0), public: entry.public };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
    _applySort();
    totalPages = Math.max(1, Math.ceil(_sortedIndex.length / PAGE_SIZE));
    renderMods();
    renderHomeStats({});   // render with computed stats immediately
    preloadPage(currentPage);
    if (_pendingProjectId) { _doOpenProjectFromFirestore(_pendingProjectId); _pendingProjectId = null; }
    if (_pendingPage) {
      if (_pendingPage < 1 || _pendingPage > totalPages) { show404(); _pendingPage = null; }
      else { currentPage = _pendingPage; _pendingPage = null; renderMods(); preloadPage(currentPage); }
    }
  } catch (err) {
    console.error('Firestore index error:', err);
    document.getElementById('mod-table').innerHTML = `<div style="padding:32px;text-align:center;color:var(--text-3);font-size:13px">${t('nuSauPututIncarca')}</div>`;
  }
}

async function preloadPage(page) {
  const items = getPageItems(page);
  const toLoad = items.filter(e => !MOD_CACHE[e.id]);
  if (!toLoad.length) {
    // Already cached — still update home if on page 1
    if (page === 1) { renderHomeFeatured(); playTerminalAnim(); }
    return;
  }
  await Promise.all(toLoad.map(async entry => {
    try {
      const d = await getDoc(doc(db, 'projects', entry.id));
      if (d.exists()) MOD_CACHE[entry.id] = firestoreDocToMod(entry.id, d.data());
    } catch(e) { console.warn('Could not load mod', entry.id, e); }
  }));
  _maybeRenderCatFilter();
  renderMods();
  if (page === 1) { renderHomeFeatured(); playTerminalAnim(); }
}

function showModsLoading() {
  document.getElementById('mod-table').innerHTML = `
    <div style="padding:32px;text-align:center;color:var(--text-3);font-size:13px">
      <svg style="width:20px;height:20px;animation:spin 1s linear infinite;display:inline-block;margin-bottom:8px;opacity:.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
      <br>${t('seIncarcaProiecte')}
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
}

// ── PROJECT PAGE ───────────────────────────────────────────────────────────
function openProject(modId) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', 'proiecte');
  url.searchParams.set('id', modId);
  url.searchParams.delete('pagina');
  window.history.pushState(null, '', url.pathname + url.search);
  _doOpenProjectFromFirestore(modId);
}

async function _doOpenProjectFromFirestore(modId) {
  if (window._ALL_INDEX_RAW) {
    const entry = window._ALL_INDEX_RAW.find(([id]) => id === modId);
    if (entry && entry[1].public === false) { showPrivate(modId); return; }
    if (!entry) { show404(); return; }
  }
  let m = MOD_CACHE[modId];
  if (!m) {
    try {
      const d = await getDoc(doc(db, 'projects', modId));
      if (!d.exists()) { show404(); return; }
      m = firestoreDocToMod(modId, d.data());
      MOD_CACHE[modId] = m;
      renderMods();
    } catch(e) { show404(); return; }
  }
  currentMod = m;
  _renderProjectPage(m);
}

// ── CODE BLOCK RENDERER (highlight.js) ───────────────────────────────────
let _codeBlockCount = 0;
const _codeStore = {};

window._codeBlockCopy = function(id) {
  const code = _codeStore[id] || '';
  const btn = document.getElementById(id + '-copy');
  navigator.clipboard.writeText(code).then(() => {
    if (btn) {
      btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,8 6,11 13,4"/></svg>`;
      setTimeout(() => {
        btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="9" height="11" rx="1.5"/><path d="M3 4.5A1.5 1.5 0 0 0 2 6v7.5A1.5 1.5 0 0 0 3.5 15H10"/></svg>`;
      }, 1500);
    }
  }).catch(() => {});
};

function _buildMarkedRenderer() {
  const renderer = new marked.Renderer();
  renderer.code = function(code, infoString) {
    const lang = (infoString || '').split(/\s+/)[0].toLowerCase();
    const id = 'code-block-' + (++_codeBlockCount);
    _codeStore[id] = code;

    let highlighted;
    if (lang && window.hljs && window.hljs.getLanguage(lang)) {
      highlighted = window.hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    } else if (window.hljs) {
      highlighted = window.hljs.highlightAuto(code).value;
    } else {
      highlighted = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    const copyIcon = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="9" height="11" rx="1.5"/><path d="M3 4.5A1.5 1.5 0 0 0 2 6v7.5A1.5 1.5 0 0 0 3.5 15H10"/></svg>`;
    const langLabel = lang ? `<span class="cb-lang">${lang}</span>` : '';
    return `<div class="code-block">
  <div class="cb-header">
    ${langLabel}
    <button class="cb-copy" id="${id}-copy" onclick="_codeBlockCopy('${id}')" title="Copiaza">${copyIcon}</button>
  </div>
  <pre class="cb-pre"><code class="hljs">${highlighted}</code></pre>
</div>`;
  };
  return renderer;
}

let _markedReady = false;
function _markedParse(text) {
  if (!_markedReady) {
    marked.setOptions({ breaks: true, gfm: true });
    marked.use({ renderer: _buildMarkedRenderer() });
    _markedReady = true;
  }
  return marked.parse(text);
}


const DESC_COLLAPSE_HEIGHT = 120;
let _descCollapseScroll = null; // cleanup fn for scroll listener

// ── DESCRIPTION TOC — slides in on native scrollbar hold ─────────────────

function _buildDescToc(inner, projPage) {
  // Pick the heading level with the most entries (h1 > h2 > h3 as tiebreaker)
  const allHeadings = [...inner.querySelectorAll('h1, h2, h3')];
  const counts = { H1: 0, H2: 0, H3: 0 };
  allHeadings.forEach(h => { counts[h.tagName] = (counts[h.tagName] || 0) + 1; });
  const topTag = ['H1', 'H2', 'H3'].reduce((best, tag) =>
    counts[tag] > counts[best] ? tag : best, 'H1') || null;
  const headings = counts[topTag] > 0 ? allHeadings.filter(h => h.tagName === topTag) : [];
  if (headings.length < 1) return null;

  headings.forEach((h, i) => { if (!h.id) h.id = 'desc-h-' + i; });

  // ── DOM
  const wrap = document.createElement('div');
  wrap.className = 'dtoc-wrap';

  const chapterList = document.createElement('div');
  chapterList.className = 'dtoc-chapters';

  const marker = document.createElement('div');
  marker.className = 'dtoc-marker';
  chapterList.appendChild(marker);

  const items = headings.map((h) => {
    const level = parseInt(h.tagName[1]);
    const text  = h.textContent.trim().replace(/^#+\s*/, '');
    const row   = document.createElement('button');
    row.className = 'dtoc-chapter dtoc-h' + level;
    row.title     = text;
    row.innerHTML = '<span class="dtoc-ch-dot"></span><span class="dtoc-ch-label">' + text + '</span>';
    row.addEventListener('mousedown', e => {
      const pageRect = projPage.getBoundingClientRect();
      const headRect = h.getBoundingClientRect();
      projPage.scrollBy({ top: headRect.top - pageRect.top - 20 });
      e.preventDefault();
    });
    chapterList.appendChild(row);
    return { row, heading: h };
  });

  wrap.appendChild(chapterList);
  document.body.appendChild(wrap);

  // ── Cached heading offsets relative to projPage scrollTop=0 — no live getBCR on scroll
  let _headingOffsets = [];
  let _itemH = 0;
  const _cacheOffsets = () => {
    const pageTop = projPage.getBoundingClientRect().top - projPage.scrollTop;
    _headingOffsets = headings.map(h => h.getBoundingClientRect().top - pageTop);
    _itemH = items[0]?.row.offsetHeight || 32;
  };

  // ── POSITION — flush left of native scrollbar, full proj-page height
  let _rafRepo = 0;
  const reposition = () => {
    cancelAnimationFrame(_rafRepo);
    _rafRepo = requestAnimationFrame(() => {
      const pr  = projPage.getBoundingClientRect();
      const sbW = projPage.offsetWidth - projPage.clientWidth;
      wrap.style.right  = (window.innerWidth - pr.right + sbW) + 'px';
      wrap.style.top    = pr.top + 'px';
      wrap.style.height = pr.height + 'px';
      _cacheOffsets();
    });
  };
  reposition();

  // ── UPDATE active chapter — runs inside a continuous rAF loop while dragging
  // No cancel-on-scroll: scroll fires faster than rAF during thumb drag,
  // so we just let the loop tick every frame and read scrollTop (cheap, no layout).
  let _rafUpdate = 0;
  let _lastActive = -1;
  let _nativeDragging = false;

  const _tick = () => {
    const atBottom = projPage.scrollTop + projPage.clientHeight >= projPage.scrollHeight - 4;
    let activeIdx;
    if (atBottom) {
      activeIdx = headings.length - 1;
    } else {
      const refY = projPage.scrollTop + 60;
      activeIdx = 0;
      for (let i = _headingOffsets.length - 1; i >= 0; i--) {
        if (_headingOffsets[i] <= refY) { activeIdx = i; break; }
      }
    }

    if (activeIdx !== _lastActive) {
      _lastActive = activeIdx;
      items.forEach((it, i) => it.row.classList.toggle('dtoc-active', i === activeIdx));
      const activeEl = items[activeIdx]?.row;
      if (activeEl) {
        chapterList.scrollTop = activeEl.offsetTop - chapterList.clientHeight / 2 + _itemH / 2;
        marker.style.top    = activeEl.offsetTop + 'px';
        marker.style.height = _itemH + 'px';
      }
    }

    if (_nativeDragging) _rafUpdate = requestAnimationFrame(_tick);
  };

  // ── DETECT native scrollbar mousedown
  const onDocMouseDown = e => {
    const pr  = projPage.getBoundingClientRect();
    const sbL = pr.left + projPage.clientWidth;
    if (e.clientX >= sbL && e.clientX <= pr.right && e.clientY >= pr.top && e.clientY <= pr.bottom) {
      _nativeDragging = true;
      wrap.classList.add('dtoc-visible');
      cancelAnimationFrame(_rafUpdate);
      _rafUpdate = requestAnimationFrame(_tick);
    }
  };

  const onDocMouseUp = () => {
    if (!_nativeDragging) return;
    _nativeDragging = false;
    wrap.classList.remove('dtoc-visible');
  };

  document.addEventListener('mousedown', onDocMouseDown);
  document.addEventListener('mouseup',   onDocMouseUp);
  window.addEventListener('resize', reposition);

  wrap._cleanup = () => {
    cancelAnimationFrame(_rafRepo);
    cancelAnimationFrame(_rafUpdate);
    document.removeEventListener('mousedown', onDocMouseDown);
    document.removeEventListener('mouseup',   onDocMouseUp);
    window.removeEventListener('resize', reposition);
    wrap.remove();
  };
  return wrap;
}

function _renderDesc(el, raw) {
  if (_descCollapseScroll) { _descCollapseScroll(); _descCollapseScroll = null; }

  if (!raw) { el.innerHTML = ''; return; }
  const html = _markedParse(raw);
  el.innerHTML = `<div class="proj-desc-inner md-prose">${html}</div>`;

  requestAnimationFrame(() => {
    const inner = el.querySelector('.proj-desc-inner');
    if (!inner) return;

    const full = inner.scrollHeight;
    const needsCollapse = full > DESC_COLLAPSE_HEIGHT + 24;
    let _tocWrap = null;
    const projPage = document.getElementById('proj-page');

    if (needsCollapse) {
      inner.style.maxHeight = DESC_COLLAPSE_HEIGHT + 'px';
      inner.classList.add('desc-collapsed');
    }

    const toggle = document.createElement('button');
    toggle.className = 'desc-toggle';
    toggle.textContent = t('descToggleMore');

    let expanded = false;

    const floatBtn = document.createElement('button');
    floatBtn.className = 'desc-float-collapse';
    floatBtn.innerHTML = `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,9 7,5 11,9"/></svg> ${t('descToggleLess')}`;
    floatBtn.style.display = 'none';
    document.body.appendChild(floatBtn);

    const positionFloatBtn = () => {
      if (!expanded) return;
      const pr = projPage.getBoundingClientRect();
      floatBtn.style.left = Math.round(pr.left + pr.width / 2) + 'px';
    };
    window.addEventListener('resize', positionFloatBtn);

    let _rafFloat = 0;
    const updateFloatVisibility = () => {
      cancelAnimationFrame(_rafFloat);
      _rafFloat = requestAnimationFrame(() => {
        if (!expanded) { floatBtn.style.display = 'none'; return; }
        const descRect = el.getBoundingClientRect();
        const show = descRect.bottom < 80;
        floatBtn.style.display = show ? '' : 'none';
        if (show) positionFloatBtn();
      });
    };

    projPage.addEventListener('scroll', updateFloatVisibility, { passive: true });

    _descCollapseScroll = () => {
      projPage.removeEventListener('scroll', updateFloatVisibility);
      window.removeEventListener('resize', positionFloatBtn);
      if (_tocWrap) { _tocWrap._cleanup?.(); _tocWrap = null; }
      floatBtn.remove();
    };

    const showToc = () => {
      if (_tocWrap) return;
      _tocWrap = _buildDescToc(inner, projPage);
    };

    const hideToc = () => {
      if (_tocWrap) { _tocWrap._cleanup?.(); _tocWrap = null; }
    };

    const collapse = () => {
      expanded = false;
      inner.style.maxHeight = DESC_COLLAPSE_HEIGHT + 'px';
      inner.classList.add('desc-collapsed');
      toggle.textContent = t('descToggleMore');
      floatBtn.style.display = 'none';
      hideToc();
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    if (needsCollapse) {
      toggle.addEventListener('click', () => {
        expanded = !expanded;
        if (expanded) {
          inner.style.maxHeight = full + 'px';
          inner.classList.remove('desc-collapsed');
          toggle.textContent = t('descToggleLess');
          showToc();
          updateFloatVisibility();
        } else {
          collapse();
        }
      });
      floatBtn.addEventListener('click', collapse);
      el.appendChild(toggle);
    } else {
      // No collapse needed — show TOC right away
      floatBtn.remove();
      showToc();
    }
  });
}

// ── PROJECT PAGE TABS ─────────────────────────────────────────────────────
let _currentProjTab = 'versions';

function switchProjTab(tab) {
  _currentProjTab = tab;
  ['versions', 'code', 'license'].forEach(id => {
    const btn   = document.getElementById('ptab-' + id);
    const panel = document.getElementById('proj-panel-' + id);
    if (btn)   btn.classList.toggle('active', id === tab);
    if (panel) panel.style.display = id === tab ? '' : 'none';
  });
  // Lazy-load on first open
  const m = currentMod;
  if (!m) return;
  if (tab === 'code'    && !document.getElementById('proj-code-panel').__loaded)    _loadCodePanel(m);
  if (tab === 'license' && !document.getElementById('proj-license-panel').__loaded) _loadLicensePanel(m);
}
window.switchProjTab = switchProjTab;

// ── GITHUB REPO FILE LISTING ──────────────────────────────────────────────
async function _loadCodePanel(m) {
  const el = document.getElementById('proj-code-panel');
  if (!el || !m.codeRepo) {
    if (el) el.innerHTML = `<div class="proj-tab-empty">${t('code-no-repo')}</div>`;
    el.__loaded = true;
    return;
  }
  el.__loaded = true;
  el.innerHTML = `<div class="proj-tab-loading">${t('code-loading')}</div>`;

  // Extract owner/repo from GitHub URL
  const match = m.codeRepo.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/);
  if (!match) {
    el.innerHTML = `<div class="proj-tab-empty">${t('code-error')}</div>`;
    return;
  }
  const [, owner, repo] = match;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/`;

  try {
    const res  = await fetch(apiUrl, { headers: { Accept: 'application/vnd.github.v3+json' } });
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('bad response');

    const files = data.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    const folderIcon = `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M1 3h5l1.5 1.5H13V11H1z"/></svg>`;
    const fileIcon   = `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 1h7l3 3v9H2z"/><path d="M9 1v3h3"/></svg>`;
    const dlIcon     = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="6,2 6,8"/><polyline points="3,6 6,9 9,6"/><line x1="2" y1="10.5" x2="10" y2="10.5"/></svg>`;

    // Try main branch first, then master
    const codeZipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;

    const fileCount = files.length;
    const rows = files.map(f => {
      const icon  = f.type === 'dir' ? folderIcon : fileIcon;
      const dlBtn = f.type !== 'dir' && f.download_url
        ? `<a class="gh-file-dl" href="${f.download_url}" download rel="noopener" title="${t('descarca')}">${dlIcon}</a>`
        : '';
      const size  = f.type !== 'dir' && f.size ? `<span class="gh-file-size">${_fmtSize(f.size)}</span>` : '';
      return `<div class="gh-file-row">
        <span class="gh-file-icon ${f.type === 'dir' ? 'gh-dir' : ''}">${icon}</span>
        <span class="gh-file-name">${f.name}</span>
        ${size}
        ${dlBtn}
      </div>`;
    }).join('');

    el.innerHTML = `
      <div class="gh-files-wrap">
        <div class="gh-files-header">
          <span class="gh-files-label">${fileCount} ${window.siteLang === 'ro' ? 'fișiere' : 'files'}</span>
          <a class="gh-dl-zip" href="${codeZipUrl}" target="_blank" rel="noopener">
            ${dlIcon} Download ZIP
          </a>
        </div>
        <div class="gh-files-list">${rows}</div>
      </div>`;
  } catch(e) {
    el.innerHTML = `<div class="proj-tab-empty">${t('code-error')}</div>`;
  }
}

function _fmtSize(bytes) {
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

// ── LICENSE PANEL ─────────────────────────────────────────────────────────
let _licensesCache = null;

async function _loadLicensePanel(m) {
  const el = document.getElementById('proj-license-panel');
  if (!el) return;
  el.__loaded = true;

  if (!m.licenseKey) {
    el.innerHTML = `<div class="proj-tab-empty">${t('license-none')}</div>`;
    return;
  }
  el.innerHTML = `<div class="proj-tab-loading">${t('license-loading')}</div>`;

  try {
    if (!_licensesCache) {
      const r = await fetch('https://raw.githubusercontent.com/floringhitun223/florindevassets/main/licenses.json');
      const json = await r.json();
      _licensesCache = Array.isArray(json) ? json : (json.licenses || Object.values(json));
    }
    const lic = _licensesCache.find(l => (l.id || l.key || l.spdx_id) === m.licenseKey);
    if (!lic) {
      el.innerHTML = `<div class="proj-tab-empty">${m.licenseKey}</div>`;
      return;
    }
    const name  = lic.name || m.licenseKey;
    const url   = lic.url  || lic.link || '';
    // description may be a bilingual {ro,en} object or a plain string
    const rawDesc = lic.description || lic.body || lic.text || '';
    const desc = (rawDesc && typeof rawDesc === 'object')
      ? (window.siteLang === 'ro' ? (rawDesc.ro || rawDesc.en || '') : (rawDesc.en || rawDesc.ro || ''))
      : (typeof rawDesc === 'string' ? rawDesc : '');
    el.innerHTML = `
      <div class="license-wrap">
        <div class="license-name-row">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" style="width:14px;height:14px;flex-shrink:0;opacity:.6"><path d="M7 1l1.5 3 3.3.48-2.4 2.34.57 3.3L7 8.55 4.03 10.12l.57-3.3L2.2 4.48 5.5 4z"/></svg>
          <span class="license-name">${name}</span>
        </div>
        ${desc ? `<p class="license-desc">${desc}</p>` : ''}
      </div>`;
  } catch(e) {
    el.innerHTML = `<div class="proj-tab-empty">${t('license-error')}</div>`;
  }
}

function _renderProjectPage(m) {
  const heroEl  = document.getElementById('proj-hero');
  const heroArt = document.getElementById('proj-hero-art');
  // Reset tabs — default active is versions, but fall back to first visible
  const defaultTab = m.versions.length ? 'versions' : (m.codeRepo ? 'code' : (m.licenseKey ? 'license' : 'versions'));
  _currentProjTab = defaultTab;
  ['versions', 'code', 'license'].forEach(id => {
    const btn   = document.getElementById('ptab-' + id);
    const panel = document.getElementById('proj-panel-' + id);
    if (btn)   btn.classList.toggle('active', id === defaultTab);
    if (panel) panel.style.display = id === defaultTab ? '' : 'none';
    if (panel) panel.__loaded = false;
  });
  // Tab label i18n
  const versionsLabelEl = document.getElementById('ptab-versions-label');
  const codeLabelEl     = document.getElementById('ptab-code-label');
  const licenseLabelEl  = document.getElementById('ptab-license-label');
  if (versionsLabelEl) versionsLabelEl.textContent = t('tab-versions');
  if (codeLabelEl)     codeLabelEl.textContent     = t('tab-code');
  if (licenseLabelEl)  licenseLabelEl.textContent  = t('tab-license');
  // Show/hide Code and License tab buttons
  const versionsTabBtn = document.getElementById('ptab-versions');
  const codeTabBtn     = document.getElementById('ptab-code');
  const licenseTabBtn  = document.getElementById('ptab-license');
  if (versionsTabBtn) versionsTabBtn.style.display = m.versions.length ? '' : 'none';
  if (codeTabBtn)     codeTabBtn.style.display     = m.codeRepo    ? '' : 'none';
  if (licenseTabBtn)  licenseTabBtn.style.display  = m.licenseKey  ? '' : 'none';
  // Lazy-load if default tab is code or license
  if (defaultTab === 'code')    _loadCodePanel(m);
  if (defaultTab === 'license') _loadLicensePanel(m);

  const panelHeroSrc = m.imageHero || m.image || '';
  if (panelHeroSrc) {
    heroArt.innerHTML = `<img src="${panelHeroSrc}" alt="${m.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">`;
    heroEl.style.background = '#111';
  } else {
    heroArt.innerHTML = '';
    heroEl.style.background = coverHeroBg(m);
  }
  document.getElementById('proj-title-crumb').textContent = m.name;
  document.getElementById('proj-hero-name').textContent   = m.name;
  document.title = m.name + ' · FlorinDev';
  document.getElementById('proj-hero-meta').textContent   = m.dev;
  // Category chip — hidden on project page (list only)
  const projCatEl = document.getElementById('proj-category');
  if (projCatEl) { projCatEl.style.display = 'none'; projCatEl.innerHTML = ''; }
  document.getElementById('proj-hero-authors').innerHTML  = m.authors.map(authorChip).join('');
  const statusLabels = { done: t('statusDone'), wip: t('statusWip'), early: t('statusEarly') };
  const statusClasses = { done: 'pill-done', wip: 'pill-wip', early: 'pill-early' };
  document.getElementById('proj-status-badge').innerHTML =
    `<span class="status-pill ${statusClasses[m.status] || 'pill-early'}">${statusLabels[m.status] || m.status}</span>`;
  const dlBtn = document.getElementById('proj-download-btn');
  if (m.downloadUrl) {
    dlBtn.style.display = 'inline-flex';
    dlBtn.onclick = () => window.open(m.downloadUrl, '_blank');
    const isPlayStore = m.downloadUrl.includes('play.google.com');
    if (isPlayStore) {
      dlBtn.classList.add('btn-play-store');
      dlBtn.classList.remove('btn-download');
      dlBtn.innerHTML = `
        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="6.5,2 6.5,9"/><polyline points="3,6.5 6.5,10 10,6.5"/><line x1="2" y1="11.5" x2="11" y2="11.5"/></svg>
        <span style="display:flex;flex-direction:column;align-items:flex-start;line-height:1.1">
          <span style="font-size:10px;font-weight:400;letter-spacing:.06em;opacity:.85">${t('getItOn')}</span>
          <span style="font-size:18px;font-weight:700;letter-spacing:-.01em">Google Play</span>
        </span>`;
    } else {
      dlBtn.classList.remove('btn-play-store');
      dlBtn.classList.add('btn-download');
      dlBtn.innerHTML = `<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="6.5,2 6.5,9"/><polyline points="3,6.5 6.5,10 10,6.5"/><line x1="2" y1="11.5" x2="11" y2="11.5"/></svg><span>${t('descarca')}</span>`;
    }
  } else {
    dlBtn.style.display = 'none';
  }
  const marksEl = document.getElementById('proj-marks');
  if (marksEl) {
    if (m.marks?.length) {
      marksEl.style.display = '';
      marksEl.innerHTML = renderMarksHtml(m.marks);
    } else if (m.aiUsed) {
      marksEl.style.display = '';
      marksEl.innerHTML = markChipHtml({ key: 'ai-legacy', label: m.aiDisclaimer, color: 'purple', icon: '🤖' });
    } else {
      marksEl.style.display = 'none';
      marksEl.innerHTML = '';
    }
  }
  _renderDesc(document.getElementById('proj-desc'), m.description);
  // Download count badge on project hero
  let _dlCountEl = document.getElementById('proj-dl-count');
  if (!_dlCountEl) {
    _dlCountEl = document.createElement('span');
    _dlCountEl.id = 'proj-dl-count';
    _dlCountEl.className = 'proj-dl-count';
    dlBtn.parentNode.insertBefore(_dlCountEl, dlBtn.nextSibling);
  }
  _dlCountEl.innerHTML = `${_dlIconSvg}<span>${_mockDownloads(m.id)}</span> ${window.siteLang === 'ro' ? 'descărcări' : 'downloads'}`;

  const filesCountEl = document.getElementById('proj-files-count');
  if (filesCountEl) filesCountEl.textContent = m.versions.length > 0 ? m.versions.length : '';
  const timeline = document.getElementById('ver-timeline');
  timeline.innerHTML = m.versions.map((v, i) => {
    const isLatest = i === 0;
    const vUrl = v.url || m.downloadUrl;
    const canDl = !!vUrl;
    return `
      <div class="ver-item${isLatest ? ' ver-latest' : ''}">
        <div class="ver-dot-col">
          <div class="ver-dot${isLatest ? ' ver-dot-latest' : ''}"></div>
          ${i < m.versions.length - 1 ? '<div class="ver-line"></div>' : ''}
        </div>
        <div class="ver-content">
          <div class="ver-top">
            <span class="ver-tag">${v.tag}</span>
            ${isLatest ? '<span class="ver-latest-badge">Latest</span>' : ''}
            ${v.date ? `<span class="ver-date">${v.date}</span>` : ''}
          </div>
          ${v.note ? `<div class="ver-note">${v.note}</div>` : ''}
          <div class="ver-file-row">
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 2h6l3 3v7H2z"/></svg>
            <span class="ver-file-name">${v.file || t('fisierNedisponibil')}</span>
            ${v.commit ? `<span class="ver-commit">${v.commit}</span>` : ''}
            <a class="ver-dl-btn ${canDl ? '' : 'ver-dl-locked'}"
               ${canDl ? `href="${vUrl}" target="_blank" onclick="_trackDownload('${m.id}')"` : 'onclick="return false"'}
               title="${canDl ? 'Descarca' : 'Indisponibil'}">
              <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6">
                ${canDl
                  ? `<polyline points="6.5,2 6.5,9"/><polyline points="3,6.5 6.5,10 10,6.5"/><line x1="2" y1="11.5" x2="11" y2="11.5"/>`
                  : `<rect x="3" y="5.5" width="7" height="6" rx="1"/><path d="M4.5 5.5V4a2 2 0 014 0v1.5"/>`}
              </svg>
            </a>
          </div>
        </div>
      </div>`;
  }).join('');
  const backdrop = document.getElementById('proj-backdrop');
  const page     = document.getElementById('proj-page');
  backdrop.classList.add('open');
  requestAnimationFrame(() => page.classList.add('open'));
  document.body.style.overflow = 'hidden';
}

function closeProject() {
  const url = new URL(window.location.href);
  url.searchParams.set('page', 'proiecte');
  url.searchParams.delete('id');
  if (currentPage > 1) {
    url.searchParams.set('pagina', currentPage);
  } else {
    url.searchParams.delete('pagina');
  }
  window.history.pushState(null, '', url.pathname + url.search);
  const backdrop = document.getElementById('proj-backdrop');
  const projPage = document.getElementById('proj-page');
  projPage.classList.remove('open');
  setTimeout(() => { backdrop.classList.remove('open'); document.body.style.overflow = ''; }, 300);
  currentMod = null;
  document.title = _projectsTitle(currentPage);
}

function handleProjBackdrop(e) {
  if (e.target === document.getElementById('proj-backdrop')) closeProject();
}

// ── QUERY-PARAM ROUTING ────────────────────────────────────────────────────
const QUERY_PAGE_MAP = {
  '':                 'home',
  'proiecte':         'products',
  'servicii':         'servicii',
  'despre':           'about',
  'confidentialitate':'privacy',
  'termeni':          'terms',
  'tehnologie':       'tech',
};
const NAV_MAP = {
  home: 'ni-home', products: 'ni-products',
  servicii: 'ni-servicii', about: 'ni-about',
};
function _projectsTitle(page) {
  const base = 'Proiecte · FlorinDev';
  return (page && page > 1) ? `Proiecte · Pagina ${page} · FlorinDev` : base;
}

const PAGE_TITLE_MAP = {
  home:      'FlorinDev',
  products:  'Proiecte · FlorinDev',
  servicii:  'Servicii · FlorinDev',
  about:     'Despre · FlorinDev',
  privacy:   'Confidențialitate · FlorinDev',
  terms:     'Termeni · FlorinDev',
  tech:      'Tehnologie · FlorinDev',
};

// Helpers to navigate to a named section without clobbering lang/other params
function _navTo(pageSlug, extra = {}) {
  const url = new URL(window.location.href);
  // Clear routing params, keep lang
  url.searchParams.delete('page');
  url.searchParams.delete('id');
  url.searchParams.delete('pagina');
  url.searchParams.delete('slug');
  if (pageSlug) url.searchParams.set('page', pageSlug);
  Object.entries(extra).forEach(([k, v]) => {
    if (v !== null && v !== undefined) url.searchParams.set(k, v);
    else url.searchParams.delete(k);
  });
  window.history.pushState(null, '', url.pathname + url.search);
}

let _pendingProjectId = null;
let _pendingPage = null;

function resolveRoute() {
  const params   = new URLSearchParams(window.location.search);
  const sec      = (params.get('page') || '').toLowerCase();
  const projId   = params.get('id')     || '';
  const paginaRaw= params.get('pagina') || '';
  const techSlug = params.get('slug')   || '';

  const projPage = document.getElementById('proj-page');
  if (projPage.classList.contains('open') && !(sec === 'proiecte' && projId)) {
    _closeProjectSilent();
  }

  if (sec === 'proiecte') {
    _activatePage('products');

    // Read view param: 'list' → list; anything else (or absent) → grid (default)
    const viewParam = (params.get('view') || '').toLowerCase();
    const resolvedView = viewParam === 'list' ? 'list' : 'grid';
    if (_viewMode !== resolvedView) {
      _viewMode = resolvedView;
      // Update table head visibility (toolbar may not exist yet — renderMods will handle it)
      const tableHead = document.querySelector('.mod-table-head');
      if (tableHead) tableHead.style.display = _viewMode === 'grid' ? 'none' : '';
    }

    // Read sort param: 'old' → asc; anything else (or absent) → desc (default)
    const sortParam = (params.get('sort') || '').toLowerCase();
    _sortOrder = sortParam === 'old' ? 'asc' : 'desc';

    // ?page=proiecte&id=some-project
    if (projId) {
      if (INDEX.length > 0) _doOpenProjectFromFirestore(projId);
      else _pendingProjectId = projId;
      return;
    }
    // ?page=proiecte&pagina=3
    if (paginaRaw) {
      const pg = parseInt(paginaRaw, 10);
      if (!Number.isInteger(pg) || pg < 1) { show404(); return; }
      if (INDEX.length > 0) {
        if (pg > totalPages) { show404(); return; }
        currentPage = pg;
        _applySort(); renderMods(); preloadPage(currentPage);
      } else {
        // Store raw value — validated against real totalPages once index loads
        _pendingPage = pg;
      }
      return;
    }
    currentPage = 1;
    if (INDEX.length > 0) { _applySort(); renderMods(); preloadPage(1); }
    return;
  }

  if (sec === 'tehnologie' && techSlug) {
    _activatePage('tech');
    loadTechPage(techSlug);
    return;
  }

  // ?page=servicii&id=SLUG — open service panel directly via URL
  // ?page=servicii&cat=KEY — category drill-down
  if (sec === 'servicii') {
    _activatePage('servicii');
    const idParam  = params.get('id')  || '';
    const catParam = params.get('cat') || '';
    const panelEl  = document.getElementById('svc-panel');
    if (idParam && _svcLoadedList) {
      // Render the feed first (so there's a page behind the panel), then open panel
      if (panelEl) _renderSvcFeed(panelEl, _svcLoadedList);
      _doOpenService(idParam);
    } else if (panelEl && _svcLoadedList) {
      if (catParam) _renderSvcCatPage(panelEl, _svcLoadedList, catParam);
      else _renderSvcFeed(panelEl, _svcLoadedList);
    }
    // If services haven't loaded yet, loadServices() will handle id/cat param on its own
    return;
  }

  const pageId = QUERY_PAGE_MAP[sec];
  if (pageId === undefined) { show404(); return; }
  _activatePage(pageId);
}

function _activatePage(pageId) {
  // On the very first call, lift the FOUC guard and fade the page in
  const guards = document.querySelectorAll('#__fouc_guard');
  if (guards.length) {
    guards.forEach(g => g.remove());
    // Inject a one-shot fade-in so the initial page appears smoothly
    const fade = document.createElement('style');
    fade.textContent = '.page.active { animation: page-reveal 160ms ease both; } @keyframes page-reveal { from { opacity:0; } to { opacity:1; } }';
    document.head.appendChild(fade);
    // Remove the animation rule after it has played so SPA transitions use their own class
    setTimeout(() => fade.remove(), 300);
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + pageId);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navId = NAV_MAP[pageId];
  if (navId) document.getElementById(navId).classList.add('active');
  if (pageId === 'privacy') loadLegalPage('privacy');
  if (pageId === 'terms')   loadLegalPage('terms');
  document.title = (pageId === 'products' ? _projectsTitle(currentPage) : PAGE_TITLE_MAP[pageId]) || 'FlorinDev';
}

function _closeProjectSilent() {
  document.getElementById('proj-page').classList.remove('open');
  document.getElementById('proj-backdrop').classList.remove('open');
  document.body.style.overflow = '';
  currentMod = null;
  document.title = _projectsTitle(currentPage);
}

window.addEventListener('popstate', () => { resolveRoute(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('proj-page').classList.contains('open'))
    closeProject();
});

// ── SPA LINK INTERCEPTOR ───────────────────────────────────────────────────
// Intercepts all internal ?page= link clicks and handles them via pushState +
// resolveRoute so navigation is instant (no full page reload).
// Also preserves the current lang param and applies a subtle fade transition.
(function _initSpaLinks() {
  // Tiny CSS for the page-transition fade — injected once
  const _style = document.createElement('style');
  _style.textContent = `
    .spa-transition { animation: spa-fade-in 180ms ease both; }
    @keyframes spa-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  `;
  document.head.appendChild(_style);

  function _triggerTransition() {
    // Animate whichever .page is about to become active
    requestAnimationFrame(() => {
      const active = document.querySelector('.page.active');
      if (!active) return;
      active.classList.remove('spa-transition');
      // Force reflow so removing+re-adding the class restarts the animation
      void active.offsetWidth;
      active.classList.add('spa-transition');
    });
  }

  function _handleInternalLink(href) {
    // Build a full URL so we can surgically update only routing params
    const target = new URL(href, window.location.href);

    // Preserve the current lang in the destination
    const currentLang = new URLSearchParams(window.location.search).get('lang');
    if (currentLang && !target.searchParams.has('lang')) {
      target.searchParams.set('lang', currentLang);
    }

    window.history.pushState(null, '', target.pathname + target.search);
    resolveRoute();
    _triggerTransition();
  }

  // Single delegated listener on the document — zero per-element overhead
  document.addEventListener('click', e => {
    // Walk up from the clicked element to find an <a> tag
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // External links, mailto:, tel:, javascript: — let the browser handle them
    if (/^(https?:\/\/|mailto:|tel:|javascript:)/i.test(href)) return;

    // Only intercept links that contain ?page= (our SPA routing param)
    if (!href.includes('?page=') && !href.includes('&page=')) return;

    // Ctrl/Cmd+click or middle-click → open in new tab normally
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;

    e.preventDefault();
    _handleInternalLink(href);
  }, { passive: false });
})();

function show404() {
  _closeProjectSilent();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-404');
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.title = '404 · FlorinDev';
}

function showPrivate(modId) {
  const heroEl  = document.getElementById('proj-hero');
  const heroArt = document.getElementById('proj-hero-art');
  heroArt.innerHTML = '';
  heroEl.style.background = 'linear-gradient(135deg,#0f0f12,#1a1a20)';
  document.getElementById('proj-title-crumb').textContent = modId;
  document.getElementById('proj-hero-name').textContent   = modId;
  document.getElementById('proj-hero-meta').textContent   = '';
  document.getElementById('proj-hero-authors').innerHTML  = '';
  document.getElementById('proj-status-badge').innerHTML  = '';
  document.getElementById('proj-download-btn').style.display = 'none';
  const marksEl = document.getElementById('proj-marks');
  if (marksEl) { marksEl.style.display = 'none'; marksEl.innerHTML = ''; }
  document.getElementById('proj-files-count').textContent = '';
  document.getElementById('ver-timeline').innerHTML = '';
  document.getElementById('proj-desc').innerHTML = `
    <div class="private-panel-wrap">
      <div class="private-panel-lock">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="22" width="32" height="22" rx="4"/><path d="M16 22V15a8 8 0 0 1 16 0v7"/><circle cx="24" cy="33" r="2.5" fill="currentColor" stroke="none"/><line x1="24" y1="35.5" x2="24" y2="39"/></svg>
      </div>
      <div class="private-panel-title">${t('proiectPrivatTitle')}</div>
      <div class="private-panel-sub">${t('proiectPrivatSub').replace('\n', '<br>')}</div>
    </div>`;
  const backdrop = document.getElementById('proj-backdrop');
  const page     = document.getElementById('proj-page');
  backdrop.classList.add('open');
  requestAnimationFrame(() => page.classList.add('open'));
  document.body.style.overflow = 'hidden';
}

// ── LEGAL PAGES (from Firestore) ──────────────────────────────────────────
const _legalCache = {};
async function loadLegalPage(type) {
  const el = document.getElementById('md-' + type);
  if (!el) return;
  if (_legalCache[type]) { el.innerHTML = _legalCache[type]; return; }
  el.innerHTML = `<div class="md-loading"><div class="md-loading-dot"></div><div class="md-loading-dot"></div><div class="md-loading-dot"></div></div>`;
  try {
    const snap = await getDoc(doc(db, 'site', 'legal'));
    const d = snap.exists() ? snap.data() : {};
    const text = type === 'privacy'
      ? (_langVal(d, 'privacy') || '')
      : (_langVal(d, 'terms') || '');
    if (!text) {
      el.innerHTML = `<div class="md-error">${t('continutIndisponibil')}</div>`;
      return;
    }
    const html = _markedParse(text);
    _legalCache[type] = `<div class="md-prose">${html}</div>`;
    el.innerHTML = _legalCache[type];
  } catch(e) {
    el.innerHTML = `<div class="md-error">${t('nuSaIncarcatDoc')}</div>`;
  }
}

// ── TECHNOLOGY PAGE (from Firestore) ─────────────────────────────────────
const _techCache = {};
async function loadTechPage(slug) {
  const body  = document.getElementById('tech-body');
  const crumb = document.getElementById('tech-title-crumb');
  if (!body) return;

  // Show loading
  body.innerHTML = `<div class="md-loading"><div class="md-loading-dot"></div><div class="md-loading-dot"></div><div class="md-loading-dot"></div></div>`;
  if (crumb) crumb.textContent = slug;

  // Use cache
  if (_techCache[slug]) {
    body.innerHTML  = _techCache[slug].html;
    if (crumb) crumb.textContent = _techCache[slug].label;
    return;
  }

  try {
    const snap = await getDoc(doc(db, 'site', 'technologies'));
    if (!snap.exists()) { _renderTechNotFound(body, slug); return; }
    const d = snap.data();

    // Try exact slug match first, then case-insensitive
    const entry = d[slug] || Object.entries(d).find(([k]) => k.toLowerCase() === slug)?.[1];

    if (!entry || !entry.content) { _renderTechNotFound(body, slug); return; }

    const label = _langVal(entry, 'label') || entry.label || slug;
    if (crumb) crumb.textContent = label;

    const content = _langVal(entry, 'content') || entry.content;
    const html = `<div class="md-prose tech-prose">${_markedParse(content)}</div>`;
    _techCache[slug] = { html, label };
    body.innerHTML = html;
  } catch(e) {
    body.innerHTML = `<div class="md-error">Nu s-a putut incarca pagina pentru <strong>${slug}</strong>.</div>`;
  }
}

function _renderTechNotFound(body, slug) {
  body.innerHTML = `
    <div class="tech-empty">
      <div class="tech-empty-icon">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="8" width="32" height="32" rx="4"/><path d="M16 24h16M16 30h10"/><circle cx="24" cy="17" r="3"/></svg>
      </div>
      <div class="tech-empty-title">${slug}</div>
      <div class="tech-empty-sub">${t('nuDescriereAdaugata').replace('\n', '<br>')}</div>
    </div>`;
}

// ── SITE SETTINGS ─────────────────────────────────────────────────────────
// Admin saves to site/config with camelCase keys generated from field IDs:
// cfg-hero-title → heroTitle, cfg-hero-tagline → heroTagline, etc.
async function loadSiteSettings() {
  try {
    const snap = await getDoc(doc(db, 'site', 'config'));
    if (!snap.exists()) return;
    const d = snap.data();

    // Hero headline (cfg-hero-title → heroTitle / heroTitle_eng / heroTitle_ro)
    const heroTitle = _langVal(d, 'heroTitle');
    if (heroTitle) {
      const el = document.getElementById('home-headline');
      if (el) el.textContent = heroTitle;
    }

    // Hero tagline / eyebrow (cfg-hero-tagline → heroTagline) — text span only
    const heroTagline = _langVal(d, 'heroTagline');
    if (heroTagline) {
      const el = document.getElementById('home-eyebrow-text');
      if (el) el.textContent = heroTagline;
    }

    // Hero description (cfg-hero-desc → heroDesc)
    const heroDesc = _langVal(d, 'heroDesc');
    if (heroDesc) {
      const el = document.getElementById('home-subtext');
      if (el) el.textContent = heroDesc;
    }

    // Meta / page title (cfg-meta-title → metaTitle)
    if (d.metaTitle) {
      document.title = d.metaTitle;
    }

    // Meta description (cfg-meta-desc → metaDesc)
    if (d.metaDesc) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
      meta.content = d.metaDesc;
    }

    // OG image (cfg-og-image → ogImage)
    if (d.ogImage) {
      let og = document.querySelector('meta[property="og:image"]');
      if (!og) { og = document.createElement('meta'); og.setAttribute('property', 'og:image'); document.head.appendChild(og); }
      og.content = d.ogImage;
    }

    // GitHub link (cfg-github → github)
    if (d.github) {
      document.querySelectorAll('.footer-links a[href*="github"], a[href*="github.com"]').forEach(a => {
        a.href = d.github;
      });
    }

    // Contact email (cfg-email → email)
    if (d.email) {
      _contactEmail = d.email;
      document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
        a.href = 'mailto:' + d.email;
      });
    }

    // Home stats + eyebrow version
    renderHomeStats(d);
    updateEyebrow(d);

    // CTA buttons on home (cfg-cta-primary / cfg-cta-secondary → ctaPrimary / ctaSecondary)
    const ctaPrimary = _langVal(d, 'ctaPrimary');
    if (ctaPrimary) {
      const el = document.getElementById('cta-primary');
      if (el) el.textContent = ctaPrimary;
    }
    const ctaSecondary = _langVal(d, 'ctaSecondary');
    if (ctaSecondary) {
      const el = document.getElementById('cta-secondary');
      if (el) el.textContent = ctaSecondary;
    }

    // Social links — build icon buttons for titlebar + footer
    const SOCIALS = [
      { key: 'github',    label: 'GitHub',    icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>` },
      { key: 'discord',   label: 'Discord',   icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>` },
      { key: 'youtube',   label: 'YouTube',   icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>` },
      { key: 'twitter',   label: 'Twitter/X', icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.845L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` },
      { key: 'instagram', label: 'Instagram', icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>` },
    ];

    const activeSocials = SOCIALS.filter(s => d[s.key]);

    // Titlebar social icons
    const tbSocial = document.getElementById('tb-social');
    if (tbSocial) {
      tbSocial.innerHTML = activeSocials.map(s =>
        `<a class="tb-social-btn" href="${d[s.key]}" target="_blank" rel="noopener" title="${s.label}">${s.icon}</a>`
      ).join('');
    }

    // Footer social icons
    const footerSocial = document.getElementById('footer-social');
    if (footerSocial) {
      footerSocial.innerHTML = activeSocials.map(s =>
        `<a class="footer-social-btn" href="${d[s.key]}" target="_blank" rel="noopener" title="${s.label}">${s.icon}</a>`
      ).join('');
    }

    // Also update the GitHub text link in footer if set
    if (d.github) {
      const el = document.getElementById('footer-github');
      if (el) el.href = d.github;
    }

    // Ko-fi donation URL (cfg-kofi → kofi)
    if (d.kofi) {
      document.querySelectorAll('a.tb-kofi, a[title*="Ko-fi"], a[href*="ko-fi.com"]').forEach(a => {
        a.href = d.kofi;
        a.style.display = '';
      });
    } else {
      // Hide Ko-fi button if no URL configured
      document.querySelectorAll('a.tb-kofi').forEach(a => a.style.display = 'none');
    }

    // PayPal donation URL (cfg-paypal → paypal)
    if (d.paypal) {
      document.querySelectorAll('a[href*="paypal.me"], a[title*="PayPal"]:not(.tb-kofi)').forEach(a => {
        a.href = d.paypal;
        a.style.display = '';
      });
    } else {
      // Hide PayPal button if no URL configured
      document.querySelectorAll('.tb-support a:not(.tb-kofi)').forEach(a => {
        if (a.querySelector('svg') && (a.title || '').toLowerCase().includes('paypal')) {
          a.style.display = 'none';
        }
      });
    }

  } catch(e) {
    console.warn('Could not load site settings:', e);
  }
}

// ── SERVICES (accordion, order + badges from admin) ───────────────────────
const SVC_BADGE_CLASS = {
  'Cel mai popular': 'svc-badge-popular',
  'Popular':         'svc-badge-popular',
  'Nou':             'svc-badge-nou',
  'Promo':           'svc-badge-promo',
  'Recomandat':      'svc-badge-recomandat',
  'Limitat':         'svc-badge-promo',
  'Exclusiv':        'svc-badge-recomandat',
  'Predefinit':      'svc-badge-nou',
};

const SVC_TYPE_ICONS = {
  serviciu:   'ti-briefcase',
  produs:     'ti-package',
  abonament:  'ti-repeat',
  pachet:     'ti-box',
};

function _svcBadgeClass(badge) {
  if (!badge) return '';
  return SVC_BADGE_CLASS[badge] || 'svc-badge-custom';
}

function _svcIconClass(badge) {
  if (!badge) return '';
  const cls = _svcBadgeClass(badge);
  if (cls === 'svc-badge-popular') return 'popular';
  if (cls === 'svc-badge-nou' || cls === 'svc-badge-promo') return 'new-svc';
  if (cls === 'svc-badge-recomandat') return 'featured';
  return '';
}

// SVG icon presets — must match admin's SVC_ICON_PRESETS keys exactly
const SVC_SVG_PRESETS = {
  website:    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="16" height="13" rx="1.5"/><path d="M2 7h16"/><circle cx="5" cy="5" r=".5" fill="currentColor" stroke="none"/><circle cx="7.5" cy="5" r=".5" fill="currentColor" stroke="none"/></svg>',
  mobile:     '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="2" width="8" height="16" rx="1.5"/><circle cx="10" cy="15.5" r=".8" fill="currentColor" stroke="none"/><line x1="8" y1="4.5" x2="12" y2="4.5"/></svg>',
  api:        '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="5,8 2,10 5,12"/><polyline points="15,8 18,10 15,12"/><line x1="11" y1="5" x2="9" y2="15"/></svg>',
  design:     '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 14l4-4 3 3 4-5 3 3"/><rect x="2" y="3" width="16" height="14" rx="1.5"/></svg>',
  ecommerce:  '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3h2l1 7h9l1-5H6"/><circle cx="9" cy="17" r="1"/><circle cx="15" cy="17" r="1"/></svg>',
  seo:        '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="9" r="5.5"/><line x1="13.5" y1="13.5" x2="17" y2="17"/><polyline points="7,9 9,11 12,7"/></svg>',
  bot:        '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="6" width="12" height="10" rx="1.5"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="11" r="1"/><path d="M8 14h4"/><line x1="10" y1="6" x2="10" y2="3"/><line x1="7" y1="3" x2="13" y2="3"/></svg>',
  hosting:    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="16" height="5" rx="1"/><rect x="2" y="11" width="16" height="5" rx="1"/><circle cx="15.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/><circle cx="15.5" cy="13.5" r=".8" fill="currentColor" stroke="none"/></svg>',
  consulting: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="7" r="3"/><path d="M4 17c0-3 2.7-5 6-5s6 2 6 5"/></svg>',
};

function _svcIconSvg(svc) {
  const iconVal = svc.icon || '';
  // Raw SVG string pasted from admin
  if (iconVal.startsWith('<')) return iconVal;
  // Named preset from admin's SVC_ICON_PRESETS
  if (SVC_SVG_PRESETS[iconVal]) return SVC_SVG_PRESETS[iconVal];
  // Legacy tabler icon class
  const ti = iconVal || SVC_TYPE_ICONS[svc.type] || 'ti-briefcase';
  if (ti.startsWith('ti-')) return `<i class="ti ${ti}"></i>`;
  // Fallback
  return SVC_SVG_PRESETS.website;
}

function _svcNormalize(raw) {
  const name = _langVal(raw, 'name') || raw.name || '';
  // ID always derived from English name for a stable, language-independent URL slug
  const rawName = raw.name;
  const engName = (rawName && typeof rawName === 'object') ? (rawName.en || rawName.ro || '') : (rawName || '');
  return {
    id:       _svcSlugify(engName) || _svcSlugify(name) || ('svc-' + Math.random().toString(36).slice(2,7)),
    name,
    creator:  raw.creator  || '',
    desc:     _langVal(raw, 'desc') || _langVal(raw, 'tagline') || raw.desc || raw.tagline || '',
    type:     raw.type     || 'serviciu',
    price:    raw.price    || '',
    currency: raw.currency || '€',
    badge:    raw.badge    || '',
    order:    parseInt(raw.order) || 999,
    features: Array.isArray(raw.features) ? raw.features : [],
    extras:   Array.isArray(raw.extras)   ? raw.extras   : [],
    icon:     raw.icon     || '',
    // Keep the full category object { key, ro, en } so we can resolve the label per-lang
    category: raw.category || '',
    // Service state
    status:      raw.status      || 'normal',
    discountPct: raw.discountPct || null,
    limitDate:   raw.limitDate   || null,
  };
}

// Returns effective display status — timelimited becomes 'expired' (treated as unavailable) if past limitDate
function _svcEffectiveStatus(svc) {
  const s = svc.status || 'normal';
  if (s === 'timelimited' && svc.limitDate) {
    const end = new Date(svc.limitDate);
    if (!isNaN(end) && end <= new Date()) return 'expired';
  }
  return s;
}

// ── SHARED SERVICE CARD CORE ──────────────────────────────────────────────
// Builds the full .svc-card HTML used both in the popup and in accordion rows.
// inAccordion=true wraps it in the .svc-item shell.
function _svcCardHtmlCore(svc, idPrefix, inAccordion) {
  const isRo      = window.siteLang === 'ro';
  const checkSvg  = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="2,6 5,9 10,3"/></svg>`;
  const badgeCls  = _svcBadgeClass(svc.badge);
  const badge     = svc.badge ? `<span class="svc-badge ${badgeCls}">${svc.badge}</span>` : '';
  const iconClass = _svcIconClass(svc.badge);
  const currency  = svc.currency || '€';
  const tagline   = svc.desc || svc.tagline || '';
  const creator   = svc.creator ? `<div class="svc-row-creator">${t('de')} ${svc.creator}</div>` : '';
  const basePrice = parseFloat(svc.price) || 0;

  // Effective status — expired timelimited treated as unavailable
  const effStatus = _svcEffectiveStatus(svc);
  const isBlocked = effStatus === 'unavailable' || effStatus === 'expired';
  const isDiscount = effStatus === 'discount';
  const isTimelimited = effStatus === 'timelimited';

  // Discount math
  const pct = isDiscount ? (parseFloat(svc.discountPct) || 0) : 0;
  const discountedBase = pct > 0 ? Math.round(basePrice * (1 - pct / 100)) : basePrice;

  // Features
  const feats = (svc.features || []).map(f => {
    const label = (typeof f === 'object') ? (isRo ? (f.ro || f.en || '') : (f.en || f.ro || '')) : (f || '');
    return label ? `<div class="svc-feat-item">${checkSvg}<span>${label}</span></div>` : '';
  }).join('');

  // Extras (only shown when not blocked)
  const extras = (svc.extras || []);
  let extrasHtml = '';
  let summaryAddonsHtml = `<div class="svc-pkg-empty" id="pkg-empty-${idPrefix}">${isRo ? 'Niciun extra selectat' : 'No add-ons selected yet'}</div>`;
  if (extras.length && !isBlocked) {
    const rows = extras.map((ex, i) => {
      const label  = _langVal(ex, 'label') || (typeof ex.label === 'string' ? ex.label : '') || '';
      const isFree = ex.free || !ex.price;
      const exCurr = ex.currency || currency;
      const rawExPrice = parseFloat(ex.price) || 0;
      const subAddons = Array.isArray(ex.subAddons) ? ex.subAddons : [];

      // Per-extra discount: show struck-through original + discounted price
      let priceTag;
      if (isFree) {
        priceTag = `<span class="svc-extra-free">${t('svc-extras-free')}</span>`;
      } else if (isDiscount && pct > 0) {
        const discountedExPrice = Math.round(rawExPrice * (1 - pct / 100));
        priceTag = `<span class="svc-extra-price-wrap">
          <span class="svc-extra-price-original">+${exCurr}${rawExPrice}</span>
          <span class="svc-extra-price svc-extra-price-discounted">+${exCurr}${discountedExPrice}</span>
        </span>`;
      } else {
        priceTag = `<span class="svc-extra-price">+${exCurr}${rawExPrice}</span>`;
      }

      // Store the effective price for total calculation (discounted if applicable)
      const effectivePrice = (isDiscount && pct > 0 && !isFree)
        ? Math.round(rawExPrice * (1 - pct / 100))
        : rawExPrice;

      // Sub-addons rendered below parent, collapsed and disabled until parent is checked
      let subAddonsHtml = '';
      if (subAddons.length) {
        const subRows = subAddons.map((sub, si) => {
          const subLabel   = _langVal(sub, 'label') || (typeof sub.label === 'string' ? sub.label : '') || '';
          const subIsFree  = sub.free || !sub.price;
          const subCurr    = sub.currency || exCurr;
          const rawSubPrice = parseFloat(sub.price) || 0;
          const effectiveSubPrice = (isDiscount && pct > 0 && !subIsFree)
            ? Math.round(rawSubPrice * (1 - pct / 100))
            : rawSubPrice;

          let subPriceTag;
          if (subIsFree) {
            subPriceTag = `<span class="svc-extra-free">${t('svc-extras-free')}</span>`;
          } else if (isDiscount && pct > 0) {
            const discountedSubPrice = Math.round(rawSubPrice * (1 - pct / 100));
            subPriceTag = `<span class="svc-extra-price-wrap">
              <span class="svc-extra-price-original">+${subCurr}${rawSubPrice}</span>
              <span class="svc-extra-price svc-extra-price-discounted">+${subCurr}${discountedSubPrice}</span>
            </span>`;
          } else {
            subPriceTag = `<span class="svc-extra-price">+${subCurr}${rawSubPrice}</span>`;
          }

          return `
            <label class="svc-extra-row svc-subaddon-row" data-idx="${i}-${si}" data-price="${subIsFree ? 0 : effectiveSubPrice}" data-currency="${subCurr}" data-free="${subIsFree}" data-label="${subLabel.replace(/"/g, '&quot;')}" data-parent-idx="${i}">
              <span class="svc-subaddon-indent"></span>
              <input type="checkbox" class="svc-extra-chk svc-subaddon-chk" onchange="_svcUpdateTotal('${idPrefix}')" disabled />
              <span class="svc-extra-check-icon">${checkSvg}</span>
              <div class="svc-extra-info"><span class="svc-extra-label">${subLabel}</span></div>
              ${subPriceTag}
            </label>`;
        }).join('');
        subAddonsHtml = `<div class="svc-subaddons-group" data-parent-idx="${i}">${subRows}</div>`;
      }

      return `
        <label class="svc-extra-row${subAddons.length ? ' svc-extra-has-subs' : ''}" data-idx="${i}" data-price="${isFree ? 0 : effectivePrice}" data-currency="${exCurr}" data-free="${isFree}" data-label="${label.replace(/"/g, '&quot;')}">
          <input type="checkbox" class="svc-extra-chk" onchange="_svcUpdateTotal('${idPrefix}'); _svcToggleSubAddons(this, '${idPrefix}')" />
          <span class="svc-extra-check-icon">${checkSvg}</span>
          <div class="svc-extra-info"><span class="svc-extra-label">${label}</span>${subAddons.length ? `<span class="svc-extra-sub-count">${subAddons.length}</span>` : ''}</div>
          ${priceTag}
        </label>${subAddonsHtml}`; 
    }).join('');
    extrasHtml = `<div class="svc-extras-wrap" id="extras-${idPrefix}"><div class="svc-extras-title">${t('svc-extras-title')}</div>${rows}</div>`;
  }

  // Meta badges
  const metaBadges = [];
  if (svc.turnaround) metaBadges.push(`<span class="svc-meta-badge svc-meta-blue"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="5"/><polyline points="6,3 6,6 8,7.5"/></svg>${svc.turnaround}</span>`);
  if (svc.guarantee)  metaBadges.push(`<span class="svc-meta-badge svc-meta-green"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 1l1.2 2.4 2.7.4-1.95 1.9.46 2.7L6 7.3 3.57 8.44l.46-2.7L2.1 3.8 4.8 3.4z"/></svg>${svc.guarantee}</span>`);
  if (svc.clients)    metaBadges.push(`<span class="svc-meta-badge svc-meta-amber"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="4.5" cy="4" r="2"/><path d="M1 10c0-2 1.5-3 3.5-3s3.5 1 3.5 3"/><circle cx="8.5" cy="3.5" r="1.5"/><path d="M10.5 9c0-1.5-1-2.5-2.5-2.5"/></svg>${svc.clients}</span>`);

  // ── Status banner (blocked state — replaces right panel)
  let statusBannerHtml = '';
  if (isBlocked) {
    const lockSvg = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" style="width:18px;height:18px;flex-shrink:0"><rect x="3" y="7.5" width="10" height="7" rx="1.5"/><path d="M5.5 7.5V5.5a2.5 2.5 0 015 0v2"/></svg>`;
    const title = effStatus === 'expired'
      ? (isRo ? 'Ofertă expirată' : 'Offer expired')
      : (isRo ? 'Serviciu indisponibil' : 'Service unavailable');
    const sub = effStatus === 'expired'
      ? (isRo ? 'Această ofertă nu mai este disponibilă. Revin în curând cu oferte noi.' : 'This offer is no longer available. Check back soon for new offers.')
      : (isRo ? 'Acest serviciu este momentan indisponibil. Verificați din nou mai târziu.' : 'This service is temporarily unavailable. Please check back later.');
    statusBannerHtml = `
      <div class="svc-state-blocked-banner">
        ${lockSvg}
        <div>
          <div class="svc-state-blocked-title">${title}</div>
          <div class="svc-state-blocked-sub">${sub}</div>
        </div>
      </div>`;
  }

  // (discount banner removed — discount is now shown per-price inline)


  // ── Base price display in right panel — struck-through original + discounted when active
  const basePriceHtml = isDiscount && pct > 0
    ? `<span class="svc-pkg-price-original">${currency}${basePrice}</span>
       <span class="svc-pkg-price-val" id="price-${idPrefix}">${currency}${discountedBase}</span>`
    : `<span class="svc-pkg-price-val" id="price-${idPrefix}">${currency}${svc.price || ''}</span>`;

  // ── "How discount applies" button — only shown when discount is active
  const discountInfoBtn = isDiscount && pct > 0
    ? `<button class="svc-discount-info-btn" type="button" onclick="this.nextElementSibling.classList.toggle('open')">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="5.5"/><line x1="4.5" y1="9.5" x2="9.5" y2="4.5"/><circle cx="5" cy="5" r=".6" fill="currentColor" stroke="none"/><circle cx="9" cy="9" r=".6" fill="currentColor" stroke="none"/></svg>
        ${isRo ? 'Cum se aplică reducerea' : 'How the discount applies'}
        <span class="svc-discount-badge">-${Math.round(pct)}%</span>
      </button>
      <div class="svc-discount-tooltip">
        ${isRo
          ? `Reducere de <strong>${Math.round(pct)}%</strong> aplicată automat la prețul de bază și la fiecare extra. Prețul afișat este deja redus — nu este nevoie de cod promoțional.`
          : `A <strong>${Math.round(pct)}%</strong> discount is automatically applied to the base price and every add-on. The price shown is already reduced — no promo code needed.`
        }
      </div>`
    : '';

  // ── Right panel (hidden when blocked)
  const rightPanelHtml = isBlocked ? '' : `
    <div class="svc-card-right">
      <div class="svc-pkg-box">
        <div class="svc-pkg-title">${isRo ? 'Pachetul tău' : 'Your package'}</div>
        <div class="svc-pkg-line svc-pkg-base">
          <span>${isRo ? 'Preț de bază' : 'Base price'}</span>
          <div class="svc-pkg-base-price-wrap">${basePriceHtml}</div>
        </div>
        <div class="svc-pkg-separator"></div>
        <div class="svc-pkg-addons" id="pkg-addons-${idPrefix}">${summaryAddonsHtml}</div>
        <div class="svc-pkg-separator"></div>
        <div class="svc-pkg-total-row">
          <span>Total</span>
          <span class="svc-pkg-total-val" id="total-${idPrefix}">${currency}${isDiscount && pct > 0 ? discountedBase : (svc.price || '')}</span>
        </div>
        <button class="btn btn-cart svc-pkg-cart-btn" id="cart-btn-${idPrefix}" onclick="_svcAddToCart('${idPrefix}', '${svc.id || _svcSlugify(svc.name || '')}')">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="5.5" cy="12" r=".9"/><circle cx="10.5" cy="12" r=".9"/><path d="M1 2h1.7l2 6.5h5.5l1.5-4.5H3.5"/></svg>
          ${isRo ? 'Adaugă în coș' : 'Add to cart'}
        </button>
        <a class="btn btn-ghost svc-pkg-cta" href="mailto:${_contactEmail}" id="cta-${idPrefix}">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1" y="3" width="12" height="9" rx="1.5"/><polyline points="1,3 7,8.5 13,3"/></svg>
          ${t('solicita')} ↗
        </a>
        <div class="svc-pkg-note">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="5" width="10" height="7" rx="1"/><path d="M5 5V3.5a2 2 0 014 0V5"/></svg>
          ${isRo ? 'Nicio plată acum — ofertă gratuită' : 'No payment now — free quote'}
        </div>
        ${discountInfoBtn}
        <div class="svc-pkg-spots" id="pkg-spots-${idPrefix}" style="display:none">
          <span class="svc-pkg-spots-dot"></span>
          <span id="pkg-spots-text-${idPrefix}"></span>
        </div>
      </div>
    </div>`;

  const cardHtml = `
    <div class="svc-card${isBlocked ? ' svc-card-blocked' : ''}" data-svc-id="${idPrefix}" data-base-price="${basePrice}" data-currency="${currency}" data-discount-pct="${pct}">
      <div class="svc-card-inner">
        <div class="svc-card-left">
          <div class="svc-card-eyebrow"><span class="svc-card-brand">FLORINDEV · WEB SERVICE</span></div>
          <div class="svc-card-title-row">
            <div class="svc-card-icon-wrap ${iconClass}">${_svcIconSvg(svc)}</div>
            <div><h2 class="svc-card-title">${svc.name || ''}</h2>${badge}</div>
          </div>
          ${tagline ? `<p class="svc-card-tagline">${tagline}</p>` : ''}
          ${creator}
          ${metaBadges.length ? `<div class="svc-meta-badges">${metaBadges.join('')}</div>` : ''}
          ${feats ? `<div class="svc-feat-list">${feats}</div>` : ''}
          ${extrasHtml}
          ${statusBannerHtml}
        </div>
        ${rightPanelHtml}
      </div>
    </div>`;

  if (!inAccordion) return cardHtml;

  // Accordion wrapper
  const priceDisplay = svc.price ? `${currency}${svc.price}` : '';
  return `
    <div class="svc-item" data-svc-item="${idPrefix}">
      <div class="svc-item-header" onclick="_svcToggle(this)" role="button" tabindex="0" aria-expanded="false">
        <div class="svc-item-header-left">
          <div class="svc-item-icon-wrap ${iconClass}">${_svcIconSvg(svc)}</div>
          <div class="svc-item-info">
            <span class="svc-item-name">${svc.name || ''}</span>
            ${svc.badge ? `<span class="svc-badge ${badgeCls}">${svc.badge}</span>` : ''}
          </div>
        </div>
        <div class="svc-item-header-right">
          ${priceDisplay ? `<span class="svc-item-price">${priceDisplay}</span>` : ''}
          <svg class="svc-item-chevron" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3,5 7,9 11,5"/></svg>
        </div>
      </div>
      <div class="svc-item-body">
        <div class="svc-item-body-inner">
          ${cardHtml}
        </div>
      </div>
    </div>`;
}

// Renders only the inner .svc-card (no outer accordion header) — used in feed cards
function _svcCardOnlyHtml(svc, idPrefix) {
  return _svcCardHtmlCore(svc, idPrefix, false);
}

function _svcRowHtml(svc, idPrefix) {
  return _svcCardHtmlCore(svc, idPrefix, true);
}

window._svcUpdateTotal = function(idPrefix) {
  const card     = document.querySelector(`.svc-card[data-svc-id="${idPrefix}"]`);
  if (!card) return;
  const base     = parseFloat(card.dataset.basePrice) || 0;
  const currency = card.dataset.currency || '€';
  const discPct  = parseFloat(card.dataset.discountPct) || 0;
  let extra = 0;
  const selectedExtras = [];

  card.querySelectorAll('.svc-extra-row').forEach(exRow => {
    // Skip sub-addon rows — they are handled together with their parent
    if (exRow.classList.contains('svc-subaddon-row')) return;
    const checked = exRow.querySelector('.svc-extra-chk')?.checked;
    if (checked) {
      if (exRow.dataset.free !== 'true') {
        extra += parseFloat(exRow.dataset.price) || 0;
      }
      const label = exRow.querySelector('.svc-extra-label')?.textContent?.trim() || exRow.dataset.label || '';
      const price = exRow.dataset.free === 'true' ? null : (parseFloat(exRow.dataset.price) || 0);
      selectedExtras.push({ label, price, currency: exRow.dataset.currency || currency });

      // Include checked sub-addons under this parent
      const parentIdx = exRow.dataset.idx;
      card.querySelectorAll(`.svc-subaddon-row[data-parent-idx="${parentIdx}"]`).forEach(subRow => {
        const subChecked = subRow.querySelector('.svc-subaddon-chk')?.checked;
        if (subChecked) {
          if (subRow.dataset.free !== 'true') {
            extra += parseFloat(subRow.dataset.price) || 0;
          }
          const subLabel = subRow.querySelector('.svc-extra-label')?.textContent?.trim() || subRow.dataset.label || '';
          const subPrice = subRow.dataset.free === 'true' ? null : (parseFloat(subRow.dataset.price) || 0);
          selectedExtras.push({ label: `↳ ${subLabel}`, price: subPrice, currency: subRow.dataset.currency || currency, isSubAddon: true });
        }
      });
    }
  });

  // Apply discount to base price; extras already store effective (discounted) prices
  const effectiveBase = discPct > 0 ? Math.round(base * (1 - discPct / 100)) : base;
  const rawTotal    = effectiveBase + extra;
  const finalTotal  = rawTotal;
  const totalEl = document.getElementById('total-' + idPrefix);
  const addonsEl = document.getElementById('pkg-addons-' + idPrefix);
  const emptyEl  = document.getElementById('pkg-empty-' + idPrefix);

  // Update total display (with discount applied to full subtotal)
  if (totalEl) _animatePrice(totalEl, finalTotal, currency);

  // Update add-ons summary panel
  if (addonsEl) {
    if (selectedExtras.length === 0) {
      addonsEl.innerHTML = `<div class="svc-pkg-empty" id="pkg-empty-${idPrefix}">${window.siteLang === 'ro' ? 'Niciun extra selectat' : 'No add-ons selected yet'}</div>`;
    } else {
      addonsEl.innerHTML = selectedExtras.map(ex => `
        <div class="svc-pkg-addon-line${ex.isSubAddon ? ' svc-pkg-addon-sub' : ''}">
          <span class="svc-pkg-addon-name">${ex.label}</span>
          <span class="svc-pkg-addon-price">${ex.price === null ? `<span style="color:var(--green);font-size:11px;font-weight:600">${window.siteLang==='ro'?'Gratuit':'Free'}</span>` : `+${ex.currency}${ex.price}`}</span>
        </div>`).join('');
    }
  }

  // Update mailto with selected extras
  const ctaEl = document.getElementById('cta-' + idPrefix);
  if (ctaEl) {
    const svcName = card.querySelector('.svc-card-title')?.textContent?.trim() || '';
    const subject = selectedExtras.length
      ? `${svcName} + ${selectedExtras.map(e => e.label).join(', ')}`
      : svcName;
    ctaEl.href = `mailto:${_contactEmail}?subject=${encodeURIComponent(subject)}`;
  }
};

// Toggle sub-addon rows enabled/visible when parent addon is checked/unchecked
window._svcToggleSubAddons = function(parentChk, idPrefix) {
  const parentRow  = parentChk.closest('.svc-extra-row');
  if (!parentRow) return;
  const parentIdx  = parentRow.dataset.idx;
  const card       = document.querySelector(`.svc-card[data-svc-id="${idPrefix}"]`);
  if (!card) return;
  const isChecked  = parentChk.checked;
  const subGroup   = card.querySelector(`.svc-subaddons-group[data-parent-idx="${parentIdx}"]`);
  if (!subGroup) return;

  if (isChecked) {
    subGroup.classList.add('open');
    subGroup.querySelectorAll('.svc-subaddon-chk').forEach(chk => { chk.disabled = false; });
  } else {
    subGroup.classList.remove('open');
    subGroup.querySelectorAll('.svc-subaddon-chk').forEach(chk => {
      chk.checked  = false;
      chk.disabled = true;
    });
    // Re-run total since sub-addons got unchecked
    _svcUpdateTotal(idPrefix);
  }
};

window._svcToggle = function(headerEl) {
  const item = headerEl.closest('.svc-item');
  if (!item) return;
  const isOpen = item.classList.contains('open');

  // Close all siblings first
  const list = item.closest('.svc-list');
  if (list) {
    list.querySelectorAll('.svc-item.open').forEach(el => {
      if (el !== item) {
        el.classList.remove('open');
        el.querySelector('.svc-item-header')?.setAttribute('aria-expanded', 'false');
        const body = el.querySelector('.svc-item-body');
        if (body) body.style.maxHeight = '0';
      }
    });
  }

  if (isOpen) {
    item.classList.remove('open');
    headerEl.setAttribute('aria-expanded', 'false');
    const body = item.querySelector('.svc-item-body');
    if (body) body.style.maxHeight = '0';
  } else {
    item.classList.add('open');
    headerEl.setAttribute('aria-expanded', 'true');
    const body = item.querySelector('.svc-item-body');
    if (body) {
      body.style.maxHeight = body.scrollHeight + 'px';
    }
    // Initialize total on first open
    const card = item.querySelector('.svc-card[data-svc-id]');
    if (card && card.dataset.svcId) _svcUpdateTotal(card.dataset.svcId);
    // Scroll into view nicely
    setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }
};

function _svcInitAccordion(container) {
  // All cards start collapsed. Open the first one.
  container.querySelectorAll('.svc-item').forEach((item, idx) => {
    const body = item.querySelector('.svc-item-body');
    if (body) body.style.maxHeight = '0';
    if (idx === 0) {
      // Open first item after a tick so the DOM is ready
      setTimeout(() => {
        const header = item.querySelector('.svc-item-header');
        if (header) _svcToggle(header);
      }, 80);
    }
  });
}

// ── SERVICES FEED — shared loaded list ────────────────────────────────────
let _svcLoadedList = null; // cached normalized list after first load

async function loadServices() {
  try {
    const snap = await getDoc(doc(db, 'site', 'services'));
    const rawList = snap.exists() ? (snap.data().list || []) : [];
    if (!rawList.length) {
      const emptyMsg = document.getElementById('svc-empty-msg');
      if (emptyMsg) emptyMsg.style.display = '';
      return;
    }
    const d = snap.data();

    // ── GUARANTEE BANNER ────────────────────────────────────────────────
    const guaranteeEl = document.getElementById('svc-guarantee');
    if (guaranteeEl) {
      const g = d.guarantee || {};
      if (g.active) {
        const gText = _langVal(g, 'text') || (typeof g.text === 'string' ? g.text : '') || '';
        const COLOR_MAP = {
          green:  { bg: 'rgba(34,197,94,.08)',  border: 'rgba(34,197,94,.25)',  color: '#4ade80' },
          blue:   { bg: 'rgba(59,130,246,.08)', border: 'rgba(59,130,246,.25)', color: '#93c5fd' },
          orange: { bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.25)', color: '#fbbf24' },
          purple: { bg: 'rgba(168,85,247,.08)', border: 'rgba(168,85,247,.25)', color: '#c084fc' },
          red:    { bg: 'rgba(239,68,68,.08)',  border: 'rgba(239,68,68,.25)',  color: '#f87171' },
        };
        const clr = COLOR_MAP[g.color] || COLOR_MAP.green;
        const GUARANTEE_SVG = {
          shield:   '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" style="width:15px;height:15px;flex-shrink:0;margin-top:1px"><path d="M8 1.5L2 4v5c0 3 2.5 5.5 6 6 3.5-.5 6-3 6-6V4L8 1.5z"/><polyline points="5.5,8 7.5,10 11,6" stroke-width="1.4"/></svg>',
          star:     '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" style="width:15px;height:15px;flex-shrink:0;margin-top:1px"><polygon points="8,2 10,6 14,6.5 11,9.5 12,14 8,11.5 4,14 5,9.5 2,6.5 6,6"/></svg>',
          check:    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" style="width:15px;height:15px;flex-shrink:0;margin-top:1px"><circle cx="8" cy="8" r="6.5"/><polyline points="5,8 7,10.5 11,5.5"/></svg>',
          heart:    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" style="width:15px;height:15px;flex-shrink:0;margin-top:1px"><path d="M8 13.5C8 13.5 2 9.5 2 5.5a3.5 3.5 0 0 1 6-2.4A3.5 3.5 0 0 1 14 5.5c0 4-6 8-6 8z"/></svg>',
          medal:    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" style="width:15px;height:15px;flex-shrink:0;margin-top:1px"><circle cx="8" cy="10" r="4"/><path d="M5.5 6.5L4 2h8l-1.5 4.5"/></svg>',
          lock:     '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" style="width:15px;height:15px;flex-shrink:0;margin-top:1px"><rect x="3.5" y="7" width="9" height="7.5" rx="1"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>',
        };
        const iconSvg = GUARANTEE_SVG[g.icon] || GUARANTEE_SVG.shield;
        guaranteeEl.style.display = '';
        guaranteeEl.style.background  = clr.bg;
        guaranteeEl.style.borderColor = clr.border;
        guaranteeEl.style.color       = clr.color;
        guaranteeEl.innerHTML = `${iconSvg}<span>${gText}</span>`;
      } else {
        guaranteeEl.style.display = 'none';
      }
    }

    const panelEl = document.getElementById('svc-panel');
    const tabsEl  = document.getElementById('svc-tabs');
    if (!panelEl) return;

    // Hide old tabs — feed replaces them
    if (tabsEl) tabsEl.style.display = 'none';

    const list = rawList.map(_svcNormalize).sort((a, b) => a.order - b.order);
    _svcLoadedList = list;

    // Update home page services teaser
    renderHomeSvcTeaser(list);

    // Check if we're opening a specific service or category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const idParam   = urlParams.get('id')  || '';
    const catParam  = urlParams.get('cat') || '';
    if (idParam) {
      _renderSvcFeed(panelEl, list);
      _doOpenService(idParam);
    } else if (catParam) {
      _renderSvcCatPage(panelEl, list, catParam);
    } else {
      _renderSvcFeed(panelEl, list);
    }

  } catch(e) {
    console.warn('Could not load services:', e);
  }
}

// ── SERVICES FEED RENDERER ─────────────────────────────────────────────────
function _renderSvcFeed(panelEl, list) {
  // Build category map: key → { label, services[] }
  const catMap = new Map();
  const uncategorized = [];

  list.forEach(svc => {
    const catKey = svc.category
      ? (typeof svc.category === 'object' ? (svc.category.key || '') : svc.category)
      : '';
    if (!catKey) { uncategorized.push(svc); return; }
    if (!catMap.has(catKey)) {
      // Prefer the object form for a richer label; fall back to humanizing the key
      const catObj = typeof svc.category === 'object' ? svc.category : null;
      let catLabel;
      if (catObj) {
        catLabel = window.siteLang === 'ro' ? (catObj.ro || catObj.en || catKey) : (catObj.en || catObj.ro || catKey);
      } else {
        // Humanize slug: "web-dev" → "Web Development"
        const knownLabels = {
          'web-dev':   { ro: 'Dezvoltare Web', en: 'Web Development' },
          'mobile':    { ro: 'Aplicații Mobile', en: 'Mobile Apps' },
          'design':    { ro: 'Design', en: 'Design' },
          'seo':       { ro: 'SEO', en: 'SEO' },
          'marketing': { ro: 'Marketing', en: 'Marketing' },
          'support':   { ro: 'Suport', en: 'Support' },
        };
        const known = knownLabels[catKey];
        if (known) {
          catLabel = window.siteLang === 'ro' ? known.ro : known.en;
        } else {
          catLabel = catKey.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
      }
      catMap.set(catKey, { label: catLabel, key: catKey, svcs: [], catObj });
    } else if (!catMap.get(catKey).catObj && typeof svc.category === 'object') {
      // Upgrade label if we now have the object form
      const catObj = svc.category;
      const catLabel = window.siteLang === 'ro' ? (catObj.ro || catObj.en || catKey) : (catObj.en || catObj.ro || catKey);
      catMap.get(catKey).label = catLabel;
      catMap.get(catKey).catObj = catObj;
    }
    catMap.get(catKey).svcs.push(svc);
  });

  // If no categories at all, render as single accordion list
  if (catMap.size === 0) {
    const html = `<div class="svc-feed"><div class="svc-feed-section"><div class="svc-feed-grid">${
      list.map((svc, i) => _svcFeedCardHtml(svc, `svc-${i}`, list.length > 5, i)).join('')
    }</div></div></div>`;
    panelEl.innerHTML = html;
    _svcFeedInitAll(panelEl);
    return;
  }

  // Sort categories by service count desc
  const sortedCats = [...catMap.values()].sort((a, b) => b.svcs.length - a.svcs.length);

  const sectionsHtml = sortedCats.map(cat => {
    const MAX_SHOWN = 5;
    // Sort services within category by feature count desc
    const sorted = [...cat.svcs].sort((a, b) => (b.features?.length || 0) - (a.features?.length || 0));
    const visible = sorted.slice(0, MAX_SHOWN);
    const hasMore = sorted.length > MAX_SHOWN;
    const catSlug = _slugify(cat.key);
    const showAllBtn = hasMore
      ? `<button class="svc-feed-show-all" onclick="_svcNavToCat('${catSlug}')" title="${window.siteLang==='ro'?'Toate din această categorie':'All in this category'}">
           <span>${window.siteLang==='ro'?'Vezi toate':'See all'} (${sorted.length})</span>
           <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="3,6 9,6"/><polyline points="6,3 9,6 6,9"/></svg>
         </button>`
      : '';

    return `
      <div class="svc-feed-section" id="svc-fsec-${catSlug}">
        <div class="svc-feed-header">
          <span class="svc-feed-cat-name">${cat.label}</span>
          <span class="svc-feed-count">${sorted.length}</span>
          ${showAllBtn}
        </div>
        <div class="svc-feed-grid">
          ${visible.map((svc, i) => _svcFeedCardHtml(svc, `${catSlug}-${i}`, false, i)).join('')}
        </div>
      </div>`;
  }).join('');

  // Add uncategorized at end if any
  let uncatHtml = '';
  if (uncategorized.length) {
    const uncatSorted = [...uncategorized].sort((a, b) => (b.features?.length || 0) - (a.features?.length || 0));
    uncatHtml = `
      <div class="svc-feed-section" id="svc-fsec-other">
        <div class="svc-feed-header">
          <span class="svc-feed-cat-name">${window.siteLang==='ro'?'Alte servicii':'Other services'}</span>
          <span class="svc-feed-count">${uncatSorted.length}</span>
        </div>
        <div class="svc-feed-grid">
          ${uncatSorted.map((svc, i) => _svcFeedCardHtml(svc, `other-${i}`, false, i)).join('')}
        </div>
      </div>`;
  }

  panelEl.innerHTML = `<div class="svc-feed">${sectionsHtml}${uncatHtml}</div>`;
  _svcFeedInitAll(panelEl);
}

// ── CATEGORY DRILL-DOWN ────────────────────────────────────────────────────
function _renderSvcCatPage(panelEl, list, catKey) {
  // Find category label
  let catLabel = catKey;
  const catSvcs = list.filter(svc => {
    const k = svc.category
      ? (typeof svc.category === 'object' ? (svc.category.key || '') : svc.category)
      : '';
    if (k === catKey) {
      if (typeof svc.category === 'object') {
        catLabel = window.siteLang === 'ro'
          ? (svc.category.ro || svc.category.en || catKey)
          : (svc.category.en || svc.category.ro || catKey);
      }
      return true;
    }
    return false;
  });

  // Sort by feature count desc
  const sorted = [...catSvcs].sort((a, b) => (b.features?.length || 0) - (a.features?.length || 0));

  panelEl.innerHTML = `
    <div class="svc-cat-page-header">
      <button class="svc-cat-page-back" onclick="_svcNavToFeed()">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="9,2 4,7 9,12"/></svg>
        <span>${window.siteLang==='ro'?'Servicii':'Services'}</span>
      </button>
      <span style="color:var(--text-3);font-size:12px">/</span>
      <span class="svc-cat-page-title">${catLabel}</span>
    </div>
    <div class="svc-cat-page-list">
      ${sorted.map((svc, i) => _svcRowHtml(svc, `catpage-${catKey}-${i}`)).join('')}
    </div>`;

  panelEl.querySelectorAll('.svc-cat-page-list').forEach(el => _svcInitAccordion(el));
}

window._svcNavToCat = function(catSlug) {
  _navTo('servicii', { cat: catSlug });
  const panelEl = document.getElementById('svc-panel');
  if (panelEl && _svcLoadedList) _renderSvcCatPage(panelEl, _svcLoadedList, catSlug);
};

window._svcNavToFeed = function() {
  _navTo('servicii', { cat: null });
  const panelEl = document.getElementById('svc-panel');
  if (panelEl && _svcLoadedList) _renderSvcFeed(panelEl, _svcLoadedList);
};

// ── FEED CARD HTML — clicking opens popup, no expand-in-place ─────────────
function _svcFeedCardHtml(svc, idPrefix) {
  const iconClass = _svcIconClass(svc.badge);
  const currency  = svc.currency || '€';
  const basePrice = parseFloat(svc.price) || 0;
  const desc      = svc.desc || '';
  const badgeCls  = _svcBadgeClass(svc.badge);
  const svcId     = svc.id || _svcSlugify(svc.name);
  const isRo      = window.siteLang === 'ro';
  const status    = _svcEffectiveStatus(svc); // expired timelimited → 'expired' (treated as unavailable)

  // expired behaves like unavailable in the feed card
  const isBlocked = status === 'unavailable' || status === 'expired';

  // ── Icon area: normal = plain icon; unavailable/expired = icon + lock overlay; timelimited = icon + clock overlay
  const lockSvg  = `<svg class="hsc-state-overlay-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7.5" width="10" height="7" rx="1.5"/><path d="M5.5 7.5V5.5a2.5 2.5 0 015 0v2"/></svg>`;
  const clockSvg = `<svg class="hsc-state-overlay-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6.5"/><polyline points="8,4.5 8,8 10.5,9.5"/></svg>`;

  let iconWrap;
  if (isBlocked) {
    iconWrap = `<div class="hsc-icon-wrap hsc-state-unavailable">
      <div class="hsc-icon ${iconClass}">${_svcIconSvg(svc)}</div>
      <div class="hsc-state-badge hsc-state-badge-lock">${lockSvg}</div>
    </div>`;
  } else if (status === 'timelimited') {
    iconWrap = `<div class="hsc-icon-wrap hsc-state-timelimited">
      <div class="hsc-icon ${iconClass}">${_svcIconSvg(svc)}</div>
      <div class="hsc-state-badge hsc-state-badge-clock">${clockSvg}</div>
    </div>`;
  } else {
    iconWrap = `<div class="hsc-icon-wrap">
      <div class="hsc-icon ${iconClass}">${_svcIconSvg(svc)}</div>
    </div>`;
  }

  // ── Price display per state
  let priceHtml = '';
  if (isBlocked) {
    const blockedLabel = status === 'expired'
      ? (isRo ? 'Expirat' : 'Expired')
      : (isRo ? 'Indisponibil' : 'Unavailable');
    priceHtml = `<div class="hsc-price hsc-price-unavailable">
      <span class="hsc-unavail-label">${blockedLabel}</span>
    </div>`;
  } else if (status === 'discount' && svc.price) {
    const pct = parseFloat(svc.discountPct) || 0;
    const discounted = pct > 0 ? Math.round(basePrice * (1 - pct / 100)) : basePrice;
    priceHtml = `<div class="hsc-price hsc-price-discount">
      <span class="hsc-price-original">${currency}${basePrice}</span>
      <span class="hsc-price-new">${currency}${discounted}</span>
    </div>`;
  } else if (status === 'timelimited' && svc.price) {
    const countdownId = `hsc-cd-${idPrefix}`;
    priceHtml = `<div class="hsc-price hsc-price-timelimited">
      <span class="hsc-price-val">${currency}${basePrice}</span>
      <span class="hsc-countdown" id="${countdownId}" data-limit="${svc.limitDate || ''}">${isRo ? 'calcul…' : 'calc…'}</span>
    </div>`;
  } else if (svc.price) {
    priceHtml = `<div class="hsc-price">${currency}${basePrice}</div>`;
  }

  // ── State label span (shown below name when not normal)
  let stateLabel = '';
  if (status === 'discount' && svc.discountPct) {
    stateLabel = `<span class="hsc-state-label hsc-state-label-discount">-${Math.round(svc.discountPct)}% ${isRo ? 'reducere' : 'off'}</span>`;
  } else if (status === 'timelimited' && svc.limitDate) {
    stateLabel = `<span class="hsc-state-label hsc-state-label-timelimit">${isRo ? 'Ofertă limitată' : 'Limited offer'}</span>`;
  }

  // Map expired → unavailable for CSS class (same visual treatment)
  const cssStatus = isBlocked ? 'unavailable' : status;
  const cardClass = cssStatus !== 'normal' ? `home-svc-card svc-feed-item hsc-state-${cssStatus}` : 'home-svc-card svc-feed-item';

  return `
    <div class="${cardClass}" data-feed-id="${idPrefix}" data-status="${status}"
         onclick="openService('${svcId}')"
         role="button" tabindex="0"
         onkeydown="if(event.key==='Enter'||event.key===' ')openService('${svcId}')">
      <div class="hsc-row">
        ${iconWrap}
        <div class="hsc-info">
          <div class="hsc-name">${svc.name || ''}${svc.badge ? ` <span class="svc-badge ${badgeCls}" style="font-size:9px;padding:1px 5px">${svc.badge}</span>` : ''}</div>
          ${stateLabel}
          ${desc ? `<div class="hsc-desc">${desc}</div>` : ''}
        </div>
        ${priceHtml}
      </div>
    </div>`;
}

function _svcFeedInitAll(panelEl) {
  // Init countdown timers for timelimited cards
  panelEl.querySelectorAll('.hsc-countdown[data-limit]').forEach(el => {
    _svcStartCountdown(el);
  });
}

function _svcStartCountdown(el) {
  const isRo = window.siteLang === 'ro';
  function tick() {
    const limitStr = el.dataset.limit;
    if (!limitStr) { el.textContent = ''; return; }
    const end  = new Date(limitStr);
    const now  = new Date();
    const diff = end - now;
    if (isNaN(diff) || diff <= 0) {
      el.textContent = isRo ? 'Expirat' : 'Expired';
      el.style.color = 'var(--red, #f87171)';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (d > 0) {
      el.textContent = isRo ? `${d}z ${h}h ramas` : `${d}d ${h}h left`;
    } else if (h > 0) {
      el.textContent = isRo ? `${h}h ${m}m ramas` : `${h}h ${m}m left`;
    } else {
      el.textContent = isRo ? `${m}m ${s}s ramas` : `${m}m ${s}s left`;
    }
    // Use requestAnimationFrame-based interval
    setTimeout(() => { if (document.contains(el)) tick(); }, 1000);
  }
  tick();
}

// ── SERVICE PAGE (URL-based, mirrors openProject / closeProject) ───────────
let _svcPopupIdCounter = 0;

// Opens service by slug — pushes ?page=servicii&id=SLUG to history
window.openService = function(svcId) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', 'servicii');
  url.searchParams.set('id', svcId);
  url.searchParams.delete('cat');
  window.history.pushState(null, '', url.pathname + url.search);
  // Ensure the services page is active and feed rendered before opening panel
  _activatePage('servicii');
  const panelEl = document.getElementById('svc-panel');
  if (panelEl && _svcLoadedList && !panelEl.querySelector('.svc-feed')) {
    _renderSvcFeed(panelEl, _svcLoadedList);
  }
  _doOpenService(svcId);
};

// Internal: find service in loaded list by id slug and render the panel
function _doOpenService(svcId) {
  if (!_svcLoadedList) return;
  const svc = _svcLoadedList.find(s => s.id === svcId);
  if (!svc) return;
  _renderSvcPanel(svc);
}

function _renderSvcPanel(svc) {
  const idPrefix = `spop-${++_svcPopupIdCounter}`;

  const crumb    = document.getElementById('svc-popup-crumb');
  const badgeW   = document.getElementById('svc-popup-badge-wrap');
  const body     = document.getElementById('svc-popup-body');
  const backdrop = document.getElementById('svc-popup-backdrop');
  const page     = document.getElementById('svc-popup-page');
  if (!body || !backdrop || !page) return;

  if (crumb)  crumb.textContent = svc.name || '';
  if (badgeW) {
    const badgeCls = _svcBadgeClass(svc.badge);
    badgeW.innerHTML = svc.badge
      ? `<span class="svc-badge ${badgeCls}">${svc.badge}</span>`
      : '';
  }

  body.innerHTML = _svcCardOnlyHtml(svc, idPrefix);
  _svcUpdateTotal(idPrefix);

  backdrop.classList.add('open');
  requestAnimationFrame(() => page.classList.add('open'));
  document.body.style.overflow = 'hidden';

  document.title = (svc.name || 'Serviciu') + ' · FlorinDev';
}

window.closeService = function(e) {
  // When called from onclick on backdrop, only close if clicking the backdrop itself
  if (e && e.target !== document.getElementById('svc-popup-backdrop')) return;
  const backdrop = document.getElementById('svc-popup-backdrop');
  const page     = document.getElementById('svc-popup-page');
  if (!backdrop || !page || !page.classList.contains('open')) return;

  const url = new URL(window.location.href);
  url.searchParams.set('page', 'servicii');
  url.searchParams.delete('id');
  window.history.pushState(null, '', url.pathname + url.search);

  page.classList.remove('open');
  setTimeout(() => { backdrop.classList.remove('open'); document.body.style.overflow = ''; }, 300);
  document.title = (window.siteLang === 'ro' ? 'Servicii' : 'Services') + ' · FlorinDev';
};

// Legacy aliases
window.openSvcPopup  = window.openService;
window.closeSvcPopup = window.closeService;

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('svc-popup-page')?.classList.contains('open'))
    window.closeService({ target: document.getElementById('svc-popup-backdrop') });
});

function _slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Service-specific slugify: uses underscores so service IDs read as eng_lowercase_with_underscores
function _svcSlugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

let _contactEmail = 'contact@florin.dev';

// ── ABOUT (from Firestore) ─────────────────────────────────────────────────
async function loadAbout() {
  try {
    const snap = await getDoc(doc(db, 'site', 'about'));
    if (!snap.exists()) return;
    const d = snap.data();

    const wrap = document.getElementById('about-content');
    if (!wrap) return;

    const photo = d.photo
      ? `<div class="about-photo-wrap"><img src="${d.photo}" alt="${_langVal(d,'name') || d.name || ''}" class="about-photo" /></div>`
      : '';

    const statsHtml = (d.stats || []).length
      ? `<div class="about-stats">${(d.stats).map(s =>
          `<div class="about-stat"><div class="about-stat-val">${s.value}</div><div class="about-stat-lbl">${s.label}</div></div>`
        ).join('')}</div>`
      : '';

    const skillsHtml = (d.skills || []).length
      ? `<div class="about-skills">${d.skills.map(s => {
          const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return `<a class="chip chip-link" href="?page=tehnologie&slug=${slug}" role="button">${s}</a>`;
        }).join('')}</div>`
      : '';

    const cvBtn = d.cv
      ? `<a class="btn btn-ghost" href="${d.cv}" target="_blank" rel="noopener" style="margin-top:16px;display:inline-flex;align-items:center;gap:6px">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 2h7l3 3v7H2z"/><path d="M5 7h4M5 9.5h2"/></svg>
          ${t('descarca')} CV
        </a>`
      : '';

    wrap.innerHTML = `
      <div class="about-main">
        ${photo}
        <div class="about-text">
          ${_langVal(d,'name') ? `<h2 class="about-name">${_langVal(d,'name')}</h2>` : ''}
          ${_langVal(d,'role') ? `<div class="about-role">${_langVal(d,'role')}</div>` : ''}
          ${d.location ? `<div class="about-location"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="6" r="2.5"/><path d="M7 1C4.24 1 2 3.24 2 6c0 3.5 5 7 5 7s5-3.5 5-7c0-2.76-2.24-5-5-5z"/></svg>${d.location}</div>` : ''}
          ${statsHtml}
        </div>
      </div>
      ${_langVal(d,'bio')  ? `<div class="about-card"><p>${_langVal(d,'bio')}</p></div>` : ''}
      ${_langVal(d,'bio2') ? `<div class="about-card"><p>${_langVal(d,'bio2')}</p></div>` : ''}
      ${skillsHtml ? `<div class="about-card"><h3 style="margin-bottom:10px;font-size:13px;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em">${t('tehnologii')}</h3>${skillsHtml}</div>` : ''}
      ${cvBtn}`;

    // Update contact email if set in settings
    if (d.contactEmail) _contactEmail = d.contactEmail;

    // Render home page about teaser
    renderHomeAbout(d);
  } catch(e) {
    console.warn('Could not load about:', e);
  }
}

// ── TOAST ──────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── COOKIE BANNER ──────────────────────────────────────────────────────────
function initCookieBanner() {
  if (localStorage.getItem('fd_cookie_choice') !== null) return;
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  // Translate all cookie banner strings at show-time (after siteLang is set)
  const textSpan = banner.querySelector('.cookie-text span');
  if (textSpan) textSpan.innerHTML = t('cookie-text') + ' <a href="?page=confidentialitate">' + t('cookie-link') + '</a>';
  const declineBtn = banner.querySelector('.cookie-decline');
  if (declineBtn) declineBtn.textContent = t('cookie-decline');
  const acceptBtn = banner.querySelector('.cookie-accept');
  if (acceptBtn) acceptBtn.textContent = t('cookie-accept');
  banner.classList.add('visible');
}
function setCookieChoice(accepted) {
  localStorage.setItem('fd_cookie_choice', accepted ? '1' : '0');
  const banner = document.getElementById('cookie-banner');
  if (banner) { banner.classList.remove('visible'); banner.classList.add('hiding'); setTimeout(() => banner.remove(), 400); }
  if (accepted) initAnalytics();
}

// ── EXPOSE GLOBALS ─────────────────────────────────────────────────────────
window.closeProject       = closeProject;
window.handleProjBackdrop = handleProjBackdrop;
window.setCookieChoice    = setCookieChoice;
window.openProject        = openProject;
window._navTo             = _navTo;
window.resolveRoute       = resolveRoute;

// ── HOME: FEATURED PROJECTS ────────────────────────────────────────────────
// Called once INDEX + first-page mods are in MOD_CACHE.
// Replaces placeholder cards with the top-3 most-recent public projects.
const ICON_COLORS = ['hpc-icon-purple', 'hpc-icon-green', 'hpc-icon-amber', 'hpc-icon-blue'];
function _hpcIcon(mod, colorCls) {
  if (mod.image) {
    return `<div class="hpc-icon ${colorCls}" style="padding:0;overflow:hidden">
      <img src="${mod.image}" alt="${mod.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">
    </div>`;
  }
  const letter = mod.name.charAt(0).toUpperCase();
  return `<div class="hpc-icon ${colorCls}" style="font-size:18px;font-weight:700;color:rgba(255,255,255,.75)">${letter}</div>`;
}

function renderHomeFeatured() {
  const grid = document.getElementById('home-proj-grid');
  if (!grid) return;
  const top3 = INDEX.slice(0, 3);
  if (!top3.length) return;

  const cards = top3.map((entry, i) => {
    const mod = MOD_CACHE[entry.id];
    if (!mod) {
      return `<div class="home-proj-card hpc-placeholder">
        <div class="hpc-thumb"></div>
        <div class="hpc-name hpc-skel" style="width:65%"></div>
      </div>`;
    }
    const ver = mod.versions[0]?.tag || '';
    const thumbHtml = mod.image
      ? `<img src="${mod.image}" alt="${mod.name}" class="hpc-thumb-img">`
      : `<div class="hpc-thumb-fallback">${mod.name.charAt(0).toUpperCase()}</div>`;
    return `<div class="home-proj-card" role="button" tabindex="0"
        onclick="openProject('${mod.id}')"
        onkeydown="if(event.key==='Enter')openProject('${mod.id}')">
      <div class="hpc-thumb">${thumbHtml}</div>
      <div class="hpc-info">
        <div class="hpc-name">${mod.name}</div>
        <div class="hpc-dev">${mod.dev}</div>
      </div>
      ${ver ? `<div class="hpc-tag">${ver}</div>` : ''}
    </div>`;
  });

  grid.innerHTML = cards.join('');
}

// ── HOME: SERVICES TEASER ─────────────────────────────────────────────────
// Renders up to 3 service cards in the home page teaser strip.
// Called after loadServices() resolves with data.
function renderHomeSvcTeaser(list) {
  const section = document.getElementById('home-svc-section');
  const grid = document.getElementById('home-svc-grid');
  if (!grid || !section) return;

  // Filter out unavailable/expired services — they should not appear on home
  const visible = list.filter(svc => {
    const eff = _svcEffectiveStatus(svc);
    return eff !== 'unavailable' && eff !== 'expired';
  });

  const top3 = visible.slice(0, 3);
  if (!top3.length) {
    section.style.display = 'none';
    return;
  }

  // Reuse _svcFeedCardHtml so state rendering (discount, timelimited) is consistent
  grid.innerHTML = top3.map((svc, i) => _svcFeedCardHtml(svc, `home-teaser-${i}`)).join('');

  // Init countdown timers for any timelimited cards in the teaser
  grid.querySelectorAll('.hsc-countdown[data-limit]').forEach(el => _svcStartCountdown(el));

  section.style.display = '';
}

// ── HOME: ABOUT TEASER ────────────────────────────────────────────────────
// Renders a compact "about me" strip from the already-fetched site/about data.
// Called by loadAbout() after the about card is built for the About page.
function renderHomeAbout(d) {
  const section = document.getElementById('home-about-section');
  const strip   = document.getElementById('home-about-strip');
  if (!section || !strip) return;

  const name   = _langVal(d, 'name') || d.name || '';
  const role   = _langVal(d, 'role') || '';
  const bio    = _langVal(d, 'bio')  || _langVal(d, 'bio2') || '';
  const skills = Array.isArray(d.skills) ? d.skills : [];
  const photo  = d.photo || '';

  // Need at least name or bio to show anything
  if (!name && !bio) return;

  // Truncate bio to ~160 chars for the teaser
  const bioTeaser = bio.length > 160 ? bio.slice(0, 157).trimEnd() + '…' : bio;

  const photoHtml = photo
    ? `<img src="${photo}" alt="${name}" class="hab-photo">`
    : (name ? `<div class="hab-avatar">${name.charAt(0).toUpperCase()}</div>` : '');

  const skillsHtml = skills.length
    ? `<div class="hab-skills">${skills.slice(0, 6).map(s =>
        `<span class="chip chip-sm">${s}</span>`
      ).join('')}</div>`
    : '';

  strip.innerHTML = `
    <div class="home-about-card">
      <div class="hab-left">
        ${photoHtml}
        <div class="hab-meta">
          ${name ? `<div class="hab-name">${name}</div>` : ''}
          ${role ? `<div class="hab-role">${role}</div>` : ''}
        </div>
      </div>
      <div class="hab-right">
        ${bioTeaser ? `<p class="hab-bio">${bioTeaser}</p>` : ''}
        ${skillsHtml}
      </div>
    </div>`;

  // Update label text bilingually
  const labelEl    = document.getElementById('home-about-label');
  const linkTextEl = document.getElementById('home-about-link-text');
  if (labelEl)    labelEl.textContent    = window.siteLang === 'ro' ? 'Despre' : 'About';
  if (linkTextEl) linkTextEl.textContent = window.siteLang === 'ro' ? 'Mai multe' : 'Learn more';

  section.style.display = '';
}


// Reads homeStatN_val / homeStatN_lbl from site/config (up to 3 slots).
// Falls back to computed: project count / open source / locale.
function renderHomeStats(cfg) {
  const row = document.querySelector('.home-stats');
  if (!row) return;

  // Try admin-configured stats first (homeStatNVal / homeStatNLbl)
  const slots = [];
  for (let i = 1; i <= 3; i++) {
    const val = _langVal(cfg, `homeStat${i}Val`) || cfg[`homeStat${i}Val`];
    const lbl = _langVal(cfg, `homeStat${i}Lbl`) || cfg[`homeStat${i}Lbl`];
    if (val && lbl) slots.push({ val, lbl });
  }

  // Computed fallbacks
  if (!slots.length) {
    const projCount = INDEX.length;
    const lang = window.siteLang;
    slots.push(
      { val: projCount > 0 ? projCount + '+' : '…', lbl: lang === 'ro' ? 'Proiecte' : 'Projects' },
      { val: '100%', lbl: 'Open Source' },
      { val: 'RO', lbl: lang === 'ro' ? 'În română' : 'In Romanian' },
    );
  }

  row.innerHTML = slots.map((s, i) => [
    `<div class="home-stat">
      <span class="home-stat-val">${s.val}</span>
      <span class="home-stat-lbl">${s.lbl}</span>
    </div>`,
    i < slots.length - 1 ? '<div class="home-stat-div"></div>' : '',
  ].join('')).join('');
}

// ── HOME: TERMINAL ANIMATION ───────────────────────────────────────────────
// Replaces the static terminal with real project names once INDEX is ready.
let _termPlayed = false;
function playTerminalAnim() {
  if (_termPlayed) return;
  _termPlayed = true;

  // Build ls output lines from real projects (up to 3)
  const top3 = INDEX.slice(0, 3);
  const fileLines = top3.map(entry => {
    const mod = MOD_CACHE[entry.id];
    const name = mod ? mod.name : entry.id;
    const ver  = mod?.versions?.[0]?.tag || '';
    const ext  = name.toLowerCase().includes('android') || name.toLowerCase().includes('notif') ? '.apk' : '.zip';
    const fname = name.toLowerCase().replace(/\s+/g, '-') + (ver ? '-' + ver : '') + ext;
    return `<div class="ht-file"><svg viewBox="0 0 12 12" fill="currentColor"><path d="M2 0h5.5L10 2.5V10a1 1 0 01-1 1H2a1 1 0 01-1-1V1a1 1 0 011-1z" opacity=".3"/><path d="M6 0l4 4H6V0z" opacity=".6"/></svg> ${fname}</div>`;
  });

  // Build git status lines from real projects
  const statusLines = top3.map(entry => {
    const mod = MOD_CACHE[entry.id];
    const name = mod ? mod.name : entry.id;
    const ver  = mod?.versions?.[0]?.tag || 'v1.0.0';
    const statusCls = mod?.status === 'done' ? 'ht-badge-green' : (mod?.status === 'wip' ? 'ht-badge-blue' : 'ht-badge-purple');
    return `<div class="ht-badge ${statusCls}">✓ ${name} — ${ver}</div>`;
  });

  const cmd1El  = document.getElementById('ht-cmd-1');
  const out1El  = document.getElementById('ht-out-1');
  const line2El = document.getElementById('ht-line-2');
  const cmd2El  = document.getElementById('ht-cmd-2');
  const out2El  = document.getElementById('ht-out-2');
  const line3El = document.getElementById('ht-line-3');
  if (!cmd1El) return;

  // Inject real file/status content
  if (out1El && fileLines.length) out1El.innerHTML = fileLines.join('');
  if (out2El && statusLines.length) out2El.innerHTML = statusLines.join('');

  function typeText(el, text, cb) {
    let i = 0;
    el.textContent = '';
    const iv = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) { clearInterval(iv); if (cb) setTimeout(cb, 300); }
    }, 55);
  }

  typeText(cmd1El, 'ls ~/proiecte', () => {
    out1El.style.display = '';
    setTimeout(() => {
      line2El.style.display = '';
      typeText(cmd2El, 'git status --short', () => {
        out2El.style.display = '';
        setTimeout(() => { line3El.style.display = ''; }, 200);
      });
    }, 400);
  });
}

// ── HOME: EYEBROW VERSION ──────────────────────────────────────────────────
function updateEyebrow(cfg) {
  const el = document.getElementById('home-eyebrow-text');
  if (!el) return;
  const ver = cfg?.siteVersion || cfg?.version || '';
  el.textContent = ver ? `florindev.ro / ${ver}` : 'florindev.ro';
}

// ── HOME: OFFER BANNER ────────────────────────────────────────────────────
// Reads from Firestore `site/offer`.
// Expected fields (all bilingual via _langVal):
//   title    — headline text
//   desc     — body text
//   btnText  — CTA button label
//   btnUrl   — CTA href (external or hash)
//   active   — boolean; if false/absent banner stays hidden
// Optional accent fields:
//   accentColor — CSS color for the glow/border tint (default: var(--accent))
async function loadHomeOffer() {
  try {
    const snap = await getDoc(doc(db, 'site', 'offer'));
    if (!snap.exists()) return;
    const d = snap.data();

    if (!d.active) return;

    const title   = _langVal(d, 'title')   || '';
    const desc    = _langVal(d, 'desc')    || '';
    const btnText = _langVal(d, 'btnText') || (window.siteLang === 'ro' ? 'Află mai multe' : 'Learn more');
    const btnUrl  = d.btnUrl || '?page=servicii';
    const accent  = d.accentColor || '';

    if (!title && !desc) return;

    const section = document.getElementById('home-offer-section');
    const banner  = document.getElementById('home-offer-banner');
    if (!section || !banner) return;

    const isExternal = btnUrl.startsWith('http');
    const accentStyle = accent ? `--offer-accent:${accent};` : '';

    banner.innerHTML = `
      <div class="hob-glow" style="${accentStyle}"></div>
      <div class="hob-body">
        <div class="hob-text">
          ${title ? `<div class="hob-title">${title}</div>` : ''}
          ${desc  ? `<div class="hob-desc">${desc}</div>`   : ''}
        </div>
        <a class="hob-btn" href="${btnUrl}"${isExternal ? ' target="_blank" rel="noopener"' : ''}>
          ${btnText}
        </a>
      </div>`;

    section.style.display = '';
  } catch(e) {
    console.warn('Could not load offer:', e);
  }
}


document.getElementById('copy-year').textContent = new Date().getFullYear();
translateDOM();
resolveRoute();
initCookieBanner();
loadIndex();
loadSiteSettings().then(() => loadServices());
loadAbout();
loadHomeOffer();
if (localStorage.getItem('fd_cookie_choice') === '1') initAnalytics();

// ── SITEMAP GENERATOR ──────────────────────────────────────────────────────
// Generates an XML sitemap by combining:
//   1. Static pages  (?page=proiecte, ?page=servicii, etc.)
//   2. Live project IDs from Firestore index (?page=proiecte&id=xxx)
// Usage:  await generateSitemap()  — returns XML string
//         await generateSitemap({ download: true })  — triggers file download
//
// Deploy note: for true SEO crawlability, serve this XML from your hosting
// at /sitemap.xml (e.g. via a Cloud Function or build step that calls this
// logic server-side).  For a pure static host, you can run it once and
// commit the output file.

async function generateSitemap({ download = false } = {}) {
  const base = window.location.origin + window.location.pathname.replace(/\/+$/, '');
  const today = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { slug: '',                 changefreq: 'weekly',  priority: '1.0' },
    { slug: 'proiecte',         changefreq: 'weekly',  priority: '0.9' },
    { slug: 'servicii',         changefreq: 'monthly', priority: '0.8' },
    { slug: 'despre',           changefreq: 'monthly', priority: '0.7' },
    { slug: 'confidentialitate',changefreq: 'yearly',  priority: '0.3' },
    { slug: 'termeni',          changefreq: 'yearly',  priority: '0.3' },
  ];

  // Build static URLs
  const urls = staticPages.map(({ slug, changefreq, priority }) => {
    const loc = slug ? `${base}?page=${slug}` : base;
    return { loc, changefreq, priority, lastmod: today };
  });

  // Load project index from Firestore
  try {
    const indexDoc = await getDoc(doc(db, 'projects', 'projects'));
    if (indexDoc.exists()) {
      const data = indexDoc.data();
      const publicProjects = Object.entries(data)
        .filter(([id, entry]) => id !== '_metadata' && typeof entry === 'object' && entry.public === true);
      publicProjects.forEach(([id]) => {
        urls.push({
          loc:        `${base}?page=proiecte&id=${encodeURIComponent(id)}`,
          changefreq: 'monthly',
          priority:   '0.8',
          lastmod:    today,
        });
      });
    }
  } catch(e) {
    console.warn('[sitemap] Could not load project index:', e);
  }

  // Build XML
  const urlsXml = urls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

  if (download) {
    const blob = new Blob([xml], { type: 'application/xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sitemap.xml';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }

  return xml;
}

// Expose for console use: generateSitemap({ download: true })
window.generateSitemap = generateSitemap;

// ── CART SYSTEM ────────────────────────────────────────────────────────────
// Cart item shape:
// {
//   cartId: string,         // unique cart entry id
//   svcId: string,          // service slug
//   svcName: string,
//   basePrice: number,
//   currency: string,
//   discountPct: number,    // from service (not coupon)
//   extras: [{label, price, currency, isSubAddon}],
//   effectiveBasePrice: number,
//   effectiveExtrasTotal: number,
//   lineTotal: number,
//   quantity: number,
// }

let _cart = [];
let _coupon = null; // { code, pct } or null

// ── Snapshot extras from a card ──────────────────────────────────────────
function _svcSnapshotExtras(idPrefix) {
  const card = document.querySelector(`.svc-card[data-svc-id="${idPrefix}"]`);
  if (!card) return [];
  const extras = [];
  card.querySelectorAll('.svc-extra-row').forEach(exRow => {
    if (exRow.classList.contains('svc-subaddon-row')) return;
    const checked = exRow.querySelector('.svc-extra-chk')?.checked;
    if (!checked) return;
    const isFree = exRow.dataset.free === 'true';
    const label = exRow.querySelector('.svc-extra-label')?.textContent?.trim() || exRow.dataset.label || '';
    const price = isFree ? 0 : (parseFloat(exRow.dataset.price) || 0);
    const currency = exRow.dataset.currency || '€';
    extras.push({ label, price, currency, isSubAddon: false, isFree });
    // sub-addons
    const parentIdx = exRow.dataset.idx;
    card.querySelectorAll(`.svc-subaddon-row[data-parent-idx="${parentIdx}"]`).forEach(subRow => {
      const subChecked = subRow.querySelector('.svc-subaddon-chk')?.checked;
      if (!subChecked) return;
      const subIsFree = subRow.dataset.free === 'true';
      const subLabel = subRow.querySelector('.svc-extra-label')?.textContent?.trim() || subRow.dataset.label || '';
      const subPrice = subIsFree ? 0 : (parseFloat(subRow.dataset.price) || 0);
      const subCurrency = subRow.dataset.currency || currency;
      extras.push({ label: `↳ ${subLabel}`, price: subPrice, currency: subCurrency, isSubAddon: true, isFree: subIsFree });
    });
  });
  return extras;
}

// ── Extras fingerprint for dedup check ───────────────────────────────────
function _extrasKey(extras) {
  return extras.map(e => `${e.label}|${e.price}|${e.isFree}`).sort().join(';;');
}

// ── Compute line total ────────────────────────────────────────────────────
function _computeLineTotal(basePrice, discountPct, extras) {
  const effBase = discountPct > 0 ? Math.round(basePrice * (1 - discountPct / 100)) : basePrice;
  const effExtras = extras.reduce((s, e) => s + (e.isFree ? 0 : e.price), 0);
  return effBase + effExtras;
}

// ── Add to cart from service card ────────────────────────────────────────
window._svcAddToCart = function(idPrefix, svcId) {
  const card = document.querySelector(`.svc-card[data-svc-id="${idPrefix}"]`);
  if (!card) return;

  const svcName = card.querySelector('.svc-card-title')?.textContent?.trim() || svcId;
  const basePrice = parseFloat(card.dataset.basePrice) || 0;
  const currency = card.dataset.currency || '€';
  const discountPct = parseFloat(card.dataset.discountPct) || 0;
  const extras = _svcSnapshotExtras(idPrefix);
  const fingerprint = _extrasKey(extras);
  const effBase = discountPct > 0 ? Math.round(basePrice * (1 - discountPct / 100)) : basePrice;
  const lineTotal = _computeLineTotal(basePrice, discountPct, extras);

  // Check for exact duplicate (same service + exact same extras)
  const existing = _cart.find(item =>
    item.svcId === svcId && _extrasKey(item.extras) === fingerprint
  );

  if (existing) {
    existing.quantity += 1;
    showToast(window.siteLang === 'ro' ? 'Cantitate mărită în coș ✓' : 'Quantity increased in cart ✓');
  } else {
    const cartId = `cart-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    const iconWrap = card.querySelector('.svc-card-icon-wrap');
    const svcIcon  = iconWrap ? iconWrap.innerHTML : '';
    const iconClass = iconWrap ? (iconWrap.className.replace('svc-card-icon-wrap','').trim()) : '';
    _cart.push({
      cartId, svcId, svcName, basePrice, currency, discountPct,
      extras, effectiveBasePrice: effBase,
      effectiveExtrasTotal: extras.reduce((s, e) => s + (e.isFree ? 0 : e.price), 0),
      lineTotal, quantity: 1, svcIcon, iconClass,
    });
    showToast(window.siteLang === 'ro' ? 'Adăugat în coș ✓' : 'Added to cart ✓');
  }

  _cartSave();
  _cartUpdateBadge();

  // Switch button to "Go to cart" state
  _svcUpdateCartBtn(idPrefix);
};

// ── Update cart button state per service ──────────────────────────────────
function _svcUpdateCartBtn(idPrefix) {
  const btn = document.getElementById('cart-btn-' + idPrefix);
  if (!btn) return;
  const isRo = window.siteLang === 'ro';
  // Check if this service is in the cart
  const inCart = _cart.some(item => item.svcId === (idPrefix.replace(/^svc-/,'').replace(/-\d+$/,'')) || btn.dataset.svcId === item.svcId || idPrefix.includes(item.svcId) || item.cartId.includes(idPrefix) || true && (() => {
    const card = document.querySelector(`.svc-card[data-svc-id="${idPrefix}"]`);
    const svcName = card?.querySelector('.svc-card-title')?.textContent?.trim() || '';
    return _cart.some(i => i.svcName === svcName);
  })());
  // Simpler: just check by svcName match
  const card = document.querySelector(`.svc-card[data-svc-id="${idPrefix}"]`);
  const svcName = card?.querySelector('.svc-card-title')?.textContent?.trim() || '';
  const alreadyIn = _cart.some(i => i.svcName === svcName);
  if (alreadyIn) {
    btn.classList.add('cart-btn-added');
    btn.innerHTML = `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="2,7 5.5,10.5 12,3"/></svg> ${isRo ? 'Vezi coșul' : 'Go to cart'} →`;
    btn.onclick = openCart;
  } else {
    btn.classList.remove('cart-btn-added');
    btn.innerHTML = `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="5.5" cy="12" r=".9"/><circle cx="10.5" cy="12" r=".9"/><path d="M1 2h1.7l2 6.5h5.5l1.5-4.5H3.5"/></svg> ${isRo ? 'Adaugă în coș' : 'Add to cart'}`;
    btn.onclick = () => _svcAddToCart(idPrefix, btn.dataset.svcId || idPrefix);
  }
}

// Call on page load to restore button states (e.g. after cart reload)
function _svcRestoreAllCartBtns() {
  document.querySelectorAll('.svc-pkg-cart-btn').forEach(btn => {
    const card = btn.closest('.svc-card');
    if (card) _svcUpdateCartBtn(card.dataset.svcId);
  });
}

// ── Persist / restore ─────────────────────────────────────────────────────
function _cartSave() {
  try { localStorage.setItem('fd_cart_v1', JSON.stringify({ cart: _cart, coupon: _coupon })); } catch(e) {}
}
function _cartLoad() {
  try {
    const raw = localStorage.getItem('fd_cart_v1');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    _cart   = Array.isArray(parsed.cart) ? parsed.cart : [];
    _coupon = parsed.coupon || null;
  } catch(e) {}
}
_cartLoad();

// ── Badge update ──────────────────────────────────────────────────────────
function _cartUpdateBadge() {
  const btn   = document.getElementById('tb-cart-btn');
  const label = document.getElementById('tb-cart-label');
  const total = _cart.reduce((s, item) => s + item.quantity, 0);

  if (!btn || !label) return;

  if (total > 0) {
    const count = total > 99 ? '99+' : total;
    label.textContent = window.siteLang === 'ro'
      ? `Coș · ${count}`
      : `Cart · ${count}`;

    btn.style.display = '';
  } else {
    label.textContent = window.siteLang === 'ro'
      ? 'Coș'
      : 'Cart';

    btn.style.display = 'none';
  }
}
_cartUpdateBadge();

// ── Discount codes ────────────────────────────────────────────────────────
const COUPON_CODES = {
  'FLORIN10':  10,
  'WELCOME15': 15,
  'DEV20':     20,
  'TITAN5':    5,
};

function _applyCoupon(code) {
  const pct = COUPON_CODES[(code || '').toUpperCase().trim()];
  if (!pct) return false;
  _coupon = { code: code.toUpperCase().trim(), pct };
  _cartSave();
  return true;
}

function _removeCoupon() {
  _coupon = null;
  _cartSave();
}

// ── Cart total calculation ────────────────────────────────────────────────
function _cartGrandTotal() {
  let sub = _cart.reduce((s, item) => s + item.lineTotal * item.quantity, 0);
  if (_coupon && _coupon.pct > 0) {
    sub = Math.round(sub * (1 - _coupon.pct / 100));
  }
  return sub;
}

function _cartSubtotal() {
  return _cart.reduce((s, item) => s + item.lineTotal * item.quantity, 0);
}

// ── Open / close cart ─────────────────────────────────────────────────────
window.openCart = function() {
  const backdrop = document.getElementById('cart-backdrop');
  const page     = document.getElementById('cart-page');
  if (!backdrop || !page) return;

  _renderCartPage();
  backdrop.classList.add('open');
  requestAnimationFrame(() => page.classList.add('open'));
  document.body.style.overflow = 'hidden';
  document.title = 'Cart · FlorinDev';
};

window.closeCart = function(e) {
  if (e && e.target !== document.getElementById('cart-backdrop')) return;
  const backdrop = document.getElementById('cart-backdrop');
  const page     = document.getElementById('cart-page');
  if (!backdrop || !page || !page.classList.contains('open')) return;
  page.classList.remove('open');
  setTimeout(() => { backdrop.classList.remove('open'); document.body.style.overflow = ''; }, 300);
  document.title = 'FlorinDev';
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('cart-page')?.classList.contains('open'))
    window.closeCart({ target: document.getElementById('cart-backdrop') });
});

// ── Cart page renderer ────────────────────────────────────────────────────
function _renderCartPage() {
  const body  = document.getElementById('cart-body');
  const crumb = document.getElementById('cart-title-crumb');
  const countBadge = document.getElementById('cart-item-count-badge');
  const backLabel  = document.getElementById('cart-back-label');
  const isRo = window.siteLang === 'ro';

  if (backLabel) backLabel.textContent = isRo ? 'Servicii' : 'Services';
  if (crumb)     crumb.textContent     = isRo ? 'Coș' : 'Cart';
  if (!body) return;

  const totalItems = _cart.reduce((s, i) => s + i.quantity, 0);
  if (countBadge) {
    countBadge.textContent = totalItems > 0
      ? (isRo ? `${totalItems} ${totalItems === 1 ? 'articol' : 'articole'}` : `${totalItems} item${totalItems !== 1 ? 's' : ''}`)
      : '';
  }

  if (_cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="18" cy="40" r="3"/><circle cx="36" cy="40" r="3"/><path d="M4 6h4l6 22h20l4-14H10"/></svg>
        </div>
        <div class="cart-empty-title">${isRo ? 'Coșul tău este gol' : 'Your cart is empty'}</div>
        <div class="cart-empty-sub">${isRo ? 'Adaugă servicii din pagina de servicii pentru a continua.' : 'Add services from the services page to continue.'}</div>
        <button class="btn btn-accent cart-empty-cta" onclick="closeCart();_navTo('servicii');resolveRoute()">
          ${isRo ? 'Explorează serviciile' : 'Explore services'}
        </button>
      </div>`;
    return;
  }

  // ── Items list
  const itemsHtml = _cart.map(item => {
    const effBase   = item.effectiveBasePrice;
    const extrasSum = item.effectiveExtrasTotal;
    const lineTotal = item.lineTotal;
    const hasDiscount = item.discountPct > 0;

    const extrasHtml = item.extras.length
      ? item.extras.map(ex => `
          <div class="cart-item-extra${ex.isSubAddon ? ' cart-item-extra-sub' : ''}">
            <span class="cart-item-extra-label">${ex.label}</span>
            <span class="cart-item-extra-price">${ex.isFree
              ? `<span style="color:var(--green);font-size:11px;font-weight:600">${isRo ? 'Gratuit' : 'Free'}</span>`
              : `+${ex.currency}${ex.price}`
            }</span>
          </div>`).join('')
      : `<div class="cart-item-no-extras">${isRo ? 'Fără extra-uri' : 'No add-ons'}</div>`;

    const basePriceHtml = hasDiscount
      ? `<span class="cart-item-base-orig">${item.currency}${item.basePrice}</span>
         <span class="cart-item-base-eff">${item.currency}${effBase}</span>`
      : `<span>${item.currency}${item.basePrice}</span>`;

    return `
      <div class="cart-item" data-cart-id="${item.cartId}">
        <div class="cart-item-header">
          <div class="cart-item-name-row">
            <div class="cart-item-icon ${item.iconClass || ''}">
  ${item.svcIcon || `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.5" y="1.5" width="11" height="11" rx="2"/><path d="M4.5 7h5M7 4.5v5"/></svg>`}
</div>
            <div>
              <div class="cart-item-name">${item.svcName}</div>
              ${hasDiscount ? `<div class="cart-item-discount-tag">-${Math.round(item.discountPct)}% ${isRo ? 'reducere aplicată' : 'discount applied'}</div>` : ''}
            </div>
          </div>
          <button class="cart-item-remove" onclick="_cartRemoveItem('${item.cartId}')" title="${isRo ? 'Șterge' : 'Remove'}">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5h6.6L11 4"/></svg>
          </button>
        </div>

        <div class="cart-item-details">
          <div class="cart-item-base-row">
            <span class="cart-item-label">${isRo ? 'Preț de bază' : 'Base price'}</span>
            <span class="cart-item-base-price">${basePriceHtml}</span>
          </div>
          <div class="cart-item-extras-section">
            <div class="cart-item-extras-label">${isRo ? 'Extra-uri' : 'Add-ons'}</div>
            <div class="cart-item-extras-list">${extrasHtml}</div>
          </div>
        </div>

        <div class="cart-item-footer">
          <div class="cart-item-qty">
            <button class="cart-qty-btn" onclick="_cartDecQty('${item.cartId}')">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="2" y1="6" x2="10" y2="6"/></svg>
            </button>
            <span class="cart-qty-val" id="qty-${item.cartId}">${item.quantity}</span>
            <button class="cart-qty-btn" onclick="_cartIncQty('${item.cartId}')">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="6" y1="2" x2="6" y2="10"/><line x1="2" y1="6" x2="10" y2="6"/></svg>
            </button>
          </div>
          <div class="cart-item-line-total">
            <span class="cart-item-line-label">${isRo ? 'Subtotal' : 'Subtotal'}</span>
            <span class="cart-item-line-val" id="line-${item.cartId}">${item.currency}${lineTotal * item.quantity}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  // ── Summary panel
  const subtotal  = _cartSubtotal();
  const hasCoupon = _coupon && _coupon.pct > 0;
  const couponDiscount = hasCoupon ? Math.round(subtotal * _coupon.pct / 100) : 0;
  const grandTotal = _cartGrandTotal();
  const currency   = _cart[0]?.currency || '€';

  const couponRowHtml = hasCoupon
    ? `<div class="cart-summary-row cart-summary-coupon-applied">
        <span>${isRo ? 'Cod' : 'Code'} <strong>${_coupon.code}</strong> (-${_coupon.pct}%)</span>
        <span class="cart-summary-discount">-${currency}${couponDiscount}</span>
       </div>
       <button class="cart-coupon-remove-btn" onclick="_cartUiRemoveCoupon()">
         ${isRo ? 'Elimină codul' : 'Remove code'}
       </button>`
    : '';

  const couponInputHtml = hasCoupon ? '' : `
    <div class="cart-coupon-wrap" id="cart-coupon-wrap">
      <div class="cart-coupon-row">
        <input class="cart-coupon-input" id="cart-coupon-input" type="text" placeholder="${isRo ? 'Cod reducere' : 'Discount code'}" />
        <button class="btn btn-ghost cart-coupon-apply-btn" onclick="_cartUiApplyCoupon()">
          ${isRo ? 'Aplică' : 'Apply'}
        </button>
      </div>
      <div class="cart-coupon-msg" id="cart-coupon-msg"></div>
    </div>`;

  body.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items-col">
        <div class="cart-items-header">
          <span class="cart-items-title">${isRo ? 'Servicii selectate' : 'Selected services'}</span>
          <button class="cart-clear-btn" onclick="_cartClearAll()">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5h6.6L11 4"/></svg>
            ${isRo ? 'Golește coșul' : 'Clear cart'}
          </button>
        </div>
        <div class="cart-items-list">${itemsHtml}</div>
      </div>

      <div class="cart-summary-col">
        <div class="cart-summary-box">
          <div class="cart-summary-title">${isRo ? 'Rezumat comandă' : 'Order summary'}</div>

          <div class="cart-summary-row">
            <span>${isRo ? 'Subtotal' : 'Subtotal'}</span>
            <span id="cart-subtotal">${currency}${subtotal}</span>
          </div>
          ${couponRowHtml}
          ${hasCoupon ? `<div class="cart-summary-separator"></div>` : ''}
          <div class="cart-summary-row cart-summary-total">
            <span>Total</span>
            <span id="cart-grand-total">${currency}${grandTotal}</span>
          </div>

          ${couponInputHtml}
          ${!hasCoupon ? `<div class="cart-summary-separator"></div>` : ''}

          <button class="btn btn-accent cart-checkout-btn" onclick="_cartCheckout()">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1" y="3" width="12" height="9" rx="1.5"/><polyline points="1,3 7,8.5 13,3"/></svg>
            ${isRo ? 'Trimite cererea' : 'Send request'} ↗
          </button>
          <div class="cart-summary-note">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="5" width="10" height="7" rx="1"/><path d="M5 5V3.5a2 2 0 014 0V5"/></svg>
            ${isRo ? 'Nicio plată acum — ofertă gratuită' : 'No payment now — free quote'}
          </div>
        </div>
      </div>
    </div>`;
}

// ── Cart item actions ─────────────────────────────────────────────────────
window._cartRemoveItem = function(cartId) {
  _cart = _cart.filter(i => i.cartId !== cartId);
  _cartSave();
  _cartUpdateBadge();
  _renderCartPage();
};

window._cartIncQty = function(cartId) {
  const item = _cart.find(i => i.cartId === cartId);
  if (!item) return;
  item.quantity = Math.min(item.quantity + 1, 99);
  _cartSave();
  _cartUpdateBadge();
  _rerenderCartTotals(cartId);
};

window._cartDecQty = function(cartId) {
  const item = _cart.find(i => i.cartId === cartId);
  if (!item) return;
  if (item.quantity <= 1) {
    if (confirm(window.siteLang === 'ro' ? 'Elimini acest serviciu din coș?' : 'Remove this service from cart?')) {
      _cartRemoveItem(cartId);
    }
    return;
  }
  item.quantity -= 1;
  _cartSave();
  _cartUpdateBadge();
  _rerenderCartTotals(cartId);
};

function _rerenderCartTotals(cartId) {
  const item = _cart.find(i => i.cartId === cartId);
  const currency = item?.currency || '€';
  // Update line total display
  const lineEl = document.getElementById('line-' + cartId);
  if (lineEl && item) lineEl.textContent = currency + (item.lineTotal * item.quantity);
  const qtyEl = document.getElementById('qty-' + cartId);
  if (qtyEl && item) qtyEl.textContent = item.quantity;
  // Update summary totals
  const subtotal  = _cartSubtotal();
  const grandTotal = _cartGrandTotal();
  const hasCoupon = _coupon && _coupon.pct > 0;
  const couponDiscount = hasCoupon ? Math.round(subtotal * _coupon.pct / 100) : 0;
  const subEl = document.getElementById('cart-subtotal');
  const totEl = document.getElementById('cart-grand-total');
  if (subEl) subEl.textContent = currency + subtotal;
  if (totEl) totEl.textContent = currency + grandTotal;
  // Update badge
  _cartUpdateBadge();
}

window._cartClearAll = function() {
  const isRo = window.siteLang === 'ro';
  if (!confirm(isRo ? 'Golești tot coșul?' : 'Clear all items from cart?')) return;
  _cart = [];
  _coupon = null;
  _cartSave();
  _cartUpdateBadge();
  _renderCartPage();
};

// ── Coupon UI ─────────────────────────────────────────────────────────────
window._cartUiApplyCoupon = function() {
  const input   = document.getElementById('cart-coupon-input');
  const msgEl   = document.getElementById('cart-coupon-msg');
  const isRo    = window.siteLang === 'ro';
  const code    = input?.value?.trim();
  if (!code) return;

  if (_applyCoupon(code)) {
    if (msgEl) { msgEl.textContent = ''; msgEl.className = 'cart-coupon-msg'; }
    _renderCartPage(); // full re-render to show coupon row
  } else {
    if (msgEl) {
      msgEl.textContent = isRo ? 'Cod invalid sau expirat.' : 'Invalid or expired code.';
      msgEl.className   = 'cart-coupon-msg cart-coupon-msg-error';
    }
    if (input) { input.classList.add('cart-coupon-input-error'); setTimeout(() => input.classList.remove('cart-coupon-input-error'), 600); }
  }
};

window._cartUiRemoveCoupon = function() {
  _removeCoupon();
  _renderCartPage();
};

// ── Checkout ──────────────────────────────────────────────────────────────
window._cartCheckout = function() {
  const isRo = window.siteLang === 'ro';
  if (_cart.length === 0) return;
  const lines = _cart.map(item => {
    const extrasStr = item.extras.length
      ? '\n  ' + item.extras.map(e => `${e.label}${e.isFree ? ' (Gratuit/Free)' : ` (+${e.currency}${e.price})`}`).join('\n  ')
      : '';
    return `${item.svcName} x${item.quantity}${extrasStr}\n  ${isRo ? 'Total linie' : 'Line total'}: ${item.currency}${item.lineTotal * item.quantity}`;
  });
  const subtotalStr = `${isRo ? 'Subtotal' : 'Subtotal'}: ${_cart[0]?.currency || '€'}${_cartSubtotal()}`;
  const couponStr   = _coupon ? `\n${isRo ? 'Cod reducere' : 'Discount code'}: ${_coupon.code} (-${_coupon.pct}%)` : '';
  const totalStr    = `Total: ${_cart[0]?.currency || '€'}${_cartGrandTotal()}`;
  const body = [
    isRo ? 'Bună ziua,' : 'Hello,',
    '',
    isRo ? 'Aș dori să solicit o ofertă pentru următoarele servicii:' : 'I would like to request a quote for the following services:',
    '',
    lines.join('\n\n'),
    '',
    subtotalStr + couponStr,
    totalStr,
    '',
    isRo ? 'Vă mulțumesc,' : 'Thank you,',
  ].join('\n');

  const subject = isRo
    ? `Cerere ofertă — ${_cart.map(i => i.svcName).join(', ')}`
    : `Quote request — ${_cart.map(i => i.svcName).join(', ')}`;

  window.location.href = `mailto:${_contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

// Show cart button if cart has items on load
if (_cart.length > 0) {
  const btn = document.getElementById('tb-cart-btn');
  if (btn) btn.style.display = '';
  _cartUpdateBadge();
}