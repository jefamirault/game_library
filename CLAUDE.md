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

Source lives in `src/` (set by `rootDir` in `.clasp.json`). Three layers, plus a data file:

1. **`Setup.gs` — database population.** `setupDatabase()` recursively scans `ROMS_FOLDER_ID`, derives a Title from each filename, and guesses Console from the file extension via `EXTENSION_TO_CONSOLE`. Ambiguous container formats (`.iso`, `.bin`, `.zip`, …) are imported with a blank Console for the user to fill in. **Re-running is idempotent and additive:** rows are keyed by Drive `FileId`, so existing rows (and any manual edits to Console/Title/Notes) are never touched — only new files are appended.

2. **`Code.gs` — config, sheet access, web app entry points.**
   - `COLUMNS` is the single source of truth for the sheet schema. Code reads/writes columns **by header label**, not by index, so the header row (row 1 of the `Games` sheet) must stay intact. Reorder columns only by editing `COLUMNS`.
   - `doGet()` serves `index.html`; `getGames()` is the client-callable bridge (`google.script.run`) returning game objects plus a Drive download URL.
   - `getCovers(romIds)` serves cover art from `ASSETS_FOLDER_ID` as data URLs (Drive thumbnails, cached in `CacheService`). Covers are named `<ROM FileId>.png`. It takes ROM ids, never raw Drive ids, so an anonymous caller can't read arbitrary files as the owner.
   - `onOpen()` adds a **Game Library** spreadsheet menu (run setup, fill game info, show cover images, show web app URL).
   - `getOrCreateSheet_()` appends any `COLUMNS` missing from an existing sheet's header, so adding a column to `COLUMNS` migrates the live sheet on the next run.

   **`GameInfo.gs` — reference metadata.** `GAME_INFO` maps ROM FileId → developer, publisher, release date, genre, players, credits and a description (sourced from Wikipedia infoboxes; North American dates for USA dumps). `fillGameInfo()` (menu item; also run at the end of `setupDatabase()`) copies it into the sheet's game info columns, **filling blank cells only** — the sheet wins once a value is there. New ROMs need a new `GAME_INFO` entry, or fill the sheet by hand.

3. **`index.html` — the browse/download UI.** Pure client-side rendering of the `getGames()` result with search (title, filename, developer, publisher, genre, credits), a per-console filter, and sorting. Clicking a title or cover opens a details dialog with the game info. Console badges are color-coded by `consoleHue()` (iconic hues for known platforms in `CONSOLE_HUES`, a stable name-hash hue otherwise).

## Things that bite

- **Updating the web app requires a redeploy.** `clasp push` alone does not change what the `/exec` URL serves — the deployment is pinned to a version. Use `clasp redeploy <id>` to keep the same shared URL.
- **`/exec` vs `/dev` URLs.** Only `/exec` is shareable; `/dev` works for owner/editors only. URLs containing `/u/N/`, `?authuser=`, or `/a/macros/<domain>/` break for other users.
- **Download links go straight to Drive** (`https://drive.google.com/uc?export=download&id=<fileId>`). The web app runs as the deploying user (`executeAs: USER_DEPLOYING`) so the *listing* needs no per-viewer access, but **downloads still require each viewer to have Drive access to the files** — share the ROMs folder accordingly. Web app access is `ANYONE_ANONYMOUS` (see `src/appsscript.json`).
- **Covers are proxied through the app, not linked.** The Assets folder isn't public, so `index.html` loads covers in batches via `getCovers()` rather than using Drive image URLs. The local `images/` folder (gitignored) is the source copy; `images/sources.tsv` records which libretro-thumbnails box art each came from. `setupDatabase()` ignores the Assets folder's files because `isLikelyRom_` filters by extension. The sheet's `Image` column shows each cover *in the cell* (`insertCoverImages()`, via `newCellImage()` with the cached thumbnail as a data URL, so the Assets folder stays private). It rewrites the whole column and resets row heights on every run (derived, not hand-edited); `setupDatabase()` calls it too.
- **Scopes** are declared in `src/appsscript.json` (`spreadsheets`, `drive.readonly`, `script.container.ui`). The first menu run triggers the OAuth consent prompt.
