import type { ScanResult } from './types.js';

export function renderQueueMarkdown(scan: ScanResult): string {
  const lines = [
    '# shipcue release queue',
    '',
    `Generated: ${scan.generatedAt}`,
    '',
    '| Repo | Score | Action | CI | Commits |',
    '| --- | ---: | --- | --- | ---: |'
  ];
  for (const repo of scan.repos) {
    lines.push(`| ${repo.fullName} | ${repo.score} | ${repo.nextAction} | ${repo.ci.status} | ${repo.commitsSinceRelease.length} |`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}
