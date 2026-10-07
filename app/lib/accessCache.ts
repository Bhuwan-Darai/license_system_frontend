"use client";

import { useSyncExternalStore } from "react";

/**
 * The signed-in user's permission codes, kept in localStorage so the menu can
 * render straight away while /auth/me is still loading.
 *
 * This is a cache, not a source of truth: it is overwritten by every /auth/me
 * response, cleared on logout, never used to decide who is logged in, and every
 * API call is checked again by the backend. The checksum only detects casual
 * edits or corruption, it cannot stop someone who is determined, because
 * anything stored in the browser can be rewritten by whoever owns the browser.
 */
const KEY = "license_access";
const VERSION = 1;
const SALT = "license-access-v1";
const CHANGE_EVENT = "license-access-change";

interface Stored {
  v: number;
  uid: string;
  perms: string[];
  sig: string;
}

// cyrb53, a small non-cryptographic hash. Enough for tamper evidence.
const hash = (input: string) => {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
};

const sign = (uid: string, perms: string[]) =>
  hash(`${SALT}|${uid}|${[...perms].sort().join(",")}`);

const EMPTY: string[] = [];

export function saveAccessCache(uid: string, perms: string[]) {
  try {
    const value: Stored = { v: VERSION, uid, perms, sig: sign(uid, perms) };
    localStorage.setItem(KEY, JSON.stringify(value));
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
    const parsed = JSON.parse(raw) as Stored;
    const valid =
      parsed.v === VERSION &&
      typeof parsed.uid === "string" &&
      Array.isArray(parsed.perms) &&
      parsed.perms.every((p) => typeof p === "string") &&
      parsed.sig === sign(parsed.uid, parsed.perms);
    if (valid) lastPerms = parsed.perms;
    else localStorage.removeItem(KEY); // edited or corrupted, discard it
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
