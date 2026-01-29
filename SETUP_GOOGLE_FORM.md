# Setting Up Your Solar Data Google Form

This guide walks you through creating a simple Google Form for logging your Sunrun production data. Takes about 5 minutes to set up, then 10 seconds per day to use.

---

## Step 1: Create the Google Form

1. Go to [forms.google.com](https://forms.google.com)
2. Click **+ Blank** to create a new form
3. Name it: **Solar Production Log**

### Add These Questions:

**Question 1: Date**
- Click "Untitled Question"
- Type: `Date`
- Change question type to **Date**
- Toggle **Required** ON

**Question 2: Production (kWh)**
- Click the **+** to add question
- Type: `Production (kWh)`
- Change question type to **Short answer**
- Click the three dots → **Response validation**
  - Select: **Number** → **Greater than** → `0`
- Toggle **Required** ON

**Question 3: Weather** (optional but useful)
- Click **+** to add question
- Type: `Weather`
- Change question type to **Dropdown**
- Add options:
  - Sunny
  - Partly Cloudy
  - Cloudy
  - Overcast
  - Rainy

**Question 4: Notes** (optional)
- Click **+** to add question
- Type: `Notes`
- Keep as **Short answer**
- Leave Required OFF

---

## Step 2: Link to Google Sheet

1. Click the **Responses** tab at the top
2. Click the green **Google Sheets** icon
3. Select **Create a new spreadsheet**
4. Name it: **Solar Production Data**
5. Click **Create**

Your form responses will now automatically appear in this spreadsheet!

---

## Step 3: Add to Home Screen (iPhone/Android)

**iPhone:**
1. Open form link in Safari
2. Tap Share icon → **Add to Home Screen**
3. Name it "Solar Log"

**Android:**
1. Open form link in Chrome
2. Tap menu → **Add to Home screen**

Now you have a one-tap daily logging app!

---

## Step 4: Share the Spreadsheet (for automation)

To let the analysis script read your data:

1. Open the Google Sheet
2. Click **Share** (top right)
3. Click **Get link**
4. Change to **Anyone with the link can view**
5. Copy the link and save it

The link will look like:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

---

## Step 5: Daily Workflow

Each day (takes 10 seconds):
1. Open Sunrun app → check yesterday's production
2. Tap your "Solar Log" home screen icon
3. Enter: Date, kWh, Weather
4. Submit

That's it! Your data automatically goes to Google Sheets.

---

## Optional: Add Activity Logging

If you want to also log household activities (laundry, dishwasher, etc.), create a second form:

**Activity Log Form:**
- Date (Date, required)
- Start Time (Time, required)
- End Time (Time, required)
- Activity (Dropdown: Laundry-Dryer, Dishwasher, EV Charging, Oven, etc.)
- Notes (Short answer, optional)

Link this to a second sheet tab or a separate spreadsheet.

---

## Accessing Your Data for Analysis

Once set up, share your Google Sheet link with me and I can:
1. Pull the data automatically
2. Combine it with your SDGE usage data
3. Generate updated analysis and recommendations

The Python script can also be updated to fetch directly from Google Sheets using the Sheets API.
