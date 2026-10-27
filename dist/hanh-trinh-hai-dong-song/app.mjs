export const PAIR_MAP = Object.freeze({
  nile: 'egypt',
  'tigris-euphrates': 'mesopotamia',
  'water-silt': 'farming',
  rivers: 'transport'
});

const SOURCE_IDS = new Set(Object.keys(PAIR_MAP));
const TARGET_IDS = new Set(Object.values(PAIR_MAP));

export function evaluateMatch(firstId, secondId) {
  return PAIR_MAP[firstId] === secondId || PAIR_MAP[secondId] === firstId;
}

export function evaluateAnswer(value) {
  if (value === 'A') return { correct: true, kind: 'success' };
  if (value === 'B') return { correct: false, kind: 'effort' };
  if (value === 'C') return { correct: false, kind: 'impact' };
  return { correct: false, kind: 'empty' };
}

export function calculateTilt(pointerX, pointerY, bounds) {
  if (!bounds || !Number.isFinite(bounds.width) || !Number.isFinite(bounds.height)
    || bounds.width <= 0 || bounds.height <= 0) {
    return { rotateX: 0, rotateY: 0 };
  }
  const normalizedX = ((pointerX - bounds.left) / bounds.width) * 2 - 1;
  const normalizedY = ((pointerY - bounds.top) / bounds.height) * 2 - 1;
  const clamp = (value) => {
    const bounded = Math.max(-3, Math.min(3, value));
    return Object.is(bounded, -0) ? 0 : bounded;
  };
  return {
    rotateX: clamp(-normalizedY * 3),
    rotateY: clamp(normalizedX * 3)
  };
}

export function nextMatchState(state, firstId, secondId) {
  const completedIds = [...(state?.completedIds ?? [])];
  const selectedId = secondId === undefined ? state?.selectedId ?? null : firstId;
  const chosenId = secondId === undefined ? firstId : secondId;

  if (!SOURCE_IDS.has(chosenId) && !TARGET_IDS.has(chosenId)) {
    return { selectedId, completedIds, status: 'ignored' };
  }
  if (completedIds.includes(chosenId)) {
    return { selectedId, completedIds, status: 'ignored' };
  }
  if (!selectedId) {
    return { selectedId: chosenId, completedIds, status: 'selected' };
  }
  if (selectedId === chosenId) {
    return { selectedId: null, completedIds, status: 'deselected' };
  }

  const sameGroup = (SOURCE_IDS.has(selectedId) && SOURCE_IDS.has(chosenId))
    || (TARGET_IDS.has(selectedId) && TARGET_IDS.has(chosenId));
  if (sameGroup) {
    return { selectedId: chosenId, completedIds, status: 'switched' };
  }
  if (evaluateMatch(selectedId, chosenId)) {
    return {
      selectedId: null,
      completedIds: [...completedIds, selectedId, chosenId],
      matchedIds: [selectedId, chosenId],
      status: 'matched'
    };
  }
  return { selectedId: null, completedIds, attemptedIds: [selectedId, chosenId], status: 'wrong' };
}

