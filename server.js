const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 4200;

// -- Real-Time Viewer Tracking --
let totalOnline = 0;
const channelViewers = {}; // { 'channel-id': count }
const channelPlaying = {}; // { 'channel-id': count } (Strictly for HOT status)

const fs = require('fs');

// -- Hot Channel System --
const HOT_DATA_FILE = path.join(__dirname, 'hot_channels.json');
let hotChannelsData = {};

try {
  if (fs.existsSync(HOT_DATA_FILE)) {
    hotChannelsData = JSON.parse(fs.readFileSync(HOT_DATA_FILE, 'utf8'));
  }
} catch (e) {
  console.error("Could not load hot channels data", e);
}

const hotChannels = new Set();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Cleanup old hot channels on startup
const now = Date.now();
for (const [chId, timestamp] of Object.entries(hotChannelsData)) {
  if (now - timestamp < ONE_DAY_MS) {
    hotChannels.add(chId);
  } else {
    delete hotChannelsData[chId];
  }
}

function saveHotChannels() {
  try {
    fs.writeFileSync(HOT_DATA_FILE, JSON.stringify(hotChannelsData));
  } catch(e){}
}

const channelTimers = {};
const HOT_THRESHOLD = 2; // Keep at 2 viewers per user request
const HOT_DURATION = 30000; // 30 seconds per user request

function checkHotStatus(channelId) {
  if (!channelId) return;
  // HOT status now STRICTLY depends on actual playing video, not just being in the room
  const count = channelPlaying[channelId] || 0;
  
  if (count >= HOT_THRESHOLD && !hotChannels.has(channelId)) {
    // Start timer if not already running
    if (!channelTimers[channelId]) {
      channelTimers[channelId] = setTimeout(() => {
        hotChannels.add(channelId);
        hotChannelsData[channelId] = Date.now();
        saveHotChannels();
        io.emit('hot_update', { channelId, isHot: true });
        delete channelTimers[channelId];
      }, HOT_DURATION);
    }
  } else if (count < HOT_THRESHOLD) {
    // Cancel the timer if playing viewers drop below threshold before the time is up
    if (channelTimers[channelId]) {
      clearTimeout(channelTimers[channelId]);
      delete channelTimers[channelId];
    }
    // Note: If a channel is already hot, it stays hot.
  }
}

io.on('connection', (socket) => {
  totalOnline++;
  let currentChannel = null;
  socket.isPlaying = false;

  // Send current viewer state to newly connected client
  socket.emit('viewer_update', { type: 'total', count: totalOnline });
  socket.emit('initial_hot_channels', Array.from(hotChannels));

  // Broadcast updated total online count to everyone
  io.emit('viewer_update', { type: 'total', count: totalOnline });

  socket.on('join_channel', (channelId) => {
    // Leave previous channel room
    if (currentChannel) {
      if (socket.isPlaying) {
        socket.isPlaying = false;
        channelPlaying[currentChannel] = Math.max(0, (channelPlaying[currentChannel] || 1) - 1);
        checkHotStatus(currentChannel);
      }
      socket.leave(currentChannel);
      channelViewers[currentChannel] = Math.max(0, (channelViewers[currentChannel] || 1) - 1);
      io.to(currentChannel).emit('viewer_update', { type: 'channel', channelId: currentChannel, count: channelViewers[currentChannel] });
    }

    // Join new channel room
    currentChannel = channelId;
    socket.isPlaying = false;
    if (currentChannel) {
      socket.join(currentChannel);
      channelViewers[currentChannel] = (channelViewers[currentChannel] || 0) + 1;
      io.to(currentChannel).emit('viewer_update', { type: 'channel', channelId: currentChannel, count: channelViewers[currentChannel] });
    }
  });

  socket.on('playing_status', (data) => {
    if (currentChannel !== data.channelId) return;

    if (data.isPlaying) {
      if (!socket.isPlaying) {
        socket.isPlaying = true;
        channelPlaying[currentChannel] = (channelPlaying[currentChannel] || 0) + 1;
        checkHotStatus(currentChannel);
      }
    } else {
      if (socket.isPlaying) {
        socket.isPlaying = false;
        channelPlaying[currentChannel] = Math.max(0, (channelPlaying[currentChannel] || 1) - 1);
        checkHotStatus(currentChannel);
      }
    }
  });

  socket.on('manual_hot', (channelId) => {
    if (!channelId || hotChannels.has(channelId)) return;
    hotChannels.add(channelId);
    hotChannelsData[channelId] = Date.now();
    saveHotChannels();
    io.emit('hot_update', { channelId, isHot: true });
  });

  socket.on('disconnect', () => {
    totalOnline = Math.max(0, totalOnline - 1);
    io.emit('viewer_update', { type: 'total', count: totalOnline });

    if (currentChannel) {
      if (socket.isPlaying) {
        channelPlaying[currentChannel] = Math.max(0, (channelPlaying[currentChannel] || 1) - 1);
        checkHotStatus(currentChannel);
      }
      channelViewers[currentChannel] = Math.max(0, (channelViewers[currentChannel] || 1) - 1);
      io.to(currentChannel).emit('viewer_update', { type: 'channel', channelId: currentChannel, count: channelViewers[currentChannel] });
    }
  });
});

