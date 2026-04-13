#!/bin/bash
cd "$(dirname "$0")"
git add index.html .gitignore
git commit -m "update: $(date '+%Y-%m-%d %H:%M')"
git push origin main
echo "✅ GitHub 저장 완료!"
