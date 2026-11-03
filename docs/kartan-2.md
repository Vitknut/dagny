# Kartan 2.0 – specifikation

*Status: steg 1–7 byggda (kapitel 1–8 och förvandlingen). Kvar: provspel och balans. Beslut 15 oktober 2026 (se §11).*
*Ersätter överblickskartan från oktober 2026 (80 × 56, sju regioner).*

> Granskning 15 oktober 2026 ("Storykartan"): handlingen saknades (nu §4)
> och återkomsterna pekade nästan bara på Hemdalen (nu tabellen i §6.6).

## 1. Problemet

I dag är kartan sju "fyrkanter" i rad. Varje skatt öppnar nästa fyrkant, och
varje fyrkant innehåller samma sak: en by, ett tempel, en liten plats och en
hemlighet. Mellan dem finns bara gräs, skog och slumpmöten. Resultatet:

- **Ingen resa.** Gränserna är en ruta man går över, inte ett äventyr.
- **Samma rytm sex gånger.** Ny skatt → ny fyrkant → by → tempel → skatt.
- **Skatterna öppnar bara dörrar.** De ändrar inte hur man rör sig eller ser världen.
- **Ingen anledning att gå tillbaka.** Gamla fyrkanter är färdiga och tomma.
- **Inget okänt som lockar.** Man ser inga mål i fjärran och hör inga rykten.

## 2. Målet

Kartan ska kännas som Zelda II: en farlig, levande värld där **vägen mellan
platserna är halva äventyret**.

### Sex pelare

1. **Resan är äventyret.** Varje gräns korsas genom en egen bana eller en egen utmaning, inte en ruta.
2. **Varje skatt är ett nytt sätt att röra sig eller se.** Inte bara en nyckel.
3. **Världen hänger ihop.** Varje ny skatt öppnar också något i gamla områden: genvägar, grottor, öar.
4. **Det okända lockar.** Trollberget syns överallt. Rykten, vägskyltar och utsiktspunkter visar på saker man ännu inte når.
5. **Varje kapitel har egen karaktär.** Egna faror, eget ljus, eget väder, egen musik och eget tempo.
6. **Framsteg syns.** Ett förlikat tempel får området att blomma upp, och byarna förändras.

### Storyns tråd: Dagmars spår

Resan följer Dagmar, den sista Väktaren. Varje skatt var hennes: ekan bar
henne över sjön (Grimmen), lampan har initialerna H.D., stövlarna lämnade hon
vid forsen, radion lyssnade hon på mellan stationerna, och näverfilten vävde
hon på vallen. Därför ska äventyret på kartan drivas av hennes spår, inte bara
av nästa lås:

- **Varje resa (§5) bär ett spår av Dagmar:** en ristning, ett föremål eller en plats hon stod på. Dagny följer en människa, inte en lista.
- **Signalen över sjön.** Dagmar blinkade varje kväll med sin lampa från en strand (tre korta, tre långa, tre korta), och Hulda svarade från vinden i klockstapeln i Kyrkbyn. Kartan ska därför ha **fri sikt över sjön mellan Kyrkbyn och Signalstranden** på andra sidan. Signalstranden blir en liten plats som nås med ekan, och med ficklampan (kapitel 6) kan Dagny blinka signalen själv. Det blir en återkomst med en stark scen.
- **Vägen till Trollberget.** Tyra såg Dagmar gå från klockstapeln mot Trollberget. Bergsstigen nås därför norrifrån via höglandet, inte genom gruvbygden.
- **Hulda berättar i takt med resan** (`hulda_efter_*`). Rykten och nya platser får inte avslöja mer än hon gjort.

### Det som ligger fast

- **Templens ordning är fast, 1 → 7** (beslut A). Friheten finns i sidoplatserna och i hur man tar sig fram.
- Dagny säger aldrig något. Inga riktiga varumärken. Svensk folktro, 1964.
- Mobil först: allt ska gå att spela med pekkontrollerna.

## 3. Strukturen: åtta kapitel

Spelet delas in i kapitel i stället för fyrkanter. Varje kapitel har en
**resa** (hur man tar sig dit), ett **område** (by, platser, hemligheter), ett
**tempel**, och en **återkomst** (vad skatten öppnar i gamla områden).

