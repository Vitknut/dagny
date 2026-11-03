# Granskning av storyn (lore-audit)

Den här rapporten samlar allt i spelet som berättar om den förra Väktaren, Dagmar, och om natten 1946. Texterna står i spelordning. Rapporten ändrar ingen text i spelet. Motsägelser är markerade med **⚠**, och förslag finns sist.

> **Avgjort 16 oktober 2026:** vändningen valdes – Hulda är Dagmars mamma och den förra Väktaren. Se `docs/storyn.md`.

Källor: `src/data/dialog.ts`, `src/data/strings.ts` och `src/data/temples.ts` (fältet `lore`, som inte visas i spelet).

## 1. Texterna i spelordning

### Introt (introkorten, `STR.intro`)
- "Midsommarnatten 1946 började klockan i Kyrkbyns klockstapel ringa av sig själv."
- "Hulda, byns barnmorska, gick dit med sin fotogenlykta. Under klockstapeln låg ett spädbarn i en vävd näverfilt."
- "Bredvid barnet låg en sliten svärdsklinga utan fäste. … Hon kallades Dagny – 'ny dag'."
- "Nu är det sommaren 1964 …"

### Mormors by, före tempel 1
- **Hulda (`intro_hulda`):** "Förr vaktades de sju heliga platserna av Väktarna." "Den sista Väktaren försvann midsommarnatten 1946. Samma natt som jag hittade dig under klockstapeln." "Bredvid dig låg en klinga utan fäste. Jag har smitt ihop den åt dig, med kläppen från kyrkklockan."
- **Gamle Sven (`sven_lar`):** "Du har din mors ögon, det har du."
- **Smeden Algot (`algot_lar`):** "Så det är du som bär klockans kläpp nu. Den har slagit tolv slag varje midsommar i hundra år."
- **Olle (`olle`):** radion "brusar så konstigt på kvällarna. Som om någon sjunger mellan stationerna."

### Kyrkbyn (går att besöka redan före tempel 1)
- **Klockstapeln (`kyrkby_klockstapel`):** "Klockan har hängt här i trehundra år." "MIDSOMMARNATTEN 1946 RINGDE JAG AV MIG SJÄLV."
- **Gamla Tyra (`tyra`):** "Jag såg en kvinna med kopparhår gå förbi med en korg." "Hon stannade vid klockstapeln och grät. Sedan gick hon mot Trollberget, utan korgen." "Du har hennes hår, lilla vän. Och hennes sätt att lyssna utan att säga något."
- **Prosten (`prosten_lar`, efter kryptan):** "Jag döpte dig." "… det min företrädare lärde sig av den förra Väktaren."

### Tempel 1 – Stenkyrkans krypta
- **Inskription (`krypta_skylt2`):** "...da, Väktare. Hon tände ljusen här varje midsommar."
- **Inskription (`krypta_skylt3`):** en liten sol och "ny dag" med barnslig handstil.
- **`temples.ts` (visas inte i spelet):** "...da, Väktare 1921–1946".
- **Kyrkogrimmen (`grim_forlikad`):** "Du bär den förra Väktarens klinga." "Ta ekan … Den bar henne över sjön en gång."
- **Hulda efteråt (`hulda_efter_krypta`):** "Du är den vi väntat på." Inget om Väktaren.

### Tempel 2 – Den gamla gruvan
- **Lampan (`gruvan_skylt3`):** "Initialerna H.D. är inristade i mässingen."
- **Gruvrået (`gruvra_forlikad`):** "Den förra kom hit med sin lampa varje vår och hälsade. Hon lämnade den här när hon gick för sista gången."
- **Hulda efteråt (`hulda_efter_gruvan`):** "H.D. Jag har inte sett de bokstäverna på arton år." "Jag lovar att berätta, Dagny. Men inte än. Först måste du se mer själv."

