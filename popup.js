
const PLATES = [
  {
    id: 1,
    number: 12,
    dotColors: { figure: '#e04040', background: '#a0a040' },
    correctAnswer: '12',
    cantSeeAnswer: 'protan',      
    choices: ['12', '13', '17'],
    hint: 'Normal & deuteranopia see 12; protanopia may see nothing',
  },
  {
    id: 2,
    number: 8,
    dotColors: { figure: '#e08030', background: '#30a030' },
    correctAnswer: '8',
    cantSeeAnswer: 'deutan',
    choices: ['3', '8', '6'],
    hint: 'Normal sees 8; deuteranopia sees 3',
  },
  {
    id: 3,
    number: 6,
    dotColors: { figure: '#c060c0', background: '#60c060' },
    correctAnswer: '6',
    cantSeeAnswer: 'tritan',
    choices: ['5', '6', '9'],
    hint: 'Normal sees 6; tritanopia may see 5',
  },
  {
    id: 4,
    number: 29,
    dotColors: { figure: '#e03030', background: '#50a050' },
    correctAnswer: '29',
    cantSeeAnswer: 'protan',
    choices: ['70', '29', '21'],
    hint: 'Normal sees 29; protanopia sees 70',
  },
  {
    id: 5,
    number: 57,
    dotColors: { figure: '#d06020', background: '#4080a0' },
    correctAnswer: '57',
    cantSeeAnswer: 'tritan',
    choices: ['35', '57', '53'],
    hint: 'Normal sees 57; tritanopia sees 35',
  },
  {
    id: 6,
    number: 45,
    dotColors: { figure: '#d03030', background: '#909020' },
    correctAnswer: '45',
    cantSeeAnswer: 'deutan',
    choices: ['45', '43', 'None'],
    hint: 'Normal sees 45; deuteranopia difficulty',
  },
  {
    id: 7,
    number: 73,
    dotColors: { figure: '#b04040', background: '#404090' },
    correctAnswer: '73',
    cantSeeAnswer: 'tritan',
    choices: ['73', '23', '72'],
    hint: 'Normal sees 73; tritanopia confusion',
  },
  {
    id: 8,
    number: 16,
    dotColors: { figure: '#208040', background: '#804020' },
    correctAnswer: '16',
    cantSeeAnswer: 'protan',
    choices: ['16', '10', '76'],
    hint: 'Normal sees 16; protanopia difficulty',
  },
];

// Scoring: track which type of errors
const scores = {
  protan: 0,
  deutan: 0,
  tritan: 0,
  normal: 0,
};
let currentPlate = 0;
let answered = false;


function drawPlate(plate) {
  const canvas = document.getElementById('plateCanvas');
  const ctx = canvas.getContext('2d');
  const W = 200, H = 200, R = 97;
  ctx.clearRect(0, 0, W, H);

  const bgColor = plate.dotColors.background;
  const fgColor = plate.dotColors.figure;


  for (let i = 0; i < 500; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * R;
    const x = W / 2 + r * Math.cos(angle);
    const y = H / 2 + r * Math.sin(angle);
    const radius = 3 + Math.random() * 5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = varyColor(bgColor, 25);
    ctx.fill();
  }


  const numStr = String(plate.number);
  renderNumberAsDots(ctx, numStr, fgColor, W, H, R);
}