| # | Kapitel | Resan dit | Ny förmåga på kartan | Tempel → skatt |
|---|---|---|---|---|
| 1 | **Hemdalen** | – (start) | Gå, slåss | Stenkyrkans krypta → Ekan |
| 2 | **Sjön** | Segla fritt | Ekan: vatten, öar, strömmar | – (sjön är resan) |
| 3 | **Gruvbygden** | I land vid Gruvbryggan | – | Gamla gruvan → Karbidlampan |
| 4 | **Stollen och kvarndalen** | **Gamla stollen**, sidovybana genom fjället | Karbidlampan: mörka banor | Kvarnen → Stövlarna |
| 5 | **Myren och kusten** | **Myrlabyrinten**: dimma, landmärken, irrbloss | Stövlarna: myr, vadställen | Fyren → Ficklampan |
| 6 | **Natten** | **Nattskogen**: mörk karta, ljuskägla | Ficklampan: ljus på kartan | Folkparken → Radion |
| 7 | **Bruset** | Den dolda stigen | Radion: knaster nära hemligheter, överallt | Fäbodskogen → Näverluren |
| 8 | **Uppstigningen** | **Bergsstigen**: labyrint av stigar och grottor | Näverluren: kallar vättar | Trollberget |

Kapitel 2 och 3 skiljs åt för att sjön ska bli ett eget äventyr och inte bara
en väg till gruvan.

## 4. Berättelsen kapitel för kapitel

*Granskning 15 oktober: specen beskrev världen och progressionen men nästan
ingen handling. Det här avsnittet är svaret, byggt på det som redan står i
spelets texter (`docs/lore-audit.md`).*

### Den röda tråden

Midsommarnatten 1946 band Dagmar, den sista Väktaren, sig vid Bergakungen
för att hålla hans vrede borta – **så länge människorna mindes de heliga
platserna**. Arton år senare har folk glömt. Platserna har somnat, väsena
har blivit vilda, och bandet håller på att brista. Därför:

- **Hotet växer.** För varje plats som glömts har berget mullrat lite mer. Varje förlikad plats lugnar det – men stärker också Bergakungen inför slutet, för han vaknar när bandet inte längre behövs.
- **Dagny följer sin mor utan att veta det.** Hon vet inte att Väktaren är hennes mor. Spåren (§2) och Huldas bitar lägger pusslet åt spelaren innan Dagny själv får höra det.
- **Hulda vet allt** och berättar i takt med att Dagny har sett tillräckligt själv ("Först måste du se mer själv"). Vändningen efter kapitel 7: Hulda är Dagmars mamma och var själv Väktare före henne (se `docs/storyn.md`).

### Byggstenarna per kapitel

| # | Varför Dagny går dit | Dagmars spår | Vad Dagny förstår | Hulda efteråt | Berget |
|---|---|---|---|---|---|
| 1 | Hulda: de sju platserna vaktades förr; Stenkyrkan ligger närmast | "...da, Väktare" i kryptan; Tyra såg en kvinna med kopparhår | Det fanns en Väktare som försvann samma natt som Dagny hittades | "Du är den vi väntat på." | Klockstapeln ringde av sig själv 1946 |
| 2 | Grimmen ger ekan: "Den bar henne över sjön" | Eremiten minns kvinnan; D och H på Måsskäret; signalstenen | Väktaren och någon "H" stod varandra nära (mor och dotter, visar det sig) | (inget nytt – sjön är resan) | Mullret hörs över vattnet om kvällarna |
| 3 | Eremiten: hackor i den tysta gruvan | Lampan med H.D. | H.D. – vems lampa? (Hulda Dahls) | "H.D. Jag har inte sett de bokstäverna på arton år." | Gruvan skakar |
| 4 | Gamla stollen leder vidare; Bruksortens folk behöver hjälp | Stövlarna på stranden vid forsen | Hon gav upp något för att gå vidare | "Jag köpte dem 1945 … Ja, jag kände henne." | Forsen går baklänges en natt |
| 5 | Rykten om ljus som går ner; Fiskelägets saknade kompass | Fyrens loggbok: "Signalen från stranden tystnade" | Signalen gick mellan stranden och Kyrkbyn | "Det var jag som svarade." | Fyrljuset slocknar av sig självt |
| 6 | Ficklampan; fiolen hörs genom nattskogen | Fotografiet: hon dansar med ett irrbloss; signalen besvaras igen | Hon var ung, glad, levande | "Hon hette Dagmar." | Folkparkens ljus flimrar i takt med berget |
| 7 | Radion knastrar – "någon sjunger mellan stationerna" (Olle) | Näverfilten i korgen under klockstapeln | Filten var Dagnys. Väktaren är hennes mor – och Huldas dotter | "Hon var din mamma. Och hon var min dotter." | Stigen till höglandet öppnas för första gången på arton år |
| 8 | Hulda: "Där får du hela sanningen" | "D. gick här", anteckningsboken i Väktarkammaren | Dagmar band sig vid berget för hennes skull | – (finalen) | Bergakungen vaknar |

### Det som saknas och ska skrivas

