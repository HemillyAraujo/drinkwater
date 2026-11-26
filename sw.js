// Service worker: recebe as notificações mesmo com o app fechado.
importScripts("./config.js");

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    let data = null;
    try { data = event.data ? event.data.json() : null; } catch (e) {}
    if (!data) {
      try { data = await (await fetch(self.WORKER_URL + "/api/latest")).json(); } catch (e) {}
    }
    data = data || { title: "Hora de beber água 💧", body: "Um copinho agora? 💙" };
    const options = {
      body: data.body,
      icon: data.photoUrl || "./icons/icon-192.png",
      badge: "./icons/icon-192.png",
      tag: "lembrete-agua",
      renotify: true,
      data: { url: self.registration.scope },
    };
    if (data.photoUrl) options.image = data.photoUrl;
    await self.registration.showNotification(data.title || "Hora de beber água 💧", options);
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) { if ("focus" in c) return c.focus(); }
    return self.clients.openWindow(self.registration.scope);
  })());
});
