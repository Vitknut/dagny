"""Writes a regenerated map's tiles into src/data/overworld.ts (places, exits and encounters stay as they are)."""
import os
SP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
g = open(f'{SP}/ow2.txt').read().split('\n')
p = f'{ROOT}/src/data/overworld.ts'
t = open(p).read()
s0 = t.index('  tiles: ['); e0 = t.index('  ],', s0) + 4
t = t[:s0] + '  tiles: [\n' + ''.join(f"    '{r}',\n" for r in g) + '  ],' + t[e0:]
open(p, 'w').write(t)
print('tiles written')
