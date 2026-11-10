# Förbättringsplanen – steg för steg

*10 november 2026. Hör ihop med [forbattringsplan.md](forbattringsplan.md),
som säger vad och varför. Det här dokumentet säger hur: vilka filer, i vilken
ordning, vilken kod och vilket test. Fil- och funktionsnamn är kontrollerade
mot koden i dag (commit `fa365fc`).*

*Fas 0–2 och testsäkringen är utskrivna så att de går att bygga rakt av.
Fas 3–7 har ramar och datastrukturer, men rummens exakta form bestäms när
piloten (Gruvan) har provspelats.*

## Arbetssätt för varje åtgärd

1. Skriv testet först och se det misslyckas.
2. Gör ändringen.
3. Kör i den här ordningen. Allt ska vara grönt innan något checkas in:
   ```
   npm run typecheck
   npm run lint
   npm test
   npm run walkthrough      # skriver om docs/genomspelning.md
   npm run build
   ```
4. Läs diffen i `docs/genomspelning.md`. Den visar om ordningen i spelet har
   ändrats. Ändringar där ska vara väntade.
5. En incheckning per åtgärd, med vad som ändrats för spelaren överst.
6. Pusha, bygg demon, provspela just det som ändrades.

Regler som alltid gäller:
- **Rums-id:n, flaggor och föremåls-id:n byts aldrig.** De ligger i sparfiler.
  Byt bara namnet som visas.
- **Ny mekanik lärs alltid ut till lösaren** (`src/tools/playthrough.ts`) i
  samma incheckning. Annars bevisar testerna ingenting om den.
- **Ny flagga som sätts av kod** (inte av en replik) får en rad i lösaren som
  sätter den under samma villkor.

---

## Fas 0 – Snabba rättningar

### 0.1 Täta läckorna av Dagmars namn

**Filer:** `src/data/types.ts`, `src/data/overworld.ts`,
`src/data/areas/smaplatser.ts`, `src/game/overworld.ts`,
`src/game/side/render.ts`, `src/data/dialog/gruvsamhallet.ts`,
`src/data/vasen.ts`, nytt `tests/story.test.ts`.

**Steg**

1. Typ för namn som byts när en flagga är satt. I `types.ts`, på både
   `OverworldPlace` och `AreaDef`:
   ```ts
   /** Another name once a flag is set (a place whose real name is a spoiler). */
   nameAfter?: { flag: string; name: string };
   ```
2. En hjälpfunktion i `src/game/state.ts`:
   ```ts
   export function shownName(s: GameState, d: { name: string; nameAfter?: { flag: string; name: string } }): string {
     return d.nameAfter && hasFlag(s, d.nameAfter.flag) ? d.nameAfter.name : d.name;
   }
   ```
3. Använd den där namn visas: `overworld.ts` rad 925 (`near.name`) och
   `side/render.ts` rad 316 (`sc.area.name`). Sök efter andra ställen med
   `grep -rn "\.name" src/game | grep -i "place\|area"`.
4. Data. I `overworld.ts` och `areas/smaplatser.ts` (id `dagmars_ort` står
   kvar):
   ```ts
   name: 'Gamla orten',
   nameAfter: { flag: 'hulda_efter_folkparken', name: 'Dagmars ort' },
   ```
5. Repliker i `dialog/gruvsamhallet.ts`:
   - `elin_uppdrag`: "Han ville hämta Väktarens solsten åt mig, den hon
     lämnade i den gamla orten …"
   - `elin_lar`: "… Den lyser fortfarande, fast hon är borta."
6. Väsensboken i `vasen.ts`:
   - `lyktgubbe.berattelse`: "… På fotografiet från dansbanan dansar en
     kvinna med kopparhår med ett av dem."
   - `backahasten.berattelse`: "… Vid dammen lämnade den förra Väktaren sina
     stövlar." (Stryk att Hulda köpte dem.)
   - `spelmannen.berattelse`: stryk "– Dagmar, som skrattar"; skriv "Hon
     skrattar."
   - Skogsrået och Bergakungen får behålla namnet (tempel 6 och 7).

**Test** – `tests/story.test.ts`, "Dagmars namn sägs inte före Hulda":
```ts
const run = playthrough();
const reveal = run.steps.find((s) => s.kind === 'talk' && s.what === 'hulda_efter_folkparken')!.wave;
// 1. Repliker
for (const st of run.steps.filter((s) => s.kind === 'talk' && s.wave < reveal))
  expect(DIALOG[st.what].pages.join(' '), st.what).not.toMatch(/Dagmar/);
// 2. Namn på platser och rum som går att nå före dess
for (const st of run.steps.filter((s) => s.kind === 'area' && s.wave < reveal))
  expect(AREAS[st.what].name, st.what).not.toMatch(/Dagmar/);
for (const pl of OVERWORLD.places) expect(pl.name).not.toMatch(/Dagmar/);
// 3. Väsensbokens blad för väsen som finns i de rummen
```
För punkt 3: samla fiendebokstäver ur `tiles` i de nådda rummen med
`ENEMY_CHARS`, slå upp i `VASEN`, och kräv samma sak av `folktro` och
`berattelse`. Väktarnas blad räknas från den våg där `kind === 'boss'`.

