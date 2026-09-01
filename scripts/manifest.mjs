#!/usr/bin/env node
// scripts/manifest.mjs — derived caches read by `slides.ps1 find`, the planner, and Obsidian.
//   manifest/layouts.json     every layout's frontmatter + element table + derived counts
//   manifest/components.json  components/slides/<Name>/ four-file packages, when present
//
// Usage: node scripts/manifest.mjs [--out <dir>]

import fs from 'node:fs';
import path from 'node:path';
import {
  REPO_ROOT, parseHybrid, elementRows, textCapacity, loadTextRoles, walk, writeJson, rel,
  parseArgs, isMain,
} from './lib/md.mjs';

const TEXT_ROLES = loadTextRoles();

/** Unit types the layout accepts: the `## Accepts` table, merged with any frontmatter list. */
function acceptedUnitTypes(doc) {
  const out = new Set();
  for (const v of [].concat(doc.frontmatter?.accepts ?? [])) if (v) out.add(String(v));
  const key = Object.keys(doc.tables ?? {}).find((k) => /^accepts\b/i.test(k));
  if (key) {
    for (const row of doc.tables[key]) {
      const v = row.unit_type ?? row.accepts ?? row.unit ?? row.type;
      if (v) out.add(String(v).trim());
    }
  }
  return Array.from(out);
}

export function layoutEntry(doc) {
  const { rows } = elementRows(doc);
  const fm = doc.frontmatter ?? {};
  const components = Array.from(new Set(
    rows.map((r) => String(r.component ?? '').trim()).filter(Boolean),
  ));
  const accepts = acceptedUnitTypes(doc);
  const accKey = Object.keys(doc.tables ?? {}).find((k) => /^accepts\b/i.test(k));
  return {
    ...fm,
    id: String(fm.id ?? path.basename(doc.file, '.md')),
    file: rel(doc.file),
    element_count: rows.length,
    text_capacity_chars: textCapacity(rows, TEXT_ROLES),
    declared_text_capacity_chars: fm.text_capacity_chars ?? null,
    accepts,
    components,
    elements: rows,
    accepts_table: accKey ? doc.tables[accKey] : [],
  };
}

export function buildLayoutsManifest(root = REPO_ROOT) {
  const layouts = walk(path.join(root, 'layouts'), '.md')
    .map((f) => layoutEntry(parseHybrid(f, { strict: false })))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return {
    generated_at: new Date().toISOString(),
    source: 'layouts/*.md',
    count: layouts.length,
    layouts,
  };
}

export function buildComponentsManifest(root = REPO_ROOT) {
  const dir = path.join(root, 'components', 'slides');
  const components = [];
  if (fs.existsSync(dir)) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.isDirectory()) continue;
      const compDir = path.join(dir, entry.name);
      const files = fs.readdirSync(compDir).sort();
      components.push({
        name: entry.name,
        group: 'slides',
        dir: rel(compDir),
        files,
        has_html: files.some((f) => f.toLowerCase().endsWith('.html')),
        has_jsx: files.some((f) => f.toLowerCase().endsWith('.jsx')),
        has_prompt: files.some((f) => f.toLowerCase().endsWith('.prompt.md')),
        has_types: files.some((f) => f.toLowerCase().endsWith('.d.ts')),
      });
    }
  }
  return {
    generated_at: new Date().toISOString(),
    source: 'components/slides/*/',
    count: components.length,
    components,
  };
}

export function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  const outDir = path.isAbsolute(opts.out ?? '')
    ? opts.out
    : path.join(REPO_ROOT, opts.out ?? 'manifest');
  const layouts = buildLayoutsManifest();
  const components = buildComponentsManifest();
  const a = writeJson(path.join(outDir, 'layouts.json'), layouts);
  const b = writeJson(path.join(outDir, 'components.json'), components);
  console.log(`wrote ${rel(a)} (${layouts.count} layout${layouts.count === 1 ? '' : 's'})`);
  console.log(`wrote ${rel(b)} (${components.count} component${components.count === 1 ? '' : 's'})`);
  return [a, b];
}

if (isMain(import.meta.url)) {
  try {
    main();
  } catch (err) {
    console.error(`manifest: ${err.message}`);
    process.exit(1);
  }
}
