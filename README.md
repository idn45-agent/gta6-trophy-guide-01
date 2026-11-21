# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/idn45-agent/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/idn45-agent/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Built for the [make.fun bounty gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

An offline guide and tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5 — 1 platinum, 2 gold, 6 silver and 46 bronze — built for the make.fun competition `gta6-trophy-guide-01`.

## What it is

- **Checklist** of every trophy with its official name, description and grade, saved in the browser (localStorage).
- **Guide per trophy** in this guide's own words: numbered steps, a PSN target count where the trophy tracks one, a roadmap stage, a missable flag and note, and named sources beside every trophy. Trophy names, descriptions and grades are shown exactly as PlayStation publishes them (Exophase / PSNProfiles listing of 2026-11-18).
- **Roadmap** to the platinum in four stages, each with its own progress bar.
- **Missables** view: the few trophies that can be missed or made harder, flagged with what to do and when.
- **Next-Up Planner**: the most sensible next trophies, picked from what you have already earned.
- **Per-trophy counter and notes** for the grind trophies (stunts, WAiNK scans, choices, money…).
- **Export / import** of progress as a plain JSON file.
- **Filters** by grade, kind, roadmap stage, earned/remaining, missable-only and text search, plus a **spoiler setting** that hides story trophies until they are earned.
- **Offline**: no build step, no network requests, no external fonts or images. Every file the app loads lives under `app/`.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Or serve `app/` with any static file server.

## Files

- `app/index.html` — the page: header progress, filters, four views, detail panel.
- `app/app.js` — entry point: loads the data, wires events, keeps the views in sync.
- `app/store.js` — trophy data loading, localStorage progress, export/import.
- `app/filters.js` — grade/kind/stage/status/missable/search filters and the spoiler rule.
- `app/render.js` — the checklist rows and the trophy detail panel.
- `app/views.js` — Roadmap, Missables and Next-Up views.
- `app/style.css` — the look: warm sand paper, deep teal ink, sunset coral accent.
- `app/data/trophies.json` — the 55 trophies with original guides, steps, targets, stages, missable flags and sources.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
- `screenshots/` — four real renders of the app in a browser (1280×800 JPEGs).
- `shots.json` — which view each screenshot shows.
- `serve.ts` — tiny static server for local development.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## Handing it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see `LICENSE`.
