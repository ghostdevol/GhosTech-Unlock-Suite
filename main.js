const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { isLicensed, isMasterLicense, userDataDir } = require('./lib/license');

function ensureRuntimeFiles() {
  fs.mkdirSync(userDataDir(), { recursive: true });
  const creditPath = path.join(userDataDir(), 'credits.json');
  if (!fs.existsSync(creditPath)) {
    const defaultCredits = { credits: 10, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(creditPath, JSON.stringify(defaultCredits, null, 2));
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 760,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile('index.html');
}

function showSplash() {
  const splash = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    transparent: true
  });
  splash.loadFile('splash.html');
  setTimeout(() => {
    splash.close();
    createWindow();
  }, 2500);
}

app.whenReady().then(() => {
  ensureRuntimeFiles();
  if (!isLicensed()) {
    const win = new BrowserWindow({ show: false });
    dialog.showMessageBoxSync(win, {
      type: 'error',
      title: 'License Required',
      message: 'No valid GhostTech license found.\n\nPurchase a subscription or place your master license in the app data folder to continue.',
      buttons: ['Exit']
    });
    app.quit();
    return;
  }
  if (isMasterLicense()) console.log('[GhostTech] Master license active - unlimited credits.');
  showSplash();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
