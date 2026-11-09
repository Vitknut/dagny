# Speldesign – Dagnys äventyr

How the game is meant to play: progression, lives, the temples and what
every reward costs. The story itself is in the story document; balance
values live in `src/data/progression.ts`.

## Ground rule: nothing for free

Every skill, reading and treasure costs Dagny something: a task, a temple
or a hidden place. At the start she has only the blade Mormor gives her.

## Readings and techniques

| What | Who | Where | What it costs |
|---|---|---|---|
| Läkning | Gamle Sven | Mormors by | Fetch **johannesört** from the high ledges in Björkhagen (nettles, crows, jumps) |
| Nedåtstöt | Smeden Algot | Mormors by | Fetch his **tongs** from Gamla smedjan, east of the village – before the crypt, which he warns against entering without it (Grimmen hovers high) |
| Lyse | Gamla Elin | Gruvsamhället | Dagmar's **solsten**, at the far end of Dagmars ort, an old adit in the hill above the village |
| Eld | Prosten | Kyrkbyn | After the crypt |
| Skydd | Smeden Holm | Bruksorten | A **rönnkvist** from Rönnen vid forsen, the miller's rowan on the far bank – rowan was planted by mills and water against Bäckahästen |
| Uppåtstöt | Förman Karlsson | Bruksorten | For his pick, hidden behind the waterfall north of the mill (Fallgrottan) |
| Hopp | Viola | Fiskeläget | A wagtail's **fjäder**, on Ärlskäret, a skerry with a cairn north of the lighthouse (by boat, before the temple) |
| Hamn | Gammelmor Karna | Fäboden | After the mine |
| Åska | Telegrafisten Oskar | Stationssamhället | An **åskvigg** (a stone-age axe folk thought the thunder threw down) from the field by Milstolpen |

The seven readings are taught up in attics (`data/areas/vindar.ts`): each
teacher sits under the roof of a house in the village, behind the house's own
door (a lantern hangs by it) and up through a hole in the attic floor. Each
attic is the teacher's own: herbs and candles at Sven's, rock and lamps at
Elin's, church books at the parsonage, the forge under Holm's loft, nets at
Viola's, the summer farm's loft at Kärna's, wires at Oskar's. Learning
is a rite (`game/rite.ts`): the room goes dark, a ring of runes closes in on
Dagny, sparks rise, a flash, and the reading's name stands written in the air.

Like Zelda II, a reading cast in a room lasts until Dagny leaves it (Skydd,
Hopp, Lyse, Eld and Hamn); casting one that is already burning costs nothing
and does nothing. A bird that casts again comes down where there is room.

Each thing a teacher asks for lies out in the world, never inside a temple, and is always there (as in Zelda II): geography decides when Dagny can reach it, not the quest. If she finds it before she is asked, the teacher simply takes it and teaches the reading (`*_hittat` dialogs).

The NPC dialog conditions are in `src/data/npcs.ts`; `tests/start.test.ts`
checks that Läkning and Nedåtstöt cannot be had for free.

## Controls: the game reads what the player meant

Difficulty belongs to enemies, rooms and timing, never to the controls. A
press the game swallows feels like the game's fault, so every input has some
give (`src/entities/player.ts`, `src/engine/touch.ts`):

- **Jump buffer and coyote time:** a jump pressed up to 8 frames before landing still counts, and so does one up to 7 frames after walking off an edge.
- **Lowest jump:** every jump rises as if held for at least 7 frames, so a quick tap on glass gives a hop of two tiles, not a skip. Holding goes to three.
- **Sword buffer:** a press is kept for 10 frames, so pressing during a swing or a stagger still strikes as soon as she can.
- **Hit-stop:** when a blow lands the world holds still for 4 frames (6 on a kill, 2 on a parry), with a short buzz. Presses made meanwhile are kept.
- **Stick:** left and right get ±30°, up and down ±25°, and the diagonals the rest. A slightly slanted thumb walks; it doesn't duck or thrust upwards.

- **Knockback:** a hit throws Dagny back about one tile (as in Zelda II), with drag, not across the room.
- **Carts and logs** that move only while ridden come back for her when she waits at the other end, so a fall never strands her on the wrong side.

