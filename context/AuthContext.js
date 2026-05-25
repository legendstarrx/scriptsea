import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { hasProAccess, getPlanLabel } from '../utils/subscription';

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
// DB helpers
// ---------------------------------------------------------------------------

async function fetchProfileFromDB(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function fetchProfileFromServer() {
  if (!supabase) return null;
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session?.access_token) return null;

  const res = await fetch('/api/account/profile', {
    headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
  });
  if (!res.ok) return null;
  const payload = await res.json();
  return payload?.profile || null;
}

async function createNewProfile(user) {
  if (!supabase) return;
  const payload = {
    id: user.id,
    email: user.email,
    display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || null,
    photo_url: user.user_metadata?.avatar_url || null,
    subscription: 'starter',
    subscription_status: 'inactive',
    scripts_remaining: 0,
    scripts_generated: 0,
    scripts_limit: 0,
    paid: false,
    email_verified: Boolean(user.email_confirmed_at),
    last_login_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('profiles').insert(payload);
  // 23505 = unique_violation: row already exists — fine
  if (error && error.code !== '23505') throw error;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }) {
  // userProfile is pre-populated from localStorage so returning users
  // NEVER see the shimmer skeleton on refresh.
  const [userProfile, setUserProfile] = useState(() => readCache());
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const mounted       = useRef(true);
  const bootDone      = useRef(false);
  const serverSyncing = useRef(false);

  // Apply a fresh profile to state + cache.
  // Always uses the latest data — expired subscriptions must show correctly.
  const applyProfile = useCallback((mapped) => {
    if (!mounted.current) return;
    writeCache(mapped);
    setUserProfile(mapped);
  }, []);

  // Clear everything on sign-out.
  const clearSession = useCallback(() => {
    writeCache(null);
    setUser(null);
    setUserProfile(null);
  }, []);

  // Kick off a non-blocking background server sync (authoritative).
  const runServerSync = useCallback((supabaseUser) => {
    if (serverSyncing.current) return;
    serverSyncing.current = true;
    fetchProfileFromServer()
      .then((row) => {
        if (row && mounted.current) applyProfile(mapProfile(row));
      })
      .catch(() => { /* background — non-critical */ })
      .finally(() => { serverSyncing.current = false; });
  }, [applyProfile]);

  // Full profile sync for a logged-in user:
  // 1. Fast DB query (~50-200ms) → updates UI immediately
  // 2. Server sync runs in background
  const syncProfile = useCallback(async (supabaseUser) => {
    if (!supabaseUser) {
      clearSession();
      return;
    }

    setUser(mapUser(supabaseUser));

    // Fast path — direct client DB query
    try {
      const row = await fetchProfileFromDB(supabaseUser.id);
      if (row) {
        applyProfile(mapProfile(row));
      } else {
        // No profile row yet — create one for new users
        await createNewProfile(supabaseUser);
        const newRow = await fetchProfileFromDB(supabaseUser.id);
        if (newRow) applyProfile(mapProfile(newRow));
      }
    } catch (_e) {
      // DB query failed — localStorage cache is still set, UI not broken
    }

    // Background: authoritative server-side resolver
    runServerSync(supabaseUser);
  }, [applyProfile, clearSession, runServerSync]);

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    mounted.current = true;

    // Hard timeout: loading can NEVER stay true longer than 4 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted.current) setLoading(false);
    }, 4000);

    const boot = async () => {
      try {
        if (!supabase) {
          setError(new Error('Supabase is not configured.'));
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!mounted.current) return;

        if (session?.user) {
          // Set user immediately so nothing waits
          setUser(mapUser(session.user));

          let profileResolved = false;

          // ── Attempt 1: direct client DB query (~50-200ms) ──────────────
          try {
            const row = await fetchProfileFromDB(session.user.id);
            if (row && mounted.current) {
              applyProfile(mapProfile(row));
              profileResolved = true;
            }
          } catch (_e) { /* keep going */ }

          // ── Attempt 2: server sync if DB returned nothing ───────────────
          // (server uses admin client — bypasses RLS, handles legacy rows)
          if (!profileResolved) {
            try {
              const serverRow = await Promise.race([
                fetchProfileFromServer(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
              ]);
              if (serverRow && mounted.current) {
                applyProfile(mapProfile(serverRow));
                profileResolved = true;
              }
            } catch (_e) { /* keep going */ }
          }

          // ── Fallback: set a minimal logged-in profile ───────────────────
          // This guarantees userProfile is NEVER null for a signed-in user.
          // The background sync will correct it to Pro if appropriate.
          if (!profileResolved && mounted.current) {
            const placeholder = mapProfile({
              id: session.user.id,
              email: session.user.email,
              display_name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || null,
              subscription: 'starter',
              subscription_status: 'inactive',
              paid: false,
              scripts_remaining: 0,
              scripts_limit: 0,
              email_verified: Boolean(session.user.email_confirmed_at),
            });
            // Only write placeholder to state, NOT to cache
            // (cache should only hold real data from DB)
            setUserProfile(placeholder);
          }

          // Background: authoritative server-side resolver (always runs)
          runServerSync(session.user);
        } else {
          clearSession();
        }
      } catch (err) {
        if (mounted.current) setError(err);
      } finally {
        clearTimeout(safetyTimer);
        if (mounted.current) {
          setLoading(false);
          bootDone.current = true;
        }
      }
    };

    boot();

    // Auth state change listener — handles sign-in, sign-out, token refresh
    const { data: listener } = supabase
      ? supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted.current) return;
          // INITIAL_SESSION is handled by boot() above — skip it
          if (event === 'INITIAL_SESSION') return;

          if (session?.user) {
            await syncProfile(session.user);
          } else {
            clearSession();
          }

          // Ensure loading is cleared even if boot() hasn't run yet
          if (mounted.current) setLoading(false);
        })
      : { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      mounted.current = false;
      clearTimeout(safetyTimer);
      listener.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth actions ───────────────────────────────────────────────────────────

  const signup = async (email, password, displayName) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (signUpError) throw signUpError;
    if (data?.user) await createNewProfile(data.user);
    return {
      user: mapUser(data?.user || null),
      hasSession: Boolean(data?.session),
      emailConfirmed: Boolean(data?.user?.email_confirmed_at),
    };
  };

  const login = async (email, password) => {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    if (data?.user) await syncProfile(data.user);
    return mapUser(data?.user || null);
  };

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) throw error;
    return data;
  };

  /**
   * Sign out — clears local state IMMEDIATELY, then attempts network sign-out
   * with a 5-second timeout. Even if the network is down, the user is signed
   * out locally right away.
   */
  const logout = async () => {
    // Clear everything locally first — sign-out is instant from the user's perspective
    clearSession();
    setLoading(false);

    // Attempt network sign-out (5s timeout so it never hangs)
    if (supabase) {
      await Promise.race([
        supabase.auth.signOut(),
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

  const updateUserProfile = async (data) => {
    const payload = {};
    if (data.displayName) payload.display_name = data.displayName;
    if (data.photoURL) payload.photo_url = data.photoURL;
    if (user?.uid) {
      const { error } = await supabase.from('profiles').update(payload).eq('id', user.uid);
      if (error) throw error;
      const row = await fetchProfileFromDB(user.uid);
      if (row) applyProfile(mapProfile(row));
    }
  };

  const updateSubscription = async (userId, plan) => {
    const scriptsRemaining = plan === 'pro' ? 100 : 0;
    const { error } = await supabase
      .from('profiles')
      .update({ subscription: plan, scripts_remaining: scriptsRemaining, scripts_limit: scriptsRemaining })
      .eq('id', userId);
    if (error) throw error;
    if (user?.uid === userId) {
      const row = await fetchProfileFromDB(userId);
      if (row) applyProfile(mapProfile(row));
    }
  };

  const decrementScriptsRemaining = async (userId) => {
    const row = await fetchProfileFromDB(userId);
    const nextValue = Math.max((row?.scripts_remaining ?? 0) - 1, 0);
    const { error } = await supabase
      .from('profiles')
      .update({ scripts_remaining: nextValue, last_login_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
    if (user?.uid === userId) {
      const updated = await fetchProfileFromDB(userId);
      if (updated) applyProfile(mapProfile(updated));
    }
    return nextValue;
  };

  const refreshUserProfile = async (userId = user?.uid) => {
    if (!userId || !supabase) return userProfile;
    let row = null;
    try { row = await fetchProfileFromServer(); } catch (_e) { /* ignore */ }
    if (!row) {
      try { row = await fetchProfileFromDB(userId); } catch (_e) { /* ignore */ }
    }
    if (!row) return userProfile;
    const mapped = mapProfile(row);
    applyProfile(mapped);
    return mapped;
  };

  const deleteUserAccount = async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error('You are not signed in.');
    const res = await fetch('/api/account/delete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload?.error || 'Failed to delete account.');
    try { await supabase.auth.signOut(); } catch (_e) { /* ignore */ }
    clearSession();
    return true;
  };

  const checkEmailVerification = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) return false;
    const verified = Boolean(data?.user?.email_confirmed_at);
    if (verified && user?.uid) {
      await supabase.from('profiles').update({ email_verified: true }).eq('id', user.uid);
      const row = await fetchProfileFromDB(user.uid);
      if (row) applyProfile(mapProfile(row));
    }
    return verified;
  };

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