**Klart när:** testet är grönt, och `grep -rn "Dagmar" src/data` bara ger
träffar som hörs efter avslöjandet.

### 0.2 Huldas bitar i rätt ordning

**Fil:** `src/data/npcs.ts` (hulda, rad 10–15).

**Steg:** vänd de sex raderna så att kryptan står först och Fäbodskogen sist.
Varje rad har redan sitt eget `notFlag`, så den äldsta ospelade väljs.
`hulda_signal`, introt och vilan ligger kvar efter dem.

**Test** – i `tests/story.test.ts`:
```ts
const s = newGame();
s.flags.push('intro_done', 'krypta_klar', 'gruvan_klar', 'kvarnen_klar', 'fyren_klar', 'folkparken_klar', 'fabodskogen_klar');
const heard: string[] = [];
for (let i = 0; i < 6; i++) {
  const talk = NPCS.hulda.talk.find((t) => check(t.if, s))!;
  heard.push(talk.dialog);
  for (const a of DIALOG[talk.dialog].actions ?? []) if (a.type === 'flag') s.flags.push(a.flag);
}
expect(heard).toEqual(['hulda_efter_krypta', 'hulda_efter_gruvan', 'hulda_efter_kvarnen', 'hulda_efter_fyren', 'hulda_efter_folkparken', 'hulda_efter_fabodskogen']);
```
`check` finns som metod på `Game` (`game.ts` rad 244). Flytta ut kroppen till
en ren funktion `checkConditions(conds, state)` i `state.ts` och låt metoden
anropa den, så att testet slipper ett helt `Game`.

### 0.3 Lärtexter efter styrsätt

**Filer:** `src/data/strings.ts`, `src/game/dialog.ts`,
`src/data/dialog/hem.ts`, `tests/text.test.ts`.

**Steg**

1. I `strings.ts`:
   ```ts
   buttons: {
     svard: { touch: 'SVÄRD', keyboard: 'X', gamepad: 'B' },
     magi:  { touch: 'MAGI',  keyboard: 'C', gamepad: 'Y' },
     hopp:  { touch: 'HOPPA', keyboard: 'Z', gamepad: 'A' },
   },
   ```
   Kontrollera tangenterna mot `src/engine/input.ts` innan de skrivs in.
2. I `dialog.ts`, i `layout()` (rad 39) innan `wrap`:
   ```ts
   const text = fillButtons(this.def.pages[this.page] ?? '', this.game.input.lastSource);
   ```
   med en ren funktion som byter `{svard}`, `{magi}`, `{hopp}`.
3. Repliker: `fick_svard` → "Svärd: {svard}. Håll NER för att slå lågt."
   och `lart_lakning` → "Magi: {magi}. Byt läsning i pausmenyn."

**Test** – i `tests/text.test.ts`:
- ingen sida i `DIALOG` innehåller `/-knappen|X \/ B|C \/ Y/`;
- varje `{…}` i någon sida finns i `STR.buttons`;
- `fillButtons` ger tre olika texter för de tre styrsätten;
- den längsta varianten får fortfarande plats i rutan (testet som redan mäter
  radlängd körs med alla tre).

### 0.4 En rad för magi i HUD:en

**Filer:** `src/game/hud.ts` (rad 23), `src/game/side/render.ts`
(`renderSpellIcons`, rad 286).

**Steg:** bryt ut en ren funktion:
```ts
export function spellLines(selected: SpellId | null, active: SpellId[]): { selected: SpellId | null; lit: boolean; others: SpellId[] } {
  return { selected, lit: !!selected && active.includes(selected), others: active.filter((a) => a !== selected) };
}
```
Rita den valda i gult (`'Y'`) när `lit`, annars vitt. `renderSpellIcons`
ritar bara `others`.

**Test** – `tests/text.test.ts` eller nytt `tests/hud.test.ts`: vald Lyse och
aktiv Lyse ger `lit: true` och `others: []`; vald Läkning och aktiv Lyse ger
`others: ['lyse']`.

### 0.5 Olles radiotips

`dialog/hem.ts`, `olle_radio`: "Har du också fått en radio! Lyssna … det
brusar som starkast borta vid Björkhagen. Som om någon pratade."
Inget nytt test; texttesterna för radlängd gäller.

---

## Fas 1 – Storyn går inte att missa

### 1.1 Hulda ringer

