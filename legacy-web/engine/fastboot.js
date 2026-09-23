// engine/fastboot.js
// Simplified Fastboot Tools logic (flash, partitions, reboot)

import * as ADB from './adb.js';

// ===== FASTBOOT WRAPPER =====

// Run a fastboot command
export async function run(cmd) {
    return new Promise((resolve) => {
        try {
            window.ADBInterface.fastboot(cmd, (output) => {
                resolve(output.trim());
            });
        } catch (err) {
            resolve("");
        }
    });
}

// Check if device is in fastboot mode
export async function isFastboot() {
    const out = await run("devices");
    return out && out.includes("fastboot");
}

// ===== PARTITION INFO =====
export async function getPartitions() {
    try {
        await ADB.reboot("bootloader");
        const out = await run("getvar all");
        return out || "Unable to read partition info.";
    } catch (err) {
        return "Partition info failed.";
    }
}

// ===== FLASHING (Simplified) =====
export async function flashPartition(partition, file) {
    try {
        await ADB.reboot("bootloader");
        const out = await run(`flash ${partition} ${file}`);
        return out || `Flashed ${partition}.`;
    } catch (err) {
        return `Failed to flash ${partition}.`;
    }
}

// ===== ERASE PARTITION =====
export async function erasePartition(partition) {
    try {
        await ADB.reboot("bootloader");
        const out = await run(`erase ${partition}`);
        return out || `Erased ${partition}.`;
    } catch (err) {
        return `Failed to erase ${partition}.`;
    }
}

// ===== REBOOT OPTIONS =====
export async function reboot(mode) {
    try {
        switch (mode) {
            case "recovery":
                return await run("reboot recovery");
            case "system":
                return await run("reboot");
            default:
                return await run("reboot");
        }
    } catch (err) {
        return `Failed to reboot to ${mode}.`;
    }
}

