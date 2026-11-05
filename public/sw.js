// Service worker for Web Push. It only shows notifications sent by the backend
// (payload: { title, body, url, tag }) and opens the dashboard when one is clicked.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Likhit Yatra";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      tag: data.tag || undefined,
      // sound: false = let the OS play its default notification sound (the Web
      // Push API cannot pick a custom one). renotify makes a repeat with the same
      // tag alert again instead of updating silently.
      silent: false,
      renotify: Boolean(data.tag),
      vibrate: [200, 100, 200],
      icon: "/favicon.ico",
      data: { url: typeof data.url === "string" ? data.url : "/dashboard" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // same origin paths only
  const raw = (event.notification.data && event.notification.data.url) || "/dashboard";
  const target = new URL(raw, self.location.origin);
  const url = target.origin === self.location.origin ? target.href : self.location.origin + "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const w of windows) {
        if (w.url.startsWith(self.location.origin) && "focus" in w) {
          w.navigate(url);
          return w.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