- **A thumb rolls between buttons:** sliding a finger off one button onto another lets go of the first and presses the second – jump, then roll onto the sword, without lifting. Two fingers on two buttons press both.
- **Turning in the wind-up:** for the first 4 frames of a strike, the stick can still turn Dagny round, so a strike pressed a moment before the thumb reaches the other way meets what is behind her.

## Väsensboken: an adventure through Swedish folk belief

The game's line is **"Ett äventyr genom den svenska folktron"** (title screen,
credits, store text). Almost every creature comes from Swedish folk belief, and
the pause menu has **Väsensboken**: the first time Dagny beats or reconciles a
creature, a page opens (with a toast). Each page has two leaves:

- **Folktron** – what was really told about it: the kyrkogrim buried alive under
  the church, the vättar warned before hot water was poured out, the
  lyktgubbar who moved boundary stones, Bäckahästen's growing back. Where a
  creature is the game's own (stenknekten, myrkatten), the page says so and
  tells the belief it grows from.
- **I berättelsen** – how it belongs to Dagny's story (Hulda's candles in the
  crypt, the lamp marked H.D., Dagmar's boots by the pond …).

The texts are in `src/data/vasen.ts`; a test checks that every creature and
guardian has a page and that every page fits its panel.

## The first temple's creatures

Dagny starts with 8 health (four bars), so the crypt must not drain it faster than skill can keep up:

- **Stenknekt** (the slow stone soldier in the dark Benhuset) hits for 2, not 3: four hits to go down instead of three.
- **Tomtenisse-krigare** fence instead of rushing. They copy her guard, keep their distance and make a short thrust up close (open while thrusting). Beating them is about switching height faster than they follow, or striking into the thrust (`behaviors/parrier.ts`, `tests/fencer.test.ts`).
- **Kyrkogrimmen** has 38 health (was 44), stands dazed a little longer after crashing into the wall (85 frames, was 70), and throws bells a little less often as a spirit (every 1.7 s, was 1.4). He still hits as hard.
- Buns, thermoses and lingonberries lying in rooms stay taken until Dagny rests or wakes in a village (a new day), so going in and out of a place refills nothing. Meetings on the map are fresh ground each time.

## Levels and strength

- Three stats, **Styrka, Magi, Liv**, each 1–12, raised with XP (`COSTS` in `src/data/progression.ts`).
- **Like Zelda II, a raise spends all the XP:** the counter starts again from 0, whatever was left over. Choosing "Senare" keeps saving up for a dearer level.
- **Containers:** life (+2) and magic (+1), hidden in temples and caves, each taken once.
- **Each temple hits harder** (as in Zelda II): ordinary creatures do +0, +0, +1, +1, +2, +2 and +3 damage in temple 1–7, and the guardians do 3, 3, 4, 4, 5, 5 and 6 with a touch (their shots rise the same way). Trollberget's creatures also have half again as much life. Liv levels and life containers are what let Dagny keep up (`data/progression.ts`).
- **Sword upgrades:** smith Holm tempers the blade with ore and hones it with the thunderstone. A silver fitting lies hidden in Tjuvgrottan and only shows in the light of the karbidlampa. Each upgrade gives +1 damage.

## Lives and Game Over (Zelda II style)

- Dagny has **3 lives** (`START_LIVES`), at most 9. Lives show in the HUD as little doll heads.
- **Defeat with lives left:** one life is lost, and Dagny tries again at the door of the **same room** she fell in, with full health and magic. This holds everywhere: in temples, on paths, in caves and in meetings on the map. In a guardian's hall that means straight back to the guardian, at full health. She can also choose to wake in the last village she rested in.
  - In Zelda II a lost life also sent you back to the start of the area outside palaces. Inside palaces it sent you to the palace entrance. Same-room restart in temples is a deliberate, kinder choice for a phone game.
  - Lit candles are save points: they save the game, and "Fortsätt" from the title screen starts there.
- **The last life lost = Game Over:** she starts over at **Mormor's** with 3 lives. Unspent XP is lost; levels, items and containers are kept.
  - As in Zelda II, a single lost life costs no XP; only Game Over takes the unspent XP.
  - The Game Over screen is black and silent. **Bergakungen's shadow** (`bergakungSkugga`), twice his size with ember eyes and arms raised, rises out of the dark and laughs: seven deep "ha"s (sound `laugh`) with the word HA drifting up round him. This is our version of Ganon's shadow laughing in Zelda II. Only then do the text and the choice appear.
