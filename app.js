/* ============================================================
   FREE TV — FIFA WORLD CUP 2026 EDITION
   app.js — Live streaming with HLS.js + quality control + PiP
   ============================================================ */

// MATCH SCHEDULE IS NOW FETCHED DYNAMICALLY VIA API

// ────────────────────────────────────────────────────────────
// CHANNEL DATA
// ────────────────────────────────────────────────────────────
const CHANNELS = [
  {
    id: 'rtb-go',
    name: 'RTB Go live',
    emoji: '📺',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxsoXoKYsS_leK30qY252Jsrt0HDnXMRpezWD8TRtZzA&s=10',
    url: 'https://d1211whpimeups.cloudfront.net/smil:rtbgo/chunklist_b4096000_slENG.m3u8',
    quality: '1080p',
    protocol: 'HLS Proxy',
    color: 'linear-gradient(135deg, rgba(20,20,200,0.15), rgba(10,10,100,0.05))',
    language: 'English',
    category: 'Sports',
    description: 'RTB Go Live Stream'
  },
  {
    id: 't-sports',
    name: 'T Sports',
    emoji: '📺',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzV2mfuaWiI0HdxWZlS5_Q4i7ZOfZnpoy3Gw&s',
    url: 'http://198.195.239.50:8095/tsports/tracks-v1a1/mono.m3u8',
    quality: '480p',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(200,20,20,0.15), rgba(100,10,10,0.05))',
    language: 'English',
    category: 'Sports',
    description: 'T Sports Live Stream'
  },
  {
    id: 'caze-tv',
    name: 'Caze TV',
    emoji: '📺',
    logo: 'https://images.seeklogo.com/logo-png/61/2/cazetv-logo-png_seeklogo-619708.png',
    url: 'https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/1080p-vtt/index.m3u8',
    quality: '1080p HLS',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(79,172,254,0.15), rgba(0,242,254,0.05))',
    language: 'Portuguese',
    category: 'Sports',
    description: 'Brazilian Sports',
  },
  {
    id: 'd-sports',
    name: 'D Sports',
    emoji: '🎯',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/DSports.png',
    url: 'https://1nyaler.streamhostingcdn.top/stream/106/index.m3u8',
    quality: 'HD HLS',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,60,172,0.05))',
    language: 'Spanish',
    category: 'Sports',
    description: 'D Sports Live',
  },
  {
    id: 'tyc-sports',
    name: 'TyC Sports',
    emoji: '🇦🇷',
    url: 'https://1nyaler.streamhostingcdn.top/stream/84/index.m3u8',
    quality: 'HD HLS',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(116,172,223,0.15), rgba(255,255,255,0.05))',
    language: 'Spanish',
    category: 'Sports',
    description: 'TyC Sports Live',
  },
  {
    id: 'tsn-sports',
    name: 'TSN Sports',
    emoji: '🍁',
    logo: 'https://iconlogovector.com/uploads/images/2025/03/lg-67d80052de144-TSN.webp',
    url: 'https://d1kji91sh94cnz.cloudfront.net/newi/1/fronts.woff2?2d4710',
    quality: 'HD HLS',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(230,0,0,0.15), rgba(255,100,100,0.05))',
    language: 'English',
    category: 'Sports',
    description: 'TSN Sports Live',
  },

  {
    id: 'bein-sports',
    name: 'Bein Sports',
    emoji: '⚽',
    logo: 'https://logowik.com/content/uploads/images/bein-sports-png2285.logowik.com.webp',
    url: 'https://1nyaler.streamhostingcdn.top/stream/23/index.m3u8',
    quality: '1080p',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(0,200,255,0.12), rgba(79,172,254,0.05))',
    language: 'French',
    category: 'Football',
    description: 'Bein Sports Live',
  },
  {
    id: 'win-sports',
    name: 'Win Sports',
    emoji: '🏅',
    logo: 'https://logowik.com/content/uploads/images/win-sports6956.logowik.com.webp',
    url: 'https://1nyaler.streamhostingcdn.top/stream/32/index.m3u8',
    quality: '4K',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(138,43,226,0.12), rgba(255,107,53,0.05))',
    language: 'Spanish',
    category: 'Sports',
    description: 'Win Sports Live',
  },
  {
    id: 'bein-xtra',
    name: 'BeIN Xtra',
    emoji: '🔴',
    logo: 'https://assets.goal.com/images/v3/blt0da91b1c9b8e431d/bein%20sports%20xtra%20logo.jpg',
    url: 'https://bein-xtra-bein.amagi.tv/playlistR480p.m3u8',
    quality: '720p',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(239,68,68,0.05))',
    language: 'English',
    category: 'Sports',
    description: 'BeIN Xtra Live',
  },
  {
    id: 'thiendinh-tv',
    name: 'Thiendinh TV China',
    emoji: '🇨🇳',
    url: 'https://tfwr3gr3uomttgr31hp3tfa3dqmmeqfsg17uff3hsnhuqcp1ghmucpf5gk.100ycdn.com/hqlive.yarncdn.live/live/hqtv_blv_phanma/playlist.m3u8?wsSession=a5e3e6436986f485e3e3662e-178154316934606&wsIPSercert=309a27e401f36b37ea68d1183414e973&wsBindIP=2&wsserid=1168201446952453455',
    quality: 'HD HLS',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(239,68,68,0.05))',
    language: 'English',
    category: 'Sports',
    description: 'Thiendinh TV China Live',
  },

  {
    id: 'cctv-china',
    name: 'CCTV China',
    emoji: '🇨🇳',
    logo: 'https://variety.com/wp-content/uploads/2020/12/CCTV-logo.jpg?w=1000&h=575&crop=1',
    url: 'https://live12.szyac.com/live/85042987.m3u8',
    quality: '1080p',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(239,68,68,0.05))',
    language: 'Chinese',
    category: 'Sports',
    description: 'CCTV China Live',
  },
  {
    id: 'somoy-tv',
    name: 'Somoy TV',
    emoji: '📰',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZzSj1cK5jkXileb7UvL4qNnAcgfCVLqzLtg&s',
    url: 'https://live.thebosstv.com:30443/dwlive/Somoy-TV/chunks.m3u8',
    quality: '720p',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(255,87,34,0.15), rgba(255,193,7,0.05))',
    language: 'Bangla',
    category: 'News',
    description: 'Somoy TV Live',
  },
  {
    id: 'colatv99',
    name: 'ColaTV99.live',
    emoji: '🥤',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDEQTi-4cJT_kfdTZ6pYsB2a2NB5iyPEO3aA&s',
    url: 'https://live05.msdht.app/live/24561735.m3u8',
    quality: 'HD HLS',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(244,67,54,0.15), rgba(233,30,99,0.05))',
    language: 'English',
    category: 'Sports',
    description: 'ColaTV 99 Live Stream',
  },
  {
    id: 'z-bangla',
    name: 'Z Bangla',
    emoji: '📺',
    logo: 'https://yt3.googleusercontent.com/3_f350mZQuocm7Lx2eASxHJHG5s5ynrrD0cQaIMeUMpDSYyz29J5FCHqnl14AXsV19D71qDUdg=s900-c-k-c0x00ffffff-no-rj',
    url: 'https://d1g8wgjurz8via.cloudfront.net/bpk-tv/ColorsHD/default/ColorsHD-video=2137600.m3u8',
    quality: '720p',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(255,152,0,0.15), rgba(255,87,34,0.05))',
    language: 'Bangla',
    category: 'Entertainment',
    description: 'Z Bangla Live',
  },
  {
    id: 'fifa-plus-us',
    name: 'FIFA+ (Samsung TV Plus)',
    emoji: '⚽',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/FIFA%2B_%282025%29.svg/960px-FIFA%2B_%282025%29.svg.png',
    url: 'https://d2w9q46ikgrcwx.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-of5cbk3sav3w5/v1/sysdata_s_p_a_fifa_7/samsungheadend_us/latest/main/hls/playlist.m3u8',
    quality: '360p - 720p',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(0,0,255,0.15), rgba(0,0,100,0.05))',
    language: 'English',
    category: 'Sports',
    description: 'FIFA+ Live (Master Playlist)',
  },

  {
    id: 'fussball-tv-1',
    name: 'Fussball .TV 1',
    emoji: '⚽',
    logo: 'https://statics.foxsports.com/www.foxsports.com/content/uploads/2023/05/IMG_6227.png',
    url: 'https://rajutv.pages.dev/hls?url=http%3A%2F%2Fpremiumtvs.space%3A80%2Flive%2F1Aoen7elp5%2FIgMJ60tmAa%2F742610.ts',
    quality: '1080p',
    protocol: 'HLS Proxy',
    color: 'linear-gradient(135deg, rgba(200,50,50,0.15), rgba(100,0,0,0.05))',
    language: 'German',
    category: 'Sports',
    description: 'FIFA WM 2026',
  },
  {
    id: 'fussball-tv-1-uhd',
    name: 'Fussball.TV1 (UHD/4K)',
    emoji: '⚽',
    logo: 'https://statics.foxsports.com/www.foxsports.com/content/uploads/2023/05/IMG_6227.png',
    url: 'https://rajutv.pages.dev/hls?url=http%3A%2F%2Fpremiumtvs.space%3A80%2Flive%2F1Aoen7elp5%2FIgMJ60tmAa%2F745269.ts',
    quality: 'UHD/4K',
    protocol: 'HLS Proxy',
    color: 'linear-gradient(135deg, rgba(200,50,50,0.15), rgba(100,0,0,0.05))',
    language: 'German',
    category: 'Sports',
    description: 'FIFA WM 2026 4K',
  },
  {
    id: 'dazn-tv',
    name: 'DA ZN tv',
    emoji: '📺',
    logo: 'https://d1sgwhnao7452x.cloudfront.net/dazn-og.jpg',
    url: 'https://1nyaler.streamhostingcdn.top/stream/94/index.m3u8',
    quality: '1080p',
    protocol: 'HLS',
    color: 'linear-gradient(135deg, rgba(255,255,0,0.15), rgba(200,200,0,0.05))',
    language: 'Spanish',
    category: 'Sports',
    description: 'DAZN Sports Live',
  },
  {
    id: 'ss-world-cup-central',
    name: 'SS World Cup Central',
    emoji: '⚽',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8iKfA2WuJVsdI3zhiC34VwCjskg7sipKZnw&s',
    url: 'https://rajutv.pages.dev/hls?url=http%3A%2F%2Fpremiumtvs.space%3A80%2Flive%2F1Aoen7elp5%2FIgMJ60tmAa%2F745149.ts',
    quality: '720p',
    protocol: 'HLS Proxy',
    color: 'linear-gradient(135deg, rgba(0,200,100,0.15), rgba(0,100,50,0.05))',
    language: 'English',
    category: 'Sports',
    description: 'World Cup Central Broadcast',
  },
];

