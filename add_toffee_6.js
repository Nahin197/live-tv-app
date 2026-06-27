const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

// Find the Toffee logo
let m1 = appJs.match(/id:\s*['"]toffee(-4|-5|)['"][^]*?logo:\s*['"](.*?)['"]/);
if (!m1) {
  console.log("Could not find Toffee channel");
  process.exit(1);
}
let fullLogo = m1[2];

const newChannel = `  {
    id: "toffee-6",
    name: "Toffee 6",
    emoji: '📺',
    logo: "${fullLogo}",
    url: "https://prod-cdn01-live.toffeelive.com/live/FIFA-2026-2/0/master_3000.m3u8?hdntl=Expires=1782667986~_GO=Generated~URLPrefix=aHR0cHM6Ly9wcm9kLWNkbjAxLWxpdmUudG9mZmVlbGl2ZS5jb20~Signature=AVXEwvc37dFUKGbQ0dUdyGFB9e8j-pC4-UVmGLize49cKF1QHePFJ7ZhXcBlcL7j6OUeKfpDZr_4ITmtn-YUkJb8GMMM",
    quality: "1080p",
    protocol: "HLS Proxy",
    color: 'linear-gradient(135deg, rgba(200,20,20,0.15), rgba(100,10,10,0.05))',
    language: "English",
    category: 'Sports',
    description: 'Toffee 6 Live Stream'
  },
`;

appJs = appJs.replace(/const CHANNELS = \[\r?\n/, `const CHANNELS = [\n${newChannel}`);
fs.writeFileSync('app.js', appJs);
console.log('Added Toffee 6');
