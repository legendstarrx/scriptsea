import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { getDoc, doc, updateDoc } from 'firebase/firestore';

export default function Login() {
  const router = useRouter();
  const { login, signInWithGoogle, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // This will handle redirecting authenticated users
  useAuthRedirect(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Check if user is banned
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists() && userDoc.data().banned) {
        await signOut(auth);
        setError('This account has been banned. Please contact support.');
        return;
      }

      // Update last login timestamp
      await updateDoc(doc(db, 'users', userId), {
        lastLogin: new Date().toISOString()
      });

      // Redirect to generate page
      router.replace('/generate');
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'An error occurred during login. Please try again.';
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user is banned
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists() && userDoc.data().banned) {
        await auth.signOut();
        setError('This account has been banned.');
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Navigation />
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)'
      }}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <img src="/google.svg" alt="Google logo" className="w-5 h-5 mr-2" />
                    Sign in with Google
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Don't have an account?{' '}
                      <a
                        href="/register"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Sign up
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 