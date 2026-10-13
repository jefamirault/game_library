/**
 * Game Library — server-side entry points.
 *
 * Serves any number of libraries (see Library.gs): each is a spreadsheet whose
 * "Games" sheet is the source of truth. Setup.gs populates it from the
 * library's Drive folder, and the web app (doGet/index.html) reads from it.
 * The script is also bound to the original library's spreadsheet, for the
 * spreadsheet menu.
 */

// ----- Configuration ---------------------------------------------------------

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
  'Notes',      // Free-form, for the user
  // Game info — filled from GAME_INFO (GameInfo.gs) where blank; edit freely.
  'Developer',
  'Publisher',
  'ReleaseDate', // YYYY-MM-DD, YYYY-MM or YYYY
  'Genre',
  'Players',
  'Credits',     // One "Role: Names" per line
  'Description', // A paragraph about the game
  'Image'        // Cover art from the Assets folder, in the cell; rewritten by insertCoverImages()
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
    .addItem('Fill in game info (blank cells only)', 'fillGameInfo')
    .addItem('Show cover images in sheet', 'insertCoverImages')
    .addSeparator()
    .addItem('Open web app URL', 'showWebAppUrl')
    .addToUi();
}

/** Shows this library's web app URL (if deployed) in a dialog. */
function showWebAppUrl() {
  var url = ScriptApp.getService().getUrl();
  var ui = SpreadsheetApp.getUi();
  if (url) {
    ui.alert('Web app URL', url + '?library=' + SpreadsheetApp.getActiveSpreadsheet().getId(), ui.ButtonSet.OK);
  } else {
    ui.alert('Not deployed yet',
      'Deploy the project as a Web app first (clasp deploy, or Deploy ▸ New deployment).',
      ui.ButtonSet.OK);
  }
}

// ----- Web app ---------------------------------------------------------------

/**
 * Serves a library's browse/download UI (?library=<spreadsheet id>), the
 * landing page (no library), or the deploy stamp at <exec URL>/deploy.json.
 */
