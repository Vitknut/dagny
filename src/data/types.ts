import type { TerrainType } from './terrain';

/**
 * Data model shared by all data files. The engine only reads these
 * structures, so temples, creatures, dialog and maps can be changed
 * without touching engine code.
 */

export type StatId = 'styrka' | 'magi' | 'liv';

export type SpellId = 'lakning' | 'skydd' | 'hopp' | 'lyse' | 'eld' | 'hamn' | 'aska';

export type SkillId = 'nedatstot' | 'uppatstot';

export interface SpellDef {
  id: SpellId;
  name: string;
  description: string;
  /** Magic points per cast, indexed by Magi level − 1. */
  cost: number[];
  /** Effect duration in seconds (0 = instant). */
  duration: number;
  /** Village whose elder teaches it (for the in-game hint text). */
  village: string;
}

export interface SkillDef {
  id: SkillId;
  name: string;
  description: string;
  village: string;
}

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  sprite: string;
  /** Key treasures are found in temples and open new parts of the map. */
  treasure?: boolean;
}

export type Behavior =
  | 'walker'
  | 'floater'
  | 'parrier'
  | 'hopper'
  | 'diver'
  | 'tank'
  | 'shooter'
  | 'wolf'
  | 'waltzer'
  | 'blinker'
  | 'shadow'
  | 'boss_grim'
  | 'boss_gruvra'
  | 'boss_backahast'
  | 'boss_havsfru'
  | 'boss_spelman'
  | 'boss_skogsra'
  | 'boss_bergakung'
  | 'boss_placeholder';

export type PuffKind = 'moss' | 'leaf' | 'mist' | 'dust';

export interface EnemyDef {
  id: string;
  name: string;
  sprite: string;
  behavior: Behavior;
  hp: number;
  damage: number;
  xp: number;
  /** Pixels per step. */
  speed: number;
  /** Hitbox (relative to the sprite's top-left). */
  box: { x: number; y: number; w: number; h: number };
  puff: PuffKind;
  /** Drop chances 0–1. */
  drops?: { bulle?: number; termos?: number; lingon?: number };
  /** Takes no knockback. */
  heavy?: boolean;
  /** A heavy creature that still rocks back this much from a strike (no hop). */
  nudge?: number;
  /** Ignores gravity. */
  flying?: boolean;
  /** Can only be hurt from behind (strikes from the front are blocked). */
  backOnly?: boolean;
  /** Eld's fireballs bite less: damage is multiplied by this (Gruvrået carries her own flame). */
  fireResist?: number;
  /** Projectile sprite for shooters (default: a water droplet). */
  shot?: string;
  /** Becomes friendly after being defeated (flavour text shown). */
  befriend?: string;
}

export interface BossPhase {
  /** Phase starts when hp falls to this fraction of max. */
  atHpFraction: number;
  sprite: string;
  speed: number;
  /** Seconds between attacks. */
  attackEvery: number;
}

export interface BossDef extends EnemyDef {
  title: string;
  phases: [BossPhase, BossPhase];
  /** Dialog shown when the boss wakes up. */
  introDialog: string;
  /** Dialog shown when the boss is reconciled ("förlikad"). */
  defeatDialog: string;
}

export interface TempleDef {
  id: string;
  number: number;
  name: string;
  /** Short name for tight spots (the map's list). */
  short: string;
  /** Environment / mechanic description (design notes, shown nowhere). */
  mechanic: string;
  tone: string;
  music: string;
  bossMusic: string;
  treasure: string | null;
  boss: string;
  /** First side-view area; null while the temple is not built yet. */
  entryArea: string | null;
  /** Lore found inside – the story of the last Väktare, piece by piece. */
  lore: string;
}

export interface VillageDef {
  id: string;
  name: string;
  /** Side-view area; null while not built. */
  area: string | null;
  /** Entry point in that area used when waking up after a defeat. */
  wakeEntry: string;
  teaches: SpellId | SkillId | null;
  /** The temple near it: once reconciled, the village's tune turns brighter. */
  place?: string;
}

// --- Dialog -----------------------------------------------------------------

