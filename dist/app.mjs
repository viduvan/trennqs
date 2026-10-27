export const PAIR_MAP = Object.freeze({
  nile: 'egypt',
  'tigris-euphrates': 'mesopotamia',
  'water-silt': 'farming',
  rivers: 'transport'
});

export function evaluateMatch(firstId, secondId) {
  return PAIR_MAP[firstId] === secondId || PAIR_MAP[secondId] === firstId;
}

export function evaluateAnswer(value) {
  if (value === 'A') return { correct: true, kind: 'success' };
  if (value === 'B') return { correct: false, kind: 'effort' };
  if (value === 'C') return { correct: false, kind: 'impact' };
  return { correct: false, kind: 'empty' };
}

// Các cao độ dựa trên âm giai ngũ cung để tạo cảm giác mộc, sáng và không quá “game”.
export const SOUND_PATTERNS = Object.freeze({
  matchCorrect: {
    volume: 0.065,
    notes: [
      { frequency: 587.33, duration: 0.16, delay: 0, type: 'sine' },
      { frequency: 880, duration: 0.24, delay: 0.11, type: 'triangle' }
    ]
  },
  matchComplete: {
    volume: 0.075,
    notes: [
      { frequency: 587.33, duration: 0.17, delay: 0, type: 'triangle' },
      { frequency: 659.25, duration: 0.17, delay: 0.1, type: 'triangle' },
      { frequency: 783.99, duration: 0.18, delay: 0.2, type: 'triangle' },
      { frequency: 880, duration: 0.19, delay: 0.31, type: 'sine' },
      { frequency: 1174.66, duration: 0.4, delay: 0.43, type: 'sine' }
    ]
  },
  matchWrong: {
    volume: 0.045,
    notes: [
      { frequency: 233.08, duration: 0.13, delay: 0, type: 'triangle' },
      { frequency: 196, duration: 0.2, delay: 0.1, type: 'triangle' }
    ]
  },
  quizCorrect: {
    volume: 0.07,
    notes: [
      { frequency: 523.25, duration: 0.22, delay: 0, type: 'sine' },
      { frequency: 783.99, duration: 0.25, delay: 0.13, type: 'sine' },
      { frequency: 987.77, duration: 0.42, delay: 0.27, type: 'triangle' }
    ]
  },
  quizWrong: {
    volume: 0.04,
    notes: [
      { frequency: 261.63, duration: 0.16, delay: 0, type: 'sine' },
      { frequency: 220, duration: 0.23, delay: 0.12, type: 'sine' }
    ]
  }
});

const REGIONS = Object.freeze({
  egypt: {
    kicker: 'Thung lũng sông Nin',
    title: 'Ai Cập',
    summary: 'Sông Nin là nguồn sống quan trọng giữa vùng đất phần lớn khô hạn của Ai Cập.',
    facts: [
      'Cung cấp nước cho sinh hoạt và tưới tiêu.',
      'Mang phù sa bồi đắp đất ven sông, hỗ trợ trồng trọt.',
      'Tạo tuyến đường giao thông, trao đổi hàng hóa thuận tiện.'
    ],
    connection: 'Nguồn nước ổn định và đất phù sa màu mỡ giúp cư dân tập trung sinh sống, phát triển nông nghiệp và từng bước xây dựng nền văn minh Ai Cập.'
  },
  mesopotamia: {
    kicker: 'Miền đất giữa hai sông',
    title: 'Lưỡng Hà',
    summary: 'Hai sông Ti-grơ và Ơ-phơ-rát đem nước và phù sa đến vùng đồng bằng Lưỡng Hà.',
    facts: [
      'Cung cấp nguồn nước quan trọng cho cư dân và đồng ruộng.',
      'Bồi đắp phù sa, tạo nên những vùng đất thuận lợi cho nông nghiệp.',
      'Kết nối các khu dân cư, hỗ trợ đi lại và trao đổi sản phẩm.'
    ],
    connection: 'Các dòng sông và đất phù sa tạo điều kiện để cư dân định cư, làm thủy lợi, phát triển trồng trọt và hình thành các đô thị, nhà nước cổ đại.'
  }
});

