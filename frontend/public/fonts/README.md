# GanglAPI UI fonts

The user-facing UI uses one coherent text family, with native San Francisco
on Apple devices and Helvetica Neue / Segoe UI / Arial for Latin fallback.
Chinese uses native PingFang SC where available, then the locally hosted
variable `noto-sans-sc-ui.woff2` (Noto Sans SC, weights 100–900). On Windows,
this provides a consistent Chinese fallback for user-facing content.
The homepage navigation explicitly uses MiSans Normal from Xiaomi; its
original files and separate license are documented in [misans/README.md](misans/README.md).
Admin layouts retain their original font stack.

Typography follows the hierarchy studied on Apple's Chinese website:
regular navigation and body copy, semibold display headings, natural Chinese
tracking, and separate display/body line heights. No Apple font files are
bundled or requested. Native rendering still varies by operating system.

- https://www.apple.com.cn/v/homepage/a/styles/main.built.css
- https://www.apple.com.cn/global-cn/styles/sfpro-cn.css
- https://developer.apple.com/fonts/

`manrope-latin.woff2` is retained as an unused asset from the earlier design;
it is no longer declared in CSS or requested by the interface.

Manrope and Noto Sans SC are distributed under the SIL Open Font License 1.1; original copyright
and license notices are preserved in `OFL-Manrope.txt` and `OFL-NotoSansSC.txt`.
Derived font families are renamed to `Gangl UI Latin` and `Gangl UI Sans`.

Upstream sources (retrieved 2026-11-12):

- https://github.com/google/fonts/tree/main/ofl/manrope
- https://github.com/google/fonts/tree/main/ofl/notosanssc

To regenerate, download `Manrope[wght].ttf` and `NotoSansSC[wght].ttf` from
those sources into a temporary directory as `Manrope.ttf` and `NotoSansSC.ttf`.
With `fonttools` and `brotli` available, run from `frontend`:

```sh
python3 tools/subset-ui-fonts.py /path/to/source-fonts
```

The Chinese subset covers characters in `src/**/*.ts` and `src/**/*.vue`,
including both locale dictionaries. Regenerate after adding new Chinese UI
characters. Names and other dynamic content fall back to the user's system
Chinese font when a glyph is outside the subset. Fonts use `font-display: swap`
so rendering never waits for a font download. No runtime external font requests
or additional frontend dependencies are required.
