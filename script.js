// ── DATA ──────────────────────────────────────────────────────────────────
const MODS = [
  {
    id: 'gta3', name: 'Grand Theft Auto III', dev: 'Rockstar Games · 2001',
    theme: 'gta3', year: '2001',
    authors: ['Andrei M.', 'Cristina V.', 'Radu T.'],
    progress: 100, status: 'done',
    goal: 120, raised: 120,
    missionLines: { done: 86, todo: 0 },
    npc: { done: 140, todo: 0 },
    downloadUrl: 'https://drive.google.com/example/gta3-ro-dub.zip',
    description: 'Primul joc GTA 3D, dubat integral in romana. Toate dialogurile, cutscenele si liniile NPC-urilor au fost traduse si generate prin AI, antrenata pe vocile originale ale personajelor. Proiectul a durat 8 luni.',
    cutsceneDone: [
      { name: 'claude.mp3',           commit: 'a3f9b2c', date: 'acum 2 luni' },
      { name: 'mission_intro_01.mp3', commit: 'b7e1d4a', date: 'acum 2 luni' },
      { name: 'cutscene_finale.mp3',  commit: 'c2a8f3e', date: 'acum 3 luni' },
      { name: 'radio_chatterbox.mp3', commit: 'd5b1c7f', date: 'acum 3 luni' },
      { name: 'npc_liberty_01.mp3',   commit: 'e9f2a4b', date: 'acum 4 luni' },
      { name: 'npc_liberty_02.mp3',   commit: 'f3c5d8e', date: 'acum 4 luni' },
      { name: 'luigi_dialogs.mp3',    commit: 'a1b2c3d', date: 'acum 5 luni' },
      { name: 'toni_dialogs.mp3',     commit: 'b4e5f6a', date: 'acum 5 luni' },
      { name: 'salvatore.mp3',        commit: 'c7d8e9f', date: 'acum 6 luni' },
      { name: 'catalina_dialogs.mp3', commit: 'd0e1f2a', date: 'acum 6 luni' },
      { name: 'cutscene_intro.mp3',   commit: 'e3f4a5b', date: 'acum 7 luni' },
      { name: 'cutscene_ending.mp3',  commit: 'f6a7b8c', date: 'acum 8 luni' },
    ],
    cutsceneTodo: []
  },
  {
    id: 'gtavc', name: 'Grand Theft Auto: Vice City', dev: 'Rockstar Games · 2002',
    theme: 'vc', year: '2002',
    authors: ['Mihai D.', 'Ioana S.', 'Bogdan P.', 'Elena R.'],
    progress: 100, status: 'done',
    goal: 150, raised: 150,
    missionLines: { done: 130, todo: 0 },
    npc: { done: 210, todo: 0 },
    downloadUrl: 'https://drive.google.com/example/gtavc-ro-dub.zip',
    description: 'Dublajul complet al Vice City, inclusiv campania, radioul si NPC-urile. Vocile au fost generate prin AI si antrenate sa redea cat mai fidel tonul original al fiecarui personaj din anii 80.',
    cutsceneDone: [
      { name: 'tommy_intro.mp3',        commit: 'f1a2b3c', date: 'acum 1 luna' },
      { name: 'lance_dialogs.mp3',      commit: 'g4d5e6f', date: 'acum 1 luna' },
      { name: 'sonny_dialogs.mp3',      commit: 'h7g8h9i', date: 'acum 2 luni' },
      { name: 'cutscene_rooftop.mp3',   commit: 'i0j1k2l', date: 'acum 2 luni' },
      { name: 'radio_wave103.mp3',      commit: 'j3m4n5o', date: 'acum 3 luni' },
      { name: 'radio_flashfm.mp3',      commit: 'k6p7q8r', date: 'acum 3 luni' },
      { name: 'npc_downtown_01.mp3',    commit: 'l9s0t1u', date: 'acum 4 luni' },
      { name: 'cortez_dialogs.mp3',     commit: 'm2v3w4x', date: 'acum 4 luni' },
      { name: 'diaz_dialogs.mp3',       commit: 'n5y6z7a', date: 'acum 5 luni' },
      { name: 'cutscene_mansion.mp3',   commit: 'o8b9c0d', date: 'acum 5 luni' },
      { name: 'kent_paul.mp3',          commit: 'p1e2f3g', date: 'acum 6 luni' },
      { name: 'avery_carrington.mp3',   commit: 'q4h5i6j', date: 'acum 7 luni' },
      { name: 'cutscene_finale_vc.mp3', commit: 'r7k8l9m', date: 'acum 8 luni' },
      { name: 'npc_beach_01.mp3',       commit: 's0n1o2p', date: 'acum 8 luni' },
    ],
    cutsceneTodo: []
  },
  {
    id: 'gtasa', name: 'Grand Theft Auto: San Andreas', dev: 'Rockstar Games · 2004',
    theme: 'sa', year: '2004',
    authors: ['Florin B.', 'Alexandra N.'],
    progress: 10, status: 'wip',
    goal: 400, raised: 42,
    missionLines: { done: 38, todo: 340 },
    npc: { done: 25, todo: 260 },
    downloadUrl: null,
    description: 'San Andreas este cel mai ambitos proiect — are de 3x mai multe dialoguri decat Vice City. Vocile sunt generate prin AI, antrenate individual pentru fiecare personaj din Los Santos. Avem nevoie urgenta de fonduri pentru a continua.',
    cutsceneDone: [
      { name: 'cj_intro.mp3',        commit: 'a1b2c3d', date: 'acum 3 sapt.' },
      { name: 'big_smoke_01.mp3',     commit: 'b4c5d6e', date: 'acum 2 sapt.' },
      { name: 'ryder_dialogs_01.mp3', commit: 'c7d8e9f', date: 'acum 1 sapt.' },
      { name: 'sweet_dialogs_01.mp3', commit: 'd0e1f2g', date: 'acum 3 zile' },
    ],
    cutsceneTodo: [
      'officer_tenpenny.mp3','officer_pulaski.mp3','cutscene_homecoming.mp3',
      'big_smoke_02.mp3','big_smoke_03.mp3','ryder_dialogs_02.mp3',
      'catalina_sa.mp3','cesar_dialogs.mp3','truth_dialogs.mp3',
      'woozie_dialogs.mp3','mike_toreno.mp3','cutscene_green_sabre.mp3',
      'madd_dogg_dialogs.mp3','kent_paul_sa.mp3','jizzy_dialogs.mp3',
      'T-Bone_mendez.mp3','zero_dialogs.mp3','npc_los_santos_01.mp3',
      'npc_los_santos_02.mp3','npc_san_fierro_01.mp3','npc_san_fierro_02.mp3',
      'npc_las_venturas_01.mp3','radio_playback.mp3','radio_krose.mp3',
      'radio_master_sounds.mp3','radio_wctr.mp3','cutscene_end_of_line.mp3',
      'grove_street_01.mp3','grove_street_02.mp3','ballas_npc.mp3',
      'vagos_npc.mp3','aztecas_npc.mp3',
    ]
  },
  {
    id: 'bully', name: 'Bully', dev: 'Rockstar Games · 2006',
    theme: 'bully', year: '2006',
    authors: ['Cautam voluntari'],
    progress: 1, status: 'early',
    goal: 300, raised: 3,
    missionLines: { done: 2, todo: 180 },
    npc: { done: 3, todo: 220 },
    downloadUrl: null,
    description: 'Abia am inceput studiul proiectului. Bully are un stil unic de dialog, iar antrenarea vocilor AI pentru fiecare personaj necesita mostre audio de calitate. Cautam colaboratori si fonduri pentru a demara productia.',
    cutsceneDone: [
      { name: 'jimmy_intro.mp3', commit: 'a1b2c3d', date: 'acum 1 sapt.' },
    ],
    cutsceneTodo: [
      'gary_dialogs.mp3','pete_dialogs.mp3','ms_philips.mp3',
      'dr_crabblesnitch.mp3','russell_dialogs.mp3','johnny_vincent.mp3',
      'lola_dialogs.mp3','cutscene_welcome.mp3','cutscene_the_setup.mp3',
      'preppie_01.mp3','preppie_02.mp3','nerd_01.mp3','nerd_02.mp3',
      'greaser_01.mp3','greaser_02.mp3','bully_npc_01.mp3','bully_npc_02.mp3',
      'derby_harrington.mp3','tad_dialogs.mp3','bo_jackson.mp3',
      'npc_students_01.mp3','npc_students_02.mp3','npc_teachers_01.mp3',
      'kirby_dialogs.mp3','mandy_dialogs.mp3','zoe_dialogs.mp3',
      'chapter2_intro.mp3','chapter3_intro.mp3','epilogue.mp3',
    ]
  }
];

