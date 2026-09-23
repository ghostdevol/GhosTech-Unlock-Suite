{
  "license": {
    "required": true,
    "validate_url": "https://ghosttoolspro.com/validate"
  },
  "device_check": {
    "min_android_version": 8,
    "block_if_rooted": false
  },
  "ownership": {
    "require_consent": true,
    "consent_overlay": "ghost_consent.html"
  },
  "actions": {
    "flash": true,
    "unlock": true,
    "frp_bypass": true,
    "mirror": {
      "enabled": true,
      "min_android_version": 11
    }
  },
  "logging": {
    "enabled": true,
    "log_path": "logs/session.json",
    "log_fields": ["timestamp", "action", "device_id", "license_key"]
  }
}
