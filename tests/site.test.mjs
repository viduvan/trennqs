import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PAIR_MAP, evaluateMatch, evaluateAnswer } from '../dist/app.mjs';

const htmlPath = new URL('../dist/index.html', import.meta.url);

test('trang có đúng ba phần học tập và điều hướng tới từng phần', async () => {
  const html = await readFile(htmlPath, 'utf8');
  const sectionIds = [...html.matchAll(/<section[^>]+id="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(sectionIds, ['kham-pha', 'ghep-doi', 'thu-thach']);
  for (const id of sectionIds) assert.match(html, new RegExp(`href="#${id}"`));
});

test('bản đồ gốc và đúng hai nút khu vực xuất hiện', async () => {
  const html = await readFile(htmlPath, 'utf8');
  assert.match(html, /assets\/ban-do-ai-cap-luong-ha\.png/);
  assert.equal((html.match(/data-region=/g) ?? []).length, 2);
  assert.match(html, />AI CẬP</);
  assert.match(html, />LƯỠNG HÀ</);
});

test('trò ghép công bố đúng tám thẻ và câu hỏi có ba phương án', async () => {
  const html = await readFile(htmlPath, 'utf8');
  assert.equal((html.match(/data-card-id=/g) ?? []).length, 8);
  assert.equal((html.match(/name="answer"/g) ?? []).length, 3);
  assert.match(html, /Vì sao các nền văn minh Ai Cập và Lưỡng Hà sớm hình thành bên những dòng sông lớn\?/);
});

test('logic ghép đôi chỉ chấp nhận chính xác bốn cặp kiến thức', () => {
  assert.equal(Object.keys(PAIR_MAP).length, 4);
  assert.equal(evaluateMatch('nile', 'egypt'), true);
  assert.equal(evaluateMatch('tigris-euphrates', 'mesopotamia'), true);
  assert.equal(evaluateMatch('water-silt', 'farming'), true);
  assert.equal(evaluateMatch('rivers', 'transport'), true);
  assert.equal(evaluateMatch('nile', 'transport'), false);
  assert.equal(evaluateMatch('egypt', 'nile'), true);
});

test('logic trắc nghiệm xác định A đúng và B, C cần thử lại', () => {
  assert.deepEqual(evaluateAnswer('A'), { correct: true, kind: 'success' });
  assert.deepEqual(evaluateAnswer('B'), { correct: false, kind: 'effort' });
  assert.deepEqual(evaluateAnswer('C'), { correct: false, kind: 'impact' });
  assert.deepEqual(evaluateAnswer(''), { correct: false, kind: 'empty' });
});
