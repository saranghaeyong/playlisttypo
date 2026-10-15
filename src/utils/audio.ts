/**
 * Audio synthesis & local audio file manager for SARANG RN — PLAYLIST BGM.
 * Built with Web Audio API - zero external network requests or keys required.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Default muted per requirement
  private customAudio: HTMLAudioElement | null = null;
  private customAudioUrl: string | null = null;
  private lastImpactTriggered: boolean = false;
  private lastPulseTriggeredTime: number = -1;

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.customAudio) {
      this.customAudio.muted = muted;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public loadCustomFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (this.customAudioUrl) {
          URL.revokeObjectURL(this.customAudioUrl);
        }
        const url = URL.createObjectURL(file);
        this.customAudioUrl = url;
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.muted = this.isMuted;
        this.customAudio = audio;
        resolve(file.name);
      } catch (e) {
        reject(e);
      }
    });
  }

  public removeCustomFile() {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }
    if (this.customAudioUrl) {
      URL.revokeObjectURL(this.customAudioUrl);
      this.customAudioUrl = null;
    }
  }

  public syncAudio(time: number, isPlaying: boolean) {
    if (this.customAudio) {
      if (Math.abs(this.customAudio.currentTime - time) > 0.15) {
        this.customAudio.currentTime = Math.max(0, time);
      }
      if (isPlaying && this.customAudio.paused && time < 20.0) {
        this.customAudio.play().catch(() => {});
      } else if (!isPlaying && !this.customAudio.paused) {
        this.customAudio.pause();
      }
    }

    if (this.isMuted || !this.ctx || !isPlaying) return;

    // Procedural sound design triggers based on timeline timestamp
    // Impact at t=15.6s
    if (time >= 15.6 && time < 16.5 && !this.lastImpactTriggered) {
      this.triggerImpactBoom();
      this.lastImpactTriggered = true;
    }
    if (time < 15.0 || time > 17.5) {
      this.lastImpactTriggered = false;
    }

    // Neon rhythm pulse (Stage 4: 10.0s - 15.0s, beats roughly every 0.468s)
    if (time >= 10.0 && time <= 15.0) {
      const beat = Math.floor((time - 10.0) / 0.46875);
      if (beat !== this.lastPulseTriggeredTime) {
        this.lastPulseTriggeredTime = beat;
        this.triggerNeonPulse(beat);
      }
    }
  }

  private triggerImpactBoom() {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      // 1. Sub-bass boom
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.8);
      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 1.2);

      // 2. High-frequency cinematic shimmer
      const oscHigh = this.ctx.createOscillator();
      const gainHigh = this.ctx.createGain();
      oscHigh.type = 'triangle';
      oscHigh.frequency.setValueAtTime(880, t);
      oscHigh.frequency.exponentialRampToValueAtTime(220, t + 0.5);
      gainHigh.gain.setValueAtTime(0.2, t);
      gainHigh.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      oscHigh.connect(gainHigh);
      gainHigh.connect(this.ctx.destination);
      oscHigh.start(t);
      oscHigh.stop(t + 0.6);
    } catch {
      // AudioContext fallback
    }
  }

  private triggerNeonPulse(step: number) {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      // Harmonic chords in C-minor / futuristic scale
      const notes = [261.63, 311.13, 392.00, 466.16];
      const freq = notes[step % notes.length];
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, t + 0.15);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch {
      // AudioContext fallback
    }
  }
}

export const soundEngine = new SoundEngine();