- **Varför går Dagny vidare?** Kolumnen ovan ger ett skäl per kapitel. Varje skäl ska finnas i spelet som en replik eller ett rykte, inte bara i specen.
- **Bergets mullrande** (kolumnen "Berget") finns inte i spelet än. Förslag: en kort händelse på kartan efter varje förlikat tempel (skärmen skakar, ett muller, en replik från närmaste by).
- **Sjön (kapitel 2) har ingen egen Hulda-replik**, eftersom ekan leder rakt vidare till gruvan. Sjöns ögonblick med Hulda kommer i stället när signalen besvaras i kapitel 6 (`hulda_signal`, finns).

## 5. Kapitlen i detalj

### Kapitel 1 – Hemdalen (lära sig)

- **Känsla:** trygg sommarkväll, men Trollberget hänger svart i norr, alltid synligt.
- **Innehåll:** Mormors by, Kyrkbyn, Björkhagen, Gamla kyrkogården, Stenkyrkan. Läkning från Sven, Nedåtstöt från Algot.
- **Nytt:** en **utsiktspunkt** (Kyrkbacken) som visar sjön, öarna och fjället på pausmenyns karta som "sedda på avstånd". Det sår frön.
- **Rykten:** Telefonist-Greta har hört om ljus på en ö mitt i sjön.
- **Gränsen:** sjön. Ekan är Dagmars båt. Grimmen ger den när kryptan är förlikad ("Den bar henne över sjön en gång"), och den väntar vid bryggan.

### Kapitel 2 – Sjön (frihet)

- **Känsla:** första gången världen öppnar sig. Vind, vågor, måsar, en ny låt (sjöfärd).
- **Segling:** ekan är ett fordon på kartan. Man ror fritt över vattnet och kliver i land bara vid bryggor.
- **Strömmar** nära forsen drar ekan nedströms, så man måste ro emot. **Dimbankar** döljer kartan runt ekan.
- **Öar att välja mellan** (valfri ordning):
  - **Jättegrytan** (finns i dag): grotta på holmen.
  - **Eremitholmen** (ny): en gubbe som byter ett ryktesminne mot en fisk och berättar om gruvan.
  - **Måsskäret** (nytt, hemligt): ett litet skär som eremiten berättar om. Där ligger en näverdocka.
  - **Signalstranden** (ny, på andra sidan sjön, mitt emot Kyrkbyn): stenen där Dagmar stod och blinkade. Ristat i stenen: tre streck, tre ringar, tre streck.
- **Gruvbryggan** i norr leder till kapitel 3.
- **Återkomst:** en vik vid Mormors by blir en genväg hem.

### Kapitel 3 – Gruvbygden (arbete och berg)

- **Känsla:** gruvsamhälle, slaggvarp, damm, sirener från gruvan.
- **Innehåll:** Gruvsamhället (Lyse från Elin), Kolartorpet, Gamla gruvan.
- **Byn ger nyckeln till templet:** gruvan behöver något från Gruvsamhället, till exempel Anders gruvnyckel efter fickursuppdraget eller ljuset från Lyse i en mörk sal.

### Kapitel 4 – Stollen och kvarndalen (mörker under jord)

- **Resan:** **Gamla stollen** är en kort sidovybana i 2–3 rum genom fjället, mörk och bara upplyst av karbidlampan. Den har gruvvagnar, ett eget litet hot (ett ras som jagar) och ett vägval där ena grenen leder till ett gömt rum.
- **Område:** Bruksorten, Kvarnen vid forsen, Pestkorset, Fallgrottan bakom vattenfallet.
- **Byn drar in:** kvarnen kräver **Uppåtstöt** från förman Karlsson i Bruksorten. Han lär ut den först när Dagny har hämtat hans berghacka, gömd bakom vattenfallet norr om kvarnen (Fallgrottan). En lucka i kvarnen kan bara slås upp underifrån. Bruksorten ligger på vägen från stollen till kvarnen.
- **Återkomst:** stollen har en sidogång som leder tillbaka till Gruvsamhället, en genväg.

### Kapitel 5 – Myren och kusten (vilse)

- **Resan:** **Myrlabyrinten**. Dimma döljer allt utom några rutor runt Dagny, och pausmenyns karta visar bara det hon sett.
  - Man hittar via **landmärken:** en död tall, ett vägkors, en övergiven pråm.
  - **Irrbloss** vandrar på myren och lockar mot gungfly som sänker Dagny tillbaka till kanten.
  - Tjuvgrottan ligger mitt i myren: tre mörka rum (ingången med spikgropar, schaktet upp med livbehållaren på en avstickare, och tjuvarnas kammare med magibehållaren, näverdockan och silvret allra innerst).
