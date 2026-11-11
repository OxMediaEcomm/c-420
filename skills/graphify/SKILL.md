---
name: graphify-windows
description: any input (code, docs, papers, images) → knowledge graph → clustered communities → HTML + JSON + audit report
trigger: /graphify
---

# /graphify

Turn any folder of files into a navigable knowledge graph with community detection, an honest audit trail, and three outputs: interactive HTML, GraphRAG-ready JSON, and a plain-language GRAPH_REPORT.md.

## Usage

```
/graphify                                             # full pipeline on current directory
/graphify <path>                                      # full pipeline on specific path
/graphify <path> --mode deep                          # thorough extraction, richer INFERRED edges
/graphify <path> --update                             # incremental - re-extract only new/changed files
/graphify <path> --directed                           # build directed graph (preserves edge direction)
/graphify <path> --cluster-only                       # rerun clustering on existing graph
/graphify <path> --no-viz                             # skip visualization, just report + JSON
/graphify <path> --svg                                # also export graph.svg
/graphify <path> --graphml                            # export graph.graphml (Gephi, yEd)
/graphify <path> --neo4j                              # generate cypher.txt for Neo4j
/graphify <path> --wiki                               # build agent-crawlable wiki
/graphify <path> --obsidian                           # write Obsidian vault
/graphify <path> --watch                              # watch folder, auto-rebuild on code changes
/graphify add <url>                                   # fetch URL, save to ./raw, update graph
/graphify query "<question>"                          # BFS traversal - broad context
/graphify query "<question>" --dfs                    # DFS - trace a specific path
/graphify query "<question>" --budget 1500            # cap answer at N tokens
/graphify query "<question>" --min-confidence extracted|inferred  # filter by edge confidence
/graphify query save "<name>" "<question>"            # save query preset
/graphify query run <name>                            # run saved query preset
/graphify path "ConceptA" "ConceptB"                  # shortest path between two concepts
/graphify explain "ConceptName"                       # plain-language explanation of a node
/graphify merge <path1> <path2> [--out <dest>]        # merge two graph.json files
/graphify diff <old.json> <new.json>                  # diff two graph snapshots → DIFF_REPORT.md
/graphify dedup [--dry-run] [--threshold 0.85]        # detect and merge duplicate/synonym nodes
```

## What graphify is for

Three things it does that your AI assistant alone cannot:
1. **Persistent graph** — relationships stored in `graphify-out/graph.json`, survive across sessions
2. **Honest audit trail** — every edge tagged EXTRACTED, INFERRED, or AMBIGUOUS
3. **Cross-document surprise** — community detection finds connections between files you'd never think to ask about

Use it for:
- A codebase you're new to (understand architecture before touching anything)
- A reading list (papers + tweets + notes → one navigable graph)
- A research corpus (citation graph + concept graph in one)
- Your personal /raw folder (drop everything in, let it grow, query it)

## What You Must Do When Invoked

If no path was given, use `.` (current directory). Do not ask the user for a path.

### Step 1 - Ensure graphify is installed

```powershell
python -c "import graphify" 2>$null
if ($LASTEXITCODE -ne 0) { pip install graphifyy -q 2>&1 | Select-Object -Last 3 }
python -c "import sys; open('.graphify_python', 'w').write(sys.executable)"
```

### Step 2 - Detect files

```powershell
python -c "
import json
from graphify.detect import detect
from pathlib import Path
result = detect(Path('INPUT_PATH'))
print(json.dumps(result))
" > .graphify_detect.json
```

Present a clean summary:
```
Corpus: X files · ~Y words
  code:     N files (.py .ts .go ...)
  docs:     N files (.md .txt ...)
  papers:   N files (.pdf ...)
```

- If `total_files` is 0: stop with "No supported files found in [path]."
- If `total_words` > 2,000,000 OR `total_files` > 200: show warning, ask which subfolder to run on

### Step 3 - Extract entities and relationships

Run AST extraction (code files) and semantic extraction (docs/papers/images) in parallel.

Semantic extraction uses the Agent tool — dispatch ALL subagents in a single message for parallelism. Each subagent extracts nodes and edges from a chunk of files (20-25 files each).

Each edge gets tagged: EXTRACTED (explicit), INFERRED (reasonable), or AMBIGUOUS (uncertain).
confidence_score required on every edge: EXTRACTED=1.0, INFERRED=0.6-0.9, AMBIGUOUS=0.1-0.3.

### Step 4 - Build graph, cluster, analyze

```powershell
python -c "
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json
# ... build G, cluster, generate report, export to graphify-out/
"
```

### Step 5 - Label communities

Read `.graphify_analysis.json`. For each community, write a 2-5 word plain-language name.

### Step 6 - Generate HTML (always unless --no-viz)

```powershell
python -c "
from graphify.export import to_html
# to_html(G, communities, 'graphify-out/graph.html', community_labels=labels)
"
```

### Step 7 - Optional exports

- `--neo4j`: generate `graphify-out/cypher.txt`
- `--svg`: generate `graphify-out/graph.svg`
- `--graphml`: generate `graphify-out/graph.graphml`
- `--obsidian`: generate Obsidian vault in `graphify-out/obsidian/`