**Filer:** `src/data/dialog/hem.ts`, `src/data/npcs.ts`, `tests/story.test.ts`.

**Steg**

1. Skriv fem telefonversioner i `hem.ts`: `hulda_ringer_krypta` …
   `hulda_ringer_folkparken`. Samma innehåll som `hulda_efter_*`, omskrivet
   för telefon, utan `rest`, och med **samma flagga** som den vanliga biten:
   ```ts
   hulda_ringer_gruvan: {
     speaker: 'Mormor Hulda',
     pages: [
       'Dagny? Det är mormor. Greta kopplade fram mig. Hon säger att lyktorna i gruvan lyser igen.',
       'En lampa, säger du. Finns det bokstäver på den? … H.D. Jag har inte sett de bokstäverna på arton år.',
       'Jag lovar att berätta. Men inte än, och inte i telefon. Först måste du se mer själv.',
     ],
     actions: [{ type: 'flag', flag: 'hulda_efter_gruvan' }],
   },
   ```
   Fäbodskogens bit får ingen telefonversion. I stället
   `hulda_ringer_kom_hem`: "Kom hem, Dagny. Det här säger jag inte i
   telefon." (ingen flagga).
2. En inledning som värden säger, en per värdshus, till exempel
   `maj_telefon`: "Det är telefon till dig! Från Mormors by." med
   `next: 'hulda_ringer'`.
3. Vägvalet. En replik kan inte välja nästa replik efter flaggor i dag. Lägg
   därför raderna direkt i värdens `talk`-lista i `npcs.ts`, äldsta först,
   före `*_vila`:
   ```ts
   talk: [
     { if: [{ flag: 'krypta_klar' }, { notFlag: 'hulda_efter_krypta' }], dialog: 'maj_telefon_krypta' },
     { if: [{ flag: 'gruvan_klar' }, { notFlag: 'hulda_efter_gruvan' }], dialog: 'maj_telefon_gruvan' },
     …
     { if: [{ flag: 'fabodskogen_klar' }, { notFlag: 'hulda_efter_fabodskogen' }, { notFlag: 'hulda_ringt_hem' }], dialog: 'maj_telefon_kom_hem' },
     { dialog: 'maj_vila' },
   ],
   ```
   För att slippa 6 × 6 rader för hand: bygg listan med en funktion överst i
   `npcs.ts`, `phoneTalk('maj')`, som ger de sex raderna, och låt
   `*_telefon_*` vara en gemensam replik `telefon_<tempel>` där bara första
   sidan (värdens rad) skiljer. Enklast: en gemensam första sida utan
   talare, "Värden vinkar: det är telefon till dig, från Mormors by."
4. Gäller värdarna Signe, Maj, Rut, Hilma, Lind och Anna. Inte Hulda själv.

**Test** – i `tests/story.test.ts`:
- **Utan att gå hem:** kör lösaren med ett nytt val `avoidAreas:
  ['mormors_by']` efter introt (lägg till valet i `Options`; rummet hoppas
  över när `intro_done` är satt). Flaggorna `hulda_efter_krypta` …
  `hulda_efter_folkparken` ska ändå bli satta.
- **Aldrig två gånger:** för varje tempel sätter både `hulda_efter_x` och
  `hulda_ringer_x` samma flagga, och ingen av dem går att höra när den är
  satt (pröva `talk`-listorna med `checkConditions`).
- **Ordningen:** samma test som 0.2, körd mot en värds lista.

### 1.2 Den sista biten krävs före Trollberget

**Filer:** `src/data/overworld.ts` (rad 127–128),
`src/data/dialog/varlden.ts`, `src/game/overworld.ts` (rad 583).

**Steg**

1. Lägg `'hulda_efter_fabodskogen'` sist i `requires` för Trollberget.
2. Platsen har en enda `dialog` för "låst". Två olika skäl behöver två
   texter. Utöka `OverworldPlace`:
   ```ts
   /** Shown instead of `dialog` when only these flags are missing. */
   dialogWhen?: Array<{ missing: string; dialog: string }>;
   ```
   och i `overworld.ts` vid rad 583: är alla tempelflaggor satta men inte
   Huldas, visa `trollberget_vantar`.
3. Ny replik i `varlden.ts`:
   `trollberget_vantar`: "Berget är tyst. Det är som om det väntar på att
   något ska sägas först. Hemma."

**Test**
- `tests/playthrough.test.ts`: nytt fall med `withholdFlags:
  ['hulda_efter_fabodskogen']` (nytt val i lösaren: flaggan sätts aldrig).
  `troll_1` ska inte finnas bland `areas`, och `finished` ska vara falskt.
- Den vanliga genomspelningen ska gå i mål, och i `docs/genomspelning.md`
  ska Mormors by stå i vågen före Trollberget.
