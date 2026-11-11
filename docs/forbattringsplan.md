# Förbättringsplan – Dagnys äventyr

*10 november 2026. Genomgång av story, logik, variation, balans, upplevelse och
dialog, med Zelda II som måttstock. Underlaget är spelets data och kod: alla
repliker, alla 93 rum, fiendetabellerna, storydokumentet, designdokumentet och
den genererade genomspelningen. Jag har inte spelat igenom spelet för hand;
där något bara går att bedöma med fingrarna står det.*

*Planen slår ihop två genomgångar: den från 9 november (svårighet, variation,
läraruppdragen och templen med "handsken") och den här. Avsnittet "Hur de två
genomgångarna hänger ihop" längst ner visar vad som kommer varifrån.*

*Steg för steg, med filer, kod och tester: se
[forbattringsplan-steg.md](forbattringsplan-steg.md).*

## Sammanfattning

Spelet har en stark grund: storyn håller ihop, replikerna är bra, världen är
egen och lösaren bevisar att allt går att klara. Det som drar ner upplevelsen
är fyra saker, i den här ordningen:

1. **Storyn kan missas och läcker.** Huldas bitar hörs bara om man går hem
   efter varje tempel, de spelas i fel ordning om man hoppat över någon, och
   Dagmars namn sägs på tre ställen långt innan Hulda avslöjar det.
2. **Fienderna växer inte med Dagny.** Skadan stiger per tempel, men liv och
   XP gör det inte, och templen har få fiender. Från tempel 3 dör nästan allt
   på ett slag.
3. **Varje förmåga är en nyckel som används en gång.** Uppåtstöt behövs på ett
   ställe i hela spelet, Hopp på ett, Åska på ett, Hamn på ett. Det är roten
   till "hämta, använd, upprepa".
4. **Templen är fyra rum i rad.** Samma mall sex gånger.

Planen har sju faser. Fas 0–2 är små och ger mest per timme. Fas 3–4 är det
stora arbetet och det som gör spelet mer likt Zelda II på djupet.

## Det som är bra och ska vara kvar

- **Storyn.** Löftet och skulden ger Hulda två skäl att tiga, ledtrådarna
  ("...da", H.D., kopparhåret) är rättvist utlagda, och slutet lämnar en dörr
  öppen utan att fuska.
- **Replikerna.** Korta, med egen röst per person, och nästan aldrig
  förklarande. Väsendenas rader före och efter striden bär temat "glömda,
  inte onda".
- **Väsensboken** med folktro på ena bladet och berättelsen på det andra.
- **Radion** (Dagmars röst i bruset) och **signalen över sjön**: valfria,
  ordlösa, och de starkaste stunderna i spelet.
- **Lösaren och testerna.** 489 tester, och en genomspelning som bevisar att
  varje dörr och villkor hänger ihop. Det är det som gör att en så här stor
  ombyggnad går att göra säkert.
- **Kontrollerna** (buffertar, coyote-tid, tumme som rullar mellan knappar).

## Fynd

### Story

