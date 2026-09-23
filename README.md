# GhostTech ADB-Tool

Windows desktop app (Electron) for Android device servicing: FRP routines, network unlock via carrier-firmware reflash, firmware flashing, screen mirroring, consent logging, and a credit-based licensing system.

## Requirements

- Node.js 18+
- Android platform-tools (`adb` / `fastboot`) — install them and put them on PATH, **or** drop `adb.exe` (+ `AdbWinApi.dll`, `AdbWinUsbApi.dll`) into `assets/`
- [scrcpy](https://github.com/Genymobile/scrcpy) on PATH for screen mirroring
- Samsung Odin3 (place `Odin3.exe` in `assets/tools/Odin3/`) — **not bundled**, download it yourself

## Install & run

```powershell
npm install
npm start
```

Build a portable Windows exe:

```powershell
npm run build
```

## How it works

- Connect a device with USB debugging authorized. The app detects brand/model automatically.
- Every unlock requires the ownership-consent checkbox. Consent is logged to a PDF + `consent.log` in the app data folder.
- Credits are deducted **only after an operation reports success**. Failed operations never cost credits.
- Operation logs live in `%APPDATA%\ghosttech-adb-tool\`.

## Licensing

Two license types, both read from `%APPDATA%\ghosttech-adb-tool\`:

1. **Subscription** — `license.json` with an `expiry` date (sold via Gumroad).
2. **Master key** — `master.license.json`, an Ed25519-signed license. Unlimited credits, never expires. The private signing key is held offline by the owner and is **never** in this repo; only the public key ships with the app (`lib/license.js`).

To mint a master license (owner only, requires the private key):

```powershell
node tools-local/mint-master.js   # not included in this repo
```

## Honest limits

- The FRP routine uses the documented ADB flow (`gsf.login` clear). It requires authorized ADB and only works on builds where the Setup Wizard still exposes that path. It will tell you when it can't proceed.
- Network unlock for non-Samsung brands is not automated — carrier codes come from carriers.
- Partition flashing is intentionally manual per device. The tool gets you to fastboot and verifies the device; it won't guess your partition table.

## Project layout

```
main.js            Electron shell, license gate, splash
lib/license.js     Ed25519 license verification (public key embedded)
loader.js          device ops: FRP / network / flash, credits, logging
mirror.js          scrcpy launcher
index.html         UI
splash.html        splash screen
assets/            scripts, ini configs, solution/testpoint data
legacy-web/        original web-prototype skeleton (superseded)
```

## License

MIT — see LICENSE.
