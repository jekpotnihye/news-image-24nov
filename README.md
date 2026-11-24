# World News in One Image — 24 November 2026

[![make.fun](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124)
[![Rank](https://make.fun/badge/news-image-20261124/jekpotnihye/news-image-24nov/rank.svg)](https://make.fun/bounty/news-image-20261124)
[![Reward](https://make.fun/badge/news-image-20261124/jekpotnihye/news-image-24nov/reward.svg)](https://make.fun/bounty/news-image-20261124)

An entry for the make.fun bounty [news-image-20261124](https://make.fun/bounty/news-image-20261124):
sum up the world's news of Tuesday 24 November 2026 in one image.

`main.ts` (Node 22, standard library only, no network) draws the image itself
at run time — a hand-rolled PNG encoder plus a 5×7 bitmap font, with the
day's stories embedded in the code — and writes it to `/output/entry.png`.
The output is deterministic: two runs produce byte-identical PNGs.

## Stories shown

Six panels, plus three more in the footer strip. Weekend events are labelled
with the day they happened, so nothing is passed off as happening on Tuesday
itself; the Tuesday-anchored story is the CAS verdict due that afternoon.

- **Ukraine, Kyiv region** — a drone hit a five-storey block of flats in
  Dymer; the toll rose to 11 as rescuers searched the rubble
  (Reuters/AP reporting, 23 November 2026).
- **Indonesia, Banten** — fire at the PT Fonusa Agung Mulia candy factory;
  24 dead confirmed, dozens still missing as the search went on
  (Reuters, 23 November 2026).
- **COP31, Antalya** — Sunday's collapse of the climate talks over fossil
  fuels, with no overarching deal agreed (CNN/BusinessWorld, 22–23 November
  2026).
- **Thailand–Cambodia** — the ceasefire held after weeks of border
  fighting, with displaced civilians able to return (Cambodia News Gazette /
  Mercury News, 23 November 2026).
- **Football, CAS Lausanne** — Senegal's appeal over its stripped Africa Cup
  of Nations title to be decided on Tuesday afternoon, 24 November 2026
  (Reuters, 23 November 2026).
- **United Nations, Geneva** — talks on lethal autonomous weapons agreed
  only to more talks, with a possible accord by 2028 and no binding rules
  (AP/NPR, 20–21 November 2026).
- **Footer** — the drone-hit cargo ship Sparta II reached St Petersburg
  under tow (Reuters); Fiji to close all schools 30 November–4 December as
  the El Niño drought deepens (PINA, 24 November 2026); thousands marched
  in Lisbon on Saturday over living costs (Reuters, 21 November 2026).

Run it locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
