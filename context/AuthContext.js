import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { hasProAccess } from '../utils/subscription';

const AuthContext = createContext();

// ---------------------------------------------------------------------------
// localStorage profile cache — instant hydration on every page load
// ---------------------------------------------------------------------------
const CACHE_KEY = 'ss_profile_v1';

function readCache() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(profile) {
  if (typeof window === 'undefined') return;
  try {
    if (profile) localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(CACHE_KEY);
  } catch { /* private mode / quota — ignore */ }
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapProfile(row = {}) {
  const rawSub = String(row.subscription || '').toLowerCase().trim();
  const isNonPaid = !rawSub || rawSub === 'free' || rawSub === 'starter';
  const subscription = isNonPaid
    ? (row.subscription_status === 'active' ? 'pro' : rawSub || 'starter')
    : rawSub;

  return {
    id: row.id || null,
    email: row.email || null,
    displayName: row.display_name || null,
    photoURL: row.photo_url || null,
    subscription,
    subscriptionStatus: row.subscription_status || null,
    subscriptionType: row.subscription_type || null,
    scriptsRemaining: row.scripts_remaining ?? 0,
    scriptsGenerated: row.scripts_generated ?? 0,
    scriptsLimit: row.scripts_limit ?? 0,
    emailVerified: row.email_verified ?? false,
    paid: row.paid ?? false,
    isPro: hasProAccess(row),
    createdAt: row.created_at || null,
    lastLogin: row.last_login_at || null,
  };
}

function mapUser(u) {
  if (!u) return null;
  return {
    uid: u.id,
    id: u.id,
    email: u.email,
    displayName: u.user_metadata?.display_name || u.user_metadata?.full_name || null,
    photoURL: u.user_metadata?.avatar_url || null,
    emailVerified: Boolean(u.email_confirmed_at),
  };
}

// ---------------------------------------------------------------------------
// Server-side profile fetch — uses admin key (no RLS issues)
// Returns the profile row, { __unauthorized: true } on 401/403, or null when
// the request failed for any other reason (network, 5xx). Only a confirmed
// 401/403 may ever lead to signing the user out.
// ---------------------------------------------------------------------------

async function fetchProfileFromServer(accessToken) {
  if (!accessToken) return null;
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.status === 401 || res.status === 403) return { __unauthorized: true };
    if (!res.ok) return null;
    const payload = await res.json();
    return payload?.profile || null;
  } catch {
    return null;
  }
}

// Supabase keeps the session in localStorage under "sb-<project>-auth-token".
// Used only as a fallback when the auth client is slow to answer on boot, so a
// signed-in user is never treated as signed out just because of a slow network.
function readStoredSessionUser() {
  if (typeof window === 'undefined') return null;
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('sb-') || !key.endsWith('-auth-token')) continue;
      const parsed = JSON.parse(localStorage.getItem(key) || 'null');
      const stored = parsed?.currentSession || parsed;
      if (stored?.user && stored?.refresh_token) return stored.user;
    }
  } catch { /* ignore */ }
  return null;
}

// A refresh error means "this session is dead" only for 4xx auth errors.
// Network failures (no status / 5xx / 429) must never sign anyone out.
const isDeadSessionError = (err) =>
  Boolean(err) && Number(err.status) >= 400 && Number(err.status) < 500 && Number(err.status) !== 429;

