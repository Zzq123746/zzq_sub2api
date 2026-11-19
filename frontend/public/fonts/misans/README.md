# MiSans homepage font

GanglAPI uses **MiSans** by Xiaomi for the public homepage typography.
Copyright and all intellectual property rights remain with Xiaomi and its
licensors. The original MiSans Font Intellectual Property License Agreement
is included in [LICENSE.pdf](LICENSE.pdf).

- Official source: https://hyperos.mi.com/font/zh/download/
- Official CSS: https://cdn-font.hyperos.mi.com/font/css?family=MiSans:450:Chinese_Simplify,Latin&display=swap
- Retrieved: 2026-11-13; additional original shards: 2026-11-14

These are the official, unmodified WOFF2 shards at weight 450. Font files
have not been subsetted, converted, renamed or otherwise altered. They are
embedded as part of GanglAPI, not distributed as a standalone font product.
Exact original download URLs are recorded in `sources.json`.

`src/styles/navigation-font.css` preserves the official Unicode ranges and
points to these local files. The shards cover ASCII, the current Chinese navigation labels and homepage
copy. If that text changes, check its codepoints against those ranges and
obtain additional **original** official shards as needed; do not modify the
fonts. Uncovered characters fall back to the existing licensed UI font stack.
The homepage uses the supplied 450 weight without synthetic bold or italic.
No external font connection is required at runtime.
