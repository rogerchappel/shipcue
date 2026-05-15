import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, loadFixtureRepos, renderQueueMarkdown, scoreRepos } from '../dist/index.js';

test('renders a compact markdown release queue', async () => {
  const scan = { generatedAt: '2026-05-15T00:00:00Z', source: 'fixture', config: defaultConfig, repos: scoreRepos(await loadFixtureRepos('fixtures/repos.json'), defaultConfig.releasePolicy, new Date('2026-05-15T00:00:00Z')) };
  const markdown = renderQueueMarkdown(scan);
  assert.match(markdown, /shipcue release queue/);
  assert.match(markdown, /rogerchappel\/staledock/);
  assert.match(markdown, /release-minor/);
});