export type Condition =
  | { flag: string }
  | { notFlag: string }
  | { item: string }
  | { notItem: string }
  | { spell: SpellId }
  | { notSpell: SpellId };

export type DialogAction =
  | { type: 'flag'; flag: string }
  | { type: 'learnSpell'; spell: SpellId }
  | { type: 'learnSkill'; skill: SkillId }
  | { type: 'rest' }
  | { type: 'xp'; amount: number }
  | { type: 'giveItem'; item: string }
  | { type: 'takeItem'; item: string }
  | { type: 'heal' }
  /** Fills the magic bar. */
  | { type: 'magic' }
  /** Gives a life or magic container (a quest reward), counted once by id. */
  | { type: 'container'; kind: 'liv' | 'magi'; id: string }
  /** Gives one extra life (a quest reward), once per id. */
  | { type: 'life'; id: string }
  /** Dagny blinks Dagmar's signal across the lake (game/signal.ts), then `then` is said. */
  | { type: 'signal'; then: string }
  /** Hands over to a story scene (the ending, the credits). */
  | { type: 'scene'; scene: 'ending' | 'credits' }
  /** Takes the train to a village with a station (the stationmaster's whistle found). */
  | { type: 'travel'; area: string };

export interface DialogChoice {
  text: string;
  /** Dialog to continue with. */
  next?: string;
  actions?: DialogAction[];
}

export interface DialogDef {
  /** Name shown on the postcard frame (never Dagny – she is silent). */
  speaker?: string;
  pages: string[];
  choices?: DialogChoice[];
  /** Run after the last page (or before choices). */
  actions?: DialogAction[];
  /** Dialog that follows automatically. */
  next?: string;
}

/** An NPC picks the first dialog whose conditions all hold. */
export interface NpcTalk {
  if?: Condition[];
  dialog: string;
}

export interface NpcDef {
  id: string;
  sprite: string;
  /** Idle animation: frames and seconds per frame. */
  idle: { frames: number[]; every: number };
  talk: NpcTalk[];
  /** Only present when all conditions hold. */
  if?: Condition[];
  /** Follows Dagny around slowly (e.g. the cat when found). */
  wander?: number;
  /** A thing rather than a person (a gravestone, a charcoal stack): never turns round. */
  still?: boolean;
  /**
   * Catches fire when one of Dagny's fireballs (the Eld reading) hits it:
   * sets the flag and shows the dialog. Nothing in the talk does it for her.
   */
  burns?: { flag: string; dialog?: string };
  /** Sends up smoke (a lit charcoal stack). */
  smoke?: boolean;
}

// --- Areas --------------------------------------------------------------------

export interface Exit {
  /** 'overworld' or an area id. */
  to: string;
  /** Entry marker in the target area (a character in its tile map). */
  entry?: string;
  /** Overworld tile to appear on when going to the overworld. */
  ow?: { x: number; y: number };
  /** Dialog shown after arriving (e.g. "the path led in a circle"). */
  dialog?: string;
  /** Flag required to use this exit, and the dialog shown when missing. */
  requires?: { flag?: string; item?: string; dialog: string };
}

export interface Prop {
  /** Sprite to draw (omit for pure emitters such as chimney smoke). */
  sprite?: string;
  /** Pixel position (bottom-left anchored on a tile: x in tiles, y = ground row). */
  tx: number;
  ty: number;
  /** Offset in pixels. */
  dx?: number;
  dy?: number;
  /** Animation seconds per frame (0 = static). */
  anim?: number;
  /** Emits chimney smoke from this point. */
  smoke?: boolean;
  front?: boolean;
}

export type AreaKind = 'village' | 'path' | 'temple' | 'encounter';
export type Backdrop = 'outdoor' | 'forest' | 'crypt' | 'mine' | 'mill' | 'sea' | 'park' | 'none';

/**
 * Wind in part of an area (tile rectangle, inclusive). Gusts blow for `on`
 * steps, then pause for `off`. 'alternate' flips direction every gust;
 * 'up' is an updraft that lifts Dagny.
 */
