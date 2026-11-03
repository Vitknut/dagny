"""
Kartan 2.0 – generator for the 96 x 72 overworld (docs/kartan-2.md).

A coarse plan of regions (half resolution) is warped into organic shapes,
filled with terrain per region, given its gates, places, roads and
landmarks, and checked. Writes ow2.txt (tiles) and ow2.json (places,
encounters, exits).
"""
import os, json, math, random, sys
SP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
W, H = 96, 72
SEED = int(sys.argv[1]) if len(sys.argv) > 1 else 1
rng = random.Random(SEED)

# ------------------------------------------------------------------ the plan
# Region codes, half resolution (48 x 36). Later rectangles win.
HW, HH = 48, 36
plan = [['#'] * HW for _ in range(HH)]
def rect(code, x0, y0, x1, y1):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if 0 <= x < HW and 0 <= y < HH: plan[y][x] = code
rect('h', 1, 1, 13, 11)      # höglandet
rect('P', 15, 1, 19, 6)      # Bergsstigen
rect('T', 21, 1, 27, 5)      # Trollberget's foot
rect('n', 17, 8, 30, 12)     # gruvbygden
rect('G', 1, 12, 16, 14)     # granskogen
rect('e', 1, 15, 15, 33)     # hemdalen
rect('L', 16, 13, 30, 24)    # sjön
rect('q', 33, 1, 46, 13)     # kvarndalen
rect('m', 31, 14, 44, 22)    # myren
rect('c', 32, 23, 44, 32)    # kusten
rect('S', 45, 22, 46, 34)    # havet, east
rect('S', 34, 33, 46, 34)    # havet, south
rect('N', 26, 26, 31, 33)    # nattskogen
rect('p', 18, 26, 25, 33)    # parkslätten
rect('w', 16, 25, 17, 34)    # forsen between hemdalen and the park
# rock ridges that keep things apart
rect('#', 14, 1, 14, 6)      # höglandet | Bergsstigen: open lower down (see below)
rect('#', 18, 25, 30, 25)    # lake | park, night forest
rect('#', 15, 7, 16, 12)     # höglandet/granskog | gruvbygden
rect('#', 31, 1, 32, 13)     # the fell between gruvbygden and kvarndalen (Gamla stollen)
rect('#', 45, 14, 46, 21)    # east edge by the marsh
rect('h', 14, 4, 14, 6)      # höglandet opens into Bergsstigen here

CODE_LAND = set('hPTneqmcNpI')

# ------------------------------------------------------------------ smooth noise and warp
def make_noise(seed, scale):
    r = random.Random(seed); gw, gh = W // scale + 3, H // scale + 3
    grid = [[r.random() * 2 - 1 for _ in range(gw)] for _ in range(gh)]
    def f(x, y):
        gx, gy = x / scale, y / scale; x0, y0 = int(gx), int(gy); tx, ty = gx - x0, gy - y0
        sx, sy = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
        a = grid[y0][x0] + (grid[y0][x0 + 1] - grid[y0][x0]) * sx
        b = grid[y0 + 1][x0] + (grid[y0 + 1][x0 + 1] - grid[y0 + 1][x0]) * sx
        return a + (b - a) * sy
    return f
n1x, n1y = make_noise(SEED * 13 + 1, 7), make_noise(SEED * 13 + 2, 7)
n2x, n2y = make_noise(SEED * 13 + 3, 3), make_noise(SEED * 13 + 4, 3)
def warp(x, y, amp=3.2):
    return x + amp * n1x(x, y) + 1.2 * n2x(x, y), y + amp * n1y(x, y) + 1.2 * n2y(x, y)

region = [['#'] * W for _ in range(H)]
for y in range(H):
    for x in range(W):
        wx, wy = warp(x + 0.5, y + 0.5)
        ix = min(HW - 1, max(0, int(wx / 2))); iy = min(HH - 1, max(0, int(wy / 2)))
        region[y][x] = plan[iy][ix]
