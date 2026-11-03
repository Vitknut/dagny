/**
 * Synthesised chiptune with a Swedish folk feel. No audio files: songs are
 * note strings in src/audio/songs.ts, effects are parameter lists in
 * src/audio/sfx.ts. A small look-ahead sequencer schedules notes on the
 * Web Audio clock.
 *
 * iOS only allows audio after a user gesture, so the context is created
 * (or resumed) by `unlock()` on the first tap / key press.
 */

export type InstrumentId = 'accordion' | 'harp' | 'bass' | 'flute' | 'bell' | 'organ' | 'pulse' | 'pulse2' | 'drum';

export interface TrackDef {
  inst: InstrumentId;
  /** 0–1 */
  vol: number;
  /** "e5:4 f#5:2 r:2 | ..." – lengths in sixteenth notes; drums use k/s/h. */
  notes: string;
  /** Semitone shift for this track only. */
  shift?: number;
}

export interface SongDef {
  /** Quarter notes per minute. */
  bpm: number;
  loop: boolean;
  tracks: TrackDef[];
  /** Derive from another song (e.g. placeholder temple themes). */
  base?: string;
  transpose?: number;
  /** A song that doesn't loop goes straight on into this one (an intro and its loop). */
  then?: string;
}

export interface SfxStep {
  wave: OscillatorType | 'noise';
  /** Start / end frequency in Hz (ignored for noise unless filtered). */
  from: number;
  to?: number;
  /** Seconds. */
  dur: number;
  vol?: number;
  /** Delay from the start of the effect. */
  at?: number;
}

interface ParsedNote {
  /** MIDI note, -1 = rest, -2 kick, -3 snare, -4 hat */
  midi: number;
  /** Length in sixteenth notes. */
  len: number;
}

interface ParsedTrack {
  def: TrackDef;
  notes: ParsedNote[];
  totalLen: number;
}

interface ParsedSong {
  bpm: number;
  loop: boolean;
  then?: string;
  tracks: ParsedTrack[];
}

const NOTE_INDEX: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