// ────────────────────────────────────────────────────────────
// STATE
// ────────────────────────────────────────────────────────────
const socket = io();
let hlsInstance = null;
let mpegtsInstance = null;
let currentChannel = null;
let currentQuality = 'auto';
let isMuted = false;
let retryCount = 0;
const MAX_RETRIES = 3;

// ────────────────────────────────────────────────────────────
// DOM REFS
// ────────────────────────────────────────────────────────────
const video = document.getElementById('mainVideo');
const videoOverlay = document.getElementById('videoOverlay');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorOverlay = document.getElementById('errorOverlay');
const customControls = document.getElementById('customControls');
const nowPlayingName = document.getElementById('nowPlayingName');
const playIcon = document.getElementById('playIcon');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const qualityBtn = document.getElementById('qualityBtn');
const qualityMenu = document.getElementById('qualityMenu');
const connectionStatus = document.getElementById('connectionStatus');
const resolutionInfo = document.getElementById('resolutionInfo');
const bitrateInfo = document.getElementById('bitrateInfo');
const protocolInfo = document.getElementById('protocolInfo');
const channelsGrid = document.getElementById('channelsGrid');
const sidebarChannels = document.getElementById('sidebarChannels');
const errorMsg = document.getElementById('errorMsg');

// ────────────────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderChannelCards();
  renderSidebarChannels();
  renderSchedule();
  initParticles();
  initHeaderScroll();
  initTimer();
  initVideoEvents();
  setVolume(80);
  createToastContainer();
});