// Các cao độ ngũ cung tạo phản hồi mộc, sáng và phù hợp bối cảnh lịch sử.
export const SOUND_PATTERNS = Object.freeze({
  matchCorrect: Object.freeze({
    volume: 0.06,
    notes: Object.freeze([
      Object.freeze({ frequency: 587.33, duration: 0.16, delay: 0, type: 'sine' }),
      Object.freeze({ frequency: 880, duration: 0.24, delay: 0.11, type: 'triangle' })
    ])
  }),
  matchComplete: Object.freeze({
    volume: 0.075,
    notes: Object.freeze([
      Object.freeze({ frequency: 587.33, duration: 0.17, delay: 0, type: 'triangle' }),
      Object.freeze({ frequency: 659.25, duration: 0.17, delay: 0.1, type: 'triangle' }),
      Object.freeze({ frequency: 783.99, duration: 0.18, delay: 0.2, type: 'triangle' }),
      Object.freeze({ frequency: 880, duration: 0.19, delay: 0.31, type: 'sine' }),
      Object.freeze({ frequency: 1174.66, duration: 0.4, delay: 0.43, type: 'sine' })
    ])
  }),
  matchWrong: Object.freeze({
    volume: 0.04,
    notes: Object.freeze([
      Object.freeze({ frequency: 233.08, duration: 0.13, delay: 0, type: 'triangle' }),
      Object.freeze({ frequency: 196, duration: 0.2, delay: 0.1, type: 'triangle' })
    ])
  }),
  quizCorrect: Object.freeze({
    volume: 0.07,
    notes: Object.freeze([
      Object.freeze({ frequency: 523.25, duration: 0.22, delay: 0, type: 'sine' }),
      Object.freeze({ frequency: 783.99, duration: 0.25, delay: 0.13, type: 'sine' }),
      Object.freeze({ frequency: 987.77, duration: 0.42, delay: 0.27, type: 'triangle' })
    ])
  }),
  quizWrong: Object.freeze({
    volume: 0.035,
    notes: Object.freeze([
      Object.freeze({ frequency: 261.63, duration: 0.16, delay: 0, type: 'sine' }),
      Object.freeze({ frequency: 220, duration: 0.23, delay: 0.12, type: 'sine' })
    ])
  })
});

export function scheduleSoundNotes(patternName, enabled, schedule) {
  const pattern = SOUND_PATTERNS[patternName];
  if (!enabled || !pattern || typeof schedule !== 'function') return 0;
  pattern.notes.forEach((note) => schedule(note, pattern.volume));
  return pattern.notes.length;
}

const REGIONS = Object.freeze({
  egypt: Object.freeze({
    kicker: 'Thung lũng sông Nin',
    title: 'Ai Cập',
    summary: 'Sông Nin là nguồn sống quan trọng giữa vùng đất phần lớn khô hạn của Ai Cập.',
    facts: Object.freeze([
      'Cung cấp nước cho sinh hoạt và tưới tiêu.',
      'Mang phù sa bồi đắp đất ven sông, hỗ trợ trồng trọt.',
      'Tạo tuyến đường giao thông, trao đổi hàng hóa thuận tiện.'
    ]),
    connection: 'Nguồn nước ổn định và đất phù sa màu mỡ giúp cư dân tập trung sinh sống, phát triển nông nghiệp và từng bước xây dựng nền văn minh Ai Cập.'
  }),
  mesopotamia: Object.freeze({
    kicker: 'Miền đất giữa hai sông',
    title: 'Lưỡng Hà',
    summary: 'Hai sông Ti-grơ và Ơ-phơ-rát đem nước và phù sa đến vùng đồng bằng Lưỡng Hà.',
    facts: Object.freeze([
      'Cung cấp nguồn nước quan trọng cho cư dân và đồng ruộng.',
      'Bồi đắp phù sa, tạo nên những vùng đất thuận lợi cho nông nghiệp.',
      'Kết nối các khu dân cư, hỗ trợ đi lại và trao đổi sản phẩm.'
    ]),
    connection: 'Các dòng sông và đất phù sa tạo điều kiện để cư dân định cư, làm thủy lợi, phát triển trồng trọt và hình thành các đô thị, nhà nước cổ đại.'
  })
});

function createSoundPlayer(isEnabled) {
  let context;
  return (patternName) => {
    if (!isEnabled()) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    context ||= new AudioContextClass();
    if (context.state === 'suspended') void context.resume();

    const master = context.createGain();
    const filter = context.createBiquadFilter();
    const pattern = SOUND_PATTERNS[patternName];
    if (!pattern) return;
    master.gain.setValueAtTime(pattern.volume, context.currentTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, context.currentTime);
    master.connect(filter).connect(context.destination);

    scheduleSoundNotes(patternName, true, (note) => {
      const start = context.currentTime + note.delay;
      const end = start + note.duration;
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = note.type;
      oscillator.frequency.setValueAtTime(note.frequency, start);
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(1, start + 0.018);
      envelope.gain.exponentialRampToValueAtTime(0.0001, end);
      oscillator.connect(envelope).connect(master);
      oscillator.start(start);
      oscillator.stop(end + 0.02);
    });
  };
}

