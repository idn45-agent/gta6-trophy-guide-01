// Leonida Trophy Guide — entry point: loads the trophy data, wires the
// filters, views, detail panel and progress tools, and keeps the header
// progress bar honest. Run it by opening app/index.html from any static
// server with app/ at the root; nothing here fetches outside app/.
import {
  STORAGE_KEY,
  blankProgress,
  earnedCount,
  exportProgress,
  loadProgress,
  loadTrophies,
  parseImportedProgress,
  saveProgress,
  setEarned,
} from './store.js';
import { filterTrophies, gradeCounts } from './filters.js';
import { renderDetail, renderList } from './render.js';
import { renderMissables, renderNextUp, renderRoadmap } from './views.js';

const elements = {
  search: document.getElementById('search'),
  gradeFilter: document.getElementById('gradeFilter'),
  kindFilter: document.getElementById('kindFilter'),
  stageFilter: document.getElementById('stageFilter'),
  statusFilter: document.getElementById('statusFilter'),
  missableOnly: document.getElementById('missableOnly'),
  spoilerToggle: document.getElementById('spoilerToggle'),
  trophyList: document.getElementById('trophyList'),
  detailPanel: document.getElementById('detailPanel'),
  listMeta: document.getElementById('listMeta'),
  earnedCount: document.getElementById('earnedCount'),
  progressText: document.getElementById('progressText'),
  progressBar: document.getElementById('progressBar'),
  gradeCounts: document.getElementById('gradeCounts'),
  roadmapStages: document.getElementById('roadmapStages'),
  missablesList: document.getElementById('missablesList'),
  nextupList: document.getElementById('nextupList'),
  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  importFile: document.getElementById('importFile'),
  resetBtn: document.getElementById('resetBtn'),
};

let trophies = [];
let progress = loadProgress();
let selectedId = null;
let currentView = 'checklist';

function currentFilters() {
  return {
    query: elements.search.value,
    grade: elements.gradeFilter.value,
    kind: elements.kindFilter.value,
    stage: elements.stageFilter.value,
    status: elements.statusFilter.value,
    missableOnly: elements.missableOnly.checked,
  };
}

function selectedTrophy() {
  return trophies.find((trophy) => trophy.id === selectedId) || null;
}

function refreshHeader() {
  const earned = earnedCount(progress, trophies);
  const total = trophies.length;
  const percent = total ? Math.round((earned / total) * 100) : 0;
  elements.earnedCount.textContent = `${earned} / ${total}`;
  elements.progressText.textContent = `${percent}% to the platinum`;
  elements.progressBar.style.width = `${percent}%`;
  const counts = gradeCounts(trophies, progress);
  elements.gradeCounts.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((grade) => `${grade}: ${counts[grade]?.earned || 0}/${counts[grade]?.total || 0}`)
    .join(' · ');
}

function refreshAll() {
  const filtered = filterTrophies(trophies, progress, currentFilters());
  elements.listMeta.textContent = `Showing ${filtered.length} of ${trophies.length} trophies.`;
  renderList(elements.trophyList, filtered, progress, selectedId, {
    onSelect: selectTrophy,
    onProgressChanged: refreshAll,
  });
  renderDetail(elements.detailPanel, selectedTrophy(), progress, {
    onProgressChanged: refreshAll,
  });
  renderRoadmap(elements.roadmapStages, trophies, progress);
  renderMissables(elements.missablesList, trophies, progress, {
    setEarned,
    onSelect: selectTrophy,
    onProgressChanged: refreshAll,
  });
  renderNextUp(elements.nextupList, trophies, progress, {
    onSelect: selectTrophy,
  });
  refreshHeader();
}

function selectTrophy(id) {
  selectedId = id;
  showView('checklist');
  refreshAll();
  const panel = elements.detailPanel;
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showView(name) {
  currentView = name;
  for (const tab of document.querySelectorAll('.view-tab')) {
    tab.classList.toggle('active', tab.dataset.view === name);
  }
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('active', section.id === `view-${name}`);
  }
}

function applyShotParam() {
  const params = new URLSearchParams(window.location.search);
  const seed = Number(params.get('seed'));
  if (Number.isFinite(seed) && seed > 0 && earnedCount(progress, trophies) === 0) {
    for (const trophy of trophies.slice(0, Math.min(seed, trophies.length))) {
      progress.earned[trophy.id] = true;
    }
    saveProgress(progress);
  }
  const shot = params.get('shot');
  if (shot === 'roadmap') showView('roadmap');
  else if (shot === 'missables') showView('missables');
  else if (shot === 'nextup') showView('nextup');
  else if (shot === 'detail') selectedId = 21;
  else if (shot === 'checklist') selectedId = 17;
}

function wireEvents() {
  for (const tab of document.querySelectorAll('.view-tab')) {
    tab.addEventListener('click', () => {
      showView(tab.dataset.view);
      refreshAll();
    });
  }
  for (const control of [elements.search, elements.gradeFilter, elements.kindFilter, elements.stageFilter, elements.statusFilter, elements.missableOnly]) {
    control.addEventListener('input', refreshAll);
    control.addEventListener('change', refreshAll);
  }
  elements.spoilerToggle.checked = Boolean(progress.spoilers);
  elements.spoilerToggle.addEventListener('change', () => {
    progress.spoilers = elements.spoilerToggle.checked;
    saveProgress(progress);
    refreshAll();
  });
  elements.exportBtn.addEventListener('click', () => exportProgress(progress));
  elements.importBtn.addEventListener('click', () => elements.importFile.click());
  elements.importFile.addEventListener('change', async () => {
    const file = elements.importFile.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      progress = parseImportedProgress(text);
      saveProgress(progress);
      elements.spoilerToggle.checked = Boolean(progress.spoilers);
      refreshAll();
    } catch (error) {
      alert(`Could not import that file: ${error.message}`);
    }
    elements.importFile.value = '';
  });
  elements.resetBtn.addEventListener('click', () => {
    if (!window.confirm('Clear all saved progress, counters and notes?')) return;
    progress = blankProgress();
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* keep going */ }
    selectedId = null;
    refreshAll();
  });
}

async function boot() {
  try {
    trophies = await loadTrophies();
  } catch (error) {
    elements.listMeta.textContent = `Could not load the trophy list: ${error.message}`;
    return;
  }
  wireEvents();
  applyShotParam();
  refreshAll();
  // Signal for screenshot tooling: the first render is done.
  window.__shotReady = true;
}

boot();
