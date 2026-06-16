const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4200;

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

async function espnFetch(url, res) {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    if (!r.ok) throw new Error(`ESPN returned ${r.status}`);
    const data = await r.json();
    res.setHeader('Cache-Control', 'no-cache');
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

app.listen(PORT, () => {
  console.log(`Free Tv Server running on http://localhost:${PORT}`);
});

