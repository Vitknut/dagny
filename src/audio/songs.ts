import type { SongDef } from '../engine/audio';

/**
 * All music is original and stored as notes. Lengths are in sixteenth notes
 * ("e5:4" = a quarter note E5). "r" is a rest; drums use k (kick), s (snare)
 * and h (hi-hat). Bars are separated by "|" for readability only.
 */
export const SONGS: Record<string, SongDef> = {
  /** "Ny dag" – a slow visa in A minor for the title screen. */
  titel: {
    bpm: 84,
    loop: true,
    tracks: [
      {
        inst: 'harp', vol: 0.9,
        notes: `a4:4 c5:4 e5:4 | d5:6 c5:2 b4:4 | a4:4 b4:4 c5:4 | e5:12 |
                f5:4 e5:4 d5:4 | c5:6 b4:2 a4:4 | g#4:4 a4:4 b4:4 | a4:12 |
                c5:4 e5:4 a5:4 | g5:6 f5:2 e5:4 | f5:4 e5:4 d5:4 | e5:12 |
                d5:4 c5:4 b4:4 | c5:6 b4:2 a4:4 | e4:4 g#4:4 b4:4 | a4:12`,
      },
      {
        inst: 'accordion', vol: 0.45,
        notes: `r:4 c4:4 e4:4 | r:4 b3:4 d4:4 | r:4 c4:4 e4:4 | r:4 g#3:4 b3:4 |
                r:4 a3:4 d4:4 | r:4 c4:4 e4:4 | r:4 g#3:4 d4:4 | r:4 c4:4 e4:4 |
                r:4 c4:4 e4:4 | r:4 c4:4 e4:4 | r:4 a3:4 d4:4 | r:4 g#3:4 b3:4 |
                r:4 b3:4 d4:4 | r:4 c4:4 e4:4 | r:4 g#3:4 b3:4 | r:4 c4:4 e4:4`,
      },
      {
        inst: 'bass', vol: 0.8,
        notes: `a2:12 | g2:12 | a2:12 | e2:12 | d2:12 | a2:12 | e2:12 | a2:12 |
                a2:12 | c3:12 | d3:12 | e2:12 | g2:12 | a2:12 | e2:12 | a2:12`,
      },
    ],
  },

  /** "Mormors polska" – D minor, for the village. */
  by: {
    bpm: 100,
    loop: true,
    tracks: [
      {
        inst: 'harp', vol: 0.85,
        notes: `d5:3 e5:1 f5:2 e5:2 d5:2 a4:2 | bb4:2 a4:2 g4:2 a4:2 bb4:2 c5:2 |
                d5:3 e5:1 f5:2 g5:2 a5:2 f5:2 | e5:4 c5:4 a4:4 |
                g5:3 f5:1 e5:2 f5:2 g5:2 e5:2 | f5:3 e5:1 d5:2 e5:2 f5:2 d5:2 |
                e5:2 c#5:2 a4:2 b4:2 c#5:2 e5:2 | d5:8 r:4 |
                f5:2 a5:2 c6:2 a5:2 f5:2 a5:2 | g5:3 a5:1 bb5:2 a5:2 g5:2 f5:2 |
                e5:2 g5:2 bb5:2 g5:2 e5:2 g5:2 | f5:4 c5:4 a4:4 |
                d5:2 f5:2 a5:2 f5:2 d5:2 f5:2 | e5:3 f5:1 g5:2 f5:2 e5:2 d5:2 |
                c#5:2 e5:2 a5:2 g5:2 e5:2 c#5:2 | d5:8 r:4`,
      },
      {
        inst: 'accordion', vol: 0.5,
        notes: `r:4 f4:4 a4:4 | r:4 g4:4 bb4:4 | r:4 f4:4 a4:4 | r:4 e4:4 a4:4 |
                r:4 e4:4 g4:4 | r:4 f4:4 a4:4 | r:4 e4:4 g4:4 | r:4 f4:4 a4:4 |
                r:4 a4:4 c5:4 | r:4 g4:4 bb4:4 | r:4 g4:4 bb4:4 | r:4 a4:4 c5:4 |
                r:4 f4:4 a4:4 | r:4 g4:4 bb4:4 | r:4 e4:4 g4:4 | r:4 f4:4 a4:4`,
      },
      {
        inst: 'bass', vol: 0.8,
        notes: `d3:4 a2:4 d3:4 | g2:4 d3:4 g2:4 | d3:4 a2:4 d3:4 | a2:4 e3:4 a2:4 |
                c3:4 g2:4 c3:4 | d3:4 a2:4 d3:4 | a2:4 e3:4 a2:4 | d3:4 a2:4 d3:4 |
                f2:4 c3:4 f2:4 | c3:4 g2:4 c3:4 | c3:4 g2:4 c3:4 | f2:4 c3:4 f2:4 |
                d3:4 a2:4 d3:4 | g2:4 d3:4 g2:4 | a2:4 e3:4 a2:4 | d3:4 a2:4 d3:4`,
      },
      { inst: 'drum', vol: 0.4, notes: 'k:4 h:4 h:4 '.repeat(16) },
    ],
  },

  /**
   * "Vägen ut" – the overworld: a driving adventure march in D minor for
   * NES-style pulse waves, galloping octave bass and snappy drums.
   */
  karta: {
    bpm: 150,
    loop: true,
    tracks: [
      {
        inst: 'pulse', vol: 0.9,
        notes: `d5:3 a4:1 d5:2 f5:2 e5:4 d5:2 c5:2 | d5:6 a4:2 bb4:4 c5:4 | d5:3 a4:1 d5:2 f5:2 g5:4 f5:2 e5:2 | a5:12 r:2 a5:2 |
                bb5:3 a5:1 g5:2 f5:2 g5:4 f5:2 e5:2 | f5:6 e5:2 d5:4 c5:4 | bb4:3 c5:1 d5:2 e5:2 f5:2 e5:2 c#5:4 | d5:12 r:4 |
                f5:2 f5:2 r:2 f5:2 a5:4 g5:2 f5:2 | e5:2 e5:2 r:2 e5:2 g5:4 f5:2 e5:2 | d5:2 d5:2 r:2 d5:2 f5:4 e5:2 d5:2 | c#5:4 e5:4 a5:8 |
                bb5:3 a5:1 bb5:2 c6:2 d6:4 c6:2 bb5:2 | a5:3 g5:1 a5:2 bb5:2 c6:4 a5:4 | g5:2 a5:2 bb5:2 a5:2 g5:2 f5:2 e5:2 c#5:2 | d5:8 r:4 a4:2 c#5:2`,
      },
      { inst: 'pulse2', vol: 0.55, notes: 'd4:2 f4:2 a4:2 f4:2 d4:2 f4:2 a4:2 f4:2 | bb3:2 d4:2 f4:2 d4:2 bb3:2 d4:2 f4:2 d4:2 | d4:2 f4:2 a4:2 f4:2 d4:2 f4:2 a4:2 f4:2 | f4:2 a4:2 c5:2 a4:2 f4:2 a4:2 c5:2 a4:2 | g4:2 bb4:2 d5:2 bb4:2 g4:2 bb4:2 d5:2 bb4:2 | d4:2 f4:2 a4:2 f4:2 d4:2 f4:2 a4:2 f4:2 | a3:2 c#4:2 e4:2 c#4:2 a3:2 c#4:2 e4:2 c#4:2 | d4:2 f4:2 a4:2 f4:2 d4:2 f4:2 a4:2 f4:2 | f4:2 a4:2 c5:2 a4:2 f4:2 a4:2 c5:2 a4:2 | c4:2 e4:2 g4:2 e4:2 c4:2 e4:2 g4:2 e4:2 | d4:2 f4:2 a4:2 f4:2 d4:2 f4:2 a4:2 f4:2 | a3:2 c#4:2 e4:2 c#4:2 a3:2 c#4:2 e4:2 c#4:2 | bb3:2 d4:2 f4:2 d4:2 bb3:2 d4:2 f4:2 d4:2 | f4:2 a4:2 c5:2 a4:2 f4:2 a4:2 c5:2 a4:2 | g4:2 bb4:2 d5:2 bb4:2 g4:2 bb4:2 d5:2 bb4:2 | d4:2 f4:2 a4:2 f4:2 d4:2 f4:2 a4:2 f4:2' },
      { inst: 'bass', vol: 0.95, notes: 'd2:2 d3:2 d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 | bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 | d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 | f2:2 f3:2 f2:2 f3:2 f2:2 f3:2 f2:2 f3:2 | g2:2 g3:2 g2:2 g3:2 g2:2 g3:2 g2:2 g3:2 | d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 | a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 | d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 | f2:2 f3:2 f2:2 f3:2 f2:2 f3:2 f2:2 f3:2 | c2:2 c3:2 c2:2 c3:2 c2:2 c3:2 c2:2 c3:2 | d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 | a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 | bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 | f2:2 f3:2 f2:2 f3:2 f2:2 f3:2 f2:2 f3:2 | g2:2 g3:2 g2:2 g3:2 g2:2 g3:2 g2:2 g3:2 | d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 d2:2 d3:2' },
      { inst: 'drum', vol: 0.45, notes: 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 '.repeat(16) },
    ],
  },

  /**
   * "Möte" – a fight on the map: "Grottan" with its heart beating faster. The
   * same sad A minor line and its echo, but at a run, over a pulsing octave
   * bass and soft drums.
   */
  mote: {
    bpm: 124,
    loop: true,
    tracks: [
      { inst: 'pulse', vol: 0.75, notes: 'e5:4 r:2 a4:2 c5:4 b4:4 | a4:8 r:8 | f5:4 r:2 c5:2 e5:4 d5:4 | c5:8 b4:4 r:4 | e5:4 r:2 a5:2 g5:4 e5:4 | f5:6 e5:2 d5:4 c5:4 | b4:4 r:2 g#4:2 b4:4 d5:4 | c5:4 b4:4 a4:8' },
      { inst: 'pulse2', vol: 0.32, notes: 'r:3 e5:4 r:2 a4:2 c5:4 b4:4 a4:8 r:8 f5:4 r:2 c5:2 e5:4 d5:4 c5:8 b4:4 r:4 e5:4 r:2 a5:2 g5:4 e5:4 f5:6 e5:2 d5:4 c5:4 b4:4 r:2 g#4:2 b4:4 d5:4 c5:4 b4:4 a4:5' },
      { inst: 'bass', vol: 0.85, notes: 'a2:2 a3:2 a2:2 a3:2 a2:2 a3:2 a2:2 a3:2 | a2:2 a3:2 a2:2 a3:2 a2:2 a3:2 a2:2 a3:2 | f2:2 f3:2 f2:2 f3:2 f2:2 f3:2 f2:2 f3:2 | e2:2 e3:2 e2:2 e3:2 e2:2 e3:2 e2:2 e3:2 | a2:2 a3:2 a2:2 a3:2 a2:2 a3:2 a2:2 a3:2 | d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 | e2:2 e3:2 e2:2 e3:2 e2:2 e3:2 e2:2 e3:2 | a2:2 a3:2 a2:2 a3:2 a2:2 a3:2 a2:2 a3:2' },
      { inst: 'bell', vol: 0.3, notes: 'r:6 e6:1 r:9 | r:12 a6:1 r:3 | r:16 | r:4 c6:1 r:7 g6:1 r:3 | r:9 e6:1 r:6 | r:16 | r:2 b5:1 r:10 e6:1 r:2 | r:16' },
      { inst: 'drum', vol: 0.4, notes: 'k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:1 h:1 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:1 h:1 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:1 h:1 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:1 h:1 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:1 h:1 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:1 h:1 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:1 h:1 k:2 h:2 s:2 h:2 s:1 s:1 s:2 s:1 s:1 k:2' },
    ],
  },
  /**
   * "Den glömda platsen" – the small places on the map (the old smithy, the
   * churchyard, the charcoal croft, the skerries): a slow lament in plain D
   * minor, the flute falling and falling over slow harp, a low organ and a
   * bell far off now and then. Something happened here once.
   */
  plats: {
    bpm: 64,
    loop: true,
    tracks: [
      {
        inst: 'flute', vol: 0.7,
        notes: `a4:6 d5:2 f5:4 e5:4 | d5:8 f5:4 d5:4 | g5:6 f5:2 d5:4 bb4:4 | a4:12 r:4 |
                a4:6 d5:2 f5:4 a5:4 | g5:4 f5:4 e5:4 c5:4 | d5:6 c5:2 bb4:4 g4:4 | a4:6 g4:2 a4:8`,
      },
      { inst: 'harp', vol: 0.42, notes: 'd3:2 a3:2 d4:2 f4:2 a4:2 f4:2 d4:2 a3:2 | bb2:2 f3:2 bb3:2 d4:2 f4:2 d4:2 bb3:2 f3:2 | g2:2 d3:2 g3:2 bb3:2 d4:2 bb3:2 g3:2 d3:2 | a2:2 e3:2 a3:2 c4:2 e4:2 c4:2 a3:2 e3:2 | d3:2 a3:2 d4:2 f4:2 a4:2 f4:2 d4:2 a3:2 | f2:2 c3:2 f3:2 a3:2 c4:2 a3:2 f3:2 c3:2 | g2:2 d3:2 g3:2 bb3:2 d4:2 bb3:2 g3:2 d3:2 | a2:2 e3:2 a3:2 c4:2 e4:2 c4:2 a3:2 e3:2' },
      { inst: 'organ', vol: 0.34, notes: 'd2:16 | bb1:16 | g1:16 | a1:16 | d2:16 | f1:16 | g1:16 | a1:16' },
      { inst: 'bell', vol: 0.26, notes: 'r:12 a5:1 r:3 | r:16 | r:8 d5:1 r:7 | r:16 | r:4 f5:1 r:11 | r:16 | r:10 bb4:1 r:5 | r:16' },
    ],
  },
  /**
   * "Grottan" – caves on the road: a slow A minor line that echoes off the
   * rock, a low drone and water dripping somewhere in the dark.
   */
  grotta: {
    bpm: 92,
    loop: true,
    tracks: [
      { inst: 'pulse', vol: 0.7, notes: 'e5:4 r:2 a4:2 c5:4 b4:4 | a4:8 r:8 | f5:4 r:2 c5:2 e5:4 d5:4 | c5:8 b4:4 r:4 | e5:4 r:2 a5:2 g5:4 e5:4 | f5:6 e5:2 d5:4 c5:4 | b4:4 r:2 g#4:2 b4:4 d5:4 | c5:4 b4:4 a4:8' },
      { inst: 'pulse2', vol: 0.35, notes: 'r:3 e5:4 r:2 a4:2 c5:4 b4:4 a4:8 r:8 f5:4 r:2 c5:2 e5:4 d5:4 c5:8 b4:4 r:4 e5:4 r:2 a5:2 g5:4 e5:4 f5:6 e5:2 d5:4 c5:4 b4:4 r:2 g#4:2 b4:4 d5:4 c5:4 b4:4 a4:5' },
      { inst: 'organ', vol: 0.4, notes: 'a2:16 | a2:16 | f2:16 | e2:16 | a2:16 | d2:16 | e2:16 | a2:16' },
      { inst: 'bell', vol: 0.35, notes: 'r:6 e6:1 r:9 | r:12 a6:1 r:3 | r:16 | r:4 c6:1 r:7 g6:1 r:3 | r:9 e6:1 r:6 | r:16 | r:2 b5:1 r:10 e6:1 r:2 | r:16' },
    ],
  },
  /** "Skogsstigen" – E minor on the pulse lead, for paths, caves and encounters on the road. */
  stig: {
    bpm: 132,
    loop: true,
    tracks: [
      {
        inst: 'pulse', vol: 0.85,
        notes: `e5:2 b4:2 g4:2 b4:2 e5:2 f#5:2 | g5:4 f#5:2 e5:4 b4:2 |
                d5:2 a4:2 f#4:2 a4:2 d5:2 e5:2 | f#5:4 e5:2 d5:4 r:2 |
                c5:2 e5:2 g5:2 e5:2 c5:2 e5:2 | b4:2 d5:2 g5:2 d5:2 b4:2 d5:2 |
                a4:2 c5:2 e5:2 d#5:2 f#5:2 a5:2 | g5:4 f#5:2 e5:6`,
      },
      {
        inst: 'bass', vol: 0.8,
        notes: 'e2:6 b2:6 | e2:6 b2:6 | d2:6 a2:6 | d2:6 a2:6 | c3:6 g2:6 | g2:6 d3:6 | a2:6 b2:6 | e2:12',
      },
      { inst: 'drum', vol: 0.35, notes: 'k:2 h:2 h:2 s:2 h:2 h:2 '.repeat(8) },
    ],
  },


  /**
   * Väktarstriden – the guardians' battle, in the way of Zelda II's boss
   * music but with our own notes: two pulse voices a fourth apart, a short
   * cell climbing out of the Väktarmotiv that sinks a step at a time
   * (A – G – F – E, the temple's lament bass), a bass pumping root and
   * fifth, and then the motif itself an octave up over the same descent.
   */
  boss: {
    bpm: 160,
    loop: true,
    tracks: [
      {
        inst: 'pulse', vol: 0.95,
        notes: `a4:2 c5:2 e5:2 f5:2 e5:2 r:2 c5:1 b4:1 a4:2 | a4:2 c5:2 e5:2 g#5:2 a5:2 g#5:2 e5:2 r:2 | g4:2 a#4:2 d5:2 d#5:2 d5:2 r:2 a#4:1 a4:1 g4:2 | g4:2 a#4:2 d5:2 f#5:2 g5:2 f#5:2 d5:2 r:2 | f4:2 g#4:2 c5:2 c#5:2 c5:2 r:2 g#4:1 g4:1 f4:2 | f4:2 g#4:2 c5:2 e5:2 f5:2 e5:2 c5:2 r:2 | e4:2 g#4:2 b4:2 c5:2 b4:2 r:2 g#4:1 f#4:1 e4:2 | e4:2 g#4:2 b4:2 d5:2 e5:2 f5:2 g#5:2 b5:2 |
                a5:3 e5:1 a5:3 e5:1 c6:2 b5:4 g#5:1 a5:1 | e6:4 d6:2 c6:2 b5:4 a5:4 | g5:3 d5:1 g5:3 d5:1 a#5:2 a5:4 f#5:1 g5:1 | d6:4 c6:2 a#5:2 a5:4 g5:4 | f5:3 c5:1 f5:3 c5:1 g#5:2 g5:4 e5:1 f5:1 | c6:4 a#5:2 g#5:2 g5:4 f5:4 | e5:2 f5:2 g#5:2 a5:2 b5:2 c6:2 d6:2 e6:2 | f6:4 e6:4 d#6:2 e6:2 r:4`,
      },
      { inst: 'pulse2', vol: 0.55, shift: -5, notes: `a4:2 c5:2 e5:2 f5:2 e5:2 r:2 c5:1 b4:1 a4:2 | a4:2 c5:2 e5:2 g#5:2 a5:2 g#5:2 e5:2 r:2 | g4:2 a#4:2 d5:2 d#5:2 d5:2 r:2 a#4:1 a4:1 g4:2 | g4:2 a#4:2 d5:2 f#5:2 g5:2 f#5:2 d5:2 r:2 | f4:2 g#4:2 c5:2 c#5:2 c5:2 r:2 g#4:1 g4:1 f4:2 | f4:2 g#4:2 c5:2 e5:2 f5:2 e5:2 c5:2 r:2 | e4:2 g#4:2 b4:2 c5:2 b4:2 r:2 g#4:1 f#4:1 e4:2 | e4:2 g#4:2 b4:2 d5:2 e5:2 f5:2 g#5:2 b5:2 |
                a5:3 e5:1 a5:3 e5:1 c6:2 b5:4 g#5:1 a5:1 | e6:4 d6:2 c6:2 b5:4 a5:4 | g5:3 d5:1 g5:3 d5:1 a#5:2 a5:4 f#5:1 g5:1 | d6:4 c6:2 a#5:2 a5:4 g5:4 | f5:3 c5:1 f5:3 c5:1 g#5:2 g5:4 e5:1 f5:1 | c6:4 a#5:2 g#5:2 g5:4 f5:4 | e5:2 f5:2 g#5:2 a5:2 b5:2 c6:2 d6:2 e6:2 | f6:4 e6:4 d#6:2 e6:2 r:4` },
      { inst: 'bass', vol: 1, notes: 'a1:2 a2:2 a1:2 a2:2 e2:2 a2:2 a1:2 e2:2 | a1:2 a2:2 a1:2 a2:2 e2:2 a2:2 a1:2 e2:2 | g1:2 g2:2 g1:2 g2:2 d2:2 g2:2 g1:2 d2:2 | g1:2 g2:2 g1:2 g2:2 d2:2 g2:2 g1:2 d2:2 | f1:2 f2:2 f1:2 f2:2 c2:2 f2:2 f1:2 c2:2 | f1:2 f2:2 f1:2 f2:2 c2:2 f2:2 f1:2 c2:2 | e1:2 e2:2 e1:2 e2:2 b1:2 e2:2 e1:2 b1:2 | e1:2 e2:2 e1:2 e2:2 b1:2 e2:2 e1:2 b1:2 | a1:2 a2:2 a1:2 a2:2 e2:2 a2:2 a1:2 e2:2 | a1:2 a2:2 a1:2 a2:2 e2:2 a2:2 a1:2 e2:2 | g1:2 g2:2 g1:2 g2:2 d2:2 g2:2 g1:2 d2:2 | g1:2 g2:2 g1:2 g2:2 d2:2 g2:2 g1:2 d2:2 | f1:2 f2:2 f1:2 f2:2 c2:2 f2:2 f1:2 c2:2 | f1:2 f2:2 f1:2 f2:2 c2:2 f2:2 f1:2 c2:2 | e1:2 e2:2 e1:2 e2:2 b1:2 e2:2 e1:2 b1:2 | e1:2 e2:2 e1:2 e2:2 b1:2 e2:2 e1:2 b1:2' },
      { inst: 'drum', vol: 0.55, notes: 'k:2 h:1 h:1 s:2 k:1 h:1 '.repeat(32) },
    ],
  },

  /**
   * A temple restored: the Väktarmotiv once more, but in C major – the
   * guardians are at peace.
   */
  seger: {
    bpm: 120,
    loop: false,
    tracks: [
      { inst: 'pulse', vol: 1, notes: 'c5:3 g4:1 c5:3 g4:1 e5:2 g5:4 a5:1 b5:1 c6:16' },
      { inst: 'pulse2', vol: 0.6, notes: 'e4:3 e4:1 e4:3 e4:1 g4:2 b4:4 c5:1 d5:1 e5:16' },
      { inst: 'bass', vol: 0.9, notes: 'c3:4 c3:4 c3:2 g2:4 g2:2 c2:16' },
      { inst: 'drum', vol: 0.5, notes: 'k:3 k:1 k:3 k:1 s:2 k:4 s:1 s:1 k:16' },
    ],
  },

  /** Something found – a container, a doll, a lost thing: a quick rising call. */
  fynd: {
    bpm: 150,
    loop: false,
    tracks: [
      { inst: 'pulse', vol: 1, notes: 'g5:1 a5:1 b5:1 d6:1 g6:6' },
      { inst: 'pulse2', vol: 0.6, notes: 'b4:1 c5:1 d5:1 f#5:1 b5:6' },
      { inst: 'bass', vol: 0.8, notes: 'g2:4 g2:6' },
    ],
  },
  /** Something learned – a reading, a skill, a level: Dagny's theme (a c e) turned major. */
  lara: {
    bpm: 140,
    loop: false,
    tracks: [
      { inst: 'pulse', vol: 1, notes: 'a4:2 c#5:2 e5:2 a5:8' },
      { inst: 'pulse2', vol: 0.6, notes: 'e4:2 a4:2 c#5:2 e5:8' },
      { inst: 'bass', vol: 0.8, notes: 'a2:6 a1:8' },
    ],
  },
  /** Falling asleep. */
  somnar: {
    bpm: 72,
    loop: false,
    tracks: [
      { inst: 'harp', vol: 0.8, notes: 'a4:4 g4:4 e4:4 d4:4 c4:8 b3:4 a3:16' },
      { inst: 'bass', vol: 0.6, notes: 'a2:8 f2:8 e2:8 a2:16' },
    ],
  },

  /** Ending card – sunrise. */
  soluppgang: {
    bpm: 80,
    loop: true,
    tracks: [
      { inst: 'flute', vol: 0.8, notes: 'c5:4 e5:4 g5:4 | a5:8 g5:4 | f5:4 e5:4 d5:4 | e5:12 | c5:4 e5:4 g5:4 | c6:8 b5:4 | a5:4 g5:4 f5:4 | g5:12' },
      { inst: 'accordion', vol: 0.4, notes: 'r:4 e4:4 g4:4 | r:4 f4:4 a4:4 | r:4 f4:4 a4:4 | r:4 e4:4 g4:4 | r:4 e4:4 g4:4 | r:4 e4:4 a4:4 | r:4 f4:4 a4:4 | r:4 f4:4 b4:4' },
      { inst: 'bass', vol: 0.7, notes: 'c3:12 | f2:12 | d3:12 | c3:12 | c3:12 | a2:12 | f2:12 | g2:12' },
    ],
  },

  /** "Lavtornsschottis" – a G major schottis for Gruvsamhället. */
  gruvby: {
    bpm: 108,
    loop: true,
    tracks: [
      {
        inst: 'accordion', vol: 0.55,
        notes: `g4:3 b4:1 d5:4 b4:4 g4:4 | a4:3 c5:1 e5:4 c5:4 a4:4 | b4:3 d5:1 g5:4 f#5:4 e5:4 | d5:12 r:4 |
                e5:3 d5:1 c5:4 e5:4 c5:4 | d5:3 c5:1 b4:4 d5:4 b4:4 | c5:4 a4:4 f#4:4 a4:4 | g4:12 r:4`,
      },
      {
        inst: 'flute', vol: 0.4,
        notes: `r:16 | r:16 | r:8 d6:4 c6:4 | b5:8 a5:8 |
                g5:8 e5:8 | f#5:8 d5:8 | e5:4 d5:4 c5:4 a4:4 | b4:12 r:4`,
      },
      { inst: 'bass', vol: 0.8, notes: 'g2:8 d3:8 | a2:8 e3:8 | g2:8 b2:8 | d3:8 a2:8 | c3:8 g2:8 | g2:8 d3:8 | d3:8 d2:8 | g2:8 d3:8' },
      { inst: 'drum', vol: 0.35, notes: 'k:4 h:4 s:4 h:4 '.repeat(8) },
    ],
  },

  // Temples 2–7 have their own themes once built; until then they derive
  // variations of existing tunes so the data model is complete.
  /**
   * "Väktarnas salar" – the one temple theme for the six temples, as in the
   * old games, in four parts (our own melody, built like the old palace
   * themes): the Väktarmotiv riff; a fast part of unbroken eighths in broken
   * chords over a bass falling by half steps (A–G#–G–F#–F–E); a calmer part,
   * six eighths and a held note answered by a long note and a rise, sung
   * twice over with a second voice a third below; and a build of syncopated
   * eighths and quarters, then sixteenths, back into the riff.
   */
  tempel: {
    bpm: 140,
    loop: true,
    tracks: [
      {
        inst: 'pulse', vol: 0.9,
        notes: `a4:3 e4:1 a4:3 e4:1 c5:2 b4:4 g#4:1 a4:1 | a4:3 e4:1 a4:3 e4:1 d5:2 c5:4 b4:1 g#4:1 | a4:3 e4:1 a4:3 e4:1 c5:2 b4:4 g#4:1 a4:1 | a4:3 e4:1 a4:3 e4:1 d5:2 c5:4 b4:1 g#4:1 |
                a4:2 c5:2 e5:2 a5:2 e5:2 c5:2 a4:2 c5:2 | b4:2 e5:2 g#5:2 b5:2 g#5:2 e5:2 b4:2 e5:2 | c5:2 e5:2 g5:2 c6:2 g5:2 e5:2 c5:2 e5:2 | a4:2 d5:2 f#5:2 a5:2 f#5:2 d5:2 a4:2 d5:2 | a4:2 d5:2 f5:2 a5:2 f5:2 d5:2 a4:2 d5:2 | g#4:2 b4:2 e5:2 g#5:2 b5:2 g#5:2 e5:2 b4:2 | c5:2 e5:2 a5:2 c6:2 b5:2 a5:2 g#5:2 a5:2 | b5:2 g#5:2 e5:2 d5:2 c5:2 b4:2 a4:2 g#4:2 |
                e5:2 e5:2 e5:2 e5:2 d5:2 c5:2 b4:4 | a4:6 a4:2 a4:2 b4:2 c5:2 d5:2 | f5:2 f5:2 f5:2 f5:2 e5:2 d5:2 c5:4 | c5:6 c5:2 c5:2 d5:2 e5:2 f5:2 | d5:2 d5:2 d5:2 d5:2 c5:2 b4:2 a4:4 | g#4:6 g#4:2 a4:2 b4:2 c5:2 d5:2 | e5:2 e5:2 e5:2 e5:2 d5:2 c5:2 b4:4 | b4:6 a4:2 g#4:8 |
                d5:2 f5:2 a5:2 g5:4 f5:2 e5:4 | e5:2 g#5:2 b5:2 a5:4 g#5:2 f5:4 | f5:2 a5:2 c6:2 b5:4 a5:2 g#5:4 | b5:2 c6:1 b5:1 a5:2 g#5:2 e5:2 f5:1 e5:1 d5:2 b4:2`,
      },
      { inst: 'pulse2', vol: 0.6, notes: 'a3:3 e3:1 a3:3 e3:1 c4:2 b3:4 g#3:1 a3:1 | a3:3 e3:1 a3:3 e3:1 d4:2 c4:4 b3:1 g#3:1 | a3:3 e3:1 a3:3 e3:1 c4:2 b3:4 g#3:1 a3:1 | a3:3 e3:1 a3:3 e3:1 d4:2 c4:4 b3:1 g#3:1 | e4:16 | e4:16 | e4:8 d4:8 | d4:16 | d4:8 c4:8 | b3:16 | c4:16 | b3:16 | c5:2 c5:2 c5:2 c5:2 b4:2 a4:2 g4:4 | f4:6 f4:2 f4:2 g4:2 a4:2 b4:2 | d5:2 d5:2 d5:2 d5:2 c5:2 b4:2 a4:4 | a4:6 a4:2 a4:2 b4:2 c5:2 d5:2 | b4:2 b4:2 b4:2 b4:2 a4:2 g4:2 f4:4 | f4:6 f4:2 f4:2 g#4:2 a4:2 b4:2 | c5:2 c5:2 c5:2 c5:2 b4:2 a4:2 g4:4 | g#4:6 f4:2 f4:8 | b4:2 d5:2 f5:2 e5:4 d5:2 c5:4 | c5:2 f5:2 g#5:2 f5:4 f5:2 d5:4 | d5:2 f5:2 a5:2 g5:4 f5:2 f5:4 | g#5:2 a5:1 g#5:1 f5:2 f5:2 c5:2 d5:1 c5:1 b4:2 g#4:2' },
      { inst: 'bass', vol: 0.95, notes: 'a2:3 e2:1 a2:3 e2:1 c3:2 b2:4 g#2:1 a2:1 | a2:3 e2:1 a2:3 e2:1 d3:2 c3:4 b2:1 g#2:1 | a2:3 e2:1 a2:3 e2:1 c3:2 b2:4 g#2:1 a2:1 | a2:3 e2:1 a2:3 e2:1 d3:2 c3:4 b2:1 g#2:1 | a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 | g#1:2 g#2:2 g#1:2 g#2:2 g#1:2 g#2:2 g#1:2 g#2:2 | g1:2 g2:2 g1:2 g2:2 g1:2 g2:2 g1:2 g2:2 | f#1:2 f#2:2 f#1:2 f#2:2 f#1:2 f#2:2 f#1:2 f#2:2 | f1:2 f2:2 f1:2 f2:2 f1:2 f2:2 f1:2 f2:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | a1:8 e2:8 | a1:8 e2:8 | f1:8 c2:8 | f1:8 c2:8 | d2:8 a1:8 | e1:8 b1:8 | a1:8 e2:8 | e1:8 b1:8 | d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 d2:2 d3:2 | e2:2 e3:2 e2:2 e3:2 e2:2 e3:2 e2:2 e3:2 | f2:2 f3:2 f2:2 f3:2 f2:2 f3:2 f2:2 f3:2 | e2:2 e3:2 e2:2 e3:2 e2:2 e3:2 e2:2 e3:2' },
      { inst: 'drum', vol: 0.45, notes: 'k:3 k:1 k:3 k:1 s:2 k:4 s:1 s:1 '.repeat(4) + 'k:2 h:1 h:1 s:2 h:1 h:1 k:2 k:1 h:1 s:2 s:1 s:1 k:2 h:1 h:1 s:2 h:1 h:1 k:2 k:1 h:1 s:2 s:1 s:1 k:2 h:1 h:1 s:2 h:1 h:1 k:2 k:1 h:1 s:2 s:1 s:1 k:2 h:1 h:1 s:2 h:1 h:1 k:2 k:1 h:1 s:2 s:1 s:1 k:2 h:1 h:1 s:2 h:1 h:1 k:2 k:1 h:1 s:2 s:1 s:1 k:2 h:1 h:1 s:2 h:1 h:1 k:2 k:1 h:1 s:2 s:1 s:1 k:2 h:1 h:1 s:2 h:1 h:1 k:2 k:1 h:1 s:2 s:1 s:1 k:2 h:1 h:1 s:2 h:1 h:1 k:2 k:1 h:1 s:2 s:1 s:1 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:4 h:2 h:2 k:2 h:2 s:2 h:2 k:2 s:2 k:2 s:2 k:2 h:2 s:2 h:2 k:2 s:2 k:2 s:2 k:2 h:2 s:2 h:2 k:2 s:2 k:2 s:2 s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:1 ' },
    ],
  },
  /**
   * Trollberget – the last temple. Opens on a heavy unison riff pounded out
   * in the depths, then drives on: E minor darkened by F and B-flat (the
   * tritone), a grinding low octave bass, restless arpeggios and a lead that
   * climbs and never rests.
   */
  trollberget: {
    bpm: 144,
    loop: true,
    // A whole tone lower than written: deeper and darker.
    transpose: -2,
    tracks: [
      {
        inst: 'pulse', vol: 0.95,
        notes: `e4:3 b3:1 e4:3 b3:1 f4:2 e4:4 d#4:1 e4:1 | e4:3 b3:1 e4:3 b3:1 g4:2 f4:4 e4:1 d#4:1 | e4:3 b3:1 e4:3 b3:1 f4:2 e4:4 d#4:1 e4:1 | e4:3 b3:1 e4:3 b3:1 g4:2 f4:4 e4:1 d#4:1 |
                e4:2 g4:2 b4:4 a#4:2 b4:2 g4:4 | e4:2 f4:2 g4:2 f4:2 e4:4 d#4:4 | f4:2 a4:2 c5:4 b4:2 a4:2 f4:4 | e4:4 b3:2 e4:2 g4:6 r:2 |
                b4:2 b4:2 c5:2 b4:2 a#4:2 b4:2 g4:4 | e5:4 d#5:2 e5:2 b4:4 g4:4 | f5:2 d5:2 bb4:2 f4:2 bb4:4 a4:4 | d5:4 c5:2 b4:2 g#4:2 f4:2 d4:4 |
                a4:2 c5:2 e5:4 d#5:2 e5:2 c5:4 | b4:2 c5:2 a4:2 e4:2 a4:4 g#4:4 | f4:2 a4:2 c5:2 f5:2 e5:4 c5:4 | a4:2 c5:2 b4:2 a4:2 g#4:4 a4:4 |
                g4:2 b4:2 e5:2 g5:2 f#5:2 e5:2 d#5:2 e5:2 | f5:4 d5:2 bb4:2 f5:4 e5:4 | d5:2 f5:2 g#5:4 f5:2 d5:2 b4:4 | c5:2 b4:2 a#4:2 a4:2 g#4:4 f4:2 d#4:2`,
      },
      { inst: 'pulse2', vol: 0.55, notes: 'e3:3 b2:1 e3:3 b2:1 f3:2 e3:4 d#3:1 e3:1 | e3:3 b2:1 e3:3 b2:1 g3:2 f3:4 e3:1 d#3:1 | e3:3 b2:1 e3:3 b2:1 f3:2 e3:4 d#3:1 e3:1 | e3:3 b2:1 e3:3 b2:1 g3:2 f3:4 e3:1 d#3:1 | e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 | e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 | f3:1 a3:1 c4:1 a3:1 f3:1 a3:1 c4:1 a3:1 f3:1 a3:1 c4:1 a3:1 f3:1 a3:1 c4:1 a3:1 | e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 | e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 | e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 | bb2:1 d3:1 f3:1 d3:1 bb2:1 d3:1 f3:1 d3:1 bb2:1 d3:1 f3:1 d3:1 bb2:1 d3:1 f3:1 d3:1 | b2:1 d3:1 f3:1 g#3:1 b2:1 d3:1 f3:1 g#3:1 b2:1 d3:1 f3:1 g#3:1 b2:1 d3:1 f3:1 g#3:1 | a2:1 c3:1 e3:1 c3:1 a2:1 c3:1 e3:1 c3:1 a2:1 c3:1 e3:1 c3:1 a2:1 c3:1 e3:1 c3:1 | a2:1 c3:1 e3:1 c3:1 a2:1 c3:1 e3:1 c3:1 a2:1 c3:1 e3:1 c3:1 a2:1 c3:1 e3:1 c3:1 | f3:1 a3:1 c4:1 a3:1 f3:1 a3:1 c4:1 a3:1 f3:1 a3:1 c4:1 a3:1 f3:1 a3:1 c4:1 a3:1 | f3:1 a3:1 c4:1 a3:1 f3:1 a3:1 c4:1 a3:1 f3:1 a3:1 c4:1 a3:1 f3:1 a3:1 c4:1 a3:1 | e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 | bb2:1 d3:1 f3:1 d3:1 bb2:1 d3:1 f3:1 d3:1 bb2:1 d3:1 f3:1 d3:1 bb2:1 d3:1 f3:1 d3:1 | b2:1 d3:1 f3:1 g#3:1 b2:1 d3:1 f3:1 g#3:1 b2:1 d3:1 f3:1 g#3:1 b2:1 d3:1 f3:1 g#3:1 | b2:1 d3:1 f3:1 g#3:1 b2:1 d3:1 f3:1 g#3:1 b2:1 d3:1 f3:1 g#3:1 b2:1 d3:1 f3:1 g#3:1' },
      { inst: 'bass', vol: 1, shift: 12, notes: 'e2:3 b1:1 e2:3 b1:1 f2:2 e2:4 d#2:1 e2:1 | e2:3 b1:1 e2:3 b1:1 g2:2 f2:4 e2:1 d#2:1 | e2:3 b1:1 e2:3 b1:1 f2:2 e2:4 d#2:1 e2:1 | e2:3 b1:1 e2:3 b1:1 g2:2 f2:4 e2:1 d#2:1 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | f1:2 f2:2 f1:2 f2:2 f1:2 f2:2 f1:2 f2:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 | b1:2 b2:2 b1:2 b2:2 b1:2 b2:2 b1:2 b2:2 | a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 | a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 | f1:2 f2:2 f1:2 f2:2 f1:2 f2:2 f1:2 f2:2 | f1:2 f2:2 f1:2 f2:2 f1:2 f2:2 f1:2 f2:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 | b1:2 b2:2 b1:2 b2:2 b1:2 b2:2 b1:2 b2:2 | b1:2 b2:2 b1:2 b2:2 b1:2 b2:2 b1:2 b2:2' },
      { inst: 'organ', vol: 0.45, notes: 'e2:16 | e2:16 | e2:16 | e2:16 | e2:16 | e2:16 | f2:16 | e2:16 | e2:16 | e2:16 | bb1:16 | b1:16 | a1:16 | a1:16 | f2:16 | f2:16 | e2:16 | bb1:16 | b1:16 | b1:16' },
      { inst: 'drum', vol: 0.55, notes: 'k:3 k:1 k:3 k:1 s:2 k:4 s:1 s:1 '.repeat(4) + 'k:2 h:1 h:1 s:2 h:1 h:1 k:2 h:1 h:1 s:2 k:1 k:1 '.repeat(16) },
    ],
  },
  /**
   * "Skuggan" – Dagny's shadow: the Väktarmotiv turned upside down, played
   * against the right way up in the harmony – two Dagnys at once – with
   * tritones and chromatic slides between.
   */
  skuggan: {
    bpm: 160,
    loop: true,
    transpose: -2,
    tracks: [
      {
        inst: 'pulse', vol: 0.95,
        notes: `e4:3 b4:1 e4:3 b4:1 d#4:2 e4:4 f4:1 e4:1 | e4:3 b4:1 e4:3 b4:1 c#4:2 d#4:4 e4:1 f4:1 |
                e5:2 bb4:2 e5:2 bb4:2 f5:2 b4:2 f5:2 b4:2 | e5:2 d#5:2 d5:2 c#5:2 c5:2 b4:2 bb4:2 a4:2 |
                e4:2 bb4:2 e4:2 bb4:2 f4:2 b4:2 f4:2 b4:2 | a4:2 bb4:2 b4:2 c5:2 c#5:2 d5:2 d#5:2 e5:2 |
                e5:3 b5:1 e5:3 b5:1 d#5:2 e5:4 f5:1 e5:1 | e5:2 f5:2 e5:2 d#5:2 e5:8`,
      },
      { inst: 'pulse2', vol: 0.6, notes: 'e3:3 b2:1 e3:3 b2:1 f3:2 e3:4 d#3:1 e3:1 | e3:3 b2:1 e3:3 b2:1 g3:2 f3:4 e3:1 d#3:1 | e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 | e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 | e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 | e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 | e3:3 b2:1 e3:3 b2:1 f3:2 e3:4 d#3:1 e3:1 | e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1 e3:1 g3:1 bb3:1 g3:1' },
      { inst: 'bass', vol: 1, shift: 12, notes: 'e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | e1:2 bb1:2 e1:2 bb1:2 e1:2 bb1:2 e1:2 bb1:2 | e1:2 bb1:2 e1:2 bb1:2 e1:2 bb1:2 e1:2 bb1:2 | e1:2 bb1:2 e1:2 bb1:2 e1:2 bb1:2 e1:2 bb1:2 | e1:2 bb1:2 e1:2 bb1:2 e1:2 bb1:2 e1:2 bb1:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2' },
      { inst: 'organ', vol: 0.4, notes: 'e2:16 '.repeat(8) },
      { inst: 'drum', vol: 0.55, notes: 'k:2 h:1 h:1 s:2 h:1 k:1 '.repeat(16) },
    ],
  },
  /**
   * Bergakungen – the last fight: Trollberget's riff at full speed, in the
   * same low key and over the same organ, ending in a chromatic slide down.
   */
  bergakung: {
    bpm: 172,
    loop: true,
    transpose: -2,
    tracks: [
      {
        inst: 'pulse', vol: 1,
        notes: `e4:2 e4:1 b3:1 e4:2 e4:1 b3:1 f4:2 e4:2 d#4:2 e4:2 | e4:2 e4:1 b3:1 e4:2 e4:1 b3:1 g4:2 f4:2 e4:2 d#4:2 |
                e5:2 b4:2 g4:2 b4:2 e5:2 g5:2 f5:2 e5:2 | f5:2 c5:2 a4:2 c5:2 f5:2 a5:2 g#5:2 a5:2 | g5:2 f#5:2 e5:2 b4:2 e5:4 f5:4 |
                f5:2 d5:2 bb4:2 d5:2 f5:2 bb5:2 a5:2 f5:2 | d5:2 f5:2 g#5:2 b5:2 d6:4 c6:4 | b5:2 a#5:2 a5:2 g#5:2 g5:2 f#5:2 f5:2 e5:2`,
      },
      { inst: 'pulse2', vol: 0.55, notes: 'e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 | e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 | e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 | f3:1 a3:1 c4:1 a3:1 f3:1 a3:1 c4:1 a3:1 f3:1 a3:1 c4:1 a3:1 f3:1 a3:1 c4:1 a3:1 | e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 | bb2:1 d3:1 f3:1 d3:1 bb2:1 d3:1 f3:1 d3:1 bb2:1 d3:1 f3:1 d3:1 bb2:1 d3:1 f3:1 d3:1 | b2:1 d3:1 f3:1 g#3:1 b2:1 d3:1 f3:1 g#3:1 b2:1 d3:1 f3:1 g#3:1 b2:1 d3:1 f3:1 g#3:1 | e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1 e3:1 g3:1 b3:1 g3:1' },
      { inst: 'bass', vol: 1, shift: 12, notes: 'e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | f1:2 f2:2 f1:2 f2:2 f1:2 f2:2 f1:2 f2:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 | bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 | b1:2 b2:2 b1:2 b2:2 b1:2 b2:2 b1:2 b2:2 | e1:2 e2:2 e1:2 e2:2 e1:2 e2:2 e1:2 e2:2' },
      { inst: 'organ', vol: 0.45, notes: 'e2:16 | e2:16 | e2:16 | f2:16 | e2:16 | bb1:16 | b1:16 | e2:16' },
      { inst: 'drum', vol: 0.6, notes: 'k:2 h:1 k:1 s:2 h:1 h:1 '.repeat(16) },
    ],
  },
  /** "Midsommarpolska" – the epilogue: a happy polska round the maypole. */
  midsommar: {
    bpm: 116,
    loop: true,
    tracks: [
      {
        inst: 'flute', vol: 0.85,
        notes: `g5:2 a5:1 b5:1 d6:2 b5:2 g5:2 b5:2 | a5:2 f#5:2 d5:2 f#5:2 a5:2 c6:2 |
                b5:2 c6:1 d6:1 e6:2 d6:2 b5:2 g5:2 | a5:3 b5:1 a5:4 d5:4 |
                g5:2 b5:2 d6:2 g6:2 f#6:2 e6:2 | d6:2 c6:2 b5:2 a5:2 g5:2 a5:2 |
                b5:2 g5:2 e5:2 f#5:2 a5:2 f#5:2 | g5:8 r:4`,
      },
      { inst: 'accordion', vol: 0.4, notes: 'g4:4 b4:4 d5:4 | d4:4 f#4:4 a4:4 | g4:4 b4:4 d5:4 | d4:4 f#4:4 c5:4 | g4:4 b4:4 d5:4 | c4:4 e4:4 g4:4 | c4:4 e4:4 a4:4 | g4:4 b4:4 d5:4' },
      { inst: 'bass', vol: 0.85, notes: 'g2:4 d3:4 g3:4 | d2:4 a2:4 d3:4 | g2:4 d3:4 g3:4 | d2:4 a2:4 d3:4 | g2:4 d3:4 g3:4 | c3:4 g2:4 c3:4 | d3:4 a2:4 d3:4 | g2:4 d3:4 g2:4' },
      { inst: 'drum', vol: 0.5, notes: 'k:4 h:2 h:2 s:4 '.repeat(8) },
    ],
  },
  /** Kyrkbyn – a hymn in D major with organ and the church bell. */
  kyrkby: {
    bpm: 80,
    loop: true,
    tracks: [
      {
        inst: 'flute', vol: 0.8,
        notes: `d5:4 f#5:4 a5:4 f#5:4 | g5:4 f#5:4 e5:8 | d5:4 e5:4 f#5:4 a5:4 | b5:8 a5:8 |
                b5:4 a5:4 g5:4 f#5:4 | e5:4 f#5:4 g5:8 | f#5:4 e5:4 d5:4 e5:4 | d5:16`,
      },
      { inst: 'organ', vol: 0.45, notes: 'd3:16 a2:16 b2:16 g2:16 g2:16 a2:16 d3:8 a2:8 d3:16' },
      { inst: 'bell', vol: 0.35, notes: 'd6:16 r:16 '.repeat(4) },
      { inst: 'bass', vol: 0.7, notes: 'd2:8 a2:8 a2:8 e2:8 b1:8 f#2:8 g2:8 d2:8 g2:8 d2:8 a2:8 e2:8 d2:8 a2:8 d2:16' },
    ],
  },
  /** Bruksorten – "Hammarschottis", a brisk works march in C major. */
  bruk: {
    bpm: 112,
    loop: true,
    tracks: [
      {
        inst: 'accordion', vol: 0.75,
        notes: `c5:2 e5:2 g5:2 e5:2 c6:4 g5:4 | a5:2 g5:2 f5:2 e5:2 d5:8 | b4:2 d5:2 f5:2 d5:2 b5:4 a5:4 | g5:2 f5:2 e5:2 d5:2 c5:8 |
                e5:4 e5:2 f5:2 g5:4 e5:4 | f5:4 f5:2 g5:2 a5:4 f5:4 | g5:2 a5:2 g5:2 f5:2 e5:2 d5:2 c5:2 b4:2 | c5:12 r:4`,
      },
      { inst: 'bass', vol: 0.85, notes: 'c2:4 g2:4 c2:4 g2:4 | g2:4 d2:4 g2:4 d2:4 | g2:4 d2:4 g2:4 d2:4 | c2:4 g2:4 c2:4 g2:4 | c2:4 g2:4 c2:4 g2:4 | f2:4 c2:4 f2:4 c2:4 | g2:4 d2:4 g2:4 d2:4 | c2:4 g2:4 c2:4 g2:4' },
      { inst: 'drum', vol: 0.5, notes: 'k:4 h:4 s:4 h:4 '.repeat(8) },
    ],
  },
  /** Fiskeläget – "Sjöbodsvalsen", a rolling waltz by the sea. */
  fiske: {
    bpm: 100,
    loop: true,
    tracks: [
      {
        inst: 'accordion', vol: 0.75,
        notes: `e5:4 a5:4 c6:4 | b5:6 a5:2 g5:4 | a5:4 e5:4 c5:4 | d5:12 |
                d5:4 g5:4 b5:4 | a5:6 g5:2 f5:4 | e5:4 g#5:4 b5:4 | a5:12`,
      },
      { inst: 'harp', vol: 0.45, notes: 'r:4 c4:4 e4:4 | r:4 b3:4 e4:4 | r:4 c4:4 e4:4 | r:4 d4:4 f4:4 | r:4 b3:4 d4:4 | r:4 a3:4 c4:4 | r:4 g#3:4 b3:4 | r:4 c4:4 e4:4' },
      { inst: 'bass', vol: 0.8, notes: 'a2:12 | e2:12 | a2:12 | d2:12 | g2:12 | f2:12 | e2:12 | a2:12' },
    ],
  },
  /** Fäboden – a light herding tune in G major over a drone. */
  fabodby: {
    bpm: 96,
    loop: true,
    tracks: [
      {
        inst: 'flute', vol: 0.85,
        notes: `d5:4 g5:4 b5:6 a5:2 | g5:4 e5:4 d5:8 | e5:4 g5:4 a5:4 b5:4 | a5:12 r:4 |
                b5:4 d6:4 b5:4 g5:4 | a5:4 b5:4 a5:4 e5:4 | d5:4 e5:4 g5:4 a5:4 | g5:12 r:4`,
      },
      { inst: 'harp', vol: 0.4, notes: 'g3:4 d4:4 g4:4 d4:4 | c4:4 g4:4 c5:4 g4:4 | c4:4 e4:4 g4:4 e4:4 | d4:4 f#4:4 a4:4 f#4:4 | g3:4 d4:4 g4:4 d4:4 | d4:4 f#4:4 a4:4 f#4:4 | c4:4 e4:4 g4:4 e4:4 | g3:4 d4:4 g4:4 r:4' },
      { inst: 'organ', vol: 0.3, notes: 'g2:64 g2:64' },
    ],
  },
  /** Stationssamhället – "Rallarfoxen", chugging along like the train. */
  station: {
    bpm: 126,
    loop: true,
    tracks: [
      {
        inst: 'accordion', vol: 0.7,
        notes: `f5:4 a5:2 c6:2 a5:4 f5:4 | g5:4 bb5:2 g5:2 e5:8 | f5:2 g5:2 a5:2 bb5:2 c6:4 a5:4 | g5:12 r:4 |
                a5:4 c6:2 a5:2 f5:4 a5:4 | bb5:4 d6:2 bb5:2 g5:4 bb5:4 | a5:2 g5:2 f5:2 e5:2 g5:4 e5:4 | f5:12 r:4`,
      },
      { inst: 'bass', vol: 0.85, notes: 'f2:4 a2:4 c3:4 a2:4 | c2:4 e2:4 g2:4 e2:4 | f2:4 a2:4 c3:4 a2:4 | c2:4 e2:4 g2:4 e2:4 | f2:4 a2:4 c3:4 a2:4 | bb1:4 d2:4 f2:4 d2:4 | c2:4 e2:4 g2:4 e2:4 | f2:4 a2:4 c3:4 a2:4' },
      { inst: 'drum', vol: 0.45, notes: 'k:2 h:2 h:2 h:2 s:2 h:2 h:2 h:2 '.repeat(8) },
    ],
  },
};

/**
 * Each village's tune in a brighter version, for when its place has woken: a
 * touch quicker, with a bell doubling the melody an octave up.
 */
for (const id of ['by', 'kyrkby', 'gruvby', 'bruk', 'fiske', 'station', 'fabodby']) {
  const s = SONGS[id];
  if (!s) continue;
  SONGS[`${id}_ljus`] = {
    bpm: Math.round(s.bpm * 1.06),
    loop: s.loop,
    tracks: [...s.tracks, { inst: 'bell', vol: 0.22, notes: s.tracks[0].notes, shift: 12 }],
  };
}

