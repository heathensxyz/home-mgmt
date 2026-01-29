#!/usr/bin/env python3
"""
Solar Power Analysis System
Configured for: 5.985kW Solar + EV + Clean Energy Alliance (CEA)
Rate Plan: EV-TOU-5 (optimized for EV charging + solar)

Location: Encinitas, CA
Utility: SDG&E (delivery) + Clean Energy Alliance (generation)
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import json

class PowerAnalyzer:
    """Main analysis class for solar power optimization."""

    def __init__(self, data_dir="data"):
        self.data_dir = Path(data_dir)
        self.solar_capacity_kw = 5.985
        self.utility = "SDG&E"
        self.cca = "Clean Energy Alliance (CEA)"
        self.rate_plan = "EV-TOU-5"

        # =================================================================
        # EV-TOU-5 RATES (SDG&E Delivery for CCA Customers)
        # From official SDG&E rate schedule - January 2026
        # =================================================================

        # SDG&E Delivery charges (from your screenshots)
        self.delivery_rates = {
            'super_off_peak': 0.043,  # 4.3¢/kWh
            'off_peak': 0.329,        # 32.9¢/kWh
            'on_peak': 0.329,         # 32.9¢/kWh
        }

        # CEA Generation charges (approximate - check your bill for exact)
        self.generation_rate = 0.09  # ~9¢/kWh average

        # Total rates (Delivery + Generation)
        self.rates = {
            'super_off_peak': self.delivery_rates['super_off_peak'] + self.generation_rate,  # ~13.3¢
            'off_peak': self.delivery_rates['off_peak'] + self.generation_rate,              # ~41.9¢
            'on_peak': self.delivery_rates['on_peak'] + self.generation_rate,                # ~41.9¢
        }

        # NEM export credit (approximate wholesale rate)
        self.export_credit = 0.04  # ~4¢/kWh

        # =================================================================
        # EV-TOU-5 TIME PERIODS
        # =================================================================
        # Super Off-Peak:
        #   - Midnight - 6:00 AM (all days)
        #   - 10:00 AM - 2:00 PM weekdays in March & April only
        #   - Midnight - 2:00 PM weekends & holidays
        # On-Peak:
        #   - 4:00 PM - 9:00 PM (every day)
        # Off-Peak:
        #   - All other hours

        # Typical appliance power consumption (kW)
        self.appliance_power = {
            'Laundry - Washer': 0.5,
            'Laundry - Dryer': 3.0,
            'Dishwasher': 1.8,
            'Oven/Stove': 2.5,
            'Microwave': 1.2,
            'TV - Living Room': 0.15,
            'TV - Bedroom': 0.1,
            'Computer/Desktop': 0.3,
            'Gaming Console': 0.2,
            'Hair Dryer': 1.5,
            'Vacuum': 1.0,
            'Iron': 1.2,
            'Pool Pump': 1.5,
            'AC Running': 3.5,
            'Space Heater': 1.5,
            'EV Charging': 7.0,
            'Hot Tub/Spa': 4.0,
        }

        # Data storage
        self.sdge_data = None
        self.sunrun_data = None
        self.activity_data = None
        self.aggregated_data = None

    def get_tou_period(self, dt, is_weekend=False):
        """
        Determine TOU period for EV-TOU-5 rate schedule.

        Super Off-Peak:
          - 12am-6am all days
          - 10am-2pm weekdays in March & April
          - 12am-2pm weekends & holidays
        On-Peak:
          - 4pm-9pm every day
        Off-Peak:
          - All other hours
        """
        hour = dt.hour
        month = dt.month
        is_spring = month in [3, 4]  # March and April

        # Super off-peak: midnight to 6am (all days)
        if 0 <= hour < 6:
            return 'super_off_peak'

        # Super off-peak: 10am-2pm weekdays in March/April
        if is_spring and not is_weekend and 10 <= hour < 14:
            return 'super_off_peak'

        # Super off-peak: midnight-2pm weekends/holidays
        if is_weekend and 0 <= hour < 14:
            return 'super_off_peak'

        # On-peak: 4pm-9pm every day
        if 16 <= hour < 21:
            return 'on_peak'

        # Everything else is off-peak
        return 'off_peak'

    def load_sdge_data(self, filepath, interval='15min'):
        """
        Load SDGE usage data from CSV export.
        Handles the standard SDGE Green Button format.
        """
        # Read file to detect format
        with open(filepath, 'r') as f:
            first_lines = [f.readline() for _ in range(20)]

        # Find the header row (contains "Meter Number,Date,Start Time")
        skip_rows = 0
        for i, line in enumerate(first_lines):
            if 'Date' in line and 'Start Time' in line:
                skip_rows = i
                break

        df = pd.read_csv(filepath, skiprows=skip_rows)

        # Clean column names
        df.columns = df.columns.str.strip().str.replace('"', '')

        # Parse datetime
        if 'Date' in df.columns and 'Start Time' in df.columns:
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

        # Rename for consistency
        if 'Consumption' in df.columns:
            df = df.rename(columns={'Consumption': 'consumption', 'Generation': 'generation', 'Net': 'net'})

        # Add derived columns
        df['date'] = df['datetime'].dt.date
        df['hour'] = df['datetime'].dt.hour
        df['day_of_week'] = df['datetime'].dt.dayofweek
        df['is_weekend'] = df['day_of_week'] >= 5
        df['month'] = df['datetime'].dt.month

        # Classify TOU periods
        df['tou_period'] = df.apply(
            lambda row: self.get_tou_period(row['datetime'], row['is_weekend']),
            axis=1
        )

        # Calculate costs
        def calc_cost(row):
            net = row['net'] if 'net' in row else row.get('consumption', 0)
            if net > 0:  # Import from grid
                return net * self.rates[row['tou_period']]
            else:  # Export to grid
                return net * self.export_credit  # Negative cost = credit

        df['cost'] = df.apply(calc_cost, axis=1)

        self.sdge_data = df
        print(f"Loaded {len(df)} SDGE records")
        print(f"Date range: {df['datetime'].min()} to {df['datetime'].max()}")
        print(f"Rate plan: {self.rate_plan}")
        return df

    def load_sunrun_data(self, filepath):
        """Load Sunrun production data from CSV."""
        df = pd.read_csv(filepath)
        df.columns = df.columns.str.lower().str.strip()

        # Find date and production columns
        date_cols = ['date', 'datetime', 'timestamp']
        prod_cols = ['production', 'kwh', 'production (kwh)', 'production_kwh', 'generated', 'energy']

        date_col = next((c for c in date_cols if c in df.columns), None)
        prod_col = next((c for c in prod_cols if c in df.columns), None)

        if date_col:
            df = df.rename(columns={date_col: 'datetime'})
            df['datetime'] = pd.to_datetime(df['datetime'], errors='coerce')
            df['date'] = df['datetime'].dt.date

        if prod_col:
            df = df.rename(columns={prod_col: 'production_kwh'})
            df['production_kwh'] = pd.to_numeric(df['production_kwh'], errors='coerce')

        self.sunrun_data = df
        print(f"Loaded {len(df)} Sunrun records")
        return df

    def load_activity_data(self, filepath):
        """Load household activity log from Excel."""
        df = pd.read_excel(filepath, sheet_name='Activity Log', skiprows=2)
        df.columns = ['date', 'start_time', 'end_time', 'activity', 'location', 'notes', 'est_kw']

        df = df.dropna(subset=['date', 'activity'])
        df['date'] = pd.to_datetime(df['date'], errors='coerce').dt.date

        # Parse times and calculate duration
        def parse_time(t):
            if pd.isna(t):
                return None
            if isinstance(t, str):
                try:
                    return datetime.strptime(t, '%H:%M').time()
                except:
                    return None
            return t

        df['start_time'] = df['start_time'].apply(parse_time)
        df['end_time'] = df['end_time'].apply(parse_time)

        def calc_duration(row):
            if pd.isna(row['start_time']) or pd.isna(row['end_time']):
                return 1.0
            start = datetime.combine(datetime.today(), row['start_time'])
            end = datetime.combine(datetime.today(), row['end_time'])
            if end < start:
                end += timedelta(days=1)
            return (end - start).total_seconds() / 3600

        df['duration_hours'] = df.apply(calc_duration, axis=1)

        def estimate_kwh(row):
            kw = row['est_kw'] if pd.notna(row['est_kw']) and row['est_kw'] > 0 else self.appliance_power.get(row['activity'], 0.5)
            return kw * row['duration_hours']

        df['est_kwh'] = df.apply(estimate_kwh, axis=1)

        self.activity_data = df
        print(f"Loaded {len(df)} activity records")
        return df

    def get_usage_summary(self):
        """Get summary statistics of usage data."""
        if self.sdge_data is None:
            return None

        df = self.sdge_data
        days = len(df['date'].unique())

        # Separate imports and exports
        imports_df = df[df['net'] > 0] if 'net' in df.columns else df[df['consumption'] > 0]
        exports_df = df[df['net'] < 0] if 'net' in df.columns else pd.DataFrame()

        total_import = imports_df['net'].sum() if 'net' in imports_df.columns else imports_df['consumption'].sum()
        total_export = abs(exports_df['net'].sum()) if len(exports_df) > 0 else 0
        total_consumption = df['consumption'].sum() if 'consumption' in df.columns else total_import
        total_generation = df['generation'].sum() if 'generation' in df.columns else 0

        # TOU breakdown
        tou_import = {}
        tou_cost = {}
        for period in ['super_off_peak', 'off_peak', 'on_peak']:
            period_df = imports_df[imports_df['tou_period'] == period]
            tou_import[period] = period_df['net'].sum() if 'net' in period_df.columns else period_df['consumption'].sum()
            tou_cost[period] = tou_import[period] * self.rates[period]

        # Calculate total cost
        import_cost = sum(tou_cost.values())
        export_credit = total_export * self.export_credit
        net_cost = import_cost - export_credit

        return {
            'days': days,
            'total_consumption_kwh': total_consumption,
            'total_generation_kwh': total_generation,
            'total_import_kwh': total_import,
            'total_export_kwh': total_export,
            'daily_avg_consumption': total_consumption / days,
            'daily_avg_import': total_import / days,
            'daily_avg_export': total_export / days,
            'tou_import_kwh': tou_import,
            'tou_cost': tou_cost,
            'import_cost': import_cost,
            'export_credit': export_credit,
            'net_cost': net_cost,
            'monthly_estimate': net_cost * 30 / days,
            'annual_estimate': net_cost * 365 / days,
        }

    def get_optimization_recommendations(self):
        """Generate recommendations for optimizing power usage."""
        recommendations = []
        summary = self.get_usage_summary()

        if summary is None:
            return recommendations

        # Check on-peak usage percentage
        total_import = summary['total_import_kwh']
        on_peak_import = summary['tou_import_kwh'].get('on_peak', 0)
        on_peak_pct = on_peak_import / total_import * 100 if total_import > 0 else 0

        if on_peak_pct > 25:
            potential_savings = on_peak_import * 0.3 * (self.rates['on_peak'] - self.rates['super_off_peak'])
            recommendations.append({
                'priority': 'HIGH',
                'category': 'Peak Usage',
                'issue': f'{on_peak_pct:.0f}% of your grid imports happen during on-peak (4-9pm)',
                'recommendation': 'Shift high-consumption activities to before 4pm or after 9pm. '
                                'Your EV-TOU-5 plan charges the same rate for on-peak and off-peak, '
                                'but shifting to super off-peak (before 6am) saves significantly.',
                'potential_savings': f'${potential_savings * 30 / summary["days"]:.0f}/month if you shift 30% to super off-peak'
            })

        # Check super off-peak utilization
        super_off_peak_import = summary['tou_import_kwh'].get('super_off_peak', 0)
        super_off_pct = super_off_peak_import / total_import * 100 if total_import > 0 else 0

        if super_off_pct > 40:
            recommendations.append({
                'priority': 'INFO',
                'category': 'EV Charging',
                'issue': f'Great! {super_off_pct:.0f}% of imports during super off-peak',
                'recommendation': 'Your EV charging timing is excellent. The 4.3¢ delivery rate '
                                f'is saving you ~${super_off_peak_import * (0.177 - 0.043):.0f} vs EV-TOU-2 rates.',
                'potential_savings': 'Already optimized!'
            })

        # Solar production check
        if summary['total_generation_kwh'] > 0:
            expected_daily = self.solar_capacity_kw * 4.5  # Conservative winter estimate
            actual_daily = summary['total_generation_kwh'] / summary['days']

            if actual_daily < expected_daily * 0.5:
                recommendations.append({
                    'priority': 'MEDIUM',
                    'category': 'Solar Production',
                    'issue': f'Solar producing {actual_daily:.1f} kWh/day (expected ~{expected_daily:.0f} kWh/day)',
                    'recommendation': 'Your solar production seems lower than expected for a 5.985kW system. '
                                    'This could be due to weather, shading, or system issues. '
                                    'Consider contacting Sunrun if this persists.',
                    'potential_savings': 'Varies based on issue'
                })

        # General tips
        recommendations.append({
            'priority': 'TIP',
            'category': 'Best Practices',
            'issue': 'Maximize your EV-TOU-5 benefits',
            'recommendation': 'Run dishwasher/laundry before 6am or on weekend mornings (super off-peak). '
                            'Use solar production hours (10am-3pm) for daytime loads. '
                            'Avoid 4-9pm for heavy appliances when possible.',
            'potential_savings': 'Ongoing savings'
        })

        return recommendations

    def generate_report(self, output_path='analysis_report.json'):
        """Generate a comprehensive analysis report."""
        summary = self.get_usage_summary()
        recommendations = self.get_optimization_recommendations()

        report = {
            'generated_at': datetime.now().isoformat(),
            'configuration': {
                'solar_capacity_kw': self.solar_capacity_kw,
                'utility': self.utility,
                'cca': self.cca,
                'rate_plan': self.rate_plan,
                'rates': {
                    'super_off_peak': f"${self.rates['super_off_peak']:.3f}/kWh ({self.delivery_rates['super_off_peak']*100:.1f}¢ delivery + {self.generation_rate*100:.0f}¢ gen)",
                    'off_peak': f"${self.rates['off_peak']:.3f}/kWh ({self.delivery_rates['off_peak']*100:.1f}¢ delivery + {self.generation_rate*100:.0f}¢ gen)",
                    'on_peak': f"${self.rates['on_peak']:.3f}/kWh ({self.delivery_rates['on_peak']*100:.1f}¢ delivery + {self.generation_rate*100:.0f}¢ gen)",
                    'export_credit': f"${self.export_credit:.3f}/kWh",
                }
            },
            'summary': summary,
            'recommendations': recommendations,
        }

        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2, default=str)

        print(f"Report saved to {output_path}")
        return report

    def print_summary(self):
        """Print a formatted summary to console."""
        summary = self.get_usage_summary()
        if summary is None:
            print("No data loaded.")
            return

        print("\n" + "=" * 60)
        print(f"SOLAR POWER ANALYSIS - {self.rate_plan}")
        print(f"{self.utility} + {self.cca}")
        print("=" * 60)

        print(f"\nPeriod: {summary['days']} days")
        print(f"Solar System: {self.solar_capacity_kw} kW")

        print(f"\n--- USAGE ---")
        print(f"Total Consumption:  {summary['total_consumption_kwh']:.1f} kWh")
        print(f"Solar Generation:   {summary['total_generation_kwh']:.1f} kWh")
        print(f"Grid Import:        {summary['total_import_kwh']:.1f} kWh")
        print(f"Grid Export:        {summary['total_export_kwh']:.1f} kWh")

        print(f"\n--- TIME-OF-USE BREAKDOWN ---")
        for period in ['super_off_peak', 'off_peak', 'on_peak']:
            kwh = summary['tou_import_kwh'][period]
            pct = kwh / summary['total_import_kwh'] * 100 if summary['total_import_kwh'] > 0 else 0
            cost = summary['tou_cost'][period]
            rate = self.rates[period]
            print(f"{period.replace('_', ' ').title():20} {kwh:7.1f} kWh ({pct:5.1f}%)  ${cost:7.2f}  @ ${rate:.3f}/kWh")

        print(f"\n--- COST SUMMARY ---")
        print(f"Import Cost:        ${summary['import_cost']:.2f}")
        print(f"Export Credit:     -${summary['export_credit']:.2f}")
        print(f"─" * 35)
        print(f"NET COST:           ${summary['net_cost']:.2f}")
        print(f"Monthly Estimate:   ${summary['monthly_estimate']:.2f}")
        print(f"Annual Estimate:    ${summary['annual_estimate']:.2f}")

        print(f"\n--- RECOMMENDATIONS ---")
        for rec in self.get_optimization_recommendations():
            print(f"\n[{rec['priority']}] {rec['category']}")
            print(f"  {rec['issue']}")
            print(f"  → {rec['recommendation']}")


def main():
    """Run analysis on available data."""
    # Set up paths relative to script location
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / 'data'

    analyzer = PowerAnalyzer(data_dir=data_dir)

    print("=" * 60)
    print("SOLAR POWER ANALYSIS SYSTEM")
    print(f"Rate Plan: {analyzer.rate_plan}")
    print(f"Provider: {analyzer.utility} + {analyzer.cca}")
    print("=" * 60)

    # Look for SDGE data
    sdge_files = list(data_dir.glob('*sdge*.csv')) + list(data_dir.glob('*SDGE*.csv'))
    if sdge_files:
        print(f"\nLoading: {sdge_files[0].name}")
        analyzer.load_sdge_data(sdge_files[0])
        analyzer.print_summary()
        analyzer.generate_report(data_dir / 'analysis_report.json')
    else:
        print("\nNo SDGE data found in data/ folder.")
        print("Export your usage data from sdge.com and save it here.")


if __name__ == "__main__":
    main()
