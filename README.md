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
itself. The CAS verdict was still unannounced on Tuesday morning, due that
afternoon, so the panel says so and does not guess the outcome.

- **Ukraine, Kyiv region** — Sunday drone hit a five-storey block of flats
  in Dymer; 11 killed, and a boy aged 7 and a woman aged 79 were pulled
  alive from the rubble (Reuters, 23 November 2026).
- **Indonesia, Banten** — Saturday fire at the PT Fonusa Agung Mulia candy
  factory; 24 dead confirmed, about 30 still missing as the search went on
  (Reuters, 23 November 2026).
- **Poland, NATO border** — a Russian drone briefly entered Polish
  airspace overnight during an attack on western Ukraine; Warsaw held
  fire after it turned back east (Reuters, 24 November 2026).
- **COP31, Antalya** — Sunday's collapse of the climate talks: the pact
  was rejected after fossil fuels were left out of the text, in the
  longest COP ever (CNN/WRI, 22–23 November 2026).
- **Thailand–Cambodia** — the Saturday truce held, the border stayed
  calm, and displaced families could return (Cambodia News Gazette,
  23 November 2026).
- **Football, CAS Lausanne** — Senegal's appeal over its stripped Africa
  Cup of Nations title: decision due Tuesday afternoon, 24 November
  2026; no outcome had been announced when this image was built
  (Reuters/CAS statement, 23 November 2026).
- **Footer** — the drone-hit cargo ship Sparta II reached St Petersburg
  under tow on Monday (Reuters, 23 November 2026); Fiji to close all
  schools 30 November–4 December as the El Niño drought deepens
  (PINA, 24 November 2026); Sheikh Hasina plans to return to Bangladesh
  on 16 December, her spokesperson said on Tuesday (Reuters,
  24 November 2026).

Run it locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
