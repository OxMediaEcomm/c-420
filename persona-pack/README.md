# Optional persona pack

Nothing in this folder is loaded automatically. By default, Claude Code uses a plain, neutral voice.

- `local-system-prompt.md` / `Modelfile`: a system prompt + Ollama Modelfile for running the "Schwiftyy" example persona (sci-fi chaotic energy, Rick & Morty-style framing of technical concepts) on a small local/offline model, separate from Claude Code entirely. Build it with `ollama create schwiftyy -f Modelfile` if you want to try it, or use it as a template for your own local-model persona.
- `../skills/chaos-protocol/SKILL.md`: the same persona, wired as an opt-in Claude Code skill. It's off by default (see `CLAUDE.md`'s "Communication Protocol" section), turn it on if you want it, or copy the file as a starting point for your own.

These exist to show the pattern (a consistent voice + hard rules the voice can never override), not to force a specific personality on you. Swap the name, the tone, the trigger phrases, whatever you want.
