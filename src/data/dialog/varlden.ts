import type { DialogDef } from '../types';

/** The overworld: the sleeping mountain, what each border needs and the caves. */
export const VARLDEN: Record<string, DialogDef> = {
  stollen_ras_skylt: {
    pages: ['Ett kors av två bjälkar, och en lapp i en spik:\n"HÄR GICK TAKET 1931. TRE KOM UT. LYSSNA PÅ BERGET – OCH SPRING."'],
  },
  stollen_ost_stangd: {
    pages: ['Ortmynningen är spikad igen med grova plankor, och bakom dem ligger sten. Härifrån kommer ingen in.'],
  },
  sidoorten_stangd: {
    pages: ['Ett hål i berget, igenrasat. Det drar kallt ur springorna mellan stenarna, så någonstans därinne går det vidare.'],
  },
  stollen_skylt: {
    pages: ['Ett murket plank vid ortmynningen:\n"GAMLA STOLLEN. STÄNGD 1931 EFTER RASET. TRÄD EJ IN."', 'Någon har ristat under, med kniv: "Lampan visar vägen. Håll dig från taket."'],
  },
  tjuvgrottan_skylt: {
    pages: ['Någon har ristat i berget med en kniv:\n"HÄR GÖMDE GRÅ-PELLE SITT SILVER 1899. DET SYNS BARA I RÄTT LJUS."'],
  },

  jattegrytan_skylt: {
    pages: ['Vattnet har svarvat ut en jättegryta i berget. Längre in är det beckmörkt. Det skymtar något på väggarna, men det går inte att se vad.'],
  },

  jattegrytan_ristning: {
    pages: ['I lampans sken syns två bokstäver ristade i berget, nästan utplånade av vattnet: D. och H. Under dem en liten sol.'],
  },

  trollberget_sover: {
    pages: ['Trollberget reser sig svart mot himlen. Vägen upp är stängd så länge de andra platserna sover.'],
  },

  trollberget_vantar: {
    pages: ['Berget är tyst nu. Det är som om det väntar på att något ska sägas först. Hemma.'],
  },

  behover_eka: {
    pages: ['Vattnet är svart och djupt. Botten syns inte.'],
  },

  behover_karbidlampa: {
    pages: ['En gammal gruvgång leder rakt in i berget. Mörkret där inne är så tätt att det nästan går att ta på.'],
  },

  behover_ficklampa: {
    pages: ['Granarna står så tätt att det är natt här mitt på dagen. Man ser inte handen framför sig.'],
  },

  behover_radio: {
    pages: ['Berget ser ut att vara massivt här. Men det susar konstigt i vinden.'],
  },

  behover_stovlar: {
    pages: ['Myren suger tag i skorna och vill inte släppa.'],
  },

  // --- The hidden caves -----------------------------------------------------------------
  fallgrottan_ristning: {
    pages: ['Inristat i berget bakom vattenridån:\n"DEN SOM GÖMMER SIG BAKOM FALLET HÖRS INTE AV BERGET. – D."'],
  },
  // --- Bruset: Dagmar's voice in the radio's static (chapter 7) ---
  // --- What a reading opens on the map (fas 3.2) ---------------------------------------
  snaret_brinner: {
    pages: ['Det torra snåret fattar eld med ett fräsande, och brinner ner till svart aska. Bakom det går en stig in i granarna.'],
  },
  klyftan_lyses: {
    pages: ['Ljuset faller in i klyftan. Den är inte så djup som den såg ut – och längst in står det något och väntar.'],
  },
  bumlingen_klyvs: {
    pages: ['Blixten slår ner i bumlingen. Den spricker mitt itu med en knall som ekar mellan fjällen.'],
  },
  offerkallan: {
    pages: [
      'En källa, inne bland granarna där ingen har gått på länge. På botten ligger mynt, ett bredvid ett annat, gröna av ärg.',
      'Och på en sten vid kanten sitter en liten näverdocka, torr och hel, som om någon nyss har lagt den där.',
    ],
    actions: [{ type: 'flag', flag: 'offerkallan_sedd' }, { type: 'life', id: 'offerkallan' }, { type: 'xp', amount: 150 }],
  },
  jordkallaren: {
    pages: [
      'En jordkällare, igenvuxen sedan många somrar. Dörren hänger på ett gångjärn.',
      'Därinne står burkar med sylt, och en har någon skrivit på med blyerts: "Till den som kommer sist."',
    ],
    actions: [{ type: 'flag', flag: 'jordkallaren_sedd' }, { type: 'heal' }, { type: 'magic' }, { type: 'xp', amount: 150 }],
  },
  morka_orten: {
    pages: [
      'En gammal ort, huggen för hand. På väggen står namn inristade, ett under ett annat, med årtal från förra seklet.',
      'Längst ner, nyare än de andra: ett D. Ingenting mer.',
    ],
    actions: [{ type: 'flag', flag: 'morka_orten_sedd' }, { type: 'life', id: 'morka_orten' }, { type: 'xp', amount: 200 }],
  },
  kluvna_stenen: {
    pages: [
      'Inne i den kluvna stenen är det ihåligt, som ett skrin. Där ligger en sölja av silver, svart av ålder.',
      'Den är kall i handen, och ändå känns den bekant.',
    ],
    actions: [{ type: 'flag', flag: 'kluvna_stenen_sedd' }, { type: 'life', id: 'kluvna_stenen' }, { type: 'xp', amount: 250 }],
  },
  bruset_1: {
    pages: [
      'Radion sprakar till. Mellan bruset, mycket svagt, en kvinnoröst:',
      '"...mamma... om någon hör det här... berget är så tyst om nätterna..."',
    ],
    actions: [{ type: 'flag', flag: 'bruset_1' }, { type: 'xp', amount: 100 }],
  },
  bruset_2: {
    pages: [
      'Radion sprakar till. Rösten igen, längre bort nu:',
      '"...jag räknar somrarna. Tre korta, tre långa, tre korta. Ingen svarar härinne..."',
    ],
    actions: [{ type: 'flag', flag: 'bruset_2' }, { type: 'xp', amount: 100 }],
  },
  bruset_3: {
    pages: [
      'Radion sprakar till. Rösten är nästan glad:',
      '"...hon har väl fått ett namn nu. Jag hoppas att det är ett ljust namn..."',
    ],
    actions: [{ type: 'flag', flag: 'bruset_3' }, { type: 'xp', amount: 100 }],
  },
  bruset_4: {
    pages: [
      'Radion sprakar till. Rösten är alldeles nära:',
      '"...det var aldrig ditt fel, mamma. Jag valde själv. Glöm oss inte..."',
    ],
    actions: [{ type: 'flag', flag: 'bruset_4' }, { type: 'xp', amount: 100 }],
  },
  bruset_klart: {
    pages: [
      'Bruset tystnar. Länge är det helt stilla i radion.',
      'Sedan, alldeles tydligt, tre korta, tre långa, tre korta. Någon i berget har hört att någon lyssnar.',
    ],
    actions: [{ type: 'flag', flag: 'bruset_klart' }, { type: 'life', id: 'bruset' }, { type: 'xp', amount: 300 }],
  },
  kyrkbacken_utsikt: {
    pages: [
      'Dagny klättrar upp på det gamla stenröset på Kyrkbacken. Härifrån ser hon ut över hela sjön.',
      'Kyrkbyn och klockstapeln nedanför, holmarna mitt i sjön – och långt borta, på andra sidan, en strand med en ensam sten.',
      'Allt hon ser härifrån ritas in på kartan i pausmenyn.',
    ],
    actions: [{ type: 'flag', flag: 'kyrkbacken_sedd' }],
  },
  // --- Bergsstigen (chapter 8) ---
  vattegang_skylt: {
    pages: ['Ristat i berget, med en liten vättehand bredvid:\n"TRE GÅNGAR. EN BÄR UPP. VÄTTARNA VET VILKEN."'],
  },
  berg_villse: {
    pages: ['Gången vindlar och vänder i mörkret ... och Dagny står där hon började. Någonstans fnissar en vätte.'],
  },
  rasbranten_skylt: {
    pages: ['Någon har skrivit med kol på en sten: "HIT BLÅSER STORMEN DEN SOM STÅR STILLA. VÄGEN GÅR BARA NER."'],
  },
  stollen_gomd_ristning: {
    pages: [
      'Inristat i en gammal stolpe: ett stort H och bredvid det ett litet, vingligt D.',
      'Under dem, i samma hand som det stora H:et:\n"Här lärde jag henne lyssna på berget. H.D. 1934"',
    ],
  },
  vaktarkammaren_bord: {
    pages: [
      'Ett bord av sten, en ljusstump och en anteckningsbok med fuktiga blad. Handstilen är prydlig.',
      '"Midsommarafton 1946. Jag har lagt henne under klockstapeln och låtit klockan ringa. Mamma är ute på en förlossning, men klockan hör hon. Klingan ligger bredvid, och en lapp."',
      '"I natt går jag in i berget. Någon gång kommer hon att förstå varför." – Dagmar',
      'På sista sidan, med darrigare handstil:\n"Mamma. Det var inte ditt fel. Säg det till dig själv tills du tror på det."',
      'Dagny stoppar anteckningsboken innanför jackan.',
    ],
    actions: [{ type: 'flag', flag: 'anteckningsboken' }],
  },
  vaktarkammaren_vagg: {
    pages: ['På väggen står namn huggna i berget, ett under det andra – Väktare efter Väktare. Näst sist står HULDA. Det sista namnet är DAGMAR. Under det finns plats för ett till.'],
  },
};
