import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseHybrid, serializeHybrid, serializeTable, findNestedKeys, assertFlatFrontmatter,
  textCapacity, elementRows, bulletLines, parseShapeSpec, fontStack, loadFonts,
} from '../lib/md.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(HERE, 'fixtures', 'L999-fixture.md');

test('round trip: parse -> serialize -> parse is stable', () => {
  const a = parseHybrid(FIXTURE);
  const text = serializeHybrid(a, { keyOrder: null });
  const b = parseHybrid('roundtrip.md', { raw: text });
  assert.deepEqual(b.frontmatter, a.frontmatter);
  assert.deepEqual(b.tables, a.tables);
  assert.deepEqual(b.sections, a.sections);
  assert.deepEqual(b.headings.map((h) => h.text), a.headings.map((h) => h.text));
  // and a second pass is byte-identical
  assert.equal(serializeHybrid(b, { keyOrder: null }), text);
});

test('round trip: no BOM, LF only, trailing newline', () => {
  const doc = parseHybrid(FIXTURE);
  const text = serializeHybrid(doc, { keyOrder: null });
  assert.equal(text.charCodeAt(0), '-'.charCodeAt(0));
  assert.equal(text.includes('\r'), false);
  assert.ok(text.endsWith('\n'));
});

test('frontmatter: flat lists and scalars survive, nested maps are rejected', () => {
  const doc = parseHybrid(FIXTURE);
  assert.deepEqual(doc.frontmatter.fonts, ['Inter', 'Open Sans']);
  assert.equal(doc.frontmatter.text_capacity_chars, 274);
  assert.deepEqual(doc.frontmatter.canva_locators, []);
  assert.equal(doc.frontmatter.fonts_native, true);
  assert.deepEqual(findNestedKeys(doc.frontmatter), []);

  // empty scalars round trip as null, empty lists as []
  const nullRaw = ['---', 'id: "L001"', 'canva_page_id:', 'locators: []', '---', ''].join('\n');
  const nulls = parseHybrid('n.md', { raw: nullRaw });
  assert.equal(nulls.frontmatter.canva_page_id, null);
  assert.deepEqual(nulls.frontmatter.locators, []);
  const back = parseHybrid('n2.md', { raw: serializeHybrid(nulls, { keyOrder: null }) });
  assert.deepEqual(back.frontmatter, nulls.frontmatter);

  const raw = '---\nid: "L001"\nnested:\n  a: 1\nlist_of_maps:\n  - a: 1\n---\n\n# x\n';
  assert.deepEqual(findNestedKeys(parseHybrid('x.md', { raw, strict: false }).frontmatter).sort(),
    ['list_of_maps', 'nested']);
  assert.throws(() => parseHybrid('x.md', { raw }), (e) => {
    assert.match(e.message, /nested frontmatter/);
    assert.match(e.message, /nested/);
    return true;
  });
  assert.throws(() => assertFlatFrontmatter({ a: { b: 1 } }, 'x.md'), /offending key: a/);
});

test('table parser: escaped pipes, empty cells, ragged rows, alignment row', () => {
  const raw = [
    '---', 'id: "T1"', '---', '',
    '## Elements', '',
    '| n | role | text | maxChars |',
    '|:-:|------|------|---------:|',
    '| 1 | title | a \\| b | 10 |',
    '| 2 | body |  | 20 |',
    '| 3 | caption | trailing pipe missing | 30',
    '  4 | eyebrow | no outer pipes | 40  ',
    '',
  ].join('\n');
  const doc = parseHybrid('t.md', { raw, strict: false });
  const rows = doc.tables.Elements;
  assert.equal(rows.length, 4);
  assert.equal(rows[0].text, 'a | b');
  assert.equal(rows[0].maxChars, 10);
  assert.equal(rows[1].text, '');
  assert.equal(rows[2].text, 'trailing pipe missing');
  assert.equal(rows[3].role, 'eyebrow');
  assert.deepEqual(doc.tableMeta.Elements.align, ['center', null, null, 'right']);
  // escaped pipes survive a round trip
  const again = parseHybrid('t2.md', { raw: serializeHybrid(doc, { keyOrder: null }), strict: false });
  assert.equal(again.tables.Elements[0].text, 'a | b');
});

test('table parser: numeric coercion only where it is safe', () => {
  const { rows } = elementRows(parseHybrid(FIXTURE));
  assert.equal(rows[0].n, 1);
  assert.equal(rows[1].size, 76);
  assert.equal(rows[1].lh, 1.1);
  assert.equal(typeof rows[1].align, 'string');
  assert.equal(rows[2].size, '');
  const raw = '---\nid: "T2"\n---\n\n## Elements\n\n| n | size | maxChars |\n|---|---|---|\n| 1 | auto | n/a |\n';
  const r = parseHybrid('t3.md', { raw, strict: false }).tables.Elements[0];
  assert.equal(r.size, 'auto');
  assert.equal(r.maxChars, 'n/a');
});

test('serializeTable aligns columns and keeps the header order', () => {
  const out = serializeTable([{ n: 1, role: 'title', text: 'x' }], ['n', 'role', 'text']);
  const lines = out.split('\n');
  assert.equal(lines.length, 3);
  assert.ok(lines[0].startsWith('| n   | role  | text |'));
  assert.match(lines[1], /^\|-+\|-+\|-+\|$/);
});

test('derived helpers: text capacity, bullets, shape spec, font stack', () => {
  const doc = parseHybrid(FIXTURE);
  const { rows } = elementRows(doc);
  assert.equal(textCapacity(rows), 274);
  assert.equal(textCapacity(rows), doc.frontmatter.text_capacity_chars);

  assert.deepEqual(bulletLines('- one\\n- two\\n- three'), ['one', 'two', 'three']);
  assert.equal(bulletLines('a single line'), null);

  const spec = parseShapeSpec('fill:#E5E5E5 r:16 stroke:#999 sw:2');
  assert.deepEqual(spec, { fill: '#E5E5E5', radius: 16, stroke: '#999', strokeWidth: 2, label: '' });

  const fonts = loadFonts(path.join(HERE, 'fixtures', 'spec', 'fonts.json'));
  assert.equal(fontStack('Inter', fonts), "'Inter', 'Helvetica Neue', Arial, sans-serif");
  assert.match(fontStack('Unknown Family', fonts), /^'Unknown Family',.*sans-serif$/);
});
