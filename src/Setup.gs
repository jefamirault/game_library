/**
 * Game Library — database setup.
 *
 * Scans the shared Drive folder (recursively) for ROM files and writes a row
 * per file into the Games sheet. Re-running is safe: rows are keyed by Drive
 * file id, so existing rows are left untouched (your manual edits to Console,
 * Title, Notes, etc. are preserved) and only new files are appended.
 */

/**
 * Maps a file extension (lowercase, no dot) to a console name.
 * Where one extension maps to multiple systems, the most common is used and
 * the value is left for the user to confirm.
 */
var EXTENSION_TO_CONSOLE = {
  // Nintendo handhelds
  gb: 'Game Boy',
  gbc: 'Game Boy Color',
  gba: 'Game Boy Advance',
  nds: 'Nintendo DS',
  '3ds': 'Nintendo 3DS',
  cia: 'Nintendo 3DS',
  // Nintendo home consoles
  nes: 'NES',
  fds: 'Famicom Disk System',
  smc: 'SNES',
  sfc: 'SNES',
  n64: 'Nintendo 64',
  z64: 'Nintendo 64',
  v64: 'Nintendo 64',
  gcm: 'GameCube',
  gcz: 'GameCube',
  rvz: 'Wii',
  wbfs: 'Wii',
  wad: 'Wii',
  // Sega
  sms: 'Sega Master System',
  gg: 'Game Gear',
  md: 'Sega Genesis',
  smd: 'Sega Genesis',
  gen: 'Sega Genesis',
  '32x': 'Sega 32X',
  cdi: 'Sega Dreamcast',
  gdi: 'Sega Dreamcast',
  // Sony
  cue: 'PlayStation',
  pbp: 'PlayStation',
  cso: 'PSP',
  // Atari / others
  a26: 'Atari 2600',
  a78: 'Atari 7800',
  lnx: 'Atari Lynx',
  ngp: 'Neo Geo Pocket',
  ngc: 'Neo Geo Pocket Color',
  pce: 'TurboGrafx-16',
  ws: 'WonderSwan',
  wsc: 'WonderSwan Color'
};

/**
 * Extensions that are ambiguous on their own (disc/archive containers). They
 * are still imported, but Console is left blank for the user to fill in.
 */
var AMBIGUOUS_EXTENSIONS = {
  iso: true, bin: true, img: true, chd: true, zip: true, '7z': true, rar: true
};

/**
 * Entry point (also wired to the spreadsheet menu): scan the folder and update
 * the Games sheet. Reports a summary via the UI when available, otherwise logs.
 */
function setupDatabase() {
  var sheet = getOrCreateSheet_();

  // Build a set of file ids already in the sheet so we never duplicate.
  var existing = {};
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    ids.forEach(function (row) {
      if (row[0]) { existing[String(row[0])] = true; }
    });
  }

  var folder = DriveApp.getFolderById(ROMS_FOLDER_ID);
  var files = collectFiles_(folder);

  // Rows follow the sheet's own header order, which may differ from COLUMNS.
  var header = getHeader_(sheet);
  var newRows = [];
  var skipped = 0;
  var now = new Date();
  files.forEach(function (f) {
    if (existing[f.id]) {
      skipped++;
      return;
    }
    newRows.push(romRow_(header, f, now));
  });

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, header.length)
      .setValues(newRows);
  }

  var filled = fillGameInfo_();
  var covered = insertCoverImages_();

  notify_('Scan complete.\n\n' +
    'Files found: ' + files.length + '\n' +
    'New games added: ' + newRows.length + '\n' +
    'Already in database: ' + skipped + '\n' +
    'Game info cells filled: ' + filled + '\n' +
    'Games with a cover image: ' + covered + '\n\n' +
    'Tip: review the Console column — ambiguous formats (.iso, .bin, .zip, …) ' +
    'are left blank for you to fill in.');
}

/**
 * A new sheet row for a ROM file ({ id, name, size }), in the sheet's header
 * order. Title and Console are guessed from the filename unless overrides
 * gives them (the web app's upload form does).
 */
function romRow_(header, f, now, overrides) {
  overrides = overrides || {};
  var consoleName = overrides.console || EXTENSION_TO_CONSOLE[fileExtension_(f.name)] || '';
  return header.map(function (col) {
    switch (col) {
      case 'FileId': return f.id;
      case 'Title': return overrides.title || titleFromFilename_(f.name);
      case 'Console': return consoleName;
      case 'FileName': return f.name;
      case 'Size': return humanSize_(f.size);
      case 'DateAdded': return now;
      default: return ''; // Notes, game info and any future columns start blank
    }
  });
}

/**
 * Sheet column → GAME_INFO field (GameInfo.gs) for the game info columns.
 */
var INFO_COLUMNS = {
  Developer: 'developer',
  Publisher: 'publisher',
  ReleaseDate: 'released',
  Genre: 'genre',
  Players: 'players',
  Credits: 'credits',
  Description: 'description'
};

/**
 * Menu entry point: fills blank game info cells from GAME_INFO. Never
 * overwrites a cell that has a value, so edits made in the sheet stick.
 */
function fillGameInfo() {
  var filled = fillGameInfo_();
  notify_('Filled ' + filled + ' blank game info cell' + (filled === 1 ? '' : 's') +
    ' from GameInfo.gs.\n\nGames missing from GameInfo.gs are left as they are.');
}

