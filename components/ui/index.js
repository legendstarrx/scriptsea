import { useEffect, useRef } from 'react';
import Icon from './Icon';

export { Icon };

export const cx = (...classes) => classes.filter(Boolean).join(' ');

// ── Button ────────────────────────────────────────────────────────────────────
const BUTTON_VARIANTS = {
  primary: 'bg-brand-500 text-white shadow-brand hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-400 disabled:shadow-none',
  dark: 'bg-ink text-white hover:bg-ink-soft disabled:bg-zinc-300',
  secondary: 'bg-white text-zinc-800 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 hover:ring-zinc-300 disabled:text-zinc-400',
  soft: 'bg-brand-50 text-brand-600 hover:bg-brand-100 disabled:opacity-60',
  ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50',
  danger: 'bg-white text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50 disabled:opacity-50',
};
const BUTTON_SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-[15px] gap-2 rounded-xl',
  lg: 'h-14 px-6 text-base gap-2.5 rounded-2xl',
  icon: 'h-10 w-10 rounded-xl',
};

export function Button({ variant = 'primary', size = 'md', className, loading, icon, iconRight, children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={cx(
        'inline-flex select-none items-center justify-center font-semibold transition duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className
      )}
    >
      {loading ? <Spinner className="h-4 w-4" /> : icon && <Icon name={icon} className="h-[18px] w-[18px] shrink-0" />}
      {children}
      {iconRight && !loading && <Icon name={iconRight} className="h-[18px] w-[18px] shrink-0" />}
    </button>
  );
}

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={cx('animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Surfaces ──────────────────────────────────────────────────────────────────
export function Card({ className, children, ...props }) {
  return (
    <div {...props} className={cx('rounded-3xl bg-white shadow-card ring-1 ring-zinc-200/70', className)}>
      {children}
    </div>
  );
}

export function Badge({ tone = 'brand', className, children }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600 ring-brand-200/60',
    dark: 'bg-ink text-white ring-ink',
    zinc: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  };
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', tones[tone], className)}>
      {children}
    </span>
  );
}

// ── Form fields ───────────────────────────────────────────────────────────────
export function FieldLabel({ children, hint, right, htmlFor }) {
  return (
    <div className="mb-2 flex items-end justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-zinc-900">
        {children}
        {hint && <span className="ml-1.5 font-normal text-zinc-400">{hint}</span>}
      </label>
      {right}
    </div>
  );
}

const fieldBase =
  'w-full rounded-2xl border-0 bg-white px-4 text-base text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 ' +
  'transition focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-zinc-50';

export function TextInput({ className, ...props }) {
  return <input {...props} className={cx(fieldBase, 'h-12', className)} />;
}

export function TextArea({ className, ...props }) {
  return <textarea {...props} className={cx(fieldBase, 'resize-y py-3.5 leading-relaxed', className)} />;
}

// Selectable pill
export function Chip({ active, onClick, children, locked, className, ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      {...props}
      className={cx(
        'inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
        active
          ? 'bg-ink text-white shadow-sm'
          : 'bg-white text-zinc-700 ring-1 ring-inset ring-zinc-200 hover:ring-zinc-300 hover:bg-zinc-50',
        className
      )}
    >
      {children}
      {locked && <Icon name="lock" className={cx('h-3.5 w-3.5', active ? 'text-white/70' : 'text-zinc-400')} />}
    </button>
  );
}

// Big selectable card (style / platform pickers)
export function OptionCard({ active, onClick, icon, title, desc, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'group flex w-full items-start gap-3 rounded-2xl p-3.5 text-left transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
        active ? 'bg-brand-50 ring-2 ring-brand-500' : 'bg-white ring-1 ring-zinc-200 hover:ring-zinc-300',
        className
      )}
    >
      {icon && (
        <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          active ? 'bg-brand-500 text-white' : 'bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200')}>
          <Icon name={icon} className="h-[18px] w-[18px]" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-zinc-900">{title}</span>
        {desc && <span className="mt-0.5 block text-[13px] leading-snug text-zinc-500">{desc}</span>}
      </span>
    </button>
  );
}

export function Toggle({ checked, onChange, label, desc }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl bg-white p-4 text-left ring-1 ring-zinc-200 transition hover:ring-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      <span>
        <span className="block text-sm font-semibold text-zinc-900">{label}</span>
        {desc && <span className="mt-0.5 block text-[13px] text-zinc-500">{desc}</span>}
      </span>
      <span className={cx('relative h-7 w-12 shrink-0 rounded-full transition', checked ? 'bg-brand-500' : 'bg-zinc-200')}>
        <span className={cx('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-6' : 'left-1')} />
      </span>
    </button>
  );
}

export function Alert({ tone = 'error', children, onClose }) {
  const tones = {
    error: 'bg-red-50 text-red-700 ring-red-200',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    info: 'bg-brand-50 text-brand-700 ring-brand-200',
  };
  return (
    <div role="alert" className={cx('flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ring-1 ring-inset', tones[tone])}>
      <Icon name={tone === 'success' ? 'check' : 'info'} className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1 leading-relaxed">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} className="-m-1 rounded-lg p-1 opacity-60 hover:opacity-100" aria-label="Dismiss">
          <Icon name="x" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open = true, onClose, children, className, size = 'md', labelledBy }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-3xl' };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end justify-center bg-zinc-950/50 font-sans backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cx(
          'relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl outline-none animate-fade-up sm:rounded-3xl',
          widths[size], className
        )}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
