// Leonida Trophy Guide — checklist, tracker, filters, spoiler setting and
// roadmap for the 55 Grand Theft Auto VI trophies. All data lives in
// data/trophies.json; progress lives in localStorage; nothing is fetched
// from the network at run time.
const STORAGE_KEY = 'leonida-trophy-guide-v1';
const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
const KIND_LABEL = {
  story: 'Story / missions',
  activity: 'Activities',
  collectible: 'Collectibles',
  combat: 'Combat',
  exploration: 'Exploration',
  robbery: 'Robberies',
  completion: 'Completion',
};
const SHOT_SEED = [2, 3, 8, 15, 16, 21, 31, 35, 42, 53, 54];

const listEl = document.getElementById('trophyList');
const emptyEl = document.getElementById('emptyState');
const resultCountEl = document.getElementById('resultCount');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const kindEl = document.getElementById('kindFilter');
const earnedEl = document.getElementById('earnedFilter');
const missableEl = document.getElementById('missableOnly');
const spoilerEl = document.getElementById('spoilerToggle');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = new Set(readStoredProgress());
let openGuideId = null;

function readStoredProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter((id) => trophies.some((t) => t.id === id)) : [];
  } catch {
    return [];
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeCountsText() {
  return ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => {
      const total = trophies.filter((t) => t.grade === g).length;
      const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
      return `${got}/${total} ${g}`;
    })
    .join(' · ');
}

function renderProgress() {
  const total = trophies.length;
  const pct = Math.round((earned.size / total) * 100);
  document.getElementById('progressText').textContent = `${earned.size} of ${total} earned`;
  document.getElementById('progressPct').textContent = `${pct}%`;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('gradeCounts').textContent = gradeCountsText();
}

