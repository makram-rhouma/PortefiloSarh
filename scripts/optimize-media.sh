#!/usr/bin/env bash
# Builds web copies of Sarah's media into public/media. Originals are only read, never modified.
# Usage: FF=/path/to/ffmpeg bash scripts/optimize-media.sh
set -euo pipefail
FF="${FF:-/c/Program Files (x86)/Freemake/COM/1.1/FFMPEG_43/ffmpeg.exe}"
SRC="$(cd "$(dirname "$0")/../.." && pwd)"   # the sarah/ folder
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media"
mkdir -p "$OUT/video" "$OUT/img"
q() { "$FF" -v error -y "$@"; }

# Videos: AI-restored masters (enhanced_v2) -> 720x1272 H.264, web bitrate, fast start
for i in 1 2 3; do
  q -i "$SRC/enhanced_v2/Sarah_${i}_Professional.mp4" -c:v libx264 -preset slow -crf 25 -maxrate 1800k -bufsize 3600k \
    -pix_fmt yuv420p -profile:v high -c:a aac -b:a 96k -movflags +faststart "$OUT/video/sarah-$i.mp4"
done
# Hero loop: muted 8 s from the solo fitness clip
q -ss 8 -t 8 -i "$SRC/enhanced_v2/Sarah_2_Professional.mp4" -an -vf scale=540:-2 -c:v libx264 -preset slow -crf 27 \
  -pix_fmt yuv420p -movflags +faststart "$OUT/video/hero-loop.mp4"

# Stills from the videos: name:video:second
for s in dance-1:1:4 dance-2:1:14 dance-3:1:25 dance-4:1:40 fitness-1:2:6 fitness-2:2:20 fitness-3:2:35 fitness-4:2:48 zumba-1:3:3 zumba-2:3:9; do
  IFS=: read -r n v t <<<"$s"
  q -ss "$t" -i "$SRC/enhanced_v2/Sarah_${v}_Professional.mp4" -frames:v 1 -c:v libwebp -quality 82 "$OUT/img/$n.webp"
  q -ss "$t" -i "$SRC/enhanced_v2/Sarah_${v}_Professional.mp4" -frames:v 1 -vf scale=360:-2 -c:v libwebp -quality 75 "$OUT/img/$n-sm.webp"
done
# Video posters (WebP + AVIF)
for p in 1:14 2:20 3:9; do
  IFS=: read -r v t <<<"$p"
  q -ss "$t" -i "$SRC/enhanced_v2/Sarah_${v}_Professional.mp4" -frames:v 1 -c:v libwebp -quality 80 "$OUT/video/sarah-$v-poster.webp"
  q -ss "$t" -i "$SRC/enhanced_v2/Sarah_${v}_Professional.mp4" -frames:v 1 -c:v libaom-av1 -still-picture 1 -crf 32 "$OUT/video/sarah-$v-poster.avif"
done
# Illustrations supplied by the user (app screenshots: crop out the UI buttons)
q -i "$SRC/Zumba.png" -vf "crop=588:811:120:10" -c:v libwebp -quality 85 "$OUT/img/illustration-zumba.webp"
q -i "$SRC/fitness.png" -vf "crop=588:800:120:20" -c:v libwebp -quality 85 "$OUT/img/illustration-fitdance.webp"
q -i "$SRC/915691626_1448536560133431_4853741845701119489_n.jpg" -c:v libwebp -quality 85 "$OUT/img/illustration-dance-collage.webp"
ls -la "$OUT/video" "$OUT/img"