- **Område:** Fiskeläget (Hopp från Viola), Skeppssättningen, Fyren i skären.
- **Byn drar in:** fyren behöver något från Fiskeläget, till exempel att Johan ror Dagny ut till fyrskäret när kompassen är hittad, eller att Viola lär ut Hopp som behövs i fyren.
- **Återkomst:** stövlarna gör att man kan vada över forsen hem, en genväg från kusten till Hemdalen.

### Kapitel 6 – Natten (rädsla)

- **Resan:** **Nattskogen**. Kartan blir mörk och bara **ficklampans ljuskägla** framför Dagny syns.
  - Vargar syns bara som ögon i mörkret.
  - Det finns ljud att följa: en fiol från Folkparken, ett tåg som visslar.
- **Område:** Stationssamhället, Folkparken, Milstolpen.
- **Tåget:** när stinsens uppdrag är klart kan Dagny åka tåg mellan stationerna. Det blir **snabbresa** mellan Hemdalen, Gruvbygden och kusten, och belöningen känns stor.
- **Byn drar in:** Oskar lär ut Åska, som behövs i Folkparken.
- **Återkomst:** ficklampan visar grottor och tecken i gamla områden, och en grotta i Björkhagen öppnas.

### Kapitel 7 – Bruset (det dolda)

- **Radion knastrar** starkare ju närmare en hemlighet man är, på hela kartan. Det blir en jakt bakåt genom alla tidigare kapitel: dolda stigar, en bergsdörr, gömda rum i templen (finns i dag) och nya hemligheter på kartan.
- **Resan:** den dolda stigen genom granskogen till höglandet.
- **Område:** Fäboden (Hamn från Karna), Fäbodtorpet, Fäbodskogen.
- **Byn drar in:** Lill-Pers koskälla, eller Karna, ger något som behövs i Fäbodskogen.

### Kapitel 8 – Uppstigningen (finalen)

- **Resan:** **Bergsstigen**, en labyrint av stigar, stup och grottor uppför Trollberget, som dödsberget i Zelda II.
  - Flera korta sidovygrottor binder ihop fickor på kartan.
  - Fel väg leder tillbaka ner.
  - Det stormar: vinden knuffar Dagny på kartan.
  - Väktarkammaren ligger på vägen.
- **Näverluren** kallar en vätte som visar vägen i en av grottorna.
- **Templet:** Trollberget, som i dag.

## 6. System som behöver byggas

### 6.1 Passager (sidovybanor mellan områden)

En **passage** är en kort sidovybana med en ingång på kartan i ena änden och
en utgång i den andra. Den är inte ett tempel: inga nycklar och ingen boss, men
fiender, ett hot och gärna ett vägval eller en hemlighet.

- Data: `OverworldPlace` får `kind: 'passage'` och `to: { x, y }`. Banans `right` leder ut på kartan vid `to`, och `left` tillbaka.
- Passager: Gamla stollen (kap 4), grottorna i Bergsstigen (kap 8). Kanske även en bro över forsen som bana.

### 6.2 Sikt på kartan: dimma och mörker

- Kartan kan ritas med **begränsad sikt:** en radie runt Dagny (dimma) eller en kägla framåt (ficklampan).
- Terrängtabellen (`TERRAIN`) får `sight?: 'fog' | 'dark'`. Sikten gäller medan Dagny står på sådan mark.
- Det som är utanför sikten ritas inte, och slumpmöten syns inte förrän de är nära.

### 6.3 Fordon: ekan

- Står Dagny vid en brygga med ekan byter hon till ekan och ror fritt över `~`.
- I land kan hon bara stiga vid bryggor (`j`). Ekan ligger kvar vid bryggan där hon klev av.
- **Strömmar** (ny terräng `≈` eller en riktningstabell) knuffar ekan.
- Sjöfärden har egen musik.

### 6.4 Dygnet – struket

Beslut: inga tider på dygnet som styr hemligheter. Gryningsskäret heter nu Måsskäret och hittas i
stället med ett rykte från eremiten och syns från en utsiktspunkt. Natten i
kapitel 6 är platsens egenskap (nattskogen), inte en klocka.

<details><summary>Det ursprungliga förslaget</summary>


- Tiden går med stegen på kartan: **dag, kväll, natt, gryning**. En hel cykel tar ungefär fem minuters vandring.
- Att vila i en by sätter tiden till morgon.
- Kartan tonas efter tid på dygnet. Mötestabellerna har redan nattvarianter.
- Vissa saker finns bara vid vissa tider: Gryningsskäret, fiolen i Folkparken på natten, ett irrbloss på kyrkogården vid midnatt.

</details>

### 6.5 Rykten, utsikter och skyltar

