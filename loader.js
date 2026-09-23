const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const PDFDocument = require('pdfkit');
const { isMasterLicense, userDataDir } = require('./lib/license');

// GhostTech ADB-Tool - device operations.
//
// Rules this module follows:
//  1. Preconditions (device present + authorized) are checked before anything runs.
//  2. Credits are deducted ONLY after an operation reports success.
//  3. Failures are reported honestly - never a fake "unlocked" message.

const assetsPath = path.join(__dirname, 'assets');
const firmwarePath = path.join(assetsPath, 'firmware');
const manifestPath = path.join(assetsPath, 'manifests');
const creditPath = path.join(userDataDir(), 'credits.json');
const logPath = path.join(userDataDir(), 'unlock.log');
const consentLogPath = path.join(userDataDir(), 'consent.log');

// Prefer a bundled adb.exe, fall back to PATH.
function adbBin() {
  const bundled = path.join(assetsPath, 'adb.exe');
  return fs.existsSync(bundled) ? `"${bundled}"` : 'adb';
}

function run(cmd, timeoutMs = 45000) {
  try {
    const out = execSync(cmd, { timeout: timeoutMs, windowsHide: true }).toString();
    return { ok: true, out: out.trim() };
  } catch (e) {
    const out = (((e.stdout || '') + '\n' + (e.stderr || '')).trim()) || e.message;
    return { ok: false, out };
  }
}

function deviceState() {
  const r = run(`${adbBin()} get-state`);
  return r.ok ? r.out.split('\n')[0].trim() : null;
}

function detectDeviceModel() {
  const r = run(`${adbBin()} shell getprop ro.product.model`);
  return (r.ok && r.out) ? r.out : null;
}

function detectBrand() {
  const r = run(`${adbBin()} shell getprop ro.product.brand`);
  return (r.ok && r.out) ? r.out : '';
}

function getCredits() {
  if (isMasterLicense()) return Infinity;
  try {
    const data = JSON.parse(fs.readFileSync(creditPath, 'utf8'));
    return data.credits || 0;
  } catch { return 0; }
}

function deductCredits(amount) {
  if (isMasterLicense()) return true; // owner master key: cryptographically verified
  try {
    const data = JSON.parse(fs.readFileSync(creditPath, 'utf8'));
    if ((data.credits || 0) < amount) return false;
    data.credits -= amount;
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(creditPath, JSON.stringify(data, null, 2));
    return true;
  } catch { return false; }
}

function loadFirmware() {
  if (!fs.existsSync(firmwarePath)) return [];
  return fs.readdirSync(firmwarePath).filter(item => {
    const p = path.join(firmwarePath, item);
    try { return item.endsWith('.zip') || fs.statSync(p).isDirectory(); }
    catch { return false; }
  });
}

function findLocalFirmware(model) {
  if (!model) return [];
  const needle = model.toLowerCase();
  return loadFirmware().filter(f => f.toLowerCase().includes(needle));
}

function getManifest() {
  if (!fs.existsSync(manifestPath)) return null;
  const files = fs.readdirSync(manifestPath).filter(f => f.includes('manifest') && f.endsWith('.json'));
  if (files.length === 0) return null;
  try { return JSON.parse(fs.readFileSync(path.join(manifestPath, files[0]), 'utf8')); }
  catch { return null; }
}

function logUnlock(mode, model, detail) {
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${mode} on ${model}: ${detail}\n`);
}

function logConsent(model) {
  fs.appendFileSync(consentLogPath, `[${new Date().toISOString()}] Consent confirmed for device: ${model}\n`);
}

function generateConsentPDF(model) {
  const doc = new PDFDocument();
  const filePath = path.join(userDataDir(), `consent_${Date.now()}.pdf`);
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(14).text('GhostTech Device Ownership Agreement', { align: 'center' });
  doc.moveDown();
  doc.text(`Device Model: ${model}`);
  doc.text(`Date: ${new Date().toLocaleString()}`);
  doc.text('I confirm I am the legal owner or authorized technician of this device.');
  doc.end();
  return filePath;
}

function searchOnlineFirmware(model) {
  const query = encodeURIComponent(`${model} firmware site:xda-developers.com`);
  require('electron').shell.openExternal(`https://www.google.com/search?q=${query}`);
}

