import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { hasProAccess } from '../utils/subscription';

const AuthContext = createContext();

// ---------------------------------------------------------------------------
// Profile mapping helpers
// ---------------------------------------------------------------------------

const mapProfile = (row = {}) => {
  // 'free' and 'starter' are non-paid DB values; let subscription_status override them.
  const rawSub = (row.subscription || '').toLowerCase().trim();
  const isNonPaidSub = !rawSub || rawSub === 'free' || rawSub === 'starter';
  const mappedSubscription = isNonPaidSub
    ? (row.subscription_status === 'active' ? 'pro' : rawSub || null)
    : rawSub;

  return {
    id: row.id || null,
    email: row.email || null,
    displayName: row.display_name || null,
    photoURL: row.photo_url || null,
    subscriptionStatus: row.subscription_status || null,
    subscription: mappedSubscription,
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
};

const mapSupabaseUser = (u) => {
  if (!u) return null;
  return {
    uid: u.id,
    id: u.id,
    email: u.email,
    displayName: u.user_metadata?.display_name || u.user_metadata?.full_name || null,
    photoURL: u.user_metadata?.avatar_url || null,
    emailVerified: Boolean(u.email_confirmed_at),
  };
};

const isPaidProfile = (profile = {}) => hasProAccess(profile);

// ---------------------------------------------------------------------------
// Data-fetching helpers (module-level so they are stable references)
// ---------------------------------------------------------------------------

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function fetchProfileViaServer() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) return null;

  const response = await fetch('/api/account/profile', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to sync profile.');
  }
  return payload?.profile || null;
}

async function createProfileIfMissing(user, patch = {}) {
  const payload = {
    id: user.id,
    email: user.email,
    display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || null,
    photo_url: user.user_metadata?.avatar_url || null,
    ...patch,
  };
  const { error } = await supabase.from('profiles').insert(payload);
  // 23505 = unique_violation: row already exists, that's fine.
  if (error && error.code !== '23505') throw error;
}

