#!/usr/bin/env node
// scripts/build-html.mjs — hybrid MD -> annotated HTML for Canva's `import-design-from-url`.
//
// Authoring rules enforced here (docs/PLAN.md § "HTML authoring rules confirmed by import
// evidence", research/07 §a): one non-nested <section data-document-role="page"> per slide at
// 1920x1080, every text run in its own leaf element, real <li> items written out, no text in
// pseudo-elements, no data URIs, absolute positioning, font families named as Canva spells them
// with the registry fallback stack.
//
// Usage:
//   node scripts/build-html.mjs                     all layouts -> build/html/<id>.html + index.html
//   node scripts/build-html.mjs --deck <slug>       presentations/<slug>/slides/*.md -> build/html/decks/<slug>.html
//   node scripts/build-html.mjs --family <name>     layouts of one family -> build/html/families/<nn>-<family>.html
//   node scripts/build-html.mjs <file.md> [...]     ad-hoc files -> --out dir (default build/html)

import fs from 'node:fs';
import path from 'node:path';
import {
  REPO_ROOT, PAGE_W, PAGE_H, parseHybrid, elementRows, walk, writeText, rel,
  loadFonts, loadVocab, fontStack, escapeHtml, parseShapeSpec, bulletLines, textLines,
  num, PLACEHOLDER_ROLES, parseArgs, isMain,
} from './lib/md.mjs';

const TEMPLATE_DIR = path.join(REPO_ROOT, 'templates');

export function baseCss() {
  const file = path.join(TEMPLATE_DIR, '_base.css');
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n').trim() : '';
}

export function pageTemplate() {
  const file = path.join(TEMPLATE_DIR, '_page.html.tpl');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  return '<section data-document-role="page" data-label="{{label}}" data-speaker-notes="{{notes}}"'
    + ' style="position:relative;width:{{width}}px;height:{{height}}px;overflow:hidden;background:{{background}}">\n{{content}}\n</section>\n';
}

function styleAttr(pairs) {
  return pairs.filter(Boolean).join(';');
}

function textStyle(row, fonts, extra = []) {
  return styleAttr([
    'position:absolute',
    `left:${num(row.x)}px`,
    `top:${num(row.y)}px`,
    `width:${num(row.w)}px`,
    `font-family:${fontStack(row.font, fonts)}`,
    `font-weight:${num(row.weight, 400)}`,
    `font-size:${num(row.size, 32)}px`,
    `line-height:${num(row.lh, 1.4)}`,
    `text-align:${String(row.align || 'left').trim()}`,
    'margin:0',
    ...extra,
  ]);
}

function renderTextRow(row, fonts) {
  const role = String(row.role ?? '').trim().toLowerCase();
  const tag = role === 'title' ? 'h1' : 'p';
  const lines = textLines(row.text).filter((l) => l !== '');
  if (lines.length <= 1) {
    return [`<${tag} style="${textStyle(row, fonts)}">${escapeHtml(lines[0] ?? '')}</${tag}>`];
  }
  // multi-line, not a bullet list: one leaf element per line, stacked by line-height
  const size = num(row.size, 32);
  const lh = num(row.lh, 1.4);
  return lines.map((line, i) => {
    const shifted = { ...row, y: num(row.y) + Math.round(i * size * lh) };
    return `<${tag} style="${textStyle(shifted, fonts)}">${escapeHtml(line)}</${tag}>`;
  });
}

