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

## Preview
<img width="1053" height="921" alt="Screenshot 2026-01-29 at 11 41 00 AM" src="https://github.com/user-attachments/assets/35c8661a-12cd-491f-8fb2-c26c8611336c" />
<img width="1047" height="871" alt="Screenshot 2026-01-29 at 11 43 14 AM" src="https://github.com/user-attachments/assets/dd9b34db-a672-410e-b4ce-e0ad92b981e2" />
<img width="1045" height="753" alt="Screenshot 2026-01-29 at 11 43 23 AM" src="https://github.com/user-attachments/assets/99188389-d80b-4f5f-bd56-25bb26e3663b" />
<img width="1044" height="546" alt="Screenshot 2026-01-29 at 11 43 31 AM" src="https://github.com/user-attachments/assets/dabd5f5a-10f0-4aa5-a4eb-a0c85e8d4973" />


## Data

Data syncs to Google Sheets automatically. Local backup stored in browser localStorage.
