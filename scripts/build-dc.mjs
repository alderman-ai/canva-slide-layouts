#!/usr/bin/env node
// scripts/build-dc.mjs — hybrid MD -> Claude Design deck (`.dc.html` + `canvas.json`).
//
// EXPERIMENTAL (Route D input). The deck shape below is reconstructed from research/08
// (`<x-dc>`, `<helmet>`, `<x-import component-from-global-scope="deck-stage">`, a `support.js`
// runtime, one `<section data-label>` per slide) and is unverified against a live Claude Design
// project — probe question 5 in docs/OPEN-QUESTIONS.md. `support.js` is supplied by the
// Claude Design project, not emitted here; the `<script src="./support.js">` line is kept verbatim.
//
// Usage:
//   node scripts/build-dc.mjs                   all layouts   -> build/dc/library/Main.dc.html
//   node scripts/build-dc.mjs --deck <slug>     deck slides   -> build/dc/<slug>/Main.dc.html
//   node scripts/build-dc.mjs --family <name>   one family    -> build/dc/<family>/Main.dc.html
//   node scripts/build-dc.mjs <file.md> [...]   ad-hoc files  -> --out dir (default build/dc/adhoc)

import path from 'node:path';
import {
  REPO_ROOT, PAGE_W, PAGE_H, parseHybrid, elementRows, walk, writeText, writeJson, rel,
  loadFonts, escapeHtml, parseArgs, isMain,
} from './lib/md.mjs';
import { renderElements, speakerNotes, pageLabel, baseCss } from './build-html.mjs';

export const DC_HEADER_COMMENT =
  '<!-- EXPERIMENTAL: Claude Design deck (Route D). Shape per research/08 / docs/PLAN.md '
  + '§ Stack roles; unverified against a live project (probe question 5). support.js is provided '
  + 'by the Claude Design project. -->';

/** One `<section data-label>` artboard slide (no `data-document-role` — that is the Canva import shape). */
export function renderDcSection(doc, fonts) {
  const { rows } = elementRows(doc);
  return [
    `    <section data-label="${escapeHtml(pageLabel(doc))}" data-speaker-notes="${escapeHtml(speakerNotes(doc))}"`
      + ` style="position:relative;width:${PAGE_W}px;height:${PAGE_H}px;overflow:hidden;background:#fff">`,
    renderElements(rows, fonts).split('\n').map((l) => (l ? '    ' + l : l)).join('\n'),
    '    </section>',
  ].join('\n');
}

/** The whole `.dc.html` deck document. */
export function renderDcDeck(docs, { fonts = null } = {}) {
  return [
    '<!doctype html>',
    DC_HEADER_COMMENT,
    '<html>',
    '<head>',
    '<meta charset="utf-8">',
    '<script src="./support.js"></script>',
    '</head>',
    '<body>',
    '<x-dc>',
    '<helmet><style>',
    baseCss(),
    '</style></helmet>',
    `<x-import component-from-global-scope="deck-stage" width="${PAGE_W}" height="${PAGE_H}">`,
    ...docs.map((d) => renderDcSection(d, fonts)),
    '</x-import>',
    '</x-dc>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

/** `canvas.json` — the artboard list Claude Design lays out. */
export function renderCanvasJson(name, pageCount) {
  return {
    version: 1,
    experimental: true,
    artboards: [
      {
        id: name,
        name,
        file: 'Main.dc.html',
        x: 0,
        y: 0,
        width: PAGE_W,
        height: PAGE_H,
        pages: pageCount,
      },
    ],
  };
}

function loadDocs(files) {
  return files.map((f) => parseHybrid(f, { strict: false }));
}

export function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  const fonts = loadFonts();
  let name = 'library';
  let docs;

  if (opts.deck) {
    name = String(opts.deck);
    const dir = path.join(REPO_ROOT, 'presentations', name, 'slides');
    docs = loadDocs(walk(dir, '.md'));
    if (!docs.length) throw new Error(`no slides found in ${rel(dir)}`);
  } else if (opts.family) {
    name = String(opts.family);
    docs = loadDocs(walk(path.join(REPO_ROOT, 'layouts'), '.md'))
      .filter((d) => String(d.frontmatter?.family ?? '') === name);
    if (!docs.length) throw new Error(`no layouts with family "${name}"`);
  } else if (opts._.length) {
    name = 'adhoc';
    docs = loadDocs(opts._.map((f) => (path.isAbsolute(f) ? f : path.join(process.cwd(), f))));
  } else {
    docs = loadDocs(walk(path.join(REPO_ROOT, 'layouts'), '.md'));
  }

  const outDir = path.isAbsolute(opts.out ?? '')
    ? opts.out
    : path.join(REPO_ROOT, opts.out ?? path.join('build', 'dc', name));
  const deckFile = writeText(path.join(outDir, 'Main.dc.html'), renderDcDeck(docs, { fonts }));
  const canvasFile = writeJson(path.join(outDir, 'canvas.json'), renderCanvasJson(name, docs.length));
  console.log(`wrote ${rel(deckFile)} (${docs.length} slide${docs.length === 1 ? '' : 's'})`);
  console.log(`wrote ${rel(canvasFile)}`);
  return [deckFile, canvasFile];
}

if (isMain(import.meta.url)) {
  try {
    main();
  } catch (err) {
    console.error(`build-dc: ${err.message}`);
    process.exit(1);
  }
}
