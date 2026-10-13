# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Google Apps Script (GAS) web app, managed locally with **clasp**, that serves as a browsable/downloadable library of game ROMs. It is a **container-bound** script attached to a Google Spreadsheet that acts as the database. A shared Google Drive folder holds the actual ROM files.

Key IDs (see `src/Code.gs` and `.clasp.json`):
- **ROMs Drive folder:** `1J2_2qBnPibevdMs2LwPFAxTE9Kl2tB_F` (`ROMS_FOLDER_ID`)
- **Cover art Drive folder:** `1x1MXKl6JNQn2HJeHpSpkmWCQ060ZS2ZP` (`ASSETS_FOLDER_ID`, an `Assets` subfolder of the ROMs folder)
- **Database spreadsheet / script parent:** `1qWhIB1XEXekPt--cZy2YXltgQ7vhBu1Cdh2O_tIYcHE`

## Commands

The user runs all `clasp push` / deploy commands themselves — **do not run them.** Provide the exact command and wait. Suggest running them in-session with the `!` prefix (e.g. `! clasp push -f`).

- **Deploy (push + update the live web app + stamp):** `./deploy.sh`. Writes `src/DeployStamp.gs` (gitignored), runs `clasp push -f`, then `clasp redeploy` on the live deployment. The stamp is the same `deploy.json` shape as the static sites, served at `<exec URL>/deploy.json` via `doGet`'s `pathInfo`.
- **Push code to Apps Script:** `clasp push -f`
- **List deployments:** `clasp list-deployments`
- **Update the live web app (keeps the same `/exec` URL):** `clasp redeploy <deploymentId>`
- **New deployment:** `clasp create-deployment --description "..."`
- **Open the deployed web app:** `clasp open-web-app`
- **Auth:** `clasp login` (interactive; the user runs it). Logged in as `jeffreyamirault@gmail.com`.

There is no build, lint, or test tooling — source pushes as-is.

## Architecture

Source lives in `src/` (set by `rootDir` in `.clasp.json`). Three layers, plus data and upload files:

1. **`Setup.gs` — database population.** `setupDatabase()` recursively scans `ROMS_FOLDER_ID`, derives a Title from each filename, and guesses Console from the file extension via `EXTENSION_TO_CONSOLE`. Ambiguous container formats (`.iso`, `.bin`, `.zip`, …) are imported with a blank Console for the user to fill in. **Re-running is idempotent and additive:** rows are keyed by Drive `FileId`, so existing rows (and any manual edits to Console/Title/Notes) are never touched — only new files are appended.

