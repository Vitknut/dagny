/**
 * Väsensboken: what Swedish folk belief said about each creature Dagny meets,
 * and how it fits her story. A page opens the first time she beats (or
 * reconciles) the creature. Folk belief varied from parish to parish – the
 * texts say what was commonly told, not that everyone believed it everywhere.
 */
export interface VasenEntry {
  /** What folk belief said (true to the tradition, in plain words). */
  folktro: string;
  /** How it belongs in Dagny's story. */
  berattelse: string;
}

export const VASEN: Readonly<Record<string, VasenEntry>> = {
  // --- The guardians of the seven places ---
  grim: {
    folktro:
      'När en kyrka byggdes sades det att man grävde ner ett levande djur under den – ett lamm under koret, en häst eller ett svin på kyrkogården. Djurets ande blev kyrkogrimmen, som vaktade kyrkan och de döda. Den som mötte grimmen om natten kunde få ett dödsvarsel.',
    berattelse:
      'Kyrkogrimmen har vaktat Stenkyrkans krypta längre än någon minns. När ingen längre tände ljusen där nere blev vakten bitter. Hulda tände dem en gång varje midsommar – det är hennes namn som står halvt bortnött i stenen.',
  },
  gruvraet: {
    folktro:
      'Gruvrået, eller gruvfrun, rådde över malmen i berget. Hon visade sig som en vacker kvinna, ofta klädd i grått. Gruvdrängar som hälsade henne och höll ordning fick rika malmådror och kunde varnas för ras. Den som svor eller visslade i gruvan kunde råka illa ut.',
    berattelse:
      'Gruvrået minns kvinnan som kom med sin lampa varje vår och hälsade. Lampan märkt H.D. hängde kvar på sin spik i arton år – den var Huldas, buren av Dagmar.',
  },
  backahasten: {
    folktro:
      'Bäckahästen visade sig som en vacker vit häst vid bäckar och åar. Barn som satte sig på dess rygg fick se ryggen växa, så att fler fick plats – och så sprang hästen ner i vattnet. Det sades att den försvann om någon sa dess namn högt.',
    berattelse:
      'Väktarna sa Bäckahästens namn högt vid forsen varje sommar. När ingen gjorde det längre blev den vild. Vid dammen lämnade Dagmar sina stövlar – de som Hulda köpt åt henne 1945.',
  },
  havsfrun: {
    folktro:
      'Havsfrun var havets rå: vacker framifrån, men ibland med fisksjärt eller en rygg som drivved. Fiskare som såg henne visste att storm var på väg. Den som visade henne respekt kunde få god fångst; den som hånade henne kunde bli kvar på havet.',
    berattelse:
      'Havsfrun drog stormen kring fyren när ljuset slocknade. Fyrvaktaren skrev i loggboken att signalen från stranden tystnade midsommarnatten 1946 – det var Dagmars lampa som slutade blinka.',
  },
  spelmannen: {
    folktro:
      'Spelmän som ville bli riktigt skickliga sades gå till Näcken vid ett vattenfall, på torsdagskvällar, och offra något – brännvin eller en svart katt. Den som lärde sig av Näcken kunde spela så att folk inte kunde sluta dansa, ibland inte ens spelmannen själv.',
    berattelse:
      'Spelmannen vid dansbanan lärde sig sin konst av något i vattnet och kunde aldrig sluta. På ett fotografi från midsommar 1945 dansar en kvinna med kopparfärgat hår till hans fiol – Dagmar, som skrattar.',
  },
  skogsraet: {
    folktro:
      'Skogsrået var skogens rå, en vacker kvinna sedd framifrån – men bakifrån var hon ihålig som ett murket träd, eller hade en svans. Hon kunde locka vilse den som gick i skogen, men kolare och jägare som behandlade henne väl kunde få hjälp och jaktlycka.',
    berattelse:
      'Skogsrået vaktade fäbodskogen, där Dagmar en gång vävde en näverfilt åt sin dotter. Den filt Dagny låg i under klockstapeln blev aldrig färdig.',
  },
  bergakungen: {
    folktro:
      'Bergakungen härskade över bergsfolket, trollen som bodde inne i berget. I gamla visor tar han människor in i berget – de blir bergtagna – och den som stannat där för länge kan aldrig riktigt bli sig själv igen. Kyrkklockor och Guds namn sades skrämma bergsfolket.',
    berattelse:
      'När alla platser glömts vaknade Bergakungen i vrede. Dagmar gick in i berget och höll honom stilla med sig själv i arton år. Kyrkklockans kläpp, nu fästet på Dagnys klinga, är det bergsfolket fruktar mest.',
  },

  // --- Creatures on the way ---
  vatte: {
    folktro:
      'Vättar var små väsen som bodde under jorden, ofta under gården. Man skulle visa dem hänsyn: den som hällde ut hett vatten ropade först "Akta er!", så att vättarna hann flytta på sig. Förargade vättar kunde ge sjukdom åt folk och fä.',
    berattelse:
      'Vättarna på vägarna har blivit oroliga sedan platserna somnade. Med näverluren kan Dagny kalla på en vätte som vill henne väl.',
  },
  vatteGra: {
    folktro:
      'Gravvättar kallar man i Kyrkbyn de små väsen som håller till bland gravarna. Kyrkogårdarna var fulla av väsen: kyrkogrimmen, gastar och de dödas egna skuggor. Den som tog något från en grav, eller trampade på den, sades kunna få besök om natten.',
    berattelse:
      'Gravvättarna i kryptan tjänar Kyrkogrimmen. De vaknade när ljusen slutade tändas.',
  },
  lyktgubbe: {
    folktro:
      'Lyktgubbar, eller irrbloss, var små ljus som rörde sig över myrar och ängar om natten. Det sades att de var själar efter döda – ofta någon som i livet flyttat en gränssten och nu måste vandra med sin lykta. Den som följde ljuset kunde gå vilse eller hamna i myren.',
    berattelse:
      'Irrblossen lockar Dagny mot gungflyet på myren. På fotografiet från dansbanan dansar Dagmar med ett av dem.',
  },
  nisse: {
    folktro:
      'Tomten, eller nissen, vakade över gården och djuren och höll ordning om natten. Han var liten men stark, och skulle ha sin gröt med smör i på julafton. Glömde man den, eller retade honom, kunde han ta hämnd – eller flytta till grannen och ta lyckan med sig.',
    berattelse:
      'Tomtenissarna i kryptan har ingen gård kvar att vakta och har tagit till svärd i stället. De fäktas, men rusar inte – de vill bara bli lämnade i fred.',
  },
  myrkatt: {
    folktro:
      'Myrkatt kallar folket i Hemdalen katten som hoppar på myrarna. De gamla säger att den är släkt med trollkatten, eller bjäran: ett djur som trollkunniga kvinnor sades skapa av ullgarn och blod för att stjäla mjölk från grannarnas kor och spy upp den i matmors kärna.',
    berattelse:
      'Myrkatterna hoppar på myren och i sanka marker. Ingen vet vems de är.',
  },
  kraka: {
    folktro:
      'Kråkor och korpar sågs på många håll som varselfåglar. En kråka som satte sig på taket och skrek kunde betyda död i huset. Korpen var förr Odens fågel: Hugin och Munin flög över världen och berättade för honom vad de sett.',
    berattelse:
      'Kråkorna skriker och stannar upp innan de dyker. Smeden Algot lär Dagny att vända skölden mot dem då.',
  },
  stenknekt: {
    folktro:
      'Stenknektar kallas stenväktarna i Stenkyrkans krypta. Folktron förklarade gärna stora stenblock: de var troll som solen hunnit ifatt, eller stenar som jättar kastat efter kyrkorna när klockorna störde dem.',
    berattelse:
      'Stenknektarna är kryptans gamla stenväktare. I mörkret är de svåra att se – och svåra att stoppa.',
  },
  sjora: {
    folktro:
      'Sjörået rådde över sjön och fisket. Fiskare kunde lämna en gåva vid stranden, en slant eller en bit bröd, för att få god fångst. Den som tog för mycket, eller glömde sjörået, kunde få tomma nät – eller drunkna.',
    berattelse:
      'Sjöråets skott flyger över vattnet där ingen längre lämnar gåvor vid stranden.',
  },
  gruvvatte: {
    folktro:
      'Gruvarbetare berättade om knackningar inne i berget som ingen människa gjorde. Det var bergsfolket som arbetade – och en knackning på fel ställe kunde vara en varning för ras. Man skulle inte vissla eller svära i gruvan.',
    berattelse:
      'Gruvvättarna är Gruvrået trogna och vaktar den tysta gruvan.',
  },
  fladdermus: {
    folktro:
      'Fladdermusen, eller läderlappen, hörde mörkret till. Folk trodde att den kunde trassla in sig i håret, så att man måste klippa bort den – och på sina håll att den hade med trolldom att göra.',
    berattelse:
      'Fladdermössen bor i gruvor och grottor. Som kråkorna stannar de upp innan de dyker.',
  },
  kvarnnisse: {
    folktro:
      'Kvarnar hade ofta sin egen rå eller gubbe, kvarngubben, som kunde få stenarna att stanna eller kvarnen att brinna. Mjölnaren lämnade en skål gröt eller en näve mjöl åt honom. Kvarnen låg vid strömmande vatten – Näckens och Bäckahästens rike.',
    berattelse:
      'Kvarnnissarna har tagit över kvarnen sedan hjulet stannade och hammaren i bruket tystnade.',
  },
  mas: {
    folktro:
      'Längs kusten sades det att måsar och andra sjöfåglar kunde bära själarna efter drunknade sjömän. Måsar som flög in över land varslade om storm.',
    berattelse:
      'Måsarna kring skären skriker om stormen som Havsfrun drar fram.',
  },
  strandkrabba: {
    folktro:
      'Krabban har ingen egen plats i folktron, men fiskare berättade att allt som levde i havet hörde havsfrun till – fisken var hennes boskap, och hon bestämde vem som fick fånga den.',
    berattelse:
      'Strandkrabborna går i sidled kring fyrskäret, Havsfruns små vaktare.',
  },
  dansgast: {
    folktro:
      'En gast var en död som inte fick ro. Och den som såg älvorna dansa på ängen en midsommarnatt kunde lockas in i ringen – och dansa tills hon dog. Dimma som låg över ängarna om morgonen kallades älvdans.',
    berattelse:
      'Dansgasterna dansar på dansbanan i folkparken när ljusslingorna är döda. De har dansat sedan strömmen gick i maj.',
  },
  fiolspoke: {
    folktro:
      'Den som lärt sig spela av Näcken sades kunna spela så vackert att träden dansade – men den som inte betalat rätt kunde få spela för evigt. Fiolen var ett farligt instrument: på sina håll kallades den för djävulens.',
    berattelse:
      'Fiolspökena har stämt sina fioler efter Spelmannens. Musiken hörs ända in i nattskogen.',
  },
  dimvatte: {
    folktro:
      'Dimma sågs ofta som väsens verk: älvor som dansade, eller rån som ville dölja vägen. Den som gick vilse i dimman skulle vända tröjan ut och in – då släppte förtrollningen.',
    berattelse:
      'Dimvättarna blinkar fram och tillbaka i dimman och är svåra att träffa. I ett starkt ljus har de ingenstans att gömma sig.',
  },
  stubbtroll: {
    folktro:
      'Skogens troll var rädda för kyrkklockor och för åskan – det var Tor som jagade dem med blixten. Därför gömde de sig i berg och under stubbar när det åskade, och därför ringde man i kyrkklockorna när ovädret kom.',
    berattelse:
      'Stubbtrollen hoppar fram ur skogen kring fäboden. Åskan biter på dem.',
  },
  bergtroll: {
    folktro:
      'Bergtrollen bodde inne i berget, med rikedomar och boskap. De kunde vara vänliga mot den som var vänlig – men de stal gärna barn och bytte ut dem mot sina egna, bortbytingar. Det hjälpte att lägga stål, en sax eller en kniv, i vaggan.',
    berattelse:
      'Bergtrollen tjänar Bergakungen och vaktar vägen in i Trollberget.',
  },
  skuggvarg: {
    folktro:
      'Vargen var bondens värsta fiende, så fruktad att man inte gärna sa dess namn. I stället kallade man den gråben, ulv eller "den grå" – sa man vargens namn kunde den komma.',
    berattelse:
      'Skuggvargarna jagar i nattskogen. Bara deras ögon syns i mörkret.',
  },
  skuggan: {
    folktro:
      'Folktron berättade om vården, en osynlig följeslagare som varje människa hade – på fornnordiska fylgja. Ibland kunde man höra någons vård komma före personen själv. Att möta sin egen vård var inget gott tecken.',
    berattelse:
      'I Trollberget möter Dagny sin egen skugga – det sista som står mellan henne och Bergakungen.',
  },
};