- **Trollberget is the exception:** Game Over there sends her back to the **foot of the mountain**, and every candle on the mountain goes out (as in the Great Palace).
- **Näverdockor** (birch-bark dolls, tile `+`) give one extra life each and are taken once. There are eight: Gamla kyrkogården (early, on a high ledge), Tjuvgrottan, Jättegrytan, Kvarnen, the crypt and Fyren (behind radio walls), Fäbodskogen and Trollgrottan.

Code: `GameOverOverlay` (`src/game/menus.ts`), `retryRoom` and
`gameOver` (`src/game/flow.ts`). Tests: `tests/lives.test.ts`.

## The order of the temples (decided: fixed)

The order is **fixed: 1 → 2 → 3 → 4 → 5 → 6 → 7**. Each region needs the
treasure of the temple before it, so there is only one way through, as in
Zelda II. (Decision A, October 2026: the order stays locked. An earlier text
said "roughly this order", which was not true.)

1. **Stenkyrkans krypta** → the boat
2. **The old mine** → the karbidlampa
3. **The mill by the rapids** → the stövlar
4. **The lighthouse** → the ficklampa
5. **The folk park** → the radio
6. **Fäbodskogen** → the näverlur
7. **Trollberget**, which opens when the six others are reconciled

## The overworld

96 × 72 tiles (Kartan 2.0, being built chapter by chapter: [kartan-2.md](kartan-2.md)).
The lake lies in the middle with islands, Hemdalen and the start in the
south-west, Trollberget in the north, reached from the highlands by
Bergsstigen. Kyrkbyn and Signalstranden face each other across the lake. The
map is generated from a coarse plan by a development script and checked for
the gate order, open ground and straight edges; the tests in
`tests/landscape.test.ts` and `tests/world.test.ts` hold it to that. Every kind of ground is described in
`src/data/terrain.ts`: its name, what it needs, its colour on the small map and
which meetings happen there. Pictures: [kartor/](kartor/README.md).

### The map in the pause menu

It shows only what Dagny has seen, about one phone screen round every step she
has taken (`game/explored.ts`, saved as a small bit set). The rest is fog. It
zooms in on what is seen, so tiles are large early on. The colours are few
and clear: ground, forest, field, marsh, water, shore, rock and roads. Markers
show temples (yellow, white once restored), villages (red) and small places
(pale). Hidden places are never marked. The temple list shows a name only
once its place has been seen, otherwise "???".

### Borders: every border made of its own stuff

| Border | What Dagny sees | What opens it |
|---|---|---|
| Home valley ↔ lake | Shore and reeds; the boat waits at a jetty | The boat |
| Mine country ↔ mill valley | A steep fell with dark adits and boarded-up old ones | The karbidlampa |
| Mill valley ↔ coast | A wide marsh (Tjuvgrottan lies out in it) | The stövlar |
| Coast ↔ park plain | The night forest, black at noon | The ficklampa |
| Home valley ↔ park plain | Rapids, and the bridge the spring flood took | Never: the park is reached the long way round |
| Home valley ↔ highlands | A spruce thicket; a hidden path runs through it | The radio |
| Round Trollberget | Dark cliffs and bare fell | The six reconciled places |

Mountains are only the outer frame and a few massifs: about 935 tiles, against
1,660 on the old box-shaped map. Borders and shores bend: no straight edge is
longer than six tiles. The ground's colour shifts from region to region and
blends over a couple of tiles where two meet.

### Fields

| Ground | Where |
|---|---|
| Rye field (`:`) | Round Kyrkbyn, Mormors by and the folk park |
| Hay meadow (`m`) | The home valley, the coast, the park plain |
| Heather moor (`l`) | The highlands |
| Clear-cut (`h`) | The mine country and the mill valley |
| Slag heaps (`g`) | By the iron works in Bruksorten |
| Sand pit (`d`) | By Gruvsamhället |
| Bare fell (`k`) | Up towards Trollberget |

### Meetings by ground