| # | Fynd | Var |
|---|---|---|
| S1 | **Dagmars namn läcker.** Hulda säger "Hon hette Dagmar" först efter tempel 5, men Elin säger "Dagmars solsten" vid tempel 2, platsen heter "Dagmars ort" på kartan, och Väsensbokens sida om irrblossen (öppnas i första området) säger "dansar Dagmar". Bäckahästens sida (tempel 3) säger dessutom att Hulda köpte stövlarna åt Dagmar, vilket avslöjar bandet mellan dem tre tempel för tidigt. | `dialog/gruvsamhallet.ts`, `overworld.ts`, `areas/smaplatser.ts`, `vasen.ts` |
| S2 | **Huldas bitar går att missa helt.** De spelas bara om man går hem till Mormors by efter varje tempel. Inget kräver det, inte ens den sista ("Hon var din mamma"). Tåget stannar inte i Mormors by och finns först efter tempel 5. En spelare som inte går hem möter Dagmar utan att ha hört något, och Dagmars replik "Mamma hade släppt platserna" blir obegriplig. | `npcs.ts` (hulda), `overworld.ts` (Trollberget kräver bara de sex templen) |
| S3 | **Bitarna spelas baklänges om de staplas.** Listan prövar den senaste först. Går man hem efter tempel 4 utan att ha varit hemma sedan tempel 1 hör man fyren, sedan kvarnen, sedan gruvan. | `npcs.ts` rad 10–15 |
| S4 | **Byfolket har bara två lägen:** före och efter sitt eget tempel. Ingen reagerar på de stora vändningarna. Sven och Tyra, som anar sanningen, säger samma sak efter att Hulda har berättat allt. | `npcs.ts` |
| S6 | **Hulda citerar en skylt som inte säger det hon citerar.** Efter Fäbodskogen: *"...da, Väktare 1921–1946" – det står Hulda i kryptan.* Skylten i kryptan säger *"...da, Väktare. Hon tände ljusen här varje midsommar."* Årtalen saknas. | `dialog/hem.ts`, `dialog/krypta.ts` |
| S5 | Olle säger att radion brusar "nära Björkhagen, som om berget hade en dörr". Dörren i berget (Väktarkammaren) ligger längst i norr. Bruset nära Björkhagen är ett av Dagmars röstfragment. | `dialog/hem.ts` |

### Logik

Lösaren visar att spelet går att klara och att inget kan fastna. Det jag
hittade är sådant lösaren inte mäter:

| # | Fynd |
|---|---|
| L1 | **Lärtexterna visar tangentbordsknappar på telefon:** "Svärd: X / B-knappen", "Magi: C / Y-knappen". På mobil heter knapparna SVÄRD och MAGI. |
| L2 | **Vald magi och aktiv magi ser ut som en dubblett** i HUD:en ("Lyse" två gånger). |
| L3 | **Felen du hittade för hand hade en sak gemensamt:** de var beteenden över tid (Bäckahästen som sprutade för evigt, spaken som fastnade, fågeln som sjönk i marken). Testerna kontrollerar data och enskilda regler, men nästan inget kör spelet i många steg. Se "Testsäkring". |

### Variation

| # | Fynd |
|---|---|
| V1 | **Varje förmåga är en engångsnyckel.** Räknat i rummens data: Uppåtstöt krävs på 1 ställe (luckan i kvarnen), Hopp på 1 (fyren), Åska på 1 (dansbanan), Hamn på 1 (Fäbodskogen), Eld på 1 valfritt (kolmilan), Lyse på 0. I Zelda II behövs Hopp och Fe i flera palats och ute i världen. |
| V2 | **Templen är en mall:** fyra rum i rad, nyckel och dörr i rum 1–3, väktaren i rum 4. Sex gånger. |
| V3 | **Sidouppdragen är en mall:** i alla sex byar har någon tappat en sak inne i templet när de sprang därifrån (psalmbok, fickur, medaljong, kompass, visselpipa, koskälla). Belöningen är alltid XP och full hälsa. |
| V4 | **Byarna är en mall:** ett värdshus att vila i, en lärare på en vind, ett barn med en rad före och en efter, en som tappat något. |
| V5 | **Skatterna är kartnycklar.** Ekan, lampan, stövlarna, ficklampan och radion öppnar nästa område men ändrar inte hur man spelar i rummen. Det är som i Zelda II, men där finns också handsken och hammaren som ändrar vad man kan göra. |
| V6 | **Trollberget prövar inte det man lärt sig.** Ingen magi krävs där inne. Zelda II:s sista palats är en examen. |

Redan åtgärdat den här veckan: lärarnas uppdrag är nu av fem slag i stället
för ett (hämta, hitta en dold plats, prov, rädda, bytesskedja).

### Balans

