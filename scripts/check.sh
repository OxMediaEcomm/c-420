#!/usr/bin/env sh
# C-420 pre-commit check. Run: sh scripts/check.sh
# Fails on:
#   1. em-dashes (U+2014) in C-420's own files (vendored upstream skills, agents/,
#      and rules/ are skipped; they keep their authors' original text. Python
#      files are skipped too: pptx-from-layouts parses the character as data)
#   2. invalid settings.json
#   3. any skill with a proprietary license
#   4. CLAUDE_CONFIG_DIR used as a C-420 variable (it is a built-in Claude Code var)
set -u
cd "$(dirname "$0")/.." || exit 1
FAIL=0
EMDASH=$(printf '\342\200\224')

is_vendored_skill() {
  _dir=$1
  _name=$(basename "$_dir")
  grep -v '^#' scripts/vendored-skills.txt | grep -qx "$_name" && return 0
  for _f in "$_dir"/SKILL.md "$_dir"/skill.md; do
    [ -f "$_f" ] || continue
    grep -q -i -E '^origin: *(ECC|community|Health1)' "$_f" && return 0
    grep -q -E '^ +author: *wondelai' "$_f" && return 0
  done
  return 1
}

# 1. em-dashes
OWN_FILES=$(git ls-files | grep -v -E '^(agents|rules|skills)/')
for d in skills/*/; do
  is_vendored_skill "${d%/}" && continue
  OWN_FILES="$OWN_FILES
$(git ls-files "$d")"
done
HITS=$(printf '%s\n' "$OWN_FILES" | grep . | while IFS= read -r f; do
  case "$f" in *.py) continue ;; esac
  [ -f "$f" ] && grep -n -F "$EMDASH" "$f" /dev/null 2>/dev/null
done)
if [ -n "$HITS" ]; then
  echo "FAIL: em-dashes found (use a comma, colon, parenthesis, or new sentence):"
  printf '%s\n' "$HITS" | head -60
  FAIL=1
fi

# 2. settings.json must be valid JSON
if ! node -e 'JSON.parse(require("fs").readFileSync("settings.json","utf8"))' 2>/dev/null; then
  echo "FAIL: settings.json is not valid JSON"
  FAIL=1
fi

# 3. proprietary skills cannot ship in an MIT repo
PROP=$(grep -l -i -E '^license: *proprietary' skills/*/SKILL.md skills/*/skill.md 2>/dev/null)
if [ -n "$PROP" ]; then
  echo "FAIL: proprietary-licensed skills present:"
  printf '%s\n' "$PROP"
  FAIL=1
fi

# 4. CLAUDE_CONFIG_DIR is reserved by Claude Code
RESERVED=$(git grep -n -F '${CLAUDE_CONFIG_DIR}' -- . ':!scripts/check.sh' 2>/dev/null)
if [ -n "$RESERVED" ]; then
  echo "FAIL: \${CLAUDE_CONFIG_DIR} is a built-in Claude Code variable, use \${C420_HOME}:"
  printf '%s\n' "$RESERVED"
  FAIL=1
fi

[ "$FAIL" -eq 0 ] && echo "check.sh: all checks passed"
exit "$FAIL"
