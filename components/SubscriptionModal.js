import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasProAccess } from '../utils/subscription';
import { Alert, Badge, Button, Icon, Modal, cx } from './ui';

const WHATSAPP_NUMBER = '+447474762495';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`;

const PRO_FEATURES = [
  'Scripts from 15 seconds up to 60 minutes',
  'AI video prompts for Seedance, Kling, Veo & Sora',
  'Copy and export to PDF or Word',
  'Write in the style of top creators',
  'Priority support',
];

const PLANS = {
  weekly: { name: 'Pro Weekly', price: '$4.99', per: '/week', scripts: '15 scripts every week', note: 'Good for a busy week' },
  monthly: { name: 'Pro Monthly', price: '$19.99', per: '/month', scripts: '60 scripts every month', note: '4× the scripts. Best price per script.' },
};

function FeatureList({ className }) {
  return (
    <ul className={cx('space-y-2.5', className)}>
      {PRO_FEATURES.map((f) => (
        <li key={f} className="flex items-start gap-2.5 text-[15px] text-zinc-700">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          {f}
        </li>
      ))}
    </ul>
  );
}

function PlanCard({ plan, featured, onSelect, loading, cta }) {
  const p = PLANS[plan];
  return (
    <div className={cx('relative flex flex-col rounded-3xl p-5 transition',
      featured ? 'bg-white ring-2 ring-brand-500 shadow-lift' : 'bg-white ring-1 ring-zinc-200')}>
      {featured && (
        <span className="absolute -top-3 left-5 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white shadow-brand">
          Best value
        </span>
      )}
      <p className="text-sm font-semibold text-zinc-500">{p.name}</p>
      <p className="mt-2 flex items-baseline gap-1">
        <span className={cx('text-4xl font-bold tracking-tight', featured ? 'text-brand-600' : 'text-zinc-950')}>{p.price}</span>
        <span className="text-zinc-500">{p.per}</span>
      </p>
      <p className="mt-1 text-[15px] font-semibold text-zinc-900">{p.scripts}</p>
      <p className="mt-0.5 text-sm text-zinc-500">{p.note}</p>
      <Button variant={featured ? 'primary' : 'secondary'} size="lg" className="mt-5 w-full" loading={loading} onClick={onSelect}>
        {cta}
      </Button>
    </div>
  );
}

const SubscriptionModal = ({ isOpen, onClose, userProfile }) => {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');

  const isPro = hasProAccess(userProfile || {});
  const subType = userProfile?.subscriptionType || userProfile?.subscription_type;
  const isWeekly = subType === 'weekly';
  const isMonthly = subType === 'monthly';

  const handleUpgrade = async (plan) => {
    try {
      setLoadingPlan(plan);
      setError('');
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId: user?.uid, email: user?.email }),
      });
      const data = await response.json();
      if (data.success && data.paymentLink) {
        window.location.href = data.paymentLink;
        return;
      }
      setError('Could not create the payment link. Please try again.');
    } catch (_err) {
      setError('Something went wrong. Please try again.');
    }
    setLoadingPlan(null);
  };

  if (!isOpen) return null;

  // ── Already on monthly (best plan) ──────────────────────────────────────
  if (isPro && isMonthly) {
    return (
      <Modal onClose={onClose} size="sm" labelledBy="sub-title">
        <div className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-brand">
            <Icon name="crown" className="h-7 w-7" />
          </div>
          <Badge className="mt-5">Pro Monthly</Badge>
          <h2 id="sub-title" className="mt-3 text-2xl font-bold text-zinc-950">You&apos;re on our best plan</h2>
          <p className="mt-2 text-zinc-500">60 scripts every month and everything ScriptSea can do, at the best price.</p>
          <Button size="lg" className="mt-6 w-full" onClick={onClose}>Back to creating</Button>
        </div>
      </Modal>
    );
  }

  // ── Weekly → upsell monthly ─────────────────────────────────────────────
  if (isPro && isWeekly) {
    return (
      <Modal onClose={onClose} size="md" labelledBy="sub-title">
        <div className="p-6 sm:p-8">
          <Badge tone="zinc">Current plan: Pro Weekly</Badge>
          <h2 id="sub-title" className="mt-3 text-2xl font-bold text-zinc-950">Get 4× the scripts for less</h2>
          <p className="mt-2 text-zinc-500">Monthly gives you 60 scripts for $19.99. Weekly works out to about $21.60 a month for 15 a week.</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <p className="text-sm text-zinc-500">Weekly</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">$4.99</p>
              <p className="text-sm text-zinc-500">15 scripts / week</p>
            </div>
            <div className="rounded-2xl bg-brand-50 p-4 ring-2 ring-brand-500">
              <p className="text-sm font-semibold text-brand-600">Monthly</p>
              <p className="mt-1 text-2xl font-bold text-brand-600">$19.99</p>
              <p className="text-sm font-semibold text-zinc-800">60 scripts / month</p>
            </div>
          </div>

          {error && <div className="mt-5"><Alert>{error}</Alert></div>}
          <Button size="lg" className="mt-6 w-full" loading={loadingPlan === 'monthly'} onClick={() => handleUpgrade('monthly')}>
            Upgrade to Monthly · $19.99
          </Button>
          <Button variant="ghost" className="mt-2 w-full" onClick={onClose}>Stay on Weekly</Button>
        </div>
      </Modal>
    );
  }

  // ── Not Pro → both plans ────────────────────────────────────────────────
  return (
    <Modal onClose={onClose} size="lg" labelledBy="sub-title">
      <div className="grid md:grid-cols-[1fr_1.15fr]">
        <div className="rounded-t-3xl bg-ink p-6 text-white sm:p-8 md:rounded-l-3xl md:rounded-tr-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 shadow-brand">
            <Icon name="crown" className="h-6 w-6" />
          </div>
          <h2 id="sub-title" className="mt-5 text-2xl font-bold leading-tight sm:text-3xl">
            Go Pro. <span className="text-brand-400">Post every day.</span>
          </h2>
          <p className="mt-3 text-zinc-400">Everything you need to go from idea to finished AI video, without limits on length.</p>
          <ul className="mt-6 space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[15px] text-zinc-200">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" strokeWidth={3} /> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 sm:p-8">
          <div className="space-y-5 pt-2">
            <PlanCard plan="monthly" featured cta="Get Pro Monthly" loading={loadingPlan === 'monthly'} onSelect={() => handleUpgrade('monthly')} />
            <PlanCard plan="weekly" cta="Get Pro Weekly" loading={loadingPlan === 'weekly'} onSelect={() => handleUpgrade('weekly')} />
          </div>
          {error && <div className="mt-5"><Alert>{error}</Alert></div>}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5"><Icon name="shield" className="h-4 w-4" /> Secure checkout</span>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-medium text-zinc-600 hover:text-zinc-900">
              <Icon name="whatsapp" className="h-4 w-4 text-[#25D366]" /> Questions? Chat with us
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export { FeatureList };
export default SubscriptionModal;
