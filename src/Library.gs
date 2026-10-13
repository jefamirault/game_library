/**
 * Game Library — libraries.
 *
 * One deployment serves many libraries. A library is a spreadsheet: its Games
 * sheet is the database, and a hidden Config sheet names its ROMs and Assets
 * folders. The web app picks one with ?library=<spreadsheet id>. Libraries are
 * tagged with a Drive file property so the landing page can list every one the
 * visitor can see.
 *
 * Everything runs as the visitor, so opening a library (openLibrary_) is also
 * the access check: Sheets refuses spreadsheets that aren't shared with them.
 */

/** Hidden sheet holding a library's settings, as Key | Value rows. */
var CONFIG_SHEET = 'Config';

/** Drive file property (properties.gameLibrary = '1') marking a library. */
var LIBRARY_PROPERTY = 'gameLibrary';

/**
 * The original library — the spreadsheet this script is bound to — predates
 * Config sheets. Opening it without one falls back to these folders, and an
 * editor's first visit writes its Config and tags it, after which it's an
 * ordinary library.
 */
var LEGACY_LIBRARY_ID = '1qWhIB1XEXekPt--cZy2YXltgQ7vhBu1Cdh2O_tIYcHE';
var LEGACY_ROMS_FOLDER_ID = '1J2_2qBnPibevdMs2LwPFAxTE9Kl2tB_F';
var LEGACY_ASSETS_FOLDER_ID = '1x1MXKl6JNQn2HJeHpSpkmWCQ060ZS2ZP';

/**
 * Opens a library as the visitor: { id, ss, sheet, name, romsFolderId,
 * assetsFolderId }. Throws a message fit to show the visitor when they can't
 * open it or it isn't a library — so nothing ever writes into an arbitrary
 * spreadsheet.
 */
function openLibrary_(libraryId) {
  libraryId = String(libraryId || '');
  if (!/^[\w-]{20,}$/.test(libraryId)) {
    throw new Error('That isn\'t a valid library link.');
  }
  var ss;
  try {
    ss = SpreadsheetApp.openById(libraryId);
  } catch (e) {
    throw new Error('You don\'t have access to this library. Ask its owner to share it with your Google account.');
  }

  var config = readConfig_(ss);
  if (!config && libraryId === LEGACY_LIBRARY_ID) {
    config = { Name: ss.getName(), RomsFolderId: LEGACY_ROMS_FOLDER_ID, AssetsFolderId: LEGACY_ASSETS_FOLDER_ID };
    try {
      writeConfig_(ss, config);
      tagLibrary_(libraryId);
    } catch (e) {
      // A view-only visitor can't migrate it; the fallback serves them anyway.
    }
  }
  if (!config) {
    throw new Error('That spreadsheet isn\'t a game library.');
  }
  return {
    id: libraryId,
    ss: ss,
    sheet: getOrCreateSheet_(ss),
    name: String(config.Name || ss.getName()),
    romsFolderId: String(config.RomsFolderId),
    assetsFolderId: String(config.AssetsFolderId)
  };
}

/** The library whose spreadsheet is open (for the spreadsheet menu). */
function activeLibrary_() {
  return openLibrary_(SpreadsheetApp.getActiveSpreadsheet().getId());
}

/** The Config sheet as { Key: value }, or null if it's missing or incomplete. */
function readConfig_(ss) {
  var sheet = ss.getSheetByName(CONFIG_SHEET);
  if (!sheet || sheet.getLastRow() === 0) { return null; }
  var config = {};
  sheet.getDataRange().getValues().forEach(function (row) {
    if (row[0]) { config[String(row[0])] = row[1]; }
  });
  return config.RomsFolderId && config.AssetsFolderId ? config : null;
}

/** Writes (or rewrites) the hidden Config sheet. */
function writeConfig_(ss, config) {
  var sheet = ss.getSheetByName(CONFIG_SHEET) || ss.insertSheet(CONFIG_SHEET);
  var rows = [['Key', 'Value']].concat(Object.keys(config).map(function (k) { return [k, config[k]]; }));
  sheet.clearContents();
  sheet.getRange(1, 1, rows.length, 2).setValues(rows);
  sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  sheet.hideSheet();
}

/** Tags a spreadsheet as a library, so listLibraries() finds it. */
function tagLibrary_(id) {
  var props = {};
  props[LIBRARY_PROPERTY] = '1';
  driveApi_('patch', '/files/' + id + '?supportsAllDrives=true', { properties: props });
}

// ----- Client-callable -------------------------------------------------------

/**
 * Every library the visitor can see (owned, shared with them, or in a shared
 * drive), for the landing page: [{ id, name, owner, ownedByMe }].
 */
