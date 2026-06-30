self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Best Çiçekçilik", {
      body: data.body ?? "Yeni bir bildirim var.",
      icon: "/seo/favicon-96x96.png",
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