- Sparfiler: en sparfil som redan står inne i Trollberget ska fungera.
  Kravet prövas bara när man går in från kartan, så inget behöver göras, men
  lägg ett test i `tests/save.test.ts` som laddar en sådan fil.

### 1.3 Byfolket får ett tredje läge

**Filer:** `src/data/npcs.ts`, respektive `dialog/*.ts`.

**Steg:** för Sven, Tyra, Prosten, Elin och Ture: en ny rad först i
`talk`-listan (efter rader som lär ut något) med villkoret
`[{ flag: 'hulda_efter_fabodskogen' }, { notFlag: 'trollberget_klar' }]`.
Förslag på rader:
- Sven (`sven_vet`): "Så hon sa det till slut. Arton år har jag hållit tand
  för tunga. Du har din mammas ögon, jäntan. Nu får jag säga det."
- Tyra (`tyra_vet`): "Det var Dagmar jag såg den natten. Jag visste det då
  också. Men Hulda bad mig, och man säger inte nej till den som förlöst ens
  barn."
- Prosten (`prosten_vet`): "Jag döpte er båda. Henne också, 1922."
- Elin (`elin_vet`): "Hulda kom ner i gruvan med den lampan i tjugo år. Sedan
  kom flickan. Sedan ingen."
- Ture (`ture_vet`): "Rösten på bandet. Jag har undrat i arton år vems den
  var."

**Test** – i `tests/story.test.ts`: var och en av de fem har en rad med just
det villkoret, repliken finns, och den innehåller inget som lösaren inte
redan har hört (namnet Dagmar är tillåtet här eftersom flaggan kräver
avslöjandet). Datatestet som kräver att varje replik i `npcs.ts` finns körs
som vanligt.

---

## Fas 2 – Fienderna växer med Dagny

### 2.1 Liv- och XP-trappa

**Filer:** `src/data/progression.ts`, `src/entities/enemy.ts`,
`src/game/side/room.ts` (rad 138–140), `src/game/sidescene.ts`
(`spawnEnemy`), `src/game/side/combat.ts` (rad 114–115),
`tests/difficulty.test.ts`.

**Steg**

1. Tabeller i `progression.ts`, bredvid `TEMPLE_ENEMY_BONUS`:
   ```ts
   /** Life and XP of ordinary creatures in temple 1–7, as a multiple of their own. */
   export const TEMPLE_ENEMY_SCALE = [1, 1, 1.5, 2, 2.5, 3, 3.5];
   ```
2. På `Enemy`: fältet `xp` (i dag läses `def.xp` direkt) och en metod:
   ```ts
   /** Tougher and worth more, the deeper the temple. */
   scale(k: number): void {
     this.hp = this.maxHp = Math.ceil(this.def.hp * k);
     this.xp = Math.round(this.def.xp * k);
   }
   ```
   `harden()` (Trollbergets × 1,5) tas bort; trappans sista steg ersätter den.
   Ta bort `hard: true` ur `areas/trollberget.ts` och fältet ur `AreaDef` i
   samma incheckning.
3. I `room.ts` där `bonusDamage` sätts, och i `spawnEnemy`:
   `e.scale(templeScale(a.temple))`, med `templeScale` bredvid `templeBonus`.
4. I `combat.ts` rad 114–115: `e.xp` i stället för `e.def.xp`.
5. Möten på kartan: `AreaDef` för möten får `tier?: number` (0–6), satt efter
   vilket område mötet hör till, och samma `scale`. Tabellen i
   `data/encounters.ts` visar vilket möte som hör till vilken mark.
6. Väktarna rörs inte (de har egna värden).

**Test** – `tests/difficulty.test.ts`:
```ts
it('ordinary creatures take 2–4 blows in every temple', () => {
  const run = playthrough();
  for (const t of TEMPLES) {
    const styrka = /* Styrka-nivån lösaren har när den går in i templet; se nedan */;
    const dmg = swordDamage(styrka, itemsAt(run, t));
    const blows = enemiesIn(t).map((e) => Math.ceil(Math.ceil(e.hp * TEMPLE_ENEMY_SCALE[t.number - 1]) / dmg));
    expect(median(blows), t.id).toBeGreaterThanOrEqual(2);
    expect(median(blows), t.id).toBeLessThanOrEqual(4);
  }
});
```
Lösaren räknar inte nivåer. Använd en fast, uttalad antagen kurva i testet,
`EXPECTED_STYRKA = [1, 2, 3, 5, 6, 7, 8]`, och skriv i kommentaren att den
kommer från provspel (Styrka 7 vid tempel 6). Justera `TEMPLE_ENEMY_SCALE`
tills testet går igenom, inte tvärtom.

Uppdatera också testet som i dag håller skadetrappan, så att det inte längre
nämner `harden`.

