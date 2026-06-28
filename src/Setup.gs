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

  var newRows = [];
  var skipped = 0;
  var now = new Date();
  files.forEach(function (f) {
    if (existing[f.id]) {
      skipped++;
      return;
    }
    var ext = fileExtension_(f.name);
    var consoleName = EXTENSION_TO_CONSOLE[ext] || '';
    var row = [];
    COLUMNS.forEach(function (col) {
      switch (col) {
        case 'FileId': row.push(f.id); break;
        case 'Title': row.push(titleFromFilename_(f.name)); break;
        case 'Console': row.push(consoleName); break;
        case 'FileName': row.push(f.name); break;
        case 'Size': row.push(humanSize_(f.size)); break;
        case 'DateAdded': row.push(now); break;
        default: row.push(''); // Notes and any future columns start blank
      }
    });
    newRows.push(row);
  });

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, COLUMNS.length)
      .setValues(newRows);
  }

  var msg = 'Scan complete.\n\n' +
    'Files found: ' + files.length + '\n' +
    'New games added: ' + newRows.length + '\n' +
    'Already in database: ' + skipped + '\n\n' +
    'Tip: review the Console column — ambiguous formats (.iso, .bin, .zip, …) ' +
    'are left blank for you to fill in.';

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
