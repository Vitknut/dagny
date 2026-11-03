import type { DialogDef } from '../types';

/** The overworld: the sleeping mountain, what each border needs, friendly meetings and the caves. */
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

  mote_vatte_liv: {
    speaker: 'Vätten',
    pages: ['En vätte kliver fram ur gräset med en kopp kaffe. "Du förlikade min släkt i templen. Drick nu, Väktare."', 'Dagny känner sig starkare. Livet är fyllt.'],
    actions: [{ type: 'heal' }],
  },

  mote_vatte_magi: {
    speaker: 'Vätten',
    pages: ['En vätte sticker åt Dagny en näve hjortron. "Mormor sa att de är bra för läsningarna."', 'Dagny känner hur magin kommer tillbaka.'],
    actions: [{ type: 'magic' }],
  },

  mote_vandrare_lore: {
    speaker: 'Vandraren',
    pages: ['En gesäll med ränsel stannar och hälsar. "Jag hörde en gammal gumma i Kyrkbyn berätta om natten då klockan ringde av sig själv. Hon såg en kvinna med kopparhår gå mot Trollberget."'],
  },

  mote_vandrare_vag: {
    speaker: 'Vandraren',
    pages: ['En skogsarbetare vilar på en stubbe. "Ska du ner mot kusten? Akta dig för tidvattenkärret. Det har tagit fler än en, och det släpper inte taget om skorna."'],
  },

  mote_vandrare_fyr: {
    speaker: 'Vandraren',
    pages: ['En fiskare med håv över axeln nickar. "Gamle Ture i Fiskeläget var fyrvaktare förr. Han skrev upp allt i en loggbok, till och med natten 1946."'],
  },

  mote_irrbloss_radio: {
    pages: ['Ett vänligt irrbloss dansar runt Dagny och surrar som en radio mellan stationerna. Det känns som om det vill säga: i templen finns väggar som surrar på samma sätt.'],
  },

  mote_irrbloss_holmen: {
    pages: ['Ett irrbloss svävar ut över sjön och stannar vid en liten holme mitt i vattnet. Där slocknar det, precis vid en mörk grottöppning.'],
  },

  mote_irrbloss_grottan: {
    pages: ['Ett irrbloss leder Dagny en bit söderut över myren och lyser upp en klippa. Bakom ljungen gapar en grotta. Det fnissar och försvinner.'],
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
