#!/usr/bin/env node
// spec/vocab/check-vocab.mjs — the vocabulary consistency gate.
//
// Four checks, all of which must pass:
//   1. Every spec/vocab/*.json file is well formed: the eight SKOS keys, unique `value`s,
//      unique `altLabels` that never shadow a value, and a `broader` that resolves.
//   2. Every id cited in backticks in the spec prose files resolves to a vocabulary value,
//      to an id the prose itself defines (flow slot names, font pairing ids), or to the
//      ALLOWLIST below. Anything else that *looks* like an id is reported.
//   3. Every inline `enum` in spec/schema/*.json equals the vocabulary named in its
//      `$comment` ("Source of truth: spec/vocab/<name>.json"), after the subset and extra
//      rules the node's own `description` declares.
//   4. Cross-file agreements: purpose <-> flow_template <-> flows.md, and taxonomy.md
//      <-> archetype.json (the taxonomy is the authority for archetype ids).
//
// Run: node spec/vocab/check-vocab.mjs        (exit 0 clean, exit 1 on any finding)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VOCAB_DIR = path.dirname(fileURLToPath(import.meta.url));
const SPEC_DIR = path.dirname(VOCAB_DIR);
const SCHEMA_DIR = path.join(SPEC_DIR, 'schema');

/** Prose files whose backticked ids are checked against the vocabulary. */
const PROSE = ['taxonomy.md', 'flows.md', 'rubrics.md', 'pairings.md', 'ontology.md', 'schema.md'];
const VOCAB_PROSE = ['README.md'];

/** A backticked span is treated as an id when it is lowercase kebab/snake with >= 2 segments. */
const ID_RE = /^[a-z0-9]+(?:[-_][a-z0-9]+)+$/;

/**
 * Tokens that look like ids but are not vocabulary: frontmatter and schema keys, file and
 * script names, inline enums that deliberately have no vocab file, and third-party names.
 * Keep this list short and explained; a term that belongs in a vocabulary goes in the
 * vocabulary, not here.
 */
const ALLOWLIST = new Set([
  // --- frontmatter and schema keys (spec/schema.md, spec/ontology.md) ---
  'accepts_schema', 'accepts_unit_types', 'body_kind', 'brand_kit_id', 'bundle_id',
  'canva_asset_id', 'canva_design_id', 'canva_fallback', 'canva_locators', 'canva_native',
  'canva_ops', 'canva_page_id', 'canvas_h', 'canvas_w', 'change_request', 'changed_keys',
  'content_generation', 'content_public', 'content_shape', 'delivery_mode',
  'detected_archetype', 'detected_family', 'evidence_kind', 'extracted_from',
  'fallback_weight_map', 'family_deck', 'family_page', 'fill_status', 'flow_role',
  'flow_template', 'follows_well', 'fonts_detected', 'fonts_native', 'fonts_native_required',
  'has_number', 'info_units', 'layout_id', 'layout_ids', 'layout_sequence', 'length_minutes',
  'library_version', 'license_note', 'max_items', 'min_items', 'must_include',
  'open_questions', 'optical_size_note', 'overflow_count', 'polish_cost', 'precedes_well',
  'redline_status', 'routes_supported', 'slide_count', 'slide_function', 'slide_no',
  'slots_chart', 'slots_image', 'slots_table', 'source_type', 'speaker_notes', 'style_hint',
  'target_h', 'target_pages', 'target_slides', 'target_w', 'text_capacity_chars',
  'unit_count', 'unit_type', 'unplaced_units', 'used_by', 'weights_used',

  // --- inline enums that deliberately have no vocab file (spec/schema.md §Deliberate departures) ---
  'text-heavy', 'chart_png', 'all-rights-reserved',

  // --- scripts, skills, commands and Canva Connect operations ---
  'deck-decompose', 'bundle-upload', 'export-bundle', 'import-bundle', 'check-vocab',
  'build-html', 'build-canva-ops', 'build-dc', 'slide-redline', 'layout-intake', 'ingest-html',
  'replace_speaker_notes', 'upload-asset-from-url',

  // --- identifier-casing names used by the "Naming convention" paragraphs ---
  'kebab-case', 'snake_case',

  // --- third-party page-type names cited in spec/taxonomy.md §Sources ---
  'presentation_core', 'editorial_bleed',

  // --- planner-internal prose terms ---
  'body_budget', 'so-what', 'read-decks', 'lower-third',
]);

const errors = [];
const fail = (m) => errors.push(m);

// ---------------------------------------------------------------- 1. vocabularies
const REQUIRED_KEYS = ['value', 'prefLabel', 'altLabels', 'definition', 'broader', 'inScheme', 'examples', 'sources'];

