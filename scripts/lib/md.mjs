// scripts/lib/md.mjs — hybrid Markdown (flat frontmatter + body tables) parse/serialize,
// plus the small shared helpers every emitter needs (vocab, schemas, fonts, file IO).
//
// Contract (docs/PLAN.md § Hybrid MD formats):
//   frontmatter: flat YAML only (scalars and flat lists, never maps)
//   element table columns: n | role | x | y | w | h | font | weight | size | lh | align | maxChars | binds | text
//   page: 1920 x 1080

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import YAML from 'yaml';

export const PAGE_W = 1920;
export const PAGE_H = 1080;

/** Canonical element-table columns, in contract order. */
export const ELEMENT_COLUMNS = [
  'n', 'role', 'x', 'y', 'w', 'h', 'font', 'weight',
  'size', 'lh', 'align', 'maxChars', 'binds', 'text',
];

/** Columns coerced to numbers when the cell looks numeric. */
export const NUMERIC_COLUMNS = new Set([
  'n', 'x', 'y', 'w', 'h', 'size', 'lh', 'maxChars', 'weight', 'confidence', 'index', 'slide_no',
]);

/** Roles that hold no text and therefore contribute nothing to text_capacity_chars. */
export const NON_TEXT_ROLES = new Set([
  'shape', 'divider', 'image', 'picture', 'chart', 'table', 'diagram', 'media',
]);

/** Roles rendered as a gray placeholder box with a centered label. */
export const PLACEHOLDER_ROLES = new Set([
  'image', 'picture', 'chart', 'table', 'diagram', 'media',
]);

export const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

export class HybridParseError extends Error {
  constructor(message, { file, keys = [], line = null } = {}) {
    super(message);
    this.name = 'HybridParseError';
    this.file = file;
    this.keys = keys;
    this.line = line;
  }
}

// ---------------------------------------------------------------------------
// file helpers
// ---------------------------------------------------------------------------

/** Read a UTF-8 file, strip a BOM, normalise CRLF to LF. */
export function readText(file) {
  let raw = fs.readFileSync(file, 'utf8');
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  return raw.replace(/\r\n?/g, '\n');
}

/** Write UTF-8 / LF / no BOM, creating parent directories. */
export function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, String(text).replace(/\r\n?/g, '\n'), { encoding: 'utf8' });
  return file;
}

export function readJson(file) {
  return JSON.parse(readText(file));
}

export function writeJson(file, value) {
  return writeText(file, JSON.stringify(value, null, 2) + '\n');
}

const SKIP_DIRS = new Set(['node_modules', '.git', '.playwright', 'build']);

/**
 * Recursively list files under `dir` with the given extension.
 * @param {string} dir absolute or repo-relative directory
 * @param {string} ext e.g. '.md' ('' = every file)
 * @param {{skip?:Set<string>, includeBuild?:boolean}} [opts]
 * @returns {string[]} absolute paths, sorted
 */
export function walk(dir, ext = '.md', opts = {}) {
  const root = path.isAbsolute(dir) ? dir : path.join(REPO_ROOT, dir);
  const skip = opts.skip ?? SKIP_DIRS;
  const out = [];
  if (!fs.existsSync(root)) return out;
  const stack = [root];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) {
        if (skip.has(e.name)) continue;
        if (e.name === 'build' && opts.includeBuild) stack.push(full);
        else if (!skip.has(e.name)) stack.push(full);
        continue;
      }
      if (!ext || e.name.toLowerCase().endsWith(ext.toLowerCase())) out.push(full);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

/** Repo-relative POSIX path, for compact reports. */
export function rel(file) {
  return path.relative(REPO_ROOT, path.resolve(file)).split(path.sep).join('/');
}

// ---------------------------------------------------------------------------
// table parsing
// ---------------------------------------------------------------------------

function splitRow(line) {
  const s = line.trim();
  const cells = [];
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\' && s[i + 1] === '|') { cur += '|'; i++; continue; }
    if (ch === '|') { cells.push(cur); cur = ''; continue; }
    cur += ch;
  }
  cells.push(cur);
  if (s.startsWith('|')) cells.shift();
  if (/\|$/.test(s) && !/\\\|$/.test(s)) cells.pop();
  return cells.map((c) => c.trim());
}

function isDelimiterRow(line) {
  if (!line || line.indexOf('|') === -1) return false;
  const cells = splitRow(line);
  if (!cells.length) return false;
  return cells.every((c) => /^:?-{1,}:?$/.test(c.trim()));
}

