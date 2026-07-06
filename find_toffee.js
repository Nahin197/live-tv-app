const fs = require('fs');
const app = fs.readFileSync('app.js', 'utf8');

const matches = [...app.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
console.log('All channels:');
console.log(matches);
console.log('---');

const toffees = matches.filter(n => n.toLowerCase().includes('toffee'));
console.log('Toffees:', toffees);
