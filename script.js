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

// Write lang param into the URL without reloading (preserves hash)
function _syncLangParam() {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', window.siteLang);
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}
_syncLangParam();

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
    indisponibil:           'Indisponibil',
    verLatest:              'Cel mai recent',
    proiecte:               'Proiecte',
    solicita:               'Solicita oferta',
    de:                     'de',
    tehnologii:             'Tehnologii',
    nuDescriereAdaugata:    'Nicio descriere adaugata inca pentru aceasta tehnologie.\nPoti adauga continut din panoul de administrare.',
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
    'footer-tag':           'Proiecte independente de software, modding si localizare.',
    'footer-rights':        'Toate drepturile rezervate.',
    'support-paypal':       'Sustine pe PayPal',
    'support-kofi':         'Sustine pe Ko-fi',
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
    indisponibil:           'Unavailable',
    verLatest:              'Latest',
    proiecte:               'Projects',
    solicita:               'Request a quote',
    de:                     'by',
    tehnologii:             'Technologies',
    nuDescriereAdaugata:    'No description added yet for this technology.\nYou can add content from the admin panel.',
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
    'footer-tag':           'Independent software, modding and localization projects.',
    'footer-rights':        'All rights reserved.',
    'support-paypal':       'Support on PayPal',
    'support-kofi':         'Support on Ko-fi',
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
  // Re-render open project page so dynamic content picks up the current lang
  if (currentMod) {
    _renderProjectPage(currentMod);
  }
}

// ── CONSTANTS ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ── STATE ──────────────────────────────────────────────────────────────────
let INDEX       = [];
let MOD_CACHE   = {};
let currentMod  = null;
let currentPage = 1;
let totalPages  = 1;

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
  const marks      = normalizeMarks(data.marks);
  const hasAiMark  = marks.some(m => AI_MARK_KEYS.has(m.key));
  const legacyAi   = !!data.ai_used;

  return {
    id: docId, name: _langVal(data, 'Name') || data.Name || docId, dev: shortDesc, year,
    authors, status, downloadUrl,
    description: _langVal(data, 'desc') || '', image: data.image || '',
    marks,
    aiUsed: marks.length ? hasAiMark : legacyAi,
    aiDisclaimer: data.ai_disclaimer || 'Voci generate prin AI (voice cloning)',
    versions,
  };
}

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
function renderMods() {
  const table = document.getElementById('mod-table');
  table.innerHTML = '';
  const pageItems = getPageItems(currentPage);
  if (pageItems.length === 0) {
    table.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text-3);font-size:13px">${t('nuExistaProiecte')}</div>`;
    renderPagination();
    return;
  }
  pageItems.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'mod-row';
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.onclick   = () => { window.location.hash = 'proiecte/' + entry.id; };
    row.onkeydown = e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); window.location.hash = 'proiecte/' + entry.id; } };
    const mod = MOD_CACHE[entry.id];
    const name     = mod ? mod.name     : entry.id;
    const dev      = mod ? mod.dev      : '';
    const year     = mod ? mod.year     : '';
    const verCount = mod ? mod.versions.length : '–';
    const marksHtml = mod && mod.marks?.length
      ? `<div class="mr-marks">${renderMarksHtml(mod.marks, { compact: true, limit: 3 })}</div>`
      : '';
    const thumbInner = mod && mod.image
      ? `<img src="${mod.image}" alt="${name}" style="width:100%;height:100%;object-fit:cover;display:block">`
      : (mod ? coverThumbFallback(mod) : `<div style="width:100%;height:100%;background:var(--s3)"></div>`);
    row.innerHTML = `
      <div class="mr-name-cell">
        <div class="mr-cover-thumb">${thumbInner}</div>
        <div class="mr-name-inner">
          <div class="mr-name">${name}</div>
          <div class="mr-dev">${dev}</div>
          ${marksHtml}
        </div>
      </div>
      <div class="mr-files-cell"><strong>${verCount}</strong><span>${t('versiuni')}</span></div>
      <div class="mr-year-cell">${year}
        <svg class="mr-chevron" style="display:inline-block;vertical-align:middle;margin-left:4px" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="5,3 9,7 5,11"/></svg>
      </div>`;
    table.appendChild(row);
  });
  renderPagination();
}

