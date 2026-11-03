# Rapport: förbättringar av innehållet (del 1–5)

Gjort enligt `dagny-forbattringar-del2.md`. Utvecklarläget och balansmodellen från det tidigare uppdraget hoppades över på beställarens begäran. Varje del har en egen commit på arbetsgrenen. Inget är pushat till `master`. Alla 232 tester går igenom.

## Del 1 – Granskning av storyn
- **Gjort:** `docs/lore-audit.md` samlar alla lore-texter i spelordning.
- **Rapporterat:**
  - "...da" och "H.D." pekar på Hulda, inte på Dagmar.
  - Årtalen 1921–1946 är ansträngda för Dagmar och finns bara i `temples.ts`.
  - Hulda säger aldrig varför hon håller inne med sanningen.
  - Sven och Tyra avslöjar mycket redan före tempel 1.
- **Tidigast gissning:** att Väktaren är Dagnys mamma går att gissa i första scenen. Namnet Dagmar går att gissa efter tempel 5.
- **Kvar:** tre förslag på repliker för Hulda ligger i rapporten. Bestäm om Hulda ska vara Dagmars mamma och tidigare Väktare (det löser "...da" och "H.D.") eller om inskriptionerna ska ändras.

## Del 2 – Hemligheter
- **Dolda radiorum** i krypta_1, gruvan_1, kvarnen_1 och fyren_3 (Linsrummet). Utan radio ser rummen ut som berg.
- **Behållare:** 4 för liv (+2 liv vardera) och 4 för magi (+1 magi vardera), utöver nivåerna. Max liv blir 24 + 8 = 32 och max magi 12 + 4 = 16. De sparas i `state.containers` och räknas bara en gång. Placering:
  - Liv: kryptan, kvarnen, Tjuvgrottan och belöningen för Johans kompassuppdrag.
  - Magi: gruvan, fyren, Tjuvgrottan (syns bara med karbidlampan) och Jättegrytan (syns bara med ficklampan).
- **Lampornas hemligheter** (`lampSecrets`): en behållare i Tjuvgrottan och en behållare plus en ristning i Jättegrytan.
- **Grottor på kartan:** Tjuvgrottan i myren kräver stövlarna. Jättegrytan på en holme kräver ekan.
- **Tester:** behållare och grottor går att nå med skatterna i spelet. Inga nycklar, portar, altare eller bossar ligger bakom radioväggar (utom på Trollberget, där radion är garanterad). Behållarna räknas en gång och sparas.
- **Kvar:** balansmodellen saknas. Siffrorna ovan är det som går att räkna fram utan den.

## Del 3 – Hamn
- **Gjort:** `docs/hamn-audit.md` går igenom alla tempelrum.
- **Fynd:** fågeln kunde flyga ovanför rummets överkant och förbi portar i rum utan tak, som Djupskogen. Dagny kunde då fastna mellan två låsta portar. Det är rättat: fågeln stannar under överkanten.
- **Nya regler:** fågeln plockar inte upp något och tänder inga ljusstakar. Hamn kostar 6/6/6/5/5/5/5/4 i magi, lika mycket som Åska.
- **Test:** i inget tempelrum kan fågeln lämna Dagny där hon inte kommer ut.
- **Kvar:** Hamn går inte att använda på Magi 1–2 utan magibehållare. Testmodellen ser inte fysiken (hopphöjd), så det bör provspelas.

## Del 4 – Sidomöten
- **Gjort:** tre strider per terräng (äng, skog, myr och den nya terrängen strand), varav en natt- eller stormvariant var. Nio nya mötesrum.
- **Vänliga möten** utgör ungefär 12 %: en vätte som ger liv eller magi, en vandrare med en ledtråd om storyn eller vägen och ett irrbloss som pekar mot en hemlighet.
- **Upprepning:** samma möte kommer aldrig två gånger i rad.
- **Tester:** alla möten pekar på rum och dialoger som finns, och vikterna summerar till 1.
- **Kvar:** spelet har ingen dygnscykel. Natt och storm är därför egna varianter i tabellerna och följer inte klockan.

## Del 5 – Mobil
- **Gjort:**
  - En valfri knapp LÅGT för lågt hugg (Inställningar).
  - Ljudet startas om vid varje tryck tills det spelar (iOS), och spelet återupptas efter back/forward-cachen.
  - Färre allokeringar i den varma loopen.
- **Kontrollerat i webbläsare:** spak, HOPPA och SVÄRD samtidigt med syntetiska pekhändelser.
- **Mätning:** det tyngsta rummet, dansbanan, tar 2,1 ms per bildruta i snitt på datorn. Budgeten är 16,7 ms.
- **Checklista:** `docs/mobil-testchecklista.md`.
- **Kvar:** allt måste provas på riktiga telefoner med checklistan, särskilt ljudet på iPhone och batteriet.
