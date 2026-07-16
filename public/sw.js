// Yeni bir sürüm deploy edildiğinde eski Service Worker'ın telefonlarda
// inatla önbellekte kalmasını önler: install'de hemen aktifleşir, activate'te
// açık sekmelerin kontrolünü sayfa yenilemeyi beklemeden anında devralır.
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Dünyanın Çiçeği", {
      body: data.body ?? "Yeni bir bildirim var.",
      icon: "/icons/icon-192.png",
      badge: "/seo/favicon-96x96.png",
      tag: data.tag ?? "order",
      data: { url: data.url ?? "/admin/siparisler" },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/admin/siparisler";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});