// ── STATE ─────────────────────────────────────────────────────────────────
let currentMod = null;
let fbType = null;
let fbFile = null;
let fbGame = null;
let feedbacks = {};
let audioCtx = null;
let activeSrc = null;
let activePlayerId = null;

// ── AUDIO ──────────────────────────────────────────────────────────────────
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}
function playFile(filename, playerId) {
  const ctx = getAudioCtx();
  if (activeSrc) { try { activeSrc.stop(); } catch(e) {} activeSrc = null; }
  if (activePlayerId && activePlayerId !== playerId) updatePlayerState(activePlayerId, false);
  const btn = document.querySelector(`[data-player="${playerId}"] .ap-play`);
  const isPlaying = btn && btn.dataset.playing === '1';
  if (isPlaying) { updatePlayerState(playerId, false); activePlayerId = null; return; }
  const h = hashStr(filename);
  const freqs = [220,277,330,370,440,494,523,587,659,698,740,880];
  const freq1 = freqs[h % freqs.length];
  const freq2 = freqs[(h >> 4) % freqs.length];
  const freq3 = freqs[(h >> 8) % freqs.length];
  const dur = 3.5;
  const osc1 = ctx.createOscillator(); const osc2 = ctx.createOscillator(); const osc3 = ctx.createOscillator();
  const gain = ctx.createGain(); const gain2 = ctx.createGain();
  osc1.type = 'sine'; osc1.frequency.value = freq1;
  osc2.type = 'sine'; osc2.frequency.value = freq2 * 1.5;
  osc3.type = 'triangle'; osc3.frequency.value = freq3 * 0.5;
  gain2.gain.value = 0.15;
  osc1.connect(gain); osc2.connect(gain); osc3.connect(gain2); gain2.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
  osc1.start(); osc2.start(); osc3.start();
  osc1.stop(ctx.currentTime + dur); osc2.stop(ctx.currentTime + dur); osc3.stop(ctx.currentTime + dur);
  activeSrc = osc1; activePlayerId = playerId;
  updatePlayerState(playerId, true);
  osc1.onended = () => { if (activePlayerId === playerId) { updatePlayerState(playerId, false); activePlayerId = null; } };
}
function stopFile(playerId) {
  if (activeSrc) { try { activeSrc.stop(); } catch(e) {} activeSrc = null; }
  updatePlayerState(playerId, false); activePlayerId = null;
}
function updatePlayerState(playerId, playing) {
  const el = document.querySelector(`[data-player="${playerId}"]`);
  if (!el) return;
  const btn = el.querySelector('.ap-play');
  if (btn) {
    btn.dataset.playing = playing ? '1' : '0';
    btn.innerHTML = playing
      ? `<svg viewBox="0 0 10 10" fill="currentColor"><rect x="1.5" y="1" width="2.5" height="8"/><rect x="6" y="1" width="2.5" height="8"/></svg>`
      : `<svg viewBox="0 0 10 10" fill="currentColor"><polygon points="2,1 9,5 2,9"/></svg>`;
  }
  el.querySelectorAll('.audio-bar').forEach((bar, i) => {
    if (playing) {
      bar.classList.add('playing'); bar.style.animationDelay = (i * 0.09) + 's';
      const hs = hashStr(playerId + i); bar.style.height = (8 + (hs % 8)) + 'px';
    } else { bar.classList.remove('playing'); bar.style.height = '5px'; }
  });
}
function makeAudioPlayer(filename, playerId) {
  const bars = Array.from({length:6}, () => `<div class="audio-bar" style="height:5px;transform-origin:bottom"></div>`).join('');
  return `
    <div class="audio-player" data-player="${playerId}">
      <button class="audio-btn audio-btn-play ap-play" data-playing="0"
        onclick="event.stopPropagation();playFile('${filename}','${playerId}')" title="Reda / Pauza">
        <svg viewBox="0 0 10 10" fill="currentColor"><polygon points="2,1 9,5 2,9"/></svg>
      </button>
      <div class="audio-waveform">${bars}</div>
      <button class="audio-btn audio-btn-stop" onclick="event.stopPropagation();stopFile('${playerId}')" title="Opreste">
        <svg viewBox="0 0 8 8" fill="currentColor"><rect x="1" y="1" width="6" height="6"/></svg>
      </button>
    </div>`;
}

