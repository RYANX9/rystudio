const CACHE_NAME = 'tracker-v3';
const STATIC_ASSETS = ['/', '/manifest.json'];

// ─── Install ───────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ─── Activate ──────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ─── Message from client: CHECK_REMINDERS ──────────────────────────────────
// The page sends this every 30s while it's open. Service worker does the actual fetch.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_REMINDERS') {
    event.waitUntil(checkReminders());
  }
});

// ─── Reminder check ────────────────────────────────────────────────────────
async function checkReminders() {
  try {
    const base = self.registration.scope;
    const res = await fetch(`${base}api/reminders`);
    if (!res.ok) return;

    const reminders = await res.json();
    if (!Array.isArray(reminders)) return;

    const now = Date.now();

    for (const r of reminders) {
      if (r.sent) continue;
      const remindTime = new Date(r.remind_at).getTime();
      const diff = now - remindTime;
      // fire if overdue by 0–90 seconds (matches 30s poll + buffer)
      if (diff >= 0 && diff < 90000) {
        await fireReminder(r);
      }
    }
  } catch (_) {}
}

async function fireReminder(r) {
  await self.registration.showNotification(r.label, {
    body: `Reminder set for ${new Date(r.remind_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `reminder-${r.id}`,
    renotify: true,
    vibrate: [300, 100, 300, 100, 300],
    requireInteraction: true,
    data: { url: '/', reminderId: r.id },
  });

  // mark sent on server
  try {
    const base = self.registration.scope;
    await fetch(`${base}api/reminders`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: r.id, action: 'send' }),
    });
  } catch (_) {}

  // tell open tabs to play sound + refresh list
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: 'REMINDER_FIRED', reminderId: r.id, label: r.label });
  }
}

// ─── Incoming web push (from server) ───────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Tracker', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'reminder',
      renotify: true,
      vibrate: [300, 100, 300, 100, 300],
      requireInteraction: true,
      data: { url: data.url || '/' },
    })
  );
});

// ─── Notification click ────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) return clientList[0].focus();
        return self.clients.openWindow(event.notification.data?.url || '/');
      })
  );
});
