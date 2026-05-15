import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RepoSnapshot, ShipcueConfig } from './types.js';

export function fixturePath(name = 'repos.json'): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', name);
}

export async function loadFixtureRepos(filePath = fixturePath()): Promise<RepoSnapshot[]> {
  const raw = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as { repos?: RepoSnapshot[] } | RepoSnapshot[];
  return Array.isArray(parsed) ? parsed : parsed.repos ?? [];
}

export function filterRepos(repos: RepoSnapshot[], config: ShipcueConfig): RepoSnapshot[] {
  const owners = new Set(config.owners.map((owner) => owner.toLowerCase()));
  const explicit = new Set((config.repos ?? []).map((repo) => repo.toLowerCase()));
  const excluded = new Set(config.excludeRepos.map((repo) => repo.toLowerCase()));
  return repos.filter((repo) => {
    if (explicit.size > 0 && !explicit.has(repo.fullName.toLowerCase())) return false;
    if (explicit.size === 0 && !owners.has(repo.owner.toLowerCase())) return false;
    if (excluded.has(repo.fullName.toLowerCase()) || excluded.has(repo.name.toLowerCase())) return false;
    if (!config.includeArchived && repo.archived) return false;
    if (!config.includeForks && repo.fork) return false;
    return true;
  });
}
