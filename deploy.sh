#!/bin/bash
# ============================================================
# Brennan Portfolio — One-click GitHub + Vercel Deploy Script
# Run this once from your Terminal:
#   cd "/Users/poh/Documents/Claude/Projects/IP - Brennen/brennen-website"
#   bash deploy.sh
# ============================================================

set -e

GITHUB_TOKEN="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"
VERCEL_TOKEN="vcp_1r6OYXUKUULwxf4QZPXS1scxiY3p9VSYNCb1ipAGzaS2CbJRmz1wzMED"
REPO_NAME="brennan-portfolio"

echo ""
echo "▶ Step 1/4 — Getting GitHub username..."
GITHUB_USER=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user | python3 -c "import sys,json; print(json.load(sys.stdin)['login'])")
echo "  GitHub user: $GITHUB_USER"

echo ""
echo "▶ Step 2/4 — Creating private GitHub repo '$REPO_NAME'..."
CREATE_RESULT=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"private\":true,\"description\":\"Brennan Phua interior design portfolio\"}")

REPO_URL=$(echo "$CREATE_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('html_url','ERROR: ' + d.get('message','unknown')))")

if [[ "$REPO_URL" == ERROR* ]]; then
  # Repo might already exist — check
  if echo "$CREATE_RESULT" | grep -q "already exists"; then
    echo "  Repo already exists — continuing..."
    REPO_URL="https://github.com/$GITHUB_USER/$REPO_NAME"
  else
    echo "  Failed to create repo: $REPO_URL"
    exit 1
  fi
else
  echo "  Created: $REPO_URL"
fi

echo ""
echo "▶ Step 3/4 — Pushing website files to GitHub..."
# Navigate to website folder (script is inside it)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Initialise git if needed
if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

# Set remote (overwrite if already set)
git remote remove origin 2>/dev/null || true
git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"

# Stage and commit
git add -A
git commit -m "Initial portfolio deployment" 2>/dev/null || git commit --allow-empty -m "Re-deploy"

git push -u origin main --force
echo "  Pushed ✓"

echo ""
echo "▶ Step 4/4 — Deploying to Vercel..."

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
  echo "  Installing Vercel CLI..."
  npm install -g vercel --silent
fi

# Deploy (--yes skips all prompts, --prod deploys to production URL)
VERCEL_OUTPUT=$(vercel --token "$VERCEL_TOKEN" --yes --prod 2>&1)
LIVE_URL=$(echo "$VERCEL_OUTPUT" | grep -E "^https://" | tail -1)

if [ -z "$LIVE_URL" ]; then
  # Try alternate grep
  LIVE_URL=$(echo "$VERCEL_OUTPUT" | grep -oE "https://[^ ]+" | tail -1)
fi

echo ""
echo "============================================================"
echo "  ✅ DONE!"
echo ""
echo "  GitHub repo  : $REPO_URL"
echo "  Live URL     : ${LIVE_URL:-'Check your Vercel dashboard: https://vercel.com/dashboard'}"
echo "============================================================"
echo ""
