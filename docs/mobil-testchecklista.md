# Mobiltest – checklista

Den här checklistan bockar en människa av på **en billig Android-telefon** (Chrome) och **en iPhone** (Safari). Gå igenom den både i webbläsaren (https://samanakbarian.github.io/dagny/) och som installerad app (PWA, eller TWA från Google Play). Skriv telefonmodell och datum överst.

Telefon / OS / webbläsare: ______________________  Datum: __________

## 1. Start och orientering
- [ ] Spelet laddar inom ungefär 5 sekunder på 4G.
- [ ] I **stående** läge visas uppmaningen "Vänd telefonen". Vrid till liggande, så försvinner den.
- [ ] Ingen knapp hamnar under notchen, kamerahålet, hemlinjen eller de runda hörnen (testa att vrida åt båda hållen).
- [ ] Knappen för helskärm fungerar, och spelet kommer tillbaka rätt efter att man lämnat helskärm.

## 2. Ljud
- [ ] Titelmusiken börjar senast vid första trycket på skärmen. Som installerad app kan den börja direkt.
- [ ] Ljudeffekter hörs när Dagny hoppar och slår.
- [ ] **iPhone med ljudlös-knappen på:** beter sig spelet som förväntat (ljudet följer telefonens inställning)?
- [ ] Lägg appen i bakgrunden (hemknappen) i 10 sekunder och kom tillbaka. Musiken ska vara tyst medan appen är borta och spelas igen efter ett tryck. Pausmenyn ska vara öppen.
- [ ] Ring telefonen (eller spela in ett röstmemo) mitt i spelet och lägg på. Ljudet ska komma tillbaka efter ett tryck.
- [ ] Lås skärmen och lås upp igen. Ljudet ska komma tillbaka efter ett tryck, och inga ljud ska ha "fastnat".

## 3. Pekkontroller
- [ ] Styrspaken styr åt alla åtta håll, och även styrkorset (växla i Inställningar).
- [ ] **Flera fingrar samtidigt:** gå åt höger med spaken, håll HOPPA och tryck SVÄRD samtidigt. Dagny ska hoppa och slå medan hon går.
- [ ] Ducka (spaken nedåt) och tryck SVÄRD, så att Dagny hugger lågt.
- [ ] Slå på **Inställningar → Knapp för lågt hugg**. Knappen LÅGT ska dyka upp till vänster om SVÄRD och ge ett lågt hugg med ett tryck. Slå av den igen, och knappen ska försvinna.
- [ ] Knappstorlek, genomskinlighet och placering ändrar knapparna direkt.
- [ ] Inga oavsiktliga zoomningar, markeringar eller "kontextmenyer" vid långa tryck.
- [ ] Prata med en bybo genom att trycka på personen eller med UPP.
- [ ] Menyer (paus, nivå upp, dialogval) går att använda med tryck.

## 4. Sparning
- [ ] Spela tills ett "Sparat" visas, eller tänd en ljusstake.
- [ ] **Stäng appen helt** (svep bort den ur app-växlaren) och öppna igen. "Fortsätt" ska ta dig tillbaka till samma ställe med samma liv, XP och föremål.
- [ ] Starta om telefonen och kontrollera samma sak igen.
- [ ] Ta en livbehållare och stäng appen. Efter omstart ska max liv fortfarande vara högre, och behållaren ska inte finnas kvar på platsen.

## 5. PWA och offline
- [ ] **Android:** Chrome-menyn → "Lägg till på startskärmen". Ikonen ser rätt ut, och spelet öppnas utan adressfält.
- [ ] **iPhone:** Dela → "Lägg till på hemskärmen". Samma kontroll.
- [ ] Öppna appen en gång med internet, slå sedan på **flygplansläge** och öppna igen. Spelet ska starta och gå att spela offline.
- [ ] Efter en ny version på GitHub Pages: öppna appen med internet två gånger. Den nya versionen (se versionsnumret på titelskärmen) ska komma.

## 6. Vibration (bara Android, iPhone vibrerar inte från webben)
- [ ] Det vibrerar kort när Dagny blir träffad.
- [ ] **Inställningar → Vibration: Av** stänger av det.

## 7. Prestanda och batteri
- [ ] Slå på **Inställningar → Visa FPS**. Spela i Folkparken (dansbanan), Djupskogen, Trollgrottan och mot Bergakungen. FPS ska ligga på omkring 60 och inte under 50 en längre stund.
- [ ] Notera batterinivån, spela **20 minuter** med skärmen på full ljusstyrka och notera igen. Förväntat: högst 10–12 % på en vanlig telefon.
- [ ] Känns telefonen het efter 20 minuter? (ja / nej)

## Resultat
| Punkt | Android | iPhone | Kommentar |
| --- | --- | --- | --- |
| Orientering och safe area | | | |
| Ljud och bakgrund | | | |
| Flera fingrar och lågt hugg | | | |
| Sparning efter stängning | | | |
| PWA och offline | | | |
| Vibration | | – | |
| FPS / batteri 20 min | | | |

## Mätt i utvecklingsmiljön (inte på telefon)

Mätt i Chromium på en molndator: `update()` plus `render()`, 600 bildrutor per rum, efter att rummet laddats.

| Rum | Snitt (ms) | 95:e percentilen (ms) |
| --- | --- | --- |
| folkparken_3 (dansbanan, mörker, ljusslingor) | 2,1 | 1,8 |
| troll_2 (mörk grotta, kristaller) | 1,1 | 0,8 |
| fyren_1 (regn, vind) | 0,8–1,1 | 0,5–0,6 |
| troll_4 (Bergakungen vaken) | 0,8–0,9 | 0,6 |
| fabod_3 (mörker, förgrundslager) | 0,6 | 0,5 |
| mormors_by | 0,6 | 0,2 |
| mote_strand_storm | 0,4–0,5 | 0,2 |

Budgeten är 16,7 ms per bildruta (60 FPS). Snittet ligger något högre än den 95:e percentilen, eftersom de första bildrutorna i ett nytt rum tar 20–70 ms (bilder byggs och cachas). En billig telefon kan vara 5–10 gånger långsammare än den här datorn, men även då borde det tyngsta rummet hålla sig under budgeten.

Ändrat i den varma loopen:
- Mörkret ritar varje ljus med en förberäknad ljusskiva i stället för en ny gradient per lampa och bildruta.
- Listorna med väsen, projektiler och föremål rensas på plats i stället för att skapas om varje bildruta.
- Spelarens mittpunkt återanvänds i stället för att skapa ett nytt objekt per väsen och bildruta.

På datorn märks det inte, men det ger mindre skräp för skräpsamlaren på svaga telefoner.
