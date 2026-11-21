// Leonida Trophy Guide — views: the Roadmap stages with per-stage progress,
// the Missables list, and the Next-Up planner, which picks the most sensible
// next trophies from the player's earned set.
import { STAGES, isEarned } from './store.js';
import { displayDescription, displayName, stageProgress } from './filters.js';

function stageName(stageId) {
  const stage = STAGES.find((item) => item.id === Number(stageId));
  return stage ? stage.name : `Stage ${stageId}`;
}

export function renderRoadmap(container, trophies, progress) {
  container.innerHTML = '';
  for (const stage of STAGES) {
    const { total, earned, percent } = stageProgress(trophies, progress, stage.id);
    const card = document.createElement('div');
    card.className = 'stage-card';
    const heading = document.createElement('h3');
    heading.textContent = stage.name;
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${earned} / ${total} earned — ${percent}%`;
    const bar = document.createElement('div');
    bar.className = 'stage-bar';
    const fill = document.createElement('div');
    fill.className = 'stage-fill';
    fill.style.width = `${percent}%`;
    bar.appendChild(fill);
    const remaining = document.createElement('p');
    const left = trophies.filter((trophy) => Number(trophy.stage) === stage.id && !isEarned(progress, trophy.id));
    remaining.textContent = left.length
      ? `Still to do: ${left.slice(0, 6).map((trophy) => trophy.name).join(', ')}${left.length > 6 ? ` and ${left.length - 6} more` : ''}`
      : 'Stage complete.';
    card.append(heading, blurb, count, bar, remaining);
    container.appendChild(card);
  }
}

export function renderMissables(container, trophies, progress, callbacks) {
  container.innerHTML = '';
  const missable = trophies.filter((trophy) => trophy.missable);
  for (const trophy of missable) {
    const item = document.createElement('li');
    item.className = 'trophy-row' + (isEarned(progress, trophy.id) ? ' earned' : '');
    item.dataset.id = String(trophy.id);
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isEarned(progress, trophy.id);
    checkbox.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    checkbox.addEventListener('change', () => {
      const { setEarned } = callbacks;
      setEarned(progress, trophy.id, checkbox.checked);
      callbacks.onProgressChanged();
    });
    checkbox.addEventListener('click', (event) => event.stopPropagation());
    const badge = document.createElement('span');
    badge.className = `grade-badge grade-${trophy.grade}`;
    badge.textContent = trophy.grade.charAt(0).toUpperCase() + trophy.grade.slice(1);
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = displayName(trophy, progress);
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = displayDescription(trophy, progress);
    const warning = document.createElement('div');
    warning.className = 'missable-note';
    warning.textContent = trophy.missableNote || 'Can be missed — do it early.';
    body.append(name, desc, warning);
    const stage = document.createElement('span');
    stage.className = 'trophy-count';
    stage.textContent = stageName(trophy.stage);
    item.append(checkbox, badge, body, stage);
    item.addEventListener('click', () => callbacks.onSelect(trophy.id));
    container.appendChild(item);
  }
}

function nextUpReason(trophy) {
  if (trophy.missable) return 'Missable — do it before the story moves past it.';
  if (Number(trophy.stage) === 1) return 'Story trophy — it comes next in the main missions.';
  if (Number(trophy.stage) === 2) return 'Side mission — quick win in your current stage.';
  if (trophy.target && trophy.target <= 20) return 'Small counter — a fast win once you start it.';
  if (trophy.kind === 'activity') return 'Activity — try it once and tick it off.';
  return 'Next in the roadmap order.';
}

export function pickNextUp(trophies, progress, limit = 8) {
  const remaining = trophies.filter((trophy) => !isEarned(progress, trophy.id) && trophy.id !== 1);
  const score = (trophy) => {
    // Missable trophies always come first, in list order: the Chapter 1
    // meditation (id 28) before the partner trophies, and so on, because
    // their windows close earliest. They sit in their own tier so no
    // stage bonus can ever reorder them.
    if (trophy.missable) return 5000 - trophy.id;
    let points = (4 - Number(trophy.stage)) * 20;
    if (trophy.kind === 'story' || trophy.kind === 'mission') points += 15;
    if (trophy.target && trophy.target <= 20) points += 10;
    if (trophy.kind === 'activity') points += 5;
    return points;
  };
  return remaining
    .map((trophy) => ({ trophy, points: score(trophy) }))
    .sort((a, b) => b.points - a.points || a.trophy.id - b.trophy.id)
    .slice(0, limit)
    .map((entry) => entry.trophy);
}

export function renderNextUp(container, trophies, progress, callbacks) {
  container.innerHTML = '';
  const picks = pickNextUp(trophies, progress);
  if (!picks.length) {
    const done = document.createElement('li');
    done.textContent = 'Everything is earned — the platinum should be yours. Congratulations, Leonida Legend.';
    container.appendChild(done);
    return;
  }
  for (const trophy of picks) {
    const item = document.createElement('li');
    const name = document.createElement('strong');
    name.textContent = displayName(trophy, progress);
    const why = document.createElement('div');
    why.className = 'why';
    why.textContent = `${nextUpReason(trophy)} ${displayDescription(trophy, progress)}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Open guide';
    button.addEventListener('click', () => callbacks.onSelect(trophy.id));
    item.append(name, why, button);
    container.appendChild(item);
  }
}
