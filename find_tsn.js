const fs = require('fs');
const app = fs.readFileSync('app.js', 'utf8');
const names = [...app.matchAll(/name:\s*['"]([^'"]+)['"]/ig)].map(m => m[1]);
console.log('Channels with TSN:', names.filter(n => n.toLowerCase().includes('tsn')));
