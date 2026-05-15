# Scoring model

shipcue scores release readiness from 0-100 using transparent heuristics:

- no release/tag adds initial-release pressure
- stale releases add age pressure
- commits and merged PRs add unreleased-work pressure
- passing CI adds confidence
- failing CI or blockers force hold recommendations
- archived/forked repos are not queued by default

The score is not an automated release decision. It is a prioritization hint for maintainers and coding agents.
