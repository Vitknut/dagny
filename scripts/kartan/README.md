# Kartan 2.0 – the overworld generator

The 96 × 72 overworld in `src/data/overworld.ts` is generated, not drawn by
hand. A coarse plan of the regions (half resolution, in `ow2_gen.py`) is warped
into organic shapes, filled with terrain per region, and given its gates,
places, jetties, roads and landmarks.

```sh
mkdir -p scripts/kartan/out
python3 scripts/kartan/ow2_gen.py 2        # seed 2 is the current map
python3 scripts/kartan/ow2_check.py -v     # gate order, places, straight edges; out/ow2_prev.png
```

`ow2_integrate.py` wrote the result into the game once (tiles, places,
encounters, and every room's way out, moved with its place). It reads the
*previous* map's places from `overworld.ts`, so it is only for moving from one
map to the next – after it, edit `overworld.ts` and the tests directly.

The design behind it: [docs/kartan-2.md](../../docs/kartan-2.md).
Requires Python 3 and Pillow (for the preview).
