# Dojo

EMS interval trainer for home workouts. Served by GitHub Pages at https://jsnitkov.github.io/dojo/.
After the first online visit, a service worker caches the app and all 55 exercise photos, so it
launches and runs with no network.

## Hosting on GitHub Pages

Settings → Pages → Source: `main`, folder `/ (root)`. Every push to `main` redeploys in about a minute.

## Adding to a home screen

Open the Pages URL in Safari, Share → Add to Home Screen. It launches full screen with the Dojo icon.

## Files

| Path | Purpose |
|---|---|
| `index.html`, `styles.css`, `js/app.js` | The app |
| `js/program.js` | Built-in program and exercise-photo map |
| `img/` | Exercise photos (start / working position) |
| `sw.js` | Offline caching |
| `tools/build_standalone.py` | Builds one self-contained HTML file in `dist/` |
| `icon-180.png` | iOS home-screen icon |
| `icon-192.png` / `icon-512.png`, `manifest.webmanifest` | PWA install metadata |
| `CLAUDE.md` | Project notes Claude Code loads automatically |

## Program format

Import accepts JSON. `counts` is reps for an exercise (one rep per impulse), `baseCounts` is the
transition between exercises in impulse counts, and each day may carry its own `impulse` timing.
Use the *Insert template* button in the app to see a working example.

## State

Rotation position, any imported program and session history are stored in the browser's local
storage, per device. Use Backup / Restore in the app to move them.