export interface WindZone {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  dir: 'left' | 'right' | 'up' | 'alternate';
  /** Pixels per step (horizontal) or lift per step (updraft). */
  force: number;
  on: number;
  off: number;
  offset?: number;
}

/**
 * A moving platform. Lifts are 32 px wide with their top on the top edge of
 * row `ty`; carts are 24 px wide and run along rails at the bottom of row `ty`.
 * Logs float with their top at the bottom edge of row `ty` (level with the bank).
 * A wheel is a water wheel centred on (tx, ty) with `count` paddles at
 * `radius` tiles that turn by `speed` radians per step (toTx/toTy unused).
 * A carousel is the same, but its horses run on a flat ellipse (`radiusY` tiles).
 * 'loop' moves back and forth by itself; 'ride' moves only while Dagny stands
 * on it, towards the end it is not resting at.
 */
export interface PlatformDef {
  kind: 'lift' | 'cart' | 'log' | 'wheel' | 'carousel';
  radius?: number;
  radiusY?: number;
  count?: number;
  tx: number;
  ty: number;
  toTx: number;
  toTy: number;
  mode: 'loop' | 'ride';
  /** Pixels per step (default 0.6 for lifts, 1.1 for carts). */
  speed?: number;
}

export interface AreaDef {
  id: string;
  name: string;
  kind: AreaKind;
  tone: string;
  music: string;
  backdrop: Backdrop;
  /** Theme for '#' and '=' tiles. */
  theme: 'meadow' | 'village' | 'crypt' | 'mine' | 'mill' | 'skar' | 'fyr' | 'park' | 'skog' | 'berg';
  /** Collision + entity layer. See data/legend.ts. */
  tiles: string[];
  /** Optional non-colliding background decor layer (same size). */
  deco?: string[];
  /** Optional foreground layer drawn over Dagny (dense leaves, ferns). */
  front?: string[];
  /** NPCs placed with digits '1'–'9' in the tile layer. */
  npcs?: Record<string, string>;
  /** Doors used with Up, placed with capital letters in the tile layer. */
  doors?: Record<string, Exit>;
  /** Readable stones / signs (used with Up): marker character → dialog id. */
  signs?: Record<string, string>;
  /** Walking off the left / right edge. */
  left?: Exit;
  right?: Exit;
  props?: Prop[];
  platforms?: PlatformDef[];
  wind?: WindZone[];
  /**
   * Dance-floor squares ('%' and '&') swap every `period` steps. With `wake`, the
   * light strings are dark – the floor is not there – until Åska is cast in the
   * room; then the flag is set and it dances for good.
   */
  beat?: { period: number; wake?: string };
  /** Dark area – only lit around Dagny, candles and spells. */
  dark?: boolean;
  /** How dark a dark area is, 0–1 (default 0.93). */
  darkness?: number;
  /** Temple this area belongs to (for keys and checkpoints). */
  temple?: string;
  /** Side-quest item lying at 'q' (picked up once; dialog `hittade_<item>`). */
  questItem?: string;
  /** Treasure item lying on the altar ('X' in the tile layer). */
  treasure?: string;
  /** Show the area name when entering. */
  showName?: boolean;
  /** Ambient life. */
  ambience?: Array<'fireflies' | 'mosquitoes' | 'dust' | 'mist' | 'leaves' | 'rain' | 'spray'>;
  /**
   * Things only seen in the light of a lamp Dagny carries (karbidlampan,
   * ficklampan): a container lying there, or words to read (Up).
   */
  /** Small birds (sädesärlor) sitting on these tiles; they fly off when Dagny comes near. */
  perchers?: Array<{ tx: number; ty: number }>;
  lampSecrets?: Array<{ item: 'karbidlampa' | 'ficklampa'; tx: number; ty: number; container?: 'liv' | 'magi'; dialog?: string; gives?: string }>;
  /**
   * Containers that appear in the room once a task here is done (the flag is
   * set), to be picked up like any other: a box under a gravestone, the
   * bottom of a spring.
   */
  rewards?: Array<{ flag: string; kind: 'liv' | 'magi'; tx: number; ty: number }>;
  /** Items lying in the room, picked up once (dialog `hittade_<item>`; gone for good once `<item>_klar`). With `after`, it lies there only once that flag is set (someone has asked for it). */
  finds?: Array<{ item: string; tx: number; ty: number; after?: string }>;
  /** NPC that appears where the boss stood once it is reconciled. */
  afterBoss?: { npc: string; tx: number; ty: number };
  /**
   * The way on stays shut until every creature here is beaten (Skuggan's hall).
   * Once cleared, flag `<area id>_rensad` keeps the room empty for good.
   */
  sealed?: { dialog: string; music?: string };
  /**
   * The door (its character) a vätte called with the näverlur runs to and waits
   * by when there is nothing to fight: the one way on among several (Vättegången).
   */
  lurGuide?: string;
  /**
   * Parts of the room only a reading gets Dagny up to – a ledge too high for an
   * ordinary jump that Hopp reaches (tile boxes, inclusive). For the
   * playthrough solver; the room's shape is what really keeps her out.
   */
  needsSpell?: Array<{ spell: string; x0: number; y0: number; x1: number; y1: number }>;
  /**
   * A cave-in that chases Dagny: once she passes tile column `at` (coming in
   * from the left), the roof comes down behind her and the rubble moves right
   * at `speed` px per step until she gets out. Escaped once, `flag` is set and
   * it never happens again – and the `rubble` heaps (tiles) lie on the floor from then on.
   */
  cavein?: { at: number; speed: number; flag: string; rubble?: Array<[number, number]> };
  /** Parts of the room built of something else (the mill's stone house by the rapids): tiles inside use that theme. */
  themeBoxes?: Array<{ x0: number; y0: number; x1: number; y1: number; theme: string }>;
  /** Leaving by the right exit sets this flag: a way that opens only from inside. */
  opens?: string;
  /** Tougher creatures (the last temple): more health and harder blows. */
  hard?: boolean;
  /** Dialog started automatically the first time (needs flag to not repeat). */
  onEnter?: { dialog: string; unlessFlag: string; setFlag: string };
}