// ── PAGINATION ─────────────────────────────────────────────────────────────
function getPageItems(page) {
  const start = (page - 1) * PAGE_SIZE;
  return INDEX.slice(start, start + PAGE_SIZE);
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
  window.location.hash = 'proiecte/pagina/' + page;
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
    totalPages = Math.max(1, Math.ceil(INDEX.length / PAGE_SIZE));
    renderMods();
    preloadPage(currentPage);
    if (_pendingProjectId) { _doOpenProjectFromFirestore(_pendingProjectId); _pendingProjectId = null; }
    if (_pendingPage) {
      if (_pendingPage > totalPages) { show404(); _pendingPage = null; }
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
  if (!toLoad.length) return;
  await Promise.all(toLoad.map(async entry => {
    try {
      const d = await getDoc(doc(db, 'projects', entry.id));
      if (d.exists()) MOD_CACHE[entry.id] = firestoreDocToMod(entry.id, d.data());
    } catch(e) { console.warn('Could not load mod', entry.id, e); }
  }));
  renderMods();
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
  _openingProject = true;
  window.location.hash = 'proiecte/' + modId;
  _openingProject = false;
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

function _markedParse(text) {
  marked.setOptions({ breaks: true, gfm: true });
  marked.use({ renderer: _buildMarkedRenderer() });
  return marked.parse(text);
}

const DESC_COLLAPSE_HEIGHT = 120;
function _renderDesc(el, raw) {
  if (!raw) { el.innerHTML = ''; return; }
  const html = _markedParse(raw);
  el.innerHTML = `<div class="proj-desc-inner md-prose">${html}</div>`;
  requestAnimationFrame(() => {
    const inner = el.querySelector('.proj-desc-inner');
    if (!inner) return;
    const full = inner.scrollHeight;
    if (full <= DESC_COLLAPSE_HEIGHT + 24) return;
    inner.style.maxHeight = DESC_COLLAPSE_HEIGHT + 'px';
    inner.classList.add('desc-collapsed');
    const toggle = document.createElement('button');
    toggle.className = 'desc-toggle';
    toggle.textContent = t('descToggleMore');
    let expanded = false;
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      if (expanded) { inner.style.maxHeight = full + 'px'; inner.classList.remove('desc-collapsed'); toggle.textContent = t('descToggleLess'); }
      else { inner.style.maxHeight = DESC_COLLAPSE_HEIGHT + 'px'; inner.classList.add('desc-collapsed'); toggle.textContent = t('descToggleMore'); }
    });
    el.appendChild(toggle);
  });
}

