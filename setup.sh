#!/usr/bin/env sh
# C-420 - one-command bootstrap
# Usage: ./setup.sh
#
# POSIX sh compatible: works under Git Bash on Windows, and bash/zsh/dash on
# macOS/Linux. Avoid bashisms here.

set -eu

# --- locate this script's own directory (the source to copy FROM) ----------
SOURCE_DIR=$(cd "$(dirname "$0")" && pwd)

echo "=== C-420 Setup ==="
echo ""
echo "Source: $SOURCE_DIR"
echo ""

# --- 1. user-level vs project-level -----------------------------------------
echo "Where do you want this installed?"
echo "  [1] User-level   -> \$HOME/.claude/        (applies to every project)"
echo "  [2] Project-level -> ./.claude/ (here)      (applies to this project only)"
printf "Choose 1 or 2 [1]: "
read -r INSTALL_CHOICE
INSTALL_CHOICE=${INSTALL_CHOICE:-1}

if [ "$INSTALL_CHOICE" = "2" ]; then
  PROJECT_ROOT=$(pwd)
  TARGET_DIR="$PROJECT_ROOT/.claude"
  CLAUDE_MD_DEST="$PROJECT_ROOT/CLAUDE.md"
  INSTALL_LABEL="project-level ($TARGET_DIR)"
else
  PROJECT_ROOT="$HOME"
  TARGET_DIR="$HOME/.claude"
  CLAUDE_MD_DEST="$TARGET_DIR/CLAUDE.md"
  INSTALL_LABEL="user-level ($TARGET_DIR)"
fi

echo ""
echo "Installing $INSTALL_LABEL"
mkdir -p "$TARGET_DIR"

# Anything this script would overwrite is copied here first. Nothing is deleted.
BACKUP_DIR="$TARGET_DIR/.c420-backup-$(date +%Y%m%d-%H%M%S)"

