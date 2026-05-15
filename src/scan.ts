import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadFixtureRepos, filterRepos } from './fixture.js';
import { scoreRepos } from './scoring.js';
import type { ScanResult, ShipcueConfig } from './types.js';

export type ScanOptions = {
  fixture?: boolean | string;
  outDir: string;
  now?: Date;
};

export async function scan(config: ShipcueConfig, options: ScanOptions): Promise<ScanResult> {
  if (!options.fixture) {
    throw new Error('GitHub API scanning is not implemented in V1 MVP yet. Use --fixture for local-first scan data.');
  }
  const fixtureFile = typeof options.fixture === 'string' ? options.fixture : undefined;
  const repos = filterRepos(await loadFixtureRepos(fixtureFile), config);
  const generatedAt = (options.now ?? new Date()).toISOString();
  const result: ScanResult = {
    generatedAt,
    source: 'fixture',
    config,
    repos: scoreRepos(repos, config.releasePolicy, options.now ?? new Date(generatedAt))
  };
  await writeScanResult(result, options.outDir);
  return result;
}

export async function writeScanResult(result: ScanResult, outDir: string): Promise<void> {
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'shipcue-scan.json'), `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(path.join(outDir, 'repos.json'), `${JSON.stringify(result.repos, null, 2)}\n`);
}
