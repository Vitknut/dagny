# Soundtrack – Dagnys äventyr

All music is synthesised from note strings in `src/audio/songs.ts`.
The score is built from two sound worlds and one theme that keeps coming back.

## Two sound worlds

| World | Instruments | Where |
|---|---|---|
| **Hemma** (safety) | Accordion, harp, flute, organ – folk music | Title screen, Mormors by, the six villages, the ending, midsommar |
| **Äventyret** (danger) | NES pulse waves, octave bass, noise drums | The overworld map, paths and encounters, the temples, every fight |

Stepping out of a village switches from folk to chiptune, so the music alone
tells the player whether they are safe.

## Väktarmotivet (the guardians' theme)

A riff of eight notes in a fixed rhythm (sixteenths `3 1 3 1 2 4 1 1`) that
alternates the root with the fifth below, then turns. It ties the temples together:

| Song | How the theme appears |
|---|---|
| `tempel` – *Väktarnas salar* | Opens the shared temple theme. Four parts: the riff; a fast part of broken chords over a bass falling by half steps; a calmer part with a phrase sung twice; a build back into the riff |
| `boss` – *Väktarstriden* | Two pulse voices a fourth apart: a short cell out of the Väktarmotiv sinks a step at a time (A–G–F–E) over a pumping bass, then the motif an octave up over the same descent |
| `trollberget` | Pounded out low and dark (♭2, a tone lower, organ drone) |
| `bergakung` | Trollberget's version at full speed in the final fight |
| `skuggan` | **Upside down** in Skuggsalen – Dagny's mirror image – played against the right way up in the harmony |
| `seger` | In C major when a temple is restored – the guardians at peace |

The second half of `tempel` also quotes Dagny's own melody from the title song
*Ny dag* (`a c e | d c b`), so the heroine's theme follows her into the temples.

## The songs

- **Title:** `titel` (*Ny dag*, Dagny's theme)
- **Home and villages:** `by` (Mormors polska), `gruvby`, `kyrkby`, `bruk`, `fiske`, `fabodby`, `station`
- **Outdoors:** `karta` (*Vägen ut*, the overworld), `stig` (paths), `mote` (fights on the map, in the overworld's D minor), `grotta` (Tjuvgrottan and Jättegrytan: echo, drone, dripping water)
- **Temples 1–6:** `tempel`, with boss music `boss`. One theme for all six, as in Zelda II, so it becomes recognisable.
- **Temple 7:** `trollberget`, with boss music `bergakung`. Skuggsalen plays `skuggan` while the hall is shut (`sealed.music`).
- **Short pieces:** `seger` (temple restored), `somnar` (defeat)
- **Jingles** play over the music, which dips meanwhile and then comes back (`AudioEngine.jingle`):
  - `fynd` – something found (container, doll, lost thing, a gift)
  - `lara` – something learned (a reading, a technique, a new level). It is Dagny's theme `a c e` in major.
- **Ending:** `soluppgang`, `midsommar`

23 pieces in total (21 songs and 2 jingles). Tests in `tests/data.test.ts` check this structure: every song is used,
temples 1–6 share their theme and boss music, and every track in a song is the same length.
