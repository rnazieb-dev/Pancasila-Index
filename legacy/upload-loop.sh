#!/bin/bash
FILES=(packages/data/raw/compressed/v2_*.pdf)
TOTAL=${#FILES[@]}
i=0
for f in "${FILES[@]}"; do
  i=$((i+1))
  key=$(basename "$f" | sed 's/^v2_//' | sed 's/_/\//g')
  key="v2/$key"
  echo "[$i/$TOTAL] Uploading $key..."
  npx wrangler r2 object put "pancasila-arsip/$key" --file "$f" --remote
  sleep 1
done
echo "All done!"