### Tempel 3 – Kvarnen vid forsen
- **Kvarnstenen (`kvarnen_skylt2`):** "en sol, och under den ett namn som någon har försökt skrapa bort."
- **Bäckahästen (`backahast_forlikad`):** "Den förra Väktaren sa mitt namn högt …" "Hon lämnade sina stövlar på stranden den sista sommaren."
- **Hulda efteråt (`hulda_efter_kvarnen`):** "Jag köpte dem på lanthandeln i Kyrkbyn 1945." "Ja, Dagny. Jag kände henne. Mer än så säger jag inte förrän du har varit på Trollberget."

### Tempel 4 – Fyren i skären
- **Loggboken (`fyren_skylt2`):** "Midsommarnatten 1946. Ett ljus gick ner över Kyrkbyn. Signalen från stranden tystnade."
- **Havsfrun (`havsfru_forlikad`):** "Varje kväll blinkade hon med sin lampa från stranden. Tre korta, tre långa, tre korta. Och någon i Kyrkbyn svarade."
- **Hulda efteråt (`hulda_efter_fyren`):** "Varje kväll i åtta år." "Det var jag som svarade … från vinden i klockstapeln."
- **Gamle Ture i Fiskeläget (`ture`):** "Midsommarnatten 1946 såg jag ett ljus gå ner över Kyrkbyn."

### Tempel 5 – Folkparken om natten
- **Fotografiet (`park_skylt2`):** "En kvinna med kopparfärgat hår dansar med ett irrbloss."
- **Spelmannen (`spelman_forlikad`):** "Hon brukade lyssna efter mig mellan stationerna på sin radio."
- **Hulda efteråt (`hulda_efter_folkparken`):** "Jag tog det själv, midsommar 1945." **"Hon hette Dagmar."** "Mer säger jag inte än."

### Tempel 6 – Fäbodskogen
- **Skogsrået (`skogsra_forlikad`):** "Hon satt här på vallen och vävde en näverfilt den sista sommaren. … Den låg i en korg under klockstapeln."
- **Hulda efteråt (`hulda_efter_fabodskogen`):** "Dagmar vävde den åt dig." "Där får du hela sanningen, det lovar jag."

### Tempel 7 – Trollberget
- **Ristningen (`troll_skylt1`):** "D. GICK HÄR MIDSOMMARNATT 1946. GLÖM OSS INTE."
- **Bergakungen (`bergakung_vaknar`, `bergakung_forlikad`):** "HON SOM BAND MIG ÄR SVAG NU." "Hon som väntar här har hållit mig i arton år."
- **Dagmar (`dagmar_avsked`, `dagmar_ljus`):** "Det fanns ingen annan Väktare än jag." "Så jag lade dig i näverfilten under klockstapeln, där Hulda skulle hitta dig." "Hälsa Hulda."

### Epilogen
- **Hulda (`hulda_epilog`):** "Dagmar vävde aldrig klart filten. Så jag gjorde det i vintras."

## 2. Motsägelser och oklarheter

1. **⚠ "...da" passar inte ihop med "Dagmar".** Inskriptionen i kryptan slutar på "-da", men Dagmar slutar på "-ar". Namn som passar är Hulda, Frida och Alfhilda. Som det står nu pekar inskriptionen snarast på **Hulda**.
2. **⚠ Årtalen 1921–1946** (finns bara i `temples.ts`, inte i spelet). Om Dagmar blev Väktare 1921 vid till exempel 16 års ålder, var hon född omkring 1905. Då var hon 41 år när Dagny föddes 1946, och hennes mamma Hulda omkring 60 år 1946 och 78 år 1964. Det går, men det är ansträngt. Om årtalen gäller Hulda passar de bättre.
3. **⚠ Initialerna H.D. på lampan.** Gruvrået säger att lampan tillhörde den förra Väktaren ("hon"), alltså Dagmar. Men H.D. betyder inte Dagmar. H.D. stämmer med **Hulda D.** (till exempel om familjen heter något på D). Huldas egen replik ("Jag har inte sett de bokstäverna på arton år") kan läsas som att lampan var hennes och att hon gav den till Dagmar.
   - Punkt 1–3 pekar alltså åt samma håll: det ser ut som att **Hulda själv var Väktare före Dagmar**, och att "Mormor Hulda" kanske bokstavligen är Dagnys mormor. Det sägs aldrig i spelet. Detta kan antingen bli en avsiktlig vändning eller rättas till.
