#!/usr/bin/env node
/**
 * statusline.mjs: C-420 status line.
 * Shows: name | email | model | context bar | 5h usage | 7d usage.
 * Node only (Claude Code already requires Node), no python/jq dependency.
 * Identity comes from STATUSLINE_NAME / STATUSLINE_EMAIL (settings.json env block).
 */

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const rgb = (r, g, b) => `\x1b[38;2;${r};${g};${b}m`;
const PORTAL = rgb(0, 255, 65);
const TOXIC = rgb(135, 255, 0);
const SAGE = rgb(106, 153, 85);
const EMPTY = rgb(34, 70, 34);
const SEP = `  ${rgb(0, 200, 50)}|${RESET}  `;

const MODEL_COLORS = [
  [/opus/i, rgb(167, 139, 250)],   // violet: design lead / deep reasoning
  [/sonnet/i, rgb(251, 191, 36)],  // amber: builder
  [/haiku/i, rgb(125, 211, 252)],  // sky: lightweight
];

const NAME = process.env.STATUSLINE_NAME || 'Your Name';
const EMAIL = process.env.STATUSLINE_EMAIL || 'you@your-domain.com';

function bar(pct, width = 8) {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)));
  const color = pct >= 90 ? rgb(220, 50, 50) : pct >= 69 ? rgb(200, 180, 0) : PORTAL;
  return color + '█'.repeat(filled) + EMPTY + '░'.repeat(width - filled) + RESET;
}

function metric(label, pct) {
  if (typeof pct !== 'number' || Number.isNaN(pct)) return null;
  const p = Math.round(pct);
  return `${TOXIC}${label}${RESET}${bar(p)} ${SAGE}${p}%${RESET}`;
}

function contextPct(d) {
  const cw = d.context_window || {};
  if (typeof cw.used_percentage === 'number') return cw.used_percentage;
  const u = cw.current_usage;
  const size = cw.context_window_size;
  if (!u || !size) return null;
  const used = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
  return (used / size) * 100;
}

function modelBadge(d) {
  const name = d.model?.display_name || d.model?.id;
  if (!name) return null;
  const color = MODEL_COLORS.find(([re]) => re.test(name))?.[1] || SAGE;
  return `${BOLD}${color}${name}${RESET}`;
}

let raw = '';
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', () => {
  try {
    const d = JSON.parse(raw || '{}');
    const parts = [
      `${BOLD}${PORTAL}${NAME}${RESET}`,
      `${SAGE}${EMAIL}${RESET}`,
      modelBadge(d),
      metric('Ctx ', contextPct(d)),
      metric('5h ', d.rate_limits?.five_hour?.used_percentage),
      metric('7d ', d.rate_limits?.seven_day?.used_percentage),
    ].filter(Boolean);
    process.stdout.write(parts.join(SEP));
  } catch {
    process.stdout.write(`${NAME}  |  ${EMAIL}`);
  }
});
