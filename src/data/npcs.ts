import type { NpcDef } from './types';

/** Villagers. Each picks the first dialog whose conditions hold. */
export const NPCS: Readonly<Record<string, NpcDef>> = {
  hulda: {
    id: 'hulda',
    sprite: 'hulda',
    idle: { frames: [0, 0, 0, 2, 0, 1, 1, 0], every: 0.7 },
    talk: [
      { if: [{ flag: 'fabodskogen_klar' }, { notFlag: 'hulda_efter_fabodskogen' }], dialog: 'hulda_efter_fabodskogen' },
      { if: [{ flag: 'folkparken_klar' }, { notFlag: 'hulda_efter_folkparken' }], dialog: 'hulda_efter_folkparken' },
      { if: [{ flag: 'fyren_klar' }, { notFlag: 'hulda_efter_fyren' }], dialog: 'hulda_efter_fyren' },
      { if: [{ flag: 'kvarnen_klar' }, { notFlag: 'hulda_efter_kvarnen' }], dialog: 'hulda_efter_kvarnen' },
      { if: [{ flag: 'gruvan_klar' }, { notFlag: 'hulda_efter_gruvan' }], dialog: 'hulda_efter_gruvan' },
      { if: [{ flag: 'krypta_klar' }, { notFlag: 'hulda_efter_krypta' }], dialog: 'hulda_efter_krypta' },
      { if: [{ flag: 'signalen_besvarad' }, { notFlag: 'hulda_signal' }], dialog: 'hulda_signal' },
      { if: [{ notFlag: 'intro_done' }], dialog: 'intro_hulda' },
      { dialog: 'hulda_vila' },
    ],
  },
  sven: {
    id: 'sven',
    sprite: 'man',
    idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 },
    talk: [
      { if: [{ notSpell: 'lakning' }, { item: 'johannesort' }], dialog: 'sven_lar' },
      { if: [{ notSpell: 'lakning' }, { flag: 'sven_uppdrag' }], dialog: 'sven_vantar' },
      { if: [{ notSpell: 'lakning' }], dialog: 'sven_uppdrag' },
      { if: [{ flag: 'krypta_klar' }], dialog: 'sven_efter' },
      { dialog: 'sven_igen' },
    ],
  },
  algot: {
    id: 'algot',
    sprite: 'shopkeeper',
    idle: { frames: [0, 2, 0, 0], every: 0.9 },
    talk: [
      { if: [{ flag: 'algot_lart' }], dialog: 'algot_igen' },
      { if: [{ item: 'tang' }], dialog: 'algot_tack' },
      { if: [{ flag: 'tang_uppdrag' }], dialog: 'algot_vantar' },
      { dialog: 'algot_uppdrag' },
    ],
  },
  karin: {
    id: 'karin',
    sprite: 'woman',
    idle: { frames: [0, 0, 2, 0], every: 0.8 },
    talk: [
      { if: [{ item: 'murre' }, { notFlag: 'murre_hemma' }], dialog: 'karin_tack' },
      { if: [{ flag: 'murre_hemma' }], dialog: 'karin_glad' },
      { if: [{ flag: 'murre_uppdrag' }], dialog: 'karin_vantar' },
      { dialog: 'karin_uppdrag' },
    ],
  },
  murre: {
    id: 'murre',
    sprite: 'cat',
    idle: { frames: [0, 0, 1, 0, 1], every: 0.5 },
    if: [{ flag: 'murre_hemma' }],
    talk: [{ dialog: 'murre_spinner' }],
  },
  handlarn: {
    id: 'handlarn',
    sprite: 'shopkeeper',
    idle: { frames: [0, 0, 1, 0], every: 1 },
    talk: [
      { if: [{ flag: 'krypta_klar' }], dialog: 'handlarn_efter' },
      { dialog: 'handlarn' },
    ],
  },
  olle: {
    id: 'olle',
    sprite: 'kid',
    idle: { frames: [0, 0, 1, 0, 1, 0, 0, 0], every: 0.35 },
    talk: [
      { if: [{ item: 'radio' }], dialog: 'olle_radio' },
      { if: [{ flag: 'krypta_klar' }], dialog: 'olle_efter' },
      { dialog: 'olle' },
    ],
  },
  // --- Gruvsamhället ---
  maj: {
    id: 'maj',
    sprite: 'maj',
    idle: { frames: [0, 0, 2, 0, 1, 0], every: 0.8 },
    talk: [{ dialog: 'maj_vila' }],
  },
  elin: {
    id: 'elin',
    sprite: 'elin',
    idle: { frames: [0, 0, 1, 1, 0, 2], every: 0.8 },
    talk: [
      { if: [{ notSpell: 'lyse' }, { item: 'solsten' }, { flag: 'solsten_uppdrag' }], dialog: 'elin_lar' },
      { if: [{ notSpell: 'lyse' }, { flag: 'solsten_uppdrag' }], dialog: 'elin_vantar' },
      { if: [{ notSpell: 'lyse' }], dialog: 'elin_uppdrag' },
      { if: [{ flag: 'gruvan_klar' }], dialog: 'elin_efter' },
      { dialog: 'elin_igen' },
    ],
  },
  anders: {
    id: 'anders',
    sprite: 'miner',
    idle: { frames: [0, 0, 2, 0], every: 0.9 },
    talk: [
      { if: [{ item: 'fickur' }, { notFlag: 'fickur_klar' }], dialog: 'anders_tack' },
      { if: [{ flag: 'fickur_klar' }], dialog: 'anders_glad' },
      { if: [{ flag: 'fickur_uppdrag' }], dialog: 'anders_vantar' },
      { dialog: 'anders_uppdrag' },
    ],
  },
  lisa: {
    id: 'lisa',
    sprite: 'kid2',
    idle: { frames: [0, 0, 1, 0, 1, 0, 0], every: 0.35 },
    talk: [
      { if: [{ flag: 'gruvan_klar' }], dialog: 'lisa_efter' },
      { dialog: 'lisa' },
    ],
  },
  nils: {
    id: 'nils',
    sprite: 'miner',
    idle: { frames: [0, 2, 0, 0, 1], every: 0.9 },
    talk: [
      { if: [{ flag: 'gruvan_klar' }], dialog: 'nils_efter' },
      { dialog: 'nils' },
    ],
  },
  greta: {
    id: 'greta',
    sprite: 'woman2',
    idle: { frames: [0, 0, 1, 0, 0, 2], every: 0.8 },
    talk: [{ dialog: 'greta' }],
  },
  // --- Kyrkbyn ---
  signe: { id: 'signe', sprite: 'signe', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ dialog: 'signe_vila' }] },
  prosten: { id: 'prosten', sprite: 'prost', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ if: [{ notSpell: 'eld' }, { flag: 'krypta_klar' }], dialog: 'prosten_lar' }, { if: [{ notSpell: 'eld' }], dialog: 'prosten_vanta' }, { if: [{ flag: 'trollberget_klar' }], dialog: 'prosten_efter' }, { dialog: 'prosten_igen' }] },
  ingrid: { id: 'ingrid', sprite: 'woman2', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ if: [{ item: 'psalmbok' }, { notFlag: 'psalmbok_klar' }], dialog: 'ingrid_tack' }, { if: [{ flag: 'psalmbok_klar' }], dialog: 'ingrid_glad' }, { if: [{ flag: 'psalmbok_uppdrag' }], dialog: 'ingrid_vantar' }, { dialog: 'ingrid_uppdrag' }] },
  bosse: { id: 'bosse', sprite: 'kid3', idle: { frames: [0, 0, 1, 0, 1, 0, 0], every: 0.35 }, talk: [{ if: [{ flag: 'krypta_klar' }], dialog: 'bosse_efter' }, { dialog: 'bosse' }] },
  tyra: { id: 'tyra', sprite: 'tyra', idle: { frames: [0, 0, 0, 2, 0, 1, 1, 0], every: 0.7 }, talk: [{ if: [{ flag: 'trollberget_klar' }], dialog: 'tyra_efter' }, { dialog: 'tyra' }] },
  // --- Bruksorten ---
  rut: { id: 'rut', sprite: 'woman', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ dialog: 'rut_vila' }] },
  holm: {
    id: 'holm',
    sprite: 'smed',
    idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 },
    talk: [
      { if: [{ notSpell: 'skydd' }, { item: 'ronnkvist' }, { flag: 'ronnkvist_uppdrag' }], dialog: 'holm_lar' },
      { if: [{ notSpell: 'skydd' }, { flag: 'ronnkvist_uppdrag' }], dialog: 'holm_vantar' },
      { if: [{ notSpell: 'skydd' }], dialog: 'holm_uppdrag' },
      { if: [{ item: 'malm' }, { notItem: 'klingaHardad' }], dialog: 'holm_hardar' },
      { if: [{ item: 'askstenen' }, { item: 'klingaHardad' }, { notItem: 'klingaBlank' }], dialog: 'holm_slipar' },
      { if: [{ notItem: 'klingaHardad' }], dialog: 'holm_tips_malm' },
      { if: [{ notItem: 'klingaBlank' }], dialog: 'holm_tips_askstenen' },
      { dialog: 'holm_igen' },
    ],
  },
  karlsson: { id: 'karlsson', sprite: 'forman', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ if: [{ flag: 'karlsson_lart' }], dialog: 'karlsson_igen' }, { if: [{ item: 'hacka' }], dialog: 'karlsson_lar' }, { if: [{ flag: 'hacka_uppdrag' }], dialog: 'karlsson_vantar' }, { dialog: 'karlsson_uppdrag' }] },
  rosa: { id: 'rosa', sprite: 'resenar', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ if: [{ item: 'medaljong' }, { notFlag: 'medaljong_klar' }], dialog: 'rosa_tack' }, { if: [{ flag: 'medaljong_klar' }], dialog: 'rosa_glad' }, { if: [{ flag: 'medaljong_uppdrag' }], dialog: 'rosa_vantar' }, { dialog: 'rosa_uppdrag' }] },
  sigge: { id: 'sigge', sprite: 'kid4', idle: { frames: [0, 0, 1, 0, 1, 0, 0], every: 0.35 }, talk: [{ if: [{ flag: 'kvarnen_klar' }], dialog: 'sigge_efter' }, { dialog: 'sigge' }] },
  banvakt: { id: 'banvakt', sprite: 'stins', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ if: [{ flag: 'visselpipa_klar' }], dialog: 'banvakt_resa' }, { dialog: 'banvakt_vantar' }] },
  // --- Fiskeläget ---
  hilma: { id: 'hilma', sprite: 'maj', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ dialog: 'hilma_vila' }] },
  viola: { id: 'viola', sprite: 'natlagerska', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ if: [{ notSpell: 'hopp' }, { item: 'fjader' }, { flag: 'fjader_uppdrag' }], dialog: 'viola_lar' }, { if: [{ notSpell: 'hopp' }, { flag: 'fjader_uppdrag' }], dialog: 'viola_vantar' }, { if: [{ notSpell: 'hopp' }], dialog: 'viola_uppdrag' }, { dialog: 'viola_igen' }] },
  johan: { id: 'johan', sprite: 'fiskare', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ if: [{ item: 'kompass' }, { notFlag: 'kompass_klar' }], dialog: 'johan_tack' }, { if: [{ flag: 'kompass_klar' }], dialog: 'johan_glad' }, { if: [{ flag: 'kompass_uppdrag' }], dialog: 'johan_vantar' }, { dialog: 'johan_uppdrag' }] },
  stina: { id: 'stina', sprite: 'kid2', idle: { frames: [0, 0, 1, 0, 1, 0, 0], every: 0.35 }, talk: [{ if: [{ flag: 'fyren_klar' }], dialog: 'stina_efter' }, { dialog: 'stina' }] },
  ture: { id: 'ture', sprite: 'shopkeeper', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ if: [{ item: 'radio' }, { notFlag: 'ture_sandare' }], dialog: 'ture_sandare' }, { if: [{ flag: 'fyren_klar' }], dialog: 'ture_efter' }, { dialog: 'ture' }] },
  // --- Fäboden ---
  anna: { id: 'anna', sprite: 'budeja', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ dialog: 'anna_vila' }] },
  karna: { id: 'karna', sprite: 'karna', idle: { frames: [0, 0, 0, 2, 0, 1, 1, 0], every: 0.7 }, talk: [{ if: [{ notSpell: 'hamn' }, { flag: 'gruvan_klar' }], dialog: 'karna_lar' }, { if: [{ notSpell: 'hamn' }], dialog: 'karna_vanta' }, { dialog: 'karna_igen' }] },
  lillper: { id: 'lillper', sprite: 'kid4', idle: { frames: [0, 0, 1, 0, 1, 0, 0], every: 0.35 }, talk: [{ if: [{ item: 'skalla' }, { notFlag: 'skalla_klar' }], dialog: 'lillper_tack' }, { if: [{ flag: 'skalla_klar' }], dialog: 'lillper_glad' }, { if: [{ flag: 'skalla_uppdrag' }], dialog: 'lillper_vantar' }, { dialog: 'lillper_uppdrag' }] },
  stjarna: { id: 'stjarna', sprite: 'ko', idle: { frames: [0, 0, 1, 1, 0, 2], every: 0.9 }, talk: [{ if: [{ flag: 'skalla_klar' }], dialog: 'stjarna_glad' }, { dialog: 'stjarna' }] },
  rosen: { id: 'rosen', sprite: 'ko', idle: { frames: [0, 0, 1, 1, 0, 2], every: 1.1 }, talk: [{ dialog: 'rosen' }] },
  britta: { id: 'britta', sprite: 'kid3', idle: { frames: [0, 0, 1, 0, 1, 0, 0], every: 0.35 }, talk: [{ if: [{ flag: 'fabodskogen_klar' }], dialog: 'britta_efter' }, { dialog: 'britta' }] },
  // --- Stationssamhället ---
  lind: { id: 'lind', sprite: 'woman2', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ dialog: 'lind_vila' }] },
  oskar: { id: 'oskar', sprite: 'telegrafist', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ if: [{ notSpell: 'aska' }, { item: 'askvigg' }, { flag: 'askvigg_uppdrag' }], dialog: 'oskar_lar' }, { if: [{ notSpell: 'aska' }, { flag: 'askvigg_uppdrag' }], dialog: 'oskar_vantar' }, { if: [{ notSpell: 'aska' }], dialog: 'oskar_uppdrag' }, { dialog: 'oskar_igen' }] },
  berg: { id: 'berg', sprite: 'stins', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ if: [{ item: 'visselpipa' }, { notFlag: 'visselpipa_klar' }], dialog: 'berg_tack' }, { if: [{ flag: 'visselpipa_klar' }], dialog: 'berg_glad' }, { if: [{ flag: 'visselpipa_uppdrag' }], dialog: 'berg_vantar' }, { dialog: 'berg_uppdrag' }] },
  resenaren: { id: 'resenaren', sprite: 'woman', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ dialog: 'resenaren' }] },
  kalle: { id: 'kalle', sprite: 'kid', idle: { frames: [0, 0, 1, 0, 1, 0, 0], every: 0.35 }, talk: [{ if: [{ flag: 'folkparken_klar' }], dialog: 'kalle_efter' }, { dialog: 'kalle' }] },
  // --- Trollberget ---
  dagmar: {
    id: 'dagmar',
    sprite: 'dagmar',
    idle: { frames: [0, 0, 2, 0], every: 0.9 },
    talk: [{ dialog: 'dagmar_avsked' }],
  },
  // --- Epilogue: midsummer eve in Mormors by ---
  hulda_ep: {
    id: 'hulda_ep',
    sprite: 'hulda',
    idle: { frames: [0, 0, 0, 2, 0, 1, 1, 0], every: 0.7 },
    talk: [
      { if: [{ flag: 'anteckningsboken' }, { notFlag: 'hulda_halsad' }], dialog: 'hulda_halsning_bok' },
      { if: [{ notFlag: 'hulda_halsad' }], dialog: 'hulda_halsning' },
      { dialog: 'hulda_epilog' },
    ],
  },
  sven_ep: { id: 'sven_ep', sprite: 'man', idle: { frames: [0, 0, 2, 0, 0, 1, 0], every: 0.8 }, talk: [{ dialog: 'sven_epilog' }] },
  karin_ep: { id: 'karin_ep', sprite: 'woman', idle: { frames: [0, 0, 2, 0], every: 0.8 }, talk: [{ dialog: 'karin_epilog' }] },
  maj_ep: { id: 'maj_ep', sprite: 'maj', idle: { frames: [0, 0, 2, 0, 1, 0], every: 0.8 }, talk: [{ dialog: 'maj_epilog' }] },
  anders_ep: { id: 'anders_ep', sprite: 'miner', idle: { frames: [0, 0, 2, 0], every: 0.9 }, talk: [{ dialog: 'anders_epilog' }] },
  olle_ep: { id: 'olle_ep', sprite: 'kid', idle: { frames: [0, 1, 0, 1, 0, 0], every: 0.3 }, talk: [{ dialog: 'olle_epilog' }] },
  greta_ep: { id: 'greta_ep', sprite: 'woman2', idle: { frames: [0, 0, 1, 0, 0, 2], every: 0.8 }, talk: [{ dialog: 'greta_epilog' }] },
  murre_ep: { id: 'murre_ep', sprite: 'cat', idle: { frames: [0, 0, 1, 0, 1], every: 0.5 }, talk: [{ dialog: 'murre_epilog' }] },
  vatte_ep: { id: 'vatte_ep', sprite: 'vatte', idle: { frames: [0, 1], every: 0.4 }, talk: [{ dialog: 'vatte_epilog' }] },

  // --- The small places on the map -------------------------------------------------------
  sten_anna: { id: 'sten_anna', sprite: 'gravsten', still: true, idle: { frames: [0], every: 1 }, talk: [{ dialog: 'sten_anna' }] },
  sten_per: { id: 'sten_per', sprite: 'gravsten', still: true, idle: { frames: [0], every: 1 }, talk: [{ dialog: 'sten_per' }] },
  sten_johan: { id: 'sten_johan', sprite: 'gravsten', still: true, idle: { frames: [0], every: 1 }, talk: [{ dialog: 'sten_johan' }] },
  sten_karin: {
    id: 'sten_karin', sprite: 'gravstenLutar', still: true, idle: { frames: [0], every: 1 },
    if: [{ notFlag: 'karins_sten_rubbad' }],
    talk: [{ dialog: 'sten_karin' }],
  },
  sten_karin_rubbad: {
    id: 'sten_karin_rubbad', sprite: 'gravstenFlyttad', still: true, idle: { frames: [0], every: 1 },
    if: [{ flag: 'karins_sten_rubbad' }],
    talk: [{ dialog: 'sten_karin_tom' }],
  },
  /** The cold charcoal stack: it takes a fireball (the Eld reading) to light it – talking won't. */
  kolmila: {
    id: 'kolmila', sprite: 'kolmila', still: true, idle: { frames: [0], every: 1 },
    if: [{ notFlag: 'kolmilan_tand' }],
    burns: { flag: 'kolmilan_tand', dialog: 'kolmila_tand' },
    talk: [
      { if: [{ spell: 'eld' }], dialog: 'kolmila_eld' },
      { dialog: 'kolmila_kall' },
    ],
  },
  /** Lit: it just glows, with nothing more to say. */
  kolmila_glod: {
    id: 'kolmila_glod', sprite: 'kolmila', still: true, idle: { frames: [1], every: 1 },
    if: [{ flag: 'kolmilan_tand' }],
    smoke: true,
    talk: [],
  },
  grafru: {
    id: 'grafru', sprite: 'grafru', idle: { frames: [0, 0, 2, 0], every: 0.9 },
    if: [{ notFlag: 'grafru_frid' }],
    talk: [
      { if: [{ item: 'prastkragar' }], dialog: 'grafru_tack' },
      { if: [{ flag: 'grafru_bad' }], dialog: 'grafru_vantar' },
      { dialog: 'grafru_ber' },
    ],
  },
  // --- The lake ---
  eremit: {
    id: 'eremit', sprite: 'fiskare', idle: { frames: [0, 0, 0, 2, 0, 1, 0], every: 0.9 },
    talk: [{ if: [{ flag: 'eremit_traffad' }], dialog: 'eremit_igen' }, { dialog: 'eremit_forsta' }],
  },
  /** Dagmar's signal stone: with the torch, Dagny can flash her signal across the lake. */
  signalsten: {
    id: 'signalsten', sprite: 'runsten', still: true, idle: { frames: [0], every: 1 },
    talk: [
      { if: [{ flag: 'signalen_besvarad' }], dialog: 'signalsten_besvarad' },
      { if: [{ item: 'ficklampa' }], dialog: 'signalsten_ficklampa' },
      { dialog: 'signalsten_las' },
    ],
  },
  runsten: {
    id: 'runsten', sprite: 'runsten', still: true, idle: { frames: [0], every: 1 },
    if: [{ notFlag: 'runstenen_hel' }],
    talk: [
      { if: [{ item: 'runbit' }], dialog: 'runsten_laga' },
      { dialog: 'runsten_trasig' },
    ],
  },
  runsten_hel: {
    id: 'runsten_hel', sprite: 'runsten', still: true, idle: { frames: [1], every: 1 },
    if: [{ flag: 'runstenen_hel' }],
    talk: [{ dialog: 'runsten_hel' }],
  },
  postiljon: {
    id: 'postiljon', sprite: 'postiljon', idle: { frames: [0, 0, 1, 0], every: 0.8 },
    talk: [
      { if: [{ item: 'posthorn' }], dialog: 'postiljon_tack' },
      { if: [{ flag: 'posthorn_klar' }], dialog: 'postiljon_frid' },
      { if: [{ flag: 'postiljon_bad' }], dialog: 'postiljon_vantar' },
      { dialog: 'postiljon_ber' },
    ],
  },
  kalla: {
    id: 'kalla', sprite: 'kalla', still: true, idle: { frames: [0], every: 1 },
    if: [{ notFlag: 'kallan_rensad' }],
    talk: [{ dialog: 'kalla_igensatt' }],
  },
  kalla_ren: {
    id: 'kalla_ren', sprite: 'kalla', still: true, idle: { frames: [1], every: 1 },
    if: [{ flag: 'kallan_rensad' }],
    talk: [{ dialog: 'kalla_drick' }],
  },
};