function createSoundPlayer() {
  let context;
  return (patternName) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const pattern = SOUND_PATTERNS[patternName];
    if (!pattern) return;
    context ||= new AudioContext();
    if (context.state === 'suspended') void context.resume();

    const master = context.createGain();
    const filter = context.createBiquadFilter();
    master.gain.setValueAtTime(pattern.volume, context.currentTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, context.currentTime);
    filter.Q.setValueAtTime(1.2, context.currentTime);
    master.connect(filter).connect(context.destination);

    for (const note of pattern.notes) {
      const start = context.currentTime + note.delay;
      const end = start + note.duration;
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = note.type;
      oscillator.frequency.setValueAtTime(note.frequency, start);
      oscillator.detune.setValueAtTime(-3, start);
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(1, start + 0.018);
      envelope.gain.exponentialRampToValueAtTime(0.0001, end);
      oscillator.connect(envelope).connect(master);
      oscillator.start(start);
      oscillator.stop(end + 0.02);
    }
  };
}

function setFeedback(element, message, type = 'neutral') {
  element.textContent = message;
  element.className = `feedback ${type}`;
}

function setupMap() {
  const buttons = [...document.querySelectorAll('[data-region]')];
  const info = document.querySelector('#region-info');
  const empty = info.querySelector('.empty-state');
  const article = info.querySelector('.region-article');
  const close = document.querySelector('#close-region');

  const reset = (returnFocus = false) => {
    buttons.forEach((button) => button.setAttribute('aria-pressed', 'false'));
    info.classList.add('is-empty');
    empty.hidden = false;
    article.hidden = true;
    if (returnFocus) buttons[0].focus();
  };

  const show = (key, sourceButton) => {
    const region = REGIONS[key];
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === sourceButton)));
    info.classList.remove('is-empty');
    empty.hidden = true;
    article.hidden = false;
    article.querySelector('.region-kicker').textContent = region.kicker;
    article.querySelector('.region-title').textContent = region.title;
    article.querySelector('.region-summary').textContent = region.summary;
    article.querySelector('.region-connection').textContent = region.connection;
    article.querySelector('.fact-list').replaceChildren(...region.facts.map((fact) => {
      const item = document.createElement('li');
      item.textContent = fact;
      return item;
    }));
  };

  buttons.forEach((button) => button.addEventListener('click', () => show(button.dataset.region, button)));
  close.addEventListener('click', () => reset(true));
}

function setupGame(playSound) {
  const cards = [...document.querySelectorAll('.match-card')];
  const feedback = document.querySelector('#game-feedback');
  const counter = document.querySelector('#match-count');
  const resetButton = document.querySelector('#reset-game');
  let selected = null;
  let completed = 0;

  const clearTemporary = () => cards.forEach((card) => card.classList.remove('is-selected', 'is-wrong'));

  const selectCard = (card) => {
    if (card.disabled) return;
    if (!selected) {
      selected = card;
      card.classList.add('is-selected');
      card.setAttribute('aria-pressed', 'true');
      setFeedback(feedback, `Đã chọn “${card.textContent.trim()}”. Hãy tìm thẻ phù hợp ở nhóm còn lại.`);
      return;
    }

    if (selected === card) {
      card.classList.remove('is-selected');
      card.setAttribute('aria-pressed', 'false');
      selected = null;
      setFeedback(feedback, 'Đã bỏ chọn. Hãy chọn một thẻ để bắt đầu.');
      return;
    }

    const sameColumn = selected.classList.contains('source-card') === card.classList.contains('source-card');
    if (sameColumn) {
      selected.classList.remove('is-selected');
      selected.setAttribute('aria-pressed', 'false');
      selected = card;
      card.classList.add('is-selected');
      card.setAttribute('aria-pressed', 'true');
      setFeedback(feedback, 'Đã đổi thẻ lựa chọn. Bây giờ hãy chọn một thẻ ở nhóm còn lại.');
      return;
    }

    if (evaluateMatch(selected.dataset.cardId, card.dataset.cardId)) {
      selected.classList.remove('is-selected');
      selected.setAttribute('aria-pressed', 'false');
      for (const matched of [selected, card]) {
        matched.classList.add('is-matched');
        matched.disabled = true;
        matched.setAttribute('aria-label', `${matched.textContent.trim()} — đã ghép đúng`);
      }
      completed += 1;
      counter.textContent = String(completed);
      playSound(completed === 4 ? 'matchComplete' : 'matchCorrect');
      setFeedback(
        feedback,
        completed === 4 ? 'Xuất sắc! Em đã ghép đúng cả 4 cặp kiến thức.' : `Chính xác! Em đã hoàn thành ${completed}/4 cặp.`,
        'success'
      );
      selected = null;
      return;
    }

    const first = selected;
    first.classList.remove('is-selected');
    first.setAttribute('aria-pressed', 'false');
    first.classList.add('is-wrong');
    card.classList.add('is-wrong');
    playSound('matchWrong');
    setFeedback(feedback, 'Chưa đúng rồi. Em hãy quan sát mối liên hệ và thử lại nhé!', 'error');
    selected = null;
    window.setTimeout(() => {
      first.classList.remove('is-wrong');
      card.classList.remove('is-wrong');
    }, 500);
  };

  cards.forEach((card) => card.addEventListener('click', () => selectCard(card)));
  resetButton.addEventListener('click', () => {
    selected = null;
    completed = 0;
    clearTemporary();
    cards.forEach((card) => {
      card.disabled = false;
      card.classList.remove('is-matched');
      card.removeAttribute('aria-label');
      card.setAttribute('aria-pressed', 'false');
    });
    counter.textContent = '0';
    setFeedback(feedback, 'Hãy chọn hai thẻ để tạo một cặp.');
    cards[0].focus();
  });
}

