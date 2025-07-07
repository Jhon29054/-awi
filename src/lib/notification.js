// Reemplaza 'YOUR_VAPID_PUBLIC_KEY' con tu clave pública VAPID
// Puedes generar un par de claves VAPID usando herramientas como web-push-libs
// La clave pública es la que va aquí, la privada va en tu backend.
const applicationServerKey = 'YOUR_VAPID_PUBLIC_KEY'; // <<<--- ¡IMPORTANTE! Reemplaza esto con tu clave pública VAPID

export function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("Este navegador no soporta notificaciones de escritorio");
    return false;
  }
  
  if (Notification.permission === "granted") {
    return true;
  }
  
  if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        return true;
      }
    });
  }
  
  return Notification.permission === "granted";
}

export function sendNotification(title, options = {}) {
  if (!("Notification" in window)) {
    console.log("Este navegador no soporta notificaciones de escritorio");
    return;
  }
  
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "/vite.svg",
      ...options
    });
    
    if (options.onClick) {
      notification.onclick = options.onClick;
    }
    
    if (options.timeout) {
      setTimeout(() => {
        notification.close();
      }, options.timeout);
    }
    
    return notification;
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        sendNotification(title, options);
      }
    });
  }
}

export function scheduleNotification(title, options = {}, scheduledTime) {
  const now = new Date().getTime();
  const scheduleTime = scheduledTime.getTime();
  const timeUntilNotification = scheduleTime - now;
  
  // Tiempo en milisegundos para la notificación de advertencia antes de tiempo (ej: 5 minutos)
  const earlyAlertTimeOffset = 5 * 60 * 1000;
  const timeUntilEarlyAlert = timeUntilNotification - earlyAlertTimeOffset;

  // Limpiar cualquier timer existente para este recordatorio si lo hubiera (requeriría un mecanismo para guardar y limpiar timers)
  // if (options.tag && window.notificationTimers && window.notificationTimers[options.tag]) {
  //   clearTimeout(window.notificationTimers[options.tag].main);
  //   clearTimeout(window.notificationTimers[options.tag].early);
  // }

  const timers = {};

  // Programar notificación principal a la hora exacta
  if (timeUntilNotification > 0) {
    timers.main = setTimeout(() => {
      sendNotification(title, options);
      // TODO: Aquí enviar señal al backend de que se envió la notificación y el backend empiece a mandar pushes repetidos
      console.log(`Notificación principal programada para: ${scheduledTime.toLocaleString()}`);
    }, timeUntilNotification);
  } else {
     // Si la hora ya pasó, enviar inmediatamente (esto ya lo hacía)
     sendNotification(title, options);
     console.log(`Notificación principal enviada inmediatamente para: ${scheduledTime.toLocaleString()}`);
  }

  // Programar notificación de advertencia temprana
  if (timeUntilEarlyAlert > 0) {
    timers.early = setTimeout(() => {
       sendNotification(`Próximo Recordatorio: ${title}`, { 
          body: `Prepárate para tomar tu medicamento en 5 minutos. ${options.body || ''}`,
          icon: options.icon,
          tag: `early-${options.tag}` // Usar un tag diferente
        });
       console.log(`Notificación de advertencia programada para: ${new Date(now + timeUntilEarlyAlert).toLocaleString()}`);
    }, timeUntilEarlyAlert);
  }

  // TODO: Devolver o almacenar los timers si necesitas cancelarlos (ej: si el usuario marca tomado antes)
  // if (options.tag) {
  //   if (!window.notificationTimers) window.notificationTimers = {};
  //   window.notificationTimers[options.tag] = timers;
  // }

  return timers; // Devolver los timers programados
}

export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator)) {
    console.log('Este navegador no soporta Service Workers.');
    return null;
  }

  if (!('PushManager' in window)) {
    console.log('Este navegador no soporta Push API.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('Usuario ya suscrito a push:', subscription);
      return subscription;
    }

    // Convertir la clave pública VAPID de Base64 a un ArrayBuffer
    const rawApplicationServerKey = urlBase64ToUint8Array(applicationServerKey);

    console.log('Suscribiendo usuario a push...');
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: rawApplicationServerKey
    });

    console.log('Usuario suscrito a push con éxito:', subscription);
    // TODO: Aquí debes enviar el objeto 'subscription' a tu backend
    // para almacenarlo asociado al usuario.
    console.log('Datos de suscripción para enviar al backend:', JSON.stringify(subscription));

    return subscription;

  } catch (error) {
    console.error('Fallo al suscribir al usuario a push:', error);
    // Podría ser que el usuario no dio permiso, o VAPID key incorrecta, etc.
    return null;
  }
}

// Helper function para convertir la clave VAPID pública
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}