# Hamn – granskning av fågelformen (hamn-audit)

Läsningen Hamn gör Dagny till en liten fågel (8×6 pixlar) som flyger fritt i 15 sekunder. Dagny själv är 22 pixlar hög och behöver två rutor fri höjd, men fågeln får plats i en ruta. När läsningen tar slut blir hon människa igen. Får hon inte plats stannar hon som fågel tills hon har flugit ut i det fria. Därför kan hon aldrig fastna inne i en vägg.

## Hur granskningen gick till

Varje tempelrum gicks igenom två gånger, med och utan radio. Modellen var förenklad och tog inte hänsyn till fysiken:
- Rutorna Dagny kan gå till räknades från ingångar och kanter, där hon behöver två fria rutor på höjden.
- Rutorna fågeln kan nå räknades på samma sätt, men med en fri ruta.
- Låsta portar (`L`) räknades som väggar, alltså som om Dagny saknade nyckel.

Ett **fängelse** betyder en plats som fågeln når, där Dagny får plats men inte kan gå därifrån till någon utgång. Samma modell körs som test i `tests/hamn.test.ts`, och den hittar inga fängelser.

**Det viktigaste fyndet:** ovanför rummets översta rad räknades allt som tom luft. I rum utan tak kunde fågeln därför flyga upp över kartans kant, förbi klippblocken ovanför de låsta portarna och ner på andra sidan eller ut genom rummets högra kant. I Djupskogen (fabod_3) gick det att flyga rakt över porten. Har Dagny ingen nyckel och ingen magi kvar efter det, kan hon fastna mellan två låsta portar. **Rättat:** fågeln kan inte längre flyga ovanför rummets överkant (`Player.updateBird`).

## Rum för rum

| Rum | Låsta portar | Nycklar | Tak | Vad fågeln kan göra |
| --- | --- | --- | --- | --- |
| krypta_1 | 1 | 1 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| krypta_2 | 1 | 1 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| krypta_3 | 1 | 1 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| krypta_4 | 0 | 0 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| gruvan_1 | 1 | 1 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| gruvan_2 | 1 | 1 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| gruvan_3 | 1 | 1 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| gruvan_4 | 0 | 0 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| kvarnen_1 | 1 | 1 | nej | Kunde förut flyga över taket och ut genom högra kanten förbi porten. **Stängt nu.** |
| kvarnen_2 | 1 | 1 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| kvarnen_3 | 1 | 1 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| kvarnen_4 | 0 | 0 | nej | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| fyren_1 | 1 | 1 | nej | Kunde förut flyga över taket och ut genom högra kanten förbi porten. **Stängt nu.** |
| fyren_2 | 1 | 1 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| fyren_3 | 1 | 1 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| fyren_4 | 0 | 0 | nej | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| folkparken_1 | 1 | 1 | nej | Når den låga nischen bakom radioväggen (lingon och termos). Det är meningen, och hon kommer ut igen. |
| folkparken_2 | 1 | 1 | nej | Kunde förut flyga över taket och ut genom högra kanten förbi porten. **Stängt nu.** |
| folkparken_3 | 1 | 1 | nej | Kunde förut flyga över taket och ut genom högra kanten förbi porten. **Stängt nu.** |
| folkparken_4 | 0 | 0 | nej | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| fabod_1 | 1 | 1 | nej | Kunde förut flyga över taket och ut genom kanten förbi porten. **Stängt nu.** |
| fabod_2 | 0 | 0 | nej | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| fabod_3 | 1 | 1 | nej | Flög förut över taket och förbi porten (kol 47). **Stängt nu.** |
| fabod_4 | 0 | 0 | nej | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| troll_1 | 1 | 1 | nej | Kunde förut flyga över taket och ut genom kanten förbi porten. **Stängt nu.** |
| troll_2 | 1 | 1 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| troll_3 | 1 | 1 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |
| troll_4 | 0 | 0 | ja | Inget utöver det Dagny själv når (fågeln kan nå höga avsatser tidigare än tänkt). |

Övrigt som fågeln kan göra i alla rum: nå höga avsatser och nyckelhyllor utan att lösa hopp- eller hjulpusslet. Det är tillåtet, i Zelda II-anda, och det kan inte göra att Dagny fastnar, eftersom hon alltid kan hoppa ner igen.

## Nya regler för fågeln

- **Kostnad:** Hamn kostar nu 6 / 6 / 6 / 5 / 5 / 5 / 5 / 4 i magi (Magi-nivå 1–8). Förut var det 4 / 4 / 4 / 3 / 3 / 3 / 3 / 3.
  - *Motivering:* Hamn är den enda läsningen som tar sig runt väggar och portar, så den ska kosta lika mycket som Åska, den dyraste. På Magi 3 (6 i magi) tömmer en flygning hela mätaren, och för att flyga igen behövs en termos eller vila.
  - På Magi 1–2 går Hamn inte att använda utan magibehållare. Gammelmor Karna lär ut läsningen först efter gruvan, så de flesta har hunnit höja Magi då.
- **Fågeln kan inte bära något:** den plockar inte upp nycklar, skatter, mat eller behållare. De ligger kvar tills Dagny själv går dit.
- **Fågeln kan inte tända ljusstakar**, så den sätter inga checkpoints.
- **Dörrar, skyltar och folk** går bara att använda som människa. Så var det redan, och det är kontrollerat.
- **Ingen väg runt rummet:** fågeln stannar under rummets överkant.

## Kvar att göra

- Modellen ser inte fysiken. Den vet till exempel inte hur högt Dagny hoppar. Ett rum där fågeln flyger upp till en avsats som Dagny bara kan lämna genom att klättra *uppåt* skulle inte upptäckas, men något sådant rum finns inte i dagens kartor. Det bör ändå provspelas.
- Om fågeln en dag skulle komma förbi en låst port (till exempel i ett nytt rum utan tak eller med en lucka i väggen) kan Dagny hamna mellan två låsta portar. Testet i `tests/hamn.test.ts` fångar luckor i väggar, och fågeln stannar under rummets överkant, så i dagens kartor kan det inte hända. Nya rum bör ändå få ett tak eller en vägg ända upp ovanför sina portar.