// --- Overworld --------------------------------------------------------------


export interface OverworldPlace {
  /** Character on the overworld map. */
  x: number;
  y: number;
  name: string;
  /** Side-view area and entry when entering this tile. */
  area?: string;
  entry?: string;
  /** Dialog shown instead (e.g. a temple that is not built yet). */
  dialog?: string;
  /** Flags needed before the area opens; `dialog` is shown until then. */
  requires?: string[];
  /**
   * A hidden place: 'near' shows only when Dagny stands right beside it
   * (a cave behind a waterfall); 'radio' only when she carries the radio.
   */
  hidden?: 'near' | 'radio';
  /** What a 'near' place shows when Dagny is beside it (default: the cave behind a waterfall). */
  sprite?: string;
  /** A viewpoint: standing here maps this many tiles round about (Kyrkbacken). */
  view?: number;
  /**
   * Something only the radio picks up, out in the open (no cave): the place does
   * nothing, and shows nowhere, without it.
   */
  radio?: boolean;
  /** Once this flag is set the place's `dialog` is not shown again (a radio voice heard). */
  doneFlag?: string;
  /**
   * A passage through rock: going in here, the room leads out onto the map at
   * this tile (for reachability – game/reach.ts; the rooms' exits are what
   * really take Dagny there, and tests check the two agree).
   */
  leadsTo?: { x: number; y: number };
}


export interface EncounterDef {
  sprite: 'owShadow' | 'owWisp';
  /** Terrain characters it may wander on. */
  terrain: string;
  /** Encounter table to use (data/encounters.ts); defaults to the terrain Dagny stands on. */
  table?: TerrainType;
  /** Start tile. */
  x: number;
  y: number;
  /** Hidden once this flag is set (e.g. region restored). */
  goneFlag?: string;
}

export interface OverworldDef {
  tiles: string[];
  places: OverworldPlace[];
  encounters: EncounterDef[];
  start: { x: number; y: number };
  /** Terrain that needs an item to cross: char → item id. */
  needs: Record<string, string>;
  /** Terrain that can never be crossed. */
  blocked: string;
  music: string;
  tone: string;
}
