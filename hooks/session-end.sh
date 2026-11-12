#!/bin/bash
# Fires when Claude finishes a response (Stop hook).
# Appends a STALE marker to last_session.md so next session knows to verify/refresh it.
# (Previously also wrote a flat session-log.txt: removed; was append-forever noise with no consumer.)

LAST_SESSION="${MEMORY_SNAPSHOT_PATH:-$HOME/.claude/memory/last_session.md}"

if [ -f "$LAST_SESSION" ]; then
  if ! grep -q "SESSION ENDED" "$LAST_SESSION"; then
    {
      echo ""
      echo "---"
      echo "SESSION ENDED: $(date -u +"%Y-%m-%dT%H:%M:%SZ"), Claude should update this at next session start if stale."
    } >> "$LAST_SESSION"
  fi
fi
