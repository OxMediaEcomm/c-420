---
name: security-scan
description: Scan your Claude Code configuration (.claude/ directory) for security vulnerabilities, misconfigurations, and injection risks using AgentShield. Checks CLAUDE.md, settings.json, MCP servers, hooks, and agent definitions.
---

# Security Scan Skill

Audit your Claude Code configuration for security issues using AgentShield.

## When to Activate

- Setting up a new Claude Code project
- After modifying `.claude/settings.json`, `CLAUDE.md`, or MCP configs
- Before committing configuration changes
- When onboarding to a new repository with existing Claude Code configs
- Periodic security hygiene checks

## What It Scans

| File | Checks |
|------|--------|
| `CLAUDE.md` | Hardcoded secrets, auto-run instructions, prompt injection patterns |
| `settings.json` | Overly permissive allow lists, missing deny lists, dangerous bypass flags |
| `mcp.json` | Risky MCP servers, hardcoded env secrets, npx supply chain risks |
| `hooks/` | Command injection via interpolation, data exfiltration, silent error suppression |
| `agents/*.md` | Unrestricted tool access, prompt injection surface, missing model specs |

## Prerequisites

```bash
# Check if installed
npx ecc-agentshield --version

# Install globally (recommended)
npm install -g ecc-agentshield

# Or run directly via npx (no install needed)
npx ecc-agentshield scan .
```

## Usage

### Basic Scan

```bash
# Scan current project
npx ecc-agentshield scan

# Scan a specific path
npx ecc-agentshield scan --path /path/to/.claude

# Scan with minimum severity filter
npx ecc-agentshield scan --min-severity medium
```

### Output Formats

```bash
npx ecc-agentshield scan                        # Terminal (default)
npx ecc-agentshield scan --format json          # CI/CD integration
npx ecc-agentshield scan --format markdown      # Documentation
npx ecc-agentshield scan --format html > report.html  # HTML report
```

### Auto-Fix

```bash
npx ecc-agentshield scan --fix
```

Applies safe fixes only: replaces hardcoded secrets with env var references, tightens wildcard permissions.

### Opus Deep Analysis

```bash
export ANTHROPIC_API_KEY=your-key
npx ecc-agentshield scan --opus --stream
```

Runs three-agent pipeline: Attacker (Red Team) → Defender (Blue Team) → Auditor (Final Verdict).

## Severity Levels

| Grade | Score | Meaning |
|-------|-------|---------|
| A | 90-100 | Secure configuration |
| B | 75-89 | Minor issues |
| C | 60-74 | Needs attention |
| D | 40-59 | Significant risks |
| F | 0-39 | Critical vulnerabilities |

## Critical Findings (fix immediately)

- Hardcoded API keys or tokens in config files
- `Bash(*)` in the allow list (unrestricted shell access)
- Command injection in hooks via `${file}` interpolation
- Shell-running MCP servers

## High Findings (fix before production)

- Auto-run instructions in CLAUDE.md (prompt injection vector)
- Missing deny lists in permissions
- Agents with unnecessary Bash access