function doGet(e) {
  if (e && e.pathInfo === 'deploy.json') {
    return deployStamp_();
  }
  // Ids are [\w-]; anything else is dropped before it reaches the page.
  var libraryId = String((e && e.parameter && e.parameter.library) || '').replace(/[^\w-]/g, '');
  var page = HtmlService.createTemplateFromFile(libraryId ? 'index' : 'home');
  page.libraryId = libraryId;
  page.appUrl = ScriptApp.getService().getUrl();
  return page
    .evaluate()
    .setTitle('Game Library')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * The deploy stamp written by deploy.sh (src/DeployStamp.gs, not committed), as
 * JSON. Empty object if the code was pushed without deploy.sh.
 */
function deployStamp_() {
  var stamp = typeof DEPLOY_STAMP === 'undefined' ? {} : DEPLOY_STAMP;
  return ContentService.createTextOutput(JSON.stringify(stamp))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Lets the pages pull in shared HTML/CSS/JS partials via templating. */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** A value as JSON that's safe inside a <script> block. */
function scriptJson_(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/**
 * Returns a library for the web app: { name, games, access }. Each game is a
 * plain object with a direct download URL; access says what this visitor may
 * do (see getAccess_). Called from the client via google.script.run.
 *
 * The web app runs as the visitor, so this fails (with a message for them) for
 * anyone the library isn't shared with.
 */
function getGames(libraryId) {
  var lib = openLibrary_(libraryId);
  var values = lib.sheet.getDataRange().getValues();
  var access = getAccess_(lib);
  if (values.length < 2) {
    return { name: lib.name, games: [], access: access };
  }

  var idx = headerIndex_(values[0]);
  var covers = getCoverIndex_(lib.assetsFolderId);
  var fresh = false;
  var games = [];
  for (var r = 1; r < values.length; r++) {
    var fileId = values[r][idx.FileId];
    if (!fileId) {
      continue;
    }
    // A game with no cover in a cached index may just be newer than the cache.
    if (!covers[fileId] && !fresh) {
      covers = getCoverIndex_(lib.assetsFolderId, true);
      fresh = true;
    }
    games.push(gameFromRow_(values[r], idx, covers));
  }
  return { name: lib.name, games: games, access: access };
}

/** Header labels → column index (0-based). */
function headerIndex_(header) {
  var idx = {};
  header.forEach(function (name, i) { idx[name] = i; });
  return idx;
}

/** One sheet row as the game object the web app renders. */
function gameFromRow_(row, idx, covers) {
  var fileId = String(row[idx.FileId]);
  var da = row[idx.DateAdded];
  var rd = row[idx.ReleaseDate];
  return {
    fileId: fileId,
    title: String(row[idx.Title] || ''),
    console: String(row[idx.Console] || ''),
    fileName: String(row[idx.FileName] || ''),
    size: String(row[idx.Size] || ''),
    dateAdded: (da instanceof Date ? da.getTime() : new Date(da).getTime()) || 0,
    notes: String(row[idx.Notes] || ''),
    developer: String(row[idx.Developer] || ''),
    publisher: String(row[idx.Publisher] || ''),
    // Sheets turns typed dates into Dates (and a bare year into a number).
    releaseDate: rd instanceof Date
      ? Utilities.formatDate(rd, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(rd || ''),
    genre: String(row[idx.Genre] || ''),
    players: String(row[idx.Players] || ''),
    credits: String(row[idx.Credits] || ''),
    description: String(row[idx.Description] || ''),
    hasCover: !!covers[fileId],
    downloadUrl: 'https://drive.google.com/uc?export=download&id=' + fileId
  };
}

// ----- Access ----------------------------------------------------------------

/**
 * What the visitor may do in a library, straight from Drive's sharing — the
 * app only reflects it, Drive and Sheets enforce it. Links are null when the
 * visitor can't open them.
 */
function getAccess_(lib) {
  var roms = driveCapabilities_(lib.romsFolderId);
  var assets = driveCapabilities_(lib.assetsFolderId);
  var sheet = driveCapabilities_(lib.id);
  return {
    folderUrl: roms ? 'https://drive.google.com/drive/folders/' + lib.romsFolderId : null,
    sheetUrl: sheet ? 'https://docs.google.com/spreadsheets/d/' + lib.id + '/edit' : null,
    canUploadGames: !!(roms && roms.canAddChildren && sheet && sheet.canEdit),
    canUploadCovers: !!(assets && assets.canAddChildren),
    canManage: !!(sheet && sheet.canEdit),
    canShare: !!(sheet && sheet.canShare && roms && roms.canShare)
  };
}

/**
 * The visitor's Drive capabilities on a file or folder, or null if they can't
 * see it at all.
 */
function driveCapabilities_(id) {
  try {
    return driveApi_('get', '/files/' + id +
      '?fields=capabilities(canAddChildren,canEdit,canTrash,canShare)&supportsAllDrives=true').capabilities || {};
  } catch (e) {
    return null;
  }
}

/**
 * Calls the Drive v3 API as the visitor and returns the parsed response.
 * path starts with "/" (e.g. "/files/<id>?fields=…"); body is sent as JSON.
 */
function driveApi_(method, path, body) {
  var options = {
    method: method,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  };
  if (body) {
    options.contentType = 'application/json; charset=UTF-8';
    options.payload = JSON.stringify(body);
  }
  var res = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3' + path, options);
  if (res.getResponseCode() >= 300) {
    throw new Error('Drive API ' + res.getResponseCode() + ': ' + res.getContentText());
  }
  var text = res.getContentText();
  return text ? JSON.parse(text) : {};
}

/**
 * Returns cover images for the given ROM file ids as { romId: dataUrl }.
 * Called from the client via google.script.run.
 *
 * Takes ROM ids, never raw Drive ids, so it only ever serves files from the
 * library's Assets folder. The cover cache is shared across visitors, so the
 * library is opened first: that's what stops someone it isn't shared with
 * reading its cached covers.
 */
function getCovers(libraryId, romIds) {
  var lib = openLibrary_(libraryId);
  var covers = getCoverIndex_(lib.assetsFolderId);
  var cache = CacheService.getScriptCache();
  var out = {};
  (romIds || []).forEach(function (romId) {
    var assetId = covers[romId];
    if (!assetId) {
      return;
    }
    out[romId] = coverDataUrl_(assetId, cache);
  });
  return out;
}

/**
 * A cover image (by its Drive id in the Assets folder) as a data URL, cached.
 * Used by the web app and by the sheet's Image column.
 */
function coverDataUrl_(assetId, cache) {
  cache = cache || CacheService.getScriptCache();
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
  return url;
}

/**
 * Maps ROM file id → cover image's Drive id, from a library's Assets folder.
 * Pass refresh = true to skip the cache and re-list the folder.
 */
function getCoverIndex_(assetsFolderId, refresh) {
  var cache = CacheService.getScriptCache();
  var cached = refresh ? null : cache.get(coverIndexKey_(assetsFolderId));
  if (cached) {
    return JSON.parse(cached);
  }
  var index = {};
  var files;
  try {
    files = DriveApp.getFolderById(assetsFolderId).getFiles();
  } catch (e) {
    return index; // The visitor can't see the Assets folder — no covers, not a failed load.
  }
  while (files.hasNext()) {
    var file = files.next();
    var m = /^(.+)\.(png|jpe?g|gif|webp)$/i.exec(file.getName());
    if (m) {
      index[m[1]] = file.getId();
    }
  }
  cache.put(coverIndexKey_(assetsFolderId), JSON.stringify(index), COVER_INDEX_CACHE_SECONDS);
  return index;
}

/** Script-cache key for an Assets folder's cover index. */
function coverIndexKey_(assetsFolderId) {
  return 'coverIndex:' + assetsFolderId;
}

// ----- Sheet helpers ---------------------------------------------------------

/**
 * Returns a spreadsheet's Games sheet, creating it with a header row if
 * missing. Columns added to COLUMNS since the sheet was made are appended to
 * its header.
 */
function getOrCreateSheet_(ss) {
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return sheet;
  }
  var header = getHeader_(sheet);
  var missing = COLUMNS.filter(function (col) { return header.indexOf(col) < 0; });
  if (missing.length > 0) {
    try {
      sheet.getRange(1, header.length + 1, 1, missing.length)
        .setValues([missing]).setFontWeight('bold');
    } catch (e) {
      // A view-only visitor can't migrate the sheet; the next editor run will.
    }
  }
  return sheet;
}

/** The sheet's header row as an array of labels (trailing blanks dropped). */
function getHeader_(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) { return []; }
  var header = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  while (header.length && !header[header.length - 1]) { header.pop(); }
  return header;
}
