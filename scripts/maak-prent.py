#!/usr/bin/env python3
"""
Make an article photograph with Gemini in the paper's photographic style.

    python3 scripts/maak-prent.py koeberg-forum "’n Leë dorpsaal met plastiekstoele in rye"

Writes public/prente/<naam>.<ext> and prints the frontmatter lines to paste into
the article. Refuses to overwrite an existing file.

The model can be swapped without editing this file:

    GEMINI_IMAGE_MODEL=... python3 scripts/maak-prent.py ...

If the model name is wrong the script lists the image models the key may use.
"""
import base64
import json
import os
import pathlib
import subprocess
import sys

MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-3-pro-image-preview")
WORTEL = pathlib.Path(__file__).resolve().parent.parent
PRENTE = WORTEL / "public/prente"

# The paper runs plain news photography, not illustration. The joke lives in the
# copy — a photo that winks at it ruins the piece.
STYL = """A plain, unremarkable South African news photograph, as a wire-service
photographer would shoot it: available light, documentary framing, ordinary
subject matter, nothing staged or dramatic. No text, no captions, no watermarks,
no logos. No recognisable faces. Landscape orientation.

SUBJECT: """

UITBREIDINGS = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def sleutel() -> str:
    uit = subprocess.run(
        "grep '^GEMINI_API_KEY=' ~/one-man-band/.env.local | cut -d= -f2-",
        shell=True, capture_output=True, text=True,
    ).stdout.strip().strip('"').strip("'")
    if not uit:
        sys.exit("GEMINI_API_KEY nie gevind in ~/one-man-band/.env.local nie.")
    return uit


def modelle(api_sleutel: str) -> str:
    """Names of the models this key may call, so a 404 says what to use instead."""
    rou = subprocess.run([
        "curl", "-s", "https://generativelanguage.googleapis.com/v1beta/models",
        "-H", f"x-goog-api-key: {api_sleutel}",
    ], capture_output=True, text=True).stdout
    try:
        name = [m["name"].removeprefix("models/") for m in json.loads(rou).get("models", [])]
    except json.JSONDecodeError:
        return ""
    return "\n".join(n for n in name if "image" in n)


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)

    naam, toneel = sys.argv[1], sys.argv[2]
    api_sleutel = sleutel()

    versoek = WORTEL / ".prentversoek.json"
    versoek.write_text(json.dumps({
        "contents": [{"parts": [{"text": STYL + toneel}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }, ensure_ascii=False), encoding="utf-8")

    try:
        rou = subprocess.run([
            "curl", "-s", "-X", "POST",
            f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
            "-H", f"x-goog-api-key: {api_sleutel}",
            "-H", "Content-Type: application/json",
            "-d", f"@{versoek}",
        ], capture_output=True, text=True).stdout
    finally:
        versoek.unlink(missing_ok=True)

    antwoord = json.loads(rou)
    if "candidates" not in antwoord:
        boodskap = f"Gemini het nie ’n prent teruggegee nie:\n{rou[:400]}"
        beskikbaar = modelle(api_sleutel)
        if beskikbaar:
            boodskap += f"\n\nBeeldmodelle vir hierdie sleutel:\n{beskikbaar}"
        sys.exit(boodskap)

    dele = antwoord["candidates"][0]["content"]["parts"]
    prent = next((d["inlineData"] for d in dele if "inlineData" in d), None)
    if prent is None:
        sys.exit(f"Die antwoord bevat net teks:\n{rou[:400]}")

    ext = UITBREIDINGS.get(prent.get("mimeType", ""), "png")
    pad = PRENTE / f"{naam}.{ext}"
    if pad.exists():
        sys.exit(f"{pad.relative_to(WORTEL)} bestaan reeds — kies ’n ander naam.")

    pad.write_bytes(base64.b64decode(prent["data"]))
    print(f"{pad.relative_to(WORTEL)} — {pad.stat().st_size // 1024} kB\n", file=sys.stderr)
    print(f"prent: /prente/{pad.name}")
    print(f"prentAlt: \"{toneel}\"")
    print('prentBronskrif: "Foto: Flash Potgieter"')


if __name__ == "__main__":
    main()