function setFeedback(element, message, kind = 'neutral') {
  element.textContent = message;
  element.className = `feedback is-${kind}`;
}

function setupSoundToggle() {
  const button = document.querySelector('#sound-toggle');
  const label = document.querySelector('#sound-label');
  let enabled = true;
  const render = () => {
    button.setAttribute('aria-pressed', String(enabled));
    label.textContent = `Âm thanh: ${enabled ? 'Bật' : 'Tắt'}`;
    button.classList.toggle('is-muted', !enabled);
  };
  button.addEventListener('click', () => {
    enabled = !enabled;
    render();
  });
  render();
  return () => enabled;
}

function setupRegions() {
  const buttons = [...document.querySelectorAll('[data-region]')];
  const info = document.querySelector('#region-info');
  const placeholder = info.querySelector('.region-placeholder');
  const story = info.querySelector('.region-story');
  const close = document.querySelector('#close-region');

  const reset = (returnFocus = false) => {
    buttons.forEach((button) => button.setAttribute('aria-pressed', 'false'));
    info.classList.add('is-empty');
    placeholder.hidden = false;
    story.hidden = true;
    if (returnFocus) buttons[0].focus();
  };

  buttons.forEach((button) => button.addEventListener('click', () => {
    const region = REGIONS[button.dataset.region];
    buttons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
    info.classList.remove('is-empty');
    placeholder.hidden = true;
    story.hidden = false;
    story.querySelector('.story-kicker').textContent = region.kicker;
    story.querySelector('.story-title').textContent = region.title;
    story.querySelector('.story-summary').textContent = region.summary;
    story.querySelector('.story-connection').textContent = region.connection;
    story.querySelector('.story-facts').replaceChildren(...region.facts.map((fact) => {
      const item = document.createElement('li');
      item.textContent = fact;
      return item;
    }));
  }));
  close.addEventListener('click', () => reset(true));
}

function setupMatching(playSound) {
  const cards = [...document.querySelectorAll('[data-card-id]')];
  const feedback = document.querySelector('#match-feedback');
  const counter = document.querySelector('#match-count');
  let state = { selectedId: null, completedIds: [] };

  const cardById = (id) => cards.find((card) => card.dataset.cardId === id);
  const clearSelections = () => cards.forEach((card) => card.classList.remove('is-selected', 'is-wrong'));

  cards.forEach((card) => card.addEventListener('click', () => {
    state = nextMatchState(state, card.dataset.cardId);
    clearSelections();
    cards.forEach((item) => item.setAttribute('aria-pressed', String(item.dataset.cardId === state.selectedId)));

    if (state.status === 'ignored') return;
    if (state.status === 'selected' || state.status === 'switched') {
      cardById(state.selectedId).classList.add('is-selected');
      setFeedback(feedback, `Đã chọn “${cardById(state.selectedId).textContent.trim()}”. Hãy tìm mảnh ghép phù hợp.`);
      return;
    }
    if (state.status === 'deselected') {
      setFeedback(feedback, 'Đã bỏ chọn. Hãy chọn một thẻ để bắt đầu.');
      return;
    }
    if (state.status === 'matched') {
      state.matchedIds.forEach((id) => {
        const matched = cardById(id);
        matched.classList.add('is-matched');
        matched.disabled = true;
        matched.setAttribute('aria-label', `${matched.textContent.trim()} — đã ghép đúng`);
      });
      const completed = state.completedIds.length / 2;
      counter.textContent = String(completed);
      playSound(completed === 4 ? 'matchComplete' : 'matchCorrect');
      setFeedback(feedback, completed === 4
        ? 'Xuất sắc! Em đã tìm thấy đủ 4 mối liên hệ.'
        : `Chính xác! Em đã hoàn thành ${completed}/4 cặp.`, 'success');
      return;
    }
    if (state.status === 'wrong') {
      const attemptedIds = [...state.attemptedIds];
      attemptedIds.forEach((id) => cardById(id).classList.add('is-wrong'));
      playSound('matchWrong');
      setFeedback(feedback, 'Chưa đúng rồi. Em hãy quan sát mối liên hệ và thử lại nhé!', 'error');
      window.setTimeout(() => attemptedIds.forEach((id) => cardById(id).classList.remove('is-wrong')), 550);
    }
  }));

  document.querySelector('#reset-game').addEventListener('click', () => {
    state = { selectedId: null, completedIds: [] };
    cards.forEach((card) => {
      card.disabled = false;
      card.classList.remove('is-selected', 'is-wrong', 'is-matched');
      card.removeAttribute('aria-label');
      card.setAttribute('aria-pressed', 'false');
    });
    counter.textContent = '0';
    setFeedback(feedback, 'Chọn hai thẻ để tạo một cặp.');
    cards[0].focus();
  });
}

