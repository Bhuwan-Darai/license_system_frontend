"use client";

import { useSyncExternalStore } from "react";

/**
 * The signed-in user's permission codes, kept in localStorage as a stringified
 * array of strings so the menu can render straight away while /auth/me loads.
 *
 * This is only a cache: it is overwritten on login, by every /auth/me response
 * and by the permission stream, cleared on logout, and every API call is
 * checked again by the backend.
 */
const KEY = "permissions";
const CHANGE_EVENT = "license-access-change";

const EMPTY: string[] = [];

export function saveAccessCache(perms: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(perms));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // storage can be unavailable (private mode, quota), the cache is optional
  }
}

export function clearAccessCache() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore
  }
}

// useSyncExternalStore needs the same array back while the raw value is unchanged
let lastRaw: string | null | undefined;
let lastPerms: string[] = EMPTY;

function readPerms(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === lastRaw) return lastPerms;

  lastRaw = raw;
  lastPerms = EMPTY;
  if (!raw) return lastPerms;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((p) => typeof p === "string")) {
      lastPerms = parsed;
    } else {
      localStorage.removeItem(KEY);
    }
  } catch {
    localStorage.removeItem(KEY);
  }
  return lastPerms;
}

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
};

/** Cached permission codes. Empty on the server and when nothing valid is stored. */
export function useCachedPermissions(): string[] {
  return useSyncExternalStore(subscribe, readPerms, () => EMPTY);
}