**Klart när:** testet är grönt, och ett provspel av fyren och Fäbodskogen
visar att vanliga fiender tar två till tre slag.

### 2.2 Tätare tempel

**Filer:** `src/data/areas/krypta.ts` … `fabodskogen.ts`.

**Steg:** lägg fiendebokstäver i `tiles` (se `data/legend.ts`) tills varje
rum utom väktarens har 6–8. Placera dem på stående rutor (tom ruta med golv
under), inte inom fem rutor från en ingång (`A`, `E`) eller ett ljus (`c`).
Flygande (`f`, `r`, `e`, `l`) får stå i luften.

**Test** – i `tests/data.test.ts`:
- varje tempelrum utan `B` har minst `ceil(bredd / 10)` fiender;
- ingen fiende står inom fem rutor från en ingångsmarkör;
- hopp-, fastnar- och "ingen kommer in stående på spikar"-testerna i
  `tests/secrets.test.ts` körs oförändrade.

### 2.3 Fäktare i andra halvan

**Filer:** `src/data/enemies.ts`, `src/data/legend.ts`, `src/art/*`,
`src/data/vasen.ts`, `tests/fencer.test.ts`.

**Steg**

1. Fyra nya `EnemyDef` med `behavior: 'parrier'`:
   `fyrgast` (fyren), `dansor` (Folkparken), `vallpiga` (Fäbodskogen),
   `livvakt` (Trollberget). Högre `speed` än tomtenissen (0,5): 0,6 / 0,65 /
   0,7 / 0,8.
2. `parrier.ts` läser i dag fasta tider. Lägg fälten `guardDelay?` och
   `thrustEvery?` på `EnemyDef` och låt beteendet läsa dem, med dagens värden
   som standard. Då ändras inte tomtenissen.
3. En ledig bokstav per fäktare i `ENEMY_CHARS` (`legend.ts`). Lediga
   bokstäver: kör datatestet, det listar okända tecken.
4. Sprite: `base` plus `recolor` från `nisse` räcker för en första version.
5. Ett blad var i `vasen.ts` (testet kräver det).
6. Två per tempel, vid en nyckel eller en dörr.

**Test** – `tests/fencer.test.ts` görs om till en slinga över alla fiender med
`behavior === 'parrier'`: parerar på den höjd Dagny slår, står öppen under
utfallet, och dör av tillräckligt många slag i öppningen.

### 2.4 Fiender med ett eget svar

**Filer:** `src/data/types.ts`, `src/entities/enemy.ts` (rad 110–124),
`src/game/side/render.ts`, `src/tools/playthrough.ts`.

**Steg**

1. På `EnemyDef`:
   ```ts
   /** Only this kind of blow bites: fire, or a thrust from above or below. */
   only?: 'fire' | 'down' | 'up';
   /** Seen (and struck) only while Lyse burns. */
   hiddenUnlessLit?: boolean;
   ```
2. Eldbollar träffar i dag med höjden `'magic'` (`sidescene.ts` rad 543), och
   det gör Åska och näverlurens vätte också (`side/spells.ts` rad 94 och
   147). Lägg därför till `'fire'` i `HitHeight` (`enemy.ts` rad 9) och
   använd den på rad 543. Där koden i dag frågar efter `'magic'` för
   eldbollar (till exempel `backOnly` och `fireResist`) ska `'fire'` räknas
   likadant.
3. I `takeHit`, direkt efter `backOnly`-blocket och med samma gnistor och
   ljud:
   ```ts
   const o = this.def.only;
   if (o && height !== o) { … return 'blocked'; }   // 'fire' | 'down' | 'up'
   ```
4. `hiddenUnlessLit`: i `Enemy.update`, sätt `untouchable` och `alpha = 0.15`
   när `!world.lit()`. `lit()` finns redan på `WorldApi`.
5. Tre nya fiender, en per sort, satta i ett rum var i tempel 3–6.
6. Lösaren: en fiende med `only` eller `hiddenUnlessLit` som står på enda
   vägen till en nyckel kräver förmågan. Enklast och säkrast: sätt aldrig en
   sådan på enda vägen. Skriv det som ett test i stället för lösarlogik.

**Test** – nytt `tests/answers.test.ts`:
- per sort: fel slag ger `'blocked'` och ingen skada, rätt slag ger `'hit'`;
- `hiddenUnlessLit`: orörbar utan ljus, sårbar med;
- ingen sådan fiende står i ett rum som lösaren måste igenom innan förmågan
  finns (jämför rummets våg med vågen där förmågan lärs).

### 2.5 Liven

Efter provspel av 2.1–2.4. Siffran sitter i `START_LIVES`
(`src/game/state.ts`) och dockorna är `+` i rummens `tiles`. Testet på rad 60
i `tests/secrets.test.ts` håller antalet behållare; lägg ett bredvid för
dockorna innan något tas bort.