// ---------------------------------------------------------------------------
// AuthProvider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref to track whether an authoritative server sync is in flight so we
  // don't fire multiple concurrent syncs.
  const syncInFlight = useRef(false);

  /**
   * Safe profile setter — never downgrades from a paid plan.
   */
  const safeSetProfile = (mapped) => {
    setUserProfile((prev) => {
      if (prev && isPaidProfile(prev) && !isPaidProfile(mapped)) return prev;
      return mapped;
    });
  };

  /**
   * Core sync function.
   *
   * Step 1 (FAST, ~50-200 ms): direct client-side Supabase query.
   *   → Sets userProfile immediately so the UI renders the correct plan
   *     on the very first paint after auth is resolved.
   *
   * Step 2 (AUTHORITATIVE, ~500-2000 ms): server-side resolver.
   *   → Handles legacy rows, email-based profile merging, etc.
   *   → Runs in the background and only updates if it returns something better.
   *
   * Step 3 (FALLBACK): If both fail, create a blank starter profile.
   */
  const syncProfile = async (supabaseUser) => {
    if (!supabaseUser) {
      setUser(null);
      setUserProfile(null);
      return;
    }

    setUser(mapSupabaseUser(supabaseUser));

    // ── STEP 1: Fast path ────────────────────────────────────────────────
    let fastRow = null;
    try {
      fastRow = await fetchProfile(supabaseUser.id);
      if (fastRow) {
        safeSetProfile(mapProfile(fastRow));
      }
    } catch (_fastErr) {
      // Non-critical; proceed to authoritative path.
    }

    // ── STEP 2: Authoritative server sync (background) ──────────────────
    if (syncInFlight.current) return; // deduplicate concurrent calls
    syncInFlight.current = true;
    try {
      const serverRow = await fetchProfileViaServer();
      if (serverRow) {
        safeSetProfile(mapProfile(serverRow));
        syncInFlight.current = false;
        return;
      }
    } catch (_serverErr) {
      // Server unavailable — fast-path data is still set.
    }
    syncInFlight.current = false;

    // ── STEP 3: Fallback / first-time user ──────────────────────────────
    if (!fastRow) {
      try {
        // Try direct read one more time before creating.
        const retryRow = await fetchProfile(supabaseUser.id);
        if (retryRow) {
          safeSetProfile(mapProfile(retryRow));
          return;
        }
        // Create a fresh starter profile.
        await createProfileIfMissing(supabaseUser, {
          subscription: 'starter',
          subscription_status: 'inactive',
          scripts_remaining: 0,
          scripts_generated: 0,
          scripts_limit: 0,
          paid: false,
          email_verified: Boolean(supabaseUser.email_confirmed_at),
          last_login_at: new Date().toISOString(),
        });
        const newRow = await fetchProfile(supabaseUser.id);
        if (newRow) safeSetProfile(mapProfile(newRow));
      } catch (createErr) {
        setError(createErr);
      }
    }
  };

  /**
   * Explicit refresh — always tries server first, then falls back.
   */
  const refreshUserProfile = async (userId = user?.uid) => {
    if (!userId || !supabase) return null;

    let profileRow = null;
    try {
      profileRow = await fetchProfileViaServer();
    } catch (_e) {
      /* ignore */
    }
    if (!profileRow) {
      try {
        profileRow = await fetchProfile(userId);
      } catch (_e) {
        /* ignore */
      }
    }
    if (!profileRow) return userProfile; // nothing better available

    const mapped = mapProfile(profileRow);
    safeSetProfile(mapped);
    return mapped;
  };

  // ── Bootstrap on mount ────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    // Safety valve: never stay stuck in loading state.
    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    const boot = async () => {
      try {
        if (!supabase) {
          if (mounted) setError(new Error('Supabase client is not configured.'));
          setLoading(false);
          return;
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!mounted) return;

        const sessionUser = sessionData?.session?.user || null;

        if (sessionUser) {
          // Fast path: read profile directly — typically resolves in < 200 ms.
          // We set loading=false AFTER this so the page never renders with
          // a null profile for a logged-in user.
          try {
            const fastRow = await fetchProfile(sessionUser.id);
            if (mounted && fastRow) {
              setUser(mapSupabaseUser(sessionUser));
              safeSetProfile(mapProfile(fastRow));
            } else if (mounted) {
              setUser(mapSupabaseUser(sessionUser));
            }
          } catch (_e) {
            if (mounted) setUser(mapSupabaseUser(sessionUser));
          }

          if (mounted) setLoading(false);

          // Background: authoritative server sync.
          syncProfile(sessionUser).catch(() => {});
        } else {
          if (mounted) {
            setUser(null);
            setUserProfile(null);
            setLoading(false);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      } finally {
        clearTimeout(safetyTimer);
      }
    };

    boot();

    if (!supabase) {
      return () => {
        mounted = false;
        clearTimeout(safetyTimer);
      };
    }

    // Auth state change listener (handles sign-in, sign-out, token refresh).
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      try {
        await syncProfile(session?.user || null);
      } catch (_e) {
        /* handled inside syncProfile */
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────────

  const signup = async (email, password, displayName) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (signUpError) throw signUpError;
    if (data?.user) {
      await createProfileIfMissing(data.user, {
        subscription: 'starter',
        subscription_status: 'inactive',
        scripts_remaining: 0,
        scripts_generated: 0,
        scripts_limit: 0,
        paid: false,
        email_verified: Boolean(data.user.email_confirmed_at),
        last_login_at: new Date().toISOString(),
      });
    }
    return {
      user: mapSupabaseUser(data?.user || null),
      hasSession: Boolean(data?.session),
      emailConfirmed: Boolean(data?.user?.email_confirmed_at),
    };
  };

  const login = async (email, password) => {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) throw signInError;
    if (data?.user) {
      await syncProfile(data.user);
    }
    return mapSupabaseUser(data?.user || null);
  };

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
      const profileRow = await fetchProfile(user.uid);
      if (profileRow) safeSetProfile(mapProfile(profileRow));
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
      const profileRow = await fetchProfile(userId);
      if (profileRow) safeSetProfile(mapProfile(profileRow));
    }
  };

  const decrementScriptsRemaining = async (userId) => {
    const profileRow = await fetchProfile(userId);
    const nextValue = Math.max((profileRow?.scripts_remaining ?? 0) - 1, 0);
    const { error } = await supabase
      .from('profiles')
      .update({ scripts_remaining: nextValue, last_login_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
    if (user?.uid === userId) {
      const updated = await fetchProfile(userId);
      if (updated) safeSetProfile(mapProfile(updated));
    }
    return nextValue;
  };

  const deleteUserAccount = async () => {
    if (!supabase) throw new Error('Auth service is not configured.');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) throw new Error('You are not signed in.');
    const response = await fetch('/api/account/delete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error || 'Failed to delete account.');
    try { await supabase.auth.signOut(); } catch (_e) { /* ignore */ }
    setUser(null);
    setUserProfile(null);
    return true;
  };

  const getUsersByIP = async () => [];
  const getAllUsers = async () => [];

  const checkEmailVerification = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) return false;
    const verified = Boolean(data?.user?.email_confirmed_at);
    if (verified && user?.uid) {
      await supabase.from('profiles').update({ email_verified: true }).eq('id', user.uid);
      const profileRow = await fetchProfile(user.uid);
      if (profileRow) safeSetProfile(mapProfile(profileRow));
    }
    return verified;
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) throw new Error('No user logged in');
    const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
    if (error) throw error;
    return true;
  };

  const value = {
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
    deleteUserAccount,
    refreshUserProfile,
    getUsersByIP,
    getAllUsers,
    checkEmailVerification,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