| Table | Ground | Fights |
|---|---|---|
| `ang` | Grass, roads, landmarks | Meadow, rye field, meadow at night |
| `aker` | Rye fields | Rye field, heath, at night – birds from above |
| `hed` | Heather, clear-cut, slag, sand pit | Heath, rye field, storm |
| `skog` | Forest, the night forest, the hidden path | Forest path, spruce moor, storm |
| `myr` | Marsh | Marsh, fen, marsh at night |
| `strand` | Shore, reeds, jetty, water | Shore, reeds, shingle beach, storm |
| `fjall` | Bare fell below Trollberget | **Kalfjället** (the hardest), heath, storm |
| `odetorp` | Round the deserted crofts | **Ödetorpet** (vättar indoors), forest path, night |

Every meeting is a fight; there are no friendly meetings on the map. Every
region has its own creatures wandering the map, each tied to its ground, so the
same meeting doesn't turn up everywhere.

Meetings hunt Dagny: off the road, a creature within about nine tiles walks towards her and starts the fight when it reaches her. Roads and paths are safe. Nothing steps onto them, so a chase ends where the path begins.

Inside a meeting the way back shuts behind Dagny; only the far side leads on. She needn't beat every creature, but she has to get past them. The music (`mote`) is a faster take on the sad cave tune (`grotta`): the same A minor line and echo over a pulsing bass and soft drums.

### Small places: one per region, each with a task

Nothing on the map looks like a place without being one: every croft, cross,
standing stone, milestone or churchyard can be visited. Stone walls, gates and
overgrown paths are plain scenery, and on land something is always in sight
on a phone screen (20 × 11 tiles). `tests/landscape.test.ts` checks that there
are no fake places and that every region has one small place whose task gives a
reward.

| Region | Place | Task | Reward |
|---|---|---|---|
| Home valley | **Gamla kyrkogården** | The sexton's riddle on the gate: read the stones and move the one of the woman who died on midsummer day | Life container, 40 XP |
| Mine country | **Kolartorpet** | Light the cold charcoal stack: cast **Eld** (taught by Prosten in Kyrkbyn) and strike at it, so a fireball hits it. Talking to it only says it is cold | Magic container (left lying by the stack), 60 XP |
| Mill valley | **Pestkorset** | Den grå frun wants ox-eye daisies for those who rest there; they grow high up on the cliff | Extra life, 40 XP |
| Coast | **Skeppssättningen** | Find the missing piece of the rune stone in the sand | Extra life, 50 XP |
| Park plain | **Milstolpen** | The drowned postman lost his horn in the rapids; fetch it from the stones | Magic container, 80 XP |
| Highlands | **Fäbodtorpet** | Clear the choked healing spring (afterwards Dagny can drink there and be restored) | Life container |

Things in these places (gravestones, the charcoal stack, the rune stone, the
spring) are NPCs that never turn round (`still` in `data/npcs.ts`). A task done
with the hands leaves its container **lying in the room**, to be picked up like
any other (`rewards` on the area): the box under Karin's stone, the bottom of
the spring, the ashes of the charcoal stack. Something that must be set alight
has `burns` and reacts only to a fireball, never to a dialog choice. Once done,
a thing with nothing more to say gives no prompt. People who hand something
over (the postman, Johan) still give it in the dialog; an extra life from
dialog is the `life` action.


The small places (and the islands on the lake) have their own tune, "Den glömda
platsen" (`plats`): a slow lament in plain D minor, the flute falling over harp, organ and a far bell,
not the road's or a village's music.

### Hidden places

| Place | Where | How it is found | What is in it |
|---|---|---|---|
| **Björkhagen** | Southeast of Mormors by | Open from the start | Johannesört for Sven – nothing else, so the first errand stays clear (Murre has wandered to Kyrkbyn; the early näverdocka sits on the ledge at Gamla kyrkogården) |
| **Tjuvgrottan** | Out in the marsh (stövlar) | On the map | Five rooms, one find in each of the last four: the life container in Schaktet, the näverdocka high in Droppgången, a magic container in a niche in Klyftan (karbidlampa) and, last of all, Grå-Pelle's silver fitting in Tjuvarnas kammare (karbidlampa) |
| **Jättegrytan** | On the islet in the lake (boat) | On the map | Initials "D. och H." under a little sun (Dagmar and Hulda) in the ficklampa's light, a magic container and a näverdocka |
| **Fallgrottan** | Behind the waterfall on the mill valley's northern cliff | Seen only from right beside it | A life container on a ledge, a näverdocka, and Dagmar's carving: "Den som gömmer sig bakom fallet hörs inte av berget" |
| **Väktarkammaren** | A door in the cliffs below Trollberget | Only with the radio | Dagmar's notebook from midsummer eve 1946, the Väktare's names on the wall – with room for one more – and a magic container |