function varyColor(hex, amount) {
  const r = clamp(parseInt(hex.slice(1, 3), 16) + rand(-amount, amount));
  const g = clamp(parseInt(hex.slice(3, 5), 16) + rand(-amount, amount));
  const b = clamp(parseInt(hex.slice(5, 7), 16) + rand(-amount, amount));
  return `rgb(${r},${g},${b})`;
}
function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const DIGIT_MATRIX = {
  '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2': [[1,1,1],[0,0,1],[0,0,1],[1,1,1],[1,0,0],[1,0,0],[1,1,1]],
  '3': [[1,1,1],[0,0,1],[0,0,1],[0,1,1],[0,0,1],[0,0,1],[1,1,1]],
  '4': [[1,0,1],[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1],[0,0,1]],
  '5': [[1,1,1],[1,0,0],[1,0,0],[1,1,1],[0,0,1],[0,0,1],[1,1,1]],
  '6': [[1,1,1],[1,0,0],[1,0,0],[1,1,1],[1,0,1],[1,0,1],[1,1,1]],
  '7': [[1,1,1],[0,0,1],[0,0,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
  '8': [[1,1,1],[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,1,1]],
  '9': [[1,1,1],[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1],[1,1,1]],
};

function renderNumberAsDots(ctx, numStr, color, W, H, R) {
  const digitCount = numStr.length;
  const cellW = 12, cellH = 14, dotR = 4.5;
  const totalW = digitCount * (3 * cellW) + (digitCount - 1) * cellW;
  let startX = W / 2 - totalW / 2;
  const startY = H / 2 - 3.5 * cellH;

  for (const ch of numStr) {
    const matrix = DIGIT_MATRIX[ch] || DIGIT_MATRIX['0'];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 3; col++) {
        if (matrix[row][col]) {
          const cx = startX + col * cellW + cellW / 2;
          const cy = startY + row * cellH + cellH / 2;
          // Only draw if inside circle
          const dx = cx - W / 2, dy = cy - H / 2;
          if (dx * dx + dy * dy < (R - 8) * (R - 8)) {
            // Draw several overlapping dots to fill
            for (let k = 0; k < 4; k++) {
              const ox = rand(-2, 2), oy = rand(-2, 2);
              ctx.beginPath();
              ctx.arc(cx + ox, cy + oy, dotR + Math.random() * 2, 0, Math.PI * 2);
              ctx.fillStyle = varyColor(color, 20);
              ctx.fill();
            }
          }
        }
      }
    }
    startX += 4 * cellW;
  }
}

function renderChoices(plate) {
  const container = document.getElementById('choices');
  container.innerHTML = '';
  plate.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = choice;
    btn.addEventListener('click', () => handleAnswer(choice, plate, btn));
    container.appendChild(btn);
  });
}

function handleAnswer(choice, plate, btn) {
  if (answered) return;
  answered = true;

  const isCorrect = choice === plate.correctAnswer;

  document.querySelectorAll('.choice-btn').forEach(b => {
    if (b.textContent === plate.correctAnswer) b.classList.add('correct');
  });

  if (!isCorrect) {
    btn.classList.add('wrong');
    scores[plate.cantSeeAnswer]++;
  } else {
    scores.normal++;
  }

  setTimeout(() => nextPlate(), 900);
}

document.getElementById('cantSeeBtn').addEventListener('click', () => {
  if (answered) return;
  answered = true;
  const plate = PLATES[currentPlate];
  scores[plate.cantSeeAnswer] += 2; // stronger signal
  setTimeout(() => nextPlate(), 400);
});

function nextPlate() {
  currentPlate++;
  if (currentPlate >= PLATES.length) {
    showResult();
    return;
  }
  loadPlate(currentPlate);
}

function loadPlate(idx) {
  answered = false;
  const plate = PLATES[idx];
  document.getElementById('plateLabel').textContent = `Plate ${idx + 1} of ${PLATES.length}`;
  drawPlate(plate);
  renderChoices(plate);
}

function diagnose() {
  const { protan, deutan, tritan } = scores;
  const total = protan + deutan + tritan;

  if (total === 0) return { type: 'Normal Vision', mode: 'none', desc: 'Great news! You appear to have normal color vision. No filter is needed.' };

  const max = Math.max(protan, deutan, tritan);
  if (max === protan) return {
    type: 'Protanopia / Protanomaly',
    mode: 'protanopia',
    desc: 'You likely have reduced sensitivity to red light. The Protanopia filter will shift reds to more distinguishable hues for you.',
  };
  if (max === deutan) return {
    type: 'Deuteranopia / Deuteranomaly',
    mode: 'deuteranopia',
    desc: 'You likely have reduced sensitivity to green light. The Deuteranopia filter rebalances red-green confusion on web pages.',
  };
  return {
    type: 'Tritanopia / Tritanomaly',
    mode: 'tritanopia',
    desc: 'You likely have reduced sensitivity to blue light. The Tritanopia filter adjusts blue-yellow contrasts across the page.',
  };
}

