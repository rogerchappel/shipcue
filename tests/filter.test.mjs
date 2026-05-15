import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, filterRepos, loadFixtureRepos } from '../dist/index.js';

test('excludes archived and forked repos by default', async () => {
  const repos = filterRepos(await loadFixtureRepos('fixtures/repos.json'), defaultConfig);
  assert.equal(repos.some((repo) => repo.archived), false);
  assert.equal(repos.some((repo) => repo.fork), false);
  assert.equal(repos.length, 4);
});

test('can include archived and forked repos explicitly', async () => {
  const repos = filterRepos(await loadFixtureRepos('fixtures/repos.json'), { ...defaultConfig, includeArchived: true, includeForks: true });
  assert.equal(repos.length, 6);
});
