#!/bin/bash
# Prepares one scenario for practice. Run it from inside the scenario folder:
#   cd scenarios/01-blog && bash ../../init-scenario.sh
#
# Installs dependencies, pre-downloads the in-memory MongoDB, creates the local
# git baseline that `make reset` restores, and marks the read-only files.
set -e

if [ ! -f package.json ] || [ ! -d backend ]; then
  echo "Run this from inside a scenario folder, e.g. cd scenarios/01-blog"
  exit 1
fi

SCENARIO=$(basename "$PWD")
echo "Preparing $SCENARIO..."

echo
echo "[1/3] Installing dependencies and preparing the database (this takes a few minutes the first time)..."
npm run setup

echo
echo "[2/3] Creating the reset baseline..."
if [ -d .git ]; then
  echo "      A git repository already exists here — leaving it alone."
  git rev-parse start > /dev/null 2>&1 || git tag start
else
  git init -b main -q 2>/dev/null || git init -q
  git add -A
  git -c user.email=practice@local -c user.name="Practice Lab" commit -q -m "Initial commit"
  git tag -f start > /dev/null
fi

echo
echo "[3/3] Marking the read-only files..."
# The authoritative list lives in PROJECT_FILES_INSTRUCTIONS.md.
COUNT=0
while read -r FILE; do
  if [ -f "$FILE" ]; then
    chmod 444 "$FILE"
    COUNT=$((COUNT + 1))
  fi
done < <(grep '^- ' PROJECT_FILES_INSTRUCTIONS.md | sed 's/^- //')
echo "      $COUNT files marked read-only."
git update-index --refresh > /dev/null 2>&1 || true

echo
echo "Setup complete for $SCENARIO."
echo
echo "Next:"
echo "  1. Read QUESTION.md, README.md and PROJECT_FILES_INSTRUCTIONS.md"
echo "  2. Start a timer (60 minutes to simulate the exam)"
echo "  3. Terminal 1: make start    Terminal 2: make test    Terminal 3: claude"
echo
echo "Run 'make' to see every command. Don't open answer-keys/ until you've debriefed."
