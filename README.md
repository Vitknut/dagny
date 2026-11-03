# Dagnys äventyr

Ett mysigt 2D-actionäventyr för webbläsaren, mobile first. Sommaren 1964, svensk folktro, en tyst hjältinna med en gammal klinga och kyrkklockans kläpp som fäste.

Hela spelet går att spela från början till slut: alla sju heliga platser, finalen på Trollberget, ett slut i soluppgången och en epilog på midsommarafton.

**Spela:** https://samanakbarian.github.io/dagny/ (publiceras automatiskt från `master`)

**Sätta upp publicering och Google Play:** se [`SETUP.md`](SETUP.md).

## Kom igång

Kräver Node 20 eller senare (22 rekommenderas).

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest: kollision, XP-kurva, sparformat, rörelse och dataintegritet
npm run lint       # ESLint
npm run build      # statisk mapp i dist/ (typkontroll + Vite)
npm run check      # allt ovan i följd – samma som CI kör vid varje push
npm run preview    # servera dist/ lokalt (med service worker)
```

`dist/` kan läggas på vilken statisk värd som helst (GitHub Pages, Netlify, Azure Static Web Apps). Sökvägarna är relativa, så en undermapp fungerar också. PWA och offline kräver HTTPS (eller `localhost`).

## Testa på mobil

1. Kör `npm run host` (det är `vite --host`). Vite skriver ut en nätverksadress, t.ex. `http://192.168.1.23:5173`.
2. Öppna adressen på telefonen (samma wifi) och vrid telefonen till liggande läge.
3. Service worker och installation på hemskärmen kräver HTTPS. Testa PWA:n genom att driftsätta `dist/` på en HTTPS-värd, eller kör `npm run build && npm run preview` och öppna via en HTTPS-tunnel.
   - **iOS Safari:** Dela → "Lägg till på hemskärmen". Startar i helskärm och fungerar offline.
   - **Android Chrome:** meny → "Installera app".

Lägg till `?debug` i adressen för att få alla läsningar och tekniker direkt, vilket är praktiskt när man testar. `window.dagny` exponerar spelobjektet i konsolen (bara i utvecklingsläge).

## Kontroller

| Handling | Tangentbord | Handkontroll | Pekskärm |
|---|---|---|---|
| Rörelse / ducka | Pilar / WASD | Styrkors / spak | Styrspak eller styrkors (vänster) |
| Hoppa (håll = högre) | Z / Mellanslag | A | HOPPA |
| Svärd (håll NER = lågt) | X | B | SVÄRD |
| Magi (vald läsning) | C | Y | MAGI |
| Prata / gå in genom dörr | Upp | Upp | Upp, eller tryck på personen |
| Bläddra i dialog | Z, Enter, X eller Upp | A, B eller Upp | Tryck var som helst |
| Paus | Esc / P | Start | ❚❚ |

Efter en dialog startar inget nytt samtal förrän efter en halv sekund. Samma person eller skylt startar inte om förrän Dagny har gått därifrån en bit, eller efter tre sekunder, så man öppnar inte samtalet igen av misstag när man trycker sig förbi sista sidan.

Pekkontrollerna visas automatiskt vid beröring och döljs när tangentbord eller handkontroll används. Storlek, placering, genomskinlighet, styrspak/styrkors och vibration ställs in under **Inställningar**.

## Android / Google Play

Mappen `android/` innehåller en Trusted Web Activity som paketerar webbversionen som Android-app,
och `.github/workflows/android.yml` bygger en signerad `.aab`. Steg för steg (Pages, signeringsnyckel,
Play Console, Digital Asset Links) finns i [`android/README.md`](android/README.md).

## Dokumentation

