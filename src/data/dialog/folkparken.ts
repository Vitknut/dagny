import type { DialogDef } from '../types';

/** Temple 5: Folkparken om natten and Spelmannen. */
export const FOLKPARKEN: Record<string, DialogDef> = {
  park_skylt1: {
    pages: ['En affisch på planket, blekt av sol:\n"DANS I FOLKPARKEN VARJE LÖRDAG. ORKESTERN SPELAR TILL GRYNINGEN."'],
  },

  park_slingor: {
    pages: ['Ljusslingorna över dansbanan hänger döda. Någon har skrivit på en lapp:\n"STRÖMMEN GICK I MAJ. ELEKTRIKERN KOMMER I HÖST."'],
  },
  park_skylt2: {
    pages: ['Ett gammalt fotografi är fastnubbat vid dansbanan. En kvinna med kopparfärgat hår dansar med ett irrbloss. Hon skrattar.'],
  },

  spelman_vaknar: {
    speaker: 'Spelmannen',
    pages: ['Förr dansade de till min fiol tills solen gick upp. Nu sitter de hemma framför sina apparater. Kom, lilla vän. Dansa!'],
  },

  spelman_forlikad: {
    speaker: 'Spelmannen',
    pages: [
      'Du dansade inte när jag spelade... men du gick i takt ändå. Hon gjorde också så.',
      'Hon brukade lyssna efter mig mellan stationerna på sin radio. När ingen annan hörde, så hörde hon.',
      'Ta den. Där bruset är som starkast finns det vägar som andra har glömt.',
    ],
  },

  fick_radio: {
    pages: [
      'Dagny fick TRANSISTORRADION!\nVäggar som surrar i bruset går nu att gå igenom.',
      'Ljusslingorna tänds över dansbanan, en efter en. En bit till av sommarljuset har kommit tillbaka.',
      'I berget norr om Mormors by finns ett pass som inte syns. Men radion brusar när man kommer nära. Där uppe ligger fäbodarna.',
    ],
    actions: [{ type: 'flag', flag: 'folkparken_klar' }],
  },
};