backup_path() {
  _path=$1
  if [ -e "$_path" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r "$_path" "$BACKUP_DIR/"
    echo "  backed up existing $(basename "$_path") -> $BACKUP_DIR/"
  fi
}

# Paths written into settings.json must work for bash, node, and cmd on every OS.
# On Git Bash, cygpath -m turns /c/Users/x into C:/Users/x.
to_native_path() {
  if command -v cygpath >/dev/null 2>&1; then
    cygpath -m "$1"
  else
    printf '%s' "$1"
  fi
}

# --- 2. copy core directories ------------------------------------------------
copy_dir() {
  _name=$1
  if [ -d "$SOURCE_DIR/$_name" ]; then
    if [ -d "$TARGET_DIR/$_name" ] && [ -n "$(ls -A "$TARGET_DIR/$_name" 2>/dev/null)" ]; then
      backup_path "$TARGET_DIR/$_name"
    fi
    echo "  copying $_name/ ..."
    mkdir -p "$TARGET_DIR/$_name"
    cp -r "$SOURCE_DIR/$_name/." "$TARGET_DIR/$_name/"
  else
    echo "  skipping $_name/ (not found in source)"
  fi
}

echo ""
echo "Copying directories..."
copy_dir "skills"
copy_dir "agents"
copy_dir "commands"
copy_dir "rules"
copy_dir "hooks"
copy_dir "mcp-servers"
copy_dir "scripts"

# memory/ holds the user's own memory once installed: seed only, never overwrite.
mkdir -p "$TARGET_DIR/memory"
if [ ! -f "$TARGET_DIR/memory/learned-triggers.md" ] && [ -f "$SOURCE_DIR/memory/learned-triggers.md" ]; then
  cp "$SOURCE_DIR/memory/learned-triggers.md" "$TARGET_DIR/memory/learned-triggers.md"
  echo "  seeded memory/learned-triggers.md"
fi

# --- 3. copy settings.json, statusline.sh, CLAUDE.md -------------------------
echo ""
echo "Statusline identity (shown in every session's status bar)."
printf "STATUSLINE_NAME [Your Name]: "
read -r STATUSLINE_NAME
STATUSLINE_NAME=${STATUSLINE_NAME:-"Your Name"}

printf "STATUSLINE_EMAIL [you@your-domain.com]: "
read -r STATUSLINE_EMAIL
STATUSLINE_EMAIL=${STATUSLINE_EMAIL:-"you@your-domain.com"}

echo ""
echo "Copying config files..."

# settings.json ships with __C420_HOME__ / __PROJECTS_ROOT__ placeholders.
# They are filled in here with real absolute paths, and identity values go into
# settings.json's "env" block. Claude Code reads that block; it never reads .env.
if [ -f "$SOURCE_DIR/settings.json" ]; then
  backup_path "$TARGET_DIR/settings.json"
  C420_HOME_NATIVE=$(to_native_path "$TARGET_DIR")
  PROJECTS_ROOT_NATIVE=$(to_native_path "$PROJECT_ROOT")
  C420_HOME="$C420_HOME_NATIVE" PROJECTS_ROOT_VALUE="$PROJECTS_ROOT_NATIVE" \
  STATUSLINE_NAME="$STATUSLINE_NAME" STATUSLINE_EMAIL="$STATUSLINE_EMAIL" \
  node -e '
    const fs = require("fs");
    const [src, dest] = process.argv.slice(1);
    const text = fs.readFileSync(src, "utf8")
      .split("__C420_HOME__").join(process.env.C420_HOME)
      .split("__PROJECTS_ROOT__").join(process.env.PROJECTS_ROOT_VALUE);
    const settings = JSON.parse(text);
    settings.env = { ...settings.env,
      STATUSLINE_NAME: process.env.STATUSLINE_NAME,
      STATUSLINE_EMAIL: process.env.STATUSLINE_EMAIL };
    fs.writeFileSync(dest, JSON.stringify(settings, null, 2) + "\n");
  ' "$(to_native_path "$SOURCE_DIR/settings.json")" "$(to_native_path "$TARGET_DIR/settings.json")"
  echo "  settings.json -> $TARGET_DIR/settings.json (paths filled in)"
fi

if [ -f "$SOURCE_DIR/statusline.sh" ]; then
  cp "$SOURCE_DIR/statusline.sh" "$TARGET_DIR/statusline.sh"
  chmod +x "$TARGET_DIR/statusline.sh"
  echo "  statusline.sh -> $TARGET_DIR/statusline.sh"
fi

if [ -f "$SOURCE_DIR/statusline.mjs" ]; then
  cp "$SOURCE_DIR/statusline.mjs" "$TARGET_DIR/statusline.mjs"
  echo "  statusline.mjs -> $TARGET_DIR/statusline.mjs"
fi

if [ -f "$SOURCE_DIR/CLAUDE.md" ]; then
  mkdir -p "$(dirname "$CLAUDE_MD_DEST")"
  backup_path "$CLAUDE_MD_DEST"
  cp "$SOURCE_DIR/CLAUDE.md" "$CLAUDE_MD_DEST"
  echo "  CLAUDE.md -> $CLAUDE_MD_DEST"
fi

# --- 4. optional persona pack ------------------------------------------------
echo ""
echo "This kit ships an optional, off-by-default persona pack (sci-fi chaotic"
echo "energy, Rick & Morty-style) under persona-pack/ + skills/chaos-protocol/."
printf "Install the persona pack too? [y/N]: "
read -r PERSONA_CHOICE
case "$PERSONA_CHOICE" in
  [yY]|[yY][eE][sS])
    if [ -d "$SOURCE_DIR/persona-pack" ]; then
      mkdir -p "$TARGET_DIR/persona-pack"
      cp -r "$SOURCE_DIR/persona-pack/." "$TARGET_DIR/persona-pack/"
      echo "  persona-pack/ -> $TARGET_DIR/persona-pack/"
    fi
    echo ""
    echo "  skills/chaos-protocol/ is already installed (it ships with skills/)"
    echo "  but stays OFF by default. To make it your default voice, add a line"
    echo "  under CLAUDE.md's \"Communication Protocol\" section yourself, e.g.:"
    echo ""
    echo "    chaos-protocol is always on."
    echo ""
    echo "  Or just say \"turn on chaos mode\" in any session to enable it for"
    echo "  that session only. This script will not edit your CLAUDE.md for you."
    ;;
  *)
    echo "  Skipping persona pack install. skills/chaos-protocol/ is still"
    echo "  present (it's part of skills/) but off by default, nothing to undo."
    ;;
esac

# --- 5. done ------------------------------------------------------------------
echo ""
echo "=== Setup complete! ==="
echo ""
if [ -d "$BACKUP_DIR" ]; then
  echo "Your previous files were backed up to: $BACKUP_DIR"
  echo ""
fi
echo "Next steps:"
echo "  1. Secrets (TWENTYFIRST_API_KEY, SUPABASE_ACCESS_TOKEN) are NOT stored by"
echo "     this script. Export them in your shell profile, or on Windows run:"
echo "       setx TWENTYFIRST_API_KEY \"your_key\""
echo "     Claude Code does not read .env files. See .env.example for the list."
echo "  2. Open $CLAUDE_MD_DEST and replace the example \"Project Locations\""
echo "     table with your own projects (or delete the table entirely)."
echo "  3. Read CUSTOMIZING.md for how skills/agents/rules/memory fit together."
echo "  4. Start a NEW Claude Code session. CLAUDE.md and settings.json load at"
echo "     session start, so an already-open session will not see them."
