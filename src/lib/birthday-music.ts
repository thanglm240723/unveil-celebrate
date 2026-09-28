// Synthesized "Happy Birthday" melody via Web Audio API — no audio file needed.

const NOTES: Record<string, number> = {
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

// [note, beats]
const MELODY: Array<[string, number]> = [
  ["G4", 0.75],
  ["G4", 0.25],
  ["A4", 1],
  ["G4", 1],
  ["C5", 1],
  ["B4", 2],
  ["G4", 0.75],
  ["G4", 0.25],
  ["A4", 1],
  ["G4", 1],
  ["D5", 1],
  ["C5", 2],
  ["G4", 0.75],
  ["G4", 0.25],
  ["G5", 1],
  ["E5", 1],
  ["C5", 1],
  ["B4", 1],
  ["A4", 2],
  ["F5", 0.75],
  ["F5", 0.25],
  ["E5", 1],
  ["C5", 1],
  ["D5", 1],
  ["C5", 2],
];

const VOLUME = 0.16;

export class BirthdaySong {
  private ctx: AudioContext | null = null;
  private timer: number | null = null;
  private gain: GainNode | null = null;

  start(loop = true) {
    this.stop();
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.gain = this.ctx.createGain();
    this.gain.gain.value = VOLUME;
    this.gain.connect(this.ctx.destination);
    this.playOnce(loop);
  }

  /**
   * Tắt tiếng bằng cách hạ âm lượng tổng, không dừng hẳn bài hát.
   * Dừng rồi phát lại sẽ bắt đầu từ đầu bài; hạ gain thì bật lên là nhạc
   * đang ở đúng chỗ nó phải ở.
   */
  setMuted(muted: boolean) {
    if (!this.ctx || !this.gain) return;
    const t = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(t);
    this.gain.gain.setTargetAtTime(muted ? 0 : VOLUME, t, 0.06);
  }

  private playOnce(loop: boolean) {
    if (!this.ctx || !this.gain) return;
    const beat = 0.42;
    let t = this.ctx.currentTime + 0.05;
    let total = 0;
    for (const [note, beats] of MELODY) {
      const freq = NOTES[note] ?? 440;
      const dur = beats * beat;
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(1, t + 0.03);
      env.gain.setValueAtTime(1, t + dur - 0.08);
      env.gain.linearRampToValueAtTime(0, t + dur);
      osc.connect(env).connect(this.gain);
      osc.start(t);
      osc.stop(t + dur);
      // soft harmony an octave up
      const osc2 = this.ctx.createOscillator();
      const env2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.value = freq * 2;
      env2.gain.setValueAtTime(0, t);
      env2.gain.linearRampToValueAtTime(0.25, t + 0.03);
      env2.gain.linearRampToValueAtTime(0, t + dur);
      osc2.connect(env2).connect(this.gain);
      osc2.start(t);
      osc2.stop(t + dur);
      t += dur;
      total += dur;
    }
    if (loop) {
      this.timer = window.setTimeout(() => this.playOnce(true), (total + 1.2) * 1000);
    }
  }

  stop() {
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = null;
    if (this.ctx) void this.ctx.close().catch(() => undefined);
    this.ctx = null;
  }
}