const vocab = new Map(); // name -> entries[]
for (const file of fs.readdirSync(VOCAB_DIR).filter((f) => f.endsWith('.json')).sort()) {
  const name = file.replace(/\.json$/, '');
  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(path.join(VOCAB_DIR, file), 'utf8'));
  } catch (e) {
    fail(`vocab/${file}: not valid JSON — ${e.message}`);
    continue;
  }
  if (!Array.isArray(entries)) { fail(`vocab/${file}: top level must be an array`); continue; }
  vocab.set(name, entries);
}

for (const [name, entries] of vocab) {
  const file = `${name}.json`;
  const values = new Set();
  const alts = new Map();
  for (const [i, e] of entries.entries()) {
    const where = `vocab/${file}[${i}]`;
    for (const k of REQUIRED_KEYS) if (!(k in e)) fail(`${where}: missing key \`${k}\``);
    if (typeof e.value !== 'string' || !e.value) { fail(`${where}: empty value`); continue; }
    if (values.has(e.value)) fail(`${where}: duplicate value \`${e.value}\``);
    values.add(e.value);
    if (e.inScheme !== name) fail(`${where} \`${e.value}\`: inScheme \`${e.inScheme}\` != \`${name}\``);
    if (!e.definition) fail(`${where} \`${e.value}\`: empty definition`);
    if (!Array.isArray(e.sources) || !e.sources.length) fail(`${where} \`${e.value}\`: no sources`);
    for (const a of e.altLabels ?? []) {
      if (alts.has(a)) fail(`vocab/${file}: altLabel "${a}" claimed by both \`${alts.get(a)}\` and \`${e.value}\``);
      alts.set(a, e.value);
    }
  }
  for (const e of entries) {
    for (const a of e.altLabels ?? []) {
      if (values.has(a)) fail(`vocab/${file} \`${e.value}\`: altLabel "${a}" shadows a value`);
    }
  }
  // `broader` resolves inside the same file, except archetype.json where it names a family.
  const parents = name === 'archetype'
    ? new Set((vocab.get('family') ?? []).map((e) => e.value))
    : values;
  for (const e of entries) {
    if (e.broader && !parents.has(e.broader)) fail(`vocab/${file} \`${e.value}\`: broader \`${e.broader}\` does not resolve`);
  }
}

const ALL_VALUES = new Set();
for (const entries of vocab.values()) for (const e of entries) ALL_VALUES.add(e.value);

// ---------------------------------------------------------------- 2. prose ids
const read = (f) => fs.readFileSync(f, 'utf8');
const LINES = (t) => t.split(/\r?\n/);

/** Flow slot names are defined by flows.md itself: the first column of every slot table. */
function flowSlotNames(text) {
  const slots = new Set();
  let inTable = false;
  for (const line of LINES(text)) {
    if (/^\|\s*slot\s*\|/.test(line)) { inTable = true; continue; }
    if (!line.startsWith('|')) { inTable = false; continue; }
    if (!inTable) continue;
    const m = line.match(/^\|\s*`([a-z0-9-]+)`\s*\|/);
    if (m) slots.add(m[1]);
  }
  return slots;
}

