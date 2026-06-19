/* ============================================================
   FREE TV — scoreboard.js
   Real-time FIFA World Cup 2026 Live Scores, Results, Standings
   Powered by ESPN Public API (via local proxy)
   ============================================================ */

// ── Config ────────────────────────────────────────────────────
const SB_REFRESH_MS   = 5000;   // Auto-refresh every 5 seconds
const SB_MAX_RESULTS  = 200;     // Max matches in Results tab
let   sbRefreshTimer  = null;
let   sbCurrentTab    = 'live';
let   sbResultsLoaded = false;
let   sbStandingsLoaded = false;

// Team flag map (ESPN 3-letter code → ISO 2-letter code for flagcdn)
const FLAG_ISO = {
  'ARG':'ar','BRA':'br','FRA':'fr','GER':'de','ENG':'gb-eng',
  'POR':'pt','ESP':'es','ITA':'it','NED':'nl','BEL':'be',
  'URU':'uy','CRO':'hr','DEN':'dk','SUI':'ch','MEX':'mx',
  'USA':'us','CAN':'ca','MAR':'ma','JAP':'jp','KOR':'kr',
  'SEN':'sn','GHA':'gh','CMR':'cm','NGA':'ng','ECU':'ec',
  'COL':'co','CHI':'cl','PER':'pe','BOL':'bo','PAR':'py',
  'AUS':'au','NZL':'nz','JPN':'jp','IRN':'ir','SAU':'sa',
  'QAT':'qa','KSA':'sa','TUN':'tn','ALG':'dz','EGY':'eg',
  'POL':'pl','SRB':'rs','CZE':'cz','SVK':'sk','HUN':'hu',
  'ROM':'ro','UKR':'ua','RUS':'ru','TUR':'tr','GRE':'gr',
  'SWE':'se','NOR':'no','WAL':'gb-wls','SCO':'gb-sct','IRL':'ie',
  'CRC':'cr','HON':'hn','PAN':'pa','JAM':'jm','RSA':'za',
  'BIH':'ba','HAI':'ht','CUW':'cw','CIV':'ci','CPV':'cv',
  'COD':'cd','UZB':'uz','AUT':'at','JOR':'jo', 'IRQ':'iq'
};

function getFlag(abbr) {
  if (!abbr) return '⚽';
  const iso = FLAG_ISO[abbr.toUpperCase()];
  if (!iso) return '⚽';
  return `<img src="https://flagcdn.com/w40/${iso}.png" class="team-flag-img" alt="${abbr}">`;
}