# frame
fr = make_noise(SEED * 7 + 5, 4)
for y in range(H):
    for x in range(W):
        d = min(x, y, W - 1 - x, H - 1 - y)
        if d <= 1 + (1 if fr(x, y) > 0.2 else 0):
            region[y][x] = 'S' if region[y][x] == 'S' and d >= 1 and y > 20 else '#'

# ------------------------------------------------------------------ the fixed points (full resolution)
P = {
    'mormor': (10, 58, 'V'), 'kyrkbyn': (29, 37, 'B'), 'stenkyrkan': (7, 40, 'K'), 'bjorkhagen': (22, 65, 'G'),
    'kyrkogarden': (22, 33, 'q'),
    'gruvsamh': (42, 20, 'B'), 'gruvan': (56, 18, 'M'), 'kolartorpet': (37, 23, 't'),
    'jattegrytan': (48, 38, 'C'),
    'bruk': (70, 18, 'B'), 'kvarnen': (86, 8, 'Q'), 'pestkorset': (80, 24, 'x'),
    'tjuv': (75, 36, 'C'),
    'fiske': (72, 54, 'B'), 'skepp': (84, 50, 'O'), 'fyren': (89, 64, 'Y'),
    'park': (42, 62, 'P'), 'station': (48, 56, 'B'), 'milstolpe': (39, 55, 'i'),
    'faboden': (20, 14, 'B'), 'fabodskogen': (7, 6, 'Z'), 'fabodtorpet': (12, 19, 't'),
    'troll': (48, 6, 'T'),
}
# region each place must stand in
P_REGION = {'mormor': 'e', 'kyrkbyn': 'e', 'stenkyrkan': 'e', 'bjorkhagen': 'e', 'kyrkogarden': 'e',
            'gruvsamh': 'n', 'gruvan': 'n', 'kolartorpet': 'n', 'jattegrytan': 'I', 'bruk': 'q', 'kvarnen': 'q', 'pestkorset': 'q',
            'tjuv': 'mI', 'fiske': 'c', 'skepp': 'c', 'fyren': 'Y', 'park': 'p', 'station': 'p', 'milstolpe': 'p',
            'faboden': 'h', 'fabodskogen': 'h', 'fabodtorpet': 'h', 'troll': 'T'}
STOLLEN_Y = 18

def disc(cx, cy, r, code, rough=0.35, seed=0):
    nz = make_noise(SEED * 31 + seed, 2)
    for y in range(int(cy - r - 2), int(cy + r + 3)):
        for x in range(int(cx - r - 2), int(cx + r + 3)):
            if 0 < x < W - 1 and 0 < y < H - 1 and math.hypot(x - cx, y - cy) < r + rough * r * nz(x, y):
                region[y][x] = code

# make sure every place sits well inside its region
for k, (x, y, ch) in P.items():
    want = P_REGION[k][0]
    if want == 'I': continue
    if want == 'Y': continue
    disc(x, y, 3.2, want, seed=sum(map(ord, k)) % 97)
# islands in the lake: Jättegrytan, Eremitholmen, Måsskäret
ISLANDS = {'jattegrytan': (48, 38, 2.6), 'eremit': (40, 30, 2.2), 'masskar': (57, 46, 1.4)}
for k, (x, y, r) in ISLANDS.items():
    disc(x, y, r + 2.2, 'L', rough=0.2, seed=7 + len(k))
    disc(x, y, r, 'I', rough=0.25, seed=3 + len(k))
# Tjuvgrottan: a dry hummock in the middle of the marsh
disc(75, 36, 2.0, 'I', rough=0.2, seed=41)
# the lighthouse skerry out in the sea
disc(89, 64, 3.6, 'S', rough=0.1, seed=43)
disc(89, 64, 1.6, 'Y', rough=0.1, seed=44)
# Signalstranden: a strip of sand on the far shore, facing Kyrkbyn across the lake
disc(62, 37, 1.5, 'Z', rough=0.1, seed=45)
for y in range(34, 41):
    for x in range(56, 62):
        if region[y][x] not in 'Z': region[y][x] = 'L'