function renderBulletGroup(rows, fonts) {
  const first = rows[0];
  const left = Math.min(...rows.map((r) => num(r.x)));
  const top = num(first.y);
  const width = Math.max(...rows.map((r) => num(r.w)));
  const ulStyle = styleAttr([
    'position:absolute',
    `left:${left}px`,
    `top:${top}px`,
    `width:${width}px`,
    'margin:0',
    'padding:0 0 0 1.2em',
    'list-style:disc outside',
  ]);
  const items = [];
  let prevBottom = top;
  rows.forEach((row, i) => {
    const size = num(row.size, 32);
    const lh = num(row.lh, 1.4);
    const gap = i === 0 ? 0 : Math.max(0, Math.round(num(row.y) - prevBottom));
    prevBottom = num(row.y) + Math.round(size * lh);
    const liStyle = styleAttr([
      `font-family:${fontStack(row.font, fonts)}`,
      `font-weight:${num(row.weight, 400)}`,
      `font-size:${size}px`,
      `line-height:${lh}`,
      `text-align:${String(row.align || 'left').trim()}`,
      `margin:${gap}px 0 0`,
      'padding:0',
    ]);
    items.push(`  <li style="${liStyle}">${escapeHtml(row.text ?? '')}</li>`);
  });
  return [`<ul style="${ulStyle}">`, ...items, '</ul>'];
}

function renderInlineBullets(row, fonts, bullets) {
  const size = num(row.size, 32);
  const lh = num(row.lh, 1.4);
  const ulStyle = styleAttr([
    'position:absolute',
    `left:${num(row.x)}px`,
    `top:${num(row.y)}px`,
    `width:${num(row.w)}px`,
    'margin:0',
    'padding:0 0 0 1.2em',
    'list-style:disc outside',
  ]);
  const liStyle = styleAttr([
    `font-family:${fontStack(row.font, fonts)}`,
    `font-weight:${num(row.weight, 400)}`,
    `font-size:${size}px`,
    `line-height:${lh}`,
    `text-align:${String(row.align || 'left').trim()}`,
    'margin:0',
    'padding:0',
  ]);
  return [
    `<ul style="${ulStyle}">`,
    ...bullets.map((b) => `  <li style="${liStyle}">${escapeHtml(b)}</li>`),
    '</ul>',
  ];
}

function renderShape(row) {
  const spec = parseShapeSpec(row.text);
  const style = styleAttr([
    'position:absolute',
    `left:${num(row.x)}px`,
    `top:${num(row.y)}px`,
    `width:${num(row.w)}px`,
    `height:${num(row.h)}px`,
    `background:${spec.fill}`,
    spec.radius ? `border-radius:${spec.radius}px` : '',
    spec.stroke ? `border:${spec.strokeWidth || 1}px solid ${spec.stroke}` : '',
  ]);
  return [`<div style="${style}"></div>`];
}

function renderDivider(row) {
  const spec = parseShapeSpec(row.text);
  const h = num(row.h, 0) || 2;
  const style = styleAttr([
    'position:absolute',
    `left:${num(row.x)}px`,
    `top:${num(row.y)}px`,
    `width:${num(row.w)}px`,
    `height:${h}px`,
    `background:${spec.stroke || spec.fill || '#999999'}`,
  ]);
  return [`<div style="${style}"></div>`];
}

function renderPlaceholder(row, fonts) {
  const role = String(row.role ?? '').trim().toLowerCase();
  const spec = parseShapeSpec(row.text);
  const label = spec.label || String(row.text ?? '').trim() || role;
  const boxStyle = styleAttr([
    'position:absolute',
    `left:${num(row.x)}px`,
    `top:${num(row.y)}px`,
    `width:${num(row.w)}px`,
    `height:${num(row.h)}px`,
    `background:${spec.fill || '#e5e5e5'}`,
    spec.radius ? `border-radius:${spec.radius}px` : '',
    spec.stroke ? `border:${spec.strokeWidth || 1}px solid ${spec.stroke}` : '',
    'display:flex',
    'align-items:center',
    'justify-content:center',
  ]);
  const labelStyle = styleAttr([
    `font-family:${fontStack(row.font, fonts)}`,
    'font-weight:500',
    `font-size:${num(row.size, 24)}px`,
    'line-height:1.2',
    'color:#666666',
    'margin:0',
  ]);
  return [
    `<div style="${boxStyle}">`,
    `  <span style="${labelStyle}">${escapeHtml(label)}</span>`,
    '</div>',
  ];
}