- **Rykten:** vissa repliker sätter en flagga `rykte_<plats>`. Pausmenyns karta visar då ett **?** vid platsen, även om den är osedd.
- **Utsiktspunkter:** några platser (Kyrkbacken, gruvlavens tak, fyren) avslöjar ett större område på pausmenyns karta som "sett på avstånd" (ljusare dimma).
- **Vägskyltar** vid korsningar pekar mot byar man ännu inte varit i.

### 6.6 Återkomst

- Varje skatt öppnar 1–2 saker i tidigare kapitel, och **varje område får minst en återkomst** – inte bara Hemdalen (granskningen 15 oktober).

| Skatt | Återkomst | Område |
|---|---|---|
| Ekan | En vik vid Mormors by blir en genväg hem | Hemdalen |
| Karbidlampan | Jättegrytans inre grotta lyses upp | Sjön |
| Karbidlampan | Gamla stollens sidogång tillbaka till Gruvsamhället | Gruvbygden |
| Stövlarna | Vasskanten runt sjön blir gångbar: Signalstranden nås till fots | Sjön |
| Stövlarna | Ett vadställe över bäcken bakom Kolartorpet | Gruvbygden |
| Ficklampan | Signalstranden: Dagmars signal besvaras (**finns**) | Sjön |
| Ficklampan | Grottan i Björkhagen | Hemdalen |
| Radion | Galleriet i Gamla stollen (**finns**), gömda rum i templen (**finns**) | Kvarndalen, templen |
| Radion | Fiskelägets gamla sändare: Dagmars röst på en gammal inspelning | Kusten |
| Näverluren | Vättarna på stranden bär fram ett vrak med en livbehållare | Kusten |

- Genomspelningslösaren kontrollerar att varje återkomst är nåbar med rätt skatt och inte före.
- Genomspelningslösaren kontrollerar att varje återkomst är nåbar med rätt skatt och inte före.

### 6.7 Förvandling när ett tempel förlikas

- Regionens marktoning går från grå till sommar.
- Antalet skuggmöten på kartan halveras.
- Byns musik får en ljusare variant.
- Bybor får nya repliker (finns delvis i dag via `hulda_efter_*`).

### 6.8 Byn ger nyckeln

Varje tempel kräver något från närmaste by, en läsning, en teknik eller ett
föremål, som Zelda II:s byar. Tabell:

| Tempel | Kräver | Från |
|---|---|---|
| Kryptan | Läkning (rekommenderas), Nedåtstöt efteråt | Mormors by (som i dag) |
| Gruvan | Lyse i en mörk sal | Gruvsamhället |
| Kvarnen | Uppåtstöt (lucka underifrån) | Bruksorten |
| Fyren | Hopp (hög avsats i fyrtornet) | Fiskeläget |
| Folkparken | Åska (väcker ljusslingorna) | Stationssamhället |
| Fäbodskogen | Hamn (fågel över ett stup) | Fäboden |

## 7. Kartan: ny form

- **Storlek:** cirka 96 × 72 rutor (i dag 80 × 56). Kartan blir större men fylls inte jämnt: täta platser varvas med tomma vidder och vatten.
- **Siktlinjer:** Trollberget i norr syns från nästan överallt. Sjön i mitten syns från alla tidiga områden.
- **Skiss** (norr upp; inte skalenlig):

```
  ┌──────────────────────────────────────────────────────────────┐
  │ Fäbodskogen   Bergsstigen ▲ TROLLBERGET ▲      Kvarnen ≋ forsen│
  │   Fäboden     (labyrint)    Väktarkammaren   Fallgrottan      │
  │  ⋯ dolda stigen ⋯                         Bruksorten           │
  │ ███ granskog ███   Gruvan ⛏   ═══ Gamla stollen ═══  Pestkorset│
  │                 Gruvsamhället  Kolartorpet                     │
  │ Kyrkbacken☆      Gruvbryggan                ░░ MYREN ░░        │
  │ Kyrkbyn  Stenkyrkan   ~~~~~~~ SJÖN ~~~~~~~  ░ Tjuvgrottan ░    │
  │ Kyrkogården        ~ Eremitholmen ~ Jättegrytan ~   Fiskeläget │
  │ Mormors by ⌂ brygga ~~~ Måsskäret     ~~~       Skeppssättn.  │
  │ Björkhagen      ▓▓ NATTSKOGEN ▓▓   Stationen ═ räls ═  Fyren ⌂ │
  │                  Milstolpen   Folkparken ✦                     │
  └──────────────────────────────────────────────────────────────┘
```

- **Gränser:** varje gräns är en passage, ett vatten, en dimma, ett mörker eller en labyrint (§5). Inga raka murar av berg.
- Kartan genereras som i dag med verktygen i `scratchpad` (ow_gen, ow_check), men från en ny handritad mall.