### Step 8 - Token reduction benchmark (if total_words > 5000)

```powershell
python -c "
from graphify.benchmark import run_benchmark, print_benchmark
# run and print benchmark
"
```

### Step 9 - Clean up and report

Tell the user:
```
Graph complete. Outputs in PATH/graphify-out/

  graph.html       - interactive graph, open in browser
  GRAPH_REPORT.md  - audit report
  graph.json       - raw graph data
```

Then paste from GRAPH_REPORT.md: God Nodes, Surprising Connections, Suggested Questions.

Pick the single most interesting suggested question and ask:
> "The most interesting question this graph can answer: **[question]**. Want me to trace it?"

---

## For /graphify query

Load `graphify-out/graph.json`, find matching nodes, run BFS (default) or DFS (`--dfs`) traversal, answer using only graph contents. Quote source_location when citing facts. Never hallucinate edges.

## For /graphify path

Find shortest path between two named concepts. Explain each hop in plain language.

## For /graphify explain

Give a 3-5 sentence explanation of a node — what it is, what connects to it, why those connections matter.

## For /graphify add

Fetch a URL, save to `./raw`, run `--update` pipeline. Supported: Twitter/X, arXiv, PDF, images, any webpage.

## Honesty Rules

- Never invent an edge. If unsure, use AMBIGUOUS.
- Always show token cost in the report.
- Never run HTML viz on a graph with more than 5,000 nodes without warning the user.

---

## Enhancement: Graph Merging (`/graphify merge`)

Merge two separate `graphify-out/graph.json` files into one combined graph.

**Steps:**
1. Load both `graph.json` files
2. Union nodes — if two nodes share the same label (case-insensitive), merge them into one node with `"sources": ["path1", "path2"]`
3. Union edges — duplicate edges (same source+target+relation) get their `weight` increased by 1 rather than duplicated
4. Re-run community detection on the merged graph
5. Save merged graph to `--out` path (default: `./graphify-merged/`)
6. Report: N nodes merged, M new edges added, K communities found

**Use case:** You graphified your codebase AND your docs repo separately. Merge them to find cross-corpus connections.

---

## Enhancement: Corpus Diff (`/graphify diff`)

Compare two graph snapshots to see what changed.

**Output (`graphify-out/DIFF_REPORT.md`):**
- **Nodes added** — present in new-graph, absent in old
- **Nodes removed** — present in old-graph, absent in new
- **Edges added / removed** — new or deleted connections
- **Community membership changes** — nodes that moved between communities
- **God node rank changes** — top-degree nodes that rose or fell

**Use case:** Run graphify after a sprint, diff against last week's snapshot. See which concepts emerged or died.

---

## Enhancement: Confidence Threshold Filtering

Add `--min-confidence extracted|inferred` to `query`, `path`, and `explain` commands.

- `--min-confidence extracted` → only traverse edges with confidence_score=1.0 (EXTRACTED)
- `--min-confidence inferred` → traverse EXTRACTED + INFERRED (confidence_score ≥ 0.6); skip AMBIGUOUS
- Default (no flag) → all edges including AMBIGUOUS

**When querying:** After loading the graph, filter the edge list before traversal based on the threshold. Report the filter applied at the top of the answer.

---

## Enhancement: Saved Query Presets

Save frequently-used queries so they auto-run on every graph rebuild.

**Commands:**
- `query save "<name>" "<question>"` → appends to `graphify-out/queries.json`
- `query run <name>` → runs a saved query against current graph
- `query list` → shows all saved presets

**Auto-run:** When generating `GRAPH_REPORT.md`, run all saved presets and append their output under `## Saved Query Results`.

**`queries.json` format:**
```json
[{"name": "auth-entrypoints", "question": "what are the authentication entry points?"}]
```

---

## Enhancement: Duplicate/Synonym Node Detection (`/graphify dedup`)

Find and optionally merge nodes that refer to the same concept under different names.

**Steps:**
1. Compute fuzzy similarity (SequenceMatcher or rapidfuzz) between all node labels
2. Flag pairs above `--threshold` (default 0.85) as dedup candidates
3. `--dry-run`: print candidate list only — no changes made
4. Without `--dry-run`: for each candidate pair, show both node's connections, prompt confirmation, then merge (redirect all edges to canonical node, delete duplicate)

**Output:** `graphify-out/DEDUP_REPORT.md` listing all merged pairs and redirected edges.

**Example candidates:** "Auth Module" / "auth_handler" / "Authentication" — one survives, others redirect.

---

## Enhancement: Breadcrumb Trail in HTML Visualization

When a user clicks a node in the HTML graph, show its path from the nearest god node.

**Behavior:** On node click, run BFS from the nearest top-10 degree node. Highlight the path in the graph and show a breadcrumb: `AuthModule → SessionManager → CookieHandler (you are here)`.

**Implementation note:** Add to the HTML template's node-click handler — BFS on the adjacency list already embedded in the HTML, highlight edges along the path, show breadcrumb text above the node info panel.