---

## Testsäkring (görs efter fas 2, före fas 3)

### T1 Väktare över tid

**Fil:** nytt `tests/bosses.test.ts`. Mall: `tests/backahast.test.ts`.

**Steg**

1. Flytta `world()`-stubben ur `backahast.test.ts` och `birds.test.ts` till
   `tests/helpers/world.ts`, med val för golv, damm (`Kind.Hazard`) och
   spelarens plats.
2. En slinga över `Object.values(BOSSES)` och båda faserna:
   ```ts
   const b = new Enemy(def, 240, 160); b.update(w); b.awake = true;
   if (phase === 1) b.hp = Math.floor(b.maxHp * 0.4);
   let open = 0; const modes = new Set<number>();
   for (let i = 0; i < 3000; i++) { b.update(w); if (!b.untouchable) open++; modes.add(b.mode); }
   expect(open, `${def.id} fas ${phase}`).toBeGreaterThan(450);   // sårbar minst 15 % av tiden
   expect(modes.size).toBeGreaterThan(1);                          // byter anfall
   ```
3. Kör med spelaren till vänster, till höger och rakt under.

Väktare som behöver något särskilt av rummet (Bäckahästens damm, Spelmannens
dansgolv) får det av stubben. Går en väktare inte att köra utan `SideScene`,
skriv upp den och ta den i T2.

### T2 En slumpspelare i varje rum

`SideScene` använder `document.createElement('canvas')` (`sidescene.ts` rad
149, `room.ts` rad 277 och 312), så den här körs i en riktig webbläsare.

**Filer:** nytt `e2e/monkey.spec.ts`, `playwright.config.ts`, `package.json`.

**Steg**

1. `npm i -D @playwright/test` och ett skript `"e2e": "playwright test"`.
   Konfigurationen startar `vite` (utvecklingsläge, eftersom `window.dagny`
   bara finns där, `main.ts` rad 96) på en fast port.
2. Testet, per rum i `AREAS`:
   ```ts
   await page.evaluate(async (id) => {
     const g = window.dagny; g.state = newGame(); /* alla magier och föremål */
     goToArea(g, id, { entry: 'A' });
   }, id);
   // 2 000 steg med slumpade knappar, med ett fast frö per rum
   const bad = await page.evaluate(() => {
     const sc = window.dagny.scene, p = sc.player;
     return rectHitsSolid(sc.grid, p) ? 'inne i vägg' : !Number.isFinite(p.x + p.y) ? 'NaN' : null;
   });
   ```
   Kontrollen görs var tionde steg. Slumpen har ett frö, så ett fel går att
   köra om.
3. Två varv per rum: som människa, och med Hamn påslagen.
4. Fånga `pageerror`; ett enda fel fäller testet.
5. Rum med väktare körs också, med väktaren väckt.

**Klart när:** alla 93 rum går igenom två gånger i rad med olika frön.

### T3 Rökprov på en emulerad telefon

**Fil:** `e2e/smoke.spec.ts`, `.github/workflows/ci.yml`.

**Steg**

1. `devices['Pixel 7 landscape']` (kontrollerna döljs i stående läge).
2. Flödet: titelskärm → nytt spel → introkorten → prata med Hulda → gå höger
   med spaken → slå → öppna pausmenyn → stäng → gå ut ur byn → kartan.
3. Spaken: tryck ner ett finger, släpp aldrig (`pointerdown` utan
   `pointerup`), skicka `blur` till fönstret, tryck med ett nytt finger åt
   andra hållet. Dagny ska gå åt det nya hållet. (Det är felet från 9
   november.)
4. I `ci.yml` efter `npm run build`:
   ```yaml
   - run: npx playwright install --with-deps chromium
   - run: npm run e2e
   ```

---

## Fas 3 – Varje förmåga används flera gånger

### 3.1 Regeln om tre

**Krokar som finns:** `AreaDef.needsSpell` (zoner som kräver en magi, lästa av
lösaren), luckor `!` (Uppåtstöt), `lampSecrets`, `dark`.

**Steg**

1. Skriv testet först, `tests/abilities.test.ts`:
   ```ts
   const uses = { hopp: [], hamn: [], aska: [], eld: [], lyse: [], uppatstot: [], nedatstot: [] };
   for (const a of Object.values(AREAS)) {
     for (const n of a.needsSpell ?? []) uses[n.spell].push(a.id);
     if (a.tiles.some((r) => r.includes('!'))) uses.uppatstot.push(a.id);
   }
   for (const [k, rooms] of Object.entries(uses)) {
     expect(rooms.length, k).toBeGreaterThanOrEqual(3);
     expect(rooms.some((id) => AREAS[id].temple === 'trollberget'), k).toBe(true);
   }
   ```
   Det misslyckas i dag med 1 eller 0 per förmåga. Det är utgångsläget.
