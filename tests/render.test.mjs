import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, loadFixtureRepos, renderBrief, renderDashboard, scoreRepos } from '../dist/index.js';

const scan = {
  generatedAt: '2026-05-15T00:00:00Z',
  source: 'fixture',
  config: defaultConfig,
  repos: scoreRepos(await loadFixtureRepos('fixtures/repos.json'), defaultConfig.releasePolicy, new Date('2026-05-15T00:00:00Z')).filter((repo) => !repo.archived && !repo.fork)
};

test('dashboard contains expected cards', () => {
  const html = renderDashboard(scan);
  assert.match(html, /shipcue/);
  assert.match(html, /rogerchappel\/staledock/);
  assert.match(html, /release-minor/);
});

test('brief includes safety checklist and agent prompt', () => {
  const repo = scan.repos.find((candidate) => candidate.fullName === 'rogerchappel/staledock');
  const brief = renderBrief(repo);
  assert.match(brief, /Safety checklist/);
  assert.match(brief, /Agent handoff prompt/);
  assert.match(brief, /Do not publish/);
});
