[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/SARIP-afk/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/SARIP-afk/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01).

# Leonida 55 — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all 55 PlayStation 5 trophies of
Grand Theft Auto VI. Open `app/index.html` in desktop Chrome with the
network off and it just works — every file it loads lives under `app/`.

## What it does

- **All 55 trophies** with their official PlayStation names, descriptions
  and grades (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden), plus
  the count PlayStation tracks where one exists.
- **Tracker**: tick trophies off, progress saves in localStorage, and can
  be exported to a file and imported back. Progress per grade, per stage,
  and overall.
- **Filters that matter**: search, kind (story, missable, collectibles,
  activities, robbery, money, exploration, strangers, combat, platinum
  path, online), grade, sort (roadmap / name / grade / difficulty),
  status, and Hide earned.
- **Spoiler setting**: hides the names and descriptions of story trophies
  until they are earned.
- **Roadmap to the platinum**: four stages in recommended order, with
  counts, time estimates and per-stage progress. Difficulty 4/10,
  about 200 hours, one playthrough, no online trophies.
- **Missables**: one possibly missable trophy — Positive Mental Attitude —
  hedged honestly as *possibly* missable, because it is not yet confirmed
  whether the Chapter 1 meditation is required.
- **Cited guides**: every trophy's guide is written in our own words and
  names its sources (PowerPyx, Push Square, KeenGamer, Exophase,
  PSNProfiles), with a retrieval date of 19 November 2026. Three trophies
  with no confirmed unlock method are labelled unconfirmed instead of
  guessed. A self-audit bar on the cover states the counts plainly.
- **Next up**: the first not-yet-earned trophy in roadmap order, with
  Previous / Next navigation between guides.

## Running it

```sh
node serve.ts   # serves app/ at http://localhost:8080
```

## Handing it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with the kit's vendored `buildDossier`.

## Sources

- PowerPyx — GTA 6 Trophy Guide & Roadmap
  <https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/>
- Push Square — GTA 6 Trophy Guide & Roadmap
  <https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap>
- KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap
  <https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/>
- Exophase and PSNProfiles — PS5 trophy list and counts

All sources retrieved 19 November 2026. No Rockstar logo or artwork is
used anywhere in this guide.

## License

MIT — see `LICENSE`.
