# Sätta upp publiceringen

En checklista i den ordning du gör stegen. Det mesta görs en gång. Därefter publiceras spelet
automatiskt när `master` uppdateras.

| | Vad | Tid | Kostnad |
|---|---|---|---|
| A | Webbversionen på vitknut.github.io | 10 min | gratis |
| B | Signeringsnyckel och GitHub-secrets | 15 min | gratis |
| C | Bygga Android-appen | 5 min | gratis |
| D | Google Play Console och stängt test | 1–2 h, plus testperioden | 25 USD en gång |
| E | Koppla appen till webbplatsen | 15 min | gratis |
| F | Publik release | 30 min | – |

Detaljer och felsökning för Android finns i [`android/README.md`](android/README.md).

---

## A. Webbversionen på vitknut.github.io

Spelet publiceras inte från det här repot utan i Vitknuts publika sajtrepo, så att källkoden kan
vara privat. Hela upplägget och felsökning: [`docs/publicering.md`](docs/publicering.md).

1. Slå på Pages i **Vitknut/vitknut.github.io → Settings → Pages**: *Deploy from a branch*, `main`, `/ (root)`.
2. Skapa token och secret `SITE_TOKEN` (stegen i `docs/publicering.md`).
3. Gå till **Actions → Publicera på vitknut.github.io → Run workflow** (eller pusha något till `master`).
4. Vänta tills körningen är grön (ca 1 min) och öppna **https://vitknut.github.io/dagny/**.

Kontrollera:
- [ ] Spelet startar på datorn.
- [ ] Spelet startar på telefonen i liggande läge.
- [ ] Det går att lägga till spelet på hemskärmen och starta det i flygplansläge.
- [ ] https://vitknut.github.io/dagny/integritet.html visas. Play behöver den adressen.

## B. Signeringsnyckel och GitHub-secrets

Gör detta på din egen dator. Kräver Java (`keytool` följer med alla JDK, t.ex. från adoptium.net).

1. Skapa nyckeln:
   ```bash
   keytool -genkeypair -v -keystore upload-keystore.jks -alias upload \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
   Välj ett starkt lösenord. Svara på frågorna (namn räcker, resten kan lämnas tomt).
2. **Spara `upload-keystore.jks` och lösenordet i en lösenordshanterare.** Lägg aldrig filen i repot.
3. Gör om filen till text:
   - macOS: `base64 -i upload-keystore.jks | pbcopy` (kopieras direkt)
   - Linux: `base64 -w0 upload-keystore.jks`
   - Windows (PowerShell): `[Convert]::ToBase64String([IO.File]::ReadAllBytes("upload-keystore.jks")) | Set-Clipboard`
4. Gå till **Settings → Secrets and variables → Actions → New repository secret** och lägg till:

   | Namn | Värde |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | texten från steg 3 |
   | `ANDROID_KEYSTORE_PASSWORD` | lösenordet |
   | `ANDROID_KEY_PASSWORD` | lösenordet (samma, om du inte valde ett eget för nyckeln) |
   | `ANDROID_KEY_ALIAS` | `upload` |

## C. Bygga Android-appen

1. **Actions → Bygg Android-app → Run workflow**.
2. När körningen är grön: öppna den och ladda ner **dagny-<nummer>-aab** under *Artifacts*.
   Det är en zip med `app-release.aab`.

Står det *"ANDROID_KEYSTORE_BASE64 saknas"* i loggen har steg B inte gått igenom. Paketet är då
osignerat och Play tar inte emot det.

Varje körning får ett nytt versionsnummer automatiskt. Du behöver bara bygga en ny `.aab` när själva
appskalet ändras (namn, ikon, färger). Spelets innehåll uppdateras via webben.

## D. Google Play Console och stängt test

1. Skapa ett utvecklarkonto på **https://play.google.com/console** (25 USD, identitetsverifiering
   kan ta några dagar). Välj *personligt konto* om du inte har ett företag.
2. **Skapa app**: namn *Dagnys äventyr*, standardspråk svenska, typ **Spel**, **Gratis**.
3. **Konfigurera appen** (instrumentpanelens checklista):
   - **Integritetspolicy:** `https://vitknut.github.io/dagny/integritet.html`
   - **Appåtkomst:** alla funktioner är tillgängliga utan inloggning.
   - **Annonser:** innehåller inte annonser.
   - **Innehållsklassning:** fyll i formuläret. Svara att det finns tecknat fantasyvåld utan blod och
     inga köp, ingen chatt och ingen användargenererad data.
   - **Målgrupp:** välj åldrar. Väljer du grupper under 13 år gäller Familjeprogrammets extra regler.
     *13 år och äldre* är enklast att börja med.
   - **Datasäkerhet:** appen samlar inte in eller delar några användardata.
   - **Spelkategori:** Äventyr.
4. **Butiksinformation:** kort beskrivning, lång beskrivning, ikon 512×512
   (`public/icons/icon-512.png`), funktionsgrafik 1024×500 och minst två skärmdumpar i liggande läge.
   Be Claude ta fram texter och bilder om du vill.
5. **Testa och släpp → Testning → Stängd testning → Skapa spår**:
   - Ladda upp `app-release.aab` från steg C.
   - Godkänn **Play App Signing** när du tillfrågas (rekommenderas).
   - Lägg till testare via en e-postlista eller en Google-grupp och skicka länken till dem.
6. Nya personliga konton måste köra det stängda testet med ett visst antal testare under ett visst
   antal dagar innan appen får släppas publikt. Kraven står i Play Console och ändras ibland. Läs dem där.

## E. Koppla appen till webbplatsen

Utan detta visar appen en adressrad överst. Gör steget när appen har laddats upp minst en gång.

1. Play Console → **Testa och släpp → Appintegritet → App-signering**. Kopiera **SHA-256** för
   *App signing key certificate*, och även för *Upload key certificate*.
2. I det här repot, kör:
   ```bash
   node scripts/assetlinks.mjs <SHA-256 app signing> <SHA-256 upload> > assetlinks.json
   ```
3. Filen måste ligga på `https://vitknut.github.io/.well-known/assetlinks.json`, alltså i roten av
   domänen och inte under `/dagny/`. Lägg den som `.well-known/assetlinks.json` i repot
   **Vitknut/vitknut.github.io** (där finns redan `.nojekyll`, så mappen publiceras).
4. Kontrollera att adressen ovan visar JSON i webbläsaren. Avinstallera och installera om appen från
   testlänken. Adressraden ska nu vara borta.

## F. Publik release

När kraven för det stängda testet är uppfyllda:

1. **Testa och släpp → Produktion → Skapa ny version**, välj samma (eller en nyare) `.aab`.
2. Skriv versionsinformation, välj länder och skicka in för granskning. Det brukar ta från några timmar
   till ett par dagar.

---

## Underhåll

| När | Gör |
|---|---|
| Nytt innehåll i spelet | Pusha till `master`. Webben och appen uppdateras automatiskt. |
| Nytt appnamn, ny ikon eller nya färger | Ändra i `android/`, bygg (steg C), ladda upp en ny version i Play. |
| Byt dator | Kopiera `upload-keystore.jks` från lösenordshanteraren. Allt annat finns i repot. |
| Tappat uppladdningsnyckeln | Play Console → Appintegritet → *Begär återställning av uppladdningsnyckel*. |
