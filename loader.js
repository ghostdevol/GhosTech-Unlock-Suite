// ===== IMPORT ENGINE MODULES =====
import * as Device from './engine/device.js';
import * as FRP from './engine/frp.js';
import * as Network from './engine/network.js';
import * as ADB from './engine/adb.js';

// ===== UI GLUE LOGIC =====

// Log output element
const logBox = document.getElementById("log-output");

function log(message) {
    const timestamp = new Date().toLocaleTimeString();
    logBox.textContent += `\n[${timestamp}] ${message}`;
    logBox.scrollTop = logBox.scrollHeight;
}

// Update device info panel
function updateDeviceInfo(info) {
    const status = document.getElementById("device-status");
    const details = document.getElementById("device-details");

    if (!info) {
        status.textContent = "Waiting for device...";
        details.innerHTML = "";
        return;
    }

    status.textContent = `${info.brand} ${info.model}`;
    details.innerHTML = `
        <li>Android: ${info.android}</li>
        <li>Build: ${info.build}</li>
        <li>Security Patch: ${info.patch}</li>
        <li>FRP: ${info.frp}</li>
        <li>OEM Lock: ${info.oem}</li>
    `;
}

// Poll device.js for device state
async function checkDeviceLoop() {
    while (true) {
        try {
            const info = await Device.getInfo();
            updateDeviceInfo(info);
        } catch (e) {
            updateDeviceInfo(null);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}

// ===== BUTTON ACTIONS =====

async function runFRP() {
    log("Starting FRP Unlock...");
    const result = await FRP.run();
    log(result);
}

async function runNetwork() {
    log("Starting Network Unlock...");
    const result = await Network.run();
    log(result);
}

async function openOEM() {
    log("Opening OEM Tools...");
}

async function openFastboot() {
    log("Opening Fastboot Tools...");
}

// ===== STARTUP =====

window.onload = () => {
    log("GhosTech Unlock Suite Initialized");
    checkDeviceLoop();
};