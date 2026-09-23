const { exec } = require('child_process');

function launchScrcpy() {
  exec('scrcpy', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Scrcpy failed to launch:', err.message);
      return;
    }
    console.log('✅ Scrcpy launched successfully.');
  });
}

module.exports = { launchScrcpy };
