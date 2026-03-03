import { supabase } from "../lib/supabase";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  return null;
}

export async function subscribeUserToPush() {
  if (!VAPID_PUBLIC_KEY) {
    console.error('VAPID_PUBLIC_KEY is not defined');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save subscription to Supabase
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        subscription: subscription.toJSON(),
      }, {
        onConflict: 'user_id,subscription'
      });

    if (error) {
      console.error('Error saving push subscription to Supabase:', error);
    } else {
      console.log('Push subscription saved to Supabase');
    }
  } catch (error) {
    console.error('Failed to subscribe user to push:', error);
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification');
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    await subscribeUserToPush();
    return true;
  }
  return false;
}

export async function sendPushNotification(userIds: string[], title: string, body: string, data?: any) {
  try {
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_ids: userIds,
        title,
        body,
        data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error sending push notification:', error);
    }
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}
