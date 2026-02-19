// engine/adb.js
// Simplified ADB wrapper for all modules

// Run an ADB command and return output
export async function run(cmd) {
    return new Promise((resolve) => {
        try {
            // Termux ADB interface (simplified)
            window.ADBInterface.run(cmd, (output) => {
                resolve(output.trim());
            });
        } catch (err) {
            resolve("");
        }
    });
}

// Reboot into a specific mode
export async function reboot(mode) {
    switch (mode) {
        case "recovery":
            return await run("reboot recovery");
        case "bootloader":
            return await run("reboot bootloader");
        case "edl":
            return await run("reboot edl");
        default:
            return await run("reboot");
    }
}

// Push a file to the device
export async function push(local, remote) {
    return await run(`push ${local} ${remote}`);
}

// Pull a file from the device
export async function pull(remote, local) {
    return await run(`pull ${remote} ${local}`);
}

// Check if ADB is connected
export async function isConnected() {
    const out = await run("devices");
    return out.includes("device");
}