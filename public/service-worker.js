// service-worker.js

console.log('Service Worker registered.');

self.addEventListener('push', (event) => {
  const data = event.data.json();
  console.log('Push received:', data);

  const title = data.title || 'RecordaMedic';
  const options = {
    body: data.body || 'Es hora de tomar tu medicamento.',
    icon: '/pill-icon-192x192.png' // Puedes reemplazar esto con la ruta a un icono de tu app
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked.', event);
  event.notification.close();

  // Aquí puedes añadir lógica para abrir una ventana o pestaña específica
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('welcome') && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no hay una ventana abierta, abre una nueva
      if (clients.openWindow) {
        return clients.openWindow('/'); // Reemplaza con la URL de tu página principal
      }
    })
  );
});

// Puedes añadir un evento install y activate si necesitas precachear recursos
/*
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  // Precacha algunos recursos si es necesario
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  // Limpia cachés viejas si es necesario
});
*/ 