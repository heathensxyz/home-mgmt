#!/usr/bin/env python3
"""
Pre-load existing data into the Solar Tracker web app.
This script reads your existing SDGE and Sunrun CSV files and generates
a JavaScript file that pre-populates the app's localStorage.

Run this script, then open solar_tracker_app.html in your browser.
"""

import pandas as pd
import json
from pathlib import Path
from datetime import datetime

def get_tou_period(dt, is_weekend=False):
    """Determine TOU period for EV-TOU-5 rate schedule."""
    hour = dt.hour
    month = dt.month
    is_spring = month in [3, 4]

    if 0 <= hour < 6:
        return 'super_off_peak'
    if is_spring and not is_weekend and 10 <= hour < 14:
        return 'super_off_peak'
    if is_weekend and 0 <= hour < 14:
        return 'super_off_peak'
    if 16 <= hour < 21:
        return 'on_peak'
    return 'off_peak'

def process_sdge_csv(filepath):
    """Process SDGE Green Button CSV export."""
    print(f"Processing SDGE file: {filepath}")

    # Read file to find header row
    with open(filepath, 'r') as f:
        lines = f.readlines()

    header_idx = 0
    for i, line in enumerate(lines):
        if 'Date' in line and 'Start Time' in line:
            header_idx = i
            break

    df = pd.read_csv(filepath, skiprows=header_idx)
    df.columns = df.columns.str.strip().str.replace('"', '')

    # Parse datetime
    df['datetime'] = pd.to_datetime(
        df['Date'].str.strip().str.replace('"', '') + ' ' +
        df['Start Time'].str.strip().str.replace('"', ''),
        format='%m/%d/%Y %I:%M %p'
    )

    # Clean numeric columns
    for col in ['Consumption', 'Generation', 'Net']:
        if col in df.columns:
            df[col] = pd.to_numeric(
                df[col].astype(str).str.replace('"', '').str.strip(),
                errors='coerce'
            )

    # Add TOU period
    df['date'] = df['datetime'].dt.date
    df['day_of_week'] = df['datetime'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'] >= 5
    df['tou_period'] = df.apply(
        lambda row: get_tou_period(row['datetime'], row['is_weekend']),
        axis=1
    )

    # Aggregate by day
    daily_data = []
    for date, group in df.groupby('date'):
        # Get imports only (positive Net values)
        imports = group[group['Net'] > 0]

        day_entry = {
            'date': str(date),
            'consumption': float(group['Consumption'].sum()),
            'generation': float(group['Generation'].sum()),
            'net': float(group['Net'].sum()),
            'super_off_peak': float(imports[imports['tou_period'] == 'super_off_peak']['Net'].sum()),
            'off_peak': float(imports[imports['tou_period'] == 'off_peak']['Net'].sum()),
            'on_peak': float(imports[imports['tou_period'] == 'on_peak']['Net'].sum()),
        }
        daily_data.append(day_entry)

    print(f"  Processed {len(daily_data)} days of SDGE data")
    return daily_data

def process_sunrun_csv(filepath):
    """Process Sunrun production CSV."""
    print(f"Processing Sunrun file: {filepath}")

    df = pd.read_csv(filepath)
    df.columns = df.columns.str.lower().str.strip()

    sunrun_data = []
    for _, row in df.iterrows():
        entry = {
            'date': str(row['date']),
            'production_kwh': float(row['production_kwh']),
            'notes': row.get('notes', 'Imported from CSV'),
        }
        sunrun_data.append(entry)

    print(f"  Processed {len(sunrun_data)} days of Sunrun data")
    return sunrun_data

def main():
    script_dir = Path(__file__).parent
    data_dir = script_dir / 'data'

    # Find data files
    sdge_files = list(data_dir.glob('*sdge*.csv')) + list(data_dir.glob('*SDGE*.csv'))
    sunrun_files = list(data_dir.glob('*sunrun*.csv')) + list(data_dir.glob('*Sunrun*.csv'))

    data = {
        'sunrun': [],
        'sdge': [],
        'activities': [],
    }

    # Process SDGE
    if sdge_files:
        data['sdge'] = process_sdge_csv(sdge_files[0])
    else:
        print("No SDGE file found in data/ folder")

    # Process Sunrun
    if sunrun_files:
        data['sunrun'] = process_sunrun_csv(sunrun_files[0])
    else:
        print("No Sunrun file found in data/ folder")

    # Generate JavaScript preload file
    js_content = f"""// Auto-generated preload data
// Run this in browser console or include before opening the app

(function() {{
    const preloadData = {json.dumps(data, indent=2)};

    // Merge with existing data
    const existing = JSON.parse(localStorage.getItem('solarTrackerData') || '{{"sunrun":[],"sdge":[],"activities":[]}}');

    // Add new entries (don't overwrite existing)
    preloadData.sunrun.forEach(entry => {{
        if (!existing.sunrun.find(e => e.date === entry.date)) {{
            existing.sunrun.push(entry);
        }}
    }});

    preloadData.sdge.forEach(entry => {{
        if (!existing.sdge.find(e => e.date === entry.date)) {{
            existing.sdge.push(entry);
        }}
    }});

    localStorage.setItem('solarTrackerData', JSON.stringify(existing));
    console.log('Data preloaded successfully!');
    console.log('Sunrun records:', existing.sunrun.length);
    console.log('SDGE records:', existing.sdge.length);

    // Reload page to show data
    if (confirm('Data loaded! Reload page to see it?')) {{
        location.reload();
    }}
}})();
"""

    # Save JavaScript file
    js_path = script_dir / 'preload_data.js'
    with open(js_path, 'w') as f:
        f.write(js_content)

    print(f"\nGenerated: {js_path}")
    print("\nTo load your data:")
    print("1. Open solar_tracker_app.html in your browser")
    print("2. Open browser Developer Tools (Cmd+Option+I)")
    print("3. Go to Console tab")
    print("4. Copy and paste the contents of preload_data.js")
    print("5. Press Enter to run")

    # Also save as JSON for direct import
    json_path = script_dir / 'preload_data.json'
    with open(json_path, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\nAlso saved as JSON: {json_path}")
    print("You can import this directly via the app's Import tab.")

if __name__ == "__main__":
    main()
