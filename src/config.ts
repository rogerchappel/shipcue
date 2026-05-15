import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { ShipcueConfig } from './types.js';

export const defaultConfig: ShipcueConfig = {
  owners: ['rogerchappel'],
  includeForks: false,
  includeArchived: false,
  excludeRepos: [],
  releasePolicy: {
    maxDaysSinceRelease: 30,
    minCommitsSinceRelease: 3,
    requirePassingCi: true
  }
};

export async function writeDefaultConfig(filePath = 'shipcue.config.json'): Promise<string> {
  const resolved = path.resolve(filePath);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, `${JSON.stringify(defaultConfig, null, 2)}\n`);
  return resolved;
}

export async function loadConfig(filePath = 'shipcue.config.json'): Promise<ShipcueConfig> {
  const raw = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as Partial<ShipcueConfig>;
  return validateConfig({ ...defaultConfig, ...parsed, releasePolicy: { ...defaultConfig.releasePolicy, ...parsed.releasePolicy } });
}

export function validateConfig(config: ShipcueConfig): ShipcueConfig {
  const errors: string[] = [];
  if (!Array.isArray(config.owners) || config.owners.some((owner) => typeof owner !== 'string' || owner.trim() === '')) {
    errors.push('owners must be a non-empty string array');
  }
  if (config.repos !== undefined && (!Array.isArray(config.repos) || config.repos.some((repo) => !/^[-\w]+\/[-._\w]+$/.test(repo)))) {
    errors.push('repos must be owner/name strings when provided');
  }
  config.owners = config.owners.map((owner) => owner.trim()).filter(Boolean);
  config.excludeRepos = config.excludeRepos.map((repo) => repo.trim()).filter(Boolean);
  if (config.repos) config.repos = config.repos.map((repo) => repo.trim()).filter(Boolean);
  if (!Array.isArray(config.excludeRepos)) errors.push('excludeRepos must be an array');
  if (typeof config.includeForks !== 'boolean') errors.push('includeForks must be boolean');
  if (typeof config.includeArchived !== 'boolean') errors.push('includeArchived must be boolean');
  if (!Number.isFinite(config.releasePolicy.maxDaysSinceRelease) || config.releasePolicy.maxDaysSinceRelease < 1) {
    errors.push('releasePolicy.maxDaysSinceRelease must be a positive number');
  }
  if (!Number.isFinite(config.releasePolicy.minCommitsSinceRelease) || config.releasePolicy.minCommitsSinceRelease < 1) {
    errors.push('releasePolicy.minCommitsSinceRelease must be a positive number');
  }
  if (typeof config.releasePolicy.requirePassingCi !== 'boolean') errors.push('releasePolicy.requirePassingCi must be boolean');
  if (errors.length > 0) throw new Error(`Invalid shipcue config: ${errors.join('; ')}`);
  return config;
}