/** Font pairing ids are defined by pairings.md: the summary table and the role sections. */
function pairingIds(text) {
  const fromTable = new Set();
  for (const m of text.matchAll(/^\|\s*\d+\s*\|\s*`([a-z0-9-]+)`\s*\|/gm)) fromTable.add(m[1]);
  const fromHeadings = new Set();
  for (const m of text.matchAll(/^### \d+\.\s*`([a-z0-9-]+)`/gm)) fromHeadings.add(m[1]);
  for (const id of fromTable) {
    if (!fromHeadings.has(id)) fail(`pairings.md: \`${id}\` is in the summary table but has no "Roles per weight" section`);
  }
  for (const id of fromHeadings) {
    if (!fromTable.has(id)) fail(`pairings.md: \`${id}\` has a "Roles per weight" section but is not in the summary table`);
  }
  return new Set([...fromTable, ...fromHeadings]);
}

const flowsText = read(path.join(SPEC_DIR, 'flows.md'));
const pairingsText = read(path.join(SPEC_DIR, 'pairings.md'));
const LOCAL_IDS = new Set([...flowSlotNames(flowsText), ...pairingIds(pairingsText)]);

const unknown = new Map(); // token -> Set(file)
const proseFiles = [
  ...PROSE.map((f) => path.join(SPEC_DIR, f)),
  ...VOCAB_PROSE.map((f) => path.join(VOCAB_DIR, f)),
];
for (const file of proseFiles) {
  if (!fs.existsSync(file)) { fail(`missing prose file ${file}`); continue; }
  const label = path.relative(SPEC_DIR, file).replace(/\\/g, '/');
  for (const m of read(file).matchAll(/`([^`\n]+)`/g)) {
    const tok = m[1].trim();
    if (!ID_RE.test(tok)) continue;
    if (ALL_VALUES.has(tok) || LOCAL_IDS.has(tok) || ALLOWLIST.has(tok) || vocab.has(tok)) continue;
    if (!unknown.has(tok)) unknown.set(tok, new Set());
    unknown.get(tok).add(label);
  }
}
for (const [tok, files] of [...unknown].sort()) {
  fail(`unknown id \`${tok}\` cited in ${[...files].sort().join(', ')}`);
}

// ---------------------------------------------------------------- 3. schema enums
const SRC = /Source of truth: spec\/vocab\/([a-z_]+)\.json/;
const SUBSET = /[Ss]ubset (?:of spec\/vocab\/[a-z_]+\.json )?with broader ([a-z_]+)/;
const NO_GROUPS = /Group concepts \(broader ""\) are not valid/;

/** The enum a vocab-backed schema node must carry, or null when the node names no vocabulary. */
function expectedEnum(node, inheritedComment) {
  const comment = node.$comment ?? inheritedComment ?? '';
  const m = SRC.exec(comment);
  if (!m) return null;
  const entries = vocab.get(m[1]);
  if (!entries) { fail(`a schema names unknown vocabulary spec/vocab/${m[1]}.json`); return null; }
  let list = entries;
  const desc = node.description ?? '';
  const sub = SUBSET.exec(desc);
  if (sub) list = list.filter((e) => e.broader === sub[1] || (e.examples ?? []).includes(`also in: ${sub[1]}`));
  else if (NO_GROUPS.test(comment)) list = list.filter((e) => e.broader !== '');
  const values = list.map((e) => e.value);
  // A description may name extra literals in double quotes ("auto", "none").
  const extras = [...desc.matchAll(/"([a-z_]+)"/g)].map((x) => x[1]).filter((v) => !values.includes(v));
  return { name: m[1], values: [...values, ...new Set(extras)] };
}

function* enumNodes(node, inherited = null, ptr = '', seen = new Set()) {
  if (!node || typeof node !== 'object' || seen.has(node)) return;
  seen.add(node);
  const here = node.$comment && SRC.test(node.$comment) ? node.$comment : inherited;
  if (Array.isArray(node.enum)) yield [node, inherited, ptr];
  for (const [k, v] of Object.entries(node)) yield* enumNodes(v, here, `${ptr}/${k}`, seen);
}

let checkedEnums = 0;
let inlineEnums = 0;
for (const file of fs.readdirSync(SCHEMA_DIR).filter((f) => f.endsWith('.json')).sort()) {
  const schema = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf8'));
  for (const [node, inherited, ptr] of enumNodes(schema)) {
    const exp = expectedEnum(node, inherited);
    if (!exp) { inlineEnums++; continue; } // no vocab file; spec/schema.md §Deliberate departures
    checkedEnums++;
    if (JSON.stringify(node.enum) === JSON.stringify(exp.values)) continue;
    const missing = exp.values.filter((v) => !node.enum.includes(v));
    const extra = node.enum.filter((v) => !exp.values.includes(v));
    fail(`schema/${file}${ptr}: enum != spec/vocab/${exp.name}.json`
      + (missing.length ? ` — missing ${missing.map((v) => `\`${v}\``).join(', ')}` : '')
      + (extra.length ? ` — unexpected ${extra.map((v) => `\`${v}\``).join(', ')}` : '')
      + (!missing.length && !extra.length ? ' — same values, wrong order' : ''));
  }
}

// ---------------------------------------------------------------- 4. cross-file agreements
// Every purpose names a default flow_template, and flows.md gives it a row that agrees.
const flowValues = new Set((vocab.get('flow_template') ?? []).map((e) => e.value));
const purposes = vocab.get('purpose') ?? [];
const purposeRows = new Map();
for (const m of flowsText.matchAll(/^\|\s*`([a-z_]+)`\s*\|\s*`([a-z0-9_]+)`\s*\|/gm)) {
  purposeRows.set(m[1], m[2]);
}
for (const e of purposes) {
  const named = (e.examples ?? []).map((x) => /^default flow_template:\s*(\S+)/.exec(x)?.[1]).find(Boolean);
  if (!named) fail(`vocab/purpose.json \`${e.value}\`: no "default flow_template: <id>" example`);
  else if (!flowValues.has(named)) fail(`vocab/purpose.json \`${e.value}\`: default flow_template \`${named}\` is not in flow_template.json`);
  if (!purposeRows.has(e.value)) fail(`flows.md: no "Purpose to flow mapping" row for purpose \`${e.value}\``);
  else if (named && purposeRows.get(e.value) !== named) {
    fail(`flows.md: purpose \`${e.value}\` maps to \`${purposeRows.get(e.value)}\`, but purpose.json names \`${named}\``);
  }
}
for (const p of purposeRows.keys()) {
  if (!purposes.some((e) => e.value === p)) fail(`flows.md: purpose \`${p}\` has a row but is not in purpose.json`);
}
// flows.md documents every flow template, once, under its vocabulary id.
for (const v of flowValues) {
  if (!new RegExp(`^## \\d+\\. \`${v}\``, 'm').test(flowsText)) fail(`flows.md: no section for flow_template \`${v}\``);
}
// taxonomy.md is the authority for archetype ids: the two must name the same set.
const taxText = read(path.join(SPEC_DIR, 'taxonomy.md'));
const taxIds = new Set();
let inFamily = false;
for (const line of LINES(taxText)) {
  if (line.startsWith('## ')) inFamily = /^## Family \d+ — `[a-z_]+`/.test(line);
  if (!inFamily) continue;
  const m = line.match(/^\|\s*`([a-z0-9-]+)`\s*\|/);
  if (m) taxIds.add(m[1]);
}
const archetypes = vocab.get('archetype') ?? [];
const archValues = new Set(archetypes.map((e) => e.value));
for (const id of taxIds) {
  if (!archValues.has(id)) fail(`taxonomy.md defines archetype \`${id}\`, absent from vocab/archetype.json`);
}
for (const id of archValues) {
  if (!taxIds.has(id)) fail(`vocab/archetype.json defines \`${id}\`, absent from spec/taxonomy.md`);
}
// Every id in an archetype-bearing column must be an archetype, not merely some vocabulary value:
// taxonomy.md's `follows` / `precedes` columns, and flows.md's "archetypes allowed" column.
for (const line of LINES(taxText)) {
  const m = line.match(/^\|\s*`[a-z0-9-]+`\s*\|(?:[^|]*\|){8}([^|]*)\|([^|]*)\|/);
  if (!m) continue;
  for (const cell of [m[1], m[2]]) {
    for (const t of cell.matchAll(/`([a-z0-9-]+)`/g)) {
      if (!archValues.has(t[1])) fail(`taxonomy.md: follows/precedes names \`${t[1]}\`, not an archetype`);
    }
  }
}
{
  let inTable = false;
  for (const line of LINES(flowsText)) {
    if (/^\|\s*slot\s*\|\s*archetypes allowed\s*\|/.test(line)) { inTable = true; continue; }
    if (!line.startsWith('|')) { inTable = false; continue; }
    if (!inTable) continue;
    const cells = line.split('|').slice(1, -1);
    if (cells.length < 2 || /^\s*-+\s*$/.test(cells[0])) continue;
    for (const t of cells[1].matchAll(/`([a-z0-9-]+)`/g)) {
      if (!archValues.has(t[1])) fail(`flows.md: slot \`${cells[0].trim().replace(/`/g, '')}\` allows \`${t[1]}\`, not an archetype`);
    }
  }
}

