#!/usr/bin/env python3
"""Generate the two /banner desk photographs with Gemini (Nano Banana).

Writes public/Images/banner/scene-light.png and scene-dark.png. The page picks
them up on the next render — `src/components/banner/banner-scene.tsx` looks for
exactly those files and falls back to drawn SVG when they are missing.

Needs GEMINI_API_KEY, taken from the environment or from ~/.claude/.env (the
same file the design skill reads). No dependencies — this calls the REST
endpoint with urllib on purpose: macOS ships an externally-managed Python
(PEP 668), so `pip install google-genai` fails on this machine and a venv for
one HTTP request is not worth carrying.

    python3 scripts/generate-banner-scene.py            # both themes
    python3 scripts/generate-banner-scene.py --theme dark --variant 2

`--variant` just changes the output name (scene-dark-2.png) so several takes can
be compared before one is renamed into place.
"""

import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ENDPOINT = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash-image:generateContent"
)

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "Images" / "banner"

# Shared subject. Both themes MUST describe the same objects in the same places:
# only the light changes between them, and the page cross-fades one for the
# other. The left third is deliberately empty — the hero copy sits there behind
# a gradient wedge, and anything busy under 72px type is noise.
SUBJECT = """A wide 16:9 photograph of a calm home-office desk, shot slightly
from above at a shallow angle with a 35mm lens and a soft shallow depth of field.

Objects, arranged in the RIGHT two thirds of the frame:
- a dark forest-green hardcover notebook lying flat and closed, slightly angled,
  with a black elastic band near its right edge and small gold lettering reading
  "Better Workdays" on the cover
- a dark green fountain pen with a gold band, lying diagonally in front of the
  notebook
- a terracotta / burnt-orange ceramic mug to the right of the notebook, with
  handwritten cream lettering reading "Good Notes Brighter Days"
- a healthy green leafy plant in an off-white speckled ceramic pot, behind and
  right of the mug
- three stacked beige wooden blocks at the far right edge, edge-on, lettered
  "Focus", "Build" and "Grow"
- the corner of a silver laptop entering the bottom-right corner of the frame
- a framed print on the wall behind, upper right, with handwritten script
  reading "A Clearer You"

The LEFT third of the frame is quiet negative space: wall and empty desk only,
softly out of focus, no objects, no text.

Absolutely no user interface, no app windows, no cards, no buttons, no overlaid
graphics, no watermark, no borders, no people and no hands."""

LIGHT = """Bright warm daylight from a window on the left. Creamy ivory walls,
pale warm-white light wood desk, soft beige shadows, airy and calm, editorial
interior photography. Overall tone light cream (#F6F2EC)."""

DARK = """The same desk at night, lit by a single warm tungsten lamp off to the
right. Deep charcoal green-black room, rich dark wood, warm orange highlights
along the right, strong falloff into darkness at the left and edges, cinematic
and moody but still calm and premium. Overall tone near-black teal (#071214).
This is a genuine night photograph of the same scene, not a darkened copy."""


def load_key() -> str:
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    env = Path.home() / ".claude" / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            line = line.strip()
            if line.startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip("\"'")
    sys.exit(
        "GEMINI_API_KEY not set.\n"
        "Add it to ~/.claude/.env as:  GEMINI_API_KEY=your-key\n"
        "Get one at https://aistudio.google.com/apikey"
    )


def generate(theme: str, key: str, variant: str | None) -> Path:
    lighting = LIGHT if theme == "light" else DARK
    payload = {
        "contents": [{"parts": [{"text": f"{SUBJECT}\n\nLighting and colour:\n{lighting}"}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"],
            "imageConfig": {"aspectRatio": "16:9"},
        },
    }

    request = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            body = json.load(response)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors="replace")[:600]
        sys.exit(f"Gemini refused the {theme} request ({exc.code}):\n{detail}")
    except urllib.error.URLError as exc:
        sys.exit(f"Could not reach Gemini: {exc.reason}")

    candidates = body.get("candidates") or []
    parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
    for part in parts:
        inline = part.get("inlineData") or part.get("inline_data")
        if inline and str(inline.get("mimeType", inline.get("mime_type", ""))).startswith("image/"):
            name = f"scene-{theme}{f'-{variant}' if variant else ''}.png"
            out = OUT_DIR / name
            OUT_DIR.mkdir(parents=True, exist_ok=True)
            out.write_bytes(base64.b64decode(inline["data"]))
            return out

    text = " ".join(part.get("text", "") for part in parts).strip()
    sys.exit(f"Gemini returned no image for the {theme} scene. It said: {text or body}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--theme", choices=["light", "dark", "both"], default="both")
    parser.add_argument("--variant", help="suffix for the output file, e.g. 2")
    args = parser.parse_args()

    key = load_key()
    themes = ["light", "dark"] if args.theme == "both" else [args.theme]
    for theme in themes:
        print(f"Generating the {theme} scene...")
        print(f"  wrote {generate(theme, key, args.variant)}")


if __name__ == "__main__":
    main()