// ────────────────────────────────────────────────────────────
// RENDER CHANNEL CARDS
// ────────────────────────────────────────────────────────────
function renderChannelCards() {
  channelsGrid.innerHTML = '';
  const limit = window.innerWidth <= 768 ? 5 : 16;

  const createCard = (ch) => {
    const card = document.createElement('div');
    card.className = 'channel-card';
    card.id = `card-${ch.id}`;
    card.onclick = () => playChannel(ch);
    const mediaHtml = ch.logo
      ? `<img src="${ch.logo}" alt="${ch.name}" class="card-logo-img">`
      : `<div class="card-emoji">${ch.emoji}</div>`;
    card.innerHTML = `
      ${mediaHtml}
      <div class="card-name">${ch.name}</div>
      <div style="display: flex; gap: 8px; align-items: center; justify-content: center; flex-wrap: wrap;">
        <div class="card-live-badge">
          <span class="card-live-dot"></span>
          LIVE
        </div>
        ${ch.hot ? '<div class="card-hot-badge">🔥 HOT</div>' : ''}
      </div>
      <div class="card-quality">${ch.quality} · ${ch.language} · ${ch.category}</div>
      <button class="card-watch-btn">▶ Watch Live</button>
    `;
    return card;
  };

  CHANNELS.slice(0, limit).forEach(ch => channelsGrid.appendChild(createCard(ch)));

  if (CHANNELS.length > limit) {
    const moreWrap = document.createElement('div');
    moreWrap.id = 'channels-more';
    moreWrap.style.display = 'none'; // Hidden by default
    CHANNELS.slice(limit).forEach(ch => moreWrap.appendChild(createCard(ch)));
    channelsGrid.appendChild(moreWrap);

    const btnWrap = document.createElement('div');
    btnWrap.style.gridColumn = '1 / -1';
    btnWrap.style.display = 'flex';
    btnWrap.style.justifyContent = 'center';
    btnWrap.style.margin = '10px 0 20px';

    const btn = document.createElement('button');
    btn.className = 'see-more-btn';
    btn.textContent = 'See More Live Channels';
    btn.onclick = () => {
      moreWrap.style.display = 'contents'; // Integrates perfectly into parent grid
      btnWrap.style.display = 'none';
    };
    btnWrap.appendChild(btn);
    channelsGrid.appendChild(btnWrap);
  }
}

function renderSidebarChannels() {
  sidebarChannels.innerHTML = '';
  CHANNELS.forEach(ch => {
    const item = document.createElement('div');
    item.className = 'sidebar-item';
    item.id = `sidebar-${ch.id}`;
    item.onclick = () => playChannel(ch);
    const mediaHtml = ch.logo
      ? `<img src="${ch.logo}" alt="${ch.name}" class="sidebar-logo-img">`
      : `<span class="sidebar-item-emoji">${ch.emoji}</span>`;
    item.innerHTML = `
      ${mediaHtml}
      <div>
        <div class="sidebar-item-name" style="display: flex; align-items: center; gap: 6px; justify-content: center;">
          ${ch.name} ${ch.hot ? '<span class="sidebar-hot-icon" title="Hot Channel">🔥</span>' : ''}
        </div>
        <div class="sidebar-item-quality">${ch.quality} · ${ch.language}</div>
      </div>
    `;
    sidebarChannels.appendChild(item);
  });
}

// ────────────────────────────────────────────────────────────
// RENDER SCHEDULE
// ────────────────────────────────────────────────────────────
function renderApiMatchCard(event) {
  const competition = event.competitions?.[0];
  if (!competition) return '';
  const competitors = competition.competitors || [];
  const home = competitors.find(c => c.homeAway === 'home') || competitors[0] || {};
  const away = competitors.find(c => c.homeAway === 'away') || competitors[1] || {};

  const state = event.status?.type?.state || 'pre';
  const scoreH = home.score ?? '–';
  const scoreA = away.score ?? '–';
  const homeName = home.team?.shortDisplayName || home.team?.displayName || '?';
  const awayName = away.team?.shortDisplayName || away.team?.displayName || '?';
  const homeAbbr = home.team?.abbreviation || '';
  const awayAbbr = away.team?.abbreviation || '';

  const groupName = event.season?.type === 1 ? 'Group Stage' : 'Knockout Stage';
  const dateStr = new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  let statusClass = 'upcoming';
  let statusLabel = 'UPCOMING';
  if (state === 'in') { statusClass = 'live'; statusLabel = '<span class="match-status-dot"></span> LIVE'; }
  else if (state === 'post') { statusClass = 'finished'; statusLabel = 'FULL TIME'; }

  const scoreBlock = state === 'pre'
    ? `<div class="match-vs">VS</div><div class="card-timer" data-datetime="${event.date}"></div>`
    : `<div class="match-score">${scoreH} – ${scoreA}</div><div class="match-time-detail">${state === 'in' ? (event.status?.displayClock || 'LIVE') : 'FT'}</div>`;

  // Safely use getFlag from scoreboard.js if available
  const flagHome = typeof getFlag !== 'undefined' ? getFlag(homeAbbr) : '⚽';
  const flagAway = typeof getFlag !== 'undefined' ? getFlag(awayAbbr) : '⚽';

  return `
    <div class="match-card">
      <div class="match-status ${statusClass}">${statusLabel}</div>
      <div class="match-teams">
        <div class="match-team">
          <div class="team-flag">${flagHome}</div>
          <div class="team-name">${homeName}</div>
        </div>
        <div class="match-score-wrap">${scoreBlock}</div>
        <div class="match-team">
          <div class="team-flag">${flagAway}</div>
          <div class="team-name">${awayName}</div>
        </div>
      </div>
      <div class="match-meta">
        <span class="match-group">${competition?.notes?.[0]?.headline || groupName}</span>
        <span class="match-datetime">${dateStr}</span>
      </div>
    </div>
  `;
}