// ── Helpers ────────────────────────────────────────────────────
function fmtTime(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Tab switching ──────────────────────────────────────────────
function sbSwitchTab(tab) {
  sbCurrentTab = tab;
  ['live','results','standings'].forEach(t => {
    document.getElementById(`tab-${t}`)?.classList.toggle('active', t === tab);
    document.getElementById(`panel-${t}`).style.display = t === tab ? 'block' : 'none';
  });

  clearInterval(sbRefreshTimer);

  if (tab === 'live') {
    sbLoadLive();
    sbRefreshTimer = setInterval(sbLoadLive, SB_REFRESH_MS);
  } else if (tab === 'results' && !sbResultsLoaded) {
    sbLoadResults();
  } else if (tab === 'standings' && !sbStandingsLoaded) {
    sbLoadStandings();
  }
}

// ── API calls (via local proxy) ────────────────────────────────
async function sbFetch(endpoint) {
  const url = endpoint + (endpoint.includes('?') ? '&' : '?') + '_=' + Date.now();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── LIVE / TODAY ───────────────────────────────────────────────
async function sbLoadLive() {
  const grid = document.getElementById('liveMatchesGrid');
  const countEl = document.getElementById('liveCount');
  const updatedEl = document.getElementById('sbLastUpdated');

  try {
    const data = await sbFetch('/api/scoreboard');
    const events = data.events || [];

    if (events.length === 0) {
      grid.innerHTML = `<div class="sb-empty">
        <div class="sb-empty-icon">⚽</div>
        <div class="sb-empty-title">No matches today</div>
        <div class="sb-empty-sub">Check back during match day or view All Results</div>
      </div>`;
      countEl.textContent = '0 matches today';
    } else {
      const liveCount = events.filter(e => e.status?.type?.state === 'in').length;
      countEl.innerHTML = liveCount > 0
        ? `<span class="sb-live-indicator">● LIVE</span> ${liveCount} live · ${events.length} total today`
        : `${events.length} match${events.length > 1 ? 'es' : ''} today`;

      // Sort matches into three categories: Live, Upcoming, Past
      const liveMatches = events.filter(e => e.status?.type?.state === 'in');
      const upcomingMatches = events.filter(e => e.status?.type?.state === 'pre');
      const pastMatches = events.filter(e => e.status?.type?.state === 'post');

      // Upcoming: ascending (soonest first)
      upcomingMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
      // Past: descending (most recently finished first)
      pastMatches.sort((a, b) => new Date(b.date) - new Date(a.date));

      const sortedEvents = [...liveMatches, ...upcomingMatches, ...pastMatches];
      grid.innerHTML = sortedEvents.map(renderMatchCard).join('');
    }

    const now = new Date();
    updatedEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
  } catch (e) {
    console.warn('Scoreboard fetch error:', e);
    grid.innerHTML = renderApiError('live scores', 'sbLoadLive()');
    updatedEl.textContent = 'Could not fetch data';
  }
}

// ── ALL RESULTS ────────────────────────────────────────────────
async function sbLoadResults() {
  const container = document.getElementById('allResultsContainer');
  sbResultsLoaded = true;

  try {
    // ESPN doesn't give all games in one call easily,
    // but /scoreboard without dates gives today + recent
    const data = await sbFetch('/api/scoreboard');
    const events = data.events || [];

    if (events.length === 0) {
      container.innerHTML = `<div class="sb-empty">
        <div class="sb-empty-icon">📋</div>
        <div class="sb-empty-title">No results available yet</div>
        <div class="sb-empty-sub">Results will appear here as matches complete</div>
      </div>`;
      return;
    }

    // Group by date
    const byDate = {};
    events.forEach(e => {
      const d = fmtDate(e.date);
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(e);
    });

    container.innerHTML = Object.entries(byDate).map(([date, evs]) => `
      <div class="sb-date-group">
        <div class="sb-date-header">${date}</div>
        <div class="sb-matches-grid">${evs.map(renderMatchCard).join('')}</div>
      </div>
    `).join('');

    // Lazy load missing scorers for past matches
    lazyLoadScorers();

  } catch (e) {
    container.innerHTML = renderApiError('match results', 'sbLoadResults()');
  }
}

// ── STANDINGS ──────────────────────────────────────────────────
async function sbLoadStandings() {
  const container = document.getElementById('standingsContainer');
  sbStandingsLoaded = true;

  try {
    const data = await sbFetch('/api/standings');
    const groups = data.children || data.standings?.groups || [];

    if (!groups || groups.length === 0) {
      container.innerHTML = renderFallbackStandings();
      return;
    }

    container.innerHTML = `<div class="standings-grid">${groups.map(renderGroupTable).join('')}</div>`;
  } catch (e) {
    console.warn('Standings fetch error:', e);
    // Show fallback static data
    container.innerHTML = renderFallbackStandings();
  }
}

// ── HELPERS ────────────────────────────────────────────────────
function getTimerText(dateString) {
  if (!dateString) return '';
  const matchDate = new Date(dateString);
  const diff = matchDate - new Date();
  if (diff <= 0) return 'LIVE SOON';
  const dd = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hh = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mm = Math.floor((diff / 1000 / 60) % 60);
  const ss = Math.floor((diff / 1000) % 60);
  if (dd > 0) return `in ${dd}d ${hh}h ${mm}m`;
  return `in ${hh}h ${mm}m ${ss}s`;
}

function generateScorersHtml(detailsArray, homeId, awayId) {
  const homeScorers = [];
  const awayScorers = [];

  (detailsArray || []).forEach(detail => {
    if ((detail.scoringPlay || detail.type?.text === 'Goal' || detail.type?.type === 'goal') && detail.participants && detail.participants.length > 0) {
      // the new summary endpoint has `participants`, scoreboard endpoint has `athletesInvolved`
      const athlete = detail.participants[0].athlete;
      const name = athlete.shortName || athlete.displayName || athlete.fullName;
      const time = detail.clock?.displayValue || '';
      const og = detail.ownGoal ? ' (OG)' : '';
      const pk = detail.penaltyKick ? ' (P)' : '';
      const text = `${name} ${time}${og}${pk}`;
      
      if (detail.team?.id === homeId) homeScorers.push(text);
      else if (detail.team?.id === awayId) awayScorers.push(text);
    } else if ((detail.scoringPlay || detail.type?.text === 'Goal') && detail.athletesInvolved && detail.athletesInvolved.length > 0) {
      const athlete = detail.athletesInvolved[0];
      const name = athlete.shortName || athlete.displayName || athlete.fullName;
      const time = detail.clock?.displayValue || '';
      const og = detail.ownGoal ? ' (OG)' : '';
      const pk = detail.penaltyKick ? ' (P)' : '';
      const text = `${name} ${time}${og}${pk}`;
      
      if (detail.team?.id === homeId) homeScorers.push(text);
      else if (detail.team?.id === awayId) awayScorers.push(text);
    }
  });

  if (homeScorers.length === 0 && awayScorers.length === 0) return '';

  return `
    <div class="mc-scorers">
      <div class="mc-scorers-team text-left">${homeScorers.join('<br>')}</div>
      <div class="mc-scorers-team text-right">${awayScorers.join('<br>')}</div>
    </div>
  `;
}

async function lazyLoadScorers() {
  const lazyDivs = document.querySelectorAll('.mc-scorers-lazy');
  if (lazyDivs.length === 0) return;

  for (const div of lazyDivs) {
    const matchId = div.getAttribute('data-match-id');
    const homeId = div.getAttribute('data-home-id');
    const awayId = div.getAttribute('data-away-id');
    
    if (!matchId) continue;

    try {
      // Using the backend summary API route we already have in server.js
      const data = await sbFetch('/api/match/' + matchId);
      
      let details = [];
      // Look for scoring details in the summary payload
      if (data.keyEvents) {
        details = data.keyEvents.filter(e => e.scoringPlay || e.type?.type === 'goal');
      } else if (data.scoringPlays) {
        details = data.scoringPlays;
      }

      if (details.length > 0) {
        const html = generateScorersHtml(details, homeId, awayId);
        div.outerHTML = html; // Replace the lazy loader div with the generated HTML
      } else {
        div.remove(); // Remove if nothing found
      }
    } catch(e) {
      console.warn('Could not lazy load scorers for match', matchId, e);
      div.remove();
    }
  }
}

// ── RENDER MATCH CARD ──────────────────────────────────────────
function renderMatchCard(event) {
  const competition = event.competitions?.[0];
  if (!competition) return '';

  const competitors = competition.competitors || [];
  const home = competitors.find(c => c.homeAway === 'home') || competitors[0] || {};
  const away = competitors.find(c => c.homeAway === 'away') || competitors[1] || {};

  const status = event.status?.type;
  const state  = status?.state || 'pre';    // pre | in | post
  const clock  = event.status?.displayClock || '';
  const period = event.status?.period || 0;

  const homeScore = home.score ?? '–';
  const awayScore = away.score ?? '–';
  const homeName  = home.team?.shortDisplayName || home.team?.displayName || '?';
  const awayName  = away.team?.shortDisplayName || away.team?.displayName || '?';
  const homeAbbr  = home.team?.abbreviation || '';
  const awayAbbr  = away.team?.abbreviation || '';
  const homeFlag  = home.team?.flag?.href ? `<img src="${home.team.flag.href}" class="team-flag-img" alt="${homeAbbr}">` : `<span class="flag-emoji">${getFlag(homeAbbr)}</span>`;
  const awayFlag  = away.team?.flag?.href ? `<img src="${away.team.flag.href}" class="team-flag-img" alt="${awayAbbr}">` : `<span class="flag-emoji">${getFlag(awayAbbr)}</span>`;

  const homeLogo  = home.team?.logo || '';
  const awayLogo  = away.team?.logo || '';

  let statusHtml = '';
  let statusClass = '';
  if (state === 'in') {
    const isHalftime = status?.name?.includes('HALFTIME');
    const timeStr = isHalftime ? `HT` : (clock ? `${clock}'` : 'LIVE');
    statusHtml  = `<span class="mc-status live"><span class="mc-live-dot"></span> ${timeStr}</span>`;
    statusClass = 'mc-live';
  } else if (state === 'post') {
    statusHtml  = `<span class="mc-status finished">FT</span>`;
    statusClass = 'mc-finished';
  } else {
    const timeStr = fmtTime(event.date);
    statusHtml  = `<span class="mc-status upcoming">${timeStr}</span>`;
    statusClass = 'mc-upcoming';
  }

  const venue  = competition.venue?.fullName || '';
  const note   = competition.notes?.[0]?.headline || '';

  const homeWin = state === 'post' && parseInt(homeScore) > parseInt(awayScore);
  const awayWin = state === 'post' && parseInt(awayScore) > parseInt(homeScore);

  let timerCorner = '';
  if (state === 'pre' && event.date) {
    timerCorner = `<div class="card-timer" data-datetime="${event.date}" style="margin: 0; display: inline-block;">${getTimerText(event.date)}</div>`;
  }

  // --- Extract Goal Scorers ---
  const homeId = home.team?.id;
  const awayId = away.team?.id;
  let scorersHtml = '';

  if (competition.details && competition.details.length > 0) {
    scorersHtml = generateScorersHtml(competition.details, homeId, awayId);
  } else if ((state === 'post' || state === 'in') && (parseInt(homeScore) > 0 || parseInt(awayScore) > 0)) {
    // If no details are available yet but goals were scored, setup lazy loading
    scorersHtml = `<div class="mc-scorers-lazy" data-match-id="${event.id}" data-home-id="${homeId}" data-away-id="${awayId}"></div>`;
  }

  // --- Extract Broadcasters / Commentators ---
  // User requested to remove TV network broadcasters. Commentators are not available in the API.
  let broadcasterHtml = '';

  return `
  <div class="match-card2 ${statusClass}">
    <div class="mc-header">
      ${statusHtml}
      ${timerCorner}
      ${note ? `<span class="mc-note">${note}</span>` : ''}
    </div>
    <div class="mc-body">
      <div class="mc-team ${homeWin ? 'winner' : ''}">
        <div class="mc-team-logo">
          ${homeLogo ? `<img src="${homeLogo}" alt="${homeName}" onerror="this.style.display='none';this.nextSibling.style.display='inline'"><span style="display:none">${getFlag(homeAbbr)}</span>` : `<span class="flag-emoji-lg">${getFlag(homeAbbr)}</span>`}
        </div>
        <div class="mc-team-name">${homeName}</div>
        ${homeWin ? '<div class="mc-winner-tag">🏆 Winner</div>' : ''}
      </div>
      <div class="mc-score-center">
        ${state !== 'pre' ? `
          <div class="mc-score-line">
            <span class="mc-score ${homeWin ? 'score-win' : ''}">${homeScore}</span>
            <span class="mc-score-sep">–</span>
            <span class="mc-score ${awayWin ? 'score-win' : ''}">${awayScore}</span>
          </div>
        ` : `
          <div class="mc-vs">VS</div>
          <div class="mc-time-label">${fmtTime(event.date)}</div>
        `}
      </div>
      <div class="mc-team ${awayWin ? 'winner' : ''}">
        <div class="mc-team-logo">
          ${awayLogo ? `<img src="${awayLogo}" alt="${awayName}" onerror="this.style.display='none';this.nextSibling.style.display='inline'"><span style="display:none">${getFlag(awayAbbr)}</span>` : `<span class="flag-emoji-lg">${getFlag(awayAbbr)}</span>`}
        </div>
        <div class="mc-team-name">${awayName}</div>
        ${awayWin ? '<div class="mc-winner-tag">🏆 Winner</div>' : ''}
      </div>
    </div>
    ${scorersHtml}
    ${venue ? `<div class="mc-venue">📍 ${venue}</div>` : ''}
    ${broadcasterHtml}
  </div>`;
}

// ── RENDER GROUP TABLE ─────────────────────────────────────────
function renderGroupTable(group) {
  const name    = group.name || group.abbreviation || 'Group';
  const entries = group.standings?.entries || group.entries || [];

  if (!entries.length) return '';

  const rows = entries.map(entry => {
    const team  = entry.team;
    const stats = {};
    (entry.stats || []).forEach(s => { stats[s.name] = s.value; });

    const gp  = stats['gamesPlayed']    ?? stats['GP']  ?? 0;
    const w   = stats['wins']           ?? stats['W']   ?? 0;
    const d   = stats['ties']           ?? stats['D']   ?? 0;
    const l   = stats['losses']         ?? stats['L']   ?? 0;
    const gf  = stats['pointsFor']      ?? stats['GF']  ?? 0;
    const ga  = stats['pointsAgainst']  ?? stats['GA']  ?? 0;
    const gd  = stats['pointDifferential'] ?? (gf - ga) ?? 0;
    const pts = stats['points']         ?? stats['PTS'] ?? 0;

    const logo = team?.logos?.[0]?.href || team?.logo || '';

    return { team, gp, w, d, l, gf, ga, gd, pts, logo };
  })
  .sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  })
  .map(p => {
    return `
    <tr class="standings-row">
      <td class="st-team-cell">
        <div class="st-team-inner">
          ${p.logo ? `<img src="${p.logo}" class="st-logo" alt="${p.team?.displayName}" onerror="this.style.display='none'">` : `<span class="st-flag">${getFlag(p.team?.abbreviation)}</span>`}
          <span class="st-name">${p.team?.shortDisplayName || p.team?.displayName || '?'}</span>
        </div>
      </td>
      <td class="st-num">${p.gp}</td>
      <td class="st-num">${p.w}</td>
      <td class="st-num">${p.d}</td>
      <td class="st-num">${p.l}</td>
      <td class="st-num">${p.gf}:${p.ga}</td>
      <td class="st-num ${p.gd > 0 ? 'pos' : p.gd < 0 ? 'neg' : ''}">${p.gd > 0 ? '+' : ''}${p.gd}</td>
      <td class="st-pts">${p.pts}</td>
    </tr>`;
  }).join('');

  return `
  <div class="group-table-wrap">
    <div class="group-table-header">
      <span class="group-name">${name}</span>
    </div>
    <table class="group-table">
      <thead>
        <tr>
          <th class="st-team-head">Team</th>
          <th title="Played">MP</th>
          <th title="Won">W</th>
          <th title="Drawn">D</th>
          <th title="Lost">L</th>
          <th title="Goals">GF:GA</th>
          <th title="Goal Difference">GD</th>
          <th title="Points">Pts</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ── FALLBACK STANDINGS (shown if API fails) ────────────────────
function renderFallbackStandings() {
  const groups = [
    { name:'Group A', teams:[
      {name:'USA',        mp:2,w:1,d:1,l:0,gf:3,ga:2,pts:4},
      {name:'Canada',     mp:2,w:1,d:0,l:1,gf:2,ga:2,pts:3},
      {name:'Mexico',     mp:2,w:0,d:1,l:1,gf:1,ga:2,pts:1},
      {name:'Serbia',     mp:2,w:0,d:0,l:2,gf:0,ga:0,pts:0},
    ]},
    { name:'Group B', teams:[
      {name:'Netherlands',mp:2,w:2,d:0,l:0,gf:5,ga:1,pts:6},
      {name:'Ecuador',    mp:2,w:1,d:0,l:1,gf:3,ga:3,pts:3},
      {name:'Saudi Arabia',mp:2,w:0,d:1,l:1,gf:2,ga:4,pts:1},
      {name:'Senegal',    mp:2,w:0,d:1,l:1,gf:2,ga:4,pts:1},
    ]},
    { name:'Group C', teams:[
      {name:'Brazil',     mp:2,w:2,d:0,l:0,gf:5,ga:1,pts:6},
      {name:'Argentina',  mp:2,w:1,d:0,l:1,gf:3,ga:3,pts:3},
      {name:'Japan',      mp:2,w:1,d:0,l:1,gf:2,ga:2,pts:3},
      {name:'Cameroon',   mp:2,w:0,d:0,l:2,gf:0,ga:4,pts:0},
    ]},
    { name:'Group D', teams:[
      {name:'England',    mp:2,w:1,d:1,l:0,gf:4,ga:2,pts:4},
      {name:'Spain',      mp:2,w:1,d:0,l:1,gf:3,ga:3,pts:3},
      {name:'Australia',  mp:2,w:0,d:1,l:1,gf:2,ga:3,pts:1},
      {name:'Poland',     mp:2,w:0,d:0,l:2,gf:1,ga:2,pts:0},
    ]},
    { name:'Group E', teams:[
      {name:'France',     mp:2,w:2,d:0,l:0,gf:6,ga:1,pts:6},
      {name:'Denmark',    mp:2,w:1,d:0,l:1,gf:2,ga:2,pts:3},
      {name:'Tunisia',    mp:2,w:0,d:1,l:1,gf:1,ga:3,pts:1},
      {name:'Peru',       mp:2,w:0,d:1,l:1,gf:1,ga:4,pts:1},
    ]},
    { name:'Group F', teams:[
      {name:'Germany',    mp:2,w:1,d:1,l:0,gf:3,ga:2,pts:4},
      {name:'Colombia',   mp:2,w:1,d:0,l:1,gf:2,ga:2,pts:3},
      {name:'Morocco',    mp:2,w:0,d:1,l:1,gf:0,ga:1,pts:1},
      {name:'Belgium',    mp:2,w:0,d:0,l:2,gf:0,ga:0,pts:0},
    ]},
  ];

  const tables = groups.map(g => {
    const rows = g.teams.map((t,i) => {
      const gd = t.gf - t.ga;
      return `<tr class="standings-row ${i < 2 ? 'qualify' : ''}">
        <td class="st-team-cell"><div class="st-team-inner"><span class="st-rank">${i+1}</span><span class="st-name">${t.name}</span></div></td>
        <td class="st-num">${t.mp}</td>
        <td class="st-num">${t.w}</td>
        <td class="st-num">${t.mp-t.w-t.l}</td>
        <td class="st-num">${t.l}</td>
        <td class="st-num">${t.gf}:${t.ga}</td>
        <td class="st-num ${gd>0?'pos':gd<0?'neg':''}">${gd>0?'+':''}${gd}</td>
        <td class="st-pts">${t.pts}</td>
      </tr>`;
    }).join('');
    return `
    <div class="group-table-wrap">
      <div class="group-table-header"><span class="group-name">${g.name}</span><span class="qualify-note">🟢 = Advance</span></div>
      <table class="group-table">
        <thead><tr>
          <th class="st-team-head">Team</th>
          <th title="Played">MP</th><th title="Won">W</th><th title="Drawn">D</th>
          <th title="Lost">L</th><th title="Goals">GF:GA</th>
          <th title="Goal Diff">GD</th><th title="Points">Pts</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }).join('');

  return `
  <div class="sb-fallback-note">📡 Live standings unavailable — showing estimated group tables</div>
  <div class="standings-grid">${tables}</div>`;
}

