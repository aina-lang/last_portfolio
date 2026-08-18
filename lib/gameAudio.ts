/**
 * Ambiance sonore du portfolio.
 *
 * — Musique de fond : joue `public/audio/bgm.mp3` s'il existe. À défaut, un
 *   thème est synthétisé au vol (nappe + arpège pentatonique) pour que le son
 *   fonctionne sans dépendre d'un fichier.
 * — Effets : « swoosh » au changement de page, petit clic sur les carousels.
 *
 * Les navigateurs interdisent l'audio tant que l'utilisateur n'a pas interagi :
 * tout démarre donc au premier geste, via `unlock()`.
 */

const BGM_SRC = '/audio/bgm.mp3';
const SWOOSH_SRC = '/audio/swoosh.mp3';

/** Pentatonique mineure, en demi-tons. */
const SCALE = [0, 3, 5, 7, 10, 12, 15];
/** Enchaînement des toniques (un accord toutes les 16 croches). */
const ROOTS = [0, -2, 3, -4];

const STEP = 0.34; // durée d'une croche, en secondes
const LOOKAHEAD = 0.3;

class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;

  private bgm: HTMLAudioElement | null = null;
  private bgmOk = false;

  private swooshBuf: AudioBuffer | null = null;
  private swooshLoading = false;
  private swooshSrc: AudioBufferSourceNode | null = null;

  private padA: OscillatorNode | null = null;
  private padB: OscillatorNode | null = null;
  private padGain: GainNode | null = null;

  private timer: ReturnType<typeof setInterval> | null = null;
  private nextTime = 0;
  private step = 0;

  private enabled = false;
  private started = false;

  /* ------------------------------------------------------------------ */

  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (this.ctx) return this.ctx;

    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;

    const ctx = new Ctor();
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(ctx.destination);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0.5;
    this.musicBus.connect(this.master);

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 1;
    this.sfxBus.connect(this.master);

    this.ctx = ctx;
    void this.loadSwoosh();
    return ctx;
  }

  /** Précharge le souffle de transition ; le synthétiseur prend le relais en cas d'échec. */
  private async loadSwoosh() {
    if (this.swooshBuf || this.swooshLoading || !this.ctx) return;
    this.swooshLoading = true;
    try {
      const res = await fetch(SWOOSH_SRC);
      if (!res.ok) throw new Error(String(res.status));
      this.swooshBuf = await this.ctx.decodeAudioData(await res.arrayBuffer());
    } catch {
      this.swooshBuf = null;
    } finally {
      this.swooshLoading = false;
    }
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) {
      this.stopMusic();
      return;
    }
    if (this.started) this.startMusic();
  }

  /**
   * À appeler au premier geste utilisateur (clic, touche, molette, toucher).
   * `resume()` est asynchrone : on ne conditionne donc rien à l'état immédiat
   * du contexte, sinon la musique ne démarrerait qu'au deuxième geste.
   */
  unlock() {
    const ctx = this.ensureCtx();
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    this.started = true;
    if (this.enabled) this.startMusic();
  }

  /** La piste tourne-t-elle réellement ? */
  get playing() {
    return !!this.bgm && !this.bgm.paused;
  }

  /* --------------------------- musique ------------------------------ */

  private startMusic() {
    if (!this.started || !this.enabled) return;

    if (!this.bgm) {
      const el = new Audio(BGM_SRC);
      el.loop = true;
      el.volume = 0.28;
      el.preload = 'auto';
      el.addEventListener('error', () => {
        this.bgmOk = false;
        this.bgm = null;
        if (this.enabled) this.startSynth();
      });
      this.bgm = el;
    }

    const el = this.bgm;
    if (!el || !el.paused) return;

    // `play()` est asynchrone : entre l'appel et sa résolution, l'utilisateur a
    // pu couper le son. On revérifie donc avant de laisser la piste tourner.
    void el
      .play()
      .then(() => {
        this.bgmOk = true;
        this.stopSynth();
        if (!this.enabled) el.pause();
      })
      .catch(() => {
        if (this.enabled && this.started) this.startSynth();
      });
  }

  private stopMusic() {
    this.bgm?.pause();
    this.stopSynth();
  }

  /* ----------------------- thème de secours -------------------------- */

  private startSynth() {
    const ctx = this.ctx;
    if (!ctx || this.timer || !this.musicBus) return;

    this.padGain = ctx.createGain();
    this.padGain.gain.value = 0;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 900;
    this.padGain.connect(padFilter).connect(this.musicBus);

    this.padA = ctx.createOscillator();
    this.padA.type = 'triangle';
    this.padB = ctx.createOscillator();
    this.padB.type = 'sine';
    this.padA.connect(this.padGain);
    this.padB.connect(this.padGain);
    this.padA.start();
    this.padB.start();
    this.padGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2);

    this.nextTime = ctx.currentTime + 0.1;
    this.step = 0;
    this.timer = setInterval(() => this.schedule(), 60);
  }

  private stopSynth() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    const ctx = this.ctx;
    if (this.padGain && ctx) {
      this.padGain.gain.cancelScheduledValues(ctx.currentTime);
      this.padGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    }
    const a = this.padA;
    const b = this.padB;
    if (a && b && ctx) {
      a.stop(ctx.currentTime + 0.7);
      b.stop(ctx.currentTime + 0.7);
    }
    this.padA = null;
    this.padB = null;
    this.padGain = null;
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextTime < ctx.currentTime + LOOKAHEAD) {
      this.playStep(this.step, this.nextTime);
      this.nextTime += STEP;
      this.step += 1;
    }
  }

  private playStep(step: number, when: number) {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus) return;

    const root = ROOTS[Math.floor(step / 16) % ROOTS.length];

    // nappe : on recale la tonique à chaque nouvel accord
    if (step % 16 === 0 && this.padA && this.padB) {
      this.padA.frequency.setTargetAtTime(this.midi(root - 12), when, 0.6);
      this.padB.frequency.setTargetAtTime(this.midi(root - 5), when, 0.6);
    }

    // arpège : une note sur deux, plus une note d'ornement
    if (step % 2 === 1 && step % 8 !== 7) return;

    const degree = SCALE[(step * 3) % SCALE.length];
    const freq = this.midi(root + degree);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(0.085, when + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 1.1);

    const delay = ctx.createDelay(1);
    delay.delayTime.value = STEP * 1.5;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.28;

    osc.connect(gain).connect(this.musicBus);
    gain.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(this.musicBus);

    osc.start(when);
    osc.stop(when + 1.3);
  }

  /** Fréquence d'un demi-ton relatif au La 220 Hz. */
  private midi(semitones: number) {
    return 220 * Math.pow(2, semitones / 12);
  }

  /* ---------------------------- effets ------------------------------- */

  private noise(duration: number) {
    const ctx = this.ctx!;
    const frames = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  /** Souffle de transition : monte si l'on avance, descend si l'on recule. */
  swoosh(dir: number) {
    if (!this.enabled || !this.started) return;
    const ctx = this.ctx;
    if (!ctx || !this.sfxBus) return;

    if (this.swooshBuf) {
      const t = ctx.currentTime;
      const dur = Math.min(this.swooshBuf.duration, 1.2);

      // un seul souffle à la fois : on coupe le précédent
      try { this.swooshSrc?.stop(); } catch { /* déjà terminé */ }

      const src = ctx.createBufferSource();
      src.buffer = this.swooshBuf;
      src.playbackRate.value = dir > 0 ? 1 : 0.86;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.85, t);
      gain.gain.setValueAtTime(0.85, t + dur - 0.25);
      gain.gain.linearRampToValueAtTime(0, t + dur);

      src.connect(gain).connect(this.sfxBus);
      src.start(t);
      src.stop(t + dur);
      this.swooshSrc = src;

      this.duck(t, dur);
      return;
    }

    const t = ctx.currentTime;
    const dur = 0.5;

    const src = ctx.createBufferSource();
    src.buffer = this.noise(dur);

    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 1.1;
    band.frequency.setValueAtTime(dir > 0 ? 420 : 2600, t);
    band.frequency.exponentialRampToValueAtTime(dir > 0 ? 2800 : 380, t + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    src.connect(band).connect(gain).connect(this.sfxBus);
    src.start(t);
    src.stop(t + dur);

    // impact grave, pour la sensation de coup de planche manga
    const thump = ctx.createOscillator();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(150, t + 0.16);
    thump.frequency.exponentialRampToValueAtTime(48, t + 0.42);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.0001, t + 0.16);
    tg.gain.exponentialRampToValueAtTime(0.28, t + 0.2);
    tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.46);
    thump.connect(tg).connect(this.sfxBus);
    thump.start(t + 0.16);
    thump.stop(t + 0.5);

    this.duck(t, dur);
  }

  /** Clic sec : pagination des carousels, ouverture de fiche. */
  click(pitch = 880) {
    if (!this.enabled || !this.started) return;
    const ctx = this.ctx;
    if (!ctx || !this.sfxBus) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, t + 0.06);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.09, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

    osc.connect(gain).connect(this.sfxBus);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  /** Baisse la musique le temps d'un effet. */
  private duck(t: number, dur: number) {
    const bus = this.musicBus;
    if (!bus) return;
    bus.gain.cancelScheduledValues(t);
    bus.gain.setValueAtTime(bus.gain.value, t);
    bus.gain.linearRampToValueAtTime(0.18, t + 0.08);
    bus.gain.linearRampToValueAtTime(0.5, t + dur + 0.25);

    if (this.bgmOk && this.bgm) {
      this.bgm.volume = 0.12;
      setTimeout(() => {
        if (this.bgm && this.enabled) this.bgm.volume = 0.28;
      }, (dur + 0.25) * 1000);
    }
  }

  dispose() {
    this.stopMusic();
    this.bgm = null;
    this.started = false;
    void this.ctx?.close();
    this.ctx = null;
  }
}

export const gameAudio = new GameAudio();