function alignmentOf(cell) {
  const c = cell.trim();
  if (c.startsWith(':') && c.endsWith(':')) return 'center';
  if (c.endsWith(':')) return 'right';
  if (c.startsWith(':')) return 'left';
  return null;
}

function canonicalHeader(name) {
  const hit = ELEMENT_COLUMNS.find((c) => c.toLowerCase() === name.trim().toLowerCase());
  return hit ?? name.trim();
}

function coerceCell(column, value) {
  if (!NUMERIC_COLUMNS.has(column)) return value;
  if (value === '' || value == null) return value;
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(value) ? Number(value) : value;
}

/**
 * Tolerant GFM pipe-table parser.
 * @param {string[]} lines
 * @param {number} startIdx index of the header row inside `lines`
 * @param {number} lineOffset absolute line number (1-based) of lines[0]
 * @returns {{rows:object[], columns:string[], align:(string|null)[], end:number, lines:number[]}}
 */
export function parseTable(lines, startIdx, lineOffset = 1) {
  const columns = splitRow(lines[startIdx]).map(canonicalHeader);
  const align = splitRow(lines[startIdx + 1]).map(alignmentOf);
  const rows = [];
  const rowLines = [];
  let i = startIdx + 2;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) break;
    if (line.indexOf('|') === -1) break;
    const cells = splitRow(line);
    const row = {};
    columns.forEach((col, ci) => {
      row[col] = coerceCell(col, cells[ci] === undefined ? '' : cells[ci]);
    });
    if (cells.length > columns.length) {
      row.__extra = cells.slice(columns.length);
    }
    rows.push(row);
    rowLines.push(lineOffset + i);
  }
  return { rows, columns, align, end: i, lines: rowLines };
}

function escapeCell(value) {
  if (value == null) return '';
  return String(value).replace(/\r?\n/g, '\\n').replace(/\|/g, '\\|');
}

/** Re-emit a table with aligned columns. */
export function serializeTable(rows, columns) {
  const cols = columns && columns.length
    ? columns.slice()
    : Array.from(rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => { if (!k.startsWith('__')) set.add(k); });
      return set;
    }, new Set()));
  const body = rows.map((r) => cols.map((c) => escapeCell(r[c])));
  const widths = cols.map((c, i) => Math.max(
    c.length,
    3,
    ...body.map((cells) => cells[i].length),
  ));
  const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));
  const out = [];
  out.push('| ' + cols.map((c, i) => pad(c, widths[i])).join(' | ') + ' |');
  out.push('|' + widths.map((w) => '-'.repeat(w + 2)).join('|') + '|');
  for (const cells of body) {
    out.push('| ' + cells.map((c, i) => pad(c, widths[i])).join(' | ') + ' |');
  }
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// frontmatter
// ---------------------------------------------------------------------------

const YAML_ENGINE = {
  parse: (s) => YAML.parse(s) ?? {},
  stringify: (o) => YAML.stringify(o),
};

function isScalar(v) {
  return v === null || ['string', 'number', 'boolean'].includes(typeof v) || v instanceof Date;
}

/**
 * Flat-frontmatter rule (CLAUDE.md hard rule 2): scalars and flat lists only.
 * @returns {string[]} offending keys (empty when flat)
 */
export function findNestedKeys(frontmatter) {
  const bad = [];
  for (const [k, v] of Object.entries(frontmatter ?? {})) {
    if (isScalar(v)) continue;
    if (Array.isArray(v)) {
      if (v.every(isScalar)) continue;
      bad.push(k);
      continue;
    }
    bad.push(k);
  }
  return bad;
}

export function assertFlatFrontmatter(frontmatter, file) {
  const bad = findNestedKeys(frontmatter);
  if (bad.length) {
    throw new HybridParseError(
      `nested frontmatter is not allowed (flat scalars and flat lists only); offending key${bad.length > 1 ? 's' : ''}: ${bad.join(', ')}`,
      { file, keys: bad },
    );
  }
  return true;
}

/** Line number (1-based) of each top-level frontmatter key. */
function frontmatterKeyLines(raw) {
  const lines = raw.split('\n');
  const map = {};
  if (lines[0]?.trim() !== '---') return map;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') break;
    const m = /^([A-Za-z_][A-Za-z0-9_.-]*)\s*:/.exec(lines[i]);
    if (m) map[m[1]] = i + 1;
  }
  return map;
}