async function renderSchedule() {
  const grid = document.getElementById('scheduleGrid');
  if (!grid) return;

  grid.innerHTML = '<div style="grid-column: 1 / -1; display:flex; justify-content:center; align-items:center; height:200px;"><div class="loader-ring"></div></div>';

  try {
    const res = await fetch('/api/schedule?dates=20260611-20260719');
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    const events = data.events || [];

    // Sort events sequentially
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    const past = events.filter(e => e.status?.type?.state === 'post').reverse();
    const upcoming = events.filter(e => e.status?.type?.state !== 'post');

    let html = '';

    const pastLimit = window.innerWidth <= 768 ? 3 : 8;
    if (past.length > 0) {
      html += `<div style="grid-column: 1 / -1; color: var(--gold); font-size: 1.4rem; font-weight: 800; font-family: var(--font-display); letter-spacing: 2px; margin-top: 10px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 10px;">
        <span style="opacity: 0.5;">⚽</span> PAST MATCHES
      </div>`;
      html += past.slice(0, pastLimit).map(renderApiMatchCard).join('');
      if (past.length > pastLimit) {
        html += `<div id="past-more" style="display:none; grid-column: 1 / -1;">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; width: 100%;" class="nested-grid-mobile">
            ${past.slice(pastLimit).map(renderApiMatchCard).join('')}
          </div>
        </div>`;
        html += `<div id="past-btn-wrap" style="grid-column: 1 / -1; display:flex; justify-content:center; margin: 10px 0 20px;">
          <button class="see-more-btn" onclick="document.getElementById('past-more').style.display='block'; this.parentElement.style.display='none';">See More Past Matches</button>
        </div>`;
      }
    }

    const upLimit = window.innerWidth <= 768 ? 3 : 8;
    if (upcoming.length > 0) {
      html += `<div style="grid-column: 1 / -1; color: var(--gold); font-size: 1.4rem; font-weight: 800; font-family: var(--font-display); letter-spacing: 2px; margin-top: 40px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 10px;">
        <span style="opacity: 0.5;">⏱️</span> UPCOMING MATCHES
      </div>`;
      html += upcoming.slice(0, upLimit).map(renderApiMatchCard).join('');
      if (upcoming.length > upLimit) {
        html += `<div id="upcoming-more" style="display:none; grid-column: 1 / -1;">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; width: 100%;" class="nested-grid-mobile">
            ${upcoming.slice(upLimit).map(renderApiMatchCard).join('')}
          </div>
        </div>`;
        html += `<div id="upcoming-btn-wrap" style="grid-column: 1 / -1; display:flex; justify-content:center; margin: 10px 0 20px;">
          <button class="see-more-btn" onclick="document.getElementById('upcoming-more').style.display='block'; this.parentElement.style.display='none';">See More Upcoming Matches</button>
        </div>`;
      }
    }

    grid.innerHTML = html || '<p style="grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.5);">No matches scheduled yet.</p>';

    // Initialize Hero Timer with the next scheduled match
    const nextPreMatch = upcoming.find(e => e.status?.type?.state === 'pre');
    if (nextPreMatch && typeof initTimer === 'function') {
      const comp = nextPreMatch.competitions?.[0] || {};
      const competitors = comp.competitors || [];
      const home = competitors.find(c => c.homeAway === 'home') || competitors[0] || {};
      const away = competitors.find(c => c.homeAway === 'away') || competitors[1] || {};
      const hName = home.team?.shortDisplayName || home.team?.displayName || '?';
      const aName = away.team?.shortDisplayName || away.team?.displayName || '?';
      const grp = comp.notes?.[0]?.headline || 'World Cup Match';
      initTimer({
        home: hName,
        away: aName,
        group: grp,
        date: nextPreMatch.date
      });
    }
  } catch (err) {
    console.error('Schedule fetch error:', err);
    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--red); padding: 40px;">Failed to load tournament calendar from API.</div>';
  }
}

