#!/usr/bin/env node
/**
 * context-guard.mjs — PostToolUse hook
 *
 * Reads the session transcript to find the latest input_tokens count.
 * If context usage >= THRESHOLD, prints a warning to stderr and exits 2
 * (Claude Code "block" signal — shows the message, halts further tool calls).
 *
 * 60% → soft warning printed to stderr (non-blocking)
 * 70% → hard block: auto-snapshot + exit 2
 */

import { existsSync, statSync, openSync, readSync, closeSync, writeFileSync } from 'fs';

const THRESHOLD = 0.70;
const WARN_THRESHOLD = 0.60;
const CONTEXT_WINDOW = 200_000;
const TAIL_BYTES = 32_768;
const MEMORY_PATH = process.env.MEMORY_SNAPSHOT_PATH || './memory/last_session.md';

// ── Read all of stdin (top-level await, works in .mjs) ───────────────────────
const chunks = [];
for await (const chunk of process.stdin) {
  chunks.push(chunk);
}
const raw = chunks.join('');

if (!raw.trim()) process.exit(0);

let hookData;
try {
  hookData = JSON.parse(raw);
} catch {
  process.exit(0);
}

const transcriptPath = hookData?.transcript_path;
if (!transcriptPath) process.exit(0);

// ── Read last TAIL_BYTES of transcript ────────────────────────────────────────
function getLatestTokenCount(path) {
  if (!existsSync(path)) return 0;
  try {
    const { size } = statSync(path);
    if (size === 0) return 0;

    const start = Math.max(0, size - TAIL_BYTES);
    const readLen = Math.min(TAIL_BYTES, size);
    const buf = Buffer.alloc(readLen);
    const fd = openSync(path, 'r');
    readSync(fd, buf, 0, readLen, start);
    closeSync(fd);

    const text = buf.toString('utf8');
    const lines = text.split('\n').reverse();

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        const tokens = entry?.message?.usage?.input_tokens;
        if (typeof tokens === 'number' && tokens > 0) return tokens;
      } catch { /* skip */ }
    }
  } catch { /* non-fatal */ }
  return 0;
}

// ── Auto-snapshot to last_session.md ─────────────────────────────────────────
function writeSessionSnapshot(usedTokens, pct) {
  const now = new Date().toISOString().split('T')[0];
  const content = `---
name: last-session
description: Auto-snapshot by context-guard at ${pct}% context usage — session halted
metadata:
  node_type: memory
  type: project
  originSessionId: context-guard-auto
---

# Last Session Snapshot (Auto-Saved by Context Guard)

**Updated:** ${now}
**Context at save:** ${pct}% (${usedTokens.toLocaleString()} / 200,000 tokens)

> Context guard triggered at ${pct}%. Session was halted automatically.
> Check the conversation transcript for the exact last action.

## What to do FIRST next session

1. Read the last 10 messages of the previous session for exact stopping point
2. Check git status / file state for any in-progress work
3. Continue from where you left off

---
AUTO-SAVED: ${new Date().toISOString()}
`;
  try {
    writeFileSync(MEMORY_PATH, content, 'utf8');
  } catch { /* non-fatal */ }
}

// ── Main check ────────────────────────────────────────────────────────────────
const usedTokens = getLatestTokenCount(transcriptPath);
if (usedTokens === 0) process.exit(0);

const ratio = usedTokens / CONTEXT_WINDOW;
const pct = Math.round(ratio * 100);

if (ratio >= THRESHOLD) {
  writeSessionSnapshot(usedTokens, pct);
  process.stderr.write(
    `\n╔══════════════════════════════════════════════════════════╗\n` +
    `║  CONTEXT GUARD — ${pct}% USED (${usedTokens.toLocaleString()} / 200,000 tokens)\n` +
    `║                                                          ║\n` +
    `║  ⚡ Run /compact NOW to reset context window.            ║\n` +
    `║  📝 Auto-snapshot written to memory/last_session.md      ║\n` +
    `╚══════════════════════════════════════════════════════════╝\n\n`
  );
  process.exit(2);
}

if (ratio >= WARN_THRESHOLD) {
  process.stderr.write(
    `[context-guard] ⚠️  ${pct}% context used (${usedTokens.toLocaleString()} / 200,000 tokens). Consider /compact soon.\n`
  );
}

process.exit(0);
