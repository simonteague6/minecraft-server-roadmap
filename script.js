/* Server Roadmap — progress tracking via localStorage */

const STORAGE_KEY = 'mc-roadmap-progress-v1';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function allCheckboxes() {
  return Array.from(document.querySelectorAll('.task input[type="checkbox"]'));
}

function updateUI() {
  const boxes = allCheckboxes();
  const done = boxes.filter(b => b.checked).length;
  const total = boxes.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  document.getElementById('xp-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent = done + ' / ' + total + ' complete';
  document.getElementById('progress-pct').textContent = pct + '%';

  // per-phase counts + done styling
  document.querySelectorAll('.phase').forEach(phase => {
    const pBoxes = phase.querySelectorAll('.task input[type="checkbox"]');
    const pDone = phase.querySelectorAll('.task input[type="checkbox"]:checked').length;
    const counter = phase.querySelector('.phase-count');
    if (counter && pBoxes.length > 0) counter.textContent = pDone + '/' + pBoxes.length;
  });

  boxes.forEach(b => b.closest('.task').classList.toggle('done', b.checked));
}

let toastTimer = null;
function showToast(title, msg) {
  const toast = document.getElementById('toast');
  toast.querySelector('.t-title').textContent = title;
  toast.querySelector('.t-msg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

function checkPhaseComplete(box) {
  const phase = box.closest('.phase');
  if (!phase) return;
  const boxes = phase.querySelectorAll('.task input[type="checkbox"]');
  const done = phase.querySelectorAll('.task input[type="checkbox"]:checked').length;
  if (boxes.length > 0 && done === boxes.length) {
    const name = phase.querySelector('h2').textContent.trim();
    showToast('Advancement Made!', name + ' — phase complete');
  }
}

function init() {
  const progress = loadProgress();

  allCheckboxes().forEach(box => {
    const id = box.closest('.task').dataset.id;
    box.checked = !!progress[id];

    box.addEventListener('change', () => {
      const p = loadProgress();
      if (box.checked) p[id] = true; else delete p[id];
      saveProgress(p);
      updateUI();
      if (box.checked) checkPhaseComplete(box);
    });
  });

  // whole row is clickable
  document.querySelectorAll('.task').forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.tagName === 'INPUT') return;
      const box = row.querySelector('input[type="checkbox"]');
      box.checked = !box.checked;
      box.dispatchEvent(new Event('change'));
    });
  });

  // collapsible phases
  document.querySelectorAll('.phase-header').forEach(header => {
    header.addEventListener('click', () => {
      const phase = header.closest('.phase');
      phase.classList.toggle('collapsed');
      header.querySelector('.phase-toggle').textContent =
        phase.classList.contains('collapsed') ? '+' : '−';
    });
  });

  // reset button
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!confirm('Reset all progress? This clears every checkbox.')) return;
    localStorage.removeItem(STORAGE_KEY);
    allCheckboxes().forEach(b => (b.checked = false));
    updateUI();
    showToast('World Reset', 'All progress cleared. Fresh spawn!');
  });

  // random splash text
  const splashes = [
    'Also try beating the game!',
    'Now with 100% more farms!',
    'Punch a tree!',
    'Iron farm first!',
    'Never dig straight down!',
    'Multiplayer!',
    'Free the villagers... to work!',
    'Water bucket clutch!',
    'Sleep to skip phantoms!',
    'Fortune III or nothing!'
  ];
  const splash = document.getElementById('splash');
  if (splash) splash.textContent = splashes[Math.floor(Math.random() * splashes.length)];

  updateUI();
}

document.addEventListener('DOMContentLoaded', init);
