#!/usr/bin/env node
// scripts/build-canva-ops.mjs — hybrid MD -> `edit-design` operation batches (Route B),
// plus the `find_and_replace` variant used by Route C when a slide is bound to a master page.
//
// Operation names and fields are the real ones read from the connector schema
// (research/09 § "Key schema facts read directly"). Reminders encoded here:
//   * no operation can set a font family; `format_text.font_weight` is normal|bold only
//   * `format_text` styles the whole text box, so one `add_text` per differently styled run
//   * all operations in one `edit-design` call target one page; commit is a separate call
//   * `replace_speaker_notes` is capped at 5000 characters
// Placeholders `$PAGE`, `$LOC[n]`, `$ASSET[n]` are filled in at upload time from `read-design`.
// Keys beginning with `$` (e.g. `$ref`) are bookkeeping for the uploader and MUST be stripped
// before an operation is sent to `edit-design` (its schemas set additionalProperties:false).
// Full parameter reference: spec/canva-edit-ops.md.
//
// Usage:
//   node scripts/build-canva-ops.mjs                  all layouts -> build/canva-ops/<id>.json
//   node scripts/build-canva-ops.mjs --deck <slug>    deck slides -> presentations/<slug>/build/canva-ops/<id>.json
//   node scripts/build-canva-ops.mjs <file.md> [...]  ad-hoc files -> --out dir

import path from 'node:path';
import {
  REPO_ROOT, PAGE_W, PAGE_H, parseHybrid, elementRows, walk, writeJson, rel,
  parseShapeSpec, bulletLines, textLines, num, PLACEHOLDER_ROLES, isTextRole,
  parseArgs, isMain,
} from './lib/md.mjs';
import { speakerNotes, pageLabel, docId } from './build-html.mjs';

/** The 27 `edit-design` operations exposed by this connector (research/09). */
export const ALLOWED_OPS = new Set([
  'update_title', 'replace_text', 'update_fill', 'insert_fill', 'delete_element',
  'find_and_replace_text', 'position_element', 'resize_element', 'format_text', 'add_text',
  'insert_shape', 'replace_shape', 'add_page', 'update_opacity', 'layer_element',
  'recolor_element', 'rotate_element', 'group_elements', 'ungroup_elements', 'flip_media',
  'crop_media', 'reorder_page', 'replace_speaker_notes', 'update_text_anchoring',
  'update_stroke_properties', 'update_line_properties', 'update_autofill_field',
]);

export const MAX_OPS_PER_CHUNK = 25;
export const MAX_SPEAKER_NOTES = 5000;

const PAGE_PLACEHOLDER = '$PAGE';
const locPlaceholder = (n) => `$LOC[${n}]`;
const assetPlaceholder = (n) => `$ASSET[${n}]`;

function textOf(row) {
  const bullets = bulletLines(row.text);
  if (bullets) return bullets.join('\n');
  return textLines(row.text).filter((l) => l !== '').join('\n');
}

/** Build the operation list for one parsed hybrid document. */
export function opsForDoc(doc) {
  const { rows } = elementRows(doc);
  const list = rows.slice().sort((a, b) => num(a.n) - num(b.n));
  const ops = [];

  for (const row of list) {
    const role = String(row.role ?? '').trim().toLowerCase();
    if (!role) continue;
    const n = num(row.n, ops.length + 1);

    if (role === 'shape' || role === 'divider' || role === 'rule') {
      const spec = parseShapeSpec(row.text);
      const w = num(row.w, 0);
      const h = role === 'divider' || role === 'rule' ? (num(row.h, 0) || 2) : num(row.h, 0);
      ops.push({
        type: 'insert_shape',
        // Field names per the live MCP `edit-design` schema (spec/canva-edit-ops.md #11):
        // path (SVG d; M/L/H/V/C/S/A/Z only), view_box_width/height, color, stroke_color, stroke_weight, corner_rounding.
        page_id: PAGE_PLACEHOLDER,
        $ref: locPlaceholder(n),
        left: num(row.x),
        top: num(row.y),
        width: w,
        height: h,
        path: `M0 0H${w}V${h}H0Z`,
        view_box_width: w,
        view_box_height: h,
        color: spec.fill,
        ...(spec.stroke ? { stroke_color: spec.stroke, stroke_weight: spec.strokeWeight || 1 } : {}),
        corner_rounding: spec.radius || 0,
      });
      continue;
    }

    if (PLACEHOLDER_ROLES.has(role) && !isTextRole(role)) {
      ops.push({
        type: 'insert_fill',
        // Required by the schema: page_id, asset_type, asset_id, alt_text (spec/canva-edit-ops.md #4)
        page_id: PAGE_PLACEHOLDER,
        asset_type: 'image',
        asset_id: assetPlaceholder(n),
        alt_text: textOf(row) || `${role} ${n}`,
        $ref: locPlaceholder(n),
        left: num(row.x),
        top: num(row.y),
        width: num(row.w),
        height: num(row.h),
      });
      continue;
    }

    const text = textOf(row);
    ops.push({
      type: 'add_text',
      page_id: PAGE_PLACEHOLDER,
      text,
      top: num(row.y),
      left: num(row.x),
      width: num(row.w),
    });
    const isList = role === 'bullet' || bulletLines(row.text) != null;
    // `format_text` nests its options under `formatting`; text_align is start|center|end
    // (spec/canva-edit-ops.md #9). CSS-style left/right are mapped.
    const alignMap = { left: 'start', right: 'end', start: 'start', center: 'center', end: 'end' };
    const formatting = {
      font_size: Math.round(num(row.size, 32)),
      font_weight: num(row.weight, 400) >= 600 ? 'bold' : 'normal',
      line_height: num(row.lh, 1.4),
      text_align: alignMap[String(row.align || 'start').trim().toLowerCase()] || 'start',
    };
    if (isList) {
      formatting.list_marker = 'disc';
      formatting.list_level = 1;
    }
    ops.push({ type: 'format_text', locator_id: locPlaceholder(n), formatting });
  }

  const notes = speakerNotes(doc);
  if (notes) {
    ops.push({
      type: 'replace_speaker_notes',
      page_id: PAGE_PLACEHOLDER,
      notes: notes.slice(0, MAX_SPEAKER_NOTES), // field name per schema (#23)
    });
  }

  const bad = ops.map((o) => o.type).filter((t) => !ALLOWED_OPS.has(t));
  if (bad.length) throw new Error(`unknown edit-design operation(s): ${[...new Set(bad)].join(', ')}`);
  return ops;
}

