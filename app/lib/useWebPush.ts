"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/app/utils/axios";

type PushPermission = NotificationPermission | "unsupported";

const isSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

/** The VAPID key is URL-safe base64, PushManager wants raw bytes. */
function keyToBytes(base64Url: string): Uint8Array<ArrayBuffer> {
  const padded = base64Url + "=".repeat((4 - (base64Url.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function subscribe(): Promise<void> {
  const { data } = await api.get<{
    data: { enabled: boolean; public_key: string };
  }>("/push/key");
  if (!data.data.enabled || !data.data.public_key) {
    throw new Error("Push is not configured on the server (VAPID keys missing). Restart the backend.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyToBytes(data.data.public_key),
    });
  }
  // idempotent on the server, so it also re-links the browser after a new login
  await api.post("/push/subscribe", subscription.toJSON());
}

/**
 * Browser push notifications for the dashboard (e.g. a new website inquiry).
 *
 * With `enabled`, a browser that already granted permission is (re)subscribed
 * on load. `enable()` asks for permission and must be called from a click.
 * Web Push needs HTTPS (localhost counts) and a configured backend; when either
 * is missing nothing happens and `permission` stays usable for the UI.
 */
export function useWebPush(enabled: boolean) {
  const [permission, setPermission] = useState<PushPermission>("default");

  useEffect(() => {
    if (!isSupported()) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
    if (!enabled || Notification.permission !== "granted") return;
    subscribe().catch((e) => {
      // push is a convenience, the bell keeps working without it
      console.error("[web-push] subscribe failed:", e);
    });
  }, [enabled]);

  /** Resolves to null on success, otherwise a message saying what went wrong. */
  const enable = useCallback(async (): Promise<string | null> => {
    if (!isSupported()) {
      return "This browser or address does not support push (HTTPS or localhost is required).";
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== "granted") {
      return "Notifications are blocked. Allow them in the browser's site settings.";
    }
    try {
      await subscribe();
      return null;
    } catch (e) {
      console.error("[web-push] subscribe failed:", e);
      return e instanceof Error ? e.message : "Could not subscribe to push";
    }
  }, []);

  return { permission, enable };
}
