# Vice City Trophy Atlas — GTA VI Trophy Guide & Tracker

![make.fun competition](https://make.fun/badge/gta6-trophy-guide-01.svg)
![my rank](https://make.fun/badge/gta6-trophy-guide-01/memelljk/vice-trophy-guide/rank.svg)
![my reward](https://make.fun/badge/gta6-trophy-guide-01/memelljk/vice-trophy-guide/reward.svg)

An offline guide and tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI**, built for the make.fun competition [Build the best GTA 6 trophy guide](https://make.fun/c/gta6-trophy-guide-01).

## What it does

- **Full checklist of the 55 trophies** with the official name, description and grade exactly as PlayStation publishes them (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden until earned, each flagged).
- **An original guide for every trophy**, saying what to do, where and how, and **citing its sources beside each guide**. Where a step is still unconfirmed pre-release, the guide says so instead of inventing steps.
- **Missable trophies flagged**, each with the chapter or mission after which it is gone — including the one missable trophy, Positive Mental Attitude.
- **A roadmap to the platinum** built from the official descriptions: story chapters and missions in order, collectibles with their counts, activities, and a cleanup phase.
- **A real tracker:** tick trophies off and progress is saved in the browser (localStorage), with a progress bar and per-grade counts; **export** progress to a JSON file and **import** it back.
- **Filters** by kind (story, missable, collectibles, activities, online), by earned/unearned, plus text search.
- **Spoiler setting:** hides the names and descriptions of story trophies until each one is earned.
- **Fully offline:** static files only, no build step, no network requests at run time. The look is original CSS — no game artwork, logos or screenshots.

## Run it

Serve the `app/` folder with any static file server and open it in a browser, e.g.:

```
node serve.ts
```

then visit http://localhost:8080. (Node 22+ runs the included `serve.ts` directly; any other static server rooted at `app/` works just as well.)

## Hand it in

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Screenshots

The four screenshots in `screenshots/` show the checklist with a cited guide open (cover), the roadmap to the platinum, the missable filter with the spoiler setting at work, and the tracker with saved progress and export/import.