function setupQuiz(playSound) {
  const options = [...document.querySelectorAll('.answer-option')];
  const inputs = [...document.querySelectorAll('input[name="answer"]')];
  const feedback = document.querySelector('#quiz-feedback');
  const conclusion = document.querySelector('#conclusion');
  const clearStyles = () => options.forEach((option) => option.classList.remove('is-correct', 'is-wrong'));

  inputs.forEach((input) => input.addEventListener('change', clearStyles));
  document.querySelector('#check-answer').addEventListener('click', () => {
    const selected = document.querySelector('input[name="answer"]:checked');
    const result = evaluateAnswer(selected?.value ?? '');
    clearStyles();
    if (!selected) {
      setFeedback(feedback, 'Em hãy chọn một phương án trước khi kiểm tra.', 'error');
      inputs[0].focus();
      return;
    }
    const option = selected.closest('.answer-option');
    if (result.correct) {
      option.classList.add('is-correct');
      setFeedback(feedback, 'Chính xác! Nước, phù sa và đường giao thông tạo điều kiện quan trọng để cư dân ổn định và phát triển.', 'success');
      conclusion.hidden = false;
      playSound('quizCorrect');
      conclusion.focus({ preventScroll: true });
      return;
    }
    option.classList.add('is-wrong');
    conclusion.hidden = true;
    playSound('quizWrong');
    setFeedback(feedback, result.kind === 'effort'
      ? 'Hãy nghĩ lại: thiên nhiên thuận lợi, nhưng lương thực vẫn cần lao động và sự tổ chức của con người.'
      : 'Hãy quan sát lại vai trò của nguồn nước, phù sa và đường đi lại đối với đời sống cư dân.', 'error');
  });

  document.querySelector('#reset-quiz').addEventListener('click', () => {
    inputs.forEach((input) => { input.checked = false; });
    clearStyles();
    conclusion.hidden = true;
    setFeedback(feedback, 'Chọn một phương án rồi kiểm tra đáp án.');
    inputs[0].focus();
  });
}

function setupNavigation() {
  if (!('IntersectionObserver' in window)) return;
  const links = [...document.querySelectorAll('[data-nav]')];
  const sections = [...document.querySelectorAll('[data-stage]')];
  const observer = new IntersectionObserver((entries) => {
    const current = entries.filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!current) return;
    links.forEach((link) => {
      const active = link.dataset.nav === current.target.id;
      link.classList.toggle('is-current', active);
      if (active) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-25% 0px -55%', threshold: [0, 0.2, 0.5] });
  sections.forEach((section) => observer.observe(section));
}

function setupMapTilt() {
  const scene = document.querySelector('#map-scene');
  if (!scene || !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let frame = 0;
  scene.addEventListener('pointermove', (event) => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      const tilt = calculateTilt(event.clientX, event.clientY, scene.getBoundingClientRect());
      scene.style.setProperty('--tilt-x', `${tilt.rotateX.toFixed(2)}deg`);
      scene.style.setProperty('--tilt-y', `${tilt.rotateY.toFixed(2)}deg`);
      frame = 0;
    });
  });
  scene.addEventListener('pointerleave', () => {
    scene.style.setProperty('--tilt-x', '0deg');
    scene.style.setProperty('--tilt-y', '0deg');
  });
}

export function init() {
  const isSoundEnabled = setupSoundToggle();
  const playSound = createSoundPlayer(isSoundEnabled);
  setupRegions();
  setupMatching(playSound);
  setupQuiz(playSound);
  setupNavigation();
  setupMapTilt();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}