## 8. Vad som påverkas i koden

| Del | Ändring |
|---|---|
| `src/data/overworld.ts` | Ny karta, platser, passager, bryggor, strömmar |
| `src/data/terrain.ts` | `sight`, strömmar, nya landmärken (död tall, pråm, utsikt) |
| `src/data/types.ts` | `OverworldPlace.kind/to`, rykten, tidsvillkor |
| `src/game/overworld.ts` | Fordon, sikt, dygn, rykten, vandrande folk, förvandling |
| `src/game/menus.ts` | Pausmenyns karta: rykten (?), "sett på avstånd" |
| `src/data/areas/` | Nya passager: Gamla stollen, Bergsstigens grottor, nya småplatser |
| `src/data/npcs.ts`, `dialog/` | Rykten, "byn ger nyckeln", eremiten, tåget |
| `src/audio/songs.ts` | Sjöfärd, natt, dimma, storm (enligt soundtrackets linje) |
| `src/game/save.ts` | Migrering: gamla sparfiler placeras på motsvarande plats på nya kartan |
| `src/tools/playthrough.ts` | Fordon, passager, återkomst, dygnsvillkor |

## 9. Klart när (acceptanskriterier)

- [ ] Genomspelningslösaren klarar spelet, och templen faller i ordning 1 → 7.
- [ ] Varje kapitel 2–8 har en resa som inte är en ruta: segling, passage, dimma, mörker eller labyrint.
- [ ] Varje skatt öppnar minst en sak i ett tidigare kapitel (återkomst), och inte innan skatten finns.
- [ ] Varje tempel kräver något från sin by (tabellen i §6.8), och lösaren visar att templet inte går utan det.
- [ ] Trollberget syns på skärmen från minst hälften av alla gångbara rutor.
- [ ] Inga raka gränser längre än sex rutor (som i dag), och något nytt i sikte på varje skärm (som i dag).
- [ ] Gamla sparfiler fungerar och hamnar på rätt plats.
- [ ] Inga gropar att fastna i, i passager eller nya rum (grop-testet, med plattformar).
- [ ] Provspelat på telefon: varje kapitel känns annorlunda (din bedömning).

## 10. Leveranser – ett kapitel i taget

Varje steg går att provspela innan nästa påbörjas.

1. **Grunden:** passager, sikt (dimma och mörker), fordonet ekan och dygnet, provade på dagens karta.
2. **Ny karta, kapitel 1–3:** Hemdalen, Sjön och Gruvbygden med utsikt, rykten, öar och strömmar.
3. **Kapitel 4:** Gamla stollen och kvarndalen, där Bruksorten drar in.
4. **Kapitel 5:** Myrlabyrinten och kusten.
5. **Kapitel 6:** Nattskogen och tåget.
6. **Kapitel 7–8:** radiojakten och Bergsstigen.
7. **Förvandling och finputs:** blommande områden, vandrande folk, musik, balans.

## 11. Beslut (15 oktober 2026)

1. **Dygnet:** nej – inga tider som styr hemligheter (§6.4 struket).
2. **Snabbresa:** tåget mellan stationerna i Hemdalen, Gruvbygden och vid kusten, öppnat i kapitel 6. **Byggt** (steg 5): Kyrkbyn, Gruvsamhället, Stationssamhället och Fiskeläget.
3. **Kartans storlek:** 96 × 72.
4. **Ekan:** fri segling bara om den tillför något – provas i steg 2, annars bryggor att hoppa mellan.
5. **Byn ger nyckeln:** tabellen i §6.8 gäller tills vidare.
6. **Nya platser:** börja med grunden och se om det tillför spelkänsla.

### Steg 1 (gjort)

- **Gamla stollen** (`data/areas/passager.ts`): gruvorten är nu en mörk sidovybana genom fjället, inträde från väster, med vagn över en taggränna, ett ras att hoppa över och ett galleri under taket där radion avslöjar en näverdocka (återkomst). Gruvorten är markerad `passage` i terrängtabellen.
- **Dimma på myren och mörker i nattskogen** (`sight` i terrängtabellen): bara några rutor runt Dagny syns, i skogen bara ficklampans sken framför henne, och pausmenyns karta fylls bara i nära henne.

### Steg 2 (gjort)