export function chunkOps(ops, size = MAX_OPS_PER_CHUNK) {
  const chunks = [];
  for (let i = 0; i < ops.length; i += size) chunks.push(ops.slice(i, i + size));
  return chunks;
}

/** Master-page placeholder text keyed by `role:index`, read from the bound layout. */
function masterPlaceholders(layoutId, layoutCache) {
  if (!layoutId) return null;
  if (!layoutCache.has(layoutId)) {
    const hit = walk(path.join(REPO_ROOT, 'layouts'), '.md')
      .map((f) => parseHybrid(f, { strict: false }))
      .find((d) => String(d.frontmatter?.id ?? '') === String(layoutId));
    layoutCache.set(layoutId, hit ?? null);
  }
  return layoutCache.get(layoutId);
}

function roleIndexMap(rows) {
  const counts = new Map();
  return rows.slice().sort((a, b) => num(a.n) - num(b.n)).map((row) => {
    const role = String(row.role ?? '').trim().toLowerCase();
    const i = (counts.get(role) ?? 0) + 1;
    counts.set(role, i);
    return { row, role, key: `${role}:${i}` };
  });
}

/**
 * Route C variant: replace master placeholder text with slide text, by (role, index).
 * @returns {object|null} null when the document is not bound to a master
 */
export function findAndReplaceForSlide(doc, layoutCache = new Map()) {
  const fm = doc.frontmatter ?? {};
  const layoutId = fm.layout ?? fm.layout_id ?? null;
  if (!layoutId) return null;
  const master = masterPlaceholders(layoutId, layoutCache);
  const masterByKey = new Map(
    master ? roleIndexMap(elementRows(master).rows).map((e) => [e.key, e.row]) : [],
  );
  const replacements = [];
  for (const entry of roleIndexMap(elementRows(doc).rows)) {
    if (!isTextRole(entry.role)) continue;
    const find = masterByKey.get(entry.key)?.text ?? '';
    replacements.push({
      role_index: entry.key,
      find: String(find ?? ''),
      replace: textOf(entry.row),
    });
  }
  return {
    master: {
      layout_id: String(layoutId),
      family_page: fm.family_page ?? master?.frontmatter?.canva_page_id ?? null,
    },
    replacements,
  };
}

/** Full ops document for one hybrid MD file. */
export function opsDocument(doc, layoutCache = new Map()) {
  const ops = opsForDoc(doc);
  const out = {
    page: { width: PAGE_W, height: PAGE_H, title: pageLabel(doc) },
    operations: ops,
    chunks: chunkOps(ops),
  };
  const far = findAndReplaceForSlide(doc, layoutCache);
  if (far) out.find_and_replace = far;
  return out;
}

export function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  let files;
  let defaultOut = path.join('build', 'canva-ops');

  if (opts.deck) {
    const slug = String(opts.deck);
    files = walk(path.join(REPO_ROOT, 'presentations', slug, 'slides'), '.md');
    if (!files.length) throw new Error(`no slides found for deck "${slug}"`);
    defaultOut = path.join('presentations', slug, 'build', 'canva-ops');
  } else if (opts._.length) {
    files = opts._.map((f) => (path.isAbsolute(f) ? f : path.join(process.cwd(), f)));
  } else {
    files = walk(path.join(REPO_ROOT, 'layouts'), '.md');
  }

  const outDir = path.isAbsolute(opts.out ?? '')
    ? opts.out
    : path.join(REPO_ROOT, opts.out ?? defaultOut);
  const layoutCache = new Map();
  const written = [];
  for (const f of files) {
    const doc = parseHybrid(f, { strict: false });
    const file = path.join(outDir, `${docId(doc)}.json`);
    writeJson(file, opsDocument(doc, layoutCache));
    written.push(file);
    console.log(`wrote ${rel(file)}`);
  }
  console.log(`${written.length} ops file${written.length === 1 ? '' : 's'} written`);
  return written;
}

if (isMain(import.meta.url)) {
  try {
    main();
  } catch (err) {
    console.error(`build-canva-ops: ${err.message}`);
    process.exit(1);
  }
}
