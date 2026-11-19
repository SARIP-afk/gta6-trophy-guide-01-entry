# Leonida 55 — GTA VI Trophy Guide & Tracker — gta6-trophy-guide-01-entry

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/SARIP-afk/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/SARIP-afk/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that is the best guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade, a checklist saved in the browser with export and import, filters by kind and grade plus text search, a spoiler setting that hides story trophies until they are earned, a 7-stage roadmap to the platinum built from the official descriptions, the one possibly missable trophy flagged (Positive Mental Attitude — Lucia's Chapter 1 balcony meditation), and a guide to each trophy written in our own words that cites its sources (PowerPyx, Output Lag, GTABase, KeenGamer, Push Square — retrieved 19 November 2026). Five trophies whose unlock method was still unconfirmed at launch are labelled "reported, unconfirmed" rather than guessed at.

New in this revision: a source line on every trophy card, a stage label on every card and guide ("Stage N — title · time"), a difficulty box (1–5) and time estimate per trophy (our own estimates, labelled est.), a "Next up" box with Previous/Next navigation in roadmap order, a self-audit bar (55/55 trophies · 55/55 guides · 55/55 cited · 28/28 hidden · 1 possibly missable · 5 unconfirmed), and Sort (roadmap / name / grade), Status (all / earned / not earned) and Hide earned controls.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — the guide works with the network off. Deep links help screenshots and sharing: `?kind=missable`, `?grade=silver`, `?trophy=Maximum%20Withdrawal`, `?spoilers=on`, `?view=roadmap`, `?sort=name`, `?status=not-earned`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=cxyf1jsy&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