| Dokument | Innehåll |
|---|---|
| [docs/kartor/](docs/kartor/README.md) | Världskartan och regionerna, ritade ur speldata |
| [docs/arkitektur.md](docs/arkitektur.md) | Kodens uppbyggnad, mönster, kvalitet och känd teknisk skuld |
| [docs/speldesign.md](docs/speldesign.md) | Progression, vem som lär ut vad, liv och Game Over, templens ordning, Trollberget |
| [docs/soundtrack.md](docs/soundtrack.md) | Musiken: två ljudvärldar, Väktarmotivet, alla låtar och jinglar |
| [docs/lore-audit.md](docs/lore-audit.md) | Genomgång av berättelsen och dess detaljer |
| [docs/hamn-audit.md](docs/hamn-audit.md) | Regler för fågelformen Hamn |
| [docs/mobil-testchecklista.md](docs/mobil-testchecklista.md) | Checklista för att testa på telefon |

## Var ligger vad?

```
src/
  engine/      loop (fast 60 Hz), skärm/skalning, input (tangentbord, handkontroll, touch),
               kollision, sprites, bitmappsteckensnitt, ljudsynt + sequencer, lagring
  game/        scener (titel, sidovy, överblickskarta, berättelsekort), dialog, menyer,
               HUD, sparformat, XP-logik, parallax
    side/      sidovyns system: room (bygga rummet), combat, pickups, spells, render
  entities/    Dagny, väsen, NPC:er, projektiler, föremål, partiklar
    behaviors/ ett beteende per fil: walker, diver, shadow … och de sju bossarna
  data/        ALL speldata – se nedan
    areas/     rummen, en fil per region eller tempel
    dialog/    dialogerna, en fil per plats
  art/         sprites som teckenrutnät + bitmappsteckensnittet
  audio/       låtar (noter) och ljudeffekter (syntparametrar)
public/        manifest, ikoner (service worker genereras vid build från src/sw-template.js)
scripts/       gen-icons.mjs – ritar PWA-ikonerna från spritedata (`npm run icons`)
tests/         Vitest
```

### Data (ändras utan att röra motorn)

| Fil | Innehåll |
|---|---|
| `src/data/palettes.ts` | **Paletten** (~32 färger, ingen ren svart) och **tonfiltren** per område (sommarkväll, grå augusti, midnattssol, lyktsken, krypta …) |
| `src/data/areas/*.ts` | Sidovyområden, en fil per region eller tempel (samlas i `areas.ts`): tilemap + dekorlager, utgångar, NPC:er, rekvisita, mörker. Tecknen förklaras i `src/data/legend.ts` |
| `src/data/overworld.ts` | Överblickskartan: platser, dolda platser, sevärdheter och synliga möten |
| `src/data/terrain.ts` | Varje sorts mark på kartan: namn, sprite, vad den kräver och vilka möten den ger |
| `src/data/temples.ts` | De sju templen och byarna |
| `src/data/enemies.ts` | Väsen (beteende, liv, skada, XP, drops) och bossar med två faser. Beteendena finns i `src/entities/behaviors/` |
| `src/data/dialog/*.ts` | All dialog, en fil per plats (samlas i `dialog.ts`). Dagny säger aldrig något – val beskriver vad hon gör |
| `src/data/npcs.ts` | Bybor och vilken dialog de väljer beroende på flaggor |
| `src/data/spells.ts` | De sju läsningarna och teknikerna (nedåtstöt, uppåtstöt) |
| `src/data/items.ts` | Föremål och nyckelskatter |
| `src/data/progression.ts` | XP-kurvan och värden per nivå (Styrka, Magi, Liv, 1–12) |
| `src/data/strings.ts` | All gränssnittstext (förberett för översättning) |
| `src/art/*.ts` | Sprites som rutnät av tecken mot paletten. `getSprite(id, frame)` i `src/engine/sprites.ts` är det enda gränssnittet, så handritade PNG-ark kan ersätta datat senare |
| `src/audio/songs.ts` | Musiken som noter (`"e5:4 f#5:2 r:2"`, längd i sextondelar) |