/**
 * Render one element table to absolutely positioned leaf elements.
 * @param {object[]} rows
 * @param {Map<string,object>|null} fonts
 * @returns {string} HTML fragment
 */
export function renderElements(rows, fonts) {
  const out = [];
  const list = rows.slice().sort((a, b) => num(a.n) - num(b.n));
  for (let i = 0; i < list.length; i++) {
    const row = list[i];
    const role = String(row.role ?? '').trim().toLowerCase();
    if (!role) continue;
    if (role === 'shape') { out.push(...renderShape(row)); continue; }
    if (role === 'divider' || role === 'rule') { out.push(...renderDivider(row)); continue; }
    if (PLACEHOLDER_ROLES.has(role)) { out.push(...renderPlaceholder(row, fonts)); continue; }
    if (role === 'bullet') {
      const group = [row];
      while (i + 1 < list.length && String(list[i + 1].role ?? '').trim().toLowerCase() === 'bullet') {
        group.push(list[++i]);
      }
      out.push(...renderBulletGroup(group, fonts));
      continue;
    }
    const bullets = bulletLines(row.text);
    if (bullets) { out.push(...renderInlineBullets(row, fonts, bullets)); continue; }
    out.push(...renderTextRow(row, fonts));
  }
  return out.map((l) => '  ' + l).join('\n');
}