# keep only the part of each region connected to its anchor (no stray specks)
ANCHOR = {'e': (10, 58), 'h': (20, 14), 'n': (42, 20), 'q': (70, 18), 'm': (70, 40), 'c': (72, 54), 'p': (42, 62),
          'N': (58, 60), 'T': (48, 6), 'P': (34, 8), 'L': (40, 36), 'G': (10, 27)}
for code, (ax, ay) in ANCHOR.items():
    if region[ay][ax] != code:
        print('anchor not in region', code, ax, ay, region[ay][ax]); region[ay][ax] = code
    seen = set(); st = [(ax, ay)]
    while st:
        x, y = st.pop()
        if (x, y) in seen or not (0 <= x < W and 0 <= y < H) or region[y][x] != code: continue
        seen.add((x, y)); st += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    for y in range(H):
        for x in range(W):
            if region[y][x] == code and (x, y) not in seen: region[y][x] = '#'

# land regions that must not touch: a rock tile between them
APART = [('e', 'n'), ('e', 'p'), ('e', 'h'), ('e', 'N'), ('n', 'q'), ('n', 'P'), ('n', 'T'), ('n', 'h'), ('q', 'c'),
         ('p', 'c'), ('h', 'T'), ('e', 'P'), ('p', 'L'), ('N', 'L'), ('q', 'L'), ('c', 'L'), ('S', 'q'), ('S', 'm'), ('S', 'p'), ('S', 'N'),
         ('S', 'e'), ('m', 'n'), ('h', 'L'), ('P', 'L'), ('T', 'L'), ('q', 'T'), ('m', 'p'), ('m', 'N'), ('Z', 'e')]
apart = set(APART) | {(b, a) for a, b in APART}
for _ in range(3):
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            a = region[y][x]
            for dx, dy in ((1, 0), (0, 1), (1, 1), (1, -1)):
                b = region[y + dy][x + dx]
                if (a, b) in apart:
                    # the smaller-numbered side gives way unless it holds a place
                    region[y + dy][x + dx] = '#'

# ------------------------------------------------------------------ terrain
g = [['^'] * W for _ in range(H)]
nz_a = make_noise(SEED * 17 + 1, 3); nz_b = make_noise(SEED * 17 + 2, 5); nz_c = make_noise(SEED * 17 + 3, 2)
for y in range(H):
    for x in range(W):
        r = region[y][x]; a = nz_a(x, y); b = nz_b(x, y)
        if r == '#': g[y][x] = '^'
        elif r == 'L' or r == 'S': g[y][x] = '~'
        elif r == 'w': g[y][x] = 'w'
        elif r == 'G': g[y][x] = 'F'
        elif r == 'N': g[y][x] = 'N'
        elif r == 'T': g[y][x] = 'k'
        elif r == 'P': g[y][x] = 'k' if a > -0.35 else '^'
        elif r == 'I': g[y][x] = 'f' if a > 0.35 else '.'
        elif r == 'Y': g[y][x] = '_'
        elif r == 'Z': g[y][x] = '_'
        elif r == 'm': g[y][x] = 's' if b > -0.55 else ('f' if a > 0 else '.')
        elif r == 'e': g[y][x] = 'f' if b > 0.42 else ('m' if a > 0.3 else '.')
        elif r == 'n': g[y][x] = 'f' if b > 0.3 else ('h' if a > 0.35 else '.')
        elif r == 'q': g[y][x] = 'f' if b > 0.25 else ('h' if a > 0.45 else '.')
        elif r == 'c': g[y][x] = 'f' if b > 0.5 else ('m' if a > 0.2 else '.')
        elif r == 'p': g[y][x] = 'f' if b > 0.5 else ('m' if a > 0.35 else '.')
        elif r == 'h': g[y][x] = 'f' if b > 0.35 else ('l' if a > -0.4 else '.')
# Trollberget: dark cliffs round its foot
for y in range(1, H - 1):
    for x in range(1, W - 1):
        if region[y][x] == '#' and any(region[y + dy][x + dx] == 'T' for dx in (-1, 0, 1) for dy in (-1, 0, 1)):
            g[y][x] = 'X'