// ────────────────────────────────────────────────────────────
// PLAY CHANNEL
// ────────────────────────────────────────────────────────────
function playChannel(channel) {
  if (currentChannel?.id === channel.id) {
    // If same channel, just scroll to player
    scrollToPlayer();
    return;
  }

  currentChannel = channel;
  retryCount = 0;

  // Track viewer in real-time
  socket.emit('join_channel', channel.id);
  const viewersEl = document.getElementById('channelViewers');
  if (viewersEl) viewersEl.style.display = 'inline-block';
  const vCountEl = document.getElementById('channelViewerCount');
  if (vCountEl) vCountEl.innerText = '1';

  // Update UI highlights
  document.querySelectorAll('.channel-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(c => c.classList.remove('active'));
  const card = document.getElementById(`card-${channel.id}`);
  const sidebar = document.getElementById(`sidebar-${channel.id}`);
  if (card) card.classList.add('active');
  if (sidebar) sidebar.classList.add('active');

  nowPlayingName.textContent = channel.name;
  protocolInfo.textContent = channel.protocol;
  document.getElementById('languageInfo').textContent = channel.language || 'English';

  hideAllOverlays();
  showLoading(true);

  // Destroy previous HLS/mpegts
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
  if (mpegtsInstance) {
    mpegtsInstance.destroy();
    mpegtsInstance = null;
  }

  let url = channel.url;

  // Determine stream type
  const isHLS = url.includes('.m3u8') || url.includes('/tracks-v') || url.includes('/hls?');
  const isTS = url.endsWith('.ts') && !isHLS;

  // If it is a raw TS file, we route it through our proxy to avoid CORS
  if (isTS) {
    // If running on a server that has /proxy, use it. Otherwise fallback to raw url.
    if (window.location.protocol.startsWith('http')) {
      url = `/proxy?url=${encodeURIComponent(url)}`;
    }
    loadWithMpegts(url, channel);
  } else if (isHLS) {
    if (Hls.isSupported()) {
      loadWithHLS(url, channel);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      loadNative(url, channel);
    } else {
      showError('HLS is not supported on this browser. Try Chrome or Firefox.');
      return;
    }
  } else {
    loadNative(url, channel);
  }

  scrollToPlayer();
  showToast(`📺 Loading ${channel.name}…`, 'info');
}

function loadWithMpegts(url, channel) {
  if (mpegts.getFeatureList().mseLivePlayback) {
    mpegtsInstance = mpegts.createPlayer({
      type: 'ts',
      isLive: true,
      url: url,
      hasAudio: false // Disable audio to test if an unsupported audio codec is crashing the player
    });

    mpegtsInstance.attachMediaElement(video);
    mpegtsInstance.load();

    mpegtsInstance.on(mpegts.Events.ERROR, (errorType, errorDetail, errorInfo) => {
      console.error('mpegts error:', errorType, errorDetail, errorInfo);
      handleMpegtsError(errorType, channel);
    });

    video.play().then(() => {
      showLoading(false);
      showControls(true);
      connectionStatus.textContent = 'Connected ✓';
      resolutionInfo.textContent = channel.quality;
      bitrateInfo.textContent = 'Auto';
      showToast(`✅ Now watching ${channel.name}`, 'success');
    }).catch(e => {
      // Auto-play might be blocked
    });
  } else {
    showError('Your browser does not support raw TS playback.');
  }
}

function handleMpegtsError(errorType, channel) {
  if (retryCount < MAX_RETRIES) {
    retryCount++;
    showToast(`⚡ Reconnecting… (${retryCount}/${MAX_RETRIES})`, 'info');
    setTimeout(() => {
      if (mpegtsInstance) {
        mpegtsInstance.unload();
        mpegtsInstance.load();
        mpegtsInstance.play();
      }
    }, 2000 * retryCount);
  } else {
    showLoading(false);
    showError('Network error: The stream could not be reached or CORS was blocked.');
  }
}

// Check if a codec string contains HEVC/H.265 (not supported in Chrome/Firefox)
function isHEVCCodec(codecStr) {
  if (!codecStr) return false;
  return codecStr.toLowerCase().includes('hvc1') ||
    codecStr.toLowerCase().includes('hev1') ||
    codecStr.toLowerCase().includes('dvh1') ||
    codecStr.toLowerCase().includes('dvhe');
}

// Find the best H.264 level index (-1 if none found)
function findBestH264Level(levels) {
  // Sort by bitrate descending so we pick the best quality first
  const h264Levels = levels
    .map((l, idx) => ({ l, idx }))
    .filter(({ l }) => !isHEVCCodec(l.videoCodec))
    .sort((a, b) => (b.l.bitrate || 0) - (a.l.bitrate || 0));
  return h264Levels.length ? h264Levels[0].idx : -1;
}

function loadWithHLS(url, channel) {
  const hlsConfig = {
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 60,
    maxBufferLength: 30,
    maxMaxBufferLength: 60,
    // Prefer H.264 over HEVC by filtering at startup
    startLevel: -1,
    autoStartLoad: true,
    xhrSetup(xhr) {
      xhr.withCredentials = false;
    },
  };

  // If protocol asks for proxy, or it's mixed content (HTTP stream on HTTPS site)
  const needsProxy = channel.protocol === 'HLS Proxy' || (window.location.protocol === 'https:' && url.startsWith('http:'));

  if (needsProxy) {
    class ProxyLoader extends Hls.DefaultConfig.loader {
      load(context, config, callbacks) {
        const originalUrl = context.url;
        // Route through our backend proxy
        if (!originalUrl.startsWith('/proxy')) {
          context.url = `/proxy?url=${encodeURIComponent(originalUrl)}`;
        }
        
        const originalOnSuccess = callbacks.onSuccess;
        callbacks.onSuccess = (response, stats, context, networkDetails) => {
          // Trick HLS.js into resolving relative playlist paths against the original external URL
          response.url = originalUrl;
          originalOnSuccess(response, stats, context, networkDetails);
        };
        
        super.load(context, config, callbacks);
      }
    }
    hlsConfig.pLoader = ProxyLoader;
    hlsConfig.fLoader = ProxyLoader;
  }

  const hls = new Hls(hlsConfig);

  hlsInstance = hls;

  hls.loadSource(url);
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
    const levels = data.levels;

    // --- Codec Check: skip HEVC-only streams ---
    const allHEVC = levels.length > 0 && levels.every(l => isHEVCCodec(l.videoCodec));
    const bestH264 = findBestH264Level(levels);

    if (allHEVC) {
      // All levels are HEVC — browser will show black screen
      // Show a codec warning banner but still try to play (audio will work)
      showCodecWarning();
      connectionStatus.textContent = 'HEVC ⚠';
    } else if (bestH264 >= 0 && bestH264 !== hls.currentLevel) {
      // Force switch to best H.264 level to avoid black screen
      hls.currentLevel = bestH264;
    }

    showLoading(false);
    showControls(true);
    updateQualityLevels(levels);
    video.play().catch(() => { });
    connectionStatus.textContent = allHEVC ? 'HEVC ⚠' : 'Connected ✓';
    resolutionInfo.textContent = levels.length ? getMaxResolution(levels) : channel.quality;
    bitrateInfo.textContent = levels.length ? formatBitrate(levels[0].bitrate) : '—';
    if (!allHEVC) showToast(`✅ Now watching ${channel.name}`, 'success');
  });

  hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
    const level = hls.levels[data.level];
    if (level) {
      // If we accidentally switched to an HEVC level, switch back
      if (isHEVCCodec(level.videoCodec)) {
        const alt = findBestH264Level(hls.levels);
        if (alt >= 0) { hls.currentLevel = alt; return; }
      }
      resolutionInfo.textContent = `${level.height}p`;
      bitrateInfo.textContent = formatBitrate(level.bitrate);
    }
  });

  hls.on(Hls.Events.ERROR, (event, data) => {
    handleHLSError(data, channel);
  });
}

// Show a small codec warning inside the player area
function showCodecWarning() {
  // Remove existing warning if any
  const old = document.getElementById('codecWarning');
  if (old) old.remove();

  const warn = document.createElement('div');
  warn.id = 'codecWarning';
  warn.style.cssText = `
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,165,0,0.92);
    color: #000;
    font-weight: 700;
    font-size: 0.78rem;
    padding: 7px 16px;
    border-radius: 999px;
    z-index: 15;
    white-space: nowrap;
    pointer-events: none;
    font-family: Outfit, sans-serif;
    letter-spacing: 0.3px;
  `;
  warn.textContent = '⚠ HEVC stream – video may be black on Chrome. Audio playing.';
  document.getElementById('videoContainer').appendChild(warn);
  // Auto-hide after 8 seconds
  setTimeout(() => warn.remove(), 8000);
}

function loadNative(url, channel) {
  video.src = url;
  video.load();
  video.play()
    .then(() => {
      showLoading(false);
      showControls(true);
      connectionStatus.textContent = 'Connected ✓';
      resolutionInfo.textContent = channel.quality;
      bitrateInfo.textContent = 'Auto';
      showToast(`✅ Now watching ${channel.name}`, 'success');
    })
    .catch(err => {
      showLoading(false);
      showError(`Could not play stream. Error: ${err.message}`);
    });
}

function handleHLSError(data, channel) {
  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          showToast(`⚡ Reconnecting… (${retryCount}/${MAX_RETRIES})`, 'info');
          setTimeout(() => {
            if (hlsInstance) hlsInstance.startLoad();
          }, 2000 * retryCount);
        } else {
          showLoading(false);
          showError('Network error: The stream could not be reached. It may be offline or region-locked.');
        }
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          hlsInstance.recoverMediaError();
          showToast(`🔄 Recovering stream… (${retryCount}/${MAX_RETRIES})`, 'info');
        } else {
          showLoading(false);
          showError('Media decode error. The stream format may be incompatible with your browser.');
        }
        break;
      default:
        showLoading(false);
        showError('An unknown error occurred. Please try another channel.');
        break;
    }
  }
}