- **Ny karta, 96 × 72** (`scripts/kartan/`): genererad från en grov plan enligt §7 och storyns krav – sjön i mitten, Kyrkbyn och Signalstranden mitt emot varandra, Bergsstigen från höglandet. Alla rum har fått sina utgångar flyttade, och gamla sparfiler (version 4) hamnar vid sin by.
- **Sjön:** strömmar mot forsen drar ekan när Dagny slutar ro, en dimbank döljer Måsskäret, och bryggor på båda stränderna.
- **Kyrkbacken:** ett utsiktsröse – härifrån fylls kartan i långt ut över sjön.
- **Rykten:** Greta har sett ett ljus på en holme; eremiten berättar om Måsskäret och Signalstranden. Det man hört om står som **?** på pausmenyns karta.
- **Eremitholmen, Måsskäret, Signalstranden:** eremiten minns kvinnan med kopparhår, på Måsskäret är ett D och ett H ristade sida vid sida, och vid signalstenen kan Dagny med ficklampan (kapitel 6) blinka tre korta, tre långa, tre korta – och klockstapeln svarar. Hulda berättar efteråt.

### Steg 3 – kapitel 4 (gjort)

- **Bruksorten lär ut det kvarnen kräver:** nyckeln i kvarnen ligger i en stängd kammare ovanför en lucka (`!`) som bara Uppåtstöt slår upp. Karlsson nämner luckan, och lösaren bevisar att kvarnen inte går utan Uppåtstöt.
- **Gamla stollen, Rasgången** (`stollen_2`): ett andra mörkt rum. När Dagny har gått in en bit rasar taket bakom henne och raset rullar efter (`cavein` på rummet) – stenar faller vid fronten, och den som blir hunnen får ont och knuffas fram. Ut på andra sidan är raset över för gott (flaggan `stollen_rasat`), och stenhögarna ligger kvar på golvet sedan dess. Stollen har bara en ingång, i väster. Östra mynningen är igenspikad och Sidoorten igenrasad utifrån; de öppnas först när Dagny har gått ut genom dem inifrån.
- **Vägvalet i Rasgången:** mitt i raset finns en öppning till **Sidoorten** (`stollen_gomd`). Där har Hulda ristat ett H och ett litet D: "Här lärde jag henne lyssna på berget. H.D. 1934" – en ledtråd till vändningen. Sidoorten mynnar vid den igenrasade gruvorten ovanför Gamla gruvan, en genväg tillbaka till Gruvsamhället (karbidlampan behövs).

### Steg 4 – kapitel 5 (gjort)

- **Myrlabyrinten:** myren är nu stigar genom **gungfly** (`v`), ljusgrön vitmossa över öppet vatten med svarta hål som bubblar. Det ser fastare ut än myren runt omkring, och stövlarna hjälper inte där. Kliver Dagny i gungflyet sjunker hon och tar sig upp där hon senast stod på fast mark (utanför dimman). Lösaren och kartans räckvidd räknar gungfly som vägg.
- **Landmärken genom dimman:** den döda tallen (`p`), myrkorset (`I`) och den övergivna pråmen (`J`) syns som silhuetter långt bortom dimman, liksom irrblossen – som svävar över gungflyet och lockar ut Dagny.
- **Ramsan:** Sigge i Bruksorten, när kvarnen är förlikad: *"Till döda tallen, sen österut där stigen slingrar. Korset visar söderut, och pråmen visar havet."* och *"Där det bubblar bär det inte."*
- **Fiskeläget ger nyckeln till fyren:** i Linsrummet ligger nyckeln på en hylla fem rutor upp – för högt för ett vanligt hopp, men inom räckhåll med **Hopp** från Viola (hon antyder det). Rummet säger `needsSpell` till lösaren, som bevisar att fyren inte går utan Hopp.
- Stigar: norrifrån via tallen till Tjuvgrottans glänta, från tallen västerut till Signalstranden, från gläntan via korset och pråmen söderut mot kusten, och från nordöst ned till gläntan – plus några stigar som slutar i gungfly.

### Steg 5 – kapitel 6 (gjort)

- **Stationssamhället ger nyckeln till Folkparken:** ljusslingorna över dansbanan är döda, och golvet finns inte förrän Dagny kastar **Åska** i rummet (`beat.wake`). Oskar antyder det ("Åskan bor i trådar"), och en lapp vid dansbanan säger att strömmen gick i maj. Lösaren bevisar att Folkparken inte går utan Åska.
- **Nattskogen:** det som lurar där syns bara som ett par ögon som blinkar i mörkret. Fiolen från Folkparken och tågvisslan från Stationssamhället hörs om vartannat, från sitt håll (ljudet panoreras och dämpas med avståndet) – och en liten not eller ett ångmoln vid kanten av ljuskäglan visar varifrån, för den som spelar utan ljud.
- **Tåget:** när stinsen Berg har fått tillbaka sin visselpipa går tågen igen. Han – och en banvakt vid hållplatsen i Kyrkbyn, Gruvsamhället och Fiskeläget – låter Dagny åka mellan de fyra stationerna (`travel`). Före dess säger banvakterna varför inga tåg går, så spelaren vet vad som väntar. Tåget tar henne aldrig någonstans hon inte redan kan gå (testat).
- **En läsning kostar aldrig mer än Dagny kan bära** (`spellCost`): Åska och Hamn går alltid att kasta med full magistång, så ett ställe som kräver dem kan aldrig stänga ute den som inte hittat magibehållare.

