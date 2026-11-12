---
name: gsc-indexing-audit
description: Sweep Google Search Console properties for indexing blockers and fix them. Use when the user says "check GSC", "indexing audit", "GSC sweep", "why isn't this page indexed", "indexing quota", or references continuing a prior GSC pass. Built from a full multi-domain sweep across a real multi-site portfolio.
---

# GSC Indexing Audit

Methodology for auditing Google Search Console properties across multiple domains and fixing real indexing blockers without wasting the daily quota chasing non-issues.

## Critical facts (learned the hard way)

1. **The "Request indexing" quota is account-wide, not per-property.** Hitting it on one domain blocks it on every other property in the same GSC account for the rest of that day. Confirmed empirically: hit "Quota Exceeded" on a brand-new domain the same day it was hit on an unrelated domain.
2. **A domain showing "0 indexed pages" is not automatically a content problem.** Check for a GSC property/host mismatch FIRST, before assuming anything is broken:
   - `vercel domains inspect <domain>`: does Vercel control DNS, or a third-party registrar (GoDaddy, Namecheap)?
   - `curl -sI https://<domain>/`: does the apex 308/307-redirect to `www` (or vice versa)?
   - If the only verified GSC property is the wrong host relative to where the redirect lands, that property will ALWAYS show near-zero indexed pages regardless of real content health. Fix: add + verify a new URL-prefix property for the correct host (often auto-verifiable instantly via an existing `google-site-verification` meta tag already live on the site, no deploy needed), then submit its sitemap.
3. GSC property types: **Domain property** (`sc-domain:`, DNS TXT, covers all hosts/protocols) vs **URL-prefix property** (meta tag or other method, covers exactly one host+protocol). If a domain is registered as a Domain property, you cannot navigate directly to a URL-prefix resource_id, use the property-selector dropdown (hamburger menu → property combobox) instead, or you'll get "Oops, you don't have access to this property."

## Workflow

1. **Enumerate properties.** Open GSC, list every property on the account.
2. **Per domain, check Page Indexing report.** For each "not indexed" reason code, classify by Source:
   - **Google systems** (benign, no action): "Discovered - currently not indexed", "Crawled - currently not indexed", "Alternate page with proper canonical tag", "Duplicate without user-selected canonical", these are normal crawl-backlog/dedup noise, not bugs.
   - **Website** (needs judgment, often still correct): "Blocked due to other 4xx issue" (check if it's a POST-only API endpoint Google tried to GET, correct behavior), "Not found (404)" (correct if the URL genuinely shouldn't exist), "Blocked by robots.txt" (often intentional, admin/cart paths), "Page with redirect" (THIS is the one that can reveal a real property/host mismatch, investigate per fact #2 above).
3. **Before touching anything**, do the apex-vs-www host check (fact #2) on every domain with suspiciously low indexed-page counts, cheaper than digging through content theories.
4. **Fix real blockers** you find (missing structured data fields, wrong GSC property, genuinely broken redirects), deploy, verify live with a Googlebot-UA curl check, THEN request indexing.
5. **Request indexing** via URL Inspection tool, one URL at a time, until "Quota Exceeded" appears. Stop immediately, do not retry, do not try another property, it's account-wide for the rest of the day.
6. **Log remaining backlog** (which URLs/properties still need indexing requests) to memory so the next session resumes exactly where quota cut off.

## What NOT to do

- Don't request indexing for URLs with benign Google-side reasons (Discovered/Crawled-not-indexed), that's normal crawl pacing, not a blocker, and burns quota for nothing.
- Don't "fix" a 404 on a URL that genuinely shouldn't exist, 404 is the correct response.
- Don't assume a junk referring-URL pattern (e.g. stray `/&`, `/$`) is a code bug without actually grepping every link-rendering component for the string, it's often an external bad backlink or share-tool artifact.
- Don't keep clicking "Request indexing" after one Quota Exceeded to see if a different property works, it won't, and each attempt is wasted motion.