# shores: sand and reeds where land meets the lake; shingle by the sea
for y in range(1, H - 1):
    for x in range(1, W - 1):
        if g[y][x] in '.mf' and region[y][x] in 'ecpnI':
            nb = [region[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))]
            if 'L' in nb: g[y][x] = 'r' if region[y][x] == 'e' and nz_c(x, y) > 0 else '_'
            elif 'S' in nb: g[y][x] = '_'

def blob(cx, cy, r, ch, only='.mfhl', seed=0):
    nz = make_noise(SEED * 37 + seed, 2)
    for y in range(int(cy - r - 2), int(cy + r + 3)):
        for x in range(int(cx - r - 2), int(cx + r + 3)):
            if 0 < x < W - 1 and 0 < y < H - 1 and g[y][x] in only and math.hypot(x - cx, y - cy) < r + 0.45 * r * nz(x, y):
                g[y][x] = ch
# fields with their own identity
blob(28, 40, 3, ':', seed=1); blob(12, 54, 2.5, ':', seed=2); blob(16, 46, 3, 'm', seed=3)   # hemdalen
blob(46, 23, 2, 'd', seed=4); blob(52, 21, 2.5, 'h', seed=5)                                 # gruvbygden
blob(73, 15, 2.2, 'g', seed=6); blob(80, 12, 3, 'h', seed=7)                                 # kvarndalen
blob(76, 58, 3, 'm', seed=8)                                                                   # kusten
blob(44, 65, 2.5, ':', seed=9); blob(40, 59, 2, 'm', seed=10)                                 # parkslätten
blob(14, 8, 3, 'l', seed=11); blob(8, 11, 2, 's', only='lf.', seed=12)                       # höglandet: heath, a bog by Fäbodskogen
for y in range(1, H - 1):
    for x in range(1, W - 1):
        if region[y][x] == 'h' and y <= 10 and x >= 22 and g[y][x] in 'l.': g[y][x] = 'k'      # bare fell towards Bergsstigen

# ------------------------------------------------------------------ gates
def put(x, y, ch): g[y][x] = ch
# Gamla stollen: two adit mouths through the fell, walkable ground on both sides
sx = None
for x in range(58, 70):
    if region[STOLLEN_Y][x] == 'n': sx = x
west = sx
east = next(x for x in range(west + 1, W) if region[STOLLEN_Y][x] == 'q')
for x in range(west + 1, east):
    put(x, STOLLEN_Y, '^')
mid = (west + east) // 2
for x in range(west + 1, east):
    put(x, STOLLEN_Y, '^')
STOLLEN = [(west + 1, STOLLEN_Y), (west + 2, STOLLEN_Y)]
# the fell between must be exactly two tiles at that row: move the valley floor up to meet it
for x in range(west + 3, east): put(x, STOLLEN_Y, '.'); region[STOLLEN_Y][x] = 'q'
put(*STOLLEN[0], 'D'); put(*STOLLEN[1], 'D')
put(west, STOLLEN_Y, '.')
for (x, y) in [(west + 1, STOLLEN_Y - 1), (west + 2, STOLLEN_Y - 1), (west + 1, STOLLEN_Y + 1), (west + 2, STOLLEN_Y + 1)]:
    put(x, y, '^')
# boarded-up adits along the same fell
for y in (STOLLEN_Y - 6, STOLLEN_Y - 3, STOLLEN_Y + 4):
    for x in range(56, 68):
        if g[y][x] == '^' and g[y][x - 1] in '.fh' and region[y][x - 1] == 'n': put(x, y, 'a'); break
# the hidden path through the spruce thicket: from Hemdalen north to the highlands (radio)
HID_X = 13
for y in range(H):
    if region[y][HID_X] == 'G': put(HID_X, y, 'H')
# the broken bridge over the rapids between Hemdalen and the park
by = 58
for x in range(28, 40):
    if g[by][x] == 'w': put(x, by, 'b')
