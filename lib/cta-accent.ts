export type CtaAccentPreference = "blue" | "current";

export const ctaAccentStorageKey = "atmet-cta-accent";

export const blueCtaButtonClassName =
  "!border-[#1e90ff] !bg-[#1e90ff] !text-white hover:!bg-[#187de0] data-pressed:!bg-[#187de0] *:data-[slot=button-loading-indicator]:!text-white";

export function getInitialCtaAccentPreference(): CtaAccentPreference {
  if (typeof window === "undefined") {
    return "current";
  }

  return window.localStorage.getItem(ctaAccentStorageKey) === "blue"
    ? "blue"
    : "current";
}

export function saveCtaAccentPreference(preference: CtaAccentPreference) {
  if (typeof window === "undefined") {
    return;
  }

  if (preference === "blue") {
    window.localStorage.setItem(ctaAccentStorageKey, preference);
  } else {
    window.localStorage.removeItem(ctaAccentStorageKey);
  }
}
