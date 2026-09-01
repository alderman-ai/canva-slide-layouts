#!/usr/bin/env node
// scripts/validate.mjs — the repo's gate. Checks, in order:
//   (a) hygiene: no vendor design files anywhere (CLAUDE.md hard rule 1)
//   (b) every layout / slide / intake / bundle MD: flat frontmatter, JSON Schema (Ajv 2020, with
//       vocab enums injected), vocab-only values, a well-formed element table inside 1920x1080,
//       text_capacity_chars == sum(maxChars) over text roles, fonts in the registry,
//       fonts_native consistent with the registry, unique layout ids
//   (c) exit 1 on errors; `--json` for machine output
//
// Usage:
//   node scripts/validate.mjs [--json] [--hygiene-only] [--no-hygiene]
//                             [--type layout|slide|intake|bundle] [--spec <dir>] [file...]

import fs from 'node:fs';
import path from 'node:path';
import Ajv2020Module from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';
import {
  REPO_ROOT, PAGE_W, PAGE_H, parseHybrid, elementRows, textCapacity, walk, rel,
  loadVocab, loadSchemas, loadFonts, loadTextRoles, findNestedKeys, isTextRole, num,
  parseArgs, isMain,
} from './lib/md.mjs';

const Ajv = Ajv2020Module.default ?? Ajv2020Module;
const addFormats = addFormatsModule.default ?? addFormatsModule;

/** Vendor design files that may never enter the repo (CLAUDE.md hard rule 1). */
export const VENDOR_EXTENSIONS = [
  '.pptx', '.ppt', '.potx', '.ppsx', '.key', '.odp', '.psd', '.ai', '.sketch', '.fig', '.indd',
];

const REQUIRED_ELEMENT_COLUMNS = ['n', 'role', 'x', 'y', 'w', 'h'];

/** frontmatter key -> vocab file, for keys whose names do not match a vocab file directly. */
const VOCAB_ALIASES = {
  polish_cost: 'polish',
  role: 'element_role',
  roles: 'element_role',
  shape: 'content_shape',
  shapes: 'content_shape',
  accepts: 'unit_type',
  produces: 'communicative_function',
  layout_family: 'family',
  flow: 'flow_template',
};

/** True when a vocabulary's own values are numbers (then a numeric frontmatter value is literal). */
function hasNumericValues(values) {
  for (const v of values) if (/^\d+$/.test(String(v))) return true;
  return false;
}

function vocabNameForKey(key, vocab) {
  const k = String(key).toLowerCase();
  if (vocab.has(k)) return k;
  if (VOCAB_ALIASES[k] && vocab.has(VOCAB_ALIASES[k])) return VOCAB_ALIASES[k];
  if (k.endsWith('s') && vocab.has(k.slice(0, -1))) return k.slice(0, -1);
  return null;
}

