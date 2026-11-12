---
name: session-memory-snapshot
description: >
  Always-on skill. Auto-saves session progress to project memory at context thresholds
  (50%, 69%, 75%, 80%, 90%, 95%). Caveman-compressed. Overwrites same file each time.
  Never loses where the user left off between conversations.
  Triggers: context budget warnings, or user says "save memory" / "snapshot" / "where were we".
---

## Purpose

Never lose session context again. At each threshold, write a compressed snapshot of:
- What project we're in (exact path)
- What was done this session (bullet list, caveman style)
- What is NOT done yet / what's next
- Any decisions made or patterns discovered
- File paths that were modified or created

## Trigger Points

Monitor context usage. When system shows context budget warnings, or at these thresholds:

| Threshold | Action |
|-----------|--------|
| 50% | CREATE snapshot file. First write. |
| 69% | OVERWRITE snapshot with updated state |
| 75% | OVERWRITE |
| 80% | OVERWRITE |
| 90% | OVERWRITE |
| 95% | OVERWRITE + warn user context almost full |

## Snapshot File Location

Always write to:
`${CLAUDE_MEMORY_STORE_PATH}/memory/session_snapshot.md` (configure your own memory store path)

And update `MEMORY.md` index if this is the first write.

## Snapshot Format

```markdown
---
name: session snapshot
description: Auto-saved session state, what was done, what's next
type: project
---

## Project
[exact path] | [tech stack, 1 line]

## Done This Session
- [caveman bullet, what changed, file path]
- [caveman bullet]

## NOT Done / Next
- [what user was in the middle of]
- [next logical step]

## Key Decisions
- [any arch/design decision made]

## Modified Files
- `path/to/file.js`: [what changed]
```

## Rules

- Caveman style: no filler, fragments OK, technical terms exact
- Always include exact file paths
- "Next" section is MOST important, this is what gets lost between sessions
- Overwrite same file every time (not append, not new file)
- Never skip a threshold, context creep is the enemy
- If context hits 95%, also say: "YO context almost dead. /compact or new session now."

## Auto-Trigger From CLAUDE.md

This skill is always-on. No slash command needed. Fires based on context signals.
When system-reminder shows context budget shrinking, check threshold and write snapshot.