function isSpoilerHidden(trophy) {
  return spoilerEl.checked && trophy.hidden && !earned.has(trophy.id);
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
    if (earnedEl.value === 'earned' && !earned.has(t.id)) return false;
    if (earnedEl.value === 'remaining' && earned.has(t.id)) return false;
    if (missableEl.checked && !t.missable) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function tagEl(text, cls) {
  const s = document.createElement('span');
  s.className = `tag${cls ? ` ${cls}` : ''}`;
  s.textContent = text;
  return s;
}

function renderGuidePanel(trophy, card) {
  const panel = document.createElement('div');
  panel.className = 'trophy-guide';
  const h = document.createElement('h4');
  h.textContent = `How to earn it — ${trophy.name}`;
  panel.append(h);
  if (trophy.guide.startsWith('No verified')) {
    const note = document.createElement('p');
    note.className = 'unverified';
    note.textContent = 'Not yet verified — this guide says so honestly instead of inventing steps. See the sources below for the latest.';
    panel.append(note);
  }
  const p = document.createElement('p');
  p.textContent = trophy.guide;
  panel.append(p);
  const srcTitle = document.createElement('p');
  srcTitle.textContent = 'Sources:';
  panel.append(srcTitle);
  const ul = document.createElement('ul');
  for (const s of trophy.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    li.append(a);
    ul.append(li);
  }
  panel.append(ul);
  card.append(panel);
  return panel;
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren();
  resultCountEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies${earned.size ? ` — ${earned.size} earned` : ''}.`;
  emptyEl.hidden = shown.length !== 0;
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy';
    li.dataset.id = String(t.id);
    const isEarned = earned.has(t.id);
    const hiddenSpoiler = isSpoilerHidden(t);
    if (isEarned) li.classList.add('earned');
    if (t.missable) li.classList.add('missable-flag');

    const badge = document.createElement('span');
    badge.className = `grade-badge ${t.grade}`;
    badge.textContent = GRADE_LETTER[t.grade];
    badge.title = t.grade;
    li.append(badge);

    const body = document.createElement('div');
    const name = document.createElement('h3');
    name.className = 'trophy-name';
    name.textContent = hiddenSpoiler ? 'Hidden Trophy' : t.name;
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = hiddenSpoiler
      ? 'Hidden on PlayStation until earned — tick it off to reveal it.'
      : t.description;
    body.append(name, desc);

    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(tagEl(t.grade));
    meta.append(tagEl(KIND_LABEL[t.kind] || t.kind));
    if (t.hidden) meta.append(tagEl('Hidden', 'hidden-tag'));
    if (t.missable) meta.append(tagEl('⚠ Missable', 'missable'));
    body.append(meta);
    li.append(body);

    const actions = document.createElement('div');
    actions.className = 'trophy-actions';
    const earnBtn = document.createElement('button');
    earnBtn.type = 'button';
    earnBtn.className = `earn-btn${isEarned ? ' earned' : ''}`;
    earnBtn.textContent = isEarned ? '✓ Earned' : 'Mark earned';
    earnBtn.setAttribute('aria-pressed', String(isEarned));
    earnBtn.addEventListener('click', () => {
      if (earned.has(t.id)) earned.delete(t.id);
      else earned.add(t.id);
      saveProgress();
      renderProgress();
      renderList();
    });
    const guideBtn = document.createElement('button');
    guideBtn.type = 'button';
    guideBtn.className = 'guide-btn';
    guideBtn.textContent = openGuideId === t.id ? 'Hide guide' : 'Read guide';
    guideBtn.disabled = hiddenSpoiler;
    guideBtn.addEventListener('click', () => {
      openGuideId = openGuideId === t.id ? null : t.id;
      renderList();
      if (openGuideId === t.id) {
        const card = listEl.querySelector(`[data-id="${t.id}"] .trophy-guide`);
        if (card) card.scrollIntoView({ block: 'nearest' });
      }
    });
    actions.append(earnBtn, guideBtn);
    li.append(actions);

    if (openGuideId === t.id && !hiddenSpoiler) renderGuidePanel(t, li);
    listEl.append(li);
  }
}

function renderKindSummary() {
  const ul = document.getElementById('kindSummary');
  ul.replaceChildren();
  for (const [kind, label] of Object.entries(KIND_LABEL)) {
    const group = trophies.filter((t) => t.kind === kind);
    if (!group.length) continue;
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = `${label} — ${group.map((t) => t.name).slice(0, 3).join(', ')}${group.length > 3 ? ', …' : ''}`;
    const count = document.createElement('span');
    count.className = 'kind-count';
    count.textContent = `${group.filter((t) => earned.has(t.id)).length}/${group.length}`;
    li.append(name, count);
    ul.append(li);
  }
}

function showTab(which) {
  const checklist = which === 'checklist';
  document.getElementById('viewChecklist').hidden = !checklist;
  document.getElementById('viewRoadmap').hidden = checklist;
  document.getElementById('tabChecklist').classList.toggle('active', checklist);
  document.getElementById('tabRoadmap').classList.toggle('active', !checklist);
  document.getElementById('tabChecklist').setAttribute('aria-selected', String(checklist));
  document.getElementById('tabRoadmap').setAttribute('aria-selected', String(!checklist));
  if (!checklist) renderKindSummary();
}

document.getElementById('tabChecklist').addEventListener('click', () => showTab('checklist'));
document.getElementById('tabRoadmap').addEventListener('click', () => showTab('roadmap'));
for (const el of [searchEl, gradeEl, kindEl, earnedEl, missableEl, spoilerEl]) {
  el.addEventListener('input', renderList);
  el.addEventListener('change', renderList);
}

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = {
    game: 'Grand Theft Auto VI',
    exported: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    earned = new Set(ids.filter((id) => trophies.some((t) => t.id === id)));
    saveProgress();
    renderProgress();
    renderList();
  } catch {
    resultCountEl.textContent = 'That file could not be imported — it is not a Leonida Trophy Guide progress file.';
  }
  e.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!earned.size) return;
  if (window.confirm('Clear all earned trophies?')) {
    earned = new Set();
    openGuideId = null;
    saveProgress();
    renderProgress();
    renderList();
  }
});

// Deterministic screenshot scenes (?shot=checklist | detail | roadmap): seed a
// fixed demo progress so every screenshot is reproducible.
const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  earned = new Set(SHOT_SEED);
  saveProgress();
  if (shot === 'roadmap') {
    document.body.classList.add('shot-roadmap');
    showTab('roadmap');
  } else if (shot === 'detail') {
    document.body.classList.add('shot-detail');
    openGuideId = 28;
  }
}

renderProgress();
renderList();
if (shot === 'detail') {
  // Sit the open guide just below the sticky tab bar, not under it.
  const card = listEl.querySelector('[data-id="28"]');
  if (card) {
    card.scrollIntoView({ block: 'start' });
    window.scrollBy(0, -76);
  }
}
if (shot === 'roadmap-steps') {
  document.body.classList.add('shot-roadmap');
  showTab('roadmap');
  const steps = document.querySelector('.steps');
  if (steps) {
    steps.scrollIntoView({ block: 'start' });
    window.scrollBy(0, -76);
  }
}
window.__shotReady = true;
