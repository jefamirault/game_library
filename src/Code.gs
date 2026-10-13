/**
 * Game Library — server-side entry points.
 *
 * Bound to the spreadsheet that acts as the games database.
 * The "Games" sheet is the source of truth; Setup.gs populates it from the
 * shared Drive folder, and the web app (doGet/index.html) reads from it.
 */

// ----- Configuration ---------------------------------------------------------

/** Drive folder containing the ROM files. */
var ROMS_FOLDER_ID = '1J2_2qBnPibevdMs2LwPFAxTE9Kl2tB_F';

/** Name of the sheet used as the database. */
var SHEET_NAME = 'Games';

/**
 * Database columns, in order. The header row written to the sheet uses these
 * labels; code refers to columns by these keys so reordering only happens here.
 */
var COLUMNS = [
  'FileId',     // Drive file id (stable key, used to de-dupe on re-runs)
  'Title',      // Human-readable title derived from the filename
  'Console',    // Best-guess platform; user confirms/corrects
  'FileName',   // Original filename in Drive
  'Size',       // Human-readable file size
  'DateAdded',  // When the row was first added by setup
  'Notes'       // Free-form, for the user
];

// ----- Spreadsheet menu ------------------------------------------------------

/**
 * Adds a custom menu to the spreadsheet so setup can be run from the UI.
 * Runs automatically whenever the spreadsheet is opened.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Game Library')
    .addItem('Scan Drive folder → update database', 'setupDatabase')
    .addSeparator()
    .addItem('Open web app URL', 'showWebAppUrl')
    .addToUi();
}

/** Shows the deployed web app URL (if any) in a dialog. */
function showWebAppUrl() {
  var url = ScriptApp.getService().getUrl();
  var ui = SpreadsheetApp.getUi();
  if (url) {
    ui.alert('Web app URL', url, ui.ButtonSet.OK);
  } else {
    ui.alert('Not deployed yet',
      'Deploy the project as a Web app first (clasp deploy, or Deploy ▸ New deployment).',
      ui.ButtonSet.OK);
  }
}

// ----- Web app ---------------------------------------------------------------

/** Serves the browse/download UI. */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Game Library')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Lets index.html pull in shared HTML/CSS/JS partials via templating. */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Returns all games for the web app as an array of plain objects, plus a
 * direct download URL for each. Called from the client via google.script.run.
 */
function getGames() {
  var sheet = getOrCreateSheet_();
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return [];
  }

  var header = values[0];
  var idx = {};
  header.forEach(function (name, i) { idx[name] = i; });

  var games = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var fileId = row[idx.FileId];
    if (!fileId) {
      continue;
    }
    var da = row[idx.DateAdded];
    games.push({
      fileId: String(fileId),
      title: String(row[idx.Title] || ''),
      console: String(row[idx.Console] || ''),
      fileName: String(row[idx.FileName] || ''),
      size: String(row[idx.Size] || ''),
      dateAdded: (da instanceof Date ? da.getTime() : new Date(da).getTime()) || 0,
      notes: String(row[idx.Notes] || ''),
      downloadUrl: 'https://drive.google.com/uc?export=download&id=' + fileId
    });
  }
  return games;
}

// ----- Sheet helpers ---------------------------------------------------------

/** Returns the Games sheet, creating it with a header row if missing. */
function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}
