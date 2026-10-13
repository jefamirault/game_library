/**
 * Game Library — uploads from the web app.
 *
 * The web app runs as the visitor, so every write here happens with their own
 * Drive and Sheets permissions. The capability checks below mirror what the UI
 * shows; Drive would refuse the write anyway.
 */

/** Largest cover image accepted, in bytes. */
var MAX_COVER_BYTES = 5 * 1024 * 1024;

/** Cover image types we accept → the extension they're saved with. */
var COVER_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };

/**
 * Starts a resumable Drive upload of a ROM into the ROMs folder and returns the
 * session URL. The browser then PUTs the file to it in chunks — straight to
 * Drive, so large ROMs never pass through Apps Script. The session URL only
 * accepts this one file; the OAuth token stays on the server.
 *
 * origin is the page's own origin: Drive only answers the browser's
 * cross-origin PUTs if the session was started with it.
 */
function startRomUpload(name, size, mimeType, origin) {
  if (!getAccess_().canUploadGames) {
    throw new Error('You don\'t have permission to add games.');
  }
  name = String(name || '').trim();
  if (!isLikelyRom_(name)) {
    throw new Error('"' + name + '" doesn\'t look like a ROM (unknown file extension).');
  }
  size = Number(size);
  if (!(size > 0)) {
    throw new Error('"' + name + '" is empty.');
  }
  if (!/^https:\/\/[a-z0-9-]+\.googleusercontent\.com$/.test(String(origin))) {
    throw new Error('Unexpected page origin: ' + origin);
  }

  var res = UrlFetchApp.fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true', {
      method: 'post',
      contentType: 'application/json; charset=UTF-8',
      payload: JSON.stringify({ name: name, parents: [ROMS_FOLDER_ID] }),
      headers: {
        Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
        'X-Upload-Content-Type': mimeType || 'application/octet-stream',
        'X-Upload-Content-Length': String(size),
        Origin: origin
      },
      muteHttpExceptions: true
    });
  var headers = res.getAllHeaders();
  var location = headers.Location || headers.location;
  if (res.getResponseCode() !== 200 || !location) {
    throw new Error('Drive refused the upload (' + res.getResponseCode() + '): ' + res.getContentText());
  }
  return location;
}

/**
 * Adds the sheet row for a ROM the browser just finished uploading, and
 * returns it as a game object (same shape as getGames()). Title and Console
 * come from the upload form; blank ones are guessed from the filename, as the
 * folder scan does.
 */
function finishRomUpload(fileId, title, consoleName) {
  if (!getAccess_().canUploadGames) {
    throw new Error('You don\'t have permission to add games.');
  }
  var file = DriveApp.getFileById(fileId);
  if (!inFolder_(file, ROMS_FOLDER_ID)) {
    throw new Error('That file isn\'t in the ROMs folder.');
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = getOrCreateSheet_();
    if (findRow_(sheet, fileId)) {
      throw new Error('"' + file.getName() + '" is already in the library.');
    }
    var header = getHeader_(sheet);
    var row = romRow_(header, { id: fileId, name: file.getName(), size: file.getSize() }, new Date(), {
      title: String(title || '').trim().slice(0, 200),
      console: String(consoleName || '').trim().slice(0, 100)
    });
    sheet.appendRow(row);
    return gameFromRow_(row, headerIndex_(header), getCoverIndex_(true));
  } finally {
    lock.releaseLock();
  }
}

/**
 * Saves a cover image for a game, as <ROM FileId>.<ext> in the Assets folder,
 * replacing any existing cover. dataUrl is the image as a data: URL. Returns
 * the cover as the web app shows it (a data URL of the Drive thumbnail).
 */