/** Recursively set `enum` on schema properties whose name (or `x-vocab`) names a vocab file. */
export function injectVocabEnums(schema, vocab) {
  const seen = new Set();
  const visit = (node) => {
    if (!node || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (node.properties && typeof node.properties === 'object') {
      for (const [key, sub] of Object.entries(node.properties)) {
        if (!sub || typeof sub !== 'object') continue;
        const numericProperty = sub.type === 'integer' || sub.type === 'number';
        const name = sub['x-vocab'] ?? vocabNameForKey(key, vocab);
        const values = name ? vocab.get(name) : null;
        if (values && values.size && !numericProperty) {
          if (sub.type === 'array' || sub.items) {
            sub.items = { ...(sub.items ?? {}) };
            if (!sub.items.enum) sub.items.enum = Array.from(values);
          } else if (!sub.enum) {
            sub.enum = Array.from(values);
          }
        }
        visit(sub);
      }
    }
    for (const [k, v] of Object.entries(node)) {
      if (k === 'properties') continue;
      if (v && typeof v === 'object') visit(v);
    }
  };
  visit(schema);
  return schema;
}

function inferType(file, frontmatter) {
  const r = rel(file).toLowerCase();
  if (r.startsWith('layouts/')) return 'layout';
  if (/^presentations\/[^/]+\/slides\//.test(r)) return 'slide';
  if (r.startsWith('intake/')) return 'intake';
  if (/^bundles\/[^/]+\/bundle\.md$/.test(r)) return 'bundle';
  const fm = frontmatter ?? {};
  if (fm.bundle_id) return 'bundle';
  if (fm.source_type || fm.detected_archetype) return 'intake';
  if (fm.layout || fm.slide_no) return 'slide';
  if (fm.archetype || fm.family) return 'layout';
  return 'layout';
}

/** Default validation targets. */
export function targetFiles(root = REPO_ROOT) {
  const out = [];
  out.push(...walk(path.join(root, 'layouts'), '.md'));
  const presRoot = path.join(root, 'presentations');
  if (fs.existsSync(presRoot)) {
    for (const entry of fs.readdirSync(presRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      out.push(...walk(path.join(presRoot, entry.name, 'slides'), '.md'));
    }
  }
  out.push(...walk(path.join(root, 'intake'), '.md'));
  const bundlesRoot = path.join(root, 'bundles');
  if (fs.existsSync(bundlesRoot)) {
    for (const entry of fs.readdirSync(bundlesRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const f = path.join(bundlesRoot, entry.name, 'bundle.md');
      if (fs.existsSync(f)) out.push(f);
    }
  }
  return out;
}

export function hygieneCheck(root = REPO_ROOT) {
  const bad = [];
  for (const file of walk(root, '', { skip: new Set(['node_modules', '.git']), includeBuild: true })) {
    const ext = path.extname(file).toLowerCase();
    if (VENDOR_EXTENSIONS.includes(ext)) bad.push(file);
  }
  return bad;
}

function yesNo(value) {
  if (value === true) return 'yes';
  if (value === false) return 'no';
  const s = String(value ?? '').trim().toLowerCase();
  if (['yes', 'true', 'y'].includes(s)) return 'yes';
  if (['no', 'false', 'n'].includes(s)) return 'no';
  return s || null;
}

/**
 * Validate a set of hybrid MD files.
 * @returns {{errors:object[], warnings:object[], counts:object, ok:boolean}}
 */
export function runValidate(options = {}) {
  const root = options.root ?? REPO_ROOT;
  const specDir = options.specDir
    ? (path.isAbsolute(options.specDir) ? options.specDir : path.join(root, options.specDir))
    : path.join(root, 'spec');
  const errors = [];
  const warnings = [];
  const counts = { layout: 0, slide: 0, intake: 0, bundle: 0 };
  const err = (file, line, message, code) => errors.push({ level: 'ERR', file: file ? rel(file) : '', line: line ?? 0, message, code });
  const warn = (file, line, message, code) => warnings.push({ level: 'WARN', file: file ? rel(file) : '', line: line ?? 0, message, code });

  if (options.hygiene !== false) {
    for (const f of hygieneCheck(root)) {
      err(f, 0, `vendor design file is not allowed in this repo (${path.extname(f)})`, 'vendor_file');
    }
  }
  if (options.hygieneOnly) {
    return { ok: errors.length === 0, errors, warnings, counts };
  }

  const vocab = loadVocab(path.join(specDir, 'vocab'));
  const schemas = loadSchemas(path.join(specDir, 'schema'));
  const textRoles = loadTextRoles(path.join(specDir, 'vocab'));
  const fonts = loadFonts(options.fontsFile ?? path.join(specDir, 'fonts.json'));
  if (!fonts) warn('', 0, `${rel(path.join(specDir, 'fonts.json'))} not found; font checks skipped`, 'no_font_registry');

  const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
  addFormats(ajv);
  const validators = new Map();
  for (const [name, schema] of schemas) {
    try {
      validators.set(name, ajv.compile(injectVocabEnums(JSON.parse(JSON.stringify(schema)), vocab)));
    } catch (e) {
      err(path.join(specDir, 'schema', `${name}.schema.json`), 0, `schema will not compile: ${e.message}`, 'bad_schema');
    }
  }

  const files = (options.files && options.files.length ? options.files : targetFiles(root))
    .map((f) => (path.isAbsolute(f) ? f : path.join(process.cwd(), f)));
  const seenLayoutIds = new Map();

  for (const file of files) {
    let doc;
    try {
      doc = parseHybrid(file, { strict: false });
    } catch (e) {
      err(file, 0, `cannot parse: ${e.message}`, 'parse_failed');
      continue;
    }
    const fm = doc.frontmatter ?? {};
    const fmLine = (key) => doc.frontmatterLines?.[key] ?? 1;
    const type = options.type ?? inferType(file, fm);
    if (counts[type] === undefined) counts[type] = 0;
    counts[type] += 1;

    // --- flat frontmatter
    const nested = findNestedKeys(fm);
    for (const key of nested) {
      err(file, fmLine(key), `frontmatter key "${key}" is a nested map or list of maps; flat scalars and flat lists only`, 'nested_frontmatter');
    }

    // --- JSON Schema
    const validator = validators.get(type);
    if (validator && !nested.length) {
      if (!validator(fm)) {
        for (const e of validator.errors ?? []) {
          const key = String(e.instancePath || '').replace(/^\//, '').split('/')[0]
            || e.params?.missingProperty || '';
          err(file, key ? fmLine(key) : 1, `frontmatter ${key ? `"${key}" ` : ''}${e.message}${e.params?.allowedValues ? ` (allowed: ${e.params.allowedValues.join(', ')})` : ''}`, 'schema');
        }
      }
    } else if (!validator && schemas.size) {
      warn(file, 1, `no schema for type "${type}" in ${rel(path.join(specDir, 'schema'))}`, 'no_schema');
    }

    // --- vocab-typed frontmatter keys
    for (const [key, value] of Object.entries(fm)) {
      const name = vocabNameForKey(key, vocab);
      if (!name) continue;
      const allowed = vocab.get(name);
      if (!allowed || !allowed.size) continue;
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (v === null || v === undefined || v === '') continue;
        if (allowed.has(String(v))) continue;
        // numeric levels (density, polish_cost) map onto the vocabulary in order, 1-based
        if (typeof v === 'number' && !hasNumericValues(allowed)) {
          if (!Number.isInteger(v) || v < 1 || v > allowed.size) {
            err(file, fmLine(key), `"${key}: ${v}" is not a level 1..${allowed.size} of spec/vocab/${name}.json`, 'vocab');
          }
          continue;
        }
        err(file, fmLine(key), `"${key}: ${v}" is not in spec/vocab/${name}.json`, 'vocab');
      }
    }

    // --- element table
    const { key: tableKey, rows, meta } = elementRows(doc);
    const rowLine = (i) => meta?.lines?.[i] ?? 1;
    if (!tableKey || !rows.length) {
      err(file, 1, 'no element table found (expected a "## Elements" pipe table)', 'no_elements');
    } else {
      const missing = REQUIRED_ELEMENT_COLUMNS.filter((c) => !meta.columns.includes(c));
      if (missing.length) {
        err(file, rowLine(0) - 2, `element table is missing column(s): ${missing.join(', ')}`, 'bad_columns');
      }
      const seenN = new Map();
      rows.forEach((row, i) => {
        const line = rowLine(i);
        const n = row.n;
        if (typeof n !== 'number') err(file, line, `element n "${n}" is not a number`, 'bad_n');
        else if (seenN.has(n)) err(file, line, `duplicate element n ${n} (also line ${seenN.get(n)})`, 'dup_n');
        else seenN.set(n, line);

        const role = String(row.role ?? '').trim();
        if (!role) err(file, line, 'element has no role', 'no_role');
        else {
          const allowed = vocab.get('element_role');
          if (allowed && allowed.size && !allowed.has(role)) {
            err(file, line, `role "${role}" is not in spec/vocab/element_role.json`, 'vocab');
          }
        }

        for (const c of ['x', 'y', 'w', 'h']) {
          if (typeof row[c] !== 'number') err(file, line, `element ${n}: ${c} "${row[c]}" is not a number`, 'bad_geometry');
        }
        const x = num(row.x, NaN); const y = num(row.y, NaN);
        const w = num(row.w, NaN); const h = num(row.h, NaN);
        if ([x, y, w, h].every(Number.isFinite)) {
          if (w <= 0 || h <= 0) err(file, line, `element ${n}: w and h must be > 0 (got ${w}x${h})`, 'bad_geometry');
          if (x < 0 || y < 0) err(file, line, `element ${n}: x/y must be >= 0 (got ${x},${y})`, 'out_of_bounds');
          if (x + w > PAGE_W || y + h > PAGE_H) {
            err(file, line, `element ${n}: box ${x},${y} ${w}x${h} leaves the ${PAGE_W}x${PAGE_H} page`, 'out_of_bounds');
          }
        }

        if (isTextRole(row.role, textRoles)) {
          const cap = row.maxChars;
          if (cap === '' || cap === undefined) warn(file, line, `element ${n} (${role}) has no maxChars`, 'no_maxchars');
          else if (typeof cap !== 'number') err(file, line, `element ${n}: maxChars "${cap}" is not a number`, 'bad_maxchars');
          else if (typeof row.text === 'string' && row.text.length > cap) {
            warn(file, line, `element ${n}: text is ${row.text.length} chars, over maxChars ${cap}`, 'overflow');
          }
        }
      });

      // --- text_capacity_chars
      const derived = textCapacity(rows, textRoles);
      if (fm.text_capacity_chars === undefined) {
        warn(file, 1, `text_capacity_chars missing (sum of maxChars over text roles is ${derived})`, 'no_capacity');
      } else if (num(fm.text_capacity_chars, -1) !== derived) {
        err(file, fmLine('text_capacity_chars'), `text_capacity_chars is ${fm.text_capacity_chars} but the element table sums to ${derived}`, 'capacity_mismatch');
      }

      // --- fonts
      if (fonts) {
        const used = new Set();
        for (const f of (Array.isArray(fm.fonts) ? fm.fonts : (fm.fonts ? [fm.fonts] : []))) {
          if (f) used.add(String(f));
        }
        rows.forEach((row, i) => {
          const f = String(row.font ?? '').trim();
          if (!f) return;
          used.add(f);
          if (!fonts.has(f)) err(file, rowLine(i), `font "${f}" is not in spec/fonts.json`, 'unknown_font');
        });
        for (const f of used) {
          if (!fonts.has(f)) {
            if (!rows.some((r) => String(r.font ?? '').trim() === f)) {
              err(file, fmLine('fonts'), `font "${f}" is not in spec/fonts.json`, 'unknown_font');
            }
            continue;
          }
          const native = yesNo(fonts.get(f).canva_native);
          if (native !== 'yes') {
            warn(file, fmLine('fonts'), `font "${f}" is canva_native: ${native ?? 'unverified'}; expect substitution on import`, 'non_native_font');
          }
        }
        if (fm.fonts_native !== undefined) {
          const allNative = used.size > 0 && Array.from(used).every((f) => fonts.has(f) && yesNo(fonts.get(f).canva_native) === 'yes');
          const declared = yesNo(fm.fonts_native);
          if (declared !== null && declared !== (allNative ? 'yes' : 'no')) {
            err(file, fmLine('fonts_native'), `fonts_native: ${fm.fonts_native} disagrees with the registry (${allNative ? 'all fonts are canva_native' : 'at least one font is not canva_native'})`, 'fonts_native_mismatch');
          }
        }
      }
    }

    // --- unique layout ids
    if (type === 'layout') {
      const id = fm.id === undefined ? null : String(fm.id);
      if (!id) err(file, 1, 'layout has no id', 'no_id');
      else if (seenLayoutIds.has(id)) err(file, fmLine('id'), `duplicate layout id "${id}" (also ${seenLayoutIds.get(id)})`, 'dup_id');
      else seenLayoutIds.set(id, rel(file));
    }
  }

  return { ok: errors.length === 0, errors, warnings, counts };
}

function formatLine(rec) {
  return `${rec.level} ${rec.file}${rec.line ? `:${rec.line}` : ''} ${rec.message}`;
}

export function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  const result = runValidate({
    files: opts._,
    type: typeof opts.type === 'string' ? opts.type : null,
    specDir: typeof opts.spec === 'string' ? opts.spec : null,
    fontsFile: typeof opts.fonts === 'string' ? opts.fonts : null,
    hygiene: !opts.no_hygiene,
    hygieneOnly: Boolean(opts.hygiene_only),
  });

  if (opts.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    for (const rec of [...result.errors, ...result.warnings]) console.log(formatLine(rec));
    const c = result.counts;
    const total = Object.values(c).reduce((a, b) => a + b, 0);
    if (opts.hygiene_only) {
      console.log(`hygiene: ${result.errors.length} vendor file${result.errors.length === 1 ? '' : 's'} found`);
    } else {
      console.log(
        `${c.layout ?? 0} layouts, ${result.errors.length} error${result.errors.length === 1 ? '' : 's'}, `
        + `${result.warnings.length} warning${result.warnings.length === 1 ? '' : 's'} `
        + `(${c.slide ?? 0} slides, ${c.intake ?? 0} intake, ${c.bundle ?? 0} bundles, ${total} files checked)`,
      );
    }
  }
  return result;
}

if (isMain(import.meta.url)) {
  const result = main();
  process.exit(result.ok ? 0 : 1);
}
