[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/idn45-agent/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/idn45-agent/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Trophy Guide

An offline guide and tracker for every one of the 55 PlayStation 5 trophies of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze — built for the [make.fun bounty gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Every trophy, with its official name, description and grade**, exactly as PlayStation publishes them, plus a guide written in this project's own words for each one, with its sources named beside it. Where no guide has verified a step yet (four trophies at launch), the guide says so honestly instead of inventing one.
- **Tracker**: tick trophies off as you earn them; progress is saved in the browser (localStorage) and can be exported to a JSON file and imported back.
- **Filters**: by grade, by kind (story/missions, activities, collectibles, combat, exploration, robberies, completion), by earned/remaining, by missable only, and free-text search.
- **Spoiler setting**: hides the names and descriptions of the 28 hidden story trophies until you earn them.
- **Roadmap to the platinum**: the three-step order (story → 100% Completion checklist → Strangers & Freaks cleanup), the key numbers (4/10 difficulty, ~200 hours, 1 playthrough, 0 online trophies), and the one potentially missable trophy flagged with its Chapter 1 window.

## How to use it

Serve `app/` with any static file server and open `app/index.html` — or run `node serve.ts` and open http://localhost:8080. It works with the network off: every file it loads is under `app/`, and it makes no network requests at run time.

Deterministic screenshot scenes: `?shot=checklist`, `?shot=detail` (opens the guide for Positive Mental Attitude), and `?shot=roadmap`.

## Handing it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

- Trophy names, descriptions and grades: the official list as published by PlayStation, via Exophase and cross-checked against PSNProfiles and TrueAchievements.
- Guides and roadmap: PowerPyx — GTA 6 Trophy Guide & Roadmap (https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/) and Planet GTA 6 — GTA 6 Trophies (https://www.planetgta6.com/en/gta-6-trophies/), paraphrased in this guide's own words, never copied.

This is an unofficial fan-made guide. Grand Theft Auto and GTA are trademarks of their owners; the guide uses no Rockstar logo, artwork or game imagery.
