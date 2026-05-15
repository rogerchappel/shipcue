import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, validateConfig } from '../dist/index.js';

test('normalizes config arrays', () => {
  const config = validateConfig({ ...structuredClone(defaultConfig), owners: [' rogerchappel '], excludeRepos: [' demo '] });
  assert.deepEqual(config.owners, ['rogerchappel']);
  assert.deepEqual(config.excludeRepos, ['demo']);
});

test('rejects malformed repo selectors', () => {
  assert.throws(() => validateConfig({ ...structuredClone(defaultConfig), repos: ['not-a-full-name'] }), /repos must/);
});
