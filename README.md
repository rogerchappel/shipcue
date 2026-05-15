# shipcue

shipcue is a local-first release readiness radar for maintainers with too many repos. It scans normalized repo snapshots, ranks which projects look releasable, and turns the queue into static dashboards, release briefs, and coding-agent handoff prompts.

Think of it as a small, opinionated release ops desk: calm, skeptical, and very reluctant to ship through red CI.

## Why

A freshness dashboard can tell you a repo is stale. shipcue tries to answer the next question: **what should I do next, and why?** It looks at releases, unreleased commits, merged PRs, CI signal, blocker issues, package files, and release policy defaults, then recommends one of:

- `initial-release`
- `release-patch`
- `release-minor`
- `hold-fresh`
- `hold-ci`
- `manual-review`

## Inspiration and attribution

shipcue is inspired by, and adjacent to, [`steipete/ReleaseDeck`](https://github.com/steipete/ReleaseDeck), a static maintainer release freshness dashboard. shipcue deliberately does **not** copy ReleaseDeck's UI, implementation, naming, or assets. The V1 focus is an agent-native readiness queue and local release briefs rather than a passive freshness view.

## Install from source

```bash
npm install
npm run build
node dist/cli.js --help
```

When published later, the intended command is:

```bash
npx shipcue --help
```

## Quick start

```bash
shipcue init
shipcue scan --fixture --config shipcue.config.json --out data/latest
shipcue build --data data/latest --out dist-site
shipcue brief rogerchappel/staledock --data data/latest --out briefs/staledock.md
shipcue agent-prompt rogerchappel/staledock --data data/latest
```

For source checkouts before global installation, replace `shipcue` with `node dist/cli.js`.

## Example config

```json
{
  "owners": ["rogerchappel"],
  "includeForks": false,
  "includeArchived": false,
  "excludeRepos": [],
  "releasePolicy": {
    "maxDaysSinceRelease": 30,
    "minCommitsSinceRelease": 3,
    "requirePassingCi": true
  }
}
```

## Safety model

V1 is intentionally boring and safe:

- no release publishing
- no tag creation
- no GitHub writes
- no PR creation
- no merging or branch-protection bypass
- no private repository inference
- fixture/local JSON scanning only in the MVP

shipcue output is advisory. Treat release briefs and agent prompts as review inputs, not release authority.

## Commands

### `init`

Writes `shipcue.config.json` with defaults.

### `scan --fixture`

Reads fixture repo snapshots, applies config filters, scores release readiness, and writes:

- `data/latest/shipcue-scan.json`
- `data/latest/repos.json`

### `build`

Reads scan data and writes a static dashboard:

- `dist-site/index.html`
- `dist-site/shipcue.json`

### `brief owner/repo`

Writes or prints a Markdown release brief with facts, reasons, a safety checklist, and an agent handoff prompt.

### `agent-prompt owner/repo`

Prints only the agent handoff prompt for a repo in the latest scan.

## Verification

```bash
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## Roadmap

- GitHub REST/GraphQL scanner using official APIs.
- Dashboard search/sort controls.
- Raw API payload preservation.
- GitHub Pages publishing recipe for generated static output.
- Repo-specific policy overrides.
