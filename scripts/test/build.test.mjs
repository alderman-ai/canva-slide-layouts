import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHybrid, elementRows, loadFonts } from '../lib/md.mjs';
import { renderDocument, renderPage, renderElements, renderIndex, speakerNotes } from '../build-html.mjs';
import { renderDcDeck, renderCanvasJson } from '../build-dc.mjs';
import { opsForDoc, opsDocument, chunkOps, ALLOWED_OPS, MAX_OPS_PER_CHUNK } from '../build-canva-ops.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(HERE, 'fixtures', 'L999-fixture.md');
const FONTS = loadFonts(path.join(HERE, 'fixtures', 'spec', 'fonts.json'));

const doc = parseHybrid(FIXTURE);
const count = (haystack, needle) => haystack.split(needle).length - 1;

test('build-html: exactly one data-document-role="page" per slide, never nested', () => {
  const one = renderDocument([doc], { fonts: FONTS });
  assert.equal(count(one, '<section data-document-role="page"'), 1);
  const three = renderDocument([doc, doc, doc], { fonts: FONTS });
  assert.equal(count(three, '<section data-document-role="page"'), 3);
  assert.equal(count(three, '<section'), 3);
  assert.equal(count(three, '</section>'), 3);
  // no <section> may appear between a page's opening tag and its closing tag
  for (const body of three.split('<section').slice(1)) {
    const inner = body.slice(0, body.indexOf('</section>'));
    assert.equal(inner.includes('<section'), false);
  }
});

