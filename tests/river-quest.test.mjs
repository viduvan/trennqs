import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  PAIR_MAP,
  SOUND_PATTERNS,
  calculateTilt,
  createSoundPlayer,
  evaluateAnswer,
  evaluateMatch,
  nextMatchState,
  resolveActiveStage,
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
  assert.doesNotMatch(html, /Trên điện thoại/);
});

test('nested endpoint uses relative local assets', async () => {
  const html = await readFile(questHtmlUrl, 'utf8');
  assert.match(html, /src="\.\.\/assets\/ban-do-ai-cap-luong-ha\.png"/);
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /src="app\.mjs"/);
  assert.doesNotMatch(html, /(?:src|href)="\//);
});

test('desktop discovery shows the full region story without an inner scrollbar', async () => {
  const html = await readFile(questHtmlUrl, 'utf8');
  const missionStart = html.indexOf('<aside class="mission-card"');
  const missionEnd = html.indexOf('</aside>', missionStart);
  const regionInfo = html.indexOf('id="region-info"');
  assert.ok(missionStart >= 0 && missionEnd > missionStart);
  assert.ok(regionInfo > missionStart && regionInfo < missionEnd);

  const css = await readFile(new URL('../dist/hanh-trinh-hai-dong-song/styles.css', import.meta.url), 'utf8');
  const desktopStart = css.indexOf('@media (min-width: 981px)');
  const desktopEnd = css.indexOf('@media (max-width: 980px)', desktopStart);
  const desktopCss = css.slice(desktopStart, desktopEnd);
  assert.match(desktopCss, /\.discovery-stage\s*\{[^}]*height:\s*calc\(100svh\s*-\s*78px\)/);
  assert.match(desktopCss, /\.mission-card\s*\{[^}]*overflow-y:\s*visible/);
  assert.match(css, /\.map-window\s*\{[^}]*height:\s*100%/s);
  assert.match(desktopCss, /\.mission-card\s*\{[^}]*transform:\s*none/);
  assert.match(desktopCss, /\.region-controls\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(desktopCss, /\.story-facts\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(desktopCss, /\.map-scene\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.9fr\)\s*minmax\(360px,\s*1\.1fr\)/);
  assert.match(desktopCss, /\.story-summary\s*\{[^}]*font-size:\s*0\.9375rem/);
  assert.match(desktopCss, /\.mission-card \.story-title\s*\{[^}]*font-size:\s*1\.625rem/);
  assert.match(desktopCss, /\.story-facts li\s*\{[^}]*font-size:\s*0\.875rem/);
  assert.match(desktopCss, /\.history-connection\s*\{[^}]*font-size:\s*0\.875rem/);
  assert.match(desktopCss, /\.mission-card:has\(\.region-button\[aria-pressed="true"\]\) \.mission-hint\s*\{[^}]*display:\s*none/);
  assert.match(css, /@media\s*\(min-width:\s*1500px\)\s*and\s*\(min-height:\s*900px\)[\s\S]*?\.journey-stage\s*\{[^}]*width:\s*min\(1420px,[^}]*[\s\S]*?\.mission-card \.story-title\s*\{[^}]*font-size:\s*2\.35rem[\s\S]*?\.story-summary\s*\{[^}]*font-size:\s*1\.25rem[\s\S]*?\.story-facts li\s*\{[^}]*font-size:\s*1\.125rem[\s\S]*?\.history-connection\s*\{[^}]*font-size:\s*1\.125rem/);
});

test('desktop final challenge keeps the answer and conclusion in one viewport panel', async () => {
  const html = await readFile(questHtmlUrl, 'utf8');
  const panelStart = html.indexOf('<div class="question-panel">');
  const conclusionStart = html.indexOf('<div class="conclusion"');
  const panelEnd = html.indexOf('</div>\n      </div>\n    </section>', panelStart);
  assert.ok(panelStart >= 0 && conclusionStart > panelStart && panelEnd > conclusionStart);

  const css = await readFile(new URL('../dist/hanh-trinh-hai-dong-song/styles.css', import.meta.url), 'utf8');
  const desktopStart = css.indexOf('@media (min-width: 981px)');
  const desktopEnd = css.indexOf('@media (min-width: 1500px)', desktopStart);
  const desktopCss = css.slice(desktopStart, desktopEnd);
  assert.match(desktopCss, /\.explanation-stage\s*\{[^}]*height:\s*calc\(100svh\s*-\s*78px\)[^}]*overflow:\s*hidden/s);
  assert.match(desktopCss, /\.explanation-stage \.stage-intro\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(360px,\s*0\.75fr\)/s);
  assert.match(desktopCss, /\.question-panel\s*\{[^}]*padding:\s*clamp\(18px,\s*2\.6vh,\s*26px\)/s);
  assert.match(desktopCss, /\.conclusion\s*\{[^}]*max-width:\s*none[^}]*margin:\s*10px 0 0[^}]*padding:\s*12px 16px/s);
  assert.match(desktopCss, /\.journey-footer\s*\{[^}]*display:\s*none/);
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

test('audio initialization failure is a silent no-op', () => {
  class ThrowingAudioContext {
    constructor() { throw new Error('audio unavailable'); }
  }
  const playSound = createSoundPlayer(() => true, { AudioContext: ThrowingAudioContext });
  assert.doesNotThrow(() => playSound('matchCorrect'));
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

test('journey progress stays on the stage crossed by the navigation probe', () => {
  const sections = [
    { id: 'kham-pha', top: 78 },
    { id: 'ket-noi', top: 1050 },
    { id: 'giai-thich', top: 1900 }
  ];
  assert.equal(resolveActiveStage(sections, 79), 'kham-pha');
  assert.equal(resolveActiveStage(sections, 900), 'kham-pha');
  assert.equal(resolveActiveStage(sections, 1050), 'ket-noi');
  assert.equal(resolveActiveStage(sections, 2200), 'giai-thich');
  assert.equal(resolveActiveStage([], 100), null);
});

test('stylesheet provides accessible responsive motion contracts', async () => {
  const css = await readFile(new URL('../dist/hanh-trinh-hai-dong-song/styles.css', import.meta.url), 'utf8');
  assert.match(css, /perspective\s*:/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /\.answer-option:has\(input:focus-visible\)/);
  assert.match(css, /prefers-reduced-motion\s*:\s*reduce/);
  assert.match(css, /pointer\s*:\s*coarse/);
  assert.match(css, /@media[^\{]*max-width\s*:\s*\d+px/);
  assert.match(css, /overflow-x\s*:\s*auto/);
  assert.match(css, /\[hidden\]\s*\{[^}]*display\s*:\s*none\s*!important/s);
  assert.match(css, /\.matching-stage\s*\{[^}]*padding-bottom:\s*clamp\(96px,\s*10vw,\s*148px\)/);
  assert.match(css, /\.matching-stage::before\s*\{[\s\S]*?inset:\s*40px -20px 0;/);
  assert.match(css, /\.discovery-stage\s*\{[^}]*padding-top/s);
  assert.match(css, /\.map-scene\s*\{[^}]*grid-template-columns/s);
  assert.match(css, /\.region-reveal\.is-empty\s*\{[^}]*display\s*:\s*none/s);
});
