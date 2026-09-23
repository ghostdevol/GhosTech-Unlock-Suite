#!/bin/bash

echo "=========================================="
echo "GhostTech | ADB-Tool | Consent-Driven Unlock Service"
echo "Owned by Ghostdevol"
echo "=========================================="

read -p "Full Name: " fullname
read -p "Email Address: " email
read -p "Do you own the device you're unlocking? (yes/no): " ownership
read -p "Type 'I AGREE' to accept the terms and conditions: " agreement

if [[ "$ownership" != "yes" || "$agreement" != "I AGREE" ]]; then
  echo "❌ Consent not granted. Exiting."
  exit 1
fi

session_id="GhostTech-ADB-$(date +%Y%m%d-%H%M%S)"
echo "✅ Consent recorded. Session ID: $session_id"

# Save to JSON via Node.js
node adbtool-consent-log.js "$fullname" "$email" "$ownership" "$agreement" "$session_id"