2. **`Code.gs` — config, sheet access, web app entry points.**
   - `COLUMNS` is the single source of truth for the sheet schema. Code reads/writes columns **by header label**, not by index, so the header row (row 1 of the `Games` sheet) must stay intact. Reorder columns only by editing `COLUMNS`.
   - `doGet()` serves `index.html` (as a template — it inlines `EXTENSION_TO_CONSOLE` for the upload form); `getGames()` is the client-callable bridge (`google.script.run`) returning `{ games, access }`: game objects (built by `gameFromRow_`) plus what this visitor may do.
   - `getAccess_()` asks the Drive API (`capabilities` on the ROMs folder, Assets folder and spreadsheet, as the visitor) for the header links and which upload buttons to show.
   - `getCovers(romIds)` serves cover art from `ASSETS_FOLDER_ID` as data URLs (Drive thumbnails, cached in the script-wide `CacheService`). Covers are named `<ROM FileId>.<ext>`. It takes ROM ids, never raw Drive ids, so it only ever serves files from the Assets folder.
   - `onOpen()` adds a **Game Library** spreadsheet menu (run setup, fill game info, show cover images, show web app URL).
   - `getOrCreateSheet_()` appends any `COLUMNS` missing from an existing sheet's header, so adding a column to `COLUMNS` migrates the live sheet on the next run.

   **`GameInfo.gs` — reference metadata.** `GAME_INFO` maps ROM FileId → developer, publisher, release date, genre, players, credits and a description (sourced from Wikipedia infoboxes; North American dates for USA dumps). `fillGameInfo()` (menu item; also run at the end of `setupDatabase()`) copies it into the sheet's game info columns, **filling blank cells only** — the sheet wins once a value is there. New ROMs need a new `GAME_INFO` entry, or fill the sheet by hand.

   **`Upload.gs` — uploads from the web UI, as the visitor.** `startRomUpload()` opens a Drive resumable-upload session in the ROMs folder (with the page's `Origin`, so the browser may PUT to it) and hands the session URL to the browser, which sends the file straight to Drive; `finishRomUpload()` then appends the sheet row via `romRow_` (shared with `setupDatabase()`). `uploadCover()` saves `<ROM FileId>.<ext>` in Assets, retiring the old cover (trashed, or renamed `replaced-…` when the visitor doesn't own it). `deleteGame()` trashes the ROM (refused unless Drive's `canTrash` allows it — in My Drive only the owner can) and its covers, then deletes the sheet row.

3. **`index.html` — the browse/download UI.** Pure client-side rendering of the `getGames()` result with search (title, filename, developer, publisher, genre, credits), a per-console filter, and sorting. Clicking a title or cover opens a details dialog with the game info. Console badges are color-coded by `consoleHue()` (iconic hues for known platforms in `CONSOLE_HUES`, a stable name-hash hue otherwise).

## Things that bite

- **Updating the web app requires a redeploy.** `clasp push` alone does not change what the `/exec` URL serves — the deployment is pinned to a version. Use `clasp redeploy <id>` to keep the same shared URL.
- **`/exec` vs `/dev` URLs.** Only `/exec` is shareable; `/dev` works for owner/editors only. URLs containing `/u/N/`, `?authuser=`, or `/a/macros/<domain>/` break for other users.
- **The web app runs as the visitor** (`executeAs: USER_ACCESSING`, `access: ANYONE` — must be signed in to Google; see `src/appsscript.json`). Google's sharing is the access control, and the app only reflects it:

  | Visitor can… | They get |
  |---|---|
  | view the spreadsheet + ROMs folder (Assets is inside it) | the library, covers, downloads, folder/sheet links |
  | add to the ROMs folder **and** edit the spreadsheet | **Add games**, and **Delete** (for ROM files they own) |
  | add to the Assets folder | **Upload / Replace cover** |
  | not view the spreadsheet | a "no access" message |

  The `drive` scope is restricted and the project is unverified, so each visitor clicks through Google's "unverified app" warning and a consent screen once (unverified apps are capped at 100 users). Scope changes need re-consent, the owner included.
- **Download links go straight to Drive** (`https://drive.google.com/uc?export=download&id=<fileId>`).
- **Covers are proxied through the app, not linked.** `index.html` loads covers in batches via `getCovers()` rather than using Drive image URLs. The local `images/` folder (gitignored) is the source copy; `images/sources.tsv` records which libretro-thumbnails box art each came from. `setupDatabase()` ignores the Assets folder's files because `isLikelyRom_` filters by extension. The sheet's `Image` column shows each cover *in the cell* (`insertCoverImages()`, via `newCellImage()` with the cached thumbnail as a data URL, so the Assets folder stays private). It rewrites the whole column and resets row heights on every run (derived, not hand-edited); `setupDatabase()` calls it too.
- **Scopes** are declared in `src/appsscript.json` (`spreadsheets`, `drive`, `script.container.ui`, `script.external_request`). `drive` (not `drive.file`) because uploads write into folders the app didn't create; `external_request` for the Drive API calls. The first run after a scope change triggers the OAuth consent prompt.
- **ROM uploads depend on CORS for the resumable session.** Drive only answers the browser's PUT if `startRomUpload()` started the session with the page's `Origin` header. If uploads fail with a network/CORS error, that's where to look.
