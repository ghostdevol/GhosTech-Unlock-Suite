// engine/network.js
// Simplified Network Unlock logic (IMEI + lock state + routine selection)

import * as ADB from './adb.js';
import * as Device from './device.js';

// Main entry point
export async function run() {
    try {
        // 1. Get device info
        const info = await Device.getInfo();
        if (!info) {
            return "No device detected.";
        }

        // 2. Read IMEI
        const imei = await getIMEI();
        if (!imei) {
            return "Unable to read IMEI.";
        }

        // 3. Check lock state (simplified)
        const locked = await isCarrierLocked();

        // 4. Choose routine
        if (!locked) {
            return `Device is already unlocked (IMEI: ${imei}).`;
        }

        // 5. Run simplified unlock routine
        const result = await unlockRoutine(info.brand.toLowerCase());

        return `${result} (IMEI: ${imei})`;

    } catch (err) {
        return "Network Unlock failed.";
    }
}

// ===== Helpers =====

// Read IMEI (simplified)
async function getIMEI() {
    const out = await ADB.run("shell service call iphonesubinfo 1");
    return out ? out.replace(/\D/g, "").slice(0, 15) : null;
}

// Check if carrier lock is active (simplified)
async function isCarrierLocked() {
    const out = await ADB.run("shell getprop ril.simstate");
    return out && out.includes("LOCKED");
}

// ===== Unlock Routine Selector =====
async function unlockRoutine(brand) {
    switch (brand) {
        case "samsung":
            return await samsungUnlock();
        case "motorola":
            return await motoUnlock();
        case "lg":
            return await lgUnlock();
        default:
            return await genericUnlock();
    }
}

// ===== Brand Routines (Simplified placeholders) =====

async function samsungUnlock() {
    await ADB.run("shell am start -a android.settings.NETWORK_OPERATOR_SETTINGS");
    return "Samsung Network Unlock routine executed.";
}

async function motoUnlock() {
    await ADB.run("shell am start -n com.android.settings/.Settings");
    return "Motorola Network Unlock routine executed.";
}

async function lgUnlock() {
    await ADB.run("shell am start -a android.settings.DATA_ROAMING_SETTINGS");
    return "LG Network Unlock routine executed.";
}

async function genericUnlock() {
    await ADB.run("shell am start -a android.settings.WIRELESS_SETTINGS");
    return "Generic Network Unlock routine executed.";
}