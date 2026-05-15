# PRD: shipcue

Status: in-progress
Decision: build now

## Scorecard

Total: 84/100
Band: build now
Last scored: 2026-05-15
Scored by: OpenClaw

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 18/20 | Maintainers with many repos lose track of what is releasable, stale, unreleased, or quietly accumulating commits. |
| Demand signal | 15/20 | `steipete/ReleaseDeck` shows fresh adjacent interest in maintainer release freshness dashboards; Roger's OSS garden already has many small tools that need release discipline. |
| V1 buildability | 18/20 | GitHub releases/tags/commits/issues can be queried with official APIs and rendered as static JSON/HTML plus a CLI report. |
| Differentiation | 13/15 | Goes beyond a passive freshness dashboard into AI-native release triage, suggested next actions, and repo-level release notes/checklists. |
| Agentic workflow leverage | 14/15 | Perfect handoff target for coding agents: identify release blockers, draft changelogs, open review PRs, and produce daily/weekly maintainer briefs. |
| Distribution potential | 6/10 | Useful to any solo maintainer/org with many repos; initial audience is AI-assisted OSS maintainers managing repo gardens. |

## Pitch

An AI-native release readiness radar that scans GitHub owners/orgs, ranks which repos need a release, and emits actionable release briefs instead of only showing freshness metrics.

## Why It Matters

Static release dashboards answer "what is stale?" but maintainers also need "what should I do next, and why?" `shipcue` turns release freshness into an operations loop: detect unreleased work, classify release risk, draft a checklist, and hand a coding agent a precise release-prep prompt.

## Qualification

### Pub Test

"A release readiness radar for maintainers with too many repos: it finds unreleased work and tells you the safest next release action."

This lands because multi-repo OSS maintenance is becoming agent-assisted and high-volume. People do not just need another dashboard; they need a prioritized queue of release decisions.

### Competitors / Adjacent Tools

- `steipete/ReleaseDeck` — static dashboard for maintainer release freshness: latest version, latest release date, commits since release, activity, stars, language, and quick search. GitHub API signal captured on 2026-05-15: 4 stars / 0 forks, created 2026-05-14, TypeScript, MIT, homepage `https://releasedeck.dev`.
- GitHub Releases / repository insights — source of truth but one repo at a time, not a cross-repo release operations queue.
- Renovate/Dependabot dashboards — dependency-focused, not maintainer release readiness or changelog/action planning.
- Release Please / semantic-release — automate release mechanics for configured repos, but do not give a cross-owner readiness radar for many heterogeneous projects.

### Star / Demand Signal

- Adjacent repo: `https://github.com/steipete/ReleaseDeck` — new public TypeScript project focused on release freshness dashboards.
- Roger's OSS garden has dozens of small tools where release readiness, stale tags, post-merge unreleased commits, and branch protection create ongoing operational drag.
- AI coding agents make it easier to create many repos; the bottleneck shifts to maintaining a trustworthy release cadence.

### Real Problem

For a maintainer with 20-100 repos, the hard part is not seeing that a repo has commits since the last release. It is deciding whether those commits justify a patch/minor release, whether CI/docs/changelog are ready, and what exact agent prompt should prepare a safe PR.

### V1 Buildability

V1 can use official GitHub REST/GraphQL APIs only:

- scan configured owners/orgs and selected repos
- fetch latest release/tag, commits since release, default branch status, recent PRs, open issues, CI workflow presence, package metadata, and repo activity
- compute a release readiness score and queue
- render static HTML + JSON
- emit Markdown release briefs and agent prompts per repo

## V1 Scope

- Config file with owners/orgs, repo include/exclude filters, archived/fork settings, and release policy defaults.
- CLI command to scan GitHub and write `data/latest/*.json`.
- Static dashboard with sortable repo cards:
  - latest release/tag
  - days since release
  - commits since release
  - merged PRs since release
  - detected package/version files
  - CI/workflow signal
  - open blocker issues/PRs
  - release readiness score
  - recommended next action
- Markdown release brief per repo:
  - why it is queued
  - likely release type: patch/minor/hold/manual-review
  - notable commits/PRs since last release
  - safety checklist
  - suggested agent prompt for release-prep PR
- Raw JSON snapshots for auditability.
- Local-first output suitable for GitHub Pages.

## Out of Scope

- Publishing releases automatically.
- Creating tags or GitHub Releases automatically.
- Merging PRs or bypassing branch protection.
- Inferring private repository data.
- Replacing project-specific release tooling such as Release Please, Changesets, or semantic-release.
- Copying `ReleaseDeck` UI, naming, implementation, or assets.

## CLI/API Sketch

```bash
shipcue init
shipcue scan --config shipcue.config.json --out data/latest
shipcue build --data data/latest --out dist
shipcue brief rogerchappel/ossrank --data data/latest --out briefs/ossrank.md
shipcue agent-prompt rogerchappel/ossrank --data data/latest
```

Example config:

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

## Verification

- Fixture scan with repos covering:
  - no releases yet
  - release yesterday with no commits since
  - release 90 days ago with many commits since
  - commits since release but failing CI
  - archived/fork excluded
- Unit tests for release readiness scoring and next-action classification.
- Snapshot test for generated JSON schema.
- Static build smoke test: generated dashboard contains expected repo cards and brief links.
- CLI smoke tests for `scan --fixture`, `build`, `brief`, and invalid config handling.

## Agent Prompt

Build `shipcue` as a TypeScript CLI + static dashboard generator. Use official GitHub APIs only, preserve raw release/commit data in JSON, and never publish releases or write to GitHub in V1. Implement release readiness scoring, recommended next actions, Markdown release briefs, and agent handoff prompts. Include fixtures and tests for no-release, stale-release, fresh-release, CI-blocked, archived, and forked repositories.
