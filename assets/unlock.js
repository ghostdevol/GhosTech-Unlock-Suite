const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function runUnlock(brand, model, callback) {
  const batPath = path.join(__dirname, 'network-unlock.bat');
  exec(`"${batPath}" ${brand} ${model}`, (err, stdout) => {
    const timestamp = new Date().toISOString();
    const logEntry = `GhostTech Unlock | ${timestamp} | ${brand} ${model} | ${stdout}`;
    fs.appendFileSync(path.join(__dirname, 'logs', 'unlock_log.txt'), logEntry + '\n');
    callback(err, stdout);
  });
}

module.exports = { runUnlock };