| # | Fynd |
|---|---|
| B1 | **Fiendernas liv står still.** Vätten har 4 liv, irrblosset 2, kråkan 3, myrkatten 5, dimvätten 6, dansgasten 7. Med Styrka 7 och två svärdsförbättringar slår Dagny 8. Från tempel 3 dör nästan allt på ett slag, också i tempel 6, som återanvänder vättar, irrbloss och myrkatter från hemdalen. |
| B2 | **Templen är glesa.** Antal fiender i rum 1–3: kryptan 21, gruvan 16, kvarnen 12, fyren 11, Folkparken 13, Fäbodskogen 15. Det är fyra per rum på 60 rutors bredd. |
| B3 | **XP står still.** En vätte ger 5 XP i tempel 6, där nästa nivå kostar runt 900. XP kommer då nästan bara från väktare och uppdrag, och att slåss lönar sig inte. |
| B4 | **Duellanterna försvinner.** Tomtenissarna, som kräver att man byter höjd, finns bara i tempel 1–3. Det som var Zelda II:s kärna (riddarna) saknas i andra halvan. |
| B5 | Dödsregeln och skadetrappan är åtgärdade den här veckan. Efter B1–B4 bör de provspelas igen, så att summan inte blir för hård. |

### Upplevelse och tempo

| # | Fynd |
|---|---|
| U1 | **Första samtalet är tio sidor.** Före första striden kommer fyra introkort, tio sidor Hulda och två hämtuppdrag. |
| U2 | **Långa vägar.** Kartan är 96 × 72 rutor och tåget kommer först efter tempel 5. Du har själv sagt att det tar lång tid att gå fram och tillbaka. |
| U3 | **Meddelandet efter varje skatt säger vart man ska.** Tredje sidan i varje "Dagny fick …" pekar ut nästa område. Det är tryggt men tar bort letandet, som du har sagt att du vill ha kvar. |

### Dialog

Kvaliteten är hög och jämn. Tre mindre saker:

