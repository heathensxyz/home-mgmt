# Google Sheets Setup Guide

Follow these steps to connect your Solar Tracker to Google Sheets for automatic data sync.

## Step 1: Set Up the Google Sheet

Your Google Sheet is already created at:
`Solar data input/Energy analysis data input.gsheet`

## Step 2: Add the Apps Script

1. Open your Google Sheet "Energy analysis data input"
2. Go to **Extensions** → **Apps Script**
3. Delete any existing code in the editor
4. Copy ALL the code from `google_apps_script.js` (in this folder)
5. Paste it into the Apps Script editor
6. Press **Ctrl+S** (or Cmd+S on Mac) to save
7. Name the project "Solar Tracker API" when prompted

## Step 3: Run Initial Setup

1. In the Apps Script editor, select the function **setup** from the dropdown (next to the play button)
2. Click the **Run** button (▶)
3. You'll be asked to authorize - click **Review Permissions**
4. Select your Google account
5. Click **Advanced** → **Go to Solar Tracker API (unsafe)** → **Allow**
6. This creates the required sheets (Sunrun, SDGE, Activities) with headers

## Step 4: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Fill in:
   - Description: "Solar Tracker API"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** if prompted
6. **Copy the Web App URL** (looks like `https://script.google.com/macros/s/ABC123.../exec`)

## Step 5: Connect the Tracker App

1. Open your Solar Tracker dashboard (on GitHub Pages or locally)
2. Go to the **Settings** tab
3. Paste the Web App URL into the "Google Apps Script Web App URL" field
4. Click **Test Connection**
5. If successful, you'll see "Connected successfully!"
6. Click **Sync Now** to upload your existing data

## Done!

Your data will now automatically sync to Google Sheets whenever you:
- Add solar production data
- Import SDGE Green Button files
- Log activities

You can view/edit your data directly in Google Sheets, and it will sync back to the app.

## Troubleshooting

**"Connection failed" error:**
- Make sure you deployed as "Anyone" can access
- Try creating a new deployment if needed

**Data not syncing:**
- Check browser console for errors (F12 → Console)
- Try clicking "Sync Now" manually

**Need to update the script?**
- Go to Extensions → Apps Script
- Make changes
- Deploy → Manage deployments → Edit → Version: New version → Deploy
