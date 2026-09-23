// engine/oem.js
// Simplified OEM Tools logic (OEM unlock, lock, bootloader commands)

import * as ADB from './adb.js';
import * as Device from './device.js';

// Main entry point (optional)
export async function open() {
    const info = await Device.getInfo();
    if (!info) {
        return "No device detected.";
    }
    return `OEM Tools ready for ${info.brand} ${info.model}.`;
}

// ===== OEM UNLOCK =====
export async function oemUnlock() {
    try {
        // Check if OEM unlock is supported
        const supported = await ADB.run("shell getprop ro.oem_unlock_supported");
        if (supported !== "1") {
            return "OEM Unlock not supported on this device.";
        }

        // Attempt simplified OEM unlock
        await ADB.run("shell settings put global oem_unlock_allowed 1");
        await ADB.reboot("bootloader");
        await ADB.run("oem unlock");

        return "OEM Unlock routine executed.";
    } catch (err) {
        return "OEM Unlock failed.";
    }
}

// ===== OEM LOCK =====
export async function oemLock() {
    try {
        await ADB.reboot("bootloader");
        await ADB.run("oem lock");
        return "OEM Lock routine executed.";
    } catch (err) {
        return "OEM Lock failed.";
    }
}

// ===== BOOTLOADER COMMANDS =====
export async function bootloaderInfo() {
    try {
        await ADB.reboot("bootloader");
        const info = await ADB.run("getvar all");
        return info || "Unable to read bootloader info.";
    } catch (err) {
        return "Bootloader info failed.";
    }
}

// ===== REBOOT OPTIONS =====
export async function rebootTo(mode) {
    try {
        await ADB.reboot(mode);
        return `Rebooting to ${mode}...`;
    } catch (err) {
        return `Failed to reboot to ${mode}.`;
    }
}