# Väktarkammaren: a door in Trollberget's cliffs, found with the radio, opening onto Bergsstigen
VAKT = None
for y in range(4, 14):
    for x in range(36, 44):
        if g[y][x] == 'X' and g[y][x - 1] == 'k' and region[y][x - 1] == 'P' and VAKT is None: VAKT = (x, y)
# Fallgrottan: a waterfall in the mill valley's northern cliff
FALL = None
for x in range(88, 70, -1):
    for y in range(1, 8):
        if g[y][x] == '^' and g[y + 1][x] in '.fh' and region[y + 1][x] == 'q':
            FALL = (x, y); break
    if FALL: break

# ------------------------------------------------------------------ places
for k, (x, y, ch) in P.items():
    put(x, y, ch)
    # a little open ground round every place
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        if g[y + dy][x + dx] in 'fFs^' and region[y + dy][x + dx] not in 'LSw#': put(x + dx, y + dy, '.')
put(VAKT[0], VAKT[1], 'E')
put(FALL[0], FALL[1], 'A')
for (x, y) in (VAKT,): put(x - 1, y, 'k')

# ------------------------------------------------------------------ roads (A* on land)
import heapq
ROADABLE = set('.mfhlkd:g_r')
def astar(a, b):
    def cost(x, y):
        ch = g[y][x]
        if ch in '|-+=': return 0.5
        if ch in ROADABLE: return 1 + (0.6 if ch == 'f' else 0)
        if (x, y) == b: return 1
        return None
    openq = [(0, a)]; came = {a: None}; dist = {a: 0}
    while openq:
        _, cur = heapq.heappop(openq)
        if cur == b: break
        x, y = cur
        for nx_, ny_ in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if not (0 < nx_ < W - 1 and 0 < ny_ < H - 1): continue
            c = cost(nx_, ny_)
            if c is None: continue
            nd = dist[cur] + c
            if nd < dist.get((nx_, ny_), 1e9):
                dist[(nx_, ny_)] = nd; came[(nx_, ny_)] = cur
                heapq.heappush(openq, (nd + abs(nx_ - b[0]) + abs(ny_ - b[1]), (nx_, ny_)))
    if b not in came: return None
    path = []; cur = b
    while cur: path.append(cur); cur = came[cur]
    return path[::-1]
def lay(path):
    for i, (x, y) in enumerate(path):
        if g[y][x] not in ROADABLE and g[y][x] not in '|-+': continue
        prev = path[i - 1] if i else None; nxt = path[i + 1] if i + 1 < len(path) else None
        horiz = any(p and p[1] == y for p in (prev, nxt)); vert = any(p and p[0] == x for p in (prev, nxt))
        cur = g[y][x]
        if cur in '|-+' and ((cur == '|' and horiz) or (cur == '-' and vert)): g[y][x] = '+'
        elif cur not in '|-+': g[y][x] = '+' if horiz and vert else ('-' if horiz else '|')
        elif cur == '+': pass
def road(*names):
    pts = [(P[n][0], P[n][1]) if n in P else n for n in names]
    for a, b in zip(pts, pts[1:]):
        # roads start beside the place
        p = astar(a, b)
        if p: lay(p[1:-1])
        else: print('no road', a, b)
road('mormor', 'kyrkbyn', 'kyrkogarden'); road('mormor', 'bjorkhagen'); road('kyrkbyn', 'stenkyrkan'); road('mormor', 'stenkyrkan')
road('gruvsamh', 'gruvan'); road('gruvsamh', 'kolartorpet'); road('gruvsamh', (west, STOLLEN_Y))
road((east, STOLLEN_Y), 'bruk', 'kvarnen'); road('bruk', 'pestkorset')
road('fiske', 'skepp'); road('station', 'park', 'milstolpe')
road('faboden', 'fabodtorpet'); road('faboden', 'fabodskogen')

