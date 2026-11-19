"""Regenerate local UI fonts from upstream TTFs (requires fonttools and brotli).

Usage: python3 tools/subset-ui-fonts.py /path/to/source-fonts
See public/fonts/README.md for sources and licenses.
"""
from pathlib import Path
import argparse
from fontTools import subset
from fontTools.ttLib import TTFont

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source_dir', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
characters = set(range(0x20, 0x100)) | set(range(0x2000, 0x2070))
for file in (root / 'src').rglob('*'):
    if file.suffix in {'.vue', '.ts'}:
        characters.update(map(ord, file.read_text(encoding='utf-8')))

for source, output, family, codepoints in [
    ('Manrope.ttf', 'manrope-latin.woff2', 'Gangl UI Latin', set(range(0x20, 0x250)) | set(range(0x2000, 0x2070))),
    ('NotoSansSC.ttf', 'noto-sans-sc-ui.woff2', 'Gangl UI Sans', characters),
]:
    font = TTFont(args.source_dir / source)
    options = subset.Options()
    options.layout_features = ['*']
    options.name_IDs = ['*']
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    # Rename the derived subsets; preserve upstream copyright/license records.
    for record in font['name'].names:
        if record.nameID in {1, 4, 16}:
            record.string = family.encode(record.getEncoding())
        elif record.nameID in {3, 6, 25}:
            record.string = family.replace(' ', '').encode(record.getEncoding())
    font.flavor = 'woff2'
    target = root / 'public/fonts' / output
    font.save(target)
    print(f'{target.name}: {target.stat().st_size:,} bytes / {len(font.getBestCmap())} characters')