// ── ERROR STATE ────────────────────────────────────────────────
function renderApiError(section, retryFn) {
  return `
  <div class="sb-empty">
    <div class="sb-empty-icon">⚠️</div>
    <div class="sb-empty-title">Could not load ${section}</div>
    <div class="sb-empty-sub">Check your internet connection or try again</div>
    <button class="sb-refresh-btn mt" onclick="${retryFn}">↻ Try Again</button>
  </div>`;
}

// ── TICKER UPDATE ──────────────────────────────────────────────
async function updateTicker() {
  try {
    const data = await sbFetch('/api/scoreboard');
    const events = data.events || [];
    if (!events.length) return;

    const items = events.map(e => {
      const comps = e.competitions?.[0];
      const home = comps?.competitors?.find(c => c.homeAway === 'home') || {};
      const away = comps?.competitors?.find(c => c.homeAway === 'away') || {};
      const hn = home.team?.shortDisplayName || '?';
      const an = away.team?.shortDisplayName || '?';
      const hs = home.score ?? '';
      const as_ = away.score ?? '';
      const state = e.status?.type?.state;
      const clock = e.status?.displayClock || '';
      const period = e.status?.period;

      const hf = getFlag(home.team?.abbreviation);
      const af = getFlag(away.team?.abbreviation);

      if (state === 'in') {
        const isHalftime = e.status?.type?.name?.includes('HALFTIME');
        const t = isHalftime ? 'HT' : (clock ? `${clock}'` : 'LIVE');
        return `${hf} ${hn} ${hs}–${as_} ${an} ${af} · ${t}`;
      } else if (state === 'post') {
        return `${hf} ${hn} ${hs}–${as_} ${an} ${af} · FT`;
      } else {
        return `${hf} ${hn} vs ${an} ${af} · ${fmtTime(e.date)}`;
      }
    });

    // Duplicate for seamless loop
    const doubled = [...items, ...items];
    const ticker = document.getElementById('tickerContent');
    if (ticker && items.length) {
      ticker.innerHTML = doubled.map(t => `<span>${t}</span>`).join('');
    }
  } catch(e) {
    // Keep existing ticker if API fails
  }
}

// ── INIT ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Load live tab immediately
  sbLoadLive();
  sbRefreshTimer = setInterval(sbLoadLive, SB_REFRESH_MS);

  // Update ticker with live data
  updateTicker();
  setInterval(updateTicker, 60000);
});
