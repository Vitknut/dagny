import type { DialogDef } from '../types';

/** Bruksorten: the iron works, smeden Holm (Skydd, the sword), förman Karlsson (Uppåtstöt) and Rosa's locket. */
export const BRUKSORTEN: Record<string, DialogDef> = {
  rut_vila: {
    speaker: 'Rut på värdshuset',
    pages: ['Värdshuset har mat och sängar, och ingen frågar varifrån man kommer. Vill du vila?'],
    choices: [
      { text: 'Vila på värdshuset', next: 'rut_vilat', actions: [{ type: 'rest' }] },
      { text: 'Inte nu', next: 'rut_hej' },
    ],
  },

  rut_vilat: {
    speaker: 'Rut på värdshuset',
    pages: ['Där är du ju. Gröten står framme. Kom tillbaka när du vill, så har vi en säng åt dig.'],
  },

  rut_hej: {
    speaker: 'Rut på värdshuset',
    pages: ['Det är skiftbyte snart. Då blir det trångt här inne, så passa på medan det är lugnt.'],
  },

  holm_uppdrag: {
    speaker: 'Smeden Holm',
    pages: [
      'Upp på loftet, du? Här är det varmt, ässjan står rakt under.',
      'Jag kan en läsning som skyddar. Men den ska sägas med rönn i handen, annars är den bara ord.',
      'Mjölnarn vid forsen har alltid haft en rönn vid kvarnen, mot det som bor i vattnet. Bryt en kvist åt mig.',
    ],
    actions: [{ type: 'flag', flag: 'ronnkvist_uppdrag' }],
  },

  holm_vantar: {
    speaker: 'Smeden Holm',
    pages: ['Rönnen står vid kvarnen vid forsen. Mjölnarn litade på den.'],
  },

  holm_lar: {
    speaker: 'Smeden Holm',
    pages: [
      'Rönn, och med bären kvar. Bra. Då kan vi börja.',
      'Du bär en gammal klinga. Bra smide, fast fästet är en klockkläpp. Det har jag aldrig sett förut.',
      'Min far lärde mig en sak i hyttan, när gnistorna flög. Ett kors av rönn över bröstet, och en läsning.',
      '"Rönn för bröstet, järn för hand, inget ont går över min rand." Så. Nu tar du bara halva smällen.',
    ],
    actions: [{ type: 'takeItem', item: 'ronnkvist' }, { type: 'flag', flag: 'ronnkvist_klar' }, { type: 'learnSpell', spell: 'skydd' }],
    next: 'lart_skydd',
  },

  lart_skydd: {
    pages: ['Dagny lärde sig läsningen SKYDD!\nHalverar skadan Dagny tar en stund.'],
  },

  holm_igen: {
    speaker: 'Smeden Holm',
    pages: ['Skyddet håller en stund. Men en bra sköld och ett bra öga håller längre.'],
  },

  karlsson_uppdrag: {
    speaker: 'Förman Karlsson',
    pages: [
      'Kom du genom Gamla stollen? Då hade du tur. Jag var med när taket gick 1931.',
      'Efteråt byggde vi kvarndammen, och verktygen gömde vi bakom vattenfallet norr om kvarnen. Min hacka ligger kvar där. Hämta den åt mig, så ska jag lära dig något.',
      'Den som har slagit upp lika många luckor i taket som jag vet hur man hugger uppåt.',
    ],
    actions: [{ type: 'flag', flag: 'hacka_uppdrag' }],
  },

  karlsson_vantar: {
    speaker: 'Förman Karlsson',
    pages: ['Bakom vattenfallet norr om kvarnen. Man ser grottan först när man står alldeles intill.'],
  },

  karlsson_lar: {
    speaker: 'Förman Karlsson',
    pages: [
      'Min hacka! Ja, där sitter mitt K i skaftet. Trettiotre år har den legat bakom fallet.',
      'Nu ska du få ditt. Håll UPP och slå, så går klingan rakt upp. Bra mot fladdermöss och sådant som hänger i taket.',
      'Ska du till kvarnen vid forsen? Där sitter en lucka i taket som mjölnarn alltid slog upp underifrån. Nu vet du hur.',
    ],
    actions: [{ type: 'takeItem', item: 'hacka' }, { type: 'flag', flag: 'hacka_klar' }, { type: 'learnSkill', skill: 'uppatstot' }, { type: 'flag', flag: 'karlsson_lart' }],
    next: 'lart_uppatstot',
  },

  lart_uppatstot: {
    pages: ['Dagny lärde sig UPPÅTSTÖT!\nHåll UPP och slå för att stöta svärdet uppåt.'],
  },

  karlsson_igen: {
    speaker: 'Förman Karlsson',
    pages: ['Upp och ner, upp och ner. Precis som hissen i gruvan, fast med svärd.'],
  },

  rosa_uppdrag: {
    speaker: 'Rosa',
    pages: [
      'Jag hade en medaljong med Gunnars kort i. Han var flottare och drunknade i forsen för länge sedan.',
      'Jag tappade den vid kvarnen när jag satt och tittade på vattnet. Bäckahästen skrämde mig så jag sprang.',
    ],
    actions: [{ type: 'flag', flag: 'medaljong_uppdrag' }],
  },

  rosa_vantar: {
    speaker: 'Rosa',
    pages: ['Medaljongen föll nog ner någonstans vid vattenfallet bakom kvarnen. Var försiktig, det är halt.'],
  },

  rosa_tack: {
    speaker: 'Rosa',
    pages: [
      'Gunnar... Där är du ju. Jag trodde att jag aldrig skulle få se dig igen.',
      'Ta det här, lilla vän. Han skulle ha tyckt om dig.',
    ],
    actions: [{ type: 'takeItem', item: 'medaljong' }, { type: 'flag', flag: 'medaljong_klar' }, { type: 'xp', amount: 200 }, { type: 'heal' }],
    next: 'rosa_xp',
  },

  rosa_xp: {
    pages: ['Dagny fick 200 XP och känner sig utvilad.'],
  },

  rosa_glad: {
    speaker: 'Rosa',
    pages: ['Jag har satt medaljongen på en ny kedja. Nu tar jag aldrig av den igen.'],
  },

  hittade_medaljong: {
    pages: ['Dagny hittade en MEDALJONG. Inuti sitter ett fotografi av en ung man med keps.'],
  },

  sigge: {
    speaker: 'Sigge',
    pages: ['Pappa säger att hammaren i bruket stannade när kvarnen slutade mala. Allt hänger ihop, säger han.'],
  },

  sigge_efter: {
    speaker: 'Sigge',
    pages: [
      'Hammaren går igen! Dunk, dunk, dunk hela dagen. Jag har aldrig tyckt att det låtit så fint.',
      'Ska du över myren? Pappa har en ramsa: "Till döda tallen, sen österut där stigen slingrar. Korset visar söderut, och pråmen visar havet."',
      'Och där det bubblar bär det inte. Gå aldrig efter irrbloss!',
    ],
  },
};
