const publicVapidKey = "BLZNXoE4kYyoZkNYOGDXDevjj8E4dQiRIACgbSsIS98zlrUecW4m4WDETGfoQ89_GDMN0Odl2JJfgmRaY6VIAw0"; // venant du backend

// Convertir la clé (OBLIGATOIRE)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}


// FONCTION PRINCIPALE
export async function subscribeUser() {

  if (!('serviceWorker' in navigator)) {
    console.log("Service Worker non supporté");
    return;
  }

  if (!('PushManager' in window)) {
    console.log("Push non supporté");
    return;
  }

  try {
    // 1. Enregistrer ton sw.js
    const registration = await navigator.serviceWorker.register('/sw.js');

    console.log("SW enregistré ");

    // 2. Permission
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log("Permission refusée ");
      return;
    }

    // 3. S’abonner (LE PLUS IMPORTANT)
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    console.log("Subscription:", subscription);

    // 4. Envoyer au backend
    await fetch('https://resto-back-xazy.onrender.com/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("Utilisateur abonné ");

  } catch (error) {
    console.error("Erreur:", error);
  }
}