# ------------------------------------------------------------------ break straight edges
BLK = set('^FwbXaW')
def kind(ch): return 'B' if ch in BLK else ('W' if ch == '~' else 'L')
KEEP = set('|-+VBKGMQYPZTCqtxOiDHEAbjUS')
for _ in range(6):
    fixes = []
    for y in range(2, H - 3):
        run = 0; prev = None
        for x in range(W):
            e = (kind(g[y][x]), kind(g[y + 1][x])); e = e if e[0] != e[1] else None
            run = run + 1 if e and e == prev else (1 if e else 0); prev = e
            if run == 6: fixes.append((x - 2, y, x - 2, y + 1, e))
    for x in range(2, W - 3):
        run = 0; prev = None
        for y in range(H):
            e = (kind(g[y][x]), kind(g[y][x + 1])); e = e if e[0] != e[1] else None
            run = run + 1 if e and e == prev else (1 if e else 0); prev = e
            if run == 6: fixes.append((x, y - 2, x + 1, y - 2, e))
    if not fixes: break
    for (ax, ay, bx, by, e) in fixes:
        # grow the blocked side into the other one (or the land into the water)
        if 'B' in e:
            tx, ty = (bx, by) if e[0] == 'B' else (ax, ay)
            if g[ty][tx] not in KEEP: g[ty][tx] = '^' if g[ty][tx] != '~' or region[ty][tx] != 'L' else '^'
        else:
            tx, ty = (bx, by) if e[0] == 'L' else (ax, ay)
            if g[ty][tx] == '~': g[ty][tx] = '_' if region[ty][tx] in 'LS' else g[ty][tx]

# the breaker must not close what the gates opened
for x in range(west + 3, east + 1):
    if g[STOLLEN_Y][x] in BLK: g[STOLLEN_Y][x] = '.'
if g[FALL[1] + 1][FALL[0]] in BLK: g[FALL[1] + 1][FALL[0]] = '.'
if g[VAKT[1]][VAKT[0] - 1] in BLK: g[VAKT[1]][VAKT[0] - 1] = 'k'

# ------------------------------------------------------------------ jetties: where the boat waits
def jetty(region_code, tx, ty):
    best = None
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if region[y][x] == region_code and g[y][x] in '_r.m' and any(g[y + b][x + a] == '~' for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                dd = abs(x - tx) + abs(y - ty)
                if best is None or dd < best[0]: best = (dd, x, y)
    g[best[2]][best[1]] = 'j'
    return [best[1], best[2]]
JETTIES = {'hem': jetty('e', 33, 46), 'gruv': jetty('n', 46, 26)}

# ------------------------------------------------------------------ the lake's own places (kapitel 1–2)
def nearest(test, tx, ty):
    best = None
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if test(x, y):
                dd = abs(x - tx) + abs(y - ty)
                if best is None or dd < best[0]: best = (dd, x, y)
    return best[1], best[2]
open_ground = lambda x, y, r: region[y][x] == r and g[y][x] in '.mfhl:' and all(g[y + b][x + a] not in BLK for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))
KYRKBACKEN = nearest(lambda x, y: open_ground(x, y, 'e') and y < 34, 20, 30)
g[KYRKBACKEN[1]][KYRKBACKEN[0]] = 'U'
SIGNAL = (62, 37); g[SIGNAL[1]][SIGNAL[0]] = 'S'
EREMIT = nearest(lambda x, y: region[y][x] == 'I' and g[y][x] in '.f' and abs(x - 40) + abs(y - 30) < 4, 40, 30)
g[EREMIT[1]][EREMIT[0]] = 't'
MASSKAR = nearest(lambda x, y: region[y][x] == 'I' and abs(x - 57) + abs(y - 46) < 3, 57, 46)
g[MASSKAR[1]][MASSKAR[0]] = 'O'
# a fog bank round Måsskäret: it can't be seen from afar
for y in range(MASSKAR[1] - 4, MASSKAR[1] + 5):
    for x in range(MASSKAR[0] - 5, MASSKAR[0] + 6):
        if g[y][x] == '~' and math.hypot(x - MASSKAR[0], (y - MASSKAR[1]) * 1.3) < 4.6: g[y][x] = 'R'
