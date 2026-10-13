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

/**
 * Drive folder (inside the ROMs folder) holding cover art. Each image is named
 * after the ROM it belongs to: <ROM file id>.png.
 */
var ASSETS_FOLDER_ID = '1x1MXKl6JNQn2HJeHpSpkmWCQ060ZS2ZP';

/**
 * Script-cache lifetimes, in seconds. The index is short so newly added covers
 * show up within minutes; the images themselves rarely change.
 */
var COVER_CACHE_SECONDS = 6 * 60 * 60;
var COVER_INDEX_CACHE_SECONDS = 10 * 60;

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

  var covers = getCoverIndex_();
  var fresh = false;
  var games = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var fileId = row[idx.FileId];
    if (!fileId) {
      continue;
    }
    // A game with no cover in a cached index may just be newer than the cache.
    if (!covers[fileId] && !fresh) {
      covers = getCoverIndex_(true);
      fresh = true;
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
      hasCover: !!covers[fileId],
      downloadUrl: 'https://drive.google.com/uc?export=download&id=' + fileId
    });
  }
  return games;
}

/**
 * Returns cover images for the given ROM file ids as { romId: dataUrl }.
 * Called from the client via google.script.run.
 *
 * Takes ROM ids, never raw Drive ids: the web app runs as the owner and is open
 * to anyone, so it must only ever serve files that are in the Assets folder.
 */
function getCovers(romIds) {
  var covers = getCoverIndex_();
  var cache = CacheService.getScriptCache();
  var out = {};
  (romIds || []).forEach(function (romId) {
    var assetId = covers[romId];
    if (!assetId) {
      return;
    }
    var key = 'cover:' + assetId;
    var url = cache.get(key);
    if (!url) {
      var file = DriveApp.getFileById(assetId);
      // Drive's thumbnail is small enough for a card; the full PNG is a fallback.
      var blob = file.getThumbnail() || file.getBlob();
      url = 'data:' + blob.getContentType() + ';base64,' +
        Utilities.base64Encode(blob.getBytes());
      try {
        cache.put(key, url, COVER_CACHE_SECONDS);
      } catch (e) {
        // Over the cache's 100 KB value limit — serve it uncached.
      }
    }
    out[romId] = url;
  });
  return out;
}

/**
 * Maps ROM file id → cover image's Drive id, from the Assets folder.
 * Pass refresh = true to skip the cache and re-list the folder.
 */
function getCoverIndex_(refresh) {
  var cache = CacheService.getScriptCache();
  var cached = refresh ? null : cache.get('coverIndex');
  if (cached) {
    return JSON.parse(cached);
  }
  var index = {};
  var files = DriveApp.getFolderById(ASSETS_FOLDER_ID).getFiles();
  while (files.hasNext()) {
    var file = files.next();
    var m = /^(.+)\.(png|jpe?g|gif|webp)$/i.exec(file.getName());
    if (m) {
      index[m[1]] = file.getId();
    }
  }
  cache.put('coverIndex', JSON.stringify(index), COVER_INDEX_CACHE_SECONDS);
  return index;
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