// ────────────────────────────────────────────────────────────
// QUALITY CONTROL
// ────────────────────────────────────────────────────────────
function updateQualityLevels(levels) {
  const menu = document.getElementById('qualityMenu');
  // Remove old dynamic options
  const existing = menu.querySelectorAll('.quality-option[data-dynamic]');
  existing.forEach(e => e.remove());

  if (levels && levels.length > 1) {
    const header = menu.querySelector('.quality-menu-header');
    levels.forEach((level, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quality-option';
      btn.setAttribute('data-dynamic', 'true');
      btn.setAttribute('data-level', idx);
      btn.textContent = `🎞 ${level.height}p (${formatBitrate(level.bitrate)})`;
      btn.onclick = () => setQualityLevel(idx);
      menu.appendChild(btn);
    });
  }
}

function toggleQualityMenu() {
  qualityMenu.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.quality-wrap')) {
    qualityMenu.classList.remove('open');
  }
});

function setQuality(q) {
  currentQuality = q;
  qualityMenu.classList.remove('open');

  document.querySelectorAll('.quality-option').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.quality-option[data-quality="${q}"]`)?.classList.add('active');

  if (!hlsInstance) return;

  switch (q) {
    case 'auto':
      hlsInstance.currentLevel = -1;
      qualityBtn.textContent = '⚙ Auto';
      break;
    case '1080':
      setClosestLevel(1080);
      break;
    case '720':
      setClosestLevel(720);
      break;
    case '480':
      setClosestLevel(480);
      break;
    case '360':
      setClosestLevel(360);
      break;
  }
  showToast(`🎮 Quality: ${q === 'auto' ? 'Auto' : q + 'p'}`, 'info');
}

function setQualityLevel(idx) {
  if (!hlsInstance) return;
  hlsInstance.currentLevel = idx;
  const level = hlsInstance.levels[idx];
  qualityBtn.textContent = `⚙ ${level.height}p`;
  qualityMenu.classList.remove('open');

  document.querySelectorAll('.quality-option').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.quality-option[data-level="${idx}"]`)?.classList.add('active');

  showToast(`🎮 Quality: ${level.height}p`, 'info');
}

function setClosestLevel(targetHeight) {
  if (!hlsInstance || !hlsInstance.levels.length) return;
  const levels = hlsInstance.levels;
  let closest = 0;
  let minDiff = Infinity;
  levels.forEach((level, idx) => {
    const diff = Math.abs(level.height - targetHeight);
    if (diff < minDiff) { minDiff = diff; closest = idx; }
  });
  hlsInstance.currentLevel = closest;
  qualityBtn.textContent = `⚙ ${levels[closest].height}p`;
}

// ────────────────────────────────────────────────────────────
// VIDEO CONTROLS
// ────────────────────────────────────────────────────────────
function initVideoEvents() {
  video.addEventListener('play', () => { playIcon.textContent = '⏸'; });
  video.addEventListener('pause', () => { 
    playIcon.textContent = '▶'; 
    socket.emit('playing_status', { channelId: currentChannel?.id, isPlaying: false });
  });

  // canplay fires as soon as the browser can start playing
  // This ensures loading spinner is dismissed even for HEVC streams
  // where MANIFEST_PARSED may not dismiss it properly
  video.addEventListener('canplay', () => {
    showLoading(false);
    showControls(true);
  });

  video.addEventListener('waiting', () => {
    // Show a subtle buffering indicator without hiding controls
    if (customControls.style.display !== 'none') {
      connectionStatus.textContent = 'Buffering…';
    }
    socket.emit('playing_status', { channelId: currentChannel?.id, isPlaying: false });
  });

  video.addEventListener('playing', () => {
    connectionStatus.textContent = 'Streaming ●';
    // Dismiss loading spinner if still visible
    showLoading(false);
    showControls(true);
    // Remove error overlay if visible (recovered after retry)
    errorOverlay.style.display = 'none';
    socket.emit('playing_status', { channelId: currentChannel?.id, isPlaying: true });
  });

  video.addEventListener('volumechange', () => {
    isMuted = video.muted || video.volume === 0;
    muteBtn.textContent = isMuted ? '🔇' : (video.volume < 0.4 ? '🔉' : '🔊');
    volumeSlider.value = Math.round(video.volume * 100);
  });

  video.addEventListener('stalled', () => {
    if (currentChannel) connectionStatus.textContent = 'Stalled…';
  });

  // Double-click fullscreen
  video.addEventListener('dblclick', toggleFullscreen);
}


function togglePlayPause() {
  if (!currentChannel) return;
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

function toggleMute() {
  video.muted = !video.muted;
  if (video.muted) {
    muteBtn.textContent = '🔇';
    volumeSlider.value = 0;
  } else {
    muteBtn.textContent = '🔊';
    volumeSlider.value = Math.round(video.volume * 100);
  }
}

function setVolume(val) {
  const v = parseInt(val) / 100;
  video.volume = v;
  video.muted = v === 0;
  muteBtn.textContent = v === 0 ? '🔇' : (v < 0.4 ? '🔉' : '🔊');
}

function toggleFullscreen() {
  const container = document.getElementById('videoContainer');
  const videoElement = document.getElementById('mainVideo');
  
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (videoElement.webkitEnterFullscreen) {
      // Fallback for iOS Safari which only allows fullscreen on the video element itself
      videoElement.webkitEnterFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (videoElement.webkitExitFullscreen) {
      videoElement.webkitExitFullscreen();
    }
  }
}

async function togglePiP() {
  if (!currentChannel) {
    showToast('▶ Select a channel first', 'error');
    return;
  }

  // ── Exit existing PiP ──
  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture().catch(() => { });
    showToast('🔲 Exited Picture-in-Picture', 'info');
    return;
  }

  // ── Exit custom mini-player if open ──
  const existing = document.getElementById('customMiniPlayer');
  if (existing) {
    closeMiniPlayer();
    return;
  }

  // ── Try native PiP first ──
  if (document.pictureInPictureEnabled && !video.disablePictureInPicture) {
    // PiP requires video to have loaded at least metadata
    if (video.readyState < 1) {
      showToast('⏳ Wait for stream to load first', 'info');
      return;
    }
    try {
      await video.requestPictureInPicture();
      showToast('📺 Picture-in-Picture activated', 'info');

      // Update button icon when PiP closes
      video.addEventListener('leavepictureinpicture', () => {
        const pipBtns = document.querySelectorAll('[title="Picture-in-Picture"], [title="Picture in Picture"]');
        pipBtns.forEach(b => b.textContent = '⤢');
      }, { once: true });

      // Update button icon
      const pipBtns = document.querySelectorAll('[title="Picture-in-Picture"], [title="Picture in Picture"]');
      pipBtns.forEach(b => b.textContent = '✕⤢');
      return;
    } catch (e) {
      console.warn('Native PiP failed, falling back to custom mini-player:', e.message);
    }
  }

  // ── Custom floating mini-player fallback ──
  openMiniPlayer();
}