// ── COVER ART ─────────────────────────────────────────────────────────────
function coverArt(theme, forHero = false) {
  const arts = {
    gta3: forHero
      ? `<svg viewBox="0 0 860 160" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%">
          <rect width="860" height="160" fill="url(#g3h)"/>
          <defs><linearGradient id="g3h" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#0b1620"/><stop offset=".55" stop-color="#152b3d"/><stop offset="1" stop-color="#1f4b5e"/></linearGradient></defs>
          <rect x="0" y="70" width="60" height="90" fill="#0d222f" opacity=".8"/>
          <rect x="75" y="40" width="50" height="120" fill="#0f2836" opacity=".85"/>
          <rect x="140" y="85" width="70" height="75" fill="#0d222f" opacity=".8"/>
          <rect x="230" y="20" width="55" height="140" fill="#123141" opacity=".9"/>
          <rect x="305" y="55" width="45" height="105" fill="#0f2836" opacity=".85"/>
          <rect x="370" y="10" width="60" height="150" fill="#153648" opacity=".95"/>
          <rect x="450" y="60" width="55" height="100" fill="#0d222f" opacity=".8"/>
          <rect x="525" y="40" width="50" height="120" fill="#123141" opacity=".9"/>
          <rect x="595" y="72" width="65" height="88" fill="#0f2836" opacity=".85"/>
          <rect x="680" y="25" width="55" height="135" fill="#153648" opacity=".95"/>
          <rect x="755" y="50" width="60" height="110" fill="#0d222f" opacity=".8"/>
          <g fill="#e9d98a" opacity=".45">
            <rect x="240" y="28" width="5" height="6"/><rect x="252" y="28" width="5" height="6"/>
            <rect x="240" y="42" width="5" height="6"/><rect x="380" y="20" width="5" height="6"/>
            <rect x="394" y="20" width="5" height="6"/><rect x="380" y="36" width="5" height="6"/>
            <rect x="534" y="50" width="5" height="6"/><rect x="690" y="34" width="5" height="6"/>
          </g>
          <circle cx="720" cy="18" r="30" fill="#f2e7b8" opacity=".1"/>
        </svg>`
      : `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <rect width="36" height="36" fill="url(#g3t)"/>
          <defs><linearGradient id="g3t" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#0b1620"/><stop offset="1" stop-color="#1f4b5e"/></linearGradient></defs>
          <rect x="2" y="18" width="6" height="18" fill="#0f2836" opacity=".9"/>
          <rect x="10" y="12" width="5" height="24" fill="#123141" opacity=".9"/>
          <rect x="17" y="6" width="6" height="30" fill="#153648" opacity=".95"/>
          <rect x="25" y="16" width="5" height="20" fill="#0f2836" opacity=".9"/>
          <g fill="#e9d98a" opacity=".5"><rect x="18" y="9" width="2" height="2"/><rect x="22" y="9" width="2" height="2"/></g>
        </svg>`,
    vc: forHero
      ? `<svg viewBox="0 0 860 160" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%">
          <rect width="860" height="160" fill="url(#vch)"/>
          <defs><linearGradient id="vch" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#26102f"/><stop offset=".55" stop-color="#7a2a63"/><stop offset="1" stop-color="#ff7a4d"/></linearGradient></defs>
          <circle cx="680" cy="42" r="70" fill="#ffcf6b" opacity=".35"/>
          <rect x="0" y="100" width="860" height="60" fill="#1a0a26" opacity=".5"/>
          <path d="M80 160 80 88 Q60 65 78 48 Q88 65 80 88" stroke="#2c8f5f" stroke-width="8" fill="none" opacity=".6"/>
          <path d="M80 88 Q110 70 130 84" stroke="#2c8f5f" stroke-width="7" fill="none" opacity=".6"/>
          <path d="M80 88 Q50 72 30 88" stroke="#2c8f5f" stroke-width="7" fill="none" opacity=".6"/>
          <path d="M340 160 340 78 Q320 54 340 36 Q352 54 340 78" stroke="#2c8f5f" stroke-width="8" fill="none" opacity=".5"/>
          <path d="M340 78 Q368 60 390 74" stroke="#2c8f5f" stroke-width="7" fill="none" opacity=".5"/>
          <path d="M340 78 Q312 62 292 78" stroke="#2c8f5f" stroke-width="7" fill="none" opacity=".5"/>
          <rect x="500" y="96" width="36" height="64" fill="#3d1636" opacity=".7"/>
          <rect x="544" y="78" width="30" height="82" fill="#4a1a40" opacity=".7"/>
          <rect x="582" y="104" width="40" height="56" fill="#3d1636" opacity=".7"/>
          <rect x="632" y="88" width="30" height="72" fill="#4a1a40" opacity=".7"/>
        </svg>`
      : `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <rect width="36" height="36" fill="url(#vct)"/>
          <defs><linearGradient id="vct" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#26102f"/><stop offset="1" stop-color="#ff7a4d"/></linearGradient></defs>
          <circle cx="26" cy="8" r="8" fill="#ffcf6b" opacity=".4"/>
          <path d="M8 36 8 20 Q4 14 8 10 Q11 14 8 20" stroke="#2c8f5f" stroke-width="2" fill="none" opacity=".7"/>
          <rect x="20" y="22" width="6" height="14" fill="#4a1a40" opacity=".8"/>
          <rect x="28" y="18" width="5" height="18" fill="#3d1636" opacity=".8"/>
        </svg>`,
    sa: forHero
      ? `<svg viewBox="0 0 860 160" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%">
          <rect width="860" height="160" fill="url(#sah)"/>
          <defs><linearGradient id="sah" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#241203"/><stop offset=".55" stop-color="#7a3a0a"/><stop offset="1" stop-color="#e0a339"/></linearGradient></defs>
          <circle cx="160" cy="30" r="45" fill="#ffb454" opacity=".35"/>
          <path d="M0 120 L100 70 L180 110 L290 50 L420 115 L540 72 L660 118 L780 80 L860 118 L860 160 L0 160 Z" fill="#5a2e0d" opacity=".55"/>
          <path d="M0 135 L150 96 L250 128 L400 88 L540 130 L680 102 L860 132 L860 160 L0 160 Z" fill="#3d1f08" opacity=".6"/>
          <g fill="#8a5a2a" opacity=".5">
            <ellipse cx="700" cy="148" rx="8" ry="16"/><ellipse cx="718" cy="150" rx="6" ry="12"/>
            <ellipse cx="732" cy="146" rx="8" ry="18"/>
          </g>
        </svg>`
      : `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <rect width="36" height="36" fill="url(#sat)"/>
          <defs><linearGradient id="sat" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#241203"/><stop offset="1" stop-color="#e0a339"/></linearGradient></defs>
          <circle cx="8" cy="7" r="5" fill="#ffb454" opacity=".5"/>
          <path d="M0 28 L9 16 L16 24 L24 11 L36 28 L36 36 L0 36 Z" fill="#5a2e0d" opacity=".7"/>
          <path d="M0 32 L14 22 L24 30 L36 24 L36 36 L0 36 Z" fill="#3d1f08" opacity=".7"/>
        </svg>`,
    bully: forHero
      ? `<svg viewBox="0 0 860 160" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%">
          <rect width="860" height="160" fill="url(#buh)"/>
          <defs><linearGradient id="buh" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#101d12"/><stop offset=".55" stop-color="#233c1f"/><stop offset="1" stop-color="#6f9146"/></linearGradient></defs>
          <rect x="220" y="56" width="420" height="104" fill="#1c3018" opacity=".7"/>
          <polygon points="220,56 430,10 640,56" fill="#28401f" opacity=".8"/>
          <rect x="400" y="84" width="40" height="76" fill="#0f1f0c" opacity=".75"/>
          <rect x="248" y="78" width="36" height="36" fill="#3a5a2c" opacity=".5"/>
          <rect x="310" y="78" width="36" height="36" fill="#3a5a2c" opacity=".5"/>
          <rect x="516" y="78" width="36" height="36" fill="#3a5a2c" opacity=".5"/>
          <rect x="578" y="78" width="36" height="36" fill="#3a5a2c" opacity=".5"/>
          <rect x="415" y="20" width="20" height="40" fill="#0f1f0c" opacity=".6"/>
          <circle cx="425" cy="14" r="7" fill="#9fc76a" opacity=".5"/>
        </svg>`
      : `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <rect width="36" height="36" fill="url(#but)"/>
          <defs><linearGradient id="but" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#101d12"/><stop offset="1" stop-color="#6f9146"/></linearGradient></defs>
          <rect x="6" y="14" width="24" height="22" fill="#1c3018" opacity=".8"/>
          <polygon points="6,14 18,4 30,14" fill="#28401f" opacity=".9"/>
          <rect x="16" y="20" width="4" height="16" fill="#0f1f0c" opacity=".8"/>
          <rect x="8" y="18" width="4" height="4" fill="#3a5a2c" opacity=".6"/>
          <rect x="24" y="18" width="4" height="4" fill="#3a5a2c" opacity=".6"/>
          <circle cx="18" cy="8" r="2" fill="#9fc76a" opacity=".5"/>
        </svg>`
  };
  return arts[theme] || arts.gta3;
}

