import type { SoundName } from "cuelume";

const soundPreferenceKey = "atmet.sound.enabled";
const soundPreferenceEvent = "atmet:sound-enabled";

let enabled = true;
let bound = false;
let warmContext: AudioContext | null = null;

function readStoredSoundPreference() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(soundPreferenceKey) !== "false";
}

async function getCuelume() {
  return import("cuelume");
}

function getAudioContextCtor() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext ??
    null
  );
}

export function isAtmetSoundEnabled() {
  enabled = readStoredSoundPreference();
  return enabled;
}

export async function setAtmetSoundEnabled(value: boolean) {
  enabled = value;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(soundPreferenceKey, String(value));
    window.dispatchEvent(
      new CustomEvent(soundPreferenceEvent, { detail: { enabled: value } }),
    );
  }

  const { setEnabled } = await getCuelume();
  setEnabled(value);
}

export async function playAtmetSound(sound: SoundName) {
  if (!isAtmetSoundEnabled()) {
    return;
  }

  const { play } = await getCuelume();
  play(sound);
}

export async function playAtmetSuccessSound(options: { fallback?: boolean } = {}) {
  await playAtmetSound("success");

  if (options.fallback) {
    window.setTimeout(playSuccessFallback, 80);
  }
}

function playSuccessFallback() {
  if (!isAtmetSoundEnabled()) {
    return;
  }

  const AudioContextCtor = getAudioContextCtor();
  if (!AudioContextCtor) {
    return;
  }

  try {
    warmContext = warmContext ?? new AudioContextCtor();
    const context = warmContext;
    void context.resume();

    const masterGain = context.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(context.destination);

    [
      { decay: 0.09, frequency: 880, offset: 0, peak: 0.06 },
      { decay: 0.1, frequency: 1108.73, offset: 0.06, peak: 0.06 },
      { decay: 0.18, frequency: 1318.51, offset: 0.12, peak: 0.07 },
    ].forEach((layer) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = context.currentTime + layer.offset;
      const endAt = startAt + layer.decay;

      oscillator.type = "sine";
      oscillator.frequency.value = layer.frequency;
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(layer.peak, startAt + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
      oscillator.connect(gain);
      gain.connect(masterGain);
      oscillator.start(startAt);
      oscillator.stop(endAt + 0.02);
    });
  } catch {
    // Cuelume remains the primary sound path; this only covers blocked first plays.
  }
}

export function warmAtmetAudio() {
  if (!isAtmetSoundEnabled() || typeof window === "undefined") {
    return;
  }

  const AudioContextCtor = getAudioContextCtor();

  if (!AudioContextCtor) {
    return;
  }

  try {
    warmContext = warmContext ?? new AudioContextCtor();
    const oscillator = warmContext.createOscillator();
    const gain = warmContext.createGain();
    gain.gain.value = 0;
    oscillator.connect(gain);
    gain.connect(warmContext.destination);
    oscillator.start();
    oscillator.stop(warmContext.currentTime + 0.01);
    void warmContext.resume();
  } catch {
    // Browser audio warm-up is best effort.
  }
}

export function bindAtmetSounds() {
  if (typeof window === "undefined" || bound) {
    return;
  }

  bound = true;
  enabled = readStoredSoundPreference();

  void getCuelume().then(({ bind, setEnabled }) => {
    setEnabled(enabled);
    bind();
  });

  window.addEventListener(soundPreferenceEvent, (event) => {
    const nextEnabled =
      event instanceof CustomEvent && typeof event.detail?.enabled === "boolean"
        ? event.detail.enabled
        : readStoredSoundPreference();

    enabled = nextEnabled;
    void getCuelume().then(({ setEnabled }) => setEnabled(nextEnabled));
  });
}
