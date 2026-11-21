// Leonida Trophy Guide — store: trophy data plus saved progress.
// Progress lives in localStorage under one key and can be exported to a
// JSON file and imported back. Nothing here touches the network except the
// one local fetch of data/trophies.json.
export const STORAGE_KEY = 'leonida-trophy-guide-v2';

export const STAGES = [
  { id: 1, name: 'Stage 1 — Story', blurb: 'Chapters 1–4 and the named story missions.' },
  { id: 2, name: 'Stage 2 — Strangers & side missions', blurb: 'Character chains, stranger strands and the partner trophies.' },
  { id: 3, name: 'Stage 3 — Activities & collectibles', blurb: 'Ranges, races, stunts, scans, cards, vaults and money.' },
  { id: 4, name: 'Stage 4 — Platinum cleanup', blurb: '100% Completion, then the platinum itself.' },
];

export function blankProgress() {
  return { earned: {}, counters: {}, notes: {}, spoilers: false };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankProgress();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return blankProgress();
    return {
      earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
      counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      spoilers: Boolean(parsed.spoilers),
    };
  } catch {
    return blankProgress();
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or unavailable: progress stays in memory for this visit.
  }
}

export function isEarned(progress, id) {
  return Boolean(progress.earned[id]);
}

export function setEarned(progress, id, earned) {
  if (earned) progress.earned[id] = true;
  else delete progress.earned[id];
  saveProgress(progress);
}

export function getCounter(progress, id) {
  const value = Number(progress.counters[id]);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function setCounter(progress, id, value) {
  const number = Math.max(0, Math.floor(Number(value) || 0));
  if (number === 0) delete progress.counters[id];
  else progress.counters[id] = number;
  saveProgress(progress);
}

export function getNote(progress, id) {
  return typeof progress.notes[id] === 'string' ? progress.notes[id] : '';
}

export function setNote(progress, id, text) {
  if (!text) delete progress.notes[id];
  else progress.notes[id] = text;
  saveProgress(progress);
}

export function earnedCount(progress, trophies) {
  return trophies.filter((trophy) => isEarned(progress, trophy.id)).length;
}

export function exportProgress(progress) {
  const payload = {
    app: 'leonida-trophy-guide',
    version: 2,
    exportedAt: new Date().toISOString(),
    progress,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  const inner = parsed && parsed.progress ? parsed.progress : parsed;
  if (!inner || typeof inner !== 'object') throw new Error('Not a Leonida progress file.');
  const progress = blankProgress();
  if (Array.isArray(inner.earned)) {
    for (const id of inner.earned) progress.earned[id] = true;
  } else if (inner.earned && typeof inner.earned === 'object') {
    for (const [id, value] of Object.entries(inner.earned)) {
      if (value) progress.earned[id] = true;
    }
  }
  if (inner.counters && typeof inner.counters === 'object') {
    for (const [id, value] of Object.entries(inner.counters)) {
      const number = Math.floor(Number(value));
      if (Number.isFinite(number) && number > 0) progress.counters[id] = number;
    }
  }
  if (inner.notes && typeof inner.notes === 'object') {
    for (const [id, value] of Object.entries(inner.notes)) {
      if (typeof value === 'string' && value) progress.notes[id] = value;
    }
  }
  progress.spoilers = Boolean(inner.spoilers);
  return progress;
}

export async function loadTrophies() {
  const response = await fetch('./data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json');
  const data = await response.json();
  const trophies = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(trophies)) throw new Error('trophies.json has no trophies array');
  return trophies;
}