function uploadCover(romId, dataUrl) {
  if (!getAccess_().canUploadCovers) {
    throw new Error('You don\'t have permission to upload covers.');
  }
  var sheet = getOrCreateSheet_();
  var rowNum = findRow_(sheet, romId);
  if (!rowNum) {
    throw new Error('No game with that id.');
  }
  var m = /^data:([\w\/+.-]+);base64,(.+)$/.exec(String(dataUrl || ''));
  var ext = m && COVER_TYPES[m[1]];
  if (!ext) {
    throw new Error('Covers must be PNG, JPEG, GIF or WebP images.');
  }
  var bytes = Utilities.base64Decode(m[2]);
  if (bytes.length > MAX_COVER_BYTES) {
    throw new Error('Covers must be 5 MB or smaller.');
  }

  // Add the new cover before retiring the old one, so a failure part-way
  // leaves the game with a cover.
  var folder = DriveApp.getFolderById(ASSETS_FOLDER_ID);
  var name = romId + '.' + ext;
  var created = folder.createFile(Utilities.newBlob(bytes, m[1], name));
  retireCovers_(folder, romId, created.getId());

  var cache = CacheService.getScriptCache();
  cache.remove('coverIndex');
  var url = coverDataUrl_(created.getId(), cache);

  // The sheet's Image cell too, when the visitor can edit the sheet. It's
  // derived (insertCoverImages() rewrites it), so failing here is harmless.
  try {
    var header = getHeader_(sheet);
    var title = sheet.getRange(rowNum, header.indexOf('Title') + 1).getValue();
    sheet.getRange(rowNum, header.indexOf('Image') + 1).setValue(
      SpreadsheetApp.newCellImage().setSourceUrl(url).setAltTextTitle(String(title || '')).build());
  } catch (e) {
    Logger.log('Cover saved, but the sheet\'s Image cell wasn\'t updated: ' + e);
  }
  return url;
}

/**
 * Removes a game from the library: trashes its ROM file and cover(s) in Drive
 * (recoverable from Drive's trash for 30 days) and deletes its sheet row.
 * The ROM goes first — it's the step most likely to be refused, since in My
 * Drive only a file's owner can trash it — so a refusal leaves everything as
 * it was.
 */
function deleteGame(romId) {
  if (!getAccess_().canUploadGames) {
    throw new Error('You don\'t have permission to delete games.');
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = getOrCreateSheet_();
    var rowNum = findRow_(sheet, romId);
    if (!rowNum) {
      throw new Error('That game is no longer in the library.');
    }

    var file = null;
    try {
      file = DriveApp.getFileById(romId);
    } catch (e) {
      // Already gone from Drive — just clean up the row.
    }
    if (file) {
      var caps = driveCapabilities_(romId);
      if (!caps || !caps.canTrash) {
        throw new Error('Only the file\'s owner (' + ownerEmail_(file) + ') can delete "' +
          file.getName() + '".');
      }
      file.setTrashed(true);
    }

    retireCovers_(DriveApp.getFolderById(ASSETS_FOLDER_ID), romId, null);
    CacheService.getScriptCache().remove('coverIndex');
    sheet.deleteRow(rowNum);
  } finally {
    lock.releaseLock();
  }
}

/** A file's owner's email, or "someone else" when Drive won't say. */
function ownerEmail_(file) {
  try {
    return file.getOwner().getEmail() || 'someone else';
  } catch (e) {
    return 'someone else';
  }
}

/**
 * Takes every other cover for romId out of the Assets folder. Trashes them
 * when the visitor may; otherwise (only owners can trash in My Drive) renames
 * them so they no longer match a ROM id.
 */
function retireCovers_(folder, romId, keepId) {
  var files = folder.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    if (f.getId() === keepId) { continue; }
    var m = /^(.+)\.(png|jpe?g|gif|webp)$/i.exec(f.getName());
    if (!m || m[1] !== romId) { continue; }
    try {
      f.setTrashed(true);
    } catch (e) {
      f.setName('replaced-' + f.getName());
    }
  }
}

/** True if the file sits directly in the given folder. */
function inFolder_(file, folderId) {
  var parents = file.getParents();
  while (parents.hasNext()) {
    if (parents.next().getId() === folderId) { return true; }
  }
  return false;
}

/** The 1-based sheet row holding fileId, or 0 if it isn't in the sheet. */
function findRow_(sheet, fileId) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { return 0; }
  var col = getHeader_(sheet).indexOf('FileId') + 1;
  var ids = sheet.getRange(2, col, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(fileId)) { return i + 2; }
  }
  return 0;
}
