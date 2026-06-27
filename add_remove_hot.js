const fs = require('fs');

// --- 1. index.html ---
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(
  /<div class="hot-action-area" id="hotActionArea" style="display: none;">[\s\S]*?<\/button>\s*<\/div>/,
  `<div class="hot-action-area" id="hotActionArea" style="display: none;">
          <div class="hot-action-text" id="hotActionTextNormal">
            <div class="hot-action-title">Is this stream running smoothly?</div>
            <div class="hot-action-desc">Help others find this channel by marking it as <strong>HOT</strong>. If the quality is satisfying and buffer-free, vote to bump it to the #1 ranking!</div>
          </div>
          <div class="hot-action-text" id="hotActionTextRemove" style="display: none;">
            <div class="hot-action-title" style="color: #e74c3c;">This channel is HOT! 🔥</div>
            <div class="hot-action-desc">If the stream quality has dropped or is buffering, you can remove its hot status to help others find better channels.</div>
          </div>
          <button id="markHotBtn" class="btn-gold" onclick="markCurrentChannelHot()">
            <span class="btn-icon">🔥</span> Mark As Hot
          </button>
          <button id="removeHotBtn" class="btn-gold" style="display: none; background: rgba(231, 76, 60, 0.1); border-color: rgba(231, 76, 60, 0.3); color: #e74c3c;" onclick="removeCurrentChannelHot()">
            <span class="btn-icon">❌</span> Remove Hot
          </button>
        </div>`
);
fs.writeFileSync('index.html', indexHtml);

// --- 2. app.js ---
let appJs = fs.readFileSync('app.js', 'utf8');
appJs = appJs.replace(
  /const hotArea = document\.getElementById\('hotActionArea'\);\s*const hotBtn = document\.getElementById\('markHotBtn'\);\s*if \(hotArea && hotBtn\) \{[\s\S]*?\}\s*\}/,
  `const hotArea = document.getElementById('hotActionArea');
  const hotBtn = document.getElementById('markHotBtn');
  const removeHotBtn = document.getElementById('removeHotBtn');
  const textNormal = document.getElementById('hotActionTextNormal');
  const textRemove = document.getElementById('hotActionTextRemove');

  if (hotArea && hotBtn && removeHotBtn) {
    hotArea.style.display = 'flex';
    if (channel.hot) {
      hotBtn.style.display = 'none';
      removeHotBtn.style.display = 'inline-flex';
      removeHotBtn.disabled = false;
      removeHotBtn.innerHTML = '<span class="btn-icon">❌</span> Remove Hot';
      if (textNormal) textNormal.style.display = 'none';
      if (textRemove) textRemove.style.display = 'block';
      hotArea.style.background = 'rgba(231, 76, 60, 0.05)';
      hotArea.style.borderColor = 'rgba(231, 76, 60, 0.2)';
    } else {
      hotBtn.style.display = 'inline-flex';
      removeHotBtn.style.display = 'none';
      hotBtn.disabled = false;
      hotBtn.innerHTML = '<span class="btn-icon">🔥</span> Mark As Hot';
      if (textNormal) textNormal.style.display = 'block';
      if (textRemove) textRemove.style.display = 'none';
      hotArea.style.background = 'rgba(240, 181, 24, 0.08)';
      hotArea.style.borderColor = 'rgba(240, 181, 24, 0.2)';
    }
  }`
);

const removeHotFn = `
window.removeCurrentChannelHot = function() {
  if (!currentChannel) return;

  const removeHotBtn = document.getElementById('removeHotBtn');
  if (removeHotBtn) {
    removeHotBtn.disabled = true;
    removeHotBtn.innerHTML = '<span class="btn-icon">✅</span> Removed!';
  }

  // Emitting the event to the server to demote the channel
  socket.emit('remove_hot', currentChannel.id);

  // Optimistically mark it locally
  currentChannel.hot = false;
  CHANNELS.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0));
  renderChannelCards();
  renderSidebarChannels();

  // Keep the current channel highlighted
  const card = document.getElementById(\`card-\${currentChannel.id}\`);
  const sidebar = document.getElementById(\`sidebar-\${currentChannel.id}\`);
  if (card) card.classList.add('active');
  if (sidebar) sidebar.classList.add('active');
};
`;
appJs = appJs + removeHotFn;
fs.writeFileSync('app.js', appJs);

// --- 3. server.js ---
let serverJs = fs.readFileSync('server.js', 'utf8');
serverJs = serverJs.replace(
  /socket\.on\('disconnect',\s*\(\)\s*=>\s*\{/,
  `socket.on('remove_hot', (channelId) => {
    if (!channelId || !hotChannels.has(channelId)) return;
    hotChannels.delete(channelId);
    delete hotChannelsData[channelId];
    saveHotChannels();
    io.emit('hot_update', { channelId, isHot: false });
  });

  socket.on('disconnect', () => {`
);
fs.writeFileSync('server.js', serverJs);

console.log("Successfully applied all modifications for Remove Hot feature");
