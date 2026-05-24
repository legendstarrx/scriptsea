import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

const mapProfile = (row = {}) => ({
  email: row.email || null,
  displayName: row.display_name || null,
  photoURL: row.photo_url || null,
  subscription: row.subscription || null,
  subscriptionType: row.subscription_type || null,
  scriptsRemaining: row.scripts_remaining ?? 0,
  scriptsGenerated: row.scripts_generated ?? 0,
  scriptsLimit: row.scripts_limit ?? 0,
  emailVerified: row.email_verified ?? false,
  paid: row.paid ?? false,
  createdAt: row.created_at || null,
  lastLogin: row.last_login_at || null
});

const mapSupabaseUser = (u) => {
  if (!u) return null;
  return {
    uid: u.id,
    id: u.id,
    email: u.email,
    displayName: u.user_metadata?.display_name || u.user_metadata?.full_name || null,
    photoURL: u.user_metadata?.avatar_url || null,
    emailVerified: Boolean(u.email_confirmed_at)
  };
};

const isPaidProfile = (profile = {}) => {
  const subscription = String(profile.subscription || '').toLowerCase();
  return Boolean(profile.paid) ||
    subscription === 'pro' ||
    subscription === 'premium' ||
    Boolean(profile.subscription_type) ||
    (profile.scripts_limit ?? 0) > 0 ||
    (profile.scripts_remaining ?? 0) > 0;
};

async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
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
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to sync profile.');
  }

  return payload?.profile || null;
}

async function upsertProfile(user, patch = {}) {
  const payload = {
    id: user.id,
    email: user.email,
    display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || null,
    photo_url: user.user_metadata?.avatar_url || null,
    ...patch
  };

  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const syncProfile = async (supabaseUser) => {
    if (!supabaseUser) {
      setUser(null);
      setUserProfile(null);
      return;
    }

    const normalizedUser = mapSupabaseUser(supabaseUser);
    setUser(normalizedUser);

    try {
      let profileRow = await fetchProfile(supabaseUser.id);
      if (!profileRow) {
        await upsertProfile(supabaseUser, {
          subscription: 'starter',
          scripts_remaining: 0,
          scripts_generated: 0,
          scripts_limit: 0,
          paid: false,
          email_verified: Boolean(supabaseUser.email_confirmed_at),
          last_login_at: new Date().toISOString()
        });
        profileRow = await fetchProfile(supabaseUser.id);
      } else {
        await upsertProfile(supabaseUser, {
          last_login_at: new Date().toISOString(),
          email_verified: Boolean(supabaseUser.email_confirmed_at)
        });
        profileRow = await fetchProfile(supabaseUser.id);
      }

      // Normalize with server-side profile resolver to absorb legacy/duplicate rows.
      try {
        const serverProfile = await fetchProfileViaServer();
        if (serverProfile) {
          profileRow = !profileRow || isPaidProfile(serverProfile) || !isPaidProfile(profileRow)
            ? serverProfile
            : profileRow;
        }
      } catch (_serverSyncError) {
        // Non-fatal; keep local profile row.
      }

      const mapped = mapProfile(profileRow);
      setUserProfile((prev) => {
        if (prev && isPaidProfile(prev) && !isPaidProfile(mapped)) {
          return prev;
        }
        return mapped;
      });
    } catch (err) {
      try {
        const fallbackProfile = await fetchProfileViaServer();
        if (fallbackProfile) {
          setUserProfile(mapProfile(fallbackProfile));
          return;
        }
      } catch (_fallbackError) {
        // Ignore fallback error and surface original error below.
      }

      setError(err);
      throw err;
    }
  };

  const refreshUserProfile = async (userId = user?.uid) => {
    if (!userId || !supabase) return null;

    let profileRow = null;
    try {
      profileRow = await fetchProfile(userId);
    } catch (_error) {
      profileRow = null;
    }

    if (!profileRow) {
      profileRow = await fetchProfileViaServer();
    }

    // Never downgrade UI state to a blank/default profile on fetch failure.
    if (!profileRow) {
      return userProfile;
    }

    const mappedProfile = mapProfile(profileRow);
    setUserProfile((prev) => {
      if (prev && isPaidProfile(prev) && !isPaidProfile(mappedProfile)) {
        return prev;
      }
      return mappedProfile;
    });
    return mappedProfile;
  };

  useEffect(() => {
    let mounted = true;
    const loadingSafetyTimeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 2500);

    const init = async () => {
      try {
        if (!supabase) {
          if (mounted) setError(new Error('Supabase client is not configured'));
          return;
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!mounted) return;

        const sessionUser = sessionData?.session?.user || null;
        setUser(mapSupabaseUser(sessionUser));
        setLoading(false);

        if (sessionUser) {
          await syncProfile(sessionUser);
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(loadingSafetyTimeout);
      }
    };

    init();

    if (!supabase) {
      return () => {
        mounted = false;
        clearTimeout(loadingSafetyTimeout);
      };
    }

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      try {
        await syncProfile(session?.user || null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(loadingSafetyTimeout);
      listener.subscription.unsubscribe();
    };
  }, []);

  const signup = async (email, password, displayName) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });
    if (signUpError) throw signUpError;
    if (data?.user) {
      await upsertProfile(data.user, {
        subscription: 'starter',
        scripts_remaining: 0,
        scripts_generated: 0,
        scripts_limit: 0,
        paid: false,
        email_verified: Boolean(data.user.email_confirmed_at),
        last_login_at: new Date().toISOString()
      });
    }
    return {
      user: mapSupabaseUser(data?.user || null),
      hasSession: Boolean(data?.session),
      emailConfirmed: Boolean(data?.user?.email_confirmed_at)
    };
  };

  const login = async (email, password) => {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
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
      options: { redirectTo }
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
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/login`
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
      setUserProfile(mapProfile(profileRow));
    }
  };

  const updateSubscription = async (userId, plan) => {
    const scriptsRemaining = plan === 'pro' ? 100 : 0;
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription: plan,
        scripts_remaining: scriptsRemaining,
        scripts_limit: scriptsRemaining
      })
      .eq('id', userId);
    if (error) throw error;
    if (user?.uid === userId) {
      const profileRow = await fetchProfile(userId);
      setUserProfile(mapProfile(profileRow));
    }
  };

  const decrementScriptsRemaining = async (userId) => {
    const profileRow = await fetchProfile(userId);
    const nextValue = Math.max((profileRow?.scripts_remaining ?? 0) - 1, 0);

    const { error } = await supabase
      .from('profiles')
      .update({
        scripts_remaining: nextValue,
        last_login_at: new Date().toISOString()
      })
      .eq('id', userId);
    if (error) throw error;

    if (user?.uid === userId) {
      const updated = await fetchProfile(userId);
      setUserProfile(mapProfile(updated));
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
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || 'Failed to delete account.');
    }

    try {
      await supabase.auth.signOut();
    } catch (_signOutError) {
      // Ignore local sign-out errors after server-side deletion.
    }
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
      setUserProfile(mapProfile(profileRow));
    }
    return verified;
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) throw new Error('No user logged in');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email
    });
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
    resendVerificationEmail
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
