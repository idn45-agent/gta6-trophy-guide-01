// Leonida Trophy Guide — filters: grade, kind, roadmap stage, status,
// missable-only and text search, plus the spoiler rule. A trophy counts as
// a story spoiler while it is unearned and the spoiler setting is on.
import { isEarned } from './store.js';

export const SPOILER_KINDS = new Set(['story', 'mission']);

export function isStoryTrophy(trophy) {
  return SPOILER_KINDS.has(trophy.kind);
}

export function isSpoilerHidden(trophy, progress) {
  return progress.spoilers && isStoryTrophy(trophy) && !isEarned(progress, trophy.id);
}

export function displayName(trophy, progress) {
  return isSpoilerHidden(trophy, progress) ? 'Hidden story trophy' : trophy.name;
}

export function displayDescription(trophy, progress) {
  return isSpoilerHidden(trophy, progress)
    ? 'Hidden until earned — turn spoilers off, or earn this trophy in the story.'
    : trophy.description;
}

export function filterTrophies(trophies, progress, options) {
  const query = (options.query || '').trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (options.grade && trophy.grade !== options.grade) return false;
    if (options.kind && trophy.kind !== options.kind) return false;
    if (options.stage && Number(trophy.stage) !== Number(options.stage)) return false;
    if (options.status === 'earned' && !isEarned(progress, trophy.id)) return false;
    if (options.status === 'remaining' && isEarned(progress, trophy.id)) return false;
    if (options.missableOnly && !trophy.missable) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${(trophy.steps || []).join(' ')}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function stageProgress(trophies, progress, stageId) {
  const inStage = trophies.filter((trophy) => Number(trophy.stage) === Number(stageId));
  const earned = inStage.filter((trophy) => isEarned(progress, trophy.id)).length;
  return { total: inStage.length, earned, percent: inStage.length ? Math.round((earned / inStage.length) * 100) : 0 };
}

export function gradeCounts(trophies, progress) {
  const counts = {};
  for (const trophy of trophies) {
    counts[trophy.grade] = counts[trophy.grade] || { total: 0, earned: 0 };
    counts[trophy.grade].total += 1;
    if (isEarned(progress, trophy.id)) counts[trophy.grade].earned += 1;
  }
  return counts;
}