function listLibraries() {
  var q = 'properties has { key=\'' + LIBRARY_PROPERTY + '\' and value=\'1\' } and trashed=false';
  var res = driveApi_('get', '/files?corpora=allDrives&includeItemsFromAllDrives=true&supportsAllDrives=true' +
    '&pageSize=200&orderBy=name&fields=' + encodeURIComponent('files(id,name,ownedByMe,owners(displayName,emailAddress))') +
    '&q=' + encodeURIComponent(q));
  var libs = (res.files || []).map(function (f) {
    var owner = f.owners && f.owners[0];
    return {
      id: f.id,
      name: f.name,
      ownedByMe: !!f.ownedByMe,
      owner: owner ? owner.displayName || owner.emailAddress : 'a shared drive'
    };
  });

  // The original library is only tagged once an editor opens it; list it anyway.
  var hasLegacy = libs.some(function (l) { return l.id === LEGACY_LIBRARY_ID; });
  if (!hasLegacy) {
    try {
      var lib = openLibrary_(LEGACY_LIBRARY_ID);
      var file = DriveApp.getFileById(lib.id);
      var me = Session.getActiveUser().getEmail();
      var ownerEmail = ownerEmail_(file);
      libs.unshift({ id: lib.id, name: lib.name, ownedByMe: ownerEmail === me, owner: ownerEmail });
    } catch (e) {
      // Not shared with this visitor.
    }
  }
  return libs;
}

/**
 * Creates a library in the visitor's Drive and returns { id, summary }.
 *
 * folderLink (optional) is an existing Drive folder of ROMs — in My Drive or a
 * shared drive — which is used as is and scanned. Without one, a new empty
 * "<name> ROMs" folder is made. Either way the spreadsheet goes inside the ROMs
 * folder, so sharing that one folder shares the whole library.
 */
function createLibrary(name, folderLink) {
  name = String(name || '').trim().slice(0, 100) || 'Game Library';
  var roms;
  if (String(folderLink || '').trim()) {
    var m = /folders\/([\w-]+)/.exec(folderLink) || /^\s*([\w-]{20,})\s*$/.exec(folderLink);
    if (!m) {
      throw new Error('That doesn\'t look like a Drive folder link.');
    }
    var caps = driveCapabilities_(m[1]);
    if (!caps) {
      throw new Error('You don\'t have access to that folder.');
    }
    if (!caps.canAddChildren) {
      throw new Error('You need edit access to that folder to make it a library.');
    }
    roms = DriveApp.getFolderById(m[1]);
  } else {
    roms = DriveApp.createFolder(name + ' ROMs');
  }
  var existing = roms.getFoldersByName('Assets');
  var assets = existing.hasNext() ? existing.next() : roms.createFolder('Assets');

  var ss = SpreadsheetApp.create(name);
  DriveApp.getFileById(ss.getId()).moveTo(roms);
  var blank = ss.getSheets()[0];
  getOrCreateSheet_(ss);
  ss.deleteSheet(blank);
  writeConfig_(ss, { Name: name, RomsFolderId: roms.getId(), AssetsFolderId: assets.getId() });
  tagLibrary_(ss.getId());

  var lib = openLibrary_(ss.getId());
  var summary = collectFiles_(roms).length ? setupDatabase_(lib) : '';
  return { id: lib.id, summary: summary };
}

/**
 * Shares a library with someone: the spreadsheet and the ROMs folder (Assets
 * is inside it), as 'viewer' (browse and download) or 'editor' (also add,
 * delete and manage). Google emails them the invitation.
 */
function shareLibrary(libraryId, email, role) {
  var lib = openLibrary_(libraryId);
  if (!getAccess_(lib).canShare) {
    throw new Error('You don\'t have permission to share this library.');
  }
  email = String(email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('"' + email + '" isn\'t an email address.');
  }
  var targets = [DriveApp.getFileById(lib.id), DriveApp.getFolderById(lib.romsFolderId)];
  targets.forEach(function (t) {
    if (role === 'editor') { t.addEditor(email); } else { t.addViewer(email); }
  });
  return 'Shared "' + lib.name + '" with ' + email + ' as ' + (role === 'editor' ? 'an editor' : 'a viewer') + '.';
}

/** Web-app version of the sheet menu's folder scan. Returns its summary. */
function scanLibrary(libraryId) {
  var lib = openLibrary_(libraryId);
  if (!getAccess_(lib).canManage) {
    throw new Error('You need edit access to the library\'s spreadsheet to scan its folder.');
  }
  return setupDatabase_(lib);
}

/** Web-app version of the sheet menu's "Show cover images". Returns a summary. */
function refreshSheetImages(libraryId) {
  var lib = openLibrary_(libraryId);
  if (!getAccess_(lib).canManage) {
    throw new Error('You need edit access to the library\'s spreadsheet to update it.');
  }
  var covered = insertCoverImages_(lib);
  return 'Put ' + covered + ' cover image' + (covered === 1 ? '' : 's') + ' into the spreadsheet\'s Image column.';
}