const COVER_BG = { gta3: '#0f2836', vc: '#4a1a40', sa: '#5a2e0d', bully: '#1c3018' };

const AVATAR_COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#0ea5e9','#a855f7','#14b8a6'];
function authorChip(name) {
  const initial = name.trim().charAt(0).toUpperCase();
  const color = AVATAR_COLORS[hashStr(name) % AVATAR_COLORS.length];
  return `<span class="author-chip"><span class="author-avatar" style="background:${color}">${initial}</span>${name}</span>`;
}

// ── RENDER FILE LISTING ────────────────────────────────────────────────────
function renderMods() {
  const table = document.getElementById('mod-table');
  table.querySelectorAll('.mod-row').forEach(r => r.remove());
  MODS.forEach(mod => {
    const pillCls = { done:'pill-done', wip:'pill-wip', early:'pill-early' }[mod.status];
    const pillTxt = { done:'Finalizat', wip:'In lucru', early:'Inceput' }[mod.status];
    const fillCls = { done:'fill-green', wip:'fill-accent', early:'fill-dim' }[mod.status];
    const raisedPct = Math.min(Math.round((mod.raised / mod.goal) * 100), 100);
    const totalFiles = mod.cutsceneDone.length + mod.cutsceneTodo.length;
    const row = document.createElement('div');
    row.className = 'mod-row';
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.onclick = () => openShowcase(mod.id);
    row.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openShowcase(mod.id); } };
    row.innerHTML = `
      <div class="mr-name-cell">
        <div class="mr-cover-thumb" style="background:${COVER_BG[mod.theme]||'#18181b'}">${coverArt(mod.theme, false)}</div>
        <div class="mr-name-inner">
          <div class="mr-name">${mod.name}</div>
          <div class="mr-dev">${mod.dev}</div>
        </div>
      </div>
      <div class="mr-status-cell"><span class="status-pill ${pillCls}">${pillTxt}</span></div>
      <div class="mr-prog-cell">
        <div class="mr-prog-label">${mod.progress}%</div>
        <div class="mr-prog-bar"><div class="mr-prog-fill ${fillCls}" style="width:${mod.progress}%"></div></div>
      </div>
      <div class="mr-fund-cell">
        <div class="mr-fund-nums">${mod.raised}/${mod.goal} EUR</div>
        <div class="mr-fund-bar"><div class="mr-fund-fill" style="width:${raisedPct}%"></div></div>
      </div>
      <div class="mr-files-cell"><strong>${mod.cutsceneDone.length}</strong><span>din ${totalFiles} fis.</span></div>
      <div class="mr-year-cell">${mod.year}
        <svg class="mr-chevron" style="display:inline-block;vertical-align:middle;margin-left:4px" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="5,3 9,7 5,11"/></svg>
      </div>`;
    table.appendChild(row);
  });
  renderFundingSummary();
}

