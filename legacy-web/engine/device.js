// engine/device.js
// Simplified device detection + property reader

export async function getInfo() {
    try {
        // 1. Check if any device is connected
        const devices = await runADB("devices");

        if (!devices || !devices.includes("device")) {
            return null; // No device connected
        }

        // 2. Read basic properties
        const brand  = await getProp("ro.product.brand");
        const model  = await getProp("ro.product.model");
        const android = await getProp("ro.build.version.release");
        const build  = await getProp("ro.build.display.id");
        const patch  = await getProp("ro.build.version.security_patch");

        // 3. Read lock states (simplified)
        const frp = await getProp("ro.frp.pst") ? "Locked" : "Unlocked";
        const oem = await getProp("ro.oem_unlock_supported") === "1"
            ? "Unlockable"
            : "Locked";

        // 4. Return clean JSON object
        return {
            brand,
            model,
            android,
            build,
            patch,
            frp,
            oem
        };

    } catch (err) {
        return null;
    }
}

// Helper: read a system property
async function getProp(prop) {
    return await runADB(`shell getprop ${prop}`);
}

// Helper: run ADB commands (simplified wrapper)
async function runADB(cmd) {
    return new Promise((resolve, reject) => {
        try {
            // Termux ADB command
            window.ADBInterface.run(cmd, (output) => {
                resolve(output.trim());
            });
        } catch (e) {
            resolve(null);
        }
    });
}