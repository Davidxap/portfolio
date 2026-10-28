/** Radio static for the IKAI cartridge (Web Audio, no files). It never starts on its own: `start` must be called from a user gesture,
 * and the level follows the site sound toggle (muted means silent, the context is not even created while muted). */
import { isMuted, onMuteChange } from "@/lib/sound";

export type Static = { setLevel: (n: number) => void; setDread: (n: number) => void; stop: () => void };

const MAX_GAIN = 0.09;

export function startStatic(): Static | null {
  const Ctor = typeof window === "undefined" ? undefined : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  if (!Ctor) return null;
  let ctx: AudioContext;
  try { ctx = new Ctor(); } catch { return null; }
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1800;
  band.Q.value = 0.7;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  src.connect(band).connect(gain).connect(ctx.destination);
  src.start();
  // Whisper bed: the same noise through a narrow, slowly breathing band. It only grows with dread.
  const wsrc = ctx.createBufferSource();
  wsrc.buffer = buf; wsrc.loop = true; wsrc.playbackRate.value = 0.6;
  const wband = ctx.createBiquadFilter();
  wband.type = "bandpass"; wband.frequency.value = 780; wband.Q.value = 5;
  const wgain = ctx.createGain();
  wgain.gain.value = 0;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.27;
  const depth = ctx.createGain();
  depth.gain.value = 0.012;
  lfo.connect(depth).connect(wgain.gain);
  wsrc.connect(wband).connect(wgain).connect(ctx.destination);
  wsrc.start(); lfo.start();
  void ctx.resume?.();

  let level = 0, dread = 0;
  const apply = () => {
    gain.gain.setTargetAtTime(isMuted() ? 0 : level * MAX_GAIN, ctx.currentTime, 0.08);
    wgain.gain.setTargetAtTime(isMuted() ? 0 : dread * 0.03, ctx.currentTime, 0.4);
  };
  const off = onMuteChange(apply);
  return {
    setLevel: (n) => { level = Math.max(0, Math.min(1, n)); apply(); },
    setDread: (n) => { dread = Math.max(0, Math.min(1, n)); apply(); },
    stop: () => { off(); try { src.stop(); wsrc.stop(); lfo.stop(); } catch { /* already stopped */ } void ctx.close(); },
  };
}