const PROFILE_REFETCH_MS = 20000;

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }) {
  // Starts empty on server AND client so hydration matches; the cached profile
  // is applied right after mount (see below) so returning users see it instantly.
  const [userProfile, setUserProfile] = useState(null);
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const mounted         = useRef(true);
  const profileInFlight = useRef(null);
  const lastProfileAt   = useRef(0);

  // Apply a fresh profile to state + cache
  const applyProfile = useCallback((mapped) => {
    if (!mounted.current) return;
    writeCache(mapped);
    setUserProfile(mapped);
  }, []);

  // Clear everything on sign-out
  const clearSession = useCallback(() => {
    writeCache(null);
    setUser(null);
    setUserProfile(null);
  }, []);

  // Sign out THIS browser only. Never `signOut()` with the default global scope
  // from automatic code paths — that revokes the user's sessions on every device.
  const signOutLocal = useCallback(async () => {
    clearSession();
    setLoading(false);
    try {
      await supabase?.auth?.signOut({ scope: 'local' });
    } catch {
      // local state is already cleared
    }
  }, [clearSession]);

  /**
   * Load the profile for an access token. On a 401 it refreshes the session once
   * and retries; it only signs out when the session is confirmed dead. Calls
   * are de-duplicated, and event-driven calls are throttled.
   */
  const loadProfile = useCallback(async (accessToken, { force = false } = {}) => {
    if (!accessToken) return null;
    if (profileInFlight.current) return profileInFlight.current;
    if (!force && Date.now() - lastProfileAt.current < PROFILE_REFETCH_MS) return null;

    const run = (async () => {
      let row = await fetchProfileFromServer(accessToken);

      if (row?.__unauthorized) {
        // Most likely the access token expired while the tab was idle.
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        if (data?.session?.access_token) {
          row = await fetchProfileFromServer(data.session.access_token);
          if (row?.__unauthorized) {
            await signOutLocal(); // brand-new token still rejected → session is invalid
            return null;
          }
        } else if (isDeadSessionError(refreshError)) {
          await signOutLocal();
          return null;
        } else {
          return null; // network trouble — keep the user signed in
        }
      }

      if (row && mounted.current) {
        lastProfileAt.current = Date.now();
        const mapped = mapProfile(row);
        applyProfile(mapped);
        return mapped;
      }
      return null;
    })();

    profileInFlight.current = run;
    try {
      return await run;
    } finally {
      profileInFlight.current = null;
    }
  }, [applyProfile, signOutLocal]);

  // Show the cached profile immediately after hydration.
  useEffect(() => {
    const cached = readCache();
    if (cached) setUserProfile((current) => current ?? cached);
  }, []);

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    mounted.current = true;
    let settled = false;

    const settle = (sessionUser) => {
      if (!mounted.current) return;
      settled = true;
      if (sessionUser) setUser(mapUser(sessionUser));
      setLoading(false);
    };

    // If the auth client is slow (e.g. another tab is refreshing the token),
    // fall back to the stored session instead of treating the user as signed out.
    const safetyTimer = setTimeout(() => {
      if (!settled) settle(readStoredSessionUser());
    }, 6000);

    const boot = async () => {
      try {
        if (!supabase) {
          setError(new Error('Supabase is not configured.'));
          settle(null);
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!mounted.current) return;

        if (session?.user) {
          // Unblock the UI right away; the profile loads in the background.
          settle(session.user);
          loadProfile(session.access_token, { force: true }).catch(() => {});
        } else {
          clearSession();
          settle(null);
        }
      } catch (err) {
        if (mounted.current) setError(err);
        settle(readStoredSessionUser());
      } finally {
        clearTimeout(safetyTimer);
      }
    };

    boot();

    // Supabase warns against awaiting work inside this callback: it runs while
    // the auth lock is held, so awaiting here can freeze every other auth call.
    // Keep it synchronous and defer any network work with setTimeout.
    const { data: listener } = supabase
      ? supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted.current) return;
          if (event === 'INITIAL_SESSION') return; // handled by boot()

          if (event === 'SIGNED_OUT') {
            clearSession();
            setLoading(false);
            return;
          }

          if (session?.user) {
            setUser(mapUser(session.user));
            setLoading(false);
            const token = session.access_token;
            setTimeout(() => { loadProfile(token).catch(() => {}); }, 0);
          }
        })
      : { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      mounted.current = false;
      clearTimeout(safetyTimer);
      listener.subscription.unsubscribe();
    };
  }, [clearSession, loadProfile]);

  // Fresh token for an explicit, user-triggered refresh.
  const currentToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  };

  // ── Auth actions ───────────────────────────────────────────────────────────

  const signup = async (email, password, displayName) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (signUpError) throw signUpError;
    return {
      user: mapUser(data?.user || null),
      hasSession: Boolean(data?.session),
      emailConfirmed: Boolean(data?.user?.email_confirmed_at),
    };
  };

  const login = async (email, password) => {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;

    if (data?.user && data?.session) {
      setUser(mapUser(data.user));
      setLoading(false);
      await loadProfile(data.session.access_token, { force: true });
    }

    return mapUser(data?.user || null);
  };

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) throw error;
    return data;
  };

  /**
   * Sign out — clears local state IMMEDIATELY, then signs out this browser with
   * a 5-second timeout. Other devices stay signed in.
   */
  const logout = async () => {
    clearSession();
    setLoading(false);

    if (supabase) {
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]).catch(() => { /* ignore — already cleared locally */ });
    }
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/login`,
    });
    if (error) throw error;
  };

  const updateUserPassword = async (_currentPassword, newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const refreshUserProfile = async () => {
    const token = await currentToken();
    if (!token) return userProfile;
    const mapped = await loadProfile(token, { force: true });
    return mapped || userProfile;
  };

  const updateUserProfile = async (_data) => {
    // Profile updates go through Supabase dashboard or a dedicated API route.
    // Just refresh from server to pick up any changes.
    await refreshUserProfile();
  };

  const updateSubscription = async (_userId, _plan) => {
    // Handled server-side via webhooks — refresh to pick up DB changes.
    await refreshUserProfile();
  };

  const decrementScriptsRemaining = async (_userId) => {
    // Decrement is handled server-side. Just refresh the profile to get the latest count.
    const mapped = await refreshUserProfile();
    return mapped?.scriptsRemaining ?? Math.max((userProfile?.scriptsRemaining ?? 0) - 1, 0);
  };

  const deleteUserAccount = async () => {
    const token = await currentToken();
    if (!token) throw new Error('You are not signed in.');

    const res = await fetch('/api/account/delete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload?.error || 'Failed to delete account.');

    clearSession();
    setLoading(false);
    try { await supabase.auth.signOut({ scope: 'local' }); } catch (_e) { /* ignore */ }
    return true;
  };

  const checkEmailVerification = useCallback(async () => {
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError) return false;
    const verified = Boolean(data?.user?.email_confirmed_at);
    if (verified) {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (token) await loadProfile(token, { force: true });
    }
    return verified;
  }, [loadProfile]);

  const resendVerificationEmail = async () => {
    if (!user?.email) throw new Error('No user logged in');
    const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
    if (error) throw error;
    return true;
  };

  // Stubs kept for backwards compatibility
  const getUsersByIP = async () => [];
  const getAllUsers  = async () => [];

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      error,
      signup,
      login,
      signInWithGoogle,
      logout,
      resetPassword,
      updateUserPassword,
      updateUserProfile,
      updateSubscription,
      decrementScriptsRemaining,
      refreshUserProfile,
      deleteUserAccount,
      getUsersByIP,
      getAllUsers,
      checkEmailVerification,
      resendVerificationEmail,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