`tests/data.test.ts` kontrollerar att kartorna är rektangulära, att alla utgångar, dialoger och sprites finns, att varje tecken i texterna finns i teckensnittet, att dialogsidorna får plats och att låtarnas stämmor loopar i takt.

## Tekniska val

- **Rendering:** Canvas 2D i 320×180. Heltalsskalning när den fyller minst ~85 % av skärmen, annars den största skalan som får plats. `image-rendering: pixelated`. Statiska tiles förrenderas per område och sprites cachas på offscreen-canvas vid uppstart.
- **Spelloop:** fast tidssteg 60 Hz, rendering på `requestAnimationFrame`. Vid `visibilitychange` pausas och sparas spelet, ljudet stängs av och pausmenyn öppnas när man kommer tillbaka.
- **Sparning:** `localStorage` bakom en wrapper som aldrig kastar fel och faller tillbaka på minnet. Spelet autosparar vid varje områdesbyte, vila, ljusstake (checkpoint), nyckel och när appen tappar fokus. Sparfilen är versionerad och valideras fält för fält. Vid första tryck ber spelet webbläsaren att aldrig rensa lagringen (`navigator.storage.persist()`). Annars kan till exempel iOS Safari radera den efter sju dagar utan besök.
- **Ljud:** Web Audio-synt med folkklanger (dragspel, harpa, flöjt, kyrkklocka, orgel) för byarna och NES-pulsvågor för äventyret. Jinglar spelas ovanpå musiken. Låses upp vid första tryck (krav på iOS). Se [docs/soundtrack.md](docs/soundtrack.md).
- **Förlåtande styrning:** coyote time, hoppbuffert, variabel hopphöjd, stora träffytor och "lugnt läge" som halverar skadan.

## Status och nästa steg

*Historiken nedan berättar hur spelet byggdes. Templens egna låtar som nämns där har sedan ersatts av en gemensam tempellåt (se [docs/soundtrack.md](docs/soundtrack.md)).*

**Leverans 1:** hela loopen by → karta → krypta (4 rum, nycklar, låsta dörrar, ljusstakar som checkpoints, mörkt benhus) → Kyrkogrimmen (två faser) → ekan → tillbaka till Hulda. Dessutom sidouppgiften med katten Murre, mentorn som lär ut nedåtstöt, nivåmeny, alla sju läsningar i motorn (Läkning lärs ut i spelet), synliga möten, PWA och offline.

**Tempel 2 – Den gamla gruvan:** nås med ekan över sjön. Fyra rum: Gruvlaven (gruvvagn över en spikgrop), Hisschaktet (tre hissar i ett vertikalt schakt), Orten (mörk ort med gruvvagn och fladdermöss) och Bergsalen med Gruvrået. Hon tänds och släcks i mörkret, kastar sten och rusar längs golvet i fas två. Nyckelskatten Karbidlampan fördubblar Dagnys ljus i mörka rum. Gruvan har egen musik ("Gruvarbetarvisan").

Motorn har nu rörliga plattformar (`platforms` i områdesdata: hissar och gruvvagnar, `loop` eller `ride`).

**Gruvsamhället:** byn vid gruvan, med gula gruvarbetarlängor och lavtorn. Maj på pensionatet låter Dagny vila, och man vaknar här efter ett nederlag. Gamla Elin lär ut **Lyse**. Sidouppgift: Anders fickur ligger kvar i Orten. Byn har egen musik, "Lavtornsschottis". Sidouppgiftsföremål läggs nu ut med `q` och `questItem` i områdesdata.

**Tempel 3 – Kvarnen vid forsen:** i skogen öster om vägen, nås utan båt. Fyra rum i regn: Kvarnbäcken (flytande stockar och ett vattenhjul upp till nyckeln), Kvarnstugan (stort hjul över kvarnrännan och kvarnnissar som parerar), Forsen (vertikal klättring vid ett vattenfall med två hjul och en hiss) och Kvarndammen med Bäckahästen. Den hoppar upp på stranden och galopperar, och i fas två sprutar den vatten och skickar vågor längs marken (hoppa eller ducka bakom skölden). Nyckelskatten Gummistövlarna öppnar myren på kartan. Egen musik: "Forsens visa".

