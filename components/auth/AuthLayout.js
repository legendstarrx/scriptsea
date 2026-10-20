import Link from 'next/link';
import { Icon } from '../ui';

const MODELS = ['Seedance', 'Kling', 'Veo', 'Sora'];

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* glow */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />

      <Link href="/" className="relative flex items-center gap-2.5">
        <img src="/favicon.svg" alt="" className="h-9 w-9 rounded-xl" />
        <span className="text-xl font-bold text-white">ScriptSea</span>
      </Link>

      <div className="relative">
        <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
          Your next viral video starts with <span className="text-brand-400">one line.</span>
        </h2>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-zinc-400">
          Type an idea. Get the script. Get the AI video prompts. Post today.
        </p>

        {/* mock output */}
        <div className="mt-10 max-w-md rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-300">
            <Icon name="sparkles" className="h-3.5 w-3.5" /> Your script
          </div>
          <p className="mt-3 text-[15px] font-semibold text-white">I stopped paying $80 for serum after I read the label</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            <span className="rounded bg-brand-500/25 px-1 text-white">Your expensive serum is mostly water.</span>{' '}
            I checked mine. Vitamin C was the fifth ingredient…
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {MODELS.map((m) => (
              <span key={m} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-zinc-200">{m}</span>
            ))}
          </div>
        </div>
      </div>

      <ul className="relative flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
        {['3 free scripts', 'No credit card', 'Ready in seconds'].map((t) => (
          <li key={t} className="flex items-center gap-2">
            <Icon name="check" className="h-4 w-4 text-brand-400" /> {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-white font-sans text-zinc-900 lg:grid-cols-2">
      <BrandPanel />
      <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 lg:invisible">
            <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold text-brand-500">ScriptSea</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900">
            ← Back to site
          </Link>
        </div>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px] animate-fade-up">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">{title}</h1>
            {subtitle && <p className="mt-2 text-base text-zinc-500">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-zinc-500">{footer}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}

export function GoogleButton({ onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-white text-[15px] font-semibold text-zinc-800 ring-1 ring-inset ring-zinc-200 transition hover:bg-zinc-50 hover:ring-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-60"
    >
      <img src="/google.svg" alt="" className="h-5 w-5" />
      {children}
    </button>
  );
}

export function OrDivider({ label = 'or with email' }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-zinc-200" />
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</span>
      <div className="h-px flex-1 bg-zinc-200" />
    </div>
  );
}

export function PasswordInput({ value, onChange, show, onToggle, ...props }) {
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="h-12 w-full rounded-2xl border-0 bg-white px-4 pr-12 text-base text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 transition focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-zinc-400 transition hover:text-zinc-700"
      >
        <Icon name={show ? 'eyeOff' : 'eye'} className="h-5 w-5" />
      </button>
    </div>
  );
}
