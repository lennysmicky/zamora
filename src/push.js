// src/push.js
import client from './api/client';

// Fonction utilitaire pour convertir la clé VAPID publique
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Fonction pour abonner le restaurant au Web Push
export const subscribeToWebPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log("Ce navigateur ne supporte pas le Web Push");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Récupérer la clé publique VAPID de ton fichier .env
    const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      console.error(" Clé VITE_VAPID_PUBLIC_KEY manquante dans le fichier .env");
      return;
    }

    const convertedKey = urlBase64ToUint8Array(publicKey);

    // Demande l'abonnement au navigateur
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey
    });

    console.log("Abonnement Web Push généré avec succès !");

    // ENVOYER L'ABONNEMENT AU BACKEND POUR LE SAUVEGARDER
    await client.post('/push/subscribe', { subscription });
    console.log("Abonnement envoyé et sauvegardé sur le backend !");

    return subscription;
  } catch (error) {
    console.error("Erreur lors de l'abonnement Web Push:", error);
  }
};