import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, loadFixtureRepos, scoreRepos } from '../dist/index.js';

const now = new Date('2026-05-15T00:00:00Z');

test('scores stale repos above fresh repos', async () => {
  const scored = scoreRepos(await loadFixtureRepos('fixtures/repos.json'), defaultConfig.releasePolicy, now);
  const stale = scored.find((repo) => repo.fullName === 'rogerchappel/staledock');
  const fresh = scored.find((repo) => repo.fullName === 'rogerchappel/freshdeck');
  assert.ok(stale.score > fresh.score);
  assert.equal(stale.nextAction, 'release-minor');
  assert.equal(fresh.nextAction, 'hold-fresh');
});

test('classifies no-release repos for initial release', async () => {
  const scored = scoreRepos(await loadFixtureRepos('fixtures/repos.json'), defaultConfig.releasePolicy, now);
  const repo = scored.find((candidate) => candidate.fullName === 'rogerchappel/firstflight');
  assert.equal(repo.nextAction, 'initial-release');
  assert.equal(repo.readinessBand, 'ready');
});

test('holds repos with failing ci and blockers', async () => {
  const scored = scoreRepos(await loadFixtureRepos('fixtures/repos.json'), defaultConfig.releasePolicy, now);
  const repo = scored.find((candidate) => candidate.fullName === 'rogerchappel/redci');
  assert.equal(repo.nextAction, 'hold-ci');
  assert.equal(repo.readinessBand, 'hold');
  assert.match(repo.reasons.join('\n'), /CI is failing/);
});