### Steg 6 – kapitel 7 (gjort)

- **Radion knastrar:** med radion syns en liten mottagare i hörnet med fyra staplar, och det knastrar allt tätare ju närmare Dagny är något dolt hon inte hittat än – Väktarkammaren, den dolda stigen genom granskogen och rösterna nedan (`radioTargets`).
- **Bruset – Dagmars röst:** på fyra ställen i tidigare kapitel (Hemdalen, vid Stenkyrkan, Gruvbygden, kusten) fångar radion en kvinnoröst från berget: *"...mamma... om någon hör det här..."*, *"...jag räknar somrarna..."*, *"...hon har väl fått ett namn nu..."*, *"...det var aldrig ditt fel, mamma..."*. När alla fyra är hörda svarar någon i berget: tre korta, tre långa, tre korta – ett extra liv. Platserna syns ingenstans och gör ingenting utan radion (`radio: true`).
- **Återkomst på kusten:** gamle Ture spelar fyrens inspelning från midsommarafton 1946: Dagmar ber fyren hälsa Hulda att se efter klockstapeln.
- **Fäboden ger nyckeln till Fäbodskogen:** nyckeln ligger i en håla i berget med ett hål som bara en fågel kommer in genom. Med **Hamn** från Karna flyger Dagny in, blir sig själv därinne och släpper sig ut genom en springa i golvet (fågeln kan inte bära något). Lösaren bevisar att Fäbodskogen inte går utan Hamn.

### Steg 6b – kapitel 8 (gjort)

- **Buggen som Bergsstigen lagade:** sedan den nya kartan gick Trollberget inte att nå i själva spelet – bergsdörren tog alltid in i Väktarkammaren, och den ledde bara ut samma väg. Lösaren såg det inte, för kartans räckvidd gick rakt genom dörren. Nu har passager ett `leadsTo` (var de mynnar), räckvidden följer bara dem, och ett test kontrollerar att **varje plats som binder ihop två delar av kartan verkligen leder ut på andra sidan**.
- **Väktarkammaren är porten:** en dörr på var sida av stupet; genom kammaren och ut på den första avsatsen.
- **Bergsstigen:** avsatser åtskilda av stup, sammanbundna av korta sidovygrottor: **Klyftan** (blåsig ravin), **Vättegången** (tre gångar, en bär upp) och ut på toppplatån under Trollberget.
- **Stormen:** på stormfjället (`%`) knuffar vinden Dagny en ruta nedför berget då och då. Den som står still blåser ner i **Rasbranten** – fel väg, som bara leder ner och ut nedanför berget.
- **Näverluren:** i Vättegången springer vätten till den enda gång som bär upp och väntar där (`lurGuide`); de andra leder tillbaka.

### Steg 7 – förvandlingen (gjort)

- **Gråt blir sommar:** varje region är urlakad (mättnaden dras ner) tills dess tempel är förlikat; vid gränserna glider det över några rutor. Regionerna öppnas i templens ordning: Hemdalen–kryptan, Gruvbygden–gruvan, kvarndalen–kvarnen, kusten–fyren, folkparksslätten–folkparken, höglandet–Fäbodskogen.
- **Färre skuggor:** vartannat möte i en region håller sig borta när dess plats har vaknat.
- **Ljusare bymusik:** varje bys låt får en ljusare version (lite snabbare, med en klocka som dubblar melodin en oktav upp) när närmaste tempel är förlikat.
- Kvar: provspel från början till slut och balans (svårighet, XP, avstånd).

## 12. Ursprungliga frågor

1. **Dygnet:** fullt dygn med tidsberoende hemligheter, eller bara fasta tider per kapitel (natt i kapitel 6, gryning vid skäret)?
2. **Tåget som snabbresa:** ja eller nej? Det gör världen mindre men bekvämare.
3. **Kartans storlek:** 96 × 72, eller behålla 80 × 56 och göra den tätare?
4. **Ekan:** fri segling med strömmar, eller enklare (bara bryggor att hoppa mellan)?
5. **Byn ger nyckeln:** stämmer tabellen i §6.8, eller vill du byta något?
6. **Nya platser:** Eremitholmen, Gryningsskäret, Kyrkbacken, Gamla stollen och Bergsstigen. Vill du ha fler, färre eller andra?
