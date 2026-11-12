#!/usr/bin/env node
/**
 * context-guard.mjs: PostToolUse hook
 *
 * Measures real context usage from the session transcript and nudges Claude to
 * save a handoff and /compact before the window fills.
 *
 * Context size = input_tokens + cache_creation_input_tokens + cache_read_input_tokens.
 * (input_tokens alone is only the UNCACHED tail, often single digits, so a guard
 * that reads only that field never fires.)
 *
 * Window size: C420_CONTEXT_WINDOW env var (default 200000). Set it to 1000000
 * when running a 1M-context model.
 *
 * At WARN_THRESHOLD: one-line stderr note (visible in transcript mode).
 * At THRESHOLD: once per session, writes a NEW handoff file and exits 2 so
 * Claude sees the message. It never touches last_session.md: that file holds
 * the handoff Claude wrote by hand and must not be overwritten by a template.
 */

import { existsSync, statSync, openSync, readSync, closeSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';

const THRESHOLD = 0.70;
const WARN_THRESHOLD = 0.60;
const DEFAULT_WINDOW = 200_000;
const TAIL_BYTES = 65_536;

const CONTEXT_WINDOW = Number(process.env.C420_CONTEXT_WINDOW) || DEFAULT_WINDOW;
const MEMORY_DIR = process.env.MEMORY_SNAPSHOT_PATH
  ? dirname(process.env.MEMORY_SNAPSHOT_PATH)
  : join(homedir(), '.claude', 'memory');
const HANDOFF_DIR = process.env.C420_HANDOFF_DIR || join(MEMORY_DIR, 'handoffs');

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return chunks.join('');
}

function readTail(path) {
  const { size } = statSync(path);
  if (size === 0) return '';
  const readLen = Math.min(TAIL_BYTES, size);
  const buf = Buffer.alloc(readLen);
  const fd = openSync(path, 'r');
  try {
    readSync(fd, buf, 0, readLen, size - readLen);
  } finally {
    closeSync(fd);
  }
  return buf.toString('utf8');
}

function contextTokens(usage) {
  if (!usage || typeof usage !== 'object') return 0;
  return (usage.input_tokens || 0)
    + (usage.cache_creation_input_tokens || 0)
    + (usage.cache_read_input_tokens || 0);
}

/** Context size of the most recent assistant turn in the transcript. */
function getLatestTokenCount(path) {
  if (!existsSync(path)) return 0;
  try {
    const lines = readTail(path).split('\n').reverse();
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const tokens = contextTokens(JSON.parse(line)?.message?.usage);
        if (tokens > 0) return tokens;
      } catch { /* partial first line of the tail, skip */ }
    }
  } catch (err) {
    process.stderr.write(`[context-guard] could not read transcript: ${err.message}\n`);
  }
  return 0;
}

/** Writes a per-session handoff stub. Returns its path, or null if it already existed. */
function writeHandoffOnce(sessionId, usedTokens, pct) {
  const day = new Date().toISOString().split('T')[0];
  const shortId = String(sessionId || 'unknown').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 8) || 'unknown';
  const path = join(HANDOFF_DIR, `auto-${day}-${shortId}.md`);
  const content = `# Auto Handoff (context guard)

- Created: ${new Date().toISOString()}
- Session: ${sessionId || 'unknown'}
- Context at save: ${pct}% (${usedTokens.toLocaleString()} / ${CONTEXT_WINDOW.toLocaleString()} tokens)

This stub only marks that the session hit the context threshold.
The real handoff is whatever Claude wrote to last_session.md (or a named handoff
file) before compacting. Delete this file once the work is picked back up.
`;
  try {
    mkdirSync(HANDOFF_DIR, { recursive: true });
    writeFileSync(path, content, { encoding: 'utf8', flag: 'wx' });
    return path;
  } catch (err) {
    if (err.code === 'EEXIST') return null;
    process.stderr.write(`[context-guard] could not write handoff: ${err.message}\n`);
    return null;
  }
}

async function main() {
  const raw = await readStdin();
  if (!raw.trim()) return 0;

  let hookData;
  try {
    hookData = JSON.parse(raw);
  } catch {
    return 0;
  }

  const transcriptPath = hookData?.transcript_path;
  if (!transcriptPath) return 0;

  const usedTokens = getLatestTokenCount(transcriptPath);
  if (usedTokens === 0) return 0;

  const ratio = usedTokens / CONTEXT_WINDOW;
  const pct = Math.round(ratio * 100);
  const usage = `${usedTokens.toLocaleString()} / ${CONTEXT_WINDOW.toLocaleString()} tokens`;

  if (ratio >= THRESHOLD) {
    const handoff = writeHandoffOnce(hookData.session_id, usedTokens, pct);
    if (!handoff) return 0; // already alerted this session
    process.stderr.write(
      `[context-guard] Context at ${pct}% (${usage}).\n` +
      `Update last_session.md with exactly where you stopped, then tell the user to run /compact.\n` +
      `Marker written: ${handoff}\n`
    );
    return 2;
  }

  if (ratio >= WARN_THRESHOLD) {
    process.stderr.write(`[context-guard] ${pct}% context used (${usage}). Consider /compact soon.\n`);
  }
  return 0;
}

process.exit(await main());
