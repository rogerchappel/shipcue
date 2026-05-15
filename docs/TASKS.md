# shipcue task plan

## V1 complete

- [x] Scaffold a TypeScript CLI package with StackForge.
- [x] Copy/adapt the idea PRD into `docs/PRD.md`.
- [x] Define release-readiness domain types for repo snapshots, policies, and scored results.
- [x] Implement config loading, validation, and `shipcue init`.
- [x] Implement fixture-backed `shipcue scan --fixture` that writes auditable JSON.
- [x] Implement release readiness scoring and next-action classification.
- [x] Implement static dashboard generation with repo cards and raw JSON output.
- [x] Implement Markdown release briefs and agent handoff prompts.
- [x] Add fixtures for no release, fresh release, stale release, CI-blocked, archived, and forked repos.
- [x] Add unit and smoke tests for scoring, filtering, dashboard, brief, and CLI flows.
- [x] Document the safety model: no publishing, tagging, merging, or GitHub writes in V1.

## Follow-ups

- [ ] Add official GitHub REST/GraphQL scanner behind an explicit token-based command.
- [ ] Add repository include/exclude glob support.
- [ ] Persist raw GitHub API payloads beside normalized snapshots.
- [ ] Add dashboard search/sort controls without requiring a bundler.
- [ ] Add optional GitHub Pages workflow after the static output stabilizes.
