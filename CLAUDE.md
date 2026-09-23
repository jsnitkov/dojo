# Dojo: working notes for Claude

Dojo is an EMS interval trainer that paces home workouts in a Visionbody EMS suit. It runs as a
home-screen web app in Safari on iPad, served by GitHub Pages from `main` (repo root) at
https://jsnitkov.github.io/dojo/. There is no build step for the live site: the files in this
repo are the site. Merging to `main` is deploying.

## Layout

| Path | What it is |
|---|---|
| `index.html` | Markup only: home, run and data screens |
| `styles.css` | All styling |
| `js/program.js` | `BUILTIN` (the default program) and `IMAGES` (exercise name → photo paths). DOM-free, because `sw.js` imports it |
| `js/app.js` | All behavior: persistence, rendering, audio, timer, import/export |
| `img/*.jpg` | 55 exercise photos, `<slug>-1.jpg` = start position, `-2.jpg` = working position |
| `sw.js` | Service worker for offline launch; precaches the shell and every photo in `IMAGES` |
| `tools/build_standalone.py` | Rebuilds a single self-contained file at `dist/dojo-standalone.html` (gitignored) for publishing as a Claude artifact or sending as one file |
| `manifest.webmanifest`, `icon-*.png`, `icon.svg` | Install metadata and icons (`icon-180.png` is the iOS home-screen icon) |

Scripts are classic `<script>` tags, not ES modules; `program.js` and `app.js` share globals.
Keep it that way so the page works from `file://` and the standalone build stays a simple concat.

## Invariants (do not break these)

- **Timer anchors to the clock, never to frame deltas.** Elapsed time is `performance.now() - S.anchor`.
  Safari freezes `requestAnimationFrame` while backgrounded (the user switches to the Visionbody app
  mid-session), so accumulating per-frame time drifts. Pausing, seeking and Sync all re-set `S.anchor`.
- **Timing model.** One count = one impulse = `on + off` seconds (default 6 s on / 4 s off).
  An exercise is `counts` reps (one rep per impulse), followed by `baseCounts` transition impulses
  (default 2) that still show phase and play cues. Each built-in day is exactly 120 counts = 1,200 s
  (20:00) at 6/4. If you change built-in exercises or counts, keep every day at 120 counts.
- **Phase-aware photos.** With two photos, the start position shows on the off/release phase and the
  working position on the on/hold phase, switching in time with the impulse.
- **No gym equipment.** Home kit only: dumbbells, kettlebells, resistance bands, bodyweight. No cables,
  anchors or benches. Photos come from Free Exercise DB (Unlicense).
- **State is local only.** `localStorage` key `dojo.state.v1` holds rotation position, imported program,
  timing overrides, sound, lead-in and session history. Backup/restore is a downloaded JSON file.
  No cross-device sync. The `claude.use("db")` / `claude.use("downloads")` calls only do anything
  inside a Claude artifact; on GitHub Pages they are no-ops. Leave them in.
- **Lead-in and Sync.** A lead-in countdown (default 5 s) gives time to start the suit in the
  Visionbody app. Sync snaps the timer to the nearest impulse boundary when tapped on a felt
  contraction. There is no way to read the suit's Bluetooth state from Safari; don't try.
- **iPad first.** Test at iPad size (820×1180 portrait and landscape). Keep the screen wake lock and
  audio cues on every phase boundary.
- **Icon.** Torii gate over a rising sun: shallow-sweep kasagi, two wide pillars. It must stay legible
  at 60 px on the home screen.

## Workflow

- Run locally: `python3 -m http.server 8000` in the repo root, open http://localhost:8000.
  (The service worker registers on localhost and https, not `file://`.)
- **Cache rule:** the app shell is network-first, so code changes show up on the next online launch.
  Photos are cache-first: if you replace a photo under the same file name, bump `CACHE` in `sw.js`.
  Adding a photo only needs its path added to `IMAGES`.
- New exercise: add photos as `img/<slug>-1.jpg` / `-2.jpg`, add the entry to `IMAGES`, then reference
  it from `BUILTIN` with `"image": "<IMAGES key>"`.
- For a single-file copy: `python3 tools/build_standalone.py` → `dist/dojo-standalone.html`.
- Before pushing, load the app, start a day, and confirm the photo and phase word update, and that
  there are no console errors.
