#!/usr/bin/env bash
# Extracts the illustrative (AI-generated) visuals from the owner's mockups, upscales them x4 with
# Real-ESRGAN and writes WebP to public/media/illus. These are NOT photos of Sarah: the UI labels them.
set -euo pipefail
FF="${FF:-/c/Program Files (x86)/Freemake/COM/1.1/FFMPEG_43/ffmpeg.exe}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"      # sarah/
ESR="$ROOT/tools/realesrgan/realesrgan-ncnn-vulkan.exe"
M1="$ROOT/maquettes/maquette-1-ensemble.webp"; M2="$ROOT/maquettes/maquette-2-desktop.webp"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media/illus"; TMP="$(mktemp -d)"
mkdir -p "$OUT"
# name|source|crop w:h:x:y|output width
while IFS='|' read -r n src crop w; do
  [ -z "$n" ] && continue
  "$FF" -v error -y -i "$src" -vf "crop=$crop" "$TMP/$n.png"
  "$ESR" -i "$TMP/$n.png" -o "$TMP/$n-x4.png" -n realesrgan-x4plus -s 4 >/dev/null 2>&1
  "$FF" -v error -y -i "$TMP/$n-x4.png" -vf "scale=$w:-2:flags=lanczos" -c:v libwebp -quality 84 "$OUT/$n.webp"
  "$FF" -v error -y -i "$TMP/$n-x4.png" -vf "scale=480:-2:flags=lanczos" -c:v libwebp -quality 78 "$OUT/$n-sm.webp"
done <<LIST
hero-dancer|$M2|398:356:648:52|1400
about-collage|$M2|436:246:370:402|1400
journey-dancer|$M2|296:262:1240:404|1000
dance-group|$M2|436:226:318:664|1400
cabin-crew|$M1|300:250:302:514|1000
stage-dance|$M2|150:122:795:743|600
class-zumba|$M2|160:122:966:743|600
stage-veil|$M2|160:122:1146:743|600
studio-fitness|$M2|154:122:1326:743|600
stage-group|$M1|124:84:30:848|600
studio-class|$M1|110:84:176:848|600
concert-crowd|$M1|110:84:436:848|600
mobile-hero|$M1|240:220:1262:112|900
LIST
rm -rf "$TMP"; ls -la "$OUT" | awk '{print $5, $9}'