function _renderProjectPage(m) {
  const heroEl  = document.getElementById('proj-hero');
  const heroArt = document.getElementById('proj-hero-art');
  if (m.image) {
    heroArt.innerHTML = `<img src="${m.image}" alt="${m.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">`;
    heroEl.style.background = '#111';
  } else {
    heroArt.innerHTML = '';
    heroEl.style.background = coverHeroBg(m);
  }
  document.getElementById('proj-title-crumb').textContent = m.name;
  document.getElementById('proj-hero-name').textContent   = m.name;
  document.getElementById('proj-hero-meta').textContent   = m.dev;
  document.getElementById('proj-hero-authors').innerHTML  = m.authors.map(authorChip).join('');
  const statusLabels = { done: t('statusDone'), wip: t('statusWip'), early: t('statusEarly') };
  const statusClasses = { done: 'pill-done', wip: 'pill-wip', early: 'pill-early' };
  document.getElementById('proj-status-badge').innerHTML =
    `<span class="status-pill ${statusClasses[m.status] || 'pill-early'}">${statusLabels[m.status] || m.status}</span>`;
  const dlBtn = document.getElementById('proj-download-btn');
  if (m.downloadUrl) { dlBtn.style.display = 'inline-flex'; dlBtn.onclick = () => window.open(m.downloadUrl, '_blank'); }
  else dlBtn.style.display = 'none';
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
  document.getElementById('proj-files-count').textContent = `${m.versions.length} ${t('versiuni')}`;
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
            ${isLatest ? `<span class="ver-latest-badge">${t('verLatest')}</span>` : ''}
            ${v.date ? `<span class="ver-date">${v.date}</span>` : ''}
          </div>
          ${v.note ? `<div class="ver-note">${v.note}</div>` : ''}
          <div class="ver-file-row">
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 2h6l3 3v7H2z"/></svg>
            <span class="ver-file-name">${v.file || t('fisierNedisponibil')}</span>
            ${v.commit ? `<span class="ver-commit">${v.commit}</span>` : ''}
            <a class="ver-dl-btn ${canDl ? '' : 'ver-dl-locked'}"
               ${canDl ? `href="${vUrl}" target="_blank"` : 'onclick="return false"'}
               title="${canDl ? t('descarca') : t('indisponibil')}">
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
  window.location.hash = currentPage > 1 ? 'proiecte/pagina/' + currentPage : 'proiecte';
  const backdrop = document.getElementById('proj-backdrop');
  const page     = document.getElementById('proj-page');
  page.classList.remove('open');
  setTimeout(() => { backdrop.classList.remove('open'); document.body.style.overflow = ''; }, 300);
  currentMod = null;
}

function handleProjBackdrop(e) {
  if (e.target === document.getElementById('proj-backdrop')) closeProject();
}

// ── HASH ROUTING ───────────────────────────────────────────────────────────
const HASH_PAGE_MAP = {
  '': 'home', 'proiecte': 'products', 'servicii': 'servicii',
  'despre': 'about', 'confidentialitate': 'privacy', 'termeni': 'terms',
  'tehnologie': 'tech',
};
const NAV_MAP = {
  home: 'ni-home', products: 'ni-products',
  servicii: 'ni-servicii', about: 'ni-about',
};

let _openingProject = false;
let _pendingProjectId = null;
let _pendingPage = null;

function resolveRoute() {
  const raw   = window.location.hash.replace(/^#\/?/, '');
  const parts = raw.split('/');
  const sec   = parts[0];
  const sub   = parts[1];
  const sub2  = parts[2];
  const projPage = document.getElementById('proj-page');
  if (projPage.classList.contains('open') && !(sec === 'proiecte' && sub && sub !== 'pagina')) {
    _closeProjectSilent();
  }
  if (sec === 'proiecte') {
    _activatePage('products');
    if (sub === 'pagina' && sub2) {
      const pg = parseInt(sub2) || 1;
      if (INDEX.length > 0 && pg > totalPages) { show404(); return; }
      currentPage = Math.max(1, Math.min(pg, totalPages));
      if (INDEX.length > 0) { renderMods(); preloadPage(currentPage); }
      else _pendingPage = currentPage;
      return;
    }
    if (sub && sub !== 'pagina') {
      if (INDEX.length > 0) _doOpenProjectFromFirestore(sub);
      else _pendingProjectId = sub;
      return;
    }
    currentPage = 1;
    if (INDEX.length > 0) { renderMods(); preloadPage(1); }
    return;
  }
  if (sec === 'tehnologie' && sub) {
    _activatePage('tech');
    loadTechPage(sub);
    return;
  }

  const pageId = HASH_PAGE_MAP[sec] || 'home';
  _activatePage(pageId);
}

function _activatePage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + pageId);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navId = NAV_MAP[pageId];
  if (navId) document.getElementById(navId).classList.add('active');
  if (pageId === 'privacy') loadLegalPage('privacy');
  if (pageId === 'terms')   loadLegalPage('terms');
}