/** Does the work for fillGameInfo(); returns the number of cells filled. */
function fillGameInfo_() {
  var sheet = getOrCreateSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { return 0; }
  var header = getHeader_(sheet);
  var ids = sheet.getRange(2, header.indexOf('FileId') + 1, lastRow - 1, 1).getValues();

  var filled = 0;
  // One column at a time, so no other column is rewritten (formulas, dates).
  header.forEach(function (col, c) {
    var key = INFO_COLUMNS[col];
    if (!key) { return; }
    var range = sheet.getRange(2, c + 1, lastRow - 1, 1);
    var values = range.getValues();
    var changed = false;
    values.forEach(function (cell, r) {
      var info = GAME_INFO[String(ids[r][0])];
      if (!info || cell[0] !== '') { return; }
      var v = info[key];
      if (Array.isArray(v)) { v = v.join('\n'); }
      if (v) {
        cell[0] = v;
        changed = true;
        filled++;
      }
    });
    if (changed) {
      // Keep partial dates like "1995" or "2004-06" as typed, not as Dates.
      if (col === 'ReleaseDate') { range.setNumberFormat('@'); }
      range.setValues(values);
    }
  });
  return filled;
}

/** Size of the Image column's cells, in pixels. Covers scale to fit. */
var COVER_CELL_WIDTH = 90;
var COVER_ROW_HEIGHT = 110;

/**
 * Menu entry point: puts each game's cover (<ROM FileId>.png in the Assets
 * folder) into its Image cell.
 */
function insertCoverImages() {
  var covered = insertCoverImages_();
  notify_('Added ' + covered + ' cover image' + (covered === 1 ? '' : 's') +
    ' from the Assets folder.\n\nGames without a cover have a blank Image cell.');
}

/**
 * Does the work for insertCoverImages(); returns the number of covers placed.
 * The Image column is derived from Drive, so it's rewritten on every run:
 * replaced covers are updated and removed ones cleared.
 *
 * Images go in as data URLs (Drive thumbnails), so they show for anyone who
 * can see the sheet, without the Assets folder being shared.
 */
function insertCoverImages_() {
  var sheet = getOrCreateSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { return 0; }
  var header = getHeader_(sheet);
  var ids = sheet.getRange(2, header.indexOf('FileId') + 1, lastRow - 1, 1).getValues();
  var titles = sheet.getRange(2, header.indexOf('Title') + 1, lastRow - 1, 1).getValues();
  var covers = getCoverIndex_(true);
  var cache = CacheService.getScriptCache();

  var covered = 0;
  var cells = ids.map(function (row, r) {
    var assetId = covers[String(row[0])];
    if (!assetId) { return ['']; }
    covered++;
    return [SpreadsheetApp.newCellImage()
      .setSourceUrl(coverDataUrl_(assetId, cache))
      .setAltTextTitle(String(titles[r][0] || ''))
      .build()];
  });

  var col = header.indexOf('Image') + 1;
  var range = sheet.getRange(2, col, cells.length, 1);
  range.clearContent(); // Drops the old "View cover" links' formatting too.
  range.setValues(cells);
  sheet.setColumnWidth(col, COVER_CELL_WIDTH);
  sheet.setRowHeights(2, cells.length, COVER_ROW_HEIGHT);
  return covered;
}

/** Shows a message in the spreadsheet UI when there is one, otherwise logs it. */
function notify_(msg) {
  try {
    SpreadsheetApp.getUi().alert('Game Library', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    // No UI context (e.g. run from the editor) — just log.
    Logger.log(msg);
  }
}

/**
 * Recursively collects ROM-like files from a folder and its subfolders.
 * Returns lightweight objects: { id, name, size }.
 */
function collectFiles_(folder) {
  var out = [];

  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    var name = file.getName();
    // Skip Google-native docs (sheets/docs/etc.) and obvious non-ROM clutter.
    if (isLikelyRom_(name)) {
      out.push({ id: file.getId(), name: name, size: file.getSize() });
    }
  }

  var subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    out = out.concat(collectFiles_(subfolders.next()));
  }
  return out;
}

/** True if the filename looks like a ROM/disc/archive worth importing. */
function isLikelyRom_(name) {
  var ext = fileExtension_(name);
  if (!ext) { return false; }
  return !!EXTENSION_TO_CONSOLE[ext] || !!AMBIGUOUS_EXTENSIONS[ext];
}

/** Lowercased extension without the dot, or '' if none. */
function fileExtension_(name) {
  var dot = name.lastIndexOf('.');
  if (dot < 0 || dot === name.length - 1) { return ''; }
  return name.substring(dot + 1).toLowerCase();
}

/**
 * Derives a display title from a filename: drops the extension, replaces
 * separators with spaces, and strips common No-Intro/TOSEC bracket tags like
 * (USA), [!], (Rev 1), etc. Collapses whitespace.
 */
function titleFromFilename_(name) {
  var base = name;
  var dot = base.lastIndexOf('.');
  if (dot > 0) { base = base.substring(0, dot); }

  base = base.replace(/[_\.]+/g, ' ');         // separators → space
  base = base.replace(/\s*[\(\[][^\)\]]*[\)\]]/g, ' '); // (USA), [!], (Rev 1)…
  base = base.replace(/\s+/g, ' ').trim();      // collapse whitespace
  return base;
}

/** Formats a byte count as a short human-readable string. */
function humanSize_(bytes) {
  if (!bytes && bytes !== 0) { return ''; }
  var units = ['B', 'KB', 'MB', 'GB'];
  var i = 0;
  var n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return (i === 0 ? n : n.toFixed(1)) + ' ' + units[i];
}
