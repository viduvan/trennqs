import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const questHtmlUrl = new URL('../dist/hanh-trinh-hai-dong-song/index.html', import.meta.url);

test('legacy endpoint remains byte-for-byte unchanged', async () => {
  const expected = JSON.parse(await readFile(new URL('./legacy-checksums.json', import.meta.url), 'utf8'));
  for (const [relativePath, digest] of Object.entries(expected)) {
    const bytes = await readFile(new URL(relativePath, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), digest, relativePath);
  }
});

test('river quest exposes exactly three journey stages', async () => {
  const html = await readFile(questHtmlUrl, 'utf8');
  const sectionIds = [...html.matchAll(/<section[^>]+id="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(sectionIds, ['kham-pha', 'ket-noi', 'giai-thich']);
  for (const id of sectionIds) assert.match(html, new RegExp(`href="#${id}"`));
  assert.equal((html.match(/data-region=/g) ?? []).length, 2);
  assert.equal((html.match(/data-card-id=/g) ?? []).length, 8);
  assert.equal((html.match(/name="answer"/g) ?? []).length, 3);
  assert.match(html, /id="sound-toggle"/);
});

test('nested endpoint uses relative local assets', async () => {
  const html = await readFile(questHtmlUrl, 'utf8');
  assert.match(html, /src="\.\.\/assets\/ban-do-ai-cap-luong-ha\.png"/);
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /src="app\.mjs"/);
  assert.doesNotMatch(html, /(?:src|href)="\//);
});
