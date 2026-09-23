// GhostTech ADB-Tool - license verification.
// Supports subscription licenses (license.json) and Ed25519-signed
// master licenses (master.license.json). The master private key is held
// offline by the owner; only the public key ships with the app.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MASTER_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEARwolDF7Fx+6as7pOKb3XO5s6kAe2C5kMRuStB3EN1RI=
-----END PUBLIC KEY-----`;

const MASTER_PAYLOAD_PREFIX = 'ghosttech-master-key-v1';

function userDataDir() {
  const base = process.env.APPDATA
    || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Roaming') : null)
    || process.cwd();
  return path.join(base, 'ghosttech-adb-tool');
}

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return null; }
}

// Master license file: { type: 'ghosttech-master', issued: '<ISO>', sig: '<base64>' }
function isMasterLicense() {
  const lic = readJson(path.join(userDataDir(), 'master.license.json'));
  if (!lic || lic.type !== 'ghosttech-master' || !lic.sig || !lic.issued) return false;
  try {
    const pub = crypto.createPublicKey(MASTER_PUBLIC_KEY);
    return crypto.verify(
      null,
      Buffer.from(MASTER_PAYLOAD_PREFIX + '|' + lic.issued),
      pub,
      Buffer.from(lic.sig, 'base64')
    );
  } catch { return false; }
}

function isSubscriptionValid() {
  const lic = readJson(path.join(userDataDir(), 'license.json'));
  if (!lic || !lic.expiry) return false;
  return new Date() < new Date(lic.expiry);
}

function isLicensed() {
  return isMasterLicense() || isSubscriptionValid();
}

module.exports = { isLicensed, isMasterLicense, isSubscriptionValid, userDataDir, MASTER_PAYLOAD_PREFIX };