const ALWAYS_QUOTE_KEY = /(^id$|_id$|^uid$)/;

function needsQuote(s) {
  if (s === '') return true;
  if (/^\s|\s$/.test(s)) return true;
  if (/^(true|false|yes|no|on|off|null|~)$/i.test(s)) return true;
  if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) return true;
  if (/[:#\n"']/.test(s) && !/^[^:#]*$/.test(s)) return true;
  if (/^[-?[\]{}&*!|>%@`,]/.test(s)) return true;
  if (/:\s/.test(s) || /\s#/.test(s)) return true;
  return false;
}

function yamlScalar(value, key = '') {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value);
  if (ALWAYS_QUOTE_KEY.test(key) || needsQuote(s)) return JSON.stringify(s);
  return s;
}

/** Serialize flat frontmatter (no maps) with an explicit key order. */
export function serializeFrontmatter(frontmatter, keyOrder = null) {
  const keys = orderKeys(Object.keys(frontmatter ?? {}), keyOrder);
  const lines = ['---'];
  for (const k of keys) {
    const v = frontmatter[k];
    if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map((item) => yamlScalar(item, k)).join(', ')}]`);
    } else {
      const s = yamlScalar(v, k);
      lines.push(s === '' ? `${k}:` : `${k}: ${s}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

function orderKeys(keys, keyOrder) {
  if (!keyOrder || !keyOrder.length) return keys;
  const rank = new Map(keyOrder.map((k, i) => [k, i]));
  const known = keys.filter((k) => rank.has(k)).sort((a, b) => rank.get(a) - rank.get(b));
  const rest = keys.filter((k) => !rank.has(k));
  return [...known, ...rest];
}

/**
 * Key order declared by spec/schema.md, when that file is parseable.
 * Recognises `| \`key\` | …` table rows and `key:` lines inside fenced blocks.
 * @returns {string[]|null}
 */
export function loadKeyOrder(specFile = path.join(REPO_ROOT, 'spec', 'schema.md')) {
  const file = path.isAbsolute(specFile) ? specFile : path.join(REPO_ROOT, specFile);
  if (!fs.existsSync(file)) return null;
  let raw;
  try {
    raw = readText(file);
  } catch {
    return null;
  }
  const keys = [];
  const push = (k) => { if (k && !keys.includes(k)) keys.push(k); };
  for (const line of raw.split('\n')) {
    let m = /^\|\s*`?([a-z][a-z0-9_]*)`?\s*\|/i.exec(line);
    if (m) { push(m[1]); continue; }
    m = /^\s{0,4}([a-z][a-z0-9_]*)\s*:/i.exec(line);
    if (m) push(m[1]);
  }
  return keys.length ? keys : null;
}

// ---------------------------------------------------------------------------
// parseHybrid / serializeHybrid
// ---------------------------------------------------------------------------

/**
 * Parse a hybrid MD file.
 * @param {string} file
 * @param {{strict?:boolean, raw?:string}} [opts] strict (default true) throws on nested frontmatter
 * @returns {{file:string, raw:string, frontmatter:object, body:string, intro:string,
 *            headings:{level:number,text:string}[], sections:Record<string,string>,
 *            tables:Record<string,object[]>, tableMeta:Record<string,object>,
 *            frontmatterLines:Record<string,number>, bodyOffset:number, problems:object[]}}
 */
export function parseHybrid(file, opts = {}) {
  const strict = opts.strict !== false;
  const abs = path.isAbsolute(file) ? file : path.join(REPO_ROOT, file);
  const raw = opts.raw != null ? String(opts.raw).replace(/\r\n?/g, '\n') : readText(abs);
  const parsed = matter(raw, { engines: { yaml: YAML_ENGINE }, language: 'yaml' });
  const frontmatter = parsed.data ?? {};
  const problems = [];
  const bad = findNestedKeys(frontmatter);
  if (bad.length) {
    const msg = `nested frontmatter is not allowed (flat scalars and flat lists only); offending key${bad.length > 1 ? 's' : ''}: ${bad.join(', ')}`;
    if (strict) throw new HybridParseError(msg, { file: abs, keys: bad });
    problems.push({ kind: 'nested_frontmatter', keys: bad, message: msg });
  }

  const fmLines = frontmatterKeyLines(raw);
  // number of lines consumed by the frontmatter block (so body line numbers stay absolute)
  const bodyOffset = raw.startsWith('---')
    ? raw.split('\n').findIndex((l, i) => i > 0 && l.trim() === '---') + 1
    : 0;

  const body = parsed.content.replace(/^\n+/, '');
  const leading = parsed.content.length - parsed.content.replace(/^\n+/, '').length;
  const lineOffset = bodyOffset + leading + 1;

  const lines = body.split('\n');
  const headings = [];
  const sections = {};
  const tables = {};
  const tableMeta = {};
  let introLines = [];
  let current = null;
  let prose = [];

  const flush = () => {
    if (current == null) { introLines = introLines.concat([]); return; }
    sections[current] = prose.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (h) {
      flush();
      let key = h[2].trim();
      let n = 2;
      while (Object.prototype.hasOwnProperty.call(sections, key)) key = `${h[2].trim()} (${n++})`;
      headings.push({ level: h[1].length, text: h[2].trim(), key });
      sections[key] = '';
      current = key;
      prose = [];
      continue;
    }
    if (line.indexOf('|') !== -1 && isDelimiterRow(lines[i + 1] ?? '')) {
      const t = parseTable(lines, i, lineOffset);
      const key = current ?? '__intro';
      if (!tables[key]) {
        tables[key] = t.rows;
        tableMeta[key] = { columns: t.columns, align: t.align, lines: t.lines };
      } else {
        let k2 = key;
        let n = 2;
        while (tables[k2]) k2 = `${key} (table ${n++})`;
        tables[k2] = t.rows;
        tableMeta[k2] = { columns: t.columns, align: t.align, lines: t.lines };
      }
      i = t.end - 1;
      continue;
    }
    if (current == null) introLines.push(line);
    else prose.push(line);
  }
  flush();

  return {
    file: abs,
    raw,
    frontmatter,
    body,
    intro: introLines.join('\n').trim(),
    headings,
    sections,
    tables,
    tableMeta,
    frontmatterLines: fmLines,
    bodyOffset,
    problems,
  };
}

/**
 * Serialize a hybrid MD document. Frontmatter keys follow `keyOrder`
 * (spec/schema.md order when parseable, else insertion order); tables are
 * re-emitted with aligned columns.
 */
export function serializeHybrid(doc, opts = {}) {
  const keyOrder = opts.keyOrder !== undefined ? opts.keyOrder : loadKeyOrder();
  const headings = doc.headings ?? Object.keys(doc.sections ?? {}).map((text) => ({ level: 2, text, key: text }));
  const out = [serializeFrontmatter(doc.frontmatter ?? {}, keyOrder), ''];
  if (doc.intro) out.push(doc.intro, '');
  if (doc.tables && doc.tables.__intro) {
    out.push(serializeTable(doc.tables.__intro, doc.tableMeta?.__intro?.columns), '');
  }
  for (const h of headings) {
    const key = h.key ?? h.text;
    out.push(`${'#'.repeat(h.level)} ${h.text}`, '');
    const text = (doc.sections?.[key] ?? '').trim();
    if (text) out.push(text, '');
    const rows = doc.tables?.[key];
    if (rows) out.push(serializeTable(rows, doc.tableMeta?.[key]?.columns), '');
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n*$/, '\n');
}

// ---------------------------------------------------------------------------
// spec loading: vocab, schemas, fonts
// ---------------------------------------------------------------------------

function vocabValues(json) {
  const out = new Set();
  const take = (entry) => {
    if (typeof entry === 'string') out.add(entry);
    else if (entry && typeof entry === 'object' && entry.value != null) out.add(String(entry.value));
  };
  if (Array.isArray(json)) json.forEach(take);
  else if (json && typeof json === 'object') {
    const list = json.values ?? json.terms ?? json.concepts ?? json.items ?? json.enum ?? null;
    if (Array.isArray(list)) list.forEach(take);
    else {
      for (const [k, v] of Object.entries(json)) {
        if (k.startsWith('$') || ['scheme', 'inScheme', 'title', 'description', 'version', 'sources'].includes(k)) continue;
        if (v && typeof v === 'object' && !Array.isArray(v)) out.add(k);
        else if (typeof v === 'string') out.add(k);
      }
    }
  }
  return out;
}

/**
 * Load controlled vocabularies.
 * @returns {Map<string, Set<string>>} vocab name (file basename) → allowed values
 */
export function loadVocab(dir = 'spec/vocab') {
  const root = path.isAbsolute(dir) ? dir : path.join(REPO_ROOT, dir);
  const map = new Map();
  if (!fs.existsSync(root)) return map;
  for (const file of walk(root, '.json')) {
    const name = path.basename(file, '.json');
    try {
      map.set(name, vocabValues(readJson(file)));
    } catch {
      map.set(name, new Set());
    }
  }
  return map;
}

/**
 * Load JSON Schemas keyed by entity name (`layout.schema.json` → `layout`).
 * @returns {Map<string, object>}
 */
export function loadSchemas(dir = 'spec/schema') {
  const root = path.isAbsolute(dir) ? dir : path.join(REPO_ROOT, dir);
  const map = new Map();
  if (!fs.existsSync(root)) return map;
  for (const file of walk(root, '.json')) {
    const name = path.basename(file).replace(/\.schema\.json$|\.json$/i, '');
    try {
      map.set(name, readJson(file));
    } catch {
      /* a malformed schema is reported by validate, not here */
    }
  }
  return map;
}

/**
 * Font registry (`spec/fonts.json`). Accepts an array, `{fonts:[…]}`, or a map keyed by family.
 * @returns {Map<string, object>|null} null when the registry is absent
 */
export function loadFonts(file = 'spec/fonts.json') {
  const abs = path.isAbsolute(file) ? file : path.join(REPO_ROOT, file);
  if (!fs.existsSync(abs)) return null;
  let json;
  try {
    json = readJson(abs);
  } catch {
    return null;
  }
  const list = Array.isArray(json) ? json : (json.fonts ?? json.families ?? null);
  const map = new Map();
  if (Array.isArray(list)) {
    for (const f of list) {
      const family = f.family ?? f.name ?? f.value;
      if (family) map.set(String(family), f);
    }
  } else if (json && typeof json === 'object') {
    for (const [family, f] of Object.entries(json)) {
      if (family.startsWith('$')) continue;
      if (f && typeof f === 'object') map.set(family, { family, ...f });
    }
  }
  return map;
}

export const DEFAULT_FALLBACK = 'Helvetica Neue, Arial';

/** `font-family` value: the named family, its registry fallback, then sans-serif. */
export function fontStack(family, fonts) {
  const fam = String(family ?? '').trim() || 'Inter';
  const entry = fonts?.get?.(fam);
  const fallback = (entry?.canva_fallback ?? entry?.fallback ?? DEFAULT_FALLBACK).toString().trim();
  const parts = [`'${fam.replace(/'/g, '')}'`];
  for (const f of fallback.split(',').map((s) => s.trim()).filter(Boolean)) {
    if (f.toLowerCase() === 'sans-serif' || f.toLowerCase() === 'serif') continue;
    if (f.toLowerCase() === fam.toLowerCase()) continue; // registry may name the family as its own fallback
    parts.push(/\s/.test(f) ? `'${f.replace(/'/g, '')}'` : f);
  }
  parts.push('sans-serif');
  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// element helpers shared by the emitters
// ---------------------------------------------------------------------------

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/**
 * Text roles carry characters and are the only roles that count toward text_capacity_chars.
 * When `spec/vocab/element_role.json` is available the set comes from it (values whose
 * `broader` is `text_role`); otherwise the built-in NON_TEXT_ROLES rule applies.
 * @param {string} role
 * @param {Set<string>|null} [textRoles] from loadTextRoles()
 */
export function isTextRole(role, textRoles = null) {
  const r = String(role ?? '').trim().toLowerCase();
  if (textRoles && textRoles.size) return textRoles.has(r);
  return !NON_TEXT_ROLES.has(r);
}

/**
 * Roles whose `broader` is `text_role` in the element_role vocabulary.
 * @returns {Set<string>|null} null when the vocabulary is not present
 */
export function loadTextRoles(dir = 'spec/vocab') {
  const root = path.isAbsolute(dir) ? dir : path.join(REPO_ROOT, dir);
  const file = path.join(root, 'element_role.json');
  if (!fs.existsSync(file)) return null;
  let json;
  try {
    json = readJson(file);
  } catch {
    return null;
  }
  const list = Array.isArray(json) ? json : (json.values ?? json.terms ?? json.concepts ?? null);
  if (!Array.isArray(list)) return null;
  const out = new Set();
  for (const entry of list) {
    if (entry && typeof entry === 'object' && String(entry.broader ?? '') === 'text_role' && entry.value) {
      out.add(String(entry.value).toLowerCase());
    }
  }
  return out.size ? out : null;
}

/**
 * Parse a shape spec string such as `fill:#E5E5E5 r:16 stroke:#999 sw:2`.
 * @returns {{fill:string, radius:number, stroke:string|null, strokeWidth:number, label:string}}
 */
export function parseShapeSpec(spec) {
  const s = String(spec ?? '').trim();
  const out = { fill: '#E5E5E5', radius: 0, stroke: null, strokeWidth: 0, label: '' };
  const rest = [];
  for (const token of s.split(/\s+/).filter(Boolean)) {
    const m = /^([a-zA-Z_]+):(.*)$/.exec(token);
    if (!m) { rest.push(token); continue; }
    const key = m[1].toLowerCase();
    const val = m[2];
    if (key === 'fill' || key === 'bg' || key === 'background') out.fill = val;
    else if (key === 'r' || key === 'radius') out.radius = Number(val) || 0;
    else if (key === 'stroke' || key === 'border') out.stroke = val;
    else if (key === 'sw' || key === 'strokewidth') out.strokeWidth = Number(val) || 0;
    else if (key === 'label') out.label = val.replace(/_/g, ' ');
    else rest.push(token);
  }
  if (!out.label && rest.length) out.label = rest.join(' ');
  if (out.stroke && !out.strokeWidth) out.strokeWidth = 1;
  return out;
}

/**
 * Split a text cell into bullet lines when it carries `- ` items separated by
 * literal `\n` (table cells cannot hold real newlines) or `<br>`.
 * @returns {string[]|null} bullet texts, or null when the cell is not a bullet list
 */
export function bulletLines(text) {
  const s = String(text ?? '');
  if (!s) return null;
  const parts = s.split(/\\n|<br\s*\/?>|\n/).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  if (!parts.every((p) => /^[-*•]\s+/.test(p))) return null;
  return parts.map((p) => p.replace(/^[-*•]\s+/, '').trim());
}

/** Split a text cell into display lines (no bullet requirement). */
export function textLines(text) {
  return String(text ?? '').split(/\\n|<br\s*\/?>|\n/).map((p) => p.trim());
}

export function num(value, fallback = 0) {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  return Number.isFinite(n) ? n : fallback;
}

/** The element table of a parsed hybrid doc (the `## Elements` table, or the first table with a role column). */
export function elementRows(doc) {
  const tables = doc.tables ?? {};
  const direct = Object.keys(tables).find((k) => /^elements?\b/i.test(k));
  if (direct) return { key: direct, rows: tables[direct], meta: doc.tableMeta?.[direct] };
  for (const [k, rows] of Object.entries(tables)) {
    if (rows.length && Object.prototype.hasOwnProperty.call(rows[0], 'role')) {
      return { key: k, rows, meta: doc.tableMeta?.[k] };
    }
  }
  return { key: null, rows: [], meta: null };
}

/** Sum of maxChars over text roles — the derived `text_capacity_chars`. */
export function textCapacity(rows, textRoles = null) {
  return rows.reduce((sum, r) => (isTextRole(r.role, textRoles) ? sum + num(r.maxChars, 0) : sum), 0);
}

/** Switches that never take a value, so a following positional is not swallowed. */
export const BOOLEAN_FLAGS = new Set([
  'json', 'hygiene_only', 'no_hygiene', 'help', 'quiet', 'verbose', 'dry_run', 'force',
]);

/**
 * Minimal argv parser: `--flag`, `--key value`, `--key=value`, positionals.
 * Keys in BOOLEAN_FLAGS (or passed in `booleans`) never consume the next token.
 */
export function parseArgs(argv = process.argv.slice(2), booleans = BOOLEAN_FLAGS) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, inline] = a.slice(2).split('=');
      const key = k.replace(/-/g, '_');
      if (inline !== undefined) opts[key] = inline;
      else if (booleans.has(key)) opts[key] = true;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) opts[key] = argv[++i];
      else opts[key] = true;
    } else {
      opts._.push(a);
    }
  }
  return opts;
}

/** True when this module file is the process entry point. */
export function isMain(metaUrl) {
  if (!process.argv[1]) return false;
  return path.resolve(fileURLToPath(metaUrl)) === path.resolve(process.argv[1]);
}