// Archetype ids are kebab-case (they double as layout file-name stems); everything else snake_case,
// except delivery_mode and brand, whose values are kebab by decision (spec/vocab/README.md §Naming).
const KEBAB_VOCABS = new Set(['archetype', 'delivery_mode', 'brand']);
for (const [name, entries] of vocab) {
  const want = KEBAB_VOCABS.has(name) ? /^[a-z0-9]+(?:-[a-z0-9]+)*$/ : /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
  for (const e of entries) {
    if (typeof e.value === 'string' && !want.test(e.value)) {
      fail(`vocab/${name}.json \`${e.value}\`: wrong case for this vocabulary (${KEBAB_VOCABS.has(name) ? 'kebab-case' : 'snake_case'})`);
    }
  }
}

// ---------------------------------------------------------------- report
console.log(`vocabularies (${vocab.size}):`);
for (const [name, entries] of vocab) console.log(`  ${String(entries.length).padStart(3)}  ${name}`);
console.log(`prose files checked: ${[...PROSE, ...VOCAB_PROSE.map((f) => 'vocab/' + f)].join(', ')}`);
console.log(`ids accepted from the prose itself: ${LOCAL_IDS.size} (flow slots + font pairings) · allowlisted: ${ALLOWLIST.size}`);
console.log(`schema enums: ${checkedEnums} checked against a vocabulary, ${inlineEnums} inline with no vocab file`);
console.log(`archetype ids: ${taxIds.size} in taxonomy.md, ${archValues.size} in archetype.json`);
if (errors.length) {
  console.error(`\n${errors.length} problem${errors.length === 1 ? '' : 's'}:`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log('\nOK — vocabularies, prose ids and schema enums agree.');
