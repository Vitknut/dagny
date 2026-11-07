# Publicering

Hur Dagnys äventyr kommer ut på webben och i Android-appen, och vad som görs en gång.

## Översikt

| Repo | Synlighet | Innehåll |
|---|---|---|
| `Vitknut/dagny` (det här) | **privat** | Källkoden, storyn, verktygen, testerna och Android-skalet |
| `Vitknut/vitknut.github.io` | publikt | Vitknut Studios hemsida och det **byggda** spelet under `dagny/` |

```
push till master i Vitknut/dagny
  → Actions: "Publicera på vitknut.github.io" (.github/workflows/pages.yml)
      npm ci → npm test → npm run build
      → kopierar dist/ till dagny/ i Vitknut/vitknut.github.io och pushar till main
  → GitHub Pages i sajtrepot publicerar main
  → https://vitknut.github.io/dagny/  (webben och Android-appen)
```

Varför två repon? Gratis GitHub Pages kräver ett publikt repo. Med uppdelningen kan källkoden,
storyn och dokumentationen vara privata. Det som blir publikt är bara det spelaren ändå laddar ner:
den byggda, komprimerade versionen. Utan licensfil är allt förbehållet upphovspersonen, men det som
ligger publikt kan läsas av vem som helst.

Adresser:

| | |
|---|---|
| Spelet | https://vitknut.github.io/dagny/ |
| Integritetspolicy (Play behöver den) | https://vitknut.github.io/dagny/integritet.html |
| Hemsidan | https://vitknut.github.io/ |
| Digital Asset Links för appen | https://vitknut.github.io/.well-known/assetlinks.json |

## Engångsinställningar

### 1. Pages i sajtrepot

`Vitknut/vitknut.github.io` → **Settings → Pages → Build and deployment → Source: "Deploy from a
branch"**, gren `main`, mapp `/ (root)`.

### 2. Token så att det här repot får skriva i sajtrepot

Arbetsflödet behöver rätt att pusha till `Vitknut/vitknut.github.io`. Det får det med en
finkornig token (fine-grained personal access token):

1. GitHub → profilbilden → **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**.
2. **Resource owner:** `Vitknut`. **Repository access:** *Only select repositories* →
   `vitknut.github.io`. **Permissions → Repository permissions → Contents: Read and write.**
   Välj en giltighetstid (max ett år; skriv upp när den går ut).
3. Kopiera token. Lägg den i **Vitknut/dagny → Settings → Secrets and variables → Actions →
   New repository secret** med namnet `SITE_TOKEN`.

Kräver organisationen godkännande av tokens, godkänn den under **Vitknut → Settings → Personal access
tokens → Pending requests**.

Lägg aldrig token i koden eller i chatten. Går den ut eller läcker: skapa en ny och byt värdet på
secreten.

### 3. Grenar och synlighet i det här repot

- **Settings → General → Default branch:** `master`.
- Den gamla publiceringen direkt från det här repot används inte längre: **Settings → Pages** kan
  stängas av, och miljön `github-pages` under **Settings → Environments** kan tas bort.
- När publiceringen till sajtrepot har gått igenom en gång: **Settings → General → Danger zone →
  Change visibility → Private**.

Ordningen spelar roll: gör repot privat först när `https://vitknut.github.io/dagny/` visar spelet
från sajtrepot. Annars ligger spelet nere tills publiceringen fungerar.

## Kör en publicering för hand

**Actions → Publicera på vitknut.github.io → Run workflow** (gren `master`). Efter någon minut
syns en ny incheckning "Publicera Dagnys äventyr (abc1234)" i sajtrepot, och strax därefter är
den ute.

## Felsökning

| Symptom | Trolig orsak |
|---|---|
| Steget "Hämta sajtens repo" misslyckas med *Input required: token* eller 401/403 | `SITE_TOKEN` saknas, har gått ut eller saknar *Contents: Read and write* på `vitknut.github.io`, eller väntar på godkännande i organisationen. |
| "Checka in och pusha" misslyckas med 403 | Token har bara läsrätt. |
| Körningen är grön men sidan visar gammalt | Pages i sajtrepot bygger fortfarande (se sajtrepots Actions), eller webbläsarens service worker visar cachad version: ladda om två gånger. |
| `vitknut.github.io/dagny/` ger 404 | Pages är inte påslaget i sajtrepot, eller ingen publicering har körts än. |
| `npm test` eller `npm run build` fallerar | Samma fel som i "Kontroll"-flödet; rätta i koden. Inget publiceras då. |

## Egen domän senare

Skaffar Vitknut en domän (t.ex. `vitknut.se`): lägg in den under sajtrepots **Settings → Pages →
Custom domain** och följ GitHubs DNS-instruktioner. Ändra sedan adresserna i Android-skalet (se
`android/README.md`, "Egen domän senare"), integritetspolicyn och den här filen, och bygg om appen.
Byt helst domän **före** första Play-releasen, eftersom appens koppling till webbplatsen bygger på den.
