import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ScanResult, ScoredRepo } from './types.js';

export async function buildDashboard(scan: ScanResult, outDir: string): Promise<void> {
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'index.html'), renderDashboard(scan));
  await writeFile(path.join(outDir, 'shipcue.json'), `${JSON.stringify(scan, null, 2)}\n`);
}

export function renderDashboard(scan: ScanResult): string {
  const cards = scan.repos.map(renderRepoCard).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>shipcue release radar</title>
  <style>
    :root{color-scheme:light dark;font-family:Inter,ui-sans-serif,system-ui,sans-serif;--ok:#1a7f37;--warn:#9a6700;--bad:#cf222e;--ink:#24292f;--muted:#6e7781;--card:#f6f8fa;}
    body{margin:0;padding:2rem;background:Canvas;color:CanvasText}.wrap{max-width:1120px;margin:auto}header{display:flex;justify-content:space-between;gap:1rem;align-items:end;border-bottom:1px solid #d0d7de;padding-bottom:1rem}h1{margin:.1rem 0;font-size:2.2rem}.tagline{color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;margin-top:1.5rem}.card{border:1px solid #d0d7de;border-radius:16px;background:var(--card);padding:1rem}.score{font-size:2rem;font-weight:800}.ready{color:var(--ok)}.watch{color:var(--warn)}.hold,.manual-review{color:var(--bad)}.meta{color:var(--muted);font-size:.92rem}.pill{display:inline-block;border:1px solid #d0d7de;border-radius:999px;padding:.2rem .55rem;margin:.15rem;background:Canvas}.reason{margin:.35rem 0}.repo{font-weight:800;font-size:1.1rem}a{color:inherit}</style>
</head>
<body><main class="wrap">
  <header><div><p class="tagline">local-first release readiness radar</p><h1>shipcue</h1><p>Generated ${escapeHtml(scan.generatedAt)} from ${escapeHtml(scan.source)} data.</p></div><div><strong>${scan.repos.length}</strong> repos scanned<br><span class="meta">${scan.repos.filter((repo) => repo.readinessBand === 'ready').length} ready · ${scan.repos.filter((repo) => repo.readinessBand === 'hold').length} held</span></div></header>
  <section class="grid">${cards}</section>
</main></body></html>`;
}

function renderRepoCard(repo: ScoredRepo): string {
  const latest = repo.latestRelease?.tagName ?? repo.latestTag?.tagName ?? 'none';
  return `<article class="card ${repo.readinessBand}">
    <div class="repo"><a href="${escapeHtml(repo.url)}">${escapeHtml(repo.fullName)}</a></div>
    <div class="score ${repo.readinessBand}">${repo.score}</div>
    <p><span class="pill">${escapeHtml(repo.nextAction)}</span><span class="pill">${escapeHtml(repo.ci.status)}</span><span class="pill">${escapeHtml(repo.language ?? 'unknown')}</span></p>
    <p class="meta">latest: ${escapeHtml(latest)} · days: ${repo.daysSinceRelease ?? 'n/a'} · commits: ${repo.commitsSinceRelease.length} · PRs: ${repo.mergedPrsSinceRelease.length}</p>
    <ul>${repo.reasons.map((reason) => `<li class="reason">${escapeHtml(reason)}</li>`).join('')}</ul>
  </article>`;
}

export function escapeHtml(value: unknown): string {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
