from pathlib import Path
import shutil

root = Path(__file__).resolve().parent.parent
src = root / 'packages' / 'parser'
dst = root / 'scripts' / 'parser-bundle' / 'packages' / 'parser'

for path in src.rglob('*'):
    if path.is_file():
        rel = path.relative_to(src)
        target = dst / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
        print(rel)

print('done', len(list(dst.rglob('*'))))
