#!/usr/bin/env python3
"""Rebuild the single-file Dojo (everything inlined) at dist/dojo-standalone.html.

Use it only when you need a self-contained copy, e.g. to publish as a Claude artifact or
to send the app as one file. GitHub Pages serves the split files directly; do not commit dist/.
Run from the repo root:  python3 tools/build_standalone.py
"""
import base64, json, mimetypes, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text()
css = (root / "styles.css").read_text()
program = (root / "js/program.js").read_text()
app = (root / "js/app.js").read_text()

def data_uri(rel):
    p = root / rel
    mime = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()

# Swap photo paths in the IMAGES map for data URIs.
m = re.search(r"const IMAGES = (\{.*?\});", program, re.S)
images = json.loads(m.group(1))
inlined = {k: [data_uri(p) for p in v] for k, v in images.items()}
program = program[:m.start()] + "const IMAGES = " + json.dumps(inlined) + ";" + program[m.end():]

# The service worker needs real files on a server, so drop its registration.
app = re.sub(r"/\* SW:start.*?/\* SW:end \*/\n?", "", app, flags=re.S)

scripts = program.replace('"use strict";', "", 1) + "\n" + app.replace('"use strict";', "", 1)
html = html.replace('<link rel="stylesheet" href="styles.css">', "<style>\n" + css + "</style>")
html = html.replace('<script src="js/program.js"></script>\n<script src="js/app.js"></script>',
                    '<script>\n"use strict";\n' + scripts + "</script>")
assert "js/app.js" not in html and "styles.css" not in html, "index.html layout changed; update this script"

out = root / "dist" / "dojo-standalone.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html)
print(f"wrote {out.relative_to(root)} ({out.stat().st_size/1e6:.2f} MB)")
