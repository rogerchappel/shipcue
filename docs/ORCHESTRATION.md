# shipcue orchestration

shipcue is designed as a local-first maintainer operations loop:

1. `shipcue init` creates a reviewable config.
2. `shipcue scan --fixture` produces normalized JSON snapshots under `data/latest`.
3. `shipcue build` renders a static dashboard suitable for local review or GitHub Pages.
4. `shipcue brief owner/repo` writes a Markdown release brief.
5. `shipcue agent-prompt owner/repo` emits a focused release-prep prompt for a coding agent.

## Agent boundaries

- V1 never publishes releases, creates tags, opens PRs, merges code, or writes to GitHub.
- Output is advisory. A human or repo-specific release workflow remains the release authority.
- CI failures and release-blocker issues force a hold recommendation.
- Archived and forked repositories are excluded unless explicitly enabled.

## Recommended batch run

```bash
shipcue scan --fixture --config shipcue.config.json --out data/latest
shipcue build --data data/latest --out dist-site
shipcue brief rogerchappel/staledock --data data/latest --out briefs/staledock.md
```
