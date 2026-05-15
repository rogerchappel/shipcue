import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ScanResult, ScoredRepo } from './types.js';

export async function loadScanResult(dataDir: string): Promise<ScanResult> {
  const raw = await readFile(path.join(dataDir, 'shipcue-scan.json'), 'utf8');
  return JSON.parse(raw) as ScanResult;
}

export function findRepo(scan: ScanResult, fullName: string): ScoredRepo {
  const repo = scan.repos.find((candidate) => candidate.fullName.toLowerCase() === fullName.toLowerCase());
  if (!repo) throw new Error(`Repository not found in scan data: ${fullName}`);
  return repo;
}
