# Contributing

Thanks for helping improve shipcue.

## Local setup

```bash
npm install
npm test
npm run smoke
```

## Ground rules

- Keep V1 local-first and advisory.
- Do not add release publishing, tag creation, PR creation, merge automation, or GitHub writes without an explicit design review.
- Prefer small, fixture-backed changes with tests.
- Update `docs/ORCHESTRATION.md` and `docs/orchestration.json` when command behavior changes.

## Pull request checklist

- [ ] Tests cover the new behavior.
- [ ] `npm test`, `npm run check`, `npm run build`, and `npm run smoke` pass.
- [ ] Documentation reflects user-visible behavior.
- [ ] Safety boundaries are preserved.
