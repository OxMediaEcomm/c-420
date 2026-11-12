#!/usr/bin/env node
/**
 * link-accounts.mjs: run several Claude Code accounts off ONE C-420 install.
 *
 * Claude Code keeps each account in its own config dir (CLAUDE_CONFIG_DIR).
 * Copying skills between them drifts fast. This links every extra account
 * back to the main install so there is one brain:
 *
 *   <account>/skills/<name>  -> link to $C420_HOME/skills/<name>  (per skill, so
 *                               the harness-managed skills/synced/ stays per-account)
 *   <account>/agents         -> link to $C420_HOME/agents
 *   --share-sessions         <account>/sessions -> $C420_HOME/shared/sessions, so
 *                               ListAgents / SendMessage reach sessions on every account
 *   --share-memory           sets "autoMemoryDirectory" in each account's settings.json
 *                               (and the main one) to $C420_HOME/memory, so every
 *                               session, in any folder, on any account, recalls the same memory
 *
 * Real folders that would be replaced are moved to <account>/replaced-<date>/,
 * never deleted. Idempotent: safe to run from a SessionStart hook.
 *
 * Config:
 *   C420_HOME      main install (default ~/.claude)
 *   C420_ACCOUNTS  extra account config dirs, separated by ";" (Windows) or ":" (macOS/Linux)
 *
 * Usage: node link-accounts.mjs [--dry] [--quiet] [--share-sessions] [--share-memory]
 */

import { existsSync, lstatSync, readdirSync, readlinkSync, mkdirSync, renameSync, symlinkSync, rmSync, readFileSync, writeFileSync, cpSync } from 'fs';
import { join, resolve, normalize, delimiter } from 'path';
import { homedir } from 'os';

const ARGS = new Set(process.argv.slice(2));
const DRY = ARGS.has('--dry');
const QUIET = ARGS.has('--quiet');
const SHARE_SESSIONS = ARGS.has('--share-sessions');
const SHARE_MEMORY = ARGS.has('--share-memory');

const HOME = resolve(process.env.C420_HOME || join(homedir(), '.claude'));
const ACCOUNTS = (process.env.C420_ACCOUNTS || '').split(delimiter).map((s) => s.trim()).filter(Boolean).map((p) => resolve(p));
const LINK_TYPE = process.platform === 'win32' ? 'junction' : 'dir';
const ACCOUNT_ONLY = new Set(['synced']);
const DAY = new Date().toISOString().slice(0, 10);

const changes = [];
const log = (msg) => changes.push(msg);
const same = (a, b) => normalize(resolve(a)).toLowerCase() === normalize(resolve(b)).toLowerCase();
const isLink = (p) => { try { return lstatSync(p).isSymbolicLink(); } catch { return false; } };
const linkTarget = (p) => { try { return readlinkSync(p); } catch { return null; } };

function backup(account, path, label) {
  const dir = join(account, `replaced-${DAY}`);
  const dest = join(dir, label.replace(/[\\/]/g, '__'));
  if (!DRY) { mkdirSync(dir, { recursive: true }); renameSync(path, dest); }
  log(`${account}: backed up real ${label} -> ${dest}`);
}

/** Ensure `path` links to `target`. `merge` copies existing contents into target first. */
function ensureLink(account, path, target, label, { merge = false } = {}) {
  if (isLink(path)) {
    const current = linkTarget(path);
    if (current && same(current, target)) return;
    if (!DRY) rmSync(path, { force: true });
    log(`${account}: relinked ${label}`);
  } else if (existsSync(path)) {
    if (merge && !DRY) { mkdirSync(target, { recursive: true }); cpSync(path, target, { recursive: true, force: false, errorOnExist: false }); }
    backup(account, path, label);
  } else {
    log(`${account}: linked ${label}`);
  }
  if (!DRY) { mkdirSync(target, { recursive: true }); symlinkSync(target, path, LINK_TYPE); }
}

function setMemoryDir(configDir, memoryDir) {
  const file = join(configDir, 'settings.json');
  let settings = {};
  if (existsSync(file)) {
    try { settings = JSON.parse(readFileSync(file, 'utf8')); } catch { log(`${configDir}: settings.json is not valid JSON, skipped`); return; }
  }
  const wanted = memoryDir.replace(/\\/g, '/');
  if (settings.autoMemoryDirectory === wanted) return;
  if (!DRY) writeFileSync(file, JSON.stringify({ ...settings, autoMemoryDirectory: wanted }, null, 2) + '\n');
  log(`${configDir}: autoMemoryDirectory -> ${wanted}`);
}

function vaultSkills() {
  const dir = join(HOME, 'skills');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, 'SKILL.md')))
    .map((d) => d.name);
}

function syncAccount(account, skills) {
  if (same(account, HOME)) return;
  if (!existsSync(account)) { log(`${account}: not found, skipped`); return; }
  const skillsDir = join(account, 'skills');
  if (!DRY) mkdirSync(skillsDir, { recursive: true });

  for (const name of skills) ensureLink(account, join(skillsDir, name), join(HOME, 'skills', name), `skills/${name}`);

  const wanted = new Set(skills);
  for (const entry of existsSync(skillsDir) ? readdirSync(skillsDir) : []) {
    if (wanted.has(entry) || ACCOUNT_ONLY.has(entry)) continue;
    const p = join(skillsDir, entry);
    if (isLink(p)) { if (!DRY) rmSync(p, { force: true }); log(`${account}: removed dangling link skills/${entry}`); }
    else log(`${account}: NOTE account-only skill skills/${entry} (not in main install, left alone)`);
  }

  ensureLink(account, join(account, 'agents'), join(HOME, 'agents'), 'agents');
  if (SHARE_SESSIONS) ensureLink(account, join(account, 'sessions'), join(HOME, 'shared', 'sessions'), 'sessions', { merge: true });
  if (SHARE_MEMORY) setMemoryDir(account, join(HOME, 'memory'));
}

if (!ACCOUNTS.length && !QUIET) {
  process.stdout.write('[link-accounts] C420_ACCOUNTS is empty: nothing to link. See CUSTOMIZING.md, "Multiple accounts".\n');
}

const skills = vaultSkills();
if (SHARE_SESSIONS && ACCOUNTS.length) ensureLink(HOME, join(HOME, 'sessions'), join(HOME, 'shared', 'sessions'), 'sessions', { merge: true });
if (SHARE_MEMORY) setMemoryDir(HOME, join(HOME, 'memory'));
for (const account of ACCOUNTS) {
  try { syncAccount(account, skills); } catch (err) { process.stderr.write(`[link-accounts] ${account}: ${err.message}\n`); }
}

if (!QUIET || changes.length) {
  const head = `[link-accounts]${DRY ? ' (dry run)' : ''} ${skills.length} skills, ${ACCOUNTS.length} extra account(s), ${changes.length} change(s)`;
  const shown = changes.slice(0, 40);
  if (changes.length > 40) shown.push(`... +${changes.length - 40} more`);
  process.stdout.write([head, ...shown].join('\n') + '\n');
}
