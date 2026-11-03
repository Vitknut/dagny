import os, json, sys
from PIL import Image
SP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
g = open(f'{SP}/ow2.txt').read().split('\n')
d = json.load(open(f'{SP}/ow2.json'))
W, H = len(g[0]), len(g)
NEEDS = {'~': 'eka', 'z': 'eka', 'n': 'eka', 'R': 'eka', 's': 'stovlar', 'D': 'karbidlampa', 'N': 'ficklampa', 'H': 'radio', 'E': 'radio'}
BLOCKED = set('^FwbXaW')
START = tuple(d['places']['mormor']); START = (START[0], START[1] + 1)
def reach(items):
    have = set(items); seen = set(); st = [START]
    while st:
        x, y = st.pop()
        if (x, y) in seen or not (0 <= x < W and 0 <= y < H): continue
        ch = g[y][x]
        if ch in BLOCKED or (ch in NEEDS and NEEDS[ch] not in have): continue
        seen.add((x, y)); st += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return seen
pl = {k: tuple(v) for k, v in d['places'].items()}
KEYS = ['eka', 'karbidlampa', 'stovlar', 'ficklampa', 'radio']
STEPS = [
    (['mormor', 'kyrkbyn', 'stenkyrkan', 'bjorkhagen', 'kyrkogarden'], 0),
    (['gruvsamh', 'gruvan', 'kolartorpet', 'jattegrytan'], 1),
    (['bruk', 'kvarnen', 'pestkorset'], 2),
    (['tjuv', 'fiske', 'skepp', 'fyren'], 3),
    (['park', 'station', 'milstolpe'], 4),
    (['faboden', 'fabodskogen', 'fabodtorpet', 'troll'], 5),
]
problems = []
for names, k in STEPS:
    have = reach(KEYS[:k]); before = reach(KEYS[:k - 1]) if k else set()
    for n in names:
        if pl[n] not in have: problems.append(f'{n} {pl[n]} not reachable with {KEYS[:k]}')
        if k and pl[n] in before: problems.append(f'{n} {pl[n]} reachable already without {KEYS[k - 1]}')
for (x, y) in d['stollen_exits']:
    if (x, y) not in reach(KEYS[:2]): problems.append(f'stollen exit {x},{y} unreachable')
v = tuple(d['vakt']); f = tuple(d['fall'])
if (v[0] - 1, v[1]) not in reach(KEYS): problems.append(f'Väktarkammaren beside {v} unreachable')
if (f[0], f[1] + 1) not in reach(KEYS[:2]): problems.append(f'Fallgrottan below {f} unreachable')
sig = tuple(d['signal'])
if sig not in reach(KEYS[:1]): problems.append('Signalstranden unreachable by boat')
if sig in reach([]): problems.append('Signalstranden reachable on foot')
for k in ('kyrkbacken',):
    if tuple(d[k]) not in reach([]): problems.append(f'{k} not reachable on foot')
for k in ('eremit', 'masskar'):
    if tuple(d[k]) not in reach(KEYS[:1]) or tuple(d[k]) in reach([]): problems.append(f'{k} not a boat trip')
def kind(ch): return 'B' if ch in BLOCKED else ('W' if ch in '~znR' else 'L')
runs = {}
for y in range(2, H - 3):
    run = 0; prev = None
    for x in range(W):
        e = (kind(g[y][x]), kind(g[y + 1][x])); e = e if e[0] != e[1] else None
        run = run + 1 if e and e == prev else (1 if e else 0); prev = e
        if run > 6: runs[('row', y, e)] = x
for x in range(2, W - 3):
    run = 0; prev = None
    for y in range(H):
        e = (kind(g[y][x]), kind(g[y][x + 1])); e = e if e[0] != e[1] else None
        run = run + 1 if e and e == prev else (1 if e else 0); prev = e
        if run > 6: runs[('col', x, e)] = y
print('problems:', problems or 'none')
print('straight runs > 6:', len(runs), list(runs.items())[:12])
print('mountain share: %.2f' % (sum(r.count('^') for r in g) / (W * H)))
if '-v' in sys.argv:
    COL = {'.': (95, 127, 69), ':': (214, 160, 70), 'm': (147, 169, 90), 'l': (160, 127, 160), 'h': (138, 95, 60), 'g': (61, 49, 64), 'd': (195, 154, 107),
           'k': (201, 187, 165), 'f': (63, 90, 58), '_': (225, 200, 150), 'r': (196, 201, 140), 'j': (138, 95, 60), '|': (240, 220, 160), '-': (240, 220, 160),
           '+': (240, 220, 160), '=': (138, 95, 60), '~': (79, 138, 179), 's': (107, 74, 110), 'D': (255, 0, 0), 'N': (27, 39, 65), 'H': (255, 80, 80), 'E': (255, 80, 80),
           '^': (138, 128, 136), 'F': (30, 50, 30), 'w': (189, 228, 237), 'b': (220, 80, 40), 'X': (40, 30, 40), 'a': (20, 20, 20), 'W': (120, 120, 120), 'A': (200, 240, 255)}
    im = Image.new('RGB', (W, H))
    for y in range(H):
        for x in range(W):
            im.putpixel((x, y), COL.get(g[y][x], (255, 255, 0)))
    im = im.resize((W * 8, H * 8), Image.NEAREST)
    im.save(f'{SP}/ow2_prev.png')