// ── FUNDING SUMMARY ──────────────────────────────────────────────────────
function renderFundingSummary() {
  const unfinished = MODS.filter(m => m.status !== 'done');
  const totalGoal = unfinished.reduce((s, m) => s + m.goal, 0);
  const totalRaised = unfinished.reduce((s, m) => s + m.raised, 0);
  const pct = totalGoal ? Math.min(Math.round((totalRaised / totalGoal) * 100), 100) : 0;
  document.getElementById('fs-numbers').innerHTML = `${totalRaised} EUR <span class="of">din</span> ${totalGoal} EUR`;
  document.getElementById('fs-bar').style.width = pct + '%';
  document.getElementById('fs-sub').innerHTML = unfinished.length
    ? `<strong>${pct}%</strong> finantat, pe baza a <strong>${unfinished.length}</strong> proiecte inca nefinalizate (${unfinished.map(m => m.name).join(', ')}).`
    : 'Toate proiectele sunt finalizate — multumim pentru sprijin!';
  document.getElementById('pp-bar').style.width = pct + '%';
  document.getElementById('pp-note').innerHTML = `<strong>${totalRaised} EUR</strong> din <strong>${totalGoal} EUR</strong> necesari colectati`;
}

// ── SHOWCASE ──────────────────────────────────────────────────────────────
function openShowcase(modId) {
  currentMod = MODS.find(m => m.id === modId);
  if (!currentMod) return;
  const m = currentMod;
  const heroEl = document.getElementById('sc-hero');
  const prevSvg = heroEl.querySelector('svg');
  if (prevSvg) prevSvg.remove();
  heroEl.insertAdjacentHTML('afterbegin', coverArt(m.theme, true));
  heroEl.style.background = `linear-gradient(135deg, ${COVER_BG[m.theme] || '#111'}, #111)`;
  document.getElementById('sc-breadname').textContent = m.name;
  document.getElementById('sc-title').textContent = m.name;
  document.getElementById('sc-dev').textContent = m.dev;
  const raisedPct = Math.round((m.raised / m.goal) * 100);
  document.getElementById('sc-hero-actions').innerHTML = m.progress === 100
    ? `<a class="btn btn-download" href="${m.downloadUrl}" target="_blank" onclick="event.stopPropagation()">
        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.4"><polyline points="6.5,2 6.5,9"/><polyline points="3,6.5 6.5,10 10,6.5"/><line x1="2" y1="11.5" x2="11" y2="11.5"/></svg>
        Descarca
       </a>`
    : `<button class="btn btn-locked" disabled>
        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5.5" width="7" height="6" rx="1"/><path d="M4.5 5.5V4a2 2 0 014 0v1.5"/></svg>
        Indisponibil
       </button>`;
  const remaining = Math.max(0, m.goal - m.raised);
  document.getElementById('sc-stats-row').innerHTML = `
    <div class="sc-stat-box"><div class="sc-stat-val" style="color:var(--green)">${m.raised} EUR</div><div class="sc-stat-label">Fond strans</div></div>
    <div class="sc-stat-box"><div class="sc-stat-val">${m.goal} EUR</div><div class="sc-stat-label">Goal total</div></div>
    <div class="sc-stat-box"><div class="sc-stat-val" style="color:var(--amber)">${remaining} EUR</div><div class="sc-stat-label">Ramas de strans</div></div>`;
  const fillCls = { done:'fill-green', wip:'fill-accent', early:'fill-dim' }[m.status];
  document.getElementById('sc-prog-block').innerHTML = `
    <div class="sc-prog-header"><div class="sc-prog-title">Progres proiect</div><div class="sc-prog-pct">${m.progress}<small style="font-size:12px;font-weight:500;color:var(--text-3)">%</small></div></div>
    <div class="sc-pbar-row"><div class="sc-pbar-label">Dublat</div><div class="sc-pbar-outer"><div class="sc-pbar-inner ${fillCls}" style="width:${m.progress}%"></div></div><div class="sc-pbar-val">${m.progress}%</div></div>
    <div class="sc-pbar-row"><div class="sc-pbar-label">Fond strans</div><div class="sc-pbar-outer"><div class="sc-pbar-inner fill-accent" style="width:${Math.min(raisedPct,100)}%"></div></div><div class="sc-pbar-val">${raisedPct}%</div></div>`;
  document.getElementById('sc-authors-row').innerHTML = m.authors.map(a => authorChip(a)).join('');
  document.getElementById('sc-desc').textContent = m.description;
  renderScFilesTab(m);
  renderScTodoTab(m);
  renderScMissionsTab(m);
  renderScNpcTab(m);
  switchScTabById('scp-overview');
  const back = document.getElementById('showcase-back');
  const panel = document.getElementById('showcase-panel');
  back.classList.add('open');
  requestAnimationFrame(() => panel.classList.add('open'));
  document.body.style.overflow = 'hidden';
}

