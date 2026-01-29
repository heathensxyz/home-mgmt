# Solar Power Tracker

A comprehensive web app for tracking your solar production, SDGE usage, and household activities with **automatic weather integration** and **anomaly detection**.

## Quick Start

1. **Open the app**: Double-click `solar_tracker_app.html` to open in your browser
2. **Your data is already loaded**: 31 days of Sunrun data and 25 days of SDGE data are pre-loaded
3. **Weather loads automatically**: Real-time weather data for Encinitas (92024)

## Features

### Dashboard
- **Yesterday's Summary** (primary view) - SDGE data isn't available same-day
- Real-time TOU (Time-of-Use) period indicator with current rate
- Weather widget with 3-day forecast from Open-Meteo API
- **Anomaly Detection** - Automatic alerts if solar production is below expected
- Solar chart with weather-adjusted expected production line
- Color-coded bars: Green (good), Amber (ok), Orange (below expected), Red (check panels)
- TOU breakdown pie chart
- Monthly cost estimates

### Weather Integration
- Automatic weather data for Encinitas, CA (92024)
- Shows yesterday's conditions with sunshine hours
- Today and tomorrow forecast
- Expected solar production based on weather conditions
- Weather conditions stored for historical analysis

### Anomaly Detection
The app automatically checks for:
- **Weather-adjusted underperformance**: Production significantly below expected for weather conditions
- **Sudden drops**: Unexpected decrease compared to previous day with similar weather
- **Consistent underperformance**: Multiple days below expected (may indicate system issues)

When detected, a red alert banner appears with specific recommendations.

### Daily Input
- **Sunrun Production**: Log daily solar production (kWh)
- **SDGE Summary**: Enter daily consumption, generation, and TOU breakdown
- **Quick entry**: View and edit recent entries

### Activities Log
- Track when you run appliances (laundry, dishwasher, EV charging, etc.)
- Automatic cost estimation based on TOU period and appliance power
- Activity impact analysis chart

### Import/Export
- Import SDGE Green Button CSV files directly
- Import Sunrun CSV data
- Export all data as JSON or CSV

## EV-TOU-5 Rate Schedule (CEA Customer)

| Period | Rate | Hours |
|--------|------|-------|
| Super Off-Peak | $0.133/kWh | 12am-6am daily, 12am-2pm weekends |
| Off-Peak | $0.419/kWh | 6am-4pm, 9pm-12am weekdays |
| On-Peak | $0.419/kWh | 4pm-9pm daily |
| Export Credit | $0.04/kWh | When selling to grid |

## Weather-Adjusted Expected Production

The app calculates expected solar production for your 5.985 kW system based on:
- **Month**: January ~22 kWh/day, June ~36 kWh/day (clear day)
- **Weather code**: Clear (100%), Partly cloudy (85%), Overcast (50%), Rain (25%)
- **Sunshine hours**: Reported by weather API

Chart colors indicate performance vs expected:
- 🟢 Green: ≥90% of expected
- 🟡 Amber: 70-90% of expected
- 🟠 Orange: 50-70% of expected
- 🔴 Red: <50% of expected (check for issues!)

## Data Storage

All data is stored in your browser's localStorage. To backup:
1. Go to Settings → Export All Data
2. Save the JSON file

To restore:
1. Go to Import tab
2. Upload your backup file

## Files in This Folder

- `solar_tracker_app.html` - Main app (open in browser)
- `preload_data.py` - Script to re-import CSV data if needed
- `data/` - CSV data files
- `scripts/power_analyzer.py` - Python analysis script

## Tips for Maximum Savings

1. **Charge EV 12am-6am** - Only 13.3¢/kWh vs 41.9¢ during other times
2. **Run dishwasher/laundry before 6am** - Or on weekend mornings
3. **Avoid 4-9pm for heavy appliances** - Peak demand period
4. **Use solar hours (10am-3pm)** - For daytime loads when panels are producing

## Troubleshooting

**Anomaly alert showing?**
1. Check the weather - was it actually cloudier than reported?
2. Look for new shading (tree growth, new construction)
3. Check for dirt/debris on panels
4. Contact Sunrun if issue persists multiple clear days

**Weather not loading?**
- The app uses Open-Meteo API (free, no key required)
- Check your internet connection
- Weather will show "Unable to load" if API is down

---
System: 5.985 kW Solar | Rate: EV-TOU-5 | Provider: SDG&E + Clean Energy Alliance
Location: Encinitas, CA 92024
