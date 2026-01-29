/**
 * Google Apps Script for Solar Tracker Data API
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet "Energy analysis data input"
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Click Save (Ctrl+S)
 * 5. Click Deploy > New Deployment
 * 6. Select Type: Web app
 * 7. Set "Execute as": Me
 * 8. Set "Who has access": Anyone
 * 9. Click Deploy and authorize when prompted
 * 10. Copy the Web App URL - you'll need it for the tracker app
 */

// Sheet names
const SHEETS = {
  SUNRUN: 'Sunrun',
  SDGE: 'SDGE',
  ACTIVITIES: 'Activities'
};

// Initialize sheets with headers if they don't exist
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Sunrun sheet
  let sunrunSheet = ss.getSheetByName(SHEETS.SUNRUN);
  if (!sunrunSheet) {
    sunrunSheet = ss.insertSheet(SHEETS.SUNRUN);
    sunrunSheet.getRange(1, 1, 1, 3).setValues([['date', 'production_kwh', 'notes']]);
    sunrunSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }

  // SDGE sheet
  let sdgeSheet = ss.getSheetByName(SHEETS.SDGE);
  if (!sdgeSheet) {
    sdgeSheet = ss.insertSheet(SHEETS.SDGE);
    sdgeSheet.getRange(1, 1, 1, 7).setValues([['date', 'consumption', 'generation', 'net', 'super_off_peak', 'off_peak', 'on_peak']]);
    sdgeSheet.getRange(1, 1, 1, 7).setFontWeight('bold');
  }

  // Activities sheet
  let activitiesSheet = ss.getSheetByName(SHEETS.ACTIVITIES);
  if (!activitiesSheet) {
    activitiesSheet = ss.insertSheet(SHEETS.ACTIVITIES);
    activitiesSheet.getRange(1, 1, 1, 8).setValues([['date', 'start_time', 'end_time', 'activity', 'location', 'notes', 'est_kwh', 'tou_period']]);
    activitiesSheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  }

  return { sunrunSheet, sdgeSheet, activitiesSheet };
}

// GET request - return all data
function doGet(e) {
  try {
    const sheets = initializeSheets();
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const data = {
      sunrun: getSheetData(ss.getSheetByName(SHEETS.SUNRUN)),
      sdge: getSheetData(ss.getSheetByName(SHEETS.SDGE)),
      activities: getSheetData(ss.getSheetByName(SHEETS.ACTIVITIES))
    };

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// POST request - save data
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const sheets = initializeSheets();
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    switch (action) {
      case 'saveSunrun':
        saveToSheet(ss.getSheetByName(SHEETS.SUNRUN), payload.entry, 'date');
        break;
      case 'saveSDGE':
        saveToSheet(ss.getSheetByName(SHEETS.SDGE), payload.entry, 'date');
        break;
      case 'saveActivity':
        addToSheet(ss.getSheetByName(SHEETS.ACTIVITIES), payload.entry);
        break;
      case 'saveBulkSDGE':
        payload.entries.forEach(entry => {
          saveToSheet(ss.getSheetByName(SHEETS.SDGE), entry, 'date');
        });
        break;
      case 'saveBulkSunrun':
        payload.entries.forEach(entry => {
          saveToSheet(ss.getSheetByName(SHEETS.SUNRUN), entry, 'date');
        });
        break;
      case 'deleteByDate':
        deleteByDate(ss, payload.date);
        break;
      case 'syncAll':
        // Full sync - replace all data
        if (payload.data.sunrun) {
          replaceSheetData(ss.getSheetByName(SHEETS.SUNRUN), payload.data.sunrun);
        }
        if (payload.data.sdge) {
          replaceSheetData(ss.getSheetByName(SHEETS.SDGE), payload.data.sdge);
        }
        if (payload.data.activities) {
          replaceSheetData(ss.getSheetByName(SHEETS.ACTIVITIES), payload.data.activities);
        }
        break;
      default:
        throw new Error('Unknown action: ' + action);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper: Get all data from a sheet as array of objects
function getSheetData(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  }).filter(row => row.date); // Filter out empty rows
}

// Helper: Save or update entry by key field
function saveToSheet(sheet, entry, keyField) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIndex = headers.indexOf(keyField);

  // Find existing row
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][keyIndex] === entry[keyField]) {
      rowIndex = i + 1; // 1-indexed
      break;
    }
  }

  // Create row array
  const rowData = headers.map(h => entry[h] !== undefined ? entry[h] : '');

  if (rowIndex > 0) {
    // Update existing row
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
  } else {
    // Append new row
    sheet.appendRow(rowData);
  }
}

// Helper: Add entry (for activities - allows duplicates)
function addToSheet(sheet, entry) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(h => entry[h] !== undefined ? entry[h] : '');
  sheet.appendRow(rowData);
}

// Helper: Delete all entries for a date
function deleteByDate(ss, date) {
  [SHEETS.SUNRUN, SHEETS.SDGE, SHEETS.ACTIVITIES].forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const dateIndex = headers.indexOf('date');

    // Find and delete rows (go backwards to avoid index shifting)
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][dateIndex] === date) {
        sheet.deleteRow(i + 1);
      }
    }
  });
}

// Helper: Replace all data in a sheet
function replaceSheetData(sheet, dataArray) {
  if (!dataArray || dataArray.length === 0) return;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Clear existing data (keep headers)
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }

  // Add new data
  dataArray.forEach(entry => {
    const rowData = headers.map(h => entry[h] !== undefined ? entry[h] : '');
    sheet.appendRow(rowData);
  });
}

// Manual function to initialize sheets (run once)
function setup() {
  initializeSheets();
  SpreadsheetApp.getActiveSpreadsheet().toast('Sheets initialized!', 'Setup Complete');
}