function openMiniPlayer() {
  const mini = document.createElement('div');
  mini.id = 'customMiniPlayer';
  mini.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 320px;
    height: 180px;
    background: #000;
    border: 2px solid rgba(255,107,53,0.6);
    border-radius: 12px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(255,107,53,0.2);
    z-index: 9999;
    overflow: hidden;
    cursor: move;
    user-select: none;
  `;

  // Clone video src into mini player
  const miniVideo = document.createElement('video');
  miniVideo.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000;';
  miniVideo.autoplay = true;
  miniVideo.muted = video.muted;
  miniVideo.volume = video.volume;

  // Share the same MediaSource by re-attaching HLS or mpegts to the mini video
  if (hlsInstance) {
    const miniHls = new Hls({ startLevel: hlsInstance.currentLevel });
    miniHls.loadSource(currentChannel.url);
    miniHls.attachMedia(miniVideo);
    miniVideo._miniHls = miniHls;
  } else if (mpegtsInstance) {
    miniVideo.src = video.src;
  } else if (video.src) {
    miniVideo.src = video.src;
  }

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.title = 'Close mini player';
  closeBtn.style.cssText = `
    position: absolute;
    top: 6px; right: 8px;
    background: rgba(0,0,0,0.7);
    border: none;
    color: #fff;
    font-size: 0.9rem;
    width: 26px; height: 26px;
    border-radius: 50%;
    cursor: pointer;
    z-index: 2;
    display: flex; align-items: center; justify-content: center;
    font-family: Outfit, sans-serif;
  `;
  closeBtn.onclick = closeMiniPlayer;

  // Channel label
  const label = document.createElement('div');
  label.textContent = currentChannel.name;
  label.style.cssText = `
    position: absolute;
    bottom: 6px; left: 10px;
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    font-family: Outfit, sans-serif;
    pointer-events: none;
  `;

  mini.appendChild(miniVideo);
  mini.appendChild(closeBtn);
  mini.appendChild(label);
  document.body.appendChild(mini);

  // Drag support
  let isDragging = false, startX, startY, origLeft, origBottom;
  mini.addEventListener('mousedown', (e) => {
    if (e.target === closeBtn) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = mini.getBoundingClientRect();
    origLeft = rect.left;
    origBottom = window.innerHeight - rect.bottom;
    mini.style.right = 'auto';
    mini.style.bottom = 'auto';
    mini.style.left = origLeft + 'px';
    mini.style.top = (window.innerHeight - origBottom - rect.height) + 'px';
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    mini.style.left = (origLeft + e.clientX - startX) + 'px';
    mini.style.top = ((window.innerHeight - origBottom - mini.offsetHeight) + e.clientY - startY) + 'px';
  });
  document.addEventListener('mouseup', () => { isDragging = false; });

  showToast('📺 Mini Player opened', 'info');
}

function closeMiniPlayer() {
  const mini = document.getElementById('customMiniPlayer');
  if (!mini) return;
  const miniVideo = mini.querySelector('video');
  if (miniVideo) {
    if (miniVideo._miniHls) { miniVideo._miniHls.destroy(); }
    miniVideo.pause();
    miniVideo.src = '';
  }
  mini.remove();
  showToast('🔲 Mini Player closed', 'info');
}


function retryStream() {
  if (!currentChannel) return;
  retryCount = 0;
  const ch = currentChannel;
  currentChannel = null;
  playChannel(ch);
}

// ────────────────────────────────────────────────────────────
// UI HELPERS
// ────────────────────────────────────────────────────────────
function hideAllOverlays() {
  videoOverlay.style.display = 'none';
  loadingSpinner.style.display = 'none';
  errorOverlay.style.display = 'none';
}

function showLoading(show) {
  loadingSpinner.style.display = show ? 'flex' : 'none';
  if (show) {
    errorOverlay.style.display = 'none';
    videoOverlay.style.display = 'none';
  }
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorOverlay.style.display = 'flex';
  loadingSpinner.style.display = 'none';
  customControls.style.display = 'none';
  connectionStatus.textContent = 'Error ✗';
}

function showControls(show) {
  customControls.style.display = show ? 'block' : 'none';
}

// ────────────────────────────────────────────────────────────
// AUTO-HIDE CONTROLS
// ────────────────────────────────────────────────────────────
let hideControlsTimeout;

function resetControlsHideTimer() {
  const container = document.getElementById('videoContainer');
  if (!container) return;
  
  container.classList.remove('hide-controls');
  clearTimeout(hideControlsTimeout);
  
  hideControlsTimeout = setTimeout(() => {
    if (!video.paused && currentChannel) {
      container.classList.add('hide-controls');
    }
  }, 4000);
}

const vContainer = document.getElementById('videoContainer');
vContainer.addEventListener('mousemove', resetControlsHideTimer);
vContainer.addEventListener('click', resetControlsHideTimer);
vContainer.addEventListener('mouseleave', () => {
  if (!video.paused && currentChannel) {
    vContainer.classList.add('hide-controls');
  }
});
video.addEventListener('play', resetControlsHideTimer);
video.addEventListener('pause', () => {
  vContainer.classList.remove('hide-controls');
  clearTimeout(hideControlsTimeout);
});

// ────────────────────────────────────────────────────────────
// SCROLL HELPERS
// ────────────────────────────────────────────────────────────
function scrollToChannels() {
  document.getElementById('channels-section').scrollIntoView({ behavior: 'smooth' });
}

function scrollToPlayer() {
  setTimeout(() => {
    document.getElementById('player-section').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// ────────────────────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ────────────────────────────────────────────────────────────
function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  container.id = 'toastContainer';
  document.body.appendChild(container);
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

// ────────────────────────────────────────────────────────────
// HEADER SCROLL EFFECT
// ────────────────────────────────────────────────────────────
function initHeaderScroll() {
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// ────────────────────────────────────────────────────────────
// PARTICLES
// ────────────────────────────────────────────────────────────
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  // World Cup gold/green particles
  const COLORS = [
    'rgba(240,181,24,0.7)',
    'rgba(240,181,24,0.4)',
    'rgba(0,200,83,0.5)',
    'rgba(255,255,255,0.3)',
    'rgba(201,148,26,0.5)',
  ];
  const count = 30;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 5 + 2;
    const duration = Math.random() * 14 + 8;
    const delay = Math.random() * 12;
    const left = Math.random() * 100;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${left}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      box-shadow: 0 0 ${size * 2.5}px ${color};
    `;
    container.appendChild(p);
  }
}