function closeShowcase() {
  if (activeSrc) { try { activeSrc.stop(); } catch(e) {} activeSrc = null; }
  if (activePlayerId) { updatePlayerState(activePlayerId, false); activePlayerId = null; }
  const back = document.getElementById('showcase-back');
  const panel = document.getElementById('showcase-panel');
  panel.classList.remove('open');
  setTimeout(() => { back.classList.remove('open'); document.body.style.overflow = ''; }, 280);
  currentMod = null;
}

function handleShowcaseBackdrop(e) {
  if (e.target === document.getElementById('showcase-back')) closeShowcase();
}

function switchScTab(panelId, btn) {
  document.querySelectorAll('.sc-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sc-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');
  btn.classList.add('active');
}

function switchScTabById(panelId) {
  document.querySelectorAll('.sc-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sc-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');
  const map = { 'scp-overview':0, 'scp-cutscenes':1, 'scp-missions':2, 'scp-npc':3 };
  const tabs = document.querySelectorAll('.sc-tab');
  if (tabs[map[panelId]]) tabs[map[panelId]].classList.add('active');
}

function renderScFilesTab(m) {
  const container = document.getElementById('sc-filetree');
  if (!m.cutsceneDone.length) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-3);font-size:13px">Niciun cutscene dublat inca.</div>';
    return;
  }
  let html = `<div class="ftree"><div class="ftree-head"><span><strong>${m.cutsceneDone.length}</strong> cutscene-uri dublate</span><span>Ultima modificare</span></div>`;
  m.cutsceneDone.forEach((f, i) => {
    const pid = m.id + '-' + i;
    const fb = (feedbacks[m.id] || {})[f.name];
    let fsPill = fb
      ? `<span class="f-status status-pill ${{ok:'pill-done',rework:'pill-wip',bad:'pill-early'}[fb.type]||'pill-early'}">${{ok:'Aprobat',rework:'Revizuire',bad:'Problema'}[fb.type]||'—'}</span>`
      : `<span class="f-status status-pill pill-done">Dublat</span>`;
    html += `
      <div class="frow" onclick="openFb('${f.name}','${m.id}')">
        <div class="frow-name"><svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="var(--text-3)" stroke-width="1.2" style="margin-right:6px;vertical-align:middle"><path d="M2 2h6l2 2v7H2z"/></svg>${f.name}</div>
        ${fsPill}
        ${makeAudioPlayer(f.name, pid)}
        <div class="f-commit">${f.commit}</div>
        <div class="f-date">${f.date}</div>
      </div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderScTodoTab(m) {
  const container = document.getElementById('sc-todotree');
  if (!m.cutsceneTodo.length) {
    container.innerHTML = `<div style="padding:32px;text-align:center"><div style="font-size:13px;font-weight:600;margin-bottom:6px;color:var(--green)">Toate cutscene-urile au fost dublate</div><div style="font-size:12px;color:var(--text-3)">Proiectul este complet pentru acest joc.</div></div>`;
    return;
  }
  let html = `<div class="ftree"><div class="ftree-head"><span><strong>${m.cutsceneTodo.length}</strong> cutscene-uri ramase</span><span>Status</span></div>`;
  m.cutsceneTodo.forEach(f => {
    html += `<div class="frow"><div class="frow-name frow-name-muted"><svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="var(--text-3)" stroke-width="1.2" style="margin-right:6px;vertical-align:middle"><path d="M2 2h6l2 2v7H2z" stroke-dasharray="2 1"/></svg>${f}</div><span class="f-status status-pill pill-early">Asteptare</span></div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderScMissionsTab(m) {
  const total = m.missionLines.done + m.missionLines.todo;
  const pct = total ? Math.round((m.missionLines.done / total) * 100) : 0;
  document.getElementById('sc-missions').innerHTML = `
    <div class="cat-stat-block">
      <div class="cat-stat-top"><div class="cat-stat-title">Replici din misiuni</div><div class="cat-stat-big">${m.missionLines.done}<span class="of"> / ${total}</span></div></div>
      <div class="prog-bar-wrap"><div class="prog-bar-fill fill-accent" style="width:${pct}%"></div></div>
      <div class="cat-stat-note">Liniile personajelor implicate in misiuni in timp ce te joci — ${pct}% dublate pana acum.</div>
    </div>`;
}

function renderScNpcTab(m) {
  const total = m.npc.done + m.npc.todo;
  const pct = total ? Math.round((m.npc.done / total) * 100) : 0;
  document.getElementById('sc-npc').innerHTML = `
    <div class="cat-stat-block">
      <div class="cat-stat-top"><div class="cat-stat-title">Replici NPC</div><div class="cat-stat-big">${m.npc.done}<span class="of"> / ${total}</span></div></div>
      <div class="prog-bar-wrap"><div class="prog-bar-fill fill-accent" style="width:${pct}%"></div></div>
      <div class="cat-stat-note">Replicile ambientale ale personajelor de fundal din lumea jocului — ${pct}% dublate pana acum.</div>
    </div>`;
}

// ── FEEDBACK ───────────────────────────────────────────────────────────────
function openFb(filename, gameId) {
  fbFile = filename; fbGame = gameId; fbType = null;
  document.getElementById('fb-fname').textContent = filename;
  document.getElementById('fb-note').value = '';
  document.querySelectorAll('.fb-opt').forEach(o => o.classList.remove('sel'));
  const stored = (feedbacks[gameId] || {})[filename];
  if (stored) {
    document.getElementById('fb-note').value = stored.note || '';
    const el = document.querySelector(`.fb-${stored.type === 'ok' ? 'ok' : stored.type === 'rework' ? 'rw' : 'bad'}`);
    if (el) { el.classList.add('sel'); fbType = stored.type; }
  }
  document.getElementById('fb-modal').classList.add('open');
}
function pickFb(el, type) {
  document.querySelectorAll('.fb-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel'); fbType = type;
}
function closeFb() {
  document.getElementById('fb-modal').classList.remove('open');
  fbFile = null; fbGame = null; fbType = null;
}
function handleFbBackdrop(e) { if (e.target === document.getElementById('fb-modal')) closeFb(); }
function submitFb() {
  if (!fbType) { showToast('Selecteaza un tip de feedback.'); return; }
  if (!feedbacks[fbGame]) feedbacks[fbGame] = {};
  feedbacks[fbGame][fbFile] = { type: fbType, note: document.getElementById('fb-note').value.trim() };
  closeFb();
  if (currentMod && currentMod.id === fbGame) renderScFilesTab(currentMod);
  showToast('Feedback trimis. Multumim!');
}

/// ── URL ROUTING (hash-based) ───────────────────────────────────────────────
const ROUTE_MAP = {
  '':              { type: 'page',    id: 'home' },
  'home':          { type: 'page',    id: 'home' },
  'proiecte':      { type: 'page',    id: 'products' },
  'servicii':      { type: 'page',    id: 'servicii' },
  'despre':        { type: 'page',    id: 'about' },
  'confidentialitate': { type: 'page', id: 'privacy' },
  'termeni':       { type: 'page',    id: 'terms' },
  'jocuri':        { type: 'subpage', id: 'jocuri' },
};

function resolveRoute() {
  const hash = window.location.hash.replace('#', '').replace(/^\//, '');
  const route = ROUTE_MAP[hash] || ROUTE_MAP[''];
  if (route.type === 'subpage') {
    _activateSubPage(route.id, false);
  } else {
    _activatePage(route.id, false);
  }
}

function _activatePage(pageId, pushState = true) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + pageId);
  if (el) el.classList.add('active');
  const navMap = { home:'ni-home', products:'ni-products', servicii:'ni-servicii', about:'ni-about', privacy:null, terms:null };
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navId = navMap[pageId];
  if (navId) document.getElementById(navId).classList.add('active');
  closeAllDds();
  if (pushState) {
    const urlMap = { home:'', products:'proiecte', servicii:'servicii', about:'despre', privacy:'confidentialitate', terms:'termeni' };
    const hash = urlMap[pageId] || '';
    history.pushState({ pageId }, '', hash ? '#' + hash : '#');
  }
}

function _activateSubPage(sub, pushState = true) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + sub);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('ni-other').classList.add('active');
  closeAllDds();
  if (pushState) {
    const urlMap = { jocuri: 'jocuri' };
    history.pushState({ sub }, '', '#' + (urlMap[sub] || sub));
  }
}

