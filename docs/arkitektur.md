# Architecture – Dagnys äventyr

An overview of how the code is built, why, and what can be improved.
For who is meant to read what: start with the README, then this file, then
[speldesign.md](speldesign.md) and [soundtrack.md](soundtrack.md).

## Layers

```
main.ts            start: canvas, input, audio, storage → Game
engine/            no game knowledge: loop, screen, input, collision,
                   sprites, text, audio synth, storage, haptics
game/              the game: Game (shell), scenes, overlays, flow,
                   state, saving, progression, HUD, menus
  side/            the side-view scene's systems: room, combat,
                   pickups, spells, render (+ shared helpers)
entities/          things that live in a scene: Player, Enemy, Npc,
                   Projectile, Pickup, particles
  behaviors/       one module per way of moving and fighting
data/              ALL content as plain data: areas, dialog, NPCs,
                   creatures, items, spells, temples, map, strings
  areas/ dialog/   rooms and dialog, one file per region / place
art/  audio/       sprites as character grids, songs as note strings
```

**Dependency rule:** `engine` knows nothing about the game. `data` is pure
data (types from `data/types.ts`). `entities` talk to the world only through
the `WorldApi` interface (`entities/types.ts`), never directly to
`SideScene`. That keeps creatures testable with a fake world (see `tests/birds.test.ts`, `tests/lives.test.ts`).

## Central patterns

- **The side-view scene and its systems.** `SideScene` owns the room's state
  and runs the step (movement, exits, bosses, sealed rooms). The parts of the
  work are systems in `game/side/`: plain functions that take the scene
  (`build(sc)`, `combat(sc)`, `collect(sc, pk)`, `castSpell(sc)`, `renderScene(sc, ctx)`).
  Fields the systems need are public; the rest stay private to the scene.
- **Behaviours as modules (strategy pattern).** `Enemy` holds what every
  creature shares: health, hits, physics and drawing. How it moves and fights
  is a `Behavior` in `entities/behaviors/`, looked up through the
  `BEHAVIORS` registry. A behaviour can also parry, through the optional `blocks()`.
  The registry is typed, so a behaviour named in `data/types.ts` without a module
  fails to compile. A new creature: an entry in `data/enemies.ts`, reusing a behaviour or adding one.
- **One table for the overworld's ground.** `data/terrain.ts` says, for
  every map character, what it is called, how it is drawn, what it needs, its
  colour on the small map and which meetings happen there. The map scene, the
  pause-menu map, the meeting tables and the reachability check all read it.
  A new kind of ground is one line there.
- **Data-driven content.** New rooms, creatures, dialog, songs and items are
  added in `src/data`, `src/art` and `src/audio` without touching the engine.
  The meaning of the map characters is in `data/legend.ts`.
- **Scenes and overlays.** `Game` holds one `Scene` (title, side view, map,
  story cards) and a stack of `Overlay`s (dialog, menus, Game Over). Scene changes go
  through `game/flow.ts`, so scenes don't know about each other.
- **Fixed time step.** Game logic runs at 60 Hz independent of the frame rate.
  Rendering runs on `requestAnimationFrame`.
- **One state object.** `GameState` (`game/state.ts`) is everything that is saved.
  The save format is versioned with migrations (`game/save.ts`), every field is
  validated on load, and `repairReach` makes sure Dagny is never stuck.
  At the first tap or key press the game asks the browser to keep its storage
  (`requestPersistentStorage` in `engine/storage.ts`). Otherwise browsers may
  clear it, for example iOS Safari after seven days without a visit. Chrome says
  yes for installed apps (the Android app, home-screen installs) and well-used sites.
- **Sprites are rasterised once** to offscreen canvases. `getSprite(id, frame)` is the
  only interface, so PNG sheets can replace them later.
- **Audio** is a small Web Audio synth with a look-ahead sequencer. Music is note
  strings. Jingles play over the music, which dips meanwhile.

## Quality

- TypeScript in `strict` mode. `npm run build` runs `tsc --noEmit` first.
- **ESLint** (the recommended JS and TypeScript rules, `npm run lint`).
- **CI** (`.github/workflows/ci.yml`) runs lint, tests and a build on every push
  and pull request. `npm run check` does the same locally.
- **Vitest, 381 tests** covering:
  - data integrity (every exit, dialog, sprite and character in the font)
  - softlocks and pits (a coarse jump model that also rides lifts, carts, logs and wheels)
  - region gating
  - the save format and migrations
  - lives
  - creature behaviour
  - music sync
  - that rewards cost something
  - **a whole logical playthrough** (`src/tools/playthrough.ts`, `tests/playthrough.test.ts`):
    from a new game to the credits, following the game's own rules (conditions,
    dialog actions, keys, radio walls, lamp secrets, overworld gates). It checks
    that every room, person, item, spell, container and näverdocka can be reached,
    that the temples fall in their fixed order and that each treasure really locks
    the next one, that every condition waits for something that can happen, that
    no dialog is orphaned and no item is taken that Dagny lacks. Fights and jumps
    are taken as won. `npm run walkthrough` writes the result to
    [genomspelning.md](genomspelning.md).
- Playwright scripts (outside the repo) are used for screenshots and to record
  music during development.
- Performance: about 2 ms per frame in the heaviest room.

## Technical debt

### Fixed (October 2026)

- ~~`sidescene.ts` did everything (1740 lines)~~ → split into systems in `game/side/`. The scene is about 840 lines.
- ~~`enemy.ts` with all behaviours in one `switch` (1460 lines)~~ → one module per behaviour. `Enemy` is about 250 lines.
- ~~`areas.ts` (2500 lines) and `dialog.ts` (1200 lines)~~ → one file per region or place. A test checks that no key is defined twice.
- ~~No ESLint, no CI~~ → both are in place.
- ~~`window.dagny` in production~~ → development only.

Every step was done without changing behaviour. Each was verified with the tests, with an automatic check
that the moved data is identical, by loading all 54 rooms in the browser and by comparing screenshots.

### Left, by benefit

1. **The overworld scene (`game/overworld.ts`)** and **`game/game.ts`** (about 430 lines each) can be split the same way when they grow.
2. **Behaviour state on `Enemy`** (`timer`, `mode`, `cycle` …) is shared by all behaviours. If more bosses arrive, each behaviour could keep its own typed state.
3. **No formatter (Prettier).** The style is consistent, but a formatter would keep it so with more people.
4. **No browser tests in the repo.** Playwright scripts are used during development but are not checked in.
   Next step: a smoke test in CI that loads every room.