function _closeProjectSilent() {
  document.getElementById('proj-page').classList.remove('open');
  document.getElementById('proj-backdrop').classList.remove('open');
  document.body.style.overflow = '';
  currentMod = null;
}

window.addEventListener('hashchange', () => { if (_openingProject) return; resolveRoute(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('proj-page').classList.contains('open'))
    closeProject();
});

function show404() {
  _closeProjectSilent();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-404');
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
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

    // Hero tagline / eyebrow (cfg-hero-tagline → heroTagline)
    const heroTagline = _langVal(d, 'heroTagline');
    if (heroTagline) {
      const el = document.getElementById('home-eyebrow');
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

function _svcIconSvg(svc) {
  const ti = svc.icon || SVC_TYPE_ICONS[svc.type] || 'ti-briefcase';
  if (ti.startsWith('ti-')) return `<i class="ti ${ti}"></i>`;
  return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/></svg>`;
}

function _svcNormalize(raw) {
  return {
    name:     _langVal(raw, 'name')               || raw.name || '',
    creator:  raw.creator  || '',
    desc:     _langVal(raw, 'desc') || _langVal(raw, 'tagline') || raw.desc || raw.tagline || '',
    type:     raw.type     || 'serviciu',
    price:    raw.price    || '',
    currency: raw.currency || '€',
    badge:    raw.badge    || '',
    order:    parseInt(raw.order) || 999,
    features: Array.isArray(raw.features) ? raw.features : [],
    icon:     raw.icon     || '',
    category: raw.category || '',
  };
}

function _svcRowHtml(svc, idPrefix) {
  const checkSvg = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="2,6 5,9 10,3"/></svg>`;
  const chevSvg  = `<svg class="svc-row-chevron" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="2,4 6,8 10,4"/></svg>`;
  const badgeCls = _svcBadgeClass(svc.badge);
  const badge = svc.badge
    ? `<span class="svc-badge ${badgeCls}">${svc.badge}</span>`
    : '';
  const iconClass = _svcIconClass(svc.badge);
  const currency  = svc.currency || '€';
  const tagline   = svc.desc || svc.tagline || '';
  const creator   = svc.creator
    ? `<div class="svc-row-creator">${t('de')} ${svc.creator}</div>`
    : '';

  const feats = (svc.features || []).map(f =>
    `<div class="svc-feat-item">${checkSvg}<span>${f}</span></div>`
  ).join('');

  return `
    <div class="svc-row" data-svc-id="${idPrefix}">
      <div class="svc-row-main">
        <div class="svc-row-icon ${iconClass}">${_svcIconSvg(svc)}</div>
        <div class="svc-row-info">
          <div class="svc-row-name-line">
            <span class="svc-row-name">${svc.name || ''}</span>${badge}
          </div>
          ${tagline ? `<div class="svc-row-tagline">${tagline}</div>` : ''}
        </div>
        <div class="svc-row-right">
          <span class="svc-row-price">${currency}${svc.price || ''}</span>
          ${chevSvg}
        </div>
      </div>
      <div class="svc-row-detail">
        ${creator}
        ${feats ? `<div class="svc-feat-list">${feats}</div>` : ''}
        <div class="svc-row-actions">
          <a class="btn btn-accent" href="mailto:${_contactEmail}">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1" y="3" width="12" height="9" rx="1.5"/><polyline points="1,3 7,8.5 13,3"/></svg>
            ${t('solicita')}
          </a>
        </div>
      </div>
    </div>`;
}

function _svcInitAccordion(container) {
  container.querySelectorAll('.svc-row-main').forEach(main => {
    main.addEventListener('click', () => {
      const row     = main.closest('.svc-row');
      const wasOpen = row.classList.contains('open');
      row.closest('.svc-list').querySelectorAll('.svc-row').forEach(r => r.classList.remove('open'));
      if (!wasOpen) row.classList.add('open');
    });
  });
}

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

    const tabsEl  = document.getElementById('svc-tabs');
    const panelEl = document.getElementById('svc-panel');
    if (!panelEl) return;

    // Show guarantee now that we have data
    const guaranteeEl = document.getElementById('svc-guarantee');
    if (guaranteeEl) guaranteeEl.style.display = '';

    // Show guarantee now that we have data
    const guaranteeEl = document.getElementById('svc-guarantee');
    if (guaranteeEl) guaranteeEl.style.display = '';

    const list = rawList.map(_svcNormalize).sort((a, b) => a.order - b.order);

    // Legacy category tabs — only when older data still has categories
    const cats = [];
    list.forEach(svc => {
      const cat = svc.category;
      if (cat && !cats.includes(cat)) cats.push(cat);
    });
    const hasMultipleCats = cats.length > 1;

    if (tabsEl) {
      if (hasMultipleCats) {
        tabsEl.style.display = '';
        const allCats = [...cats, '__all__'];
        tabsEl.innerHTML = allCats.map((c, i) => {
          const label = c === '__all__' ? 'Toate' : c;
          return `<div class="svc-tab${i === 0 ? ' active' : ''}" data-svc-cat="${c}" role="tab">${label}</div>`;
        }).join('');
      } else {
        tabsEl.style.display = 'none';
        tabsEl.innerHTML = '';
      }
    }

    let html = '';

    if (hasMultipleCats) {
      cats.forEach((cat, ci) => {
        const items = list.filter(s => s.category === cat);
        html += `<div class="svc-cat${ci === 0 ? ' visible' : ''}" id="svc-cat-${_slugify(cat)}">
          <div class="svc-list">
            ${items.map((svc, si) => _svcRowHtml(svc, `${_slugify(cat)}-${si}`)).join('')}
          </div>
        </div>`;
      });
      html += `<div class="svc-cat" id="svc-cat-all">
        <div class="svc-list">
          ${cats.map(cat => {
            const items = list.filter(s => s.category === cat);
            return `<div class="svc-section-label">${cat}</div>` +
              items.map((svc, si) => _svcRowHtml(svc, `all-${_slugify(cat)}-${si}`)).join('');
          }).join('')}
        </div>
      </div>`;
    } else {
      html = `<div class="svc-cat visible" id="svc-cat-main">
        <div class="svc-list">
          ${list.map((svc, i) => _svcRowHtml(svc, `svc-${i}`)).join('')}
        </div>
      </div>`;
    }

    panelEl.innerHTML = html;
    panelEl.querySelectorAll('.svc-list').forEach(el => _svcInitAccordion(el));

    if (hasMultipleCats && tabsEl) {
      tabsEl.querySelectorAll('.svc-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          tabsEl.querySelectorAll('.svc-tab').forEach(t => t.classList.remove('active'));
          panelEl.querySelectorAll('.svc-cat').forEach(s => s.classList.remove('visible'));
          tab.classList.add('active');
          const cat = tab.dataset.svcCat;
          const targetId = cat === '__all__' ? 'svc-cat-all' : `svc-cat-${_slugify(cat)}`;
          const targetEl = document.getElementById(targetId);
          if (targetEl) targetEl.classList.add('visible');
        });
      });
    }

  } catch(e) {
    console.warn('Could not load services:', e);
  }
}

function _slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
          return `<a class="chip chip-link" href="#tehnologie/${slug}" role="button">${s}</a>`;
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
  if (banner) banner.classList.add('visible');
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

// ── BOOT ───────────────────────────────────────────────────────────────────
document.getElementById('copy-year').textContent = new Date().getFullYear();
translateDOM();
resolveRoute();
initCookieBanner();
loadIndex();
loadSiteSettings().then(() => loadServices());
loadAbout();
if (localStorage.getItem('fd_cookie_choice') === '1') initAnalytics();
