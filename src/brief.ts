import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ScoredRepo } from './types.js';

export async function writeBrief(repo: ScoredRepo, outFile: string): Promise<void> {
  await mkdir(path.dirname(path.resolve(outFile)), { recursive: true });
  await writeFile(outFile, renderBrief(repo));
}

export function renderBrief(repo: ScoredRepo): string {
  return `# Release brief: ${repo.fullName}

**Score:** ${repo.score}/100  
**Band:** ${repo.readinessBand}  
**Recommended action:** ${repo.nextAction}  
**Likely release type:** ${repo.releaseType}

## Why this repo is queued

${repo.reasons.map((reason) => `- ${reason}`).join('\n')}

## Release facts

- Latest release/tag: ${repo.latestRelease?.tagName ?? repo.latestTag?.tagName ?? 'none'}
- Days since release: ${repo.daysSinceRelease ?? 'n/a'}
- Commits since release: ${repo.commitsSinceRelease.length}
- Merged PRs since release: ${repo.mergedPrsSinceRelease.length}
- CI status: ${repo.ci.status}
- Open blockers: ${repo.openBlockers.length}
- Package files: ${repo.packageFiles.map((file) => `${file.path}${file.version ? ` (${file.version})` : ''}`).join(', ') || 'none detected'}

## Notable commits

${repo.commitsSinceRelease.slice(0, 10).map((commit) => `- ${commit.sha.slice(0, 7)} ${commit.message}`).join('\n') || '- None'}

## Merged PRs

${repo.mergedPrsSinceRelease.slice(0, 10).map((pr) => `- #${pr.number} ${pr.title}`).join('\n') || '- None'}

## Recommendation

${recommendationSentence(repo)}

## Safety checklist

- [ ] Confirm CI is green before tagging or publishing.
- [ ] Review unreleased commits and PRs for breaking changes.
- [ ] Update changelog/release notes in the target repo.
- [ ] Run the target repo's local validation command.
- [ ] Do not publish, tag, merge, or bypass branch protection from shipcue output alone.

## Agent handoff prompt

${renderAgentPrompt(repo)}
`;
}

export function renderAgentPrompt(repo: ScoredRepo): string {
  return `Prepare a safe release-readiness PR for ${repo.fullName}. Recommended action from shipcue is ${repo.nextAction} with score ${repo.score}/100. Inspect commits and PRs since ${repo.latestRelease?.tagName ?? repo.latestTag?.tagName ?? 'the beginning'}, update changelog/release notes, run local validation, and stop before publishing, tagging, or creating a GitHub Release. If CI is failing or blockers remain, produce a hold report instead of release changes.`;
}

export function recommendationSentence(repo: ScoredRepo): string {
  if (repo.nextAction === 'hold-ci') return 'Hold release prep until CI and release blockers are resolved.';
  if (repo.nextAction === 'hold-fresh') return 'Do not release yet; this repo is fresh and has little unreleased work.';
  if (repo.nextAction === 'initial-release') return 'Prepare an initial release candidate, then let the repo release workflow own publishing.';
  if (repo.nextAction === 'release-minor') return 'Prepare a minor release candidate because feature-like work is unreleased.';
  if (repo.nextAction === 'release-patch') return 'Prepare a patch release candidate after validating the unreleased changes.';
  return 'Use manual review before deciding release scope.';
}
