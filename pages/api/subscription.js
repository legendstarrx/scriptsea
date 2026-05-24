import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, plan } = req.body;

    if (!userId || !plan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: userRow, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_type')
      .eq('id', userId)
      .maybeSingle();
    if (fetchError) throw fetchError;

    if (!userRow) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscriptionType = userRow?.subscription_type || 'monthly';

    const scriptsLimit = plan === 'pro' ? (subscriptionType === 'yearly' ? 1200 : 100) : 0;
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription: plan,
        scripts_remaining: scriptsLimit,
        scripts_limit: scriptsLimit,
        paid: plan === 'pro',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    if (updateError) throw updateError;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Subscription update error:', error);
    return res.status(500).json({ error: 'Failed to update subscription' });
  }
} 
 