// Enable CORS for all routes
app.use(cors());

// Proxy endpoint for bypassing CORS on live streams
// Example usage: /proxy?url=http://rgkkw.live:80/live/1Aoen7elp5/IgMJ60tmAa/130714.ts
app.use('/proxy', (req, res, next) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  // Parse the target URL
  let target;
  try {
    target = new URL(targetUrl);
  } catch (e) {
    return res.status(400).send('Invalid url parameter');
  }

  // Create proxy middleware dynamically for the target
  const proxy = createProxyMiddleware({
    target: target.origin,
    changeOrigin: true,
    pathRewrite: () => target.pathname + target.search,
    onProxyReq: (proxyReq, req, res) => {
      // Spoof User-Agent to bypass blocks on IPTV streams
      proxyReq.setHeader('User-Agent', 'Mozilla/5.0');
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add CORS headers to the response
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Range';
      proxyRes.headers['Access-Control-Expose-Headers'] = 'Content-Length, Content-Range';
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      if (!res.headersSent) {
        res.status(500).send('Proxy Error');
      }
    }
  });

  // Call the proxy middleware
  proxy(req, res, next);
});

// Serve static files from current directory
app.use(express.static(path.join(__dirname, '')));

// ── ESPN API Proxy Endpoints (avoid CORS) ──────────────────────
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world';
const ESPN_V2   = 'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world';

const cache = new Map();

async function espnFetch(url, res, ttl = 30000) {
  try {
    const now = Date.now();
    const cached = cache.get(url);
    // Return cached data if valid
    if (cached && (now - cached.timestamp < ttl)) {
      res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttl/1000)}`);
      return res.json(cached.data);
    }

    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    if (!r.ok) throw new Error(`ESPN returned ${r.status}`);
    const data = await r.json();
    
    // Save to cache
    cache.set(url, { timestamp: now, data });

    res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttl/1000)}`);
    res.json(data);
  } catch (e) {
    console.error('ESPN fetch error:', e.message);
    res.status(500).json({ error: e.message });
  }
}

// Live scoreboard – refreshed every call
app.get('/api/scoreboard', (req, res) => {
  espnFetch(`${ESPN_BASE}/scoreboard?dates=${req.query.dates || ''}`, res);
});

// Group standings
app.get('/api/standings', (req, res) => {
  espnFetch(`${ESPN_V2}/standings`, res);
});

// All matches for the tournament
app.get('/api/schedule', (req, res) => {
  const url = req.query.dates
    ? `${ESPN_BASE}/scoreboard?dates=${req.query.dates}`
    : `${ESPN_BASE}/scoreboard`;
  espnFetch(url, res);
});

// Single match summary
app.get('/api/match/:id', (req, res) => {
  espnFetch(`${ESPN_BASE}/summary?event=${req.params.id}`, res);
});

server.listen(PORT, () => {
  console.log(`Free Tv Server running on http://localhost:${PORT}`);
});

