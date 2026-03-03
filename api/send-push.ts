import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT!;

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let { user_ids, title, body, data } = req.body;

  // Handle singular user_id if provided
  if (req.body.user_id && !user_ids) {
    user_ids = [req.body.user_id];
  }

  if (!user_ids) {
    return res.status(400).json({ error: 'user_ids is required' });
  }

  const ids = Array.isArray(user_ids) ? user_ids : [user_ids];

  if (ids.length === 0) {
    return res.status(400).json({ error: 'user_ids must be a non-empty array' });
  }

  try {
    // Fetch push subscriptions for the given user_ids
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .in('user_id', ids);

    if (error) {
      console.error('Error fetching push subscriptions:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ message: 'No subscriptions found for the given user_ids' });
    }

    const payload = JSON.stringify({
      title,
      body,
      data,
    });

    const pushPromises = subscriptions.map((sub: any) =>
      webpush.sendNotification(sub.subscription, payload).catch((err) => {
        console.error('Error sending push notification:', err);
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription is expired or invalid, remove it from Supabase
          return supabase
            .from('push_subscriptions')
            .delete()
            .eq('subscription', JSON.stringify(sub.subscription));
        }
      })
    );

    await Promise.all(pushPromises);

    return res.status(200).json({ message: 'Push notifications sent successfully' });
  } catch (error) {
    console.error('Error in send-push handler:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