2. Lägg till hinder, ett rum i taget, och låt lösaren bevisa vart och ett
   (kör med `withholdSpells: ['hopp']` och se att rummet inte längre går att
   ta sig igenom):

   | Förmåga | Nytt ställe 1 | Nytt ställe 2 (Trollberget) |
   |---|---|---|
   | Uppåtstöt | Lucka i gruvans Orten och i fyrtornet | Lucka i Trollgrottan |
   | Hopp | Hög avsats i Folkparkens Karusellen | Bergshjärtat |
   | Hamn | Trångt hål i Djupskogen (finns) plus ett i kvarnen, för en behållare | Djupa gångarna |
   | Åska | Döda lyktor i fyrens Linsrum | Bergsfoten |
   | Eld | Is eller torra rötter som spärrar i Fäbodskogen | Trollgångarna |
   | Lyse | Ett rum i gruvan där vägen bara syns i ljus (`hiddenUnlessLit` på plattformar) | Skuggsalens förrum |
   | Nedåtstöt | Sköra golv (`!` underifrån finns; lägg till `"` för ovanifrån) | Trollgrottan |

   Rumsnamnen i tabellen är förslag. Välj rum där hindret ryms utan att
   bryta hopp-testet.
3. Nya blocktyper (sköra golv, rötter som brinner) läggs i `data/legend.ts`,
   i `room.ts` där `!` hanteras, och i lösaren där luckor hanteras (rad 217).

### 3.2 Magi som förändrar världen

**Krok som finns:** `OverworldDef.mended` (rutor som ändras när en flagga
sätts), byggd för bron.

**Steg**

1. Ny terräng i `data/terrain.ts`: `torrt snår`, `blocked: true`, egen sprite.
2. Två snår på kartan i `overworld.ts` och två poster i `mended` med flaggor
   `snar_1_brant`, `snar_2_brant`.
3. Flaggan sätts när Dagny står intill snåret på kartan med Eld vald och
   trycker magi. Det är ny kod i `game/overworld.ts`; kartan har ingen magi
   i dag. Kostar magi som vanligt.
4. Lösaren: har hon Eld och når rutan intill, sätts flaggan.
5. Lyse och Åska på samma sätt, en plats var.

**Test** – som brotestet i `tests/world.test.ts`: rutan är stängd före och
öppen efter, och det som ligger bakom nås bara med magin
(`withholdSpells: ['eld']`).

---

## Fas 4 – Templen som nät

Görs ett tempel i taget. Gruvan först.

### Gemensam grund (byggs med piloten)

1. **Föremål som hör till ett tempel.** `TempleDef` får
   `tool?: { item: string; area: string; tx: number; ty: number }`. Föremålet
   ligger på en sockel (ny bokstav i `legend.ts`) och tas som en skatt.
2. **Hinder som kräver föremålet.** `AreaDef.needsItem?: Array<{ item: string;
   x0, y0, x1, y1 }>`, samma form som `needsSpell`, läst av lösaren på samma
   ställe.
3. **Grenar.** Rum kan redan ha dörrar (`doors`) utöver vänster och höger.
   Hallen är ett rum med tre dörrar.
4. **Mindre väktare** vid föremålet: en vanlig fiende med mycket liv och
   `sealed` på rummet (finns: rummet öppnas när alla är besegrade).
5. **Sparfiler.** I `src/game/save.ts`: har en sparfil `<tempel>_klar` men
   inte templets föremål, ges föremålet vid laddning. Test i
   `tests/save.test.ts`.

### Piloten: Gruvan med hissveven

**Filer:** `src/data/areas/gruvan.ts`, `src/data/items.ts`,
`src/game/sidescene.ts` (plattformar), `src/tools/playthrough.ts`.

**Steg**

1. Plattformarna i gruvan har `kind: 'lift'`. Lägg `needs?: string` på
   plattformens typ (`types.ts` rad 288). En plattform med `needs:
   'hissvev'` står still tills Dagny har föremålet.
2. Rita om till sex rum: Gruvstugan (ingång) → Hisshallen (tre vägar) →
   Verkstaden (veven, vaktad) / Malmorten (nyckel, livbehållare) /
   Hisschaktet (döda hissar, kräver veven) → Orten → Bergsalen.
3. Lösaren: en plattform med `needs` räknas som saknad utan föremålet. Den
   koden finns där plattformar läggs till som golv (sök på `rides` i
   `tests/secrets.test.ts` och motsvarande i lösaren).
4. Ett ljus (`c`) i Hisshallen.

**Test**
- Lösaren går i mål, och med `withhold: ['hissvev']` nås inte `gruvan_4`.
- Fastnar-testet körs två gånger per rum: med och utan veven (lägg ett val
  `items` i `softlocks()`).
