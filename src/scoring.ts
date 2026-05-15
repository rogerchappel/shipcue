import type { ReleasePolicy, RepoSnapshot, ScoredRepo } from './types.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export function scoreRepo(repo: RepoSnapshot, policy: ReleasePolicy, now = new Date()): ScoredRepo {
  const latest = repo.latestRelease ?? repo.latestTag;
  const daysSinceRelease = latest ? Math.max(0, Math.floor((now.getTime() - Date.parse(latest.publishedAt)) / DAY_MS)) : null;
  const commits = repo.commitsSinceRelease.length;
  const prs = repo.mergedPrsSinceRelease.length;
  const blockers = repo.openBlockers.length;
  const reasons: string[] = [];

  let score = 0;
  if (!latest) {
    score += 35;
    reasons.push('No release or tag found; an initial release may be due.');
  } else if (daysSinceRelease !== null && daysSinceRelease > policy.maxDaysSinceRelease) {
    const stalePoints = Math.min(30, Math.floor((daysSinceRelease / policy.maxDaysSinceRelease) * 12));
    score += stalePoints;
    reasons.push(`${daysSinceRelease} days since the latest release.`);
  } else {
    reasons.push('Latest release is inside the freshness policy window.');
  }

  if (commits >= policy.minCommitsSinceRelease) {
    score += Math.min(35, 10 + commits * 3);
    reasons.push(`${commits} commits since release exceed the policy threshold.`);
  } else if (commits > 0) {
    score += commits * 3;
    reasons.push(`${commits} unreleased commits are present but below threshold.`);
  } else {
    reasons.push('No unreleased commits detected.');
  }

  if (prs > 0) {
    score += Math.min(12, prs * 4);
    reasons.push(`${prs} merged PRs are unreleased.`);
  }

  if (repo.ci.status === 'failing') {
    score -= 35;
    reasons.push('CI is failing; release should be held.');
  } else if (repo.ci.status === 'passing') {
    score += 8;
    reasons.push('CI is passing.');
  } else if (policy.requirePassingCi && repo.ci.status !== 'passing') {
    score -= 10;
    reasons.push('CI is missing or unknown while policy requires passing CI.');
  }

  if (blockers > 0) {
    score -= Math.min(30, blockers * 12);
    reasons.push(`${blockers} open blocker issues/PRs detected.`);
  }

  if (repo.archived || repo.fork) {
    score = 0;
    reasons.push('Repository is archived or a fork and should not be queued by default.');
  }

  score = Math.max(0, Math.min(100, score));
  const nextAction = classifyNextAction(repo, policy, score, daysSinceRelease);
  const readinessBand = nextAction.startsWith('hold') ? 'hold' : score >= 65 ? 'ready' : score >= 30 ? 'watch' : nextAction === 'manual-review' ? 'manual-review' : 'hold';
  const releaseType = nextAction === 'release-minor' ? 'minor' : nextAction === 'release-patch' || nextAction === 'initial-release' ? 'patch' : nextAction === 'manual-review' ? 'manual-review' : 'hold';
  return { ...repo, score, daysSinceRelease, readinessBand, nextAction, releaseType, reasons };
}

export function classifyNextAction(repo: RepoSnapshot, policy: ReleasePolicy, score: number, daysSinceRelease: number | null): ScoredRepo['nextAction'] {
  if (repo.archived || repo.fork) return 'manual-review';
  if (repo.ci.status === 'failing' || repo.openBlockers.length > 0) return 'hold-ci';
  if (!repo.latestRelease && !repo.latestTag) return 'initial-release';
  const enoughCommits = repo.commitsSinceRelease.length >= policy.minCommitsSinceRelease;
  const stale = daysSinceRelease !== null && daysSinceRelease > policy.maxDaysSinceRelease;
  if (!enoughCommits && !stale) return 'hold-fresh';
  const hasMinorSignal = [...repo.commitsSinceRelease.map((commit) => commit.message), ...repo.mergedPrsSinceRelease.map((pr) => pr.title)]
    .some((message) => /\b(feat|feature|minor|add|new)\b/i.test(message));
  if (score >= 30 && hasMinorSignal) return 'release-minor';
  if (score >= 30) return 'release-patch';
  return 'manual-review';
}

export function scoreRepos(repos: RepoSnapshot[], policy: ReleasePolicy, now = new Date()): ScoredRepo[] {
  return repos.map((repo) => scoreRepo(repo, policy, now)).sort((a, b) => b.score - a.score || a.fullName.localeCompare(b.fullName));
}