# currents: the lake drains into the rapids in the south-west and draws a boat that way
outlet = [(x, y) for y in range(1, H - 1) for x in range(1, W - 1) if g[y][x] == '~' and any(g[y + b][x + a] == 'w' for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
if outlet:
    ox_, oy_ = min(outlet, key=lambda p: (p[1] * -1, p[0]))
    for y in range(oy_ - 7, oy_ + 1):
        for x in range(ox_ - 2, ox_ + 9):
            if 0 < x < W - 1 and 0 < y < H - 1 and g[y][x] == '~' and math.hypot(x - ox_, y - oy_) < 7:
                g[y][x] = 'n' if (x - ox_) > abs(y - oy_) else 'z'
CURRENT_OUTLET = outlet and (ox_, oy_)

# ------------------------------------------------------------------ landmarks: something new in sight on every screen
FEATURE = set('WuyeA') | set('VBKGMQYPZTCqtxOiDUS')
NEED = {'~': 'x', 's': 'x', 'N': 'x', 'H': 'x', 'D': 'x', 'E': 'x'}
def walk_all():
    seen = set(); st = [(P['mormor'][0], P['mormor'][1] + 1)]
    while st:
        x, y = st.pop()
        if (x, y) in seen or not (0 <= x < W and 0 <= y < H) or g[y][x] in BLK: continue
        seen.add((x, y)); st += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return seen
def seen_from(x, y):
    for dy in range(-5, 6):
        for dx in range(-10, 11):
            yy, xx = y + dy, x + dx
            if 0 <= yy < H and 0 <= xx < W and g[yy][xx] in FEATURE: return True
    return False
lr = random.Random(SEED * 3 + 9)
for _ in range(400):
    empty = [(x, y) for (x, y) in walk_all() if g[y][x] != '~' and not seen_from(x, y)]
    if not empty: break
    x, y = lr.choice(empty)
    # a landmark near the middle of the empty stretch, on plain ground
    spots = [(x + dx, y + dy) for dx in range(-3, 4) for dy in range(-2, 3)
             if 0 < x + dx < W - 1 and 0 < y + dy < H - 1 and g[y + dy][x + dx] in '.mlhk:' ]
    if not spots: spots = [(x + dx, y + dy) for dx in range(-3, 4) for dy in range(-2, 3) if 0 < x + dx < W - 1 and 0 < y + dy < H - 1 and g[y + dy][x + dx] in 'f_r']
    if not spots:
        # deep in the night forest or the marsh: an old path or a fallen fence, enclosed so it opens nothing
        spots = [(x + dx, y + dy) for dx in range(-3, 4) for dy in range(-2, 3) if 0 < x + dx < W - 1 and 0 < y + dy < H - 1
                 and g[y + dy][x + dx] in 'Ns' and all(g[y + dy + b][x + dx + a] == g[y + dy][x + dx] for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    if not spots: continue
    sx, sy = lr.choice(spots)
    ch = g[sy][sx]
    g[sy][sx] = 'e' if ch in 'fNs' else ('y' if lr.random() < 0.35 and ch in '.m:' else 'u')

# ------------------------------------------------------------------ write
out = {
    'places': {k: [x, y] for k, (x, y, _) in P.items()},
    'stollen': STOLLEN, 'stollen_exits': [[west, STOLLEN_Y], [east, STOLLEN_Y]],
    'vakt': VAKT, 'fall': FALL, 'islands': {k: [x, y] for k, (x, y, _) in ISLANDS.items()},
    'signal': [62, 37], 'jetties': JETTIES, 'kyrkbacken': KYRKBACKEN, 'eremit': EREMIT, 'masskar': MASSKAR, 'outlet': CURRENT_OUTLET,
}
open(f'{SP}/ow2.txt', 'w').write('\n'.join(''.join(r) for r in g))
open(f'{SP}/ow2_region.txt', 'w').write('\n'.join(''.join(r) for r in region))
json.dump(out, open(f'{SP}/ow2.json', 'w'))
print('written', SEED)
