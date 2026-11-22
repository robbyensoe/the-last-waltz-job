// The Last Waltz Job — sound: WebAudio oscillator synthesis, no files.
// A held-breath bed under everything; the detection tone tracks the
// alarm meter, and the klaxon loops for as long as a lockdown lasts.

export function makeSound() {
  let ctx = null;
  let master = null;
  let toneOsc = null;
  let toneGain = null;
  let klaxonTimer = null;

  function ensure() {
    if (ctx) {
      if (ctx.state === "suspended") ctx.resume();
      return true;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);
    const bed = ctx.createGain();
    bed.gain.value = 0.018;
    bed.connect(master);
    for (const f of [48, 48.4]) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(bed);
      o.start();
    }
    toneOsc = ctx.createOscillator();
    toneOsc.type = "sine";
    toneOsc.frequency.value = 200;
    toneGain = ctx.createGain();
    toneGain.gain.value = 0;
    toneOsc.connect(toneGain);
    toneGain.connect(master);
    toneOsc.start();
    return true;
  }

  function blip(type, f0, f1, dur, gain, when = 0) {
    if (!ensure()) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  return {
    unlock: ensure,
    step(run, left) {
      blip("square", left ? 160 : 145, 80, 0.05, run ? 0.03 : 0.018);
    },
    sneakStep() {
      blip("triangle", 260, 220, 0.08, 0.01);
    },
    camTick() {
      blip("square", 900, 900, 0.02, 0.015);
    },
    loot() {
      blip("triangle", 660, 660, 0.05, 0.07);
      blip("triangle", 880, 880, 0.05, 0.07, 0.045);
      blip("triangle", 1320, 1320, 0.08, 0.07, 0.09);
    },
    vault() {
      blip("square", 1800, 1800, 0.02, 0.06);
      blip("square", 1800, 1800, 0.02, 0.06, 0.12);
      blip("square", 1800, 1800, 0.02, 0.06, 0.24);
      blip("sine", 70, 45, 0.18, 0.14, 0.3);
      blip("sine", 392, 587, 0.25, 0.08, 0.42);
    },
    laser() {
      blip("sawtooth", 140, 130, 0.35, 0.09);
      blip("sine", 1200, 1200, 0.06, 0.06, 0.3);
    },
    blackout() {
      blip("sawtooth", 800, 60, 0.4, 0.1);
    },
    suspect() {
      blip("square", 620, 620, 0.06, 0.09);
    },
    spotted() {
      blip("square", 660, 660, 0.07, 0.12);
      blip("square", 990, 990, 0.09, 0.12, 0.08);
    },
    setKlaxon(on) {
      if (!ensure()) return;
      if (on && !klaxonTimer) {
        let hi = false;
        const toot = () => {
          hi = !hi;
          blip("square", hi ? 880 : 620, hi ? 880 : 620, 0.24, 0.1);
        };
        toot();
        klaxonTimer = setInterval(toot, 280);
      } else if (!on && klaxonTimer) {
        clearInterval(klaxonTimer);
        klaxonTimer = null;
      }
    },
    win() {
      blip("sawtooth", 60, 180, 0.8, 0.07);
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => blip("triangle", f, f, 0.13, 0.08, 0.15 + i * 0.11));
      blip("triangle", 1047, 1047, 0.5, 0.06, 0.62);
    },
    caught() {
      blip("sawtooth", 340, 95, 0.55, 0.12);
      blip("sine", 50, 45, 0.16, 0.13, 0.5);
    },
    // Called every frame with the alarm meter, 0..1.
    setAlarm(m) {
      if (!ctx) return;
      const t = ctx.currentTime;
      toneGain.gain.setTargetAtTime(m > 0.02 ? 0.08 * m : 0, t, 0.06);
      toneOsc.frequency.setTargetAtTime(200 + 720 * m, t, 0.06);
    },
  };
}
