import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:' + process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (err) {
    // subscription expired or invalid
    if (err.statusCode === 410 || err.statusCode === 404) {
      return 'expired';
    }
    console.error('Push error:', err);
    return false;
  }
}

export default webpush;
