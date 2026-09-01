#!/usr/bin/env node
// scripts/preview.mjs — Playwright screenshots of the built HTML.
//   build/html/<id>.html -> build/previews/<id>.png            (1920x1080 rendered, saved at 480x270)
//   contact sheet per family -> build/previews/families/<family>.png
//
// Browsers are NOT installed by `npm install` (see scripts/README.md). If Chromium is missing this
// prints the install command and exits 0, so `slides.ps1 preview` never breaks a pipeline.
//
// Usage: node scripts/preview.mjs [--in <dir>] [--out <dir>] [--only <id>]

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  REPO_ROOT, PAGE_W, PAGE_H, parseHybrid, walk, writeText, rel, escapeHtml, parseArgs, isMain,
} from './lib/md.mjs';

export const INSTALL_COMMAND = 'npx playwright install chromium';
const SCALE = 0.25; // 1920x1080 -> 480x270

function layoutFamilies(root = REPO_ROOT) {
  const map = new Map();
  for (const f of walk(path.join(root, 'layouts'), '.md')) {
    const doc = parseHybrid(f, { strict: false });
    const id = String(doc.frontmatter?.id ?? path.basename(f, '.md'));
    map.set(id, String(doc.frontmatter?.family ?? 'unfiled'));
  }
  return map;
}

export function contactSheetHtml(family, entries) {
  const cards = entries.map((e) => [
    '  <figure>',
    `    <img src="${escapeHtml(e.png)}" width="480" height="270" alt="${escapeHtml(e.id)}">`,
    `    <figcaption>${escapeHtml(e.id)}</figcaption>`,
    '  </figure>',
  ].join('\n')).join('\n');
  return [
    '<!doctype html>',
    '<html><head><meta charset="utf-8"><title>' + escapeHtml(family) + '</title>',
    '<style>',
    'body{margin:0;padding:24px;background:#fff;font:14px/1.4 Arial,sans-serif;color:#111}',
    'h1{font-size:22px;margin:0 0 16px}',
    '.grid{display:flex;flex-wrap:wrap;gap:16px}',
    'figure{margin:0;width:480px}',
    'img{display:block;border:1px solid #ddd}',
    'figcaption{padding:4px 2px;font-size:12px;color:#555}',
    '</style></head><body>',
    `<h1>${escapeHtml(family)} — ${entries.length} layout${entries.length === 1 ? '' : 's'}</h1>`,
    '<div class="grid">',
    cards,
    '</div></body></html>',
    '',
  ].join('\n');
}

export async function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  const inDir = path.isAbsolute(opts.in ?? '') ? opts.in : path.join(REPO_ROOT, opts.in ?? path.join('build', 'html'));
  const outDir = path.isAbsolute(opts.out ?? '') ? opts.out : path.join(REPO_ROOT, opts.out ?? path.join('build', 'previews'));

  if (!fs.existsSync(inDir)) {
    console.log(`preview: ${rel(inDir)} does not exist — run "node scripts/build-html.mjs" first`);
    return [];
  }
  const pages = fs.readdirSync(inDir)
    .filter((f) => f.endsWith('.html') && f !== 'index.html')
    .filter((f) => !opts.only || path.basename(f, '.html') === String(opts.only))
    .sort();
  if (!pages.length) {
    console.log(`preview: no page HTML in ${rel(inDir)} — run "node scripts/build-html.mjs" first`);
    return [];
  }

  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.log('preview: playwright is not installed. Run: npm install');
    return [];
  }

  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    console.log('preview: Chromium is not installed for Playwright.');
    console.log(`preview: run this once, then re-run preview:\n  ${INSTALL_COMMAND}`);
    console.log(`preview: (launch error: ${String(err.message).split('\n')[0]})`);
    return [];
  }

  const written = [];
  try {
    const context = await browser.newContext({
      viewport: { width: PAGE_W, height: PAGE_H },
      deviceScaleFactor: SCALE,
    });
    const page = await context.newPage();
    for (const file of pages) {
      const id = path.basename(file, '.html');
      const png = path.join(outDir, `${id}.png`);
      fs.mkdirSync(path.dirname(png), { recursive: true });
      await page.goto(pathToFileURL(path.join(inDir, file)).href, { waitUntil: 'load' });
      await page.screenshot({ path: png, clip: { x: 0, y: 0, width: PAGE_W, height: PAGE_H } });
      written.push(png);
      console.log(`wrote ${rel(png)}`);
    }
    await page.close();

    // contact sheet per family
    const families = layoutFamilies();
    const groups = new Map();
    for (const png of written) {
      const id = path.basename(png, '.png');
      const family = families.get(id) ?? 'unfiled';
      if (!groups.has(family)) groups.set(family, []);
      groups.get(family).push({ id, png: path.basename(png) });
    }
    const sheetContext = await browser.newContext({ viewport: { width: 1040, height: 800 }, deviceScaleFactor: 1 });
    for (const [family, entries] of groups) {
      const sheetHtml = path.join(outDir, '_sheets', `${family}.html`);
      writeText(sheetHtml, contactSheetHtml(family, entries.map((e) => ({ ...e, png: `../${e.png}` }))));
      const sheetPng = path.join(outDir, 'families', `${family}.png`);
      fs.mkdirSync(path.dirname(sheetPng), { recursive: true });
      const sheetPage = await sheetContext.newPage();
      await sheetPage.goto(pathToFileURL(sheetHtml).href, { waitUntil: 'load' });
      await sheetPage.screenshot({ path: sheetPng, fullPage: true });
      await sheetPage.close();
      written.push(sheetPng);
      console.log(`wrote ${rel(sheetPng)}`);
    }
    await sheetContext.close();
    await context.close();
  } finally {
    await browser.close();
  }
  console.log(`${written.length} image${written.length === 1 ? '' : 's'} written`);
  return written;
}

if (isMain(import.meta.url)) {
  main().catch((err) => {
    console.error(`preview: ${err.message}`);
    process.exit(1);
  });
}