test('build-html: page box, charset, title and inline style block', () => {
  const html = renderDocument([doc], { title: 'Fixture', fonts: FONTS });
  assert.ok(html.startsWith('<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>Fixture</title>'));
  assert.match(html, /position:relative;width:1920px;height:1080px;overflow:hidden;background:#fff/);
  assert.match(html, /<style>/);
  assert.equal(html.includes('data:'), false); // no data URIs
  assert.equal(html.includes('::before'), false); // no text in pseudo-elements
});

test('build-html: leaf elements only — h1 title, absolute positions, font stack from the registry', () => {
  const page = renderPage(doc, FONTS);
  assert.match(page, /<h1 style="position:absolute;left:96px;top:140px;width:1200px;font-family:'Inter', 'Helvetica Neue', Arial, sans-serif;font-weight:600;font-size:76px;line-height:1\.1;text-align:left;margin:0">Action title states the takeaway<\/h1>/);
  assert.match(page, /data-label="L999 image_points"/); // layouts carry no title key
  assert.match(page, /data-speaker-notes="Fixture layout used by the script tests/);
});

test('build-html: bullets become real <li> items, from an inline list and from repeated bullet rows', () => {
  const page = renderPage(doc, FONTS);
  assert.equal(count(page, '<ul '), 1);
  assert.equal(count(page, '<li '), 3);
  assert.match(page, />First supporting point<\/li>/);

  const rows = [
    { n: 1, role: 'bullet', x: 96, y: 400, w: 900, h: 40, font: 'Inter', weight: 400, size: 32, lh: 1.4, align: 'left', text: 'one' },
    { n: 2, role: 'bullet', x: 96, y: 460, w: 900, h: 40, font: 'Inter', weight: 400, size: 32, lh: 1.4, align: 'left', text: 'two' },
    { n: 3, role: 'bullet', x: 96, y: 520, w: 900, h: 40, font: 'Inter', weight: 400, size: 32, lh: 1.4, align: 'left', text: 'three' },
  ];
  const html = renderElements(rows, FONTS);
  assert.equal(count(html, '<ul '), 1);
  assert.equal(count(html, '<li '), 3);
});

test('build-html: shapes, dividers and picture placeholders render as divs', () => {
  const page = renderPage(doc, FONTS);
  assert.match(page, /background:#F5F5F5;border-radius:16px/);      // shape spec parsed
  assert.match(page, /height:2px;background:#999999/);               // divider
  assert.match(page, /background:#E5E5E5;display:flex/);             // picture placeholder
  assert.match(page, /<span style="[^"]*">Product screenshot<\/span>/);
});

test('build-html: HTML is escaped in text and in attributes', () => {
  const raw = '---\nid: "T9"\ntitle: A & B <tag> "q"\n---\n\n## Elements\n\n| n | role | x | y | w | h | font | weight | size | lh | align | maxChars | binds | text |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n| 1 | title | 0 | 0 | 100 | 50 | Inter | 400 | 32 | 1.4 | left | 40 |  | <script>alert(1)</script> & "x" |\n';
  const d = parseHybrid('t.md', { raw, strict: false });
  const page = renderPage(d, FONTS);
  assert.equal(page.includes('<script>'), false);
  assert.match(page, /&lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; &quot;x&quot;/);
  assert.match(page, /data-label="A &amp; B &lt;tag&gt; &quot;q&quot;"/);
});

test('build-html: contact sheet links every page and scales to 25%', () => {
  const html = renderIndex([{ id: 'L999', title: 'Fixture', href: 'L999.html' }]);
  assert.match(html, /href="L999\.html"/);
  assert.match(html, /transform:scale\(0\.25\)/);
});

test('build-dc: deck shape, verbatim support.js line, no Canva page markers', () => {
  const deck = renderDcDeck([doc], { fonts: FONTS });
  assert.match(deck, /^<!doctype html>\n<!-- EXPERIMENTAL/);
  assert.ok(deck.includes('<script src="./support.js"></script>'));
  assert.ok(deck.includes('<x-dc>'));
  assert.ok(deck.includes('<helmet><style>'));
  assert.ok(deck.includes('<x-import component-from-global-scope="deck-stage" width="1920" height="1080">'));
  assert.equal(count(deck, '<section'), 1);
  assert.equal(deck.includes('data-document-role'), false);
  assert.match(deck, /data-label="L999 image_points"/);

  const canvas = renderCanvasJson('library', 1);
  assert.equal(canvas.artboards.length, 1);
  assert.equal(canvas.artboards[0].file, 'Main.dc.html');
  assert.equal(canvas.artboards[0].width, 1920);
});

test('build-canva-ops: only real edit-design operation names are emitted', () => {
  const ops = opsForDoc(doc);
  assert.ok(ops.length > 0);
  for (const op of ops) {
    assert.ok(ALLOWED_OPS.has(op.type), `unexpected operation "${op.type}"`);
  }
  const names = new Set(ops.map((o) => o.type));
  assert.deepEqual([...names].sort(), ['add_text', 'format_text', 'insert_fill', 'insert_shape', 'replace_speaker_notes']);
});

test('build-canva-ops: placeholders, weight mapping, notes cap and chunking', () => {
  const out = opsDocument(doc);
  assert.deepEqual(out.page, { width: 1920, height: 1080, title: 'L999 image_points' });
  const addText = out.operations.filter((o) => o.type === 'add_text');
  assert.ok(addText.every((o) => o.page_id === '$PAGE'));
  assert.deepEqual(Object.keys(addText[0]).sort(), ['left', 'page_id', 'text', 'top', 'type', 'width'].sort());
  const fmt = out.operations.filter((o) => o.type === 'format_text');
  assert.ok(fmt.every((o) => /^\$LOC\[\d+\]$/.test(o.locator_id)));
  // format_text nests options under `formatting` (spec/canva-edit-ops.md #9)
  assert.ok(fmt.every((o) => o.formatting && (o.formatting.font_weight === 'normal' || o.formatting.font_weight === 'bold')));
  assert.ok(fmt.every((o) => ['start', 'center', 'end'].includes(o.formatting.text_align)));
  assert.equal(fmt.find((o) => o.formatting.font_size === 76).formatting.font_weight, 'bold'); // weight 600 -> bold
  const fill = out.operations.find((o) => o.type === 'insert_fill');
  assert.equal(fill.asset_id, '$ASSET[6]');
  assert.equal(fill.asset_type, 'image');
  assert.ok(typeof fill.alt_text === 'string' && fill.alt_text.length > 0);
  const shape = out.operations.find((o) => o.type === 'insert_shape');
  assert.equal(shape.path, 'M0 0H1728V2H0Z'); // schema field is `path` (#11)
  assert.equal(shape.view_box_width, 1728);
  assert.equal(shape.view_box_height, 2);
  assert.ok(!('paths' in shape) && !('view_box' in shape));
  const notes = out.operations.find((o) => o.type === 'replace_speaker_notes');
  assert.ok(notes.notes.length <= 5000); // schema field is `notes` (#23)

  assert.ok(out.chunks.every((c) => c.length <= MAX_OPS_PER_CHUNK));
  assert.equal(out.chunks.flat().length, out.operations.length);
  assert.equal(chunkOps(new Array(60).fill({ type: 'add_text' })).length, 3);
  assert.equal(out.find_and_replace, undefined); // a layout is not bound to a master
});

test('build-canva-ops: slides bound to a master get the find_and_replace variant', () => {
  const raw = '---\nid: "S01"\nslide_no: 1\nlayout: "L999"\nfamily_page: "PB1"\n---\n\n## Elements\n\n| n | role | x | y | w | h | font | weight | size | lh | align | maxChars | binds | text |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n| 1 | title | 96 | 140 | 1200 | 180 | Inter | 600 | 76 | 1.1 | left | 40 | unit.title | Real slide title |\n';
  const slide = parseHybrid('s01.md', { raw, strict: false });
  const out = opsDocument(slide);
  assert.deepEqual(out.find_and_replace.master, { layout_id: 'L999', family_page: 'PB1' });
  const [rep] = out.find_and_replace.replacements;
  assert.equal(out.find_and_replace.replacements.length, 1);
  assert.equal(rep.role_index, 'title:1');
  assert.equal(rep.find, '');
  assert.equal(rep.replace, 'Real slide title');
  // S9: every fill is followed by a width reset and formatting re-assert (spec/canva-limits.md §6)
  assert.deepEqual(rep.after_ops.map((o) => o.type), ['resize_element', 'format_text']);
  assert.equal(rep.after_ops[0].width, 1200);
  assert.equal(rep.after_ops[0].locator_id, '$LOC[title:1]');
  assert.deepEqual(rep.after_ops[1].formatting, { line_height: 1.1, text_align: 'start' });
});

test('speaker notes come from the ## Speaker notes section', () => {
  assert.match(speakerNotes(doc), /^Fixture layout used by the script tests\./);
  assert.equal(elementRows(doc).rows.length, 7);
});