function showResult() {
  document.getElementById('choices').style.display = 'none';
  document.getElementById('cantSeeBtn').style.display = 'none';
  document.getElementById('plateCounter').textContent = 'Test complete!';
  document.getElementById('plateLabel').textContent = '';

  const diagnosis = diagnose();
  document.getElementById('resultType').textContent = diagnosis.type;
  document.getElementById('resultDesc').textContent = diagnosis.desc;
  document.getElementById('resultBox').classList.add('show');

  // Pre-select mode in adapt tab
  currentMode = diagnosis.mode;
  saveSettings();

  document.getElementById('applyResult').addEventListener('click', () => {
    applyFilterToTab(diagnosis.mode, 100, false);
    updateStatusDot(diagnosis.mode !== 'none');
  });
}

document.getElementById('retakeBtn').addEventListener('click', () => {
  currentPlate = 0;
  scores.protan = 0; scores.deutan = 0; scores.tritan = 0; scores.normal = 0;
  document.getElementById('choices').style.display = '';
  document.getElementById('cantSeeBtn').style.display = '';
  document.getElementById('plateCounter').textContent = 'What number do you see?';
  document.getElementById('resultBox').classList.remove('show');
  loadPlate(0);
});

function applyFilterToTab(mode, intensity, enhanceText) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'applyFilter',
      mode,
      intensity: intensity / 100,
      enhanceText,
    });
  });
}

let currentMode = 'none';

document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    currentMode = card.dataset.mode;
  });
});

const intensitySlider = document.getElementById('intensitySlider');
const intensityVal = document.getElementById('intensityVal');
intensitySlider.addEventListener('input', () => {
  intensityVal.textContent = intensitySlider.value + '%';
});

document.getElementById('btnApply').addEventListener('click', () => {
  const intensity = parseInt(intensitySlider.value);
  const enhanceText = document.getElementById('enhanceText').checked;
  applyFilterToTab(currentMode, intensity, enhanceText);
  updateStatusDot(currentMode !== 'none');
  if (document.getElementById('autoApply').checked) saveSettings();
});

document.getElementById('btnReset').addEventListener('click', () => {
  applyFilterToTab('none', 100, false);
  updateStatusDot(false);
});

function saveSettings() {
  chrome.storage.local.set({
    mode: currentMode,
    intensity: intensitySlider.value,
    enhanceText: document.getElementById('enhanceText').checked,
    autoApply: document.getElementById('autoApply').checked,
  });
}

function loadSettings() {
  chrome.storage.local.get(['mode', 'intensity', 'enhanceText', 'autoApply'], (data) => {
    if (data.mode) {
      currentMode = data.mode;
      document.querySelectorAll('.mode-card').forEach(c => {
        c.classList.toggle('selected', c.dataset.mode === currentMode);
      });
    }
    if (data.intensity) {
      intensitySlider.value = data.intensity;
      intensityVal.textContent = data.intensity + '%';
    }
    if (data.enhanceText) document.getElementById('enhanceText').checked = true;
    if (data.autoApply) {
      document.getElementById('autoApply').checked = true;
      applyFilterToTab(currentMode, parseInt(intensitySlider.value), data.enhanceText);
      updateStatusDot(currentMode !== 'none');
    }
  });
}

function updateStatusDot(active) {
  document.getElementById('statusDot').classList.toggle('active', active);
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});
loadPlate(0);
loadSettings();
