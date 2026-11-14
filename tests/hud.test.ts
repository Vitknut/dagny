import { describe, expect, it } from 'vitest';
import { spellLines } from '../src/game/hud';

describe('the magic lines in the HUD', () => {
  it('the selected reading burning in the room is written once, lit', () => {
    expect(spellLines('lyse', ['lyse'])).toEqual({ selected: 'lyse', lit: true, others: [] });
  });

  it('another reading still burning gets its own line below', () => {
    expect(spellLines('lakning', ['lyse'])).toEqual({ selected: 'lakning', lit: false, others: ['lyse'] });
    expect(spellLines('lyse', ['skydd', 'lyse', 'hopp'])).toEqual({ selected: 'lyse', lit: true, others: ['skydd', 'hopp'] });
  });

  it('nothing selected, nothing burning: nothing to write', () => {
    expect(spellLines(null, [])).toEqual({ selected: null, lit: false, others: [] });
  });
});
