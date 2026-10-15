import json

src = r'E:\figma插件和汉化\.figma-agent\runs\78b8d084-19da-466a-bda2-c1126f06e9d6\result.json'
d = json.load(open(src, encoding='utf-8'))
out = d.get('output') or d.get('result', {}).get('output')
lines = []
lines.append('=== PAGES ===')
for p in out['pages']:
    lines.append('%s | %s | frames: %s' % (p['id'], p['name'], p['frames']))
lines.append('')
for f in out['frames']:
    lines.append('## %s %s %sx%s | page: %s' % (f['id'], f['name'], f['w'], f['h'], f['pageName']))
    lines.append('-- sections:')
    for s in f['sections']:
        lines.append('   %s %s %s %sx%s' % (s['id'], s['type'], s['name'], s['w'], s['h']))
    lines.append('-- texts (%d):' % len(f['texts']))
    for t in f['texts']:
        lines.append('  [%s,%s %sx%s %s %s] %s' % (
            t['x'], t['y'], t['w'], t.get('size'), t.get('font'), t.get('fill'),
            t['text'][:80].replace('\n', ' / ')))
    lines.append('')
open(r'E:\figma插件和汉化\structure-dump.txt', 'w', encoding='utf-8').write('\n'.join(lines))
print('written', len(lines), 'lines')
