"""Build a Cloudflare Pages direct-upload bundle from the tested service source."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

source = Path(__file__).resolve().parent
output = source.parent / ".preview" / "visitor-map-deploy"
output.mkdir(parents=True, exist_ok=True)
(output / "_worker.js").write_bytes((source / "worker.mjs").read_bytes())
(output / "index.html").write_text(
    '<!doctype html><meta charset="utf-8"><title>Visitor statistics</title>'
    '<p>Visitor statistics service for <a href="https://zuodong-zhong.github.io/">'
    'Zuodong Zhong’s homepage</a>.</p>\n', encoding="utf-8"
)
archive = output.parent / "visitor-map.zip"
with ZipFile(archive, "w", ZIP_DEFLATED) as bundle:
    for name in ("_worker.js", "index.html"):
        bundle.write(output / name, name)
print(archive)
