#!/usr/bin/env python3
"""
Draft an article with Gemini in the paper's voice.

    python3 scripts/skryf-berig.py "Die kop van die berig" "Konteks vir die grap"

Prints the body to stdout. It does NOT write a file — drafts go past Piet before
anything is published.

The house voice and the Afrikaans style guide (docs/afrikaanse-styl.md) are both
sent with every request, so corrections made once do not have to be made again.
"""
import json
import pathlib
import subprocess
import sys

MODEL = "gemini-3.7-flash"
WORTEL = pathlib.Path(__file__).resolve().parent.parent

HUISSTEM = """Jy skryf vir 'n Afrikaanse satiriese koerant, Die Transvaler — slagspreuk: fopnuus wat jy kan vertrou.

DIE HUISSTEM
Die humor sit HEELTEMAL in die inhoud, nooit in die aanbieding nie. Skryf soos 'n doodgewone, ernstige nuusberig — droog, feitelik, in die register van 'n regte koerant. Hoe erniger die toon, hoe snaakser die berig. Dink The Onion of Private Eye, maar Afrikaans.

DIE REELS
- Moenie die grap verduidelik nie. Nooit.
- Konkrete, gewone besonderhede maak dit snaakser: bedrae, tye, name van vorms, hoeveel mense in die tou.
- Ten minste een aanhaling van 'n woordvoerder, amptenaar, of gewone mens.
- Sluit af op 'n droe noot, nie 'n slotgrap nie.
- 180 tot 250 woorde.

MOENIE
- Moenie die kop herhaal as eerste sin nie.
- Moenie markdown-opskrifte gebruik nie — net paragrawe.
- Moenie 'n titel of frontmatter skryf nie.
- Moenie 'n werklike private persoon by die naam noem nie, en moenie gedrag aan 'n werklike persoon toedig nie. Satiriseer instellings en tipes.

Gee TERUG: net die liggaam van die berig, as gewone paragrawe geskei deur leë reëls. Niks anders nie.
"""


def sleutel() -> str:
    uit = subprocess.run(
        "grep '^GEMINI_API_KEY=' ~/one-man-band/.env.local | cut -d= -f2-",
        shell=True, capture_output=True, text=True,
    ).stdout.strip().strip('"').strip("'")
    if not uit:
        sys.exit("GEMINI_API_KEY nie gevind in ~/one-man-band/.env.local nie.")
    return uit


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)

    kop = sys.argv[1]
    konteks = sys.argv[2] if len(sys.argv) > 2 else ""
    styl = (WORTEL / "docs/afrikaanse-styl.md").read_text(encoding="utf-8")

    prompt = (
        f"{HUISSTEM}\n\n"
        f"AFRIKAANSE STYL — hou hierdie by, dit is die redakteur se eie korreksies:\n\n{styl}\n\n"
        f"KOP: {kop}\n"
    )
    if konteks:
        prompt += f"\nKONTEKS (vir jou, moenie dit verduidelik nie)\n{konteks}\n"

    versoek = WORTEL / ".versoek.json"
    versoek.write_text(json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 1.0, "maxOutputTokens": 8000},
    }, ensure_ascii=False), encoding="utf-8")

    try:
        rou = subprocess.run([
            "curl", "-s", "-X", "POST",
            f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
            "-H", f"x-goog-api-key: {sleutel()}",
            "-H", "Content-Type: application/json",
            "-d", f"@{versoek}",
        ], capture_output=True, text=True).stdout
    finally:
        versoek.unlink(missing_ok=True)

    antwoord = json.loads(rou)
    if "candidates" not in antwoord:
        sys.exit(f"Gemini het nie 'n berig teruggegee nie:\n{rou[:400]}")

    kandidaat = antwoord["candidates"][0]
    teks = kandidaat["content"]["parts"][-1]["text"].strip()
    print(teks)
    print(f"\n[{kandidaat.get('finishReason')}] {len(teks.split())} woorde", file=sys.stderr)


if __name__ == "__main__":
    main()
