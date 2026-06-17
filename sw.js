const CACHE = 'rta-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Réception d'un message depuis la page pour programmer les notifs
self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SCHEDULE_CHECK') {
    checkAndNotify(e.data.payload);
  }
});

// Notification push déclenchée par l'alarm (via setInterval dans la page)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Road to Apollon', {
      body: data.body || 'Check ton app !',
      icon: data.icon || '/icon.png',
      badge: data.badge || '/icon.png',
      tag: data.tag || 'rta-notif',
      renotify: true,
      requireInteraction: false,
      vibrate: [200, 100, 200]
    })
  );
});

// Clic sur la notif → ouvre l'app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
      for(const c of list) {
        if(c.url.includes(self.location.origin)) return c.focus();
      }
      return clients.openWindow('/');
    })
  );
});

// Fonction appelée par message depuis la page
async function checkAndNotify(payload) {
  const {seanceDone, seanceType, hour} = payload;
  if(seanceDone) return; // déjà fait, pas de notif
  const msgs = [
    `Allez, ta séance ${seanceType} t'attend. T'as pas d'excuse.`,
    `${seanceType} aujourd'hui — le mec qui veut devenir rentable dort pas, il s'entraîne.`,
    `Séance ${seanceType} pas encore faite. La petite voix dit "c'est bon" — ignore-la.`,
    `C'est l'heure. ${seanceType}. 10 minutes pour commencer, tu finis toujours.`,
    `Road to Apollon. Séance ${seanceType} en attente. Le monologue interne a encore gagné ?`,
  ];
  const body = msgs[Math.floor(Math.random() * msgs.length)];
  await self.registration.showNotification('Road to Apollon 💪', {
    body,
    tag: 'rta-seance',
    renotify: true,
    vibrate: [200, 100, 200],
    requireInteraction: false,
  });
}
