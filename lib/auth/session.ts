import type { User } from "@supabase/supabase-js";

export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export function isUserSessionExpired(user: User, now = Date.now()) {
  const signedInAt = user.last_sign_in_at ?? user.created_at;
  const signedInTime = Date.parse(signedInAt);

  if (!Number.isFinite(signedInTime)) {
    return false;
  }

  return now - signedInTime > SESSION_MAX_AGE_MS;
}
