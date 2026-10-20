import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const publicPages = ['/pricing', '/privacy', '/login', '/register', '/auth/callback'];

export function FullPageSpinner({ label }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white font-sans">
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        <img src="/favicon.svg" alt="" width={48} height={48} className="h-12 w-12 rounded-2xl shadow-brand" />
        <div className="h-1 w-28 overflow-hidden rounded-full bg-brand-100">
          <div className="ss-bar h-full w-2/5 rounded-full bg-brand-500" />
        </div>
        {label && <p className="text-sm text-zinc-500">{label}</p>}
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isPublic = publicPages.includes(router.pathname);

  useEffect(() => {
    if (!router.isReady || loading || user || isPublic) return;
    // Send them back here after they sign in.
    const next = encodeURIComponent(router.asPath);
    router.replace(`/login?next=${next}`);
  }, [user, loading, router, isPublic]);

  if (isPublic) return children;
  if (loading || !user) return <FullPageSpinner />;
  return children;
}
