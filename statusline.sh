#!/usr/bin/env bash
stdin_data=$(cat)

result=$(printf '%s' "$stdin_data" | PYTHONUTF8=1 PYTHONIOENCODING=utf-8 python3 -c "
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

RESET        = '\033[0m'
BOLD         = '\033[1m'
PORTAL       = '\033[38;2;0;255;65m'    # portal gun neon green
TOXIC        = '\033[38;2;135;255;0m'   # toxic lime
SAGE         = '\033[38;2;106;153;85m'  # sage / muted green
FOREST       = '\033[38;2;34;85;34m'   # dark forest green
DIM_GREEN    = '\033[38;2;60;100;60m'  # dim portal green for empty bar blocks

SEP = '  \033[38;2;0;200;50m|\033[0m  '

def bar(pct, width=8):
    filled = max(0, min(width, round(pct / 100 * width)))
    empty  = width - filled
    color  = '\033[38;2;220;50;50m' if pct >= 90 else ('\033[38;2;200;180;0m' if pct >= 69 else '\033[38;2;0;255;65m')
    return color + '█' * filled + '\033[38;2;34;70;34m' + '░' * empty + '\033[0m'

try:
    d = json.load(sys.stdin)

    ctx  = d.get('context_window', {}).get('used_percentage')
    sess = d.get('rate_limits', {}).get('five_hour', {}).get('used_percentage')
    week = d.get('rate_limits', {}).get('seven_day', {}).get('used_percentage')

    import os
    NAME  = os.environ.get('STATUSLINE_NAME', 'Your Name')
    EMAIL = os.environ.get('STATUSLINE_EMAIL', 'you@your-domain.com')

    parts = [
        '\033[1m' + PORTAL + NAME  + '\033[0m',
        SAGE               + EMAIL + '\033[0m',
    ]

    if ctx  is not None: parts.append(TOXIC + 'Ctx ' + '\033[0m' + bar(round(ctx))  + ' ' + SAGE + str(round(ctx))  + '%' + '\033[0m')
    if sess is not None: parts.append(TOXIC + '5h '  + '\033[0m' + bar(round(sess)) + ' ' + SAGE + str(round(sess)) + '%' + '\033[0m')
    if week is not None: parts.append(TOXIC + '7d '  + '\033[0m' + bar(round(week)) + ' ' + SAGE + str(round(week)) + '%' + '\033[0m')

    print(SEP.join(parts))

except Exception:
    print(NAME + '  |  ' + EMAIL)
" 2>/dev/null)

printf '%s' "${result:-${STATUSLINE_NAME:-Your Name}  |  ${STATUSLINE_EMAIL:-you@your-domain.com}}"
