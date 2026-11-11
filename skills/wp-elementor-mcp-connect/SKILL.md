---
name: wp-elementor-mcp-connect
description: Help a WordPress + Elementor client (typically on ChatGPT Desktop/Browser) connect their site's Elementor MCP server to their AI client, and hand them a downloadable self-serve kit (index.html + AI_GUIDE.md + README.md) to do it themselves next time. Use when the user mentions "Elementor MCP", "connect WordPress to ChatGPT/Claude", "Blittzed connection guide", or wants to set up/debug a WordPress MCP connector for a client.
---

# WordPress Elementor MCP Connect

Two jobs this skill does:

1. **Hand out the self-serve kit.** A client-facing package already exists at `${DESKTOP_DIR}\wp-elementor-mcp-connect\` (`index.html`, `AI_GUIDE.md`, `README.md`). Point the user there, or copy the folder to wherever they need to deliver it (zip it if sending externally). Don't regenerate these files from scratch unless the user asks for a change to the kit itself — edit the existing copies.
2. **Do the setup live, in this session**, when the user wants Claude Code itself to drive the connection (not hand it off to ChatGPT guidance). This is the part a browser tool can't do: generating the header safely and testing the endpoint from the terminal, without ever putting the raw password in chat history unnecessarily.

## Core safety rules (non-negotiable)

- Never echo the raw Application Password back in a chat message once it's been used to build the header. Build the header, use it, discard it from visible output.
- Never persist a site's Application Password or Authorization header to a file, memory, or git. These are per-site, revocable secrets — not reference material.
- One Application Password per site. Never suggest reusing one site's credentials for another.
- A live Basic-auth test is read-only by default. Never call any endpoint that creates, edits, or publishes content just to "test" the connection — listing pages (a GET) is the standard verification, nothing more.

## Workflow: live setup in this session

1. **Get the facts**: site URL, the Elementor MCP endpoint path (ask the user to check their site's Elementor MCP settings — don't assume `/wp-json/elementor/mcp/` is correct, it's a common default, not universal), WordPress username, and have the user generate (or already have) an Application Password in **Users &rarr; Profile &rarr; Application Passwords**.
2. **Get the Application Password via a method that doesn't log it in chat history if avoidable.** If the user pastes it in chat, that's their call, but don't ask them to paste it if there's a way to avoid it — e.g. have them run the curl test themselves with a value they typed directly into their own terminal.
3. **Build the header locally.** Strip spaces, base64-encode `username:password`. If you (Claude Code) are doing this, use Bash:
   ```bash
   printf '%s' "username:apppassword" | base64
   ```
   Prefix the result with `Basic ` for the header value.
4. **Test read-only access** with curl:
   ```bash
   curl -i -X GET "https://SITE/wp-json/elementor/mcp/PATH" \
     -H "Authorization: Basic <encoded>"
   ```
   Interpret the result:
   - 2xx with page data → confirmed read access. Say so, and explicitly note this doesn't confirm write access.
   - 401/403 → bad credentials or the WP user lacks MCP permission. Restarting any client won't fix this — regenerate the Application Password or check the user's role/capabilities.
   - 404 or wrong-shaped data → endpoint path is wrong, go re-check the site's Elementor MCP settings.
5. **Hand off the exact values** the user needs to paste into their AI client's connector UI: the full endpoint URL, and the `Authorization: Basic ...` header. Tell them to paste these directly into the client's fields, not into a chat message to that client's model.
6. **Point them at `AI_GUIDE.md`** (in the Desktop kit) if they want an AI-guided walkthrough for pasting these into ChatGPT specifically — don't duplicate that content here.

## Workflow: distributing the kit to a new client

1. Confirm the kit at `${DESKTOP_DIR}\wp-elementor-mcp-connect\` is current (check `index.html`'s endpoint-path default and `AI_GUIDE.md`'s client-version-specific wording if ChatGPT's connector UI has changed since last edit).
2. Zip the folder or copy it to a delivery location. Nothing inside the kit contains site-specific secrets by design — it's safe to hand to any client as-is.
3. Tell the client: open `index.html` locally first (double-click, any browser, no install), then upload `AI_GUIDE.md` to their ChatGPT and follow it.

## Troubleshooting matrix

| Symptom | Likely cause | Fix |
|---|---|---|
| Tool/connector not available in a chat | Not loaded for this session | Reopen client / new chat |
| 401 or 403 | Bad creds or missing MCP permission on that WP user | Regenerate Application Password, check role |
| 404 or malformed response | Wrong endpoint path | Re-check site's Elementor MCP settings for the real path |
| Client has no custom-header field | Client version doesn't support static headers for this connector type | Check client's current docs; may need a different connector type or a small auth-translating proxy |
| Client only supports OAuth/no-auth for this connector | Basic-auth-only WP endpoint can't be bridged by another Application Password | Needs a compatible client/connector type, or a proxy that re-authenticates |

## Related

- Client-facing kit: `${DESKTOP_DIR}\wp-elementor-mcp-connect\` (`index.html`, `AI_GUIDE.md`, `README.md`)
- Originating reference doc: `Downloads\Elementor Connection to WordPress.txt` (the Blittzed-authored guide this skill and kit were built from)
