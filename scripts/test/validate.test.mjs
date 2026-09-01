import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { runValidate, hygieneCheck, injectVocabEnums, VENDOR_EXTENSIONS } from '../validate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(HERE, 'fixtures');
const SPEC = path.join(FIXTURES, 'spec');

const run = (file) => runValidate({
  files: [path.join(FIXTURES, file)],
  type: 'layout',
  specDir: SPEC,
  hygiene: false,
});

test('a complete valid layout passes with no errors', () => {
  const r = run('L999-fixture.md');
  assert.deepEqual(r.errors, [], r.errors.map((e) => e.message).join('\n'));
  assert.equal(r.ok, true);
  assert.equal(r.counts.layout, 1);
  // Inter and Open Sans are canva_native in the fixture registry, so no font warnings
  assert.deepEqual(r.warnings.filter((w) => w.code === 'non_native_font'), []);
});

test('the broken layout reports every seeded problem', () => {
  const r = run('L998-broken.md');
  assert.equal(r.ok, false);
  const codes = new Set(r.errors.map((e) => e.code));
  for (const code of ['nested_frontmatter', 'out_of_bounds', 'dup_n', 'bad_geometry', 'unknown_font', 'capacity_mismatch', 'fonts_native_mismatch']) {
    assert.ok(codes.has(code), `expected a ${code} error, got: ${[...codes].join(', ')}`);
  }
  // every record is reportable as "ERR file:line message"
  for (const e of r.errors) {
    assert.equal(e.level, 'ERR');
    assert.match(e.file, /^scripts\/test\/fixtures\//);
    assert.equal(typeof e.line, 'number');
    assert.ok(e.message.length > 0);
  }
});

test('nested frontmatter names the offending key', () => {
  const r = run('L998-broken.md');
  const nested = r.errors.find((e) => e.code === 'nested_frontmatter');
  assert.match(nested.message, /nested_key/);
});

test('hygiene sweep finds no vendor design files in the repo', () => {
  assert.deepEqual(hygieneCheck(), []);
  assert.ok(VENDOR_EXTENSIONS.includes('.pptx'));
});

test('vocab enums are injected into schema properties at load', () => {
  const vocab = new Map([['family', new Set(['content', 'opening'])]]);
  const schema = injectVocabEnums({
    type: 'object',
    properties: { family: { type: 'string' }, tags: { type: 'array' } },
  }, vocab);
  assert.deepEqual(schema.properties.family.enum, ['content', 'opening']);
  assert.equal(schema.properties.tags.items?.enum, undefined);
});

test('an empty repo scan is clean', () => {
  // The real repo now contains layouts, so scan a temporary empty root instead of REPO_ROOT.
  const emptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'csl-empty-'));
  try {
    for (const d of ['layouts', 'presentations', 'intake', 'bundles']) fs.mkdirSync(path.join(emptyRoot, d));
    const r = runValidate({ files: [], root: emptyRoot, specDir: SPEC, hygiene: true });
    assert.equal(r.ok, true);
    assert.equal(r.counts.layout, 0);
  } finally {
    fs.rmSync(emptyRoot, { recursive: true, force: true });
  }
});