- Hopp-testet per rum.
- Sparfilstestet ovan.
- Slumpspelaren (T2) i de nya rummen.

**Därefter provspel.** Resten av templen byggs först när piloten känns rätt.

### De övriga

| Tempel | Ny mekanik | Vad lösaren och fastnar-testet måste kunna |
|---|---|---|
| Kvarnen | Vattennivå som rumstillstånd (hög/låg), bytt vid en ratt | Två tillstånd per rum; fastnar-testet i båda; ratten nås från båda |
| Kryptan | Brytbara block (ny bokstav), kräver spettet | Block räknas som vägg utan föremålet |
| Fyren | Järnringar: en ring inom räckhåll drar Dagny till sig | Hoppmodellen får en ny rörelse; räckvidden mäts i motorn som hoppen gjordes |
| Folkparken | Plattformar med `needs` (som hissveven) | Som piloten |
| Fäbodskogen | Kor som plattformar när skällan ljuder | Plattformar med tillstånd på/av |

---

## Fas 5 – Sidouppdrag och byar

**5.1 Rosa (Bruksorten).** Ny skylt vid forsen i `kvarnen_1` eller på
Rönnen: läser man den med flaggan `medaljong_uppdrag` satt sägs Gunnars namn
och flaggan `gunnar_namnd` sätts. Rosa belönar på den flaggan. Medaljongen
tas bort som föremål (som solstenen togs bort: `items.ts`, `ITEM_ORDER`,
fyndet i rummet, repliken `hittade_medaljong`).

**5.2 Johan (Fiskeläget).** Återanvänd `Follower` (`side/follower.ts`) och
`lostChild` på ett nytt rum, "Dimman", där Johan sitter i sin båt. Kompassen
tas bort som föremål.

**5.3 Den gömda läraren (Karna).** Nytt rum `karnas_stuga` och en plats på
kartan med `hidden: 'lyse'` (ny sort bredvid `'near'` och `'radio'`;
`overworld.ts` rad 576 visar hur `'radio'` hanteras). Fäbodens loft står
tomt med en lapp.

**Test:** lösaren når varje belöning; räddningstesterna gäller Johan; för
Karna: platsen nås inte med `withholdSpells: ['lyse']`.

---

## Fas 6 – Trollberget som examen

Faller ut av 3.1 (varje förmåga har ett ställe i Trollberget) och fas 4
(föremålen används igen). Ordna rummen så att förmågorna kommer i den ordning
man lärde sig dem. Inget eget test utöver `tests/abilities.test.ts`.

---

## Fas 7 – Tempo

**7.1 Kortare start.** Dela `intro_hulda` i `intro_hulda` (fem sidor: kaffet,
mörkret, klingan, Stenkyrkan, Sven och Algot) och `hulda_mer` (Väktarna,
1946, löftet), som sägs första gången Dagny kommer hem med `sven_uppdrag`
eller `tang_uppdrag` klart. Löftesraden måste finnas kvar före kryptan.
*Test:* `DIALOG.intro_hulda.pages.length <= 5`, och lösaren hör `hulda_mer`
före `krypta_klar`.

**7.2 Snabbresa tidigare.** `tag_resa` har fyra val. Gör två repliker:
`dressin_resa` (Kyrkbyn och Gruvsamhället) med villkoret `gruvan_klar`, och
`tag_resa` som i dag plus Mormors by. Banvakten finns i Kyrkbyn,
Gruvsamhället och Fiskeläget; sätt en i Mormors by (`areas/hem.ts`, ny
siffra i `tiles`, och i `npcs`).
*Test:* lösaren kan använda dressinen efter `gruvan_klar` och inte före;
`travel`-valen leder bara till byar som finns.

**7.3 Mindre pekpinnar.** Stryk tredje sidan i `fick_eka`, `fick_karbidlampa`,
`fick_stovlar`, `fick_ficklampa` och `fick_naverlur`. Lägg riktningen hos en
person i närmaste by som i dag bara har en rad (Bosse, Lisa, Sigge, Stina,
Britta). `fick_radio` behåller raden om bron.
*Test:* textgranskning. Lösaren påverkas inte.

---

## Ordning att bygga i

1. 0.1, 0.2, 0.3, 0.4, 0.5 – en session, en incheckning var.
2. 1.2 (en rad data och ett test), sedan 1.1, sedan 1.3.
3. 2.1, provspel, 2.2, 2.3, 2.4, provspel, 2.5.
4. T1, T2, T3.
5. 3.1 med testet först, sedan 3.2.
6. Piloten i fas 4. Provspel. Sedan ett tempel i taget.
7. Fas 5 kan göras mellan templen. Fas 6 efter sista templet. Fas 7 sist.
