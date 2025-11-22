#!/usr/bin/env bash
#
# scripts/optimize-images.sh
#
# Resize and create WebP + resized JPEG fallbacks for each source image.
# - Place source images in img/ (or pass files as args)
# - Outputs: img/<name>-<WIDTH>.jpg and img/<name>-<WIDTH>.webp
#
# Dependencies:
#   - ImageMagick (convert)
#   - cwebp (part of libwebp)
#
# Usage:
#   # process everything in img/
#   ./scripts/optimize-images.sh
#
#   # or process specific files
#   ./scripts/optimize-images.sh img/US.jpg img/hero.jpg
#
set -euo pipefail

# Config: change as needed
OUT_DIR="img"
SIZES=(400 800 1200 1600)
QUALITY_JPG=82
QUALITY_WEBP=75
# temporary intermediate quality for webp generation (uses resized jpg as source)

# Check dependencies
command -v convert >/dev/null 2>&1 || { echo >&2 "ImageMagick 'convert' not found. Install it and retry."; exit 1; }
command -v cwebp >/dev/null 2>&1 || {
  echo >&2 "Warning: 'cwebp' not found. Script will still produce resized JPEGs but not WebP.";
  HAVE_CWEBP=0
} 
HAVE_CWEBP=${HAVE_CWEBP:-1}

# Helper: safe basename (preserves spaces)
basename_noext() {
  local f="$1"
  # strip dirname and extension
  local b="${f##*/}"
  echo "${b%.*}"
}

# Collect sources: either passed as args, or auto-scan img
SOURCES=()
if [ "$#" -gt 0 ]; then
  for f in "$@"; do
    SOURCES+=("$f")
  done
else
  # glob jpg/jpeg/png (ignore already-generated variants like *-400.jpg)
  shopt -s nullglob
  for f in "$OUT_DIR"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
    # skip files that look like generated variants (have -<number> before extension)
    if [[ "$f" =~ -[0-9]{2,4}\.(jpg|jpeg|png|JPG|JPEG|PNG)$ ]]; then
      continue
    fi
    SOURCES+=("$f")
  done
  shopt -u nullglob
fi

if [ ${#SOURCES[@]} -eq 0 ]; then
  echo "No source images found. Place images in '${OUT_DIR}/' or pass files as args."
  exit 0
fi

mkdir -p "$OUT_DIR"

echo "Processing ${#SOURCES[@]} image(s)..."

for SRC in "${SOURCES[@]}"; do
  if [ ! -f "$SRC" ]; then
    echo "Skipping non-file: $SRC"
    continue
  fi

  NAME=$(basename_noext "$SRC")
  echo ""
  echo "→ $SRC  (base name: $NAME)"

  for W in "${SIZES[@]}"; do
    OUT_JPG="${OUT_DIR}/${NAME}-${W}.jpg"
    OUT_WEBP="${OUT_DIR}/${NAME}-${W}.webp"

    # Resize: maintain aspect ratio, auto-orient, strip metadata, progressive JPEG
    # The geometry uses width limit; height adjusts automatically.
    convert "$SRC" -auto-orient -strip -quality "$QUALITY_JPG" -interlace Plane -resize "${W}x" "$OUT_JPG"

    echo "   created ${OUT_JPG}"

    if [ "$HAVE_CWEBP" -eq 1 ]; then
      # convert to webp (from the resized jpg for consistent content)
      cwebp -q "$QUALITY_WEBP" "$OUT_JPG" -o "$OUT_WEBP" >/dev/null 2>&1 \
        && echo "   created ${OUT_WEBP}" \
        || echo "   failed to create ${OUT_WEBP}"
    fi
  done

  # Optional: create a small thumbnail (120px) for tiny uses
  THUMB="${OUT_DIR}/${NAME}-120.jpg"
  convert "$SRC" -auto-orient -strip -quality 78 -resize 120x120^ -gravity center -extent 120x120 "$THUMB"
  echo "   created thumbnail ${THUMB}"
  if [ "$HAVE_CWEBP" -eq 1 ]; then
    cwebp -q 68 "$THUMB" -o "${OUT_DIR}/${NAME}-120.webp" >/dev/null 2>&1 && echo "   created ${OUT_DIR}/${NAME}-120.webp"
  fi

done

echo ""
echo "All done. Variants placed in '${OUT_DIR}/'."
echo "Suggested next steps:"
echo " - Use <picture> + srcset in your HTML to reference the generated files."
echo " - Test with Chrome DevTools (Network throttling) and Lighthouse."
