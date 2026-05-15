# Security Policy

shipcue is local-first release readiness tooling. V1 reads fixture/local scan data and writes JSON, HTML, and Markdown. It must not publish releases, create tags, open PRs, merge code, or write to GitHub.

## Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | yes |

## Reporting a vulnerability

Please report security concerns through GitHub Security Advisories for `rogerchappel/shipcue` when available, or open a minimal public issue that avoids sensitive details and asks for a private contact path.

## Data handling

- Do not paste private repository data into public fixture files.
- Generated dashboards may reveal repository activity and release status; review before publishing.
- Future GitHub API support should use least-privilege tokens and should never persist tokens in scan output.
