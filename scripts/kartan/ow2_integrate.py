"""Puts the generated Kartan 2.0 map into the game data: tiles, places, start, encounters, and every room's way out."""
import os, glob, json, re
SP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
g = open(f'{SP}/ow2.txt').read().split('\n')
d = json.load(open(f'{SP}/ow2.json'))
W, H = len(g[0]), len(g)
pl = {k: tuple(v) for k, v in d['places'].items()}
BLOCKED = set('^FwbXaW')

p = f'{ROOT}/src/data/overworld.ts'
t = open(p).read()
old_rows = re.findall(r"^\s*'([^']+)',?$", t[t.index('  tiles: ['):t.index('  ],', t.index('  tiles: ['))], re.M)
old_places = {m.group(3): (int(m.group(1)), int(m.group(2))) for m in re.finditer(r"\{\s*x: (\d+), y: (\d+), name: '([^']*)'", t)}
old_places_all = [(m.group(3), int(m.group(1)), int(m.group(2))) for m in re.finditer(r"\{\s*x: (\d+), y: (\d+), name: '([^']*)'", t)]

NAME = {'Mormors by': 'mormor', 'Kyrkbyn': 'kyrkbyn', 'Stenkyrkan': 'stenkyrkan', 'Björkhagen': 'bjorkhagen', 'Gruvsamhället': 'gruvsamh',
        'Den gamla gruvan': 'gruvan', 'Jättegrytan': 'jattegrytan', 'Bruksorten': 'bruk', 'Kvarnen vid forsen': 'kvarnen', 'Tjuvgrottan': 'tjuv',
        'Fiskeläget': 'fiske', 'Fyren i skären': 'fyren', 'Folkparken': 'park', 'Stationssamhället': 'station', 'Fäboden': 'faboden',
        'Fäbodskogen': 'fabodskogen', 'Trollberget': 'troll', 'Gamla kyrkogården': 'kyrkogarden', 'Kolartorpet': 'kolartorpet',
        'Pestkorset': 'pestkorset', 'Skeppssättningen': 'skepp', 'Milstolpen': 'milstolpe', 'Fäbodtorpet': 'fabodtorpet'}
new_of = {}
for name, key in NAME.items(): new_of[name] = pl[key]
new_of['Fallgrottan'] = tuple(d['fall']); new_of['Väktarkammaren'] = tuple(d['vakt'])
st = d['stollen']
# old (name, x, y) -> new (x, y), keeping the two stollen mouths apart
old_to_new = []
stollen_i = 0
for name, x, y in old_places_all:
    if name == 'Gamla stollen':
        old_to_new.append(((x, y), tuple(st[stollen_i]))); stollen_i += 1
    else:
        old_to_new.append(((x, y), new_of[name]))

# tiles
s0 = t.index('  tiles: ['); e0 = t.index('  ],', s0) + 4
t = t[:s0] + '  tiles: [\n' + ''.join(f"    '{r}',\n" for r in g) + '  ],' + t[e0:]
# places
it = iter(old_to_new)
def place_sub(m):
    (_, new) = next(it)
    return m.group(1) + 'x: %d, y: %d, name: \'%s\'' % (new[0], new[1], m.group(4))
t = re.sub(r"(\{\s*)x: (\d+), y: (\d+), name: '([^']*)'", place_sub, t)
# start: just below Mormors by
mx, my = pl['mormor']
t = re.sub(r"start: \{ x: \d+, y: \d+ \}", f"start: {{ x: {mx}, y: {my + 1} }}", t)

# encounters: wanderers per region, snapped to their own ground
ENC = [
    ('owShadow', '.:m', (22, 44), None), ('owShadow', 'f', (14, 64), None), ('owShadow', '.m', (24, 52), None), ('owShadow', '.:mf', (6, 50), 'odetorp'),
    ('owShadow', 'f', (50, 14), None), ('owShadow', 'h.', (52, 22), None), ('owShadow', '.f', (36, 18), 'odetorp'),
    ('owShadow', 'f', (80, 6), None), ('owShadow', 'g.', (75, 16), None), ('owShadow', '.h', (88, 22), None),
    ('owWisp', 's', (70, 34), 'myr'), ('owWisp', 's', (82, 42), 'myr'),
    ('owShadow', '.m', (78, 56), None), ('owShadow', '_r', (86, 58), None),
    ('owShadow', ':.', (44, 66), None), ('owShadow', '.fm', (38, 62), None),
    ('owShadow', 'N', (58, 58), 'skog'),
    ('owWisp', 's', (8, 11), 'myr'), ('owShadow', 'l.', (16, 6), None), ('owShadow', 'f', (22, 18), None),
    ('owShadow', 'kl', (26, 6), 'fjall'), ('owShadow', '.lf', (12, 14), 'odetorp'),
    ('owShadow', 'k', (36, 6), 'fjall'),
]
def snap(terrain, x0, y0):
    best = None
    for y in range(H):
        for x in range(W):
            if g[y][x] in terrain:
                dd = abs(x - x0) + abs(y - y0)
                if best is None or dd < best[0]: best = (dd, x, y)
    return best[1], best[2]
enc = []
for sprite, terrain, (x, y), table in ENC:
    sx, sy = snap(terrain, x, y)
    enc.append("    { sprite: '%s', terrain: '%s', x: %d, y: %d%s },\n" % (sprite, terrain, sx, sy, f", table: '{table}'" if table else ''))
s1 = t.index('  encounters: ['); e1 = t.index('  ],', s1) + 5
t = t[:s1] + '  encounters: [\n' + ''.join(enc) + '  ],\n' + t[e1:]
open(p, 'w').write(t)

# every room's way out onto the map: same offset from its place as before
def walkable(x, y): return 0 <= x < W and 0 <= y < H and g[y][x] not in BLOCKED and g[y][x] != '~'
def move(ox, oy):
    (o, n) = min(old_to_new, key=lambda on: abs(on[0][0] - ox) + abs(on[0][1] - oy))
    dx, dy = ox - o[0], oy - o[1]
    cand = (n[0] + dx, n[1] + dy)
    if walkable(*cand) and cand not in [v for (_, v) in old_to_new]: return cand
    for r in range(1, 3):
        for (ddx, ddy) in sorted([(a, b) for a in range(-r, r + 1) for b in range(-r, r + 1) if abs(a) + abs(b) == r], key=lambda v: (v[1] < 0, abs(v[0]))):
            c = (n[0] + ddx, n[1] + ddy)
            if walkable(*c) and c not in [v for (_, v) in old_to_new]: return c
    raise SystemExit(f'no way out near {n} for {ox},{oy}')
for f in glob.glob(f'{ROOT}/src/data/areas/*.ts'):
    a = open(f).read()
    b = re.sub(r"ow: \{ x: (\d+), y: (\d+) \}", lambda m: 'ow: { x: %d, y: %d }' % move(int(m.group(1)), int(m.group(2))), a)
    if a != b: open(f, 'w').write(b); print('exits moved in', f.split('/')[-1])
print('integrated')
