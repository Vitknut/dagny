import type { DialogDef } from '../types';

/** Temple 1: Stenkyrkans krypta and Kyrkogrimmen. */
export const KRYPTA: Record<string, DialogDef> = {
  krypta_skylt1: {
    pages: ['En inskription i stenen:\n"Här vilar grimmen som vaktar kyrkan. Väck honom ej med vrede."'],
  },

  krypta_skylt2: {
    pages: ['En nästan bortnött rad:\n"...da, Väktare. Hon tände ljusen här varje midsommar."'],
  },

  krypta_skylt3: {
    pages: ['Någon har ristat en liten sol i väggen. Under den, med barnslig handstil: "ny dag".'],
  },

  grim_vaknar: {
    speaker: 'Kyrkogrimmen',
    pages: ['VEM STÖR... KYRKANS VILA... DE HAR GLÖMT OSS... ALLA HAR GLÖMT...'],
  },

  grim_forlikad: {
    speaker: 'Kyrkogrimmen',
    pages: [
      '...Klockans kläpp. Jag känner igen klangen. Du bär den förra Väktarens klinga.',
      'Förlåt mig, barn. Jag har vaktat så länge i mörkret att jag glömde varför.',
      'Ta ekan som vilar på altaret. Den bar henne över sjön en gång. Nu bär den dig.',
    ],
  },

  fick_eka: {
    pages: [
      'Dagny fick EKAN!\nNu kan hon ro över vatten på kartan.',
      'Ett varmt ljus sprider sig genom kryptan. En bit av sommarljuset har kommit tillbaka till bygden.',
      'Med ekan kan Dagny ro över den stora sjön öster om byn. På norra stranden ligger gruvsamhället, och bortom det den gamla gruvan.',
    ],
    actions: [{ type: 'flag', flag: 'krypta_klar' }],
  },
};
