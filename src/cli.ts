#!/usr/bin/env node
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { renderAgentPrompt, writeBrief } from './brief.js';
import { loadConfig, writeDefaultConfig } from './config.js';
import { loadScanResult, findRepo } from './data.js';
import { buildDashboard } from './render.js';
import { scan } from './scan.js';

const args = process.argv.slice(2);

async function main(): Promise<void> {
  const command = args[0] ?? 'help';
  const rest = args.slice(1);
  if (command === 'init') {
    const configPath = value(rest, '--config') ?? 'shipcue.config.json';
    const written = await writeDefaultConfig(configPath);
    console.log(`Created ${path.relative(process.cwd(), written)}`);
    return;
  }
  if (command === 'scan') {
    const config = await loadConfig(value(rest, '--config') ?? 'shipcue.config.json');
    const outDir = value(rest, '--out') ?? 'data/latest';
    const fixture = flag(rest, '--fixture') ? (value(rest, '--fixture') ?? true) : false;
    const result = await scan(config, { fixture, outDir, now: new Date(value(rest, '--now') ?? Date.now()) });
    console.log(JSON.stringify({ ok: true, repos: result.repos.length, out: outDir }, null, 2));
    return;
  }
  if (command === 'build') {
    const dataDir = value(rest, '--data') ?? 'data/latest';
    const outDir = value(rest, '--out') ?? 'dist-site';
    await buildDashboard(await loadScanResult(dataDir), outDir);
    console.log(JSON.stringify({ ok: true, out: outDir }, null, 2));
    return;
  }
  if (command === 'brief') {
    const repoName = rest.find((part) => !part.startsWith('--'));
    if (!repoName) throw new Error('brief requires owner/repo');
    const dataDir = value(rest, '--data') ?? 'data/latest';
    const scan = await loadScanResult(dataDir);
    const repo = findRepo(scan, repoName);
    const outFile = value(rest, '--out');
    if (outFile) {
      await writeBrief(repo, outFile);
      console.log(JSON.stringify({ ok: true, out: outFile }, null, 2));
    } else {
      console.log((await import('./brief.js')).renderBrief(repo));
    }
    return;
  }
  if (command === 'agent-prompt') {
    const repoName = rest.find((part) => !part.startsWith('--'));
    if (!repoName) throw new Error('agent-prompt requires owner/repo');
    const scan = await loadScanResult(value(rest, '--data') ?? 'data/latest');
    console.log(renderAgentPrompt(findRepo(scan, repoName)));
    return;
  }
  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(helpText());
    return;
  }
  throw new Error(`Unknown command: ${command}\n\n${helpText()}`);
}

function flag(parts: string[], name: string): boolean {
  return parts.includes(name);
}

function value(parts: string[], name: string): string | undefined {
  const index = parts.indexOf(name);
  if (index === -1) return undefined;
  const next = parts[index + 1];
  return next && !next.startsWith('--') ? next : undefined;
}

function helpText(): string {
  return `shipcue — local-first release readiness radar

Commands:
  shipcue init [--config shipcue.config.json]
  shipcue scan --fixture [fixtures/repos.json] [--config shipcue.config.json] [--out data/latest]
  shipcue build [--data data/latest] [--out dist-site]
  shipcue brief owner/repo [--data data/latest] [--out briefs/repo.md]
  shipcue agent-prompt owner/repo [--data data/latest]

V1 safety: shipcue reads local/fixture data, writes JSON/HTML/Markdown, and never publishes releases or writes to GitHub.`;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
