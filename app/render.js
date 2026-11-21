// Leonida Trophy Guide — render: the checklist rows and the trophy detail
// panel. Every row and panel is built from the trophy data and the saved
// progress; no HTML is fetched from anywhere.
import { getCounter, getNote, isEarned, setCounter, setEarned, setNote } from './store.js';
import { displayDescription, displayName, isSpoilerHidden } from './filters.js';

export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function counterText(trophy, progress) {
  if (!trophy.target) return '';
  const have = getCounter(progress, trophy.id);
  const label = trophy.targetLabel || 'progress';
  return `${have} / ${trophy.target.toLocaleString('en-US')} ${label}`;
}

export function renderList(listElement, trophies, progress, selectedId, callbacks) {
  listElement.innerHTML = '';
  for (const trophy of trophies) {
    const item = document.createElement('li');
    item.className = 'trophy-row' + (isEarned(progress, trophy.id) ? ' earned' : '') + (trophy.id === selectedId ? ' selected' : '');
    item.dataset.id = String(trophy.id);
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isEarned(progress, trophy.id);
    checkbox.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    checkbox.addEventListener('change', () => {
      setEarned(progress, trophy.id, checkbox.checked);
      callbacks.onProgressChanged();
    });
    checkbox.addEventListener('click', (event) => event.stopPropagation());
    const badge = document.createElement('span');
    badge.className = `grade-badge grade-${trophy.grade}`;
    badge.textContent = gradeLabel(trophy.grade);
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = displayName(trophy, progress);
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = displayDescription(trophy, progress);
    const tags = document.createElement('div');
    tags.className = 'trophy-tags';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = kindLabel(trophy.kind);
    tags.appendChild(kindTag);
    const stageTag = document.createElement('span');
    stageTag.className = 'tag stage';
    stageTag.textContent = `Stage ${trophy.stage}`;
    tags.appendChild(stageTag);
    if (trophy.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = 'Missable';
      tags.appendChild(missTag);
    }
    body.append(name, desc, tags);
    const count = document.createElement('span');
    count.className = 'trophy-count';
    count.textContent = counterText(trophy, progress);
    item.append(checkbox, badge, body, count);
    item.addEventListener('click', () => callbacks.onSelect(trophy.id));
    listElement.appendChild(item);
  }
}

export function renderDetail(panel, trophy, progress, callbacks) {
  panel.innerHTML = '';
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Select a trophy to read its guide, steps, sources and tracker.';
    panel.appendChild(empty);
    return;
  }
  const hidden = isSpoilerHidden(trophy, progress);
  const heading = document.createElement('h2');
  heading.textContent = displayName(trophy, progress);
  const gradeRow = document.createElement('div');
  gradeRow.className = 'detail-grade';
  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${trophy.grade}`;
  badge.textContent = gradeLabel(trophy.grade);
  gradeRow.appendChild(badge);
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = `${kindLabel(trophy.kind)} · Stage ${trophy.stage}`;
  gradeRow.appendChild(kindTag);
  if (trophy.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable';
    missTag.textContent = 'Missable';
    gradeRow.appendChild(missTag);
  }
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = displayDescription(trophy, progress);
  panel.append(heading, gradeRow, desc);
  if (trophy.missable && trophy.missableNote) {
    const note = document.createElement('p');
    note.className = 'missable-note';
    note.textContent = trophy.missableNote;
    panel.appendChild(note);
  }
  const earnedLine = document.createElement('p');
  earnedLine.className = 'earned-line';
  earnedLine.textContent = isEarned(progress, trophy.id) ? '✓ Earned — well done.' : 'Not earned yet.';
  panel.appendChild(earnedLine);
  if (!hidden) {
    const guideHeading = document.createElement('h3');
    guideHeading.textContent = 'Guide';
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    panel.append(guideHeading, guide);
    if (trophy.steps && trophy.steps.length) {
      const stepsHeading = document.createElement('h3');
      stepsHeading.textContent = 'Steps';
      const steps = document.createElement('ol');
      for (const step of trophy.steps) {
        const li = document.createElement('li');
        li.textContent = step;
        steps.appendChild(li);
      }
      panel.append(stepsHeading, steps);
    }
    if (trophy.sources && trophy.sources.length) {
      const sourcesHeading = document.createElement('h3');
      sourcesHeading.textContent = 'Sources';
      const list = document.createElement('ul');
      list.className = 'source-list';
      for (const source of trophy.sources) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = source.url;
        link.textContent = source.name;
        link.target = '_blank';
        link.rel = 'noopener';
        li.appendChild(link);
        list.appendChild(li);
      }
      panel.append(sourcesHeading, list);
    }
  } else {
    const hiddenNote = document.createElement('p');
    hiddenNote.textContent = 'The guide, steps and sources for this story trophy are hidden until you earn it (or turn the spoiler setting off).';
    panel.appendChild(hiddenNote);
  }
  if (trophy.target) {
    const box = document.createElement('div');
    box.className = 'counter-box';
    const label = document.createElement('label');
    label.textContent = `Counter — ${trophy.targetLabel || 'progress'} (target ${trophy.target.toLocaleString('en-US')})`;
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = String(trophy.target);
    input.value = String(getCounter(progress, trophy.id));
    input.setAttribute('aria-label', `Counter for ${trophy.name}`);
    input.addEventListener('change', () => {
      setCounter(progress, trophy.id, input.value);
      callbacks.onProgressChanged();
    });
    box.append(label, input);
    panel.appendChild(box);
  }
  const noteBox = document.createElement('div');
  noteBox.className = 'note-box';
  const noteLabel = document.createElement('label');
  noteLabel.textContent = 'Your notes';
  const noteArea = document.createElement('textarea');
  noteArea.value = getNote(progress, trophy.id);
  noteArea.placeholder = 'Your own notes for this trophy — route, loadout, where you left off…';
  noteArea.setAttribute('aria-label', `Notes for ${trophy.name}`);
  noteArea.addEventListener('change', () => {
    setNote(progress, trophy.id, noteArea.value);
  });
  noteBox.append(noteLabel, noteArea);
  panel.appendChild(noteBox);
}