function setupQuiz(playSound) {
  const options = [...document.querySelectorAll('.answer-option')];
  const inputs = [...document.querySelectorAll('input[name="answer"]')];
  const check = document.querySelector('#check-answer');
  const reset = document.querySelector('#reset-quiz');
  const feedback = document.querySelector('#quiz-feedback');
  const conclusion = document.querySelector('#conclusion');

  const clearStyles = () => options.forEach((option) => option.classList.remove('is-correct', 'is-wrong'));
  inputs.forEach((input) => input.addEventListener('change', clearStyles));

  check.addEventListener('click', () => {
    const selected = document.querySelector('input[name="answer"]:checked');
    const result = evaluateAnswer(selected?.value ?? '');
    clearStyles();
    if (!selected) {
      setFeedback(feedback, 'Em hãy chọn một phương án trước khi kiểm tra.', 'error');
      inputs[0].focus();
      return;
    }

    const selectedLabel = selected.closest('.answer-option');
    if (result.correct) {
      selectedLabel.classList.add('is-correct');
      setFeedback(feedback, 'Chính xác! Sông ngòi cung cấp nước, phù sa và đường giao thông — những điều kiện quan trọng để cư dân ổn định đời sống và phát triển.', 'success');
      conclusion.hidden = false;
      playSound('quizCorrect');
      conclusion.focus({ preventScroll: true });
      return;
    }

    selectedLabel.classList.add('is-wrong');
    conclusion.hidden = true;
    playSound('quizWrong');
    const message = result.kind === 'effort'
      ? 'Hãy nghĩ lại: điều kiện tự nhiên rất thuận lợi, nhưng lương thực vẫn cần sức lao động và sự tổ chức của con người.'
      : 'Hãy quan sát lại vai trò của nguồn nước, phù sa và đường đi lại đối với đời sống cư dân.';
    setFeedback(feedback, message, 'error');
  });

  reset.addEventListener('click', () => {
    inputs.forEach((input) => { input.checked = false; });
    clearStyles();
    conclusion.hidden = true;
    setFeedback(feedback, 'Chọn một phương án rồi kiểm tra đáp án.');
    inputs[0].focus();
  });
}

function setupNavigation() {
  const links = [...document.querySelectorAll('[data-nav]')];
  const sections = [...document.querySelectorAll('main > section')];
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => link.classList.toggle('is-active', link.dataset.nav === visible.target.id));
  }, { rootMargin: '-20% 0px -60%', threshold: [0, .2, .5] });
  sections.forEach((section) => observer.observe(section));
}

function init() {
  const playSound = createSoundPlayer();
  setupMap();
  setupGame(playSound);
  setupQuiz(playSound);
  setupNavigation();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}