/** Parses "f#5:3" → midi + length. Exported for tests. */
export function parseNotes(src: string, transpose = 0): ParsedNote[] {
  const out: ParsedNote[] = [];
  let len = 4;
  for (const tok of src.split(/\s+/)) {
    if (!tok || tok === '|') continue;
    const [name, l] = tok.split(':');
    if (l !== undefined) {
      const n = Number(l);
      if (!Number.isFinite(n) || n <= 0) throw new Error(`Ogiltig notlängd: ${tok}`);
      len = n;
    }
    if (name === 'r') out.push({ midi: -1, len });
    else if (name === 'k') out.push({ midi: -2, len });
    else if (name === 's') out.push({ midi: -3, len });
    else if (name === 'h') out.push({ midi: -4, len });
    else {
      const m = /^([a-g])(#|b)?(\d)$/.exec(name);
      if (!m) throw new Error(`Ogiltig not: ${tok}`);
      let midi = 12 * (Number(m[3]) + 1) + NOTE_INDEX[m[1]];
      if (m[2] === '#') midi += 1;
      if (m[2] === 'b') midi -= 1;
      out.push({ midi: midi + transpose, len });
    }
  }
  return out;
}

const midiToHz = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private songs: Record<string, SongDef> = {};
  private sfx: Record<string, SfxStep[]> = {};
  private parsed = new Map<string, ParsedSong>();
  /** `origin` is the song asked for, when this is the loop its intro went on into. */
  private current: { id: string; origin: string; song: ParsedSong; idx: number[]; time: number[]; startedAt: number } | null = null;
  private wanted: string | null = null;
  private musicVol = 0.6;
  private sfxVol = 0.7;
  private lastSfx = new Map<string, number>();
  private suspended = false;

  constructor(songs: Record<string, SongDef>, sfx: Record<string, SfxStep[]>) {
    this.songs = songs;
    this.sfx = sfx;
  }

  get unlocked(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  /**
   * Try to start music before any gesture. Browsers usually keep the audio
   * suspended until the first tap, but allow it e.g. for an installed app or
   * a site the player has used a lot – then the title song starts at once.
   */
  tryAutoplay(song: string): void {
    this.wanted = song;
    this.unlock();
  }

  /** Call from any user gesture. Safe to call often. */
  unlock(): void {
    try {
      if (!this.ctx) {
        const Ctor: typeof AudioContext | undefined =
          window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        const ctx = new Ctor();
        this.ctx = ctx;
        this.master = ctx.createGain();
        this.master.gain.value = 0.9;
        // Gentle low-pass + compressor keeps the chiptune warm, not harsh.
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 7000;
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -14;
        comp.ratio.value = 3;
        this.master.connect(lp).connect(comp).connect(ctx.destination);
        this.musicBus = ctx.createGain();
        this.sfxBus = ctx.createGain();
        this.musicBus.connect(this.master);
        this.sfxBus.connect(this.master);
        this.applyVolumes();
        const len = ctx.sampleRate;
        this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = this.noise.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        setInterval(() => this.schedule(), 40);
      }
      if (this.ctx.state !== 'running' && !this.suspended) {
        // iOS: play a silent buffer inside the gesture.
        const src = this.ctx.createBufferSource();
        src.buffer = this.ctx.createBuffer(1, 1, 22050);
        src.connect(this.ctx.destination);
        src.start(0);
        void this.ctx.resume();
      }
      if (this.wanted && (!this.current || this.current.id !== this.wanted)) this.startSong(this.wanted);
    } catch {
      /* audio unavailable – the game runs silently */
    }
  }

  /** Pause all audio (app in background). */
  suspend(): void {
    this.suspended = true;
    if (this.ctx && this.ctx.state === 'running') void this.ctx.suspend();
  }

  resume(): void {
    this.suspended = false;
    if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setVolumes(music: number, sfx: number): void {
    this.musicVol = music;
    this.sfxVol = sfx;
    this.applyVolumes();
  }

  private applyVolumes(): void {
    if (!this.ctx || !this.musicBus || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    // Perceptual curve.
    this.musicBus.gain.setTargetAtTime(this.musicVol * this.musicVol * 0.5, t, 0.05);
    this.sfxBus.gain.setTargetAtTime(this.sfxVol * this.sfxVol * 0.8, t, 0.02);
  }

  private parse(id: string): ParsedSong | null {
    const cached = this.parsed.get(id);
    if (cached) return cached;
    const def = this.songs[id];
    if (!def) return null;
    let tracks = def.tracks;
    let bpm = def.bpm;
    let transpose = def.transpose ?? 0;
    if (def.base) {
      const base = this.songs[def.base];
      if (!base) return null;
      tracks = def.tracks.length ? def.tracks : base.tracks;
      bpm = def.bpm || base.bpm;
      transpose += base.transpose ?? 0;
    }
    const song: ParsedSong = {
      bpm,
      loop: def.loop,
      then: def.then,
      tracks: tracks.map((t) => {
        const notes = parseNotes(t.notes, t.inst === 'drum' ? 0 : transpose + (t.shift ?? 0));
        return { def: t, notes, totalLen: notes.reduce((a, n) => a + n.len, 0) };
      }),
    };
    this.parsed.set(id, song);
    return song;
  }

  /** Switch background music (no-op if already playing). Null stops music. */
  playMusic(id: string | null): void {
    this.wanted = id;
    if (!this.ctx) return;
    if (id === null) {
      this.stopSong();
      return;
    }
    if (this.current?.id === id || this.current?.origin === id) return;
    this.startSong(id);
  }

  get musicId(): string | null {
    return this.wanted;
  }

  private stopSong(): void {
    if (this.current && this.ctx && this.musicBus) {
      // Quick fade so the cut never clicks.
      const t = this.ctx.currentTime;
      const g = this.musicBus.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(0, t + 0.08);
      g.linearRampToValueAtTime(this.musicVol * this.musicVol * 0.5, t + 0.25);
    }
    this.current = null;
  }

  private startSong(id: string): void {
    if (!this.ctx) return;
    const song = this.parse(id);
    this.stopSong();
    if (!song) return;
    const t0 = this.ctx.currentTime + 0.3;
    this.current = {
      id,
      origin: id,
      song,
      idx: song.tracks.map(() => 0),
      time: song.tracks.map(() => t0),
      startedAt: t0,
    };
  }

  private schedule(): void {
    const ctx = this.ctx;
    const cur = this.current;
    if (!ctx || !cur || ctx.state !== 'running') return;
    const horizon = ctx.currentTime + 0.25;
    const sixteenth = 60 / cur.song.bpm / 4;
    let allDone = true;
    cur.song.tracks.forEach((track, ti) => {
      if (!track.notes.length) return;
      while (cur.time[ti] < horizon) {
        if (cur.idx[ti] >= track.notes.length) {
          if (!cur.song.loop) break;
          cur.idx[ti] = 0;
        }
        const n = track.notes[cur.idx[ti]];
        const dur = n.len * sixteenth;
        if (cur.time[ti] >= ctx.currentTime - 0.05) this.playNote(track.def, n.midi, cur.time[ti], dur);
        cur.time[ti] += dur;
        cur.idx[ti]++;
      }
      if (cur.idx[ti] < track.notes.length || cur.song.loop) allDone = false;
    });
    // An intro ends right where its loop begins, to the sixteenth.
    if (allDone && !cur.song.loop && cur.song.then) {
      const next = this.parse(cur.song.then);
      if (next) {
        const t0 = Math.max(...cur.time);
        this.current = { id: cur.song.then, origin: cur.origin, song: next, idx: next.tracks.map(() => 0), time: next.tracks.map(() => t0), startedAt: t0 };
        return;
      }
    }
    if (allDone && !cur.song.loop && ctx.currentTime > Math.max(...cur.time)) {
      this.current = null;
      if (this.wanted === cur.id) this.wanted = null;
    }
  }

  /**
   * A short jingle (a find, a lesson learned) played over the music, which
   * dips meanwhile and comes back on its own – the song never restarts.
   */
  jingle(id: string): void {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus || !this.master || ctx.state !== 'running') return;
    const song = this.parse(id);
    if (!song) return;
    if (!this.jingleBus) {
      this.jingleBus = ctx.createGain();
      this.jingleBus.connect(this.master);
    }
    this.jingleBus.gain.value = this.musicVol * this.musicVol * 0.6;
    const sixteenth = 60 / song.bpm / 4;
    const t0 = ctx.currentTime + 0.03;
    let end = t0;
    for (const track of song.tracks) {
      let at = t0;
      for (const n of track.notes) {
        const dur = n.len * sixteenth;
        this.playNote(track.def, n.midi, at, dur, this.jingleBus);
        at += dur;
      }
      end = Math.max(end, at);
    }
    const g = this.musicBus.gain;
    const full = this.musicVol * this.musicVol * 0.5;
    g.cancelScheduledValues(t0);
    g.setValueAtTime(g.value, t0);
    g.linearRampToValueAtTime(full * 0.15, t0 + 0.06);
    g.setValueAtTime(full * 0.15, end);
    g.linearRampToValueAtTime(full, end + 0.6);
  }

  private jingleBus: GainNode | null = null;

  private playNote(t: TrackDef, midi: number, when: number, dur: number, out?: AudioNode): void {
    const ctx = this.ctx!;
    const bus = out ?? this.musicBus!;
    if (midi === -1) return;
    const vol = t.vol;
    if (t.inst === 'drum' || midi < -1) {
      this.drum(midi, when, vol, bus);
      return;
    }
    const hz = midiToHz(midi);
    const env = ctx.createGain();
    env.connect(bus);
    const g = env.gain;
    const end = when + dur;
    switch (t.inst) {
      case 'accordion': {
        // Two detuned pulse-ish oscillators with a bellows tremolo.
        const a = ctx.createOscillator();
        const b = ctx.createOscillator();
        a.type = 'square';
        b.type = 'square';
        a.frequency.value = hz;
        b.frequency.value = hz * 1.004;
        const trem = ctx.createOscillator();
        const tremGain = ctx.createGain();
        trem.frequency.value = 5.5;
        tremGain.gain.value = vol * 0.05;
        trem.connect(tremGain).connect(g);
        const mix = ctx.createGain();
        mix.gain.value = 0.5;
        a.connect(mix);
        b.connect(mix);
        mix.connect(env);
        g.setValueAtTime(0, when);
        g.linearRampToValueAtTime(vol * 0.16, when + 0.02);
        g.setValueAtTime(vol * 0.14, Math.max(when + 0.02, end - 0.05));
        g.linearRampToValueAtTime(0, end);
        for (const o of [a, b, trem]) {
          o.start(when);
          o.stop(end + 0.02);
        }
        break;
      }
      case 'harp': {
        // Nyckelharpa-like: bowed sawtooth through a resonant band-pass, with vibrato.
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = hz;
        const vib = ctx.createOscillator();
        const vibGain = ctx.createGain();
        vib.frequency.value = 5.2;
        vibGain.gain.value = hz * 0.006;
        vib.connect(vibGain).connect(o.frequency);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = Math.min(5000, hz * 3);
        bp.Q.value = 1.4;
        o.connect(bp).connect(env);
        g.setValueAtTime(0, when);
        g.linearRampToValueAtTime(vol * 0.32, when + 0.04);
        g.linearRampToValueAtTime(vol * 0.24, when + Math.min(0.2, dur * 0.5));
        g.setValueAtTime(vol * 0.24, Math.max(when + 0.05, end - 0.04));
        g.linearRampToValueAtTime(0, end + 0.06);
        o.start(when);
        vib.start(when);
        o.stop(end + 0.1);
        vib.stop(end + 0.1);
        break;
      }
      case 'bass': {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = hz;
        o.connect(env);
        g.setValueAtTime(0, when);
        g.linearRampToValueAtTime(vol * 0.5, when + 0.01);
        g.exponentialRampToValueAtTime(Math.max(0.001, vol * 0.25), when + Math.max(0.05, dur * 0.8));
        g.linearRampToValueAtTime(0, end);
        o.start(when);
        o.stop(end + 0.02);
        break;
      }
      case 'flute': {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = hz;
        const vib = ctx.createOscillator();
        const vibGain = ctx.createGain();
        vib.frequency.value = 4.5;
        vibGain.gain.value = hz * 0.004;
        vib.connect(vibGain).connect(o.frequency);
        o.connect(env);
        g.setValueAtTime(0, when);
        g.linearRampToValueAtTime(vol * 0.35, when + 0.05);
        g.setValueAtTime(vol * 0.3, Math.max(when + 0.05, end - 0.05));
        g.linearRampToValueAtTime(0, end);
        o.start(when);
        vib.start(when);
        o.stop(end + 0.02);
        vib.stop(end + 0.02);
        break;
      }
      case 'bell': {
        // Church bell: inharmonic partials with a long decay.
        for (const [ratio, amp] of [[1, 1], [2.0, 0.5], [2.4, 0.35], [3.0, 0.25], [4.2, 0.15]] as const) {
          const o = ctx.createOscillator();
          o.type = 'sine';
          o.frequency.value = hz * ratio;
          const pg = ctx.createGain();
          pg.gain.value = amp;
          o.connect(pg).connect(env);
          o.start(when);
          o.stop(when + Math.max(dur, 1.6) + 0.1);
        }
        g.setValueAtTime(0, when);
        g.linearRampToValueAtTime(vol * 0.18, when + 0.005);
        g.exponentialRampToValueAtTime(0.0005, when + Math.max(dur, 1.6));
        break;
      }
      case 'organ': {
        for (const ratio of [1, 2, 3]) {
          const o = ctx.createOscillator();
          o.type = ratio === 1 ? 'triangle' : 'sine';
          o.frequency.value = hz * ratio;
          const pg = ctx.createGain();
          pg.gain.value = 1 / ratio;
          o.connect(pg).connect(env);
          o.start(when);
          o.stop(end + 0.15);
        }
        g.setValueAtTime(0, when);
        g.linearRampToValueAtTime(vol * 0.14, when + 0.08);
        g.setValueAtTime(vol * 0.14, Math.max(when + 0.08, end - 0.05));
        g.linearRampToValueAtTime(0, end + 0.12);
        break;
      }
      case 'pulse':
      case 'pulse2': {
        // NES-style pulse wave: 25 % duty for leads, 12.5 % for thin harmony.
        const o = ctx.createOscillator();
        o.setPeriodicWave(this.pulseWave(t.inst === 'pulse' ? 0.25 : 0.125));
        o.frequency.value = hz;
        // A little vibrato on long notes only, like the old sound chips.
        if (dur > 0.3) {
          const vib = ctx.createOscillator();
          const vibGain = ctx.createGain();
          vib.frequency.value = 6;
          vibGain.gain.setValueAtTime(0, when);
          vibGain.gain.linearRampToValueAtTime(hz * 0.008, when + 0.25);
          vib.connect(vibGain).connect(o.frequency);
          vib.start(when);
          vib.stop(end + 0.02);
        }
        o.connect(env);
        const peak = vol * (t.inst === 'pulse' ? 0.13 : 0.09);
        g.setValueAtTime(0, when);
        g.linearRampToValueAtTime(peak, when + 0.005);
        g.linearRampToValueAtTime(peak * 0.7, when + Math.min(0.12, dur * 0.5));
        g.setValueAtTime(peak * 0.7, Math.max(when + 0.01, end - 0.02));
        g.linearRampToValueAtTime(0, end);
        o.start(when);
        o.stop(end + 0.02);
        break;
      }
      default:
        break;
    }
  }

  private pulseWaves = new Map<number, PeriodicWave>();

  /** A band-limited pulse wave with the given duty cycle (built once per duty). */
  private pulseWave(duty: number): PeriodicWave {
    let w = this.pulseWaves.get(duty);
    if (!w) {
      const n = 48;
      const real = new Float32Array(n);
      const imag = new Float32Array(n);
      for (let k = 1; k < n; k++) {
        real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty) * Math.cos(k * Math.PI * duty);
        imag[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty) * Math.sin(k * Math.PI * duty);
      }
      w = this.ctx!.createPeriodicWave(real, imag);
      this.pulseWaves.set(duty, w);
    }
    return w;
  }

  private drum(kind: number, when: number, vol: number, bus: AudioNode): void {
    const ctx = this.ctx!;
    if (kind === -2) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(130, when);
      o.frequency.exponentialRampToValueAtTime(45, when + 0.12);
      g.gain.setValueAtTime(vol * 0.6, when);
      g.gain.exponentialRampToValueAtTime(0.001, when + 0.16);
      o.connect(g).connect(bus);
      o.start(when);
      o.stop(when + 0.18);
      return;
    }
    if (!this.noise) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    const isSnare = kind === -3;
    f.type = isSnare ? 'bandpass' : 'highpass';
    f.frequency.value = isSnare ? 1800 : 7000;
    const len = isSnare ? 0.12 : 0.04;
    g.gain.setValueAtTime(vol * (isSnare ? 0.35 : 0.18), when);
    g.gain.exponentialRampToValueAtTime(0.001, when + len);
    src.connect(f).connect(g).connect(bus);
    src.start(when, Math.random() * 0.5);
    src.stop(when + len + 0.02);
  }

  /**
   * Play a sound effect. Rapid repeats of the same effect are throttled.
   * `vol` scales it (distance), `pan` places it left (-1) to right (1).
   */
  play(id: string, opts?: { vol?: number; pan?: number }): void {
    const ctx = this.ctx;
    const steps = this.sfx[id];
    if (!ctx || !steps || ctx.state !== 'running' || !this.sfxBus) return;
    const now = ctx.currentTime;
    const last = this.lastSfx.get(id) ?? -1;
    if (now - last < 0.03) return;
    this.lastSfx.set(id, now);
    let out: AudioNode = this.sfxBus;
    if (opts?.pan) {
      const p = ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, opts.pan));
      p.connect(this.sfxBus);
      out = p;
    }
    for (const s of steps) {
      const when = now + (s.at ?? 0);
      const g = ctx.createGain();
      g.connect(out);
      const vol = Math.max(0.002, (s.vol ?? 0.5) * 0.6 * (opts?.vol ?? 1));
      g.gain.setValueAtTime(vol, when);
      g.gain.exponentialRampToValueAtTime(0.001, when + s.dur);
      if (s.wave === 'noise') {
        if (!this.noise) continue;
        const src = ctx.createBufferSource();
        src.buffer = this.noise;
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.setValueAtTime(s.from, when);
        if (s.to) f.frequency.exponentialRampToValueAtTime(s.to, when + s.dur);
        f.Q.value = 0.8;
        src.connect(f).connect(g);
        src.start(when, Math.random() * 0.5);
        src.stop(when + s.dur + 0.02);
      } else {
        const o = ctx.createOscillator();
        o.type = s.wave;
        o.frequency.setValueAtTime(s.from, when);
        if (s.to) o.frequency.exponentialRampToValueAtTime(s.to, when + s.dur);
        o.connect(g);
        o.start(when);
        o.stop(when + s.dur + 0.02);
      }
    }
  }
}
