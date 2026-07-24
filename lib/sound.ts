import type { SoundName } from "cuelume";

const soundPreferenceKey = "atmet.sound.enabled";
const soundPreferenceEvent = "atmet:sound-enabled";

let enabled = true;
let bound = false;

function readStoredSoundPreference() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(soundPreferenceKey) !== "false";
}

async function getCuelume() {
  return import("cuelume");
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
