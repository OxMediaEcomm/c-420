#!/usr/bin/env bash
# Thin wrapper so existing settings.json entries keep working. Logic lives in statusline.mjs.
exec node "$(dirname "${BASH_SOURCE[0]}")/statusline.mjs"