Motorn har nu vattenhjul, flytande stockar, regn och ett kvarninteriör-tema.

**Tempel 4 – Fyren i skären:** på ön mitt i sjön, nås med ekan. Storm och regn. Skäret (vindbyar som knuffar Dagny över havet, stolpar att hoppa på), Fyrtornet (vertikal klättring med vindbyar genom fönstren och en uppvind i trapphålet), Linsrummet (mörkt, med fyrlinser som ljuskällor och hål i golvet) och Fyrgalleriet med Havsfrun. Hon svävar över galleriet, sprutar havsvatten, kallar vindbyar mot kanten och dyker ner. I fas två slår blixtar ner där det först blinkar en varning. Nyckelskatten Ficklampan kastar en ljuskägla framför Dagny i mörker. Egen musik: "Fyrvaktarens vals".

Motorn har nu vindzoner (`wind` i områdesdata: sidvind, växlande byar och uppvind), fördröjda projektiler med varning och ett havsbakgrundstema.

**Tempel 5 – Folkparken om natten:** på ängarna öster om sjön, nås med ekan. Parkentrén (ljusslingor, en flock skuggvargar och ett biljettkiosktak med nyckeln), Karusellen (rida karusellhästar över en avgrund), Dansbanan (rutor som tänds och släcks i takt med musiken – stå på skarven mellan två rutor) och Scenen med Spelmannen. Han spelar på scenen och skickar noter längs golvet (ducka, hoppa eller blockera) och i bågar, och hoppar sedan ner och dansar över golvet. I fas två visar han sig vara Näcken. Nyckelskatten Transistorradion öppnar dolda gångar (`?` i kartdata) – en finns redan i Björkhagen. Egen musik: "Lördagsfoxen" och bossmusiken "Näckens polska".

Motorn har nu rytmrutor (`%`/`&` + `beat`), karuseller (elliptiska banor), dolda väggar och ljusslingor som ljuskällor. Mörka rum har en justerbar mörkergrad (`darkness`).

**Tempel 6 – Fäbodskogen:** på myren söder om byn, kräver gummistövlarna. Myrkanten (flytande stockar, tät granskog i förgrunden), Villvägarna och Djupskogen (tre stigar där bara en leder vidare – följ det röda bandet på björken, inte irrblossen; fel stig leder tillbaka till början) och Fäbodvallen med Skogsrået. Hon är vacker framifrån men har en ihålig trästam till rygg, och bara ryggen går att skada. Hon rusar förbi Dagny och står en stund med ryggen vänd, kallar upp rötter ur marken (jorden sprätter först) och kastar kottar. Nyckelskatten Näverluren: håll NER och tryck MAGI, så kommer en förlikad vätte och slåss vid Dagnys sida en stund. Egen musik: "Vallåt".

Motorn har nu ett förgrundslager (`front`), dörrar som visar en dialog efter ankomst (`dialog` på utgångar) och väsen som bara kan skadas bakifrån (`backOnly`).

**Tempel 7 – Trollberget:** i nordost, öppnas först när de sex andra platserna är förlikade (`requires` på platser i kartdata). Bergsfoten (vindbyar, ett hjul över en spikklyfta, skuggvargar), Trollgrottan (mörk, med kristaller som ljuskällor, gruvvagn över spikar och nyckeln bakom en dold vägg som radion avslöjar), Bergshjärtat (vertikalt: uppvind, ett hjul och en låst port högst upp) och Bergakungens sal. Bergakungen stampar så att sten faller från taket och en tryckvåg rullar längs golvet. Efter stampen står han och flåsar, och då ska man slå. Han rullar också stenblock som ingen sköld stoppar (hoppa över dem) och kastar sten. I fas två lyser ljuset genom sprickorna i honom och han kallar på skuggvargar. Egen musik: "Uppför berget" och bossmusiken "Bergakungen".

