# Solar Power Tracker

Personal dashboard for tracking solar production, utility usage, and household activities.

## Features

- **Dashboard**: Daily summary, weather integration, TOU period indicator
- **Anomaly Detection**: Alerts when production is below expected for weather conditions
- **Activity Logging**: Track appliance usage with automatic cost estimates
- **Data Import**: SDGE Green Button CSV and Sunrun CSV support
- **Google Sheets Sync**: Automatic cloud backup and cross-device access

## Setup

1. Open `solar_tracker_app.html` in browser
2. Configure Google Sheets sync in Settings (see `GOOGLE_SHEETS_SETUP.md`)

## Files

| File | Purpose |
|------|---------|
| `solar_tracker_app.html` | Main app |
| `google_apps_script.js` | Google Sheets API code |
| `scripts/power_analyzer.py` | Python analysis script |

## Data

Data syncs to Google Sheets automatically. Local backup stored in browser localStorage.
