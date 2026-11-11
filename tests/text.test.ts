import { describe, expect, it } from 'vitest';
import { measure, wrap } from '../src/engine/text';
import { GLYPHS, parseGlyph, FONT_HEIGHT } from '../src/art/font';
import { BUTTONS, INPUT_SOURCES, fillButtons } from '../src/data/buttons';
import { DIALOG } from '../src/data/dialog';

describe('bitmap font', () => {
  it('has å, ä and ö in both cases', () => {
    for (const ch of 'åäöÅÄÖ') expect(GLYPHS[ch]).toBeDefined();
  });

  it('every glyph fits the cell and has even rows', () => {
    for (const [ch, src] of Object.entries(GLYPHS)) {
      const g = parseGlyph(src);
      expect(g.top + g.rows.length, `glyph ${ch}`).toBeLessThanOrEqual(FONT_HEIGHT);
      for (const r of g.rows) expect(r.length, `glyph ${ch}`).toBe(g.w);
    }
  });

  it('measures and wraps text', () => {
    expect(measure('')).toBe(0);
    expect(measure('i')).toBe(1);
    expect(measure('ii')).toBe(3);
    const lines = wrap('Dagny går över myren mot Stenkyrkan i norr', 60);
    expect(lines.length).toBeGreaterThan(1);
    for (const l of lines) expect(measure(l)).toBeLessThanOrEqual(60);
    expect(wrap('ett\ntvå', 200)).toEqual(['ett', 'två']);
  });
});

describe('button names in dialogs', () => {
  it('no page names a key or a button outright; it says {svard}, {magi} or {hopp}', () => {
    for (const [id, d] of Object.entries(DIALOG)) {
      for (const p of d.pages) expect(p, id).not.toMatch(/-knappen|-tangenten|X \/ B|C \/ Y/);
    }
  });

  it('every {name} in a page is a known button, and each reads differently on phone, keyboard and gamepad', () => {
    for (const [id, d] of Object.entries(DIALOG)) {
      for (const p of d.pages) for (const [, name] of p.matchAll(/\{(\w+)\}/g)) expect(BUTTONS[name], `${id}: {${name}}`).toBeDefined();
    }
    for (const b of Object.values(BUTTONS)) expect(new Set(INPUT_SOURCES.map((s) => b[s])).size).toBe(3);
    expect(fillButtons('Slå med {svard}.', 'touch')).toBe('Slå med SVÄRD-knappen.');
    expect(fillButtons('Slå med {svard}.', 'keyboard')).toBe('Slå med X-tangenten.');
  });
});
