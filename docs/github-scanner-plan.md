# GitHub scanner plan

The MVP is fixture-backed. The first networked scanner should keep the same safety boundaries:

- use official GitHub REST/GraphQL APIs only
- require an explicit token in the environment or GitHub CLI auth
- preserve raw API payloads for auditability
- normalize into the existing `RepoSnapshot` shape
- never write to GitHub, create tags, publish releases, open PRs, or merge code

Suggested read-only signals:

- repository metadata, archived/fork flags, default branch, stars, language
- latest release and latest semver-like tag
- commits since release/tag
- merged PRs since release/tag
- open issues/PRs with blocker labels
- workflow files and latest default-branch check conclusion
- package/version files