4. **⚠ Varför Hulda håller inne med sanningen.** Hon lovar att berätta (efter gruvan), skjuter upp det till Trollberget (efter kvarnen) och avslöjar namnet efter folkparken. Men hon säger aldrig varför hon väntar. Det kan kännas som ett konstgrepp.
5. **⚠ Byborna vet mer än Hulda låter påskina.** Gamle Sven säger i första scenen "Du har din mors ögon". Gamla Tyra i Kyrkbyn beskriver kvinnan med kopparhår och säger "Du har hennes hår". Båda går att höra före tempel 1, och de förtar en del av Huldas långsamma avslöjande.
6. **Vem smidde klingan?** Hulda säger "Jag har smitt ihop den åt dig", men byn har en smed (Algot) som också pratar om kläppen. Det är en liten oklarhet: Hulda är barnmorska.
7. **Kläppen och klockan.** Algot: kläppen har slagit "i hundra år". Klockstapeln: klockan har hängt där "i trehundra år". Det är ingen direkt motsägelse, eftersom en kläpp kan bytas, men det kan läsas som slarv.
8. **Signalerna från stranden.** Havsfrun säger att någon "i Kyrkbyn" svarade, och Hulda svarade "från vinden i klockstapeln". Hulda bor i Mormors by men svarade alltså från Kyrkbyn varje kväll i åtta år. Det fungerar, men det är värt ett förtydligande.
9. **Lore-fälten i `temples.ts`** visas inte i spelet men skiljer sig något från texterna i spelet, till exempel årtalen 1921–1946. Antingen stryks de eller så synkas de med dialogerna.

## 3. När kan en uppmärksam spelare gissa att Väktaren är Dagmar?

- **Att Väktaren är Dagnys mamma** går att gissa **redan i första scenen**: Hulda säger att Väktaren försvann samma natt som Dagny hittades, och Sven säger strax efter "Du har din mors ögon". Den som först går till Kyrkbyn får det nästan bekräftat av Tyra ("Du har hennes hår"), före tempel 1.
- **Namnet Dagmar** kan gissas tidigast **efter tempel 5** (folkparken), då Hulda säger "Hon hette Dagmar". Sedan bekräftar ristningen "D." på Trollberget det. Före det finns inga ledtrådar till namnet, och de som finns ("...da", "H.D.") pekar snarare bort från det.
- **Att Dagmar lever, bunden i berget,** kan gissas efter tempel 6 eller på Trollberget ("Hon som band mig är svag nu").

## 4. Förslag på repliker som ger Hulda ett skäl att vänta (inte inlagda)

1. **Ett löfte till Dagmar.** Efter gruvan: *"Hon fick mig att lova en sak den natten: att du skulle växa upp som vilket barn som helst, utan att bära hennes börda. Jag har hållit det löftet i arton år. Låt mig hålla det lite till."*
2. **Rädsla för att Dagny ska gå för tidigt.** Efter kvarnen: *"Om jag berättar allt nu, går du raka vägen till Trollberget. Och då kommer du inte ner igen. Berget släpper bara den som har väckt de andra platserna först."*
3. **Hulda var själv Väktare.** Löser också "...da" och "H.D.". Efter folkparken: *"Lampan var min, Dagny. H.D. – Hulda Dahl. Jag bar den i tjugofem år innan jag gav den till min dotter. Jag vet vad sanningen kostar. Därför har jag väntat."*
