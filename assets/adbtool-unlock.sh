#!/bin/bash

echo "GhostTech | ADB-Tool Unlock Module"
echo "Owned by Ghostdevol"

adb devices | grep -w "device" > /dev/null
if [[ $? -ne 0 ]]; then
  echo "❌ No device detected."
  exit 1
fi

device_id=$(adb shell getprop ro.serialno)
model=$(adb shell getprop ro.product.model)
brand=$(adb shell getprop ro.product.brand)
imei=$(adb shell service call iphonesubinfo 1 | grep -oE '[0-9]{15}' | head -n 1)

echo "🔍 Device: $brand $model | Serial: $device_id | IMEI: $imei"
read -p "Type 'UNLOCK' to proceed: " confirm
if [[ "$confirm" != "UNLOCK" ]]; then
  echo "❌ Unlock aborted."
  exit 1
fi

adb reboot bootloader
sleep 5
fastboot flashing unlock

timestamp=$(date +%Y%m%d-%H%M%S)
session_id="GhostTech-UNLOCK-$timestamp"
echo "GhostTech Unlock | $timestamp | $brand $model | Serial: $device_id | IMEI: $imei | Method: fastboot flashing unlock" >> ./logs/unlock_log.txt
echo "✅ Unlock logged: $session_id"