// ---------------------------------------------------------------------------
// Real device operations
// ---------------------------------------------------------------------------

// FRP routine: documented ADB flow. Requires authorized ADB and only works on
// builds where the Setup Wizard still exposes the login activity.
function frpRoutine() {
  const a = run(`${adbBin()} shell am start -n com.google.android.gsf.login/`);
  if (!a.ok) return { ok: false, out: 'Could not launch the login activity: ' + a.out };
  const b = run(`${adbBin()} shell pm clear com.google.android.gsf.login`);
  if (!b.ok) return { ok: false, out: 'Could not clear GSF login data: ' + b.out };
  return { ok: true, out: 'GSF login data cleared. Reboot the device and complete setup.' };
}

function odinBin() {
  const candidates = [
    path.join(assetsPath, 'tools', 'Odin3', 'Odin3.exe'),
    path.join(assetsPath, 'Odin3.exe')
  ];
  return candidates.find(p => fs.existsSync(p)) || null;
}

// Network unlock via carrier-firmware reflash (Samsung/Odin). Other brands are
// not automated: carrier unlock codes must come from the carrier.
function networkRoutine(brand) {
  if (/samsung/i.test(brand || '')) {
    const odin = odinBin();
    if (!odin) {
      return { ok: false, out: 'Samsung detected but Odin3.exe was not found in assets/tools/Odin3/. Place it there and retry.' };
    }
    exec(`"${odin}"`);
    return { ok: true, out: 'Odin launched. Flash unbranded/carrier firmware to complete the network unlock.' };
  }
  return { ok: false, out: `Network unlock is not automated for "${brand || 'this brand'}". Carrier unlock codes must come from the carrier.` };
}

// Flash: reboot to bootloader and verify fastboot. Partition flashing stays
// manual per device - the tool will not guess your partition table.
function flashRoutine(firmwareFile, brand) {
  if (/samsung/i.test(brand || '')) return networkRoutine(brand); // same Odin path
  const r = run(`${adbBin()} reboot bootloader`, 30000);
  if (!r.ok) return { ok: false, out: 'Could not reboot to bootloader: ' + r.out };
  const f = run('fastboot devices', 20000);
  if (!f.ok || !f.out) return { ok: false, out: 'Device did not reappear in fastboot mode.' };
  return { ok: true, out: `Device in fastboot mode (${f.out.split('\n')[0]}). Flash "${firmwareFile || 'firmware'}" partitions manually.` };
}

function runUnlockSequence(mode, firmwareFile) {
  const brand = detectBrand();
  const model = detectDeviceModel() || 'Unknown';
  const state = deviceState();

  if (!state) { console.error('[!!] No device detected. Connect a device and retry.'); return; }
  if (state === 'unauthorized') { console.error('[!!] Device unauthorized. Accept the RSA prompt on the device screen, then retry.'); return; }
  if (state !== 'device') { console.error(`[!!] Device state is "${state}" - expected "device".`); return; }

  console.log(`[>] [${mode}] ${brand} ${model} (${firmwareFile || 'no firmware selected'})`);

  const cost = mode === 'FRP' ? 2 : mode === 'Network' ? 3 : 1;
  let result;
  if (mode === 'FRP') result = frpRoutine();
  else if (mode === 'Network') result = networkRoutine(brand);
  else result = flashRoutine(firmwareFile, brand);

  if (!result.ok) {
    console.error('[!!] Operation failed - no credits deducted. ' + result.out);
    return;
  }
  if (!deductCredits(cost)) {
    console.error(`[!!] Not enough credits for ${mode} unlock. Required: ${cost}.`);
    return;
  }
  console.log(`[OK] ${result.out} (${cost} credit${cost > 1 ? 's' : ''} deducted.)`);
  logUnlock(mode, `${brand} ${model}`, firmwareFile || result.out);
  logConsent(`${brand} ${model}`);
  generateConsentPDF(`${brand} ${model}`);
}

module.exports = {
  loadFirmware,
  findLocalFirmware,
  getManifest,
  detectDeviceModel,
  detectBrand,
  deviceState,
  runUnlockSequence,
  getCredits,
  deductCredits,
  searchOnlineFirmware
};
