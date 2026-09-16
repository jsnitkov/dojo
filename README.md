# Dojo

EMS interval trainer. One self-contained page — exercise photos, timing and program data are all
embedded, so once the page has loaded it runs with no network.

## Hosting on GitHub Pages

Push these files to a repo, then Settings -> Pages -> Source: `main`, folder `/ (root)`.
The site appears at `https://<user>.github.io/<repo>/` after a minute or so.

## Adding to a home screen

Open the Pages URL in Safari, Share -> Add to Home Screen. Because this is served as its own page
(rather than inside another site), it launches genuinely full screen with no browser chrome,
and uses the dojo icon.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app, including all 58 exercise photos as embedded data |
| `icon-180.png` | iOS home-screen icon |
| `icon-192.png` / `icon-512.png` | Android / PWA icons |
| `manifest.webmanifest` | Lets Android install it as a standalone app |

## Program format

Import accepts JSON. `counts` is reps for an exercise (one rep per impulse), `baseCounts` is the
transition between exercises in impulse counts, and each day may carry its own `impulse` timing.
Use the *Insert template* button in the app to see a working example.

## State

Rotation position and any imported program are stored in the browser's local storage, per device.