// ────────────────────────────────────────────────────────────
// FORMAT HELPERS
// ────────────────────────────────────────────────────────────
function formatBitrate(bps) {
  if (!bps) return '—';
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`;
  return `${Math.round(bps / 1000)} Kbps`;
}

function getMaxResolution(levels) {
  const max = levels.reduce((a, b) => (a.height > b.height ? a : b), levels[0]);
  return max.height ? `${max.height}p` : 'Auto';
}

// ────────────────────────────────────────────────────────────
// KEYBOARD SHORTCUTS
// ────────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  switch (e.key) {
    case ' ':
    case 'k':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'f':
      toggleFullscreen();
      break;
    case 'm':
      toggleMute();
      break;
    case 'ArrowUp':
      e.preventDefault();
      setVolume(Math.min(100, parseInt(volumeSlider.value) + 10));
      break;
    case 'ArrowDown':
      e.preventDefault();
      setVolume(Math.max(0, parseInt(volumeSlider.value) - 10));
      break;
    case 'p':
      togglePiP();
      break;
  }
});

// ────────────────────────────────────────────────────────────
// MOBILE MENU TOGGLE (optional)
// ────────────────────────────────────────────────────────────
document.getElementById('menuToggle').addEventListener('click', () => {
  const nav = document.querySelector('.nav-links');
  if (nav) {
    if (nav.style.display === 'flex') {
      nav.style.display = 'none';
    } else {
      nav.style.cssText = `
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 68px;
        left: 0;
        right: 0;
        background: rgba(8,12,20,0.97);
        padding: 20px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        gap: 20px;
        z-index: 999;
        backdrop-filter: blur(20px);
      `;
    }
  }
});

// ────────────────────────────────────────────────────────────
// SOCKET.IO REAL-TIME VIEWERS
// ────────────────────────────────────────────────────────────
socket.on('viewer_update', (data) => {
  if (data.type === 'total') {
    const totalPill = document.getElementById('totalOnlinePill');
    const totalCount = document.getElementById('totalOnlineCount');
    if (totalPill && totalCount) {
      totalPill.style.display = 'flex';
      totalCount.innerText = data.count;
    }
  } else if (data.type === 'channel') {
    if (currentChannel && data.channelId === currentChannel.id) {
      const channelViewerCount = document.getElementById('channelViewerCount');
      if (channelViewerCount) {
        channelViewerCount.innerText = data.count;
      }
    }
  }
});

// Dynamic Hot Channel Updates
socket.on('initial_hot_channels', (hotIds) => {
  let changed = false;
  hotIds.forEach(id => {
    const ch = CHANNELS.find(c => c.id === id);
    if (ch && !ch.hot) {
      ch.hot = true;
      changed = true;
    }
  });
  if (changed) {
    CHANNELS.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0));
    renderChannelCards();
    renderSidebarChannels();
  }
});

socket.on('hot_update', (data) => {
  const ch = CHANNELS.find(c => c.id === data.channelId);
  if (ch) {
    ch.hot = data.isHot;
    CHANNELS.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0));
    renderChannelCards();
    renderSidebarChannels();
    if (data.isHot) {
      showToast(`🔥 ${ch.name} is now HOT!`, 'info');
    }
  }
});

function initTimer(nextMatch) {
  const timerEl = document.getElementById('nextMatchTimer');
  let matchDate = null;

  if (nextMatch && timerEl) {
    timerEl.style.display = 'flex';
    document.getElementById('timerMatchName').textContent = `${nextMatch.home} vs ${nextMatch.away} · ${nextMatch.group}`;
    matchDate = new Date(nextMatch.date);
    if (isNaN(matchDate.getTime())) {
      matchDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    }
  } else if (timerEl) {
    timerEl.style.display = 'none';
  }

  function updateTimer() {
    const now = new Date();

    // 1. Update Hero Timer
    if (matchDate && timerEl && timerEl.style.display !== 'none') {
      const diff = matchDate - now;
      if (diff <= 0) {
        document.getElementById('t-days').textContent = '00';
        document.getElementById('t-hours').textContent = '00';
        document.getElementById('t-mins').textContent = '00';
        document.getElementById('t-secs').textContent = '00';
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        document.getElementById('t-days').textContent = d.toString().padStart(2, '0');
        document.getElementById('t-hours').textContent = h.toString().padStart(2, '0');
        document.getElementById('t-mins').textContent = m.toString().padStart(2, '0');
        document.getElementById('t-secs').textContent = s.toString().padStart(2, '0');
      }
    }

    // 2. Update all card timers
    document.querySelectorAll('.card-timer').forEach(el => {
      const dt = el.getAttribute('data-datetime');
      if (dt) {
        let mDate = new Date(dt);
        if (isNaN(mDate.getTime())) mDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

        const diff2 = mDate - now;
        if (diff2 <= 0) {
          el.textContent = 'LIVE SOON';
        } else {
          const dd = Math.floor(diff2 / (1000 * 60 * 60 * 24));
          const hh = Math.floor((diff2 / (1000 * 60 * 60)) % 24);
          const mm = Math.floor((diff2 / 1000 / 60) % 60);
          const ss = Math.floor((diff2 / 1000) % 60);

          if (dd > 0) {
            el.textContent = `in ${dd}d ${hh}h ${mm}m`;
          } else {
            el.textContent = `in ${hh}h ${mm}m ${ss}s`;
          }
        }
      }
    });
  }

  updateTimer();
  if (window.appTimerInterval) clearInterval(window.appTimerInterval);
  window.appTimerInterval = setInterval(updateTimer, 1000);
}