- Väktarnas rader följer samma tretakt (klagan, "den förra Väktaren gjorde
  så", "ta hennes sak"). Det bär temat, men Havsfrun och Spelmannen kunde få
  bryta mönstret.
- Barnen i byarna säger nästan samma sak ("det spökar", sedan "det spökar
  inte längre").
- Hulda efter kryptan säger "Du är den vi väntat på". Det är den enda raden i
  spelet som låter som en färdig fras.

## Planen

Varje åtgärd har fyra delar: vad, varför det blir bättre, hur, och vilket test
som håller fast det.

### Fas 0 – Snabba rättningar (en kort session)

**Klar 11 november.** Byggt enligt steg-dokumentet. Testet för namnläckan
hittade tre läckor till som ingen genomgång hade sett: kryptans sida i
Väsensboken sa rakt ut att namnet på stenen var Huldas (öppnas i första
templet), Gruvråets sida sa att lampan var Huldas och bars av Dagmar, och
Havsfruns sida nämnde Dagmar. Huldas bitar räknade platser ("Tre platser
har vaknat"), vilket blev fel när de hördes sent; de är nu utan siffror
utom den sista.

**0.1 Täta läckorna av Dagmars namn (S1).**
- *Vad:* Elin säger "Väktarens solsten". Platsen heter "Övergivna orten" (inte
  "Gamla orten", som krockar med Gamla stollen) tills Hulda har sagt namnet,
  sedan "Dagmars ort". Väsensbokens blad om irrblossen, Bäckahästen och
  Spelmannen skrivs om utan namn ("kvinnan med kopparhår"). Spelmannens sida
  öppnas vid tempel 5, innan Hulda har sagt det.
- *Varför:* avslöjandet efter Folkparken är byggt i fem steg. Ett namn på
  kartan i tempel 2 tar udden av alla fem.
- *Hur:* repliker i `dialog/gruvsamhallet.ts` och `vasen.ts`; platsnamn med
  villkor (`name` plus `nameAfter: { flag, name }` i `OverworldPlace`).
- *Test:* nytt test i `tests/text.test.ts`. Lösaren håller redan reda på
  vilka repliker som går att höra. Den körs med Folkparken avstängd, och
  testet kräver att ingen text som då går att höra eller läsa innehåller
  "Dagmar". Väsensbokens blad räknas med för de väsen som går att möta.

**0.2 Huldas bitar i rätt ordning (S3).**
- *Vad:* har Dagny missat bitar spelas de äldsta först, en per samtal, eller i
  följd med en kort paus.
- *Varför:* storyn är skriven som en trappa. Baklänges blir den en gåta utan
  svar.
- *Hur:* vänd ordningen i `npcs.ts` (äldsta ospelade först).
- *Test:* i `tests/progression.test.ts`: med alla sex tempelflaggor satta och
  inga Hulda-flaggor ska samtalen komma i ordningen krypta → … → Fäbodskogen.

**0.3 Lärtexter efter styrsätt (L1).**
- *Vad:* texten visar "SVÄRD-knappen" på pekskärm, tangenten på tangentbord
  och knappen på handkontroll.
- *Hur:* platshållare i texten (`{svärd}`, `{magi}`) som `DialogOverlay`
  fyller i från `input.lastSource`.
- *Test:* i `tests/text.test.ts`: varje platshållare har text för alla tre
  styrsätt och ingen replik innehåller en hårdkodad tangent.

**0.4 HUD: en rad för magi (L2).**
- *Vad:* den aktiva magin visas inte som egen rad när den är samma som den
  valda; den valda lyser i stället.
- *Test:* enhetstest på funktionen som väljer vad HUD:en ska visa.

**0.5 Olles radiotips (S5).** Byt till ett tips som stämmer: "det brusar som
starkast borta vid Björkhagen. Som om någon pratade."

### Fas 1 – Storyn går inte att missa

**1.1 Hulda ringer (S2).**
- *Vad:* efter varje tempel, första gången Dagny vilar på ett värdshus,
  säger värden: "Det är telefon till dig. Från Mormors by." Biten spelas som
  ett telefonsamtal ("Beskriv lampan för mig. … H.D. Jag har inte sett de
  bokstäverna på arton år."). Går hon hem i stället får hon samma bit öga mot
  öga, som i dag. Den sista biten ("Hon var din mamma") går bara att få hemma.
- *Varför:* det är 1964 och Telefonist-Greta finns redan, med en telefonkiosk
  som "ringer av sig själv". Storyn följer med spelaren i stället för att
  kräva en lång promenad som inget annat belönar.
- *Hur:* varje bit får en telefonversion i `dialog/hem.ts`. Vilodialogen på
  värdshusen (`*_vila`) får ett villkor som går före: tempelflagga satt och
  Hulda-flagga inte satt.
- *Test:* lösaren ska kunna nå varje bit utan att gå till Mormors by, och
  ingen bit ska kunna höras två gånger. Ordningstestet från 0.2 gäller också
  telefonvägen.

**1.2 Den sista biten krävs före Trollberget (S2).** *Klar 11 november.*
- *Vad:* Trollberget öppnar när de sex platserna är väckta *och* Hulda har
  berättat allt. Annars: "Berget är tyst. Det är som om det väntar på att
  något ska sägas först."
- *Varför:* slutet bygger på att Dagny vet vem som väntar i berget.
- *Hur:* lägg `hulda_efter_fabodskogen` i `requires` för Trollberget i
  `overworld.ts`, med egen replik.
- *Test:* `tests/playthrough.test.ts` får ett fall: utan flaggan ska lösaren
  inte nå `troll_1`. Genomspelningen ska fortfarande gå i mål.

**1.3 Byfolket får ett tredje läge (S4).**
- *Vad:* Sven, Tyra, Prosten, Elin och Ture får en rad som bara sägs efter
  att Hulda har berättat allt ("Så hon sa det till slut. Arton år har jag
  hållit tand för tunga.").
- *Varför:* de är de som har tigit. Att de får tala är en belöning för att ha
  följt storyn, och världen känns som om den lyssnar.
- *Test:* datatestet som redan kontrollerar att varje replik i `npcs.ts`
  finns; plus ett som kräver att de fem har ett villkor på flaggan.

### Fas 2 – Fienderna växer med Dagny

**2.1 Liv- och XP-trappa per tempel (B1, B3).** *Klar 11 november, med en
ändring mot planen: att räkna från fiendens egen nivå räckte inte, eftersom
de sena fienderna själva är för svaga (dansgasten dog ändå på ett slag i
Folkparken). I stället siktar trappan på ett antal slag per fiendetyp mot
den skada Dagny väntas ha, från tempel 3. Tempel 1–2 är orörda.*
- *Vad:* som skadetrappan. Vanliga fiender i tempel 1–7 får liv × 1, 1, 1,5,
  2, 2,5, 3, 3,5 och XP i samma takt. I möten på kartan följer trappan
  området.
- *Varför:* i dag växer bara Dagny. Med trappan tar en vätte i tempel 6 två
  slag i stället för ett, och striderna ger XP som betyder något.
- *Hur:* räknat från varje fiendes egen nivå (fältet `home`), inte en enda
  multiplikator för alla. Annars blir de seglivade fienderna svampar: med
  × 3,5 skulle bergtrollet ta 10 slag. Sätts i `room.ts` där `bonusDamage`
  sätts i dag.
- *Test:* `tests/difficulty.test.ts` utökas: för varje tempel räknas "slag
  per fiende" med en uttalad Styrka-kurva från provspel. Kravet är att
  medianen ligger mellan 2 och 4 slag i alla tempel och att ingen vanlig
  fiende tar fler än 6.

**2.2 Tätare tempel (B2).** *Klar 11 november (tempel 3–6; tempel 1–2 orörda).*
- *Vad:* 6–8 fiender per rum i stället för 4, utplacerade där de möter
  hindren (på plattformar, vid nycklar).
- *Test:* datatest: varje tempelrum utom väktarens har minst en fiende per
  tio rutors bredd. Hopp- och fastnar-testerna körs som vanligt.

**2.3 Duellanter i andra halvan (B4).** *Klar 11 november: Gasten, Kavaljeren, Vittran och Drabanten.*
- *Vad:* en ny fäktare per sent tempel på samma beteende som tomtenissen men
  snabbare: en fyrvaktargast i fyren, en dansör i Folkparken, en vallpiga i
  Fäbodskogen, bergtrollens livvakt i Trollberget.
- *Varför:* höjdbytet (högt, lågt, uppifrån) är spelets bästa stridsidé och
  används bara i början.
- *Test:* `tests/fencer.test.ts` körs för varje ny fäktare: den parerar där
  Dagny slår, står öppen efter sitt utfall, och går att besegra.

**2.4 Fiender med ett eget svar (från genomgången 9 november).** *Klar 11 november: Grytvätten, Bjäran och Maran.*
- *Vad:* några fiender går bara att besegra på ett visst sätt: ett väsen som
  bara tål eld, ett som måste slås uppifrån (Nedåtstöt) eller underifrån
  (Uppåtstöt), och ett som bara syns i Lyse. Ett slag per tempel, inte fler.
- *Varför:* det ger magierna och teknikerna en plats i striden, inte bara vid
  dörrar. I Zelda II är det så man lär sig att Eld och Nedåtstöt är verktyg.
- *Hur:* fält på `EnemyDef` (`onlyFire`, `onlyFrom: 'above' | 'below'`,
  `hiddenUnlessLit`), prövade i `Enemy.takeHit` där `backOnly` prövas i dag.
- *Test:* per fält: fel sorts slag ger "blocked", rätt sorts slag skadar.
  Lösaren kräver att förmågan finns innan en sådan fiende står i vägen för en
  nyckel.

**2.5 Liven räknas om efter provspel.** *Väntar på provspel.*
- *Vad:* med den nya dödsregeln och trapporna i 2.1 kan tre liv från början
  och åtta näverdockor bli antingen för mycket eller för lite. Antalet dockor
  och var de ligger ses över när 2.1–2.4 har provspelats.
- *Test:* `tests/secrets.test.ts` håller redan antalet; siffran ändras där.

### Fas 3 – Varje förmåga används flera gånger

**3.1 Regeln om tre (V1).** *Klar 11 november: sju förmågor i minst tre rum var, varav ett i Trollberget (`tests/abilities.test.ts`, `e2e/obstacles.spec.ts`). Belöningarna är mat i små gömmor, så ingen huvudväg ändrades.*
- *Vad:* varje magi och teknik ska krävas på minst tre ställen: där man får
  den, i ett senare tempel, och i Trollberget. Dessutom en valfri hemlighet
  var.
- *Varför:* en förmåga man använder en gång är en nyckel. En man använder tio
  gånger är en del av hur man spelar.
- *Hur:* nya hinder i befintliga rum, markerade med `needsSpell` och luckor
  (`!`): luckor i taket i gruvan och fyren, höga avsatser som kräver Hopp i
  Folkparken och Fäbodskogen, trånga hål för Hamn i Trollberget, döda lyktor
  som Åska tänder, mörka rum där Lyse visar vägen.
- *Test:* nytt test `tests/abilities.test.ts`: räknar rum per förmåga ur
  rummens data och kräver minst tre, varav minst ett i Trollberget. Lösarens
  befintliga kontroll ("utan den här magin, vad går inte att nå?") visar att
  varje nytt hinder verkligen kräver sin förmåga.

**3.2 Magi som förändrar världen.**
- *Vad:* Eld bränner bort torra snår på kartan (två ställen: en genväg och en
  livbehållare). Lyse avslöjar en dold stuga i nattskogen. Åska startar en
  kraftstation vid forsen.
- *Hur:* snåren som en ny terräng med `mended` (samma mekanik som den lagade
  bron).
- *Test:* som brotestet i `tests/world.test.ts`: rutan är stängd före och
  öppen efter, och lösaren når det som ligger bakom.

### Fas 4 – Templen blir nät (V2, V5)

Planen från 9 november gäller: varje tempel blir 6–7 rum med en hall och två
eller tre vägar, och ett eget föremål som hittas halvvägs och öppnar resten.

| Tempel | Föremål | Verkan i templet | Senare ute i världen |
|---|---|---|---|
| Kryptan | Järnspettet | Bryter upp gravhällar och galler | Gravhällar på kartan med dolda trappor och en livbehållare |
| Gruvan | Hissveven | Startar döda hissar | En gammal hiss i Gamla stollen |
| Kvarnen | Dammluckans ratt | Höjer och sänker vattnet | Tappa ur en damm vid forsen |
| Fyren | Båtshaken | Svinga sig i järnringar | Över en ravin på fjället |
| Folkparken | Karusellnyckeln | Startar karusellen och skjutbanan | – |
| Fäbodskogen | Vallkoskällan | Korna ställer sig som plattformar | – |

Så ser ett tempel ut efter ombyggnaden:

```
            [Gren A: föremålet, vaktat av en mindre väktare]
                    |
[Ingång] — [Hall med 2–3 vägar] — [Gren B: hinder som kräver föremålet] — [Väktaren]
                    |
            [Gren C: nyckel / livbehållare / återvändsgränd]
```

- Hinder som kräver föremålet syns redan när man kommer in, så att man vet
  att något saknas.
- Färre nycklar: föremålet är det som öppnar vägen fram.
- Ett ljus i hallen är startpunkten med den nya dödsregeln.
- Föremålen används också ute i världen (tabellen), vilket är samma tanke som
  "regeln om tre" i fas 3, fast för föremål.

- *Ordning:* Gruvan som pilot (hissarna finns redan, så minst ny teknik),
  sedan provspel. Därefter Kvarnen, Kryptan och Fyren, sedan Folkparken och
  Fäbodskogen, och sist Trollberget, som kräver flera av föremålen igen.
- *Test per tempel:*
  1. Lösaren lär sig mekaniken (hiss av eller på, vattennivå, brutet block)
     och bevisar att föremålet går att nå innan det behövs och att väktaren
     går att nå efteråt.
  2. Fastnar-testet körs i varje läge av mekaniken (vattnet högt och lågt,
     hissen av och på).
  3. Hopp-testet per rum.
  4. Ett sparfilstest: ett tempel som var klart före ombyggnaden är klart
     efter den.

### Fas 5 – Sidouppdrag och byar med egen prägel (V3, V4)

Läraruppdragen följer planen från 9 november och är byggda: hämta (Sven,
Algot, Holm), hitta en dold plats (Karlsson, Viola), klätterprov (Karna), prov
(Prosten), rädda (Elin) och bytesskedja (Oskar). En idé därifrån är inte
använd än: **en lärare som är gömd** och bara hittas med en tidigare magi, som
Kasuto i Zelda II. Den passar Karna: fäbodens loft står tomt, och hon bor i en
stuga i skogen som bara syns i Lyse (hänger ihop med 3.2).

**5.1 Tre av sex sidouppdrag byts ut.** Behåll psalmboken, fickuret och
koskällan. Byt de andra:
- Bruksorten: Rosa vill inte ha tillbaka något. Hon vill att någon säger
  Gunnars namn vid forsen (en replik vid en sten, som Väktarna gjorde).
- Fiskeläget: Johan behöver hjälp att hitta hem i dimman. Dagny ror före med
  ficklampan (följ-efter-mekaniken från Gösta, på vatten). Hans livbehållare
  är kvar som belöning.
- Stationssamhället: visselpipan är kvar men leder till tåget, så den räknas
  som huvudspår.
- *Test:* lösaren når varje belöning; räddningstesterna från Gösta gäller.

**5.2 En egen sak per by.** Kyrkbyn har klockstapeln (finns). Gruvsamhället
får lavtornet att åka upp i, Bruksorten hammaren som slår i takt (en plattform
som rör sig), Fiskeläget en brygga att fiska från, Fäboden korna.
- *Test:* datatesterna för rum; djurtesterna för korna.

### Fas 6 – Trollberget som examen (V6)

- *Vad:* ett rum per förmåga på vägen upp, i den ordning man lärde sig dem,
  och föremålen från fas 4 en sista gång.
- *Test:* testet från 3.1 kräver redan att varje förmåga behövs i
  Trollberget.

### Fas 7 – Tempo (U1–U3)

**7.1 Kortare start.** Hulda säger tre saker första gången (mörkret, klingan,
Stenkyrkan). Resten kommer när Dagny kommer hem med johannesörten eller
tången. *Test:* första samtalet är högst fem sidor.

**7.2 Snabbresa tidigare.** Banvaktens dressin går mellan Kyrkbyn och
Gruvsamhället efter tempel 2. Tåget tar över efter tempel 5, och får en
hållplats i Mormors by. *Test:* lösaren kan resa mellan stationerna i rätt
skede, och inte före.

**7.3 Mindre pekpinnar.** Tredje sidan i "Dagny fick …" säger vad skatten gör
men inte vart man ska. Riktningen läggs hos en person i närmaste by, som i
Zelda II. *Test:* textgranskning; lösaren påverkas inte.

## Testsäkring

Tre nya slag av tester, utöver dem som står vid varje åtgärd. De riktar sig
mot den sorts fel du har hittat för hand.

*Klar 11 november.* `tests/bosses.test.ts` (väktarna, från två startslag:
det gamla Bäckahäst-felet syntes bara vid det ena), `e2e/monkey.spec.ts`
(körs varje natt i flödet "Slumpspelare", med nytt frö varje natt) och
`e2e/smoke.spec.ts` (i "Kontroll"). Alla tre fäller det gamla felet när det
läggs tillbaka. Slumpspelaren hittade två nya fel, som är lagade: fågeln som
föll i vatten blev Dagny i fågelstorlek, och raset i Rasgången kunde trycka in
Dagny i en stenpelare.

1. **Väktare över tid.** Bäckahäst-testet görs allmänt: varje väktare körs i
   3 000 steg i varje fas, och testet kräver att den är sårbar minst en viss
   del av tiden och att den byter anfall. Det hade fångat Bäckahästen.
2. **En slumpspelare i varje rum.** En bot trycker slumpvisa knappar i 2 000
   steg i varje rum, i människoform och som fågel. Den tar flera minuter och
   körs därför varje natt, inte i varje kontroll. Efter varje steg gäller:
   Dagny står inte inne i en vägg, inga värden är NaN, hälsan är inom sina
   gränser, och inget fel kastas. Det hade fångat fågeln som sjönk i marken.
3. **Rökprov i webbläsare.** Ett Playwright-test i GitHub-flödet "Kontroll":
   starta spelet på en emulerad telefon, börja nytt spel, gå, slå, öppna
   menyn, byt rum, tappa fokus och ta spaken igen. Det hade fångat spaken som
   fastnade.

Efter varje fas körs dessutom: hela testsviten, lösaren (genomspelningen
skrivs om och jämförs), bygget, och demon uppdateras så att du kan provspela
innan nästa fas börjar.

## Ordning och omfattning

| Fas | Innehåll | Omfattning | Varför där |
|---|---|---|---|
| 0 | Läckor, ordning, knapptexter, HUD | Liten | Rena fel, ingen risk |
| 1 | Hulda ringer, kravet före Trollberget, byfolket | Liten–medel | Storyn är spelets starkaste kort |
| 2 | Liv- och XP-trappa, tätare tempel, duellanter | Medel | Gör varje strid värd något |
| Testsäkring | Väktare över tid, slumpspelare, rökprov | Medel | Före de stora ombyggnaderna |
| 3 | Regeln om tre, magi i världen | Medel–stor | Löser "engångsnyckeln" |
| 4 | Templen som nät, sex föremål | Stor (ett tempel i taget) | Störst skillnad, mest arbete |
| 5 | Sidouppdrag, byarnas prägel | Medel | Kan göras parallellt med 4 |
| 6 | Trollberget som examen | Medel | Kräver 3 och 4 |
| 7 | Tempo | Liten | När resten sitter |

Fas 0–2 och testsäkringen går att göra före en första Android-release.
Fas 3–6 är det som gör spelet till mer än en trogen hyllning, och kan komma
som uppdateringar.

## Hur de två genomgångarna hänger ihop

| Fråga | Genomgången 9 november | Den här genomgången | I planen |
|---|---|---|---|
| Varför är spelet för lätt? | Att dö kostar nästan inget: omstart i samma rum, mild Game Over, många liv | Fienderna växer inte: liv och XP står still, templen är glesa | Dödsregeln är byggd. Fas 2 lägger till liv- och XP-trappan, tätare tempel och ser över liven (2.5) |
| Varför känns det upprepat? | Mönstret lärare → sak → magi → tempel, sex gånger | Samma sak mätt i data: varje förmåga krävs på ett enda ställe | Läraruppdragen är varierade (byggt). Fas 3 gör varje förmåga till något man använder ofta |
| Templen | Nät av 6–7 rum med ett föremål som öppnar resten, och som används ute i världen | Samma slutsats; lägger till att Trollberget inte prövar något | Fas 4 (den planen, oförändrad) och fas 6 |
| Magi i världen | Eld bränner snår, Lyse avslöjar en plats, Åska väcker något | Samma | 3.2 |
| Fiender | Fiender som kräver ett visst svar | Fäktarna försvinner efter tempel 3 | 2.3 och 2.4 |
| Storyn | Inte granskad | Går att missa, spelas baklänges, namnet läcker | Fas 0 och 1 (nytt) |
| Sidouppdrag och byar | Inte granskat | Samma mall i alla sex byar | Fas 5 (nytt) |
| Tempo och texter | Inte granskat | Lång start, långa vägar, knapptexter för tangentbord | Fas 0 och 7 (nytt) |
| Tester | Per mekanik: lösaren, fastnar-test i alla lägen, hopp-test, gamla sparfiler | Tre nya slag för fel över tid | Båda, under fas 4 och "Testsäkring" |

**Granskning 11 november.** Båda dokumenten är kontrollerade mot koden. Fem
fel är rättade: testet för namnläckan byggde på data lösaren inte hade, liv-
trappan gjorde seglivade fiender till svampar, testet för regeln om tre kunde
inte räkna Nedåtstöt, Eld och Lyse, platsnamnet krockade med Gamla stollen,
och en livbehållare skulle ha försvunnit med kompassen. Kryptans skylt (S6)
var missad av båda genomgångarna.

De två genomgångarna säger inte emot varandra någonstans. Den första gick på
djupet i svårighet och tempel; den här breddar till story, balans i siffror,
byar och tester.