function showPage(pageId) { _activatePage(pageId, true); }
function showSubPage(sub) { _activateSubPage(sub, true); }

window.addEventListener('hashchange', resolveRoute);
window.addEventListener('popstate', resolveRoute);

// ── NAV UTILS ─────────────────────────────────────────────────────────────
function toggleDd(id, btn) {
  const dd = document.getElementById(id);
  const open = dd.classList.contains('open');
  closeAllDds();
  if (!open) { dd.classList.add('open'); btn.classList.add('open'); }
}
function closeAllDds() {
  document.querySelectorAll('.nav-dd').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('open'));
}
document.addEventListener('click', e => { if (!e.target.closest('.nav-item')) closeAllDds(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const sc = document.getElementById('showcase-panel');
    if (sc && sc.classList.contains('open')) { closeShowcase(); return; }
    closeFb(); closeAllDds();
  }
});

// ── TOAST ──────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── COOKIE BANNER ──────────────────────────────────────────────────────────
function initCookieBanner() {
  const choice = localStorage.getItem('fd_cookie_choice');
  if (choice !== null) return;
  const banner = document.getElementById('cookie-banner');
  if (banner) banner.classList.add('visible');
}
function setCookieChoice(accepted) {
  localStorage.setItem('fd_cookie_choice', accepted ? '1' : '0');
  const banner = document.getElementById('cookie-banner');
  if (banner) {
    banner.classList.remove('visible');
    banner.classList.add('hiding');
    setTimeout(() => banner.remove(), 400);
  }
}

// ── INIT ───────────────────────────────────────────────────────────────────
renderMods();
document.getElementById('copy-year').textContent = new Date().getFullYear();
resolveRoute();
initCookieBanner();