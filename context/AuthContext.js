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
// ---------------------------------------------------------------------------

async function fetchProfileFromServer(accessToken) {
  if (!accessToken) return null;
  try {
    const res = await fetch('/api/account/profile', {
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

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }) {
  // Pre-populate from localStorage so returning users NEVER see shimmer on refresh
  const [userProfile, setUserProfile] = useState(() => readCache());
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const mounted   = useRef(true);
  const bootDone  = useRef(false);
  const syncing   = useRef(false);

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

  const forceSignOutLocal = useCallback(async () => {
    clearSession();
    setLoading(false);
    try {
      await supabase?.auth?.signOut();
    } catch {
      // local state is already cleared
    }
  }, [clearSession]);

  // Fetch profile from /api/auth/me and apply it
  const syncProfile = useCallback(async (supabaseUser) => {
    if (!supabaseUser) {
      clearSession();
      return;
    }
    if (syncing.current) return;
    syncing.current = true;

    setUser(mapUser(supabaseUser));

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        syncing.current = false;
        return;
      }

      const row = await fetchProfileFromServer(token);
      if (row?.__unauthorized) {
        await forceSignOutLocal();
        syncing.current = false;
        return;
      }
      if (row && mounted.current) {
        applyProfile(mapProfile(row));
      }
    } catch (_e) {
      // Non-critical — cache is still set, UI is not broken
    } finally {
      syncing.current = false;
    }
  }, [applyProfile, clearSession, forceSignOutLocal]);

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    mounted.current = true;

    // Safety net: loading can NEVER stay true longer than 5 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted.current) setLoading(false);
    }, 5000);

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
          setUser(mapUser(session.user));

          // Fetch authoritative profile from server (uses admin key — no RLS issues)
          const row = await fetchProfileFromServer(session.access_token);
          if (row?.__unauthorized) {
            await forceSignOutLocal();
            return;
          }
          if (row && mounted.current) {
            applyProfile(mapProfile(row));
          }
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

          // INITIAL_SESSION is handled by boot() above — skip it to avoid race
          if (event === 'INITIAL_SESSION') return;

          // Token refresh — silently update the user/profile, never sign out
          if (event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              setUser(mapUser(session.user));
              // Background refresh of profile — don't block anything
              fetchProfileFromServer(session.access_token)
                .then(async (row) => {
                  if (row?.__unauthorized) {
                    await forceSignOutLocal();
                    return;
                  }
                  if (row && mounted.current) applyProfile(mapProfile(row));
                })
                .catch(() => {});
            }
            return; // Don't touch loading state
          }

          if (session?.user) {
            setUser(mapUser(session.user));
            const row = await fetchProfileFromServer(session.access_token);
            if (row?.__unauthorized) {
              await forceSignOutLocal();
              return;
            }
            if (row && mounted.current) applyProfile(mapProfile(row));
          } else if (event === 'SIGNED_OUT') {
            // Only clear on an explicit sign-out, not on unknown events
            clearSession();
          }

          if (mounted.current) setLoading(false);
        })
      : { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      mounted.current = false;
      clearTimeout(safetyTimer);
      listener.subscription.unsubscribe();
    };
  }, [applyProfile, clearSession, forceSignOutLocal]);

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
      const row = await fetchProfileFromServer(data.session.access_token);
      if (row?.__unauthorized) {
        await forceSignOutLocal();
        return null;
      }
      if (row) applyProfile(mapProfile(row));
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
   * Sign out — clears local state IMMEDIATELY, then attempts network sign-out
   * with a 5-second timeout. Even if the network is down, the user is signed
   * out locally right away.
   */
  const logout = async () => {
    clearSession();
    setLoading(false);

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

  const updateUserProfile = async (_data) => {
    // Profile updates go through Supabase dashboard or a dedicated API route.
    // Just refresh from server to pick up any changes.
    await refreshUserProfile();
  };

  const updateSubscription = async (userId, plan) => {
    // This is now handled server-side via webhooks.
    // Refresh profile to pick up any DB changes.
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (token) {
      const row = await fetchProfileFromServer(token);
      if (row?.__unauthorized) {
        await forceSignOutLocal();
        return;
      }
      if (row) applyProfile(mapProfile(row));
    }
  };

  const decrementScriptsRemaining = async (_userId) => {
    // Decrement is handled server-side. Just refresh the profile to get the latest count.
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return (userProfile?.scriptsRemaining ?? 0);

    const row = await fetchProfileFromServer(token);
    if (row?.__unauthorized) {
      await forceSignOutLocal();
      return 0;
    }
    if (row) applyProfile(mapProfile(row));
    return row?.scripts_remaining ?? Math.max((userProfile?.scriptsRemaining ?? 0) - 1, 0);
  };

  const refreshUserProfile = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return userProfile;

    const row = await fetchProfileFromServer(token);
    if (row?.__unauthorized) {
      await forceSignOutLocal();
      return null;
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

    clearSession();
    setLoading(false);
    try { await supabase.auth.signOut(); } catch (_e) { /* ignore */ }
    return true;
  };

  const checkEmailVerification = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) return false;
    const verified = Boolean(data?.user?.email_confirmed_at);
    if (verified) {
      // Re-fetch profile to get updated email_verified from server
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (token) {
        const row = await fetchProfileFromServer(token);
        if (row?.__unauthorized) {
          await forceSignOutLocal();
          return false;
        }
        if (row) applyProfile(mapProfile(row));
      }
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