**Finalen och epilogen:** när Bergakungen är förlikad står Dagmar, den sista Väktaren och Dagnys mamma, kvar i salen. Midsommarnatten 1946 band hon sig vid Bergakungen för att hålla hans vrede borta så länge människorna mindes de heliga platserna. Nu behövs inte bandet längre. Avskedet slutar i soluppgång på midsommarmorgonen. Sedan kommer epilogen, midsommarafton ett år senare i Mormors by, med majstång och gäster från hela spelet. Den slutar med eftertexter och en glimt av Dagnys äventyr 2.

Motorn har nu bossar som kallar på väsen (`spawnEnemy`), projektiler som skölden inte kan stoppa, NPC:er som dyker upp efter en boss (`afterBoss`) och dialoghandlingen `scene`, som startar slutet och eftertexterna.

**Byarna:** alla sju byar är byggda, med egen musik. Varje by har ett ställe att vila och vakna efter ett nederlag. Varje by har också en äldre som lär ut en läsning, och alla läsningar och tekniker går nu att lära sig i spelet:
- **Kyrkbyn:** kyrkan och klockstapeln där Dagny hittades. Prosten lär ut Eld när kryptan är förlikad. Gamla Tyra minns natten 1946.
- **Bruksorten:** järnbruket med sin skorsten. Smeden Holm lär ut Skydd och förman Karlsson lär ut Uppåtstöt.
- **Fiskeläget:** sjöbodar, brygga och båt. Nätlagerskan Viola lär ut Hopp, och gamle fyrvaktaren Ture har sin loggbok.
- **Fäboden:** timmerstugor med torvtak och fjällkor. Gammelmor Karna lär ut Hamn när gruvan är förlikad.
- **Stationssamhället:** järnvägshotellet, stationen och loket. Telegrafisten Oskar lär ut Åska.

Fem nya sidouppdrag, ett per by, där föremålen ligger i templen: Ingrids psalmbok (kryptan), Rosas medaljong (kvarnen), fiskaren Johans kompass (fyren), Lill-Pers koskälla (Fäbodskogen) och stinsens visselpipa (folkparken).

**Världen (version 1.1):** överblickskartan är 80 × 56 rutor, mot 44 × 32 förut. Den är delad i sju regioner, och varje tempels skatt öppnar vägen till nästa, som i Zelda II: ekan (sjön), karbidlampan (den mörka gruvgången), stövlarna (tidvattenkärret), ficklampan (Nattskogen), radion (det dolda passet) och sist vägen till Trollberget. Varje skatt säger vart den leder.

**Liv och ett svårare slut (version 1.2):** Dagny har 3 liv. Game Over skickar henne tillbaka till mormor, men i Trollberget till bergets fot. Åtta näverdockor ger extra liv. Trollberget har fått tuffare väsen, labyrinten Trollgångarna och Skuggsalen, där Dagnys egen skugga väntar. Läkning och Nedåtstöt får man inte längre gratis i början: Sven vill ha johannesört från Björkhagen, och Algot lär ut sitt knep först när kryptan är klarad.

**Soundtracket:** tempel 1–6 delar en tempellåt och en bosslåt, som i Zelda II. Väktarmotivet binder ihop templen, bossarna, Trollberget och segerfanfaren. Nytt finns också: möteslåt, grottlåt, Skuggans tema och jinglar för fynd och lärdomar. Se [docs/soundtrack.md](docs/soundtrack.md).

Nästa steg: polering, minskad teknisk skuld (se [docs/arkitektur.md](docs/arkitektur.md)), och sedan Dagnys äventyr 2.
