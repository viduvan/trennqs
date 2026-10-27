import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  PAIR_MAP,
  SOUND_PATTERNS,
  calculateTilt,
  evaluateAnswer,
  evaluateMatch,
  nextMatchState,
  scheduleSoundNotes
} from '../dist/hanh-trinh-hai-dong-song/app.mjs';

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

test('four exact knowledge pairs work in either selection order', () => {
  assert.deepEqual(PAIR_MAP, {
    nile: 'egypt',
    'tigris-euphrates': 'mesopotamia',
    'water-silt': 'farming',
    rivers: 'transport'
  });
  for (const [left, right] of Object.entries(PAIR_MAP)) {
    assert.equal(evaluateMatch(left, right), true);
    assert.equal(evaluateMatch(right, left), true);
  }
  assert.equal(evaluateMatch('nile', 'transport'), false);
});

test('matching state preserves progress and ignores completed cards', () => {
  const initial = { selectedId: null, completedIds: [] };
  const picked = nextMatchState(initial, 'nile');
  assert.equal(picked.status, 'selected');
  const wrong = nextMatchState(picked, 'transport');
  assert.equal(wrong.status, 'wrong');
  assert.deepEqual(wrong.completedIds, []);

  const selectedAgain = nextMatchState(wrong, 'nile');
  const matched = nextMatchState(selectedAgain, 'egypt');
  assert.equal(matched.status, 'matched');
  assert.deepEqual(matched.completedIds, ['nile', 'egypt']);

  const ignored = nextMatchState(matched, 'nile');
  assert.equal(ignored.status, 'ignored');
  assert.deepEqual(ignored.completedIds, ['nile', 'egypt']);
});

test('quiz evaluation keeps A correct and B, C retryable', () => {
  assert.deepEqual(evaluateAnswer('A'), { correct: true, kind: 'success' });
  assert.deepEqual(evaluateAnswer('B'), { correct: false, kind: 'effort' });
  assert.deepEqual(evaluateAnswer('C'), { correct: false, kind: 'impact' });
  assert.deepEqual(evaluateAnswer(''), { correct: false, kind: 'empty' });
});

test('five contextual sound patterns stay short, quiet and distinct', () => {
  assert.deepEqual(Object.keys(SOUND_PATTERNS), [
    'matchCorrect',
    'matchComplete',
    'matchWrong',
    'quizCorrect',
    'quizWrong'
  ]);
  const signatures = new Set();
  for (const pattern of Object.values(SOUND_PATTERNS)) {
    assert.ok(pattern.volume > 0 && pattern.volume <= 0.09);
    assert.ok(pattern.notes.length >= 2);
    assert.ok(pattern.notes.every((note) => note.frequency > 0 && note.duration > 0 && note.duration <= 0.55));
    signatures.add(JSON.stringify(pattern.notes));
  }
  assert.equal(signatures.size, 5);
});

test('muted sound state does not schedule notes', () => {
  const scheduled = [];
  assert.equal(scheduleSoundNotes('matchCorrect', false, (note) => scheduled.push(note)), 0);
  assert.deepEqual(scheduled, []);
  assert.equal(scheduleSoundNotes('matchCorrect', true, (note) => scheduled.push(note)), 2);
  assert.equal(scheduled.length, 2);
});

test('pointer tilt is centered and clamped to three degrees', () => {
  const bounds = { left: 100, top: 50, width: 800, height: 600 };
  assert.deepEqual(calculateTilt(500, 350, bounds), { rotateX: 0, rotateY: 0 });
  const topLeft = calculateTilt(-500, -500, bounds);
  const bottomRight = calculateTilt(2000, 2000, bounds);
  for (const tilt of [topLeft, bottomRight]) {
    assert.ok(Math.abs(tilt.rotateX) <= 3);
    assert.ok(Math.abs(tilt.rotateY) <= 3);
  }
  assert.deepEqual(calculateTilt(10, 20), { rotateX: 0, rotateY: 0 });
  assert.deepEqual(calculateTilt(10, 20, { left: 0, top: 0, width: 0, height: 0 }), { rotateX: 0, rotateY: 0 });
});

test('stylesheet provides accessible responsive motion contracts', async () => {
  const css = await readFile(new URL('../dist/hanh-trinh-hai-dong-song/styles.css', import.meta.url), 'utf8');
  assert.match(css, /perspective\s*:/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion\s*:\s*reduce/);
  assert.match(css, /pointer\s*:\s*coarse/);
  assert.match(css, /@media[^\{]*max-width\s*:\s*\d+px/);
  assert.match(css, /overflow-x\s*:\s*auto/);
});