/** Speaker notes for a parsed doc: `## Speaker notes` / `## Notes`, else frontmatter. */
export function speakerNotes(doc) {
  const key = Object.keys(doc.sections ?? {}).find((k) => /^(speaker\s*notes|notes)$/i.test(k));
  const text = key ? doc.sections[key] : (doc.frontmatter?.speaker_notes ?? '');
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

export function pageLabel(doc) {
  const fm = doc.frontmatter ?? {};
  if (fm.title) return String(fm.title);
  if (fm.label) return String(fm.label);
  const id = String(fm.id ?? path.basename(doc.file, '.md'));
  // layout frontmatter carries no title key (spec/schema/layout.schema.json), so the page
  // label — which becomes the Canva page title — is built from id + archetype
  return fm.archetype ? `${id} ${fm.archetype}` : id;
}

export function docId(doc) {
  const fm = doc.frontmatter ?? {};
  return String(fm.id ?? fm.slide_no ?? path.basename(doc.file, '.md'));
}

/** One `<section data-document-role="page">` for one hybrid MD document. */
export function renderPage(doc, fonts) {
  const { rows } = elementRows(doc);
  return pageTemplate()
    .replace('{{label}}', escapeHtml(pageLabel(doc)))
    .replace('{{notes}}', escapeHtml(speakerNotes(doc)))
    .replace('{{width}}', String(PAGE_W))
    .replace('{{height}}', String(PAGE_H))
    .replace('{{background}}', '#fff')
    .replace('{{content}}', renderElements(rows, fonts))
    .trimEnd();
}

/** A complete importable HTML document containing one page per doc. */
export function renderDocument(docs, { title = 'Slides', fonts = null } = {}) {
  const pages = docs.map((d) => renderPage(d, fonts)).join('\n');
  return [
    '<!doctype html>',
    '<html>',
    '<head>',
    '<meta charset="utf-8">',
    `<title>${escapeHtml(title)}</title>`,
    '<style>',
    baseCss(),
    '</style>',
    '</head>',
    '<body>',
    pages,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

/** Contact sheet: every single-page file linked and scaled to 25%. */
export function renderIndex(entries) {
  const cards = entries.map((e) => [
    '  <a class="card" href="' + escapeHtml(e.href) + '">',
    '    <span class="frame"><iframe src="' + escapeHtml(e.href) + '" scrolling="no" loading="lazy"></iframe></span>',
    '    <span class="meta"><b>' + escapeHtml(e.id) + '</b> ' + escapeHtml(e.title) + '</span>',
    '  </a>',
  ].join('\n')).join('\n');
  return [
    '<!doctype html>',
    '<html>',
    '<head>',
    '<meta charset="utf-8">',
    '<title>Layout contact sheet</title>',
    '<style>',
    'body{margin:0;padding:24px;background:#f2f2f2;font:14px/1.4 Inter,Helvetica Neue,Arial,sans-serif;color:#111}',
    'h1{font-size:20px;margin:0 0 16px}',
    '.grid{display:flex;flex-wrap:wrap;gap:16px}',
    '.card{display:block;text-decoration:none;color:inherit;width:480px}',
    '.frame{display:block;width:480px;height:270px;overflow:hidden;background:#fff;border:1px solid #ddd}',
    '.frame iframe{width:1920px;height:1080px;border:0;transform:scale(0.25);transform-origin:top left;pointer-events:none}',
    '.meta{display:block;padding:6px 2px;font-size:13px;color:#444}',
    '</style>',
    '</head>',
    '<body>',
    `<h1>Layout contact sheet — ${entries.length} layout${entries.length === 1 ? '' : 's'}</h1>`,
    '<div class="grid">',
    cards,
    '</div>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

function familyIndex(family, vocab) {
  const list = vocab.get('family');
  if (list && list.size) {
    const idx = Array.from(list).indexOf(family);
    if (idx >= 0) return String(idx + 1).padStart(2, '0');
  }
  return '00';
}

function loadDocs(files) {
  return files.map((f) => parseHybrid(f, { strict: false }));
}

export function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  const fonts = loadFonts();
  const outDir = path.isAbsolute(opts.out ?? '')
    ? opts.out
    : path.join(REPO_ROOT, opts.out ?? path.join('build', 'html'));
  const written = [];

  if (opts.deck) {
    const dir = path.join(REPO_ROOT, 'presentations', String(opts.deck), 'slides');
    const docs = loadDocs(walk(dir, '.md'));
    if (!docs.length) throw new Error(`no slides found in ${rel(dir)}`);
    const file = path.join(outDir, 'decks', `${opts.deck}.html`);
    writeText(file, renderDocument(docs, { title: String(opts.deck), fonts }));
    written.push(file);
  } else if (opts.family) {
    const vocab = loadVocab();
    const docs = loadDocs(walk(path.join(REPO_ROOT, 'layouts'), '.md'))
      .filter((d) => String(d.frontmatter?.family ?? '') === String(opts.family));
    if (!docs.length) throw new Error(`no layouts with family "${opts.family}"`);
    const nn = familyIndex(String(opts.family), vocab);
    const file = path.join(outDir, 'families', `${nn}-${opts.family}.html`);
    writeText(file, renderDocument(docs, { title: `${opts.family} family master`, fonts }));
    written.push(file);
  } else {
    const files = opts._.length
      ? opts._.map((f) => (path.isAbsolute(f) ? f : path.join(process.cwd(), f)))
      : walk(path.join(REPO_ROOT, 'layouts'), '.md');
    const entries = [];
    for (const f of files) {
      const doc = parseHybrid(f, { strict: false });
      const id = docId(doc);
      const file = path.join(outDir, `${id}.html`);
      writeText(file, renderDocument([doc], { title: pageLabel(doc), fonts }));
      written.push(file);
      entries.push({ id, title: pageLabel(doc), href: `${id}.html` });
    }
    writeText(path.join(outDir, 'index.html'), renderIndex(entries));
    written.push(path.join(outDir, 'index.html'));
  }

  for (const f of written) console.log(`wrote ${rel(f)}`);
  console.log(`${written.length} file${written.length === 1 ? '' : 's'} written`);
  return written;
}

if (isMain(import.meta.url)) {
  try {
    main();
  } catch (err) {
    console.error(`build-html: ${err.message}`);
    process.exit(1);
  }
}