`tests/landscape.test.ts` checks that each hidden place can be reached with the
treasures Dagny has in its region, that the cliff door stays shut without the
radio, and that every cave leads back out beside where it lies.

### Gamla stollen: the passage through the fell

Two dark side-view rooms instead of a map tile. The first has a cart over a
spike gutter and a radio gallery; in the second, **Rasgången**, the roof caves
in behind Dagny once she is a few steps in and the rubble rolls after her
(`cavein` on the room). Stones fall at its front; being caught hurts and shoves
her ahead. Reaching the far side ends it for good, and the heaps it left
(`cavein.rubble`) lie on the floor from then on, to climb over either way.

There is one way in: the west mouth. The east mouth is boarded up and the side
gallery (Sidoorten) is blocked by rubble from outside. Both open only once
Dagny has come out through them from inside (`requires` on the place: the
cave-in's flag, and `opens` on Sidoorten's room).

### Kvarnen vid forsen: a temple that looks like one

A temple must stand out from the villages, on the map and when Dagny gets
there. On the map the mill is two tiles by two: a stone house on the bank and
its wheel out in the fors, turning under the flume. The fors runs from the
waterfall in the north past the mill into a pond, with footbridges at the foot
of the fall and below the mill. Arriving, the fors falls past the house onto
the wheel, and the house is built of stone (`themeBoxes` on the room). Above
the hatch the key to the barred door can be seen: that is what the hatch is for,
and Karlsson's Uppåtstöt is what opens it.

### Every temple its own place

On the map every temple is a landmark two tiles by two with something moving
(`BIG` in game/overworld.ts; the tiles under it are `'0'`, ground nobody walks
on): the stone church with its bell tower and graves, the headframe with its
turning wheel, the mill with its wheel in the fors, the lighthouse with its
sweeping light, the folk park's gate and pavilion with blinking bulbs, the
summer cottage between old spruces with smoke rising, and Trollberget's face
with glowing eyes.

Inside, each temple has its own furniture (`data/furniture.ts`, sprites in
`art/templeprops.ts`): burial niches, a bone house and the lamb relief in the
crypt (the church grim is the lamb buried under the choir); a winch, tool racks,
glinting ore and gifts to Gruvrået in the mine; barrels, the keeper's desk, a
wreck and the great lens at the lighthouse; a carousel, a wheel of fortune,
posters and the stage in the folk park; mossy boulders, an offering stone with
milk for the rå, a fairy ring and a hollow tree in Fäbodskogen; and gold, a
cauldron, carved faces and a stone throne inside Trollberget. Pieces with a
flame light their corner of a dark room.

## Trollberget – the last temple

It should be really hard, like the last palace in Zelda II:

- **Every room is "hard":** creatures have 50 % more health and hit 1 harder (`hard: true` on the area).
- **More creatures** than in earlier temples.
- **Trollgångarna:** a maze of two rooms with three passages each. Wrong passages lead back to the start. The riddles are carved in the rock ("Den mittersta bär", "Solen går ner i väster").
- **Skuggsalen:** Dagny meets her own shadow (behaviour `shadow`). It mirrors her guard and parries where she parries. It throws cuts along the floor or at her head (the stance gives away which), lunges up close and jumps when she jumps. It stands open after each attack, and a thrust from above always gets through. The hall is shut until the shadow is beaten (`sealed` on the area).
- **Bergakungen** in the last hall.

Order: Bergsfoten → Trollgrottan → Trollgångarna → Djupa gångarna → Bergshjärtat → Skuggsalen → Bergakungens sal.

## Music

See [soundtrack.md](soundtrack.md).
