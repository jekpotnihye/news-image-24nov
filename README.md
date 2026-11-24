# World News in One Image — 24 November 2026

[![make.fun](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124)
[![Rank](https://make.fun/badge/news-image-20261124/jekpotnihye/news-image-24nov/rank.svg)](https://make.fun/bounty/news-image-20261124)
[![Reward](https://make.fun/badge/news-image-20261124/jekpotnihye/news-image-24nov/reward.svg)](https://make.fun/bounty/news-image-20261124)

An entry for the make.fun bounty [news-image-20261124](https://make.fun/bounty/news-image-20261124):
sum up the world's news of Tuesday 24 November 2026 in one image.

`main.ts` (Node 22, standard library only, no network) draws the image itself
at run time — a hand-rolled PNG encoder plus a bitmap font, with the day's
stories embedded in the code — and writes it to `/output/entry.png`.

Six stories, spanning climate, disaster, war, protest, sport and diplomacy,
plus two more in the footer strip. Every depicted fact was grounded in news
reports dated 24 November 2026.

Run it locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
