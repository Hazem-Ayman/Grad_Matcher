import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Flame, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'signup';

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const { user, profile, loading: sessionLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!sessionLoading && user) {
      if (profile) {
        if (profile.onboarding_complete) {
          navigate('/swipe', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } else {
        // If user is authenticated but profile row does not exist yet
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, profile, sessionLoading, navigate]);

  // Sync mode if query params change
  useEffect(() => {
    const queryMode = searchParams.get('mode');
    if (queryMode === 'login') {
      setMode('login');
    } else if (queryMode === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setAuthLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data?.user) {
          toast.success("Account created! Check your email for confirmation.");
          // Wait briefly, then try to fetch profile or navigate to onboarding
          navigate('/onboarding');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error(err.message || "An authentication error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/swipe`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("OAuth error:", err);
      toast.error("Google authentication failed.");
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-650 text-white font-bold text-2xl shadow-xl shadow-indigo-600/20">
            G
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-wide">
            {mode === 'signup' ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-gray-400">
            {mode === 'signup'
              ? 'Find classmates and start swiping in minutes'
              : 'Log in to connect with teammates'}
          </p>
        </div>

        {/* Auth Panel */}
        <div className="glass-panel border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          {/* Mode Switch tabs */}
          <div className="grid grid-cols-2 bg-gray-950 p-1 rounded-2xl border border-gray-850">
            <button
              onClick={() => setMode('signup')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
            <button
              onClick={() => setMode('login')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-650 text-white rounded-2xl text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/10 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer disabled:cursor-wait mt-2"
            >
              {authLoading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Log In'}
            </button>
          </form>

          {/* Google Divider */}
          <div className="flex items-center gap-3 my-4">
            <span className="h-px bg-gray-800 flex-1"></span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Or continue with</span>
            <span className="h-px bg-gray-800 flex-1"></span>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3.5 bg-gray-950 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {/* SVG Google Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.26620003,9.76451677 C6.19875156,6.96577312 8.8140417,5 11.9090909,5 C13.7380909,5 15.3904545,5.65681818 16.6854545,6.73636364 L20.2545455,3.16727273 C18.0695455,1.20545455 15.1977273,0 11.9090909,0 C7.27954545,0 3.28409091,2.83954545 1.515,6.92454545 L5.26620003,9.76451677 Z"
              />
              <path
                fill="#4285F4"
                d="M23.6363636,12.2727273 C23.6363636,11.4136364 23.5590909,10.6363636 23.4136364,9.88636364 L11.9090909,9.88636364 L11.9090909,14.4681818 L18.4909091,14.4681818 C18.2090909,15.9909091 17.35,17.2772727 16.0636364,18.1363636 L19.8327273,21.0545455 C22.0363636,19.0227273 23.6363636,15.9318182 23.6363636,12.2727273 Z"
              />
              <path
                fill="#FBBC05"
                d="M5.26620003,14.2354832 L1.515,17.0754545 C3.28409091,21.1604545 7.27954545,24 11.9090909,24 C15.0681818,24 17.7504545,22.9513636 19.8327273,21.0545455 L16.0636364,18.1363636 C15.0227273,18.8318182 13.6,19.2727273 11.9090909,19.2727273 C8.8140417,19.2727273 6.19875156,17.3069542 5.26620003,14.2354832 Z"
              />
              <path
                fill="#34A853"
                d="M1.515,6.92454545 L5.26620003,9.76451677 C6.19875156,12.5632604 8.8140417,14.5290275 11.9090909,14.5290275 C13.6,14.5290275 15.0227273,14.0881818 16.0636364,13.3927273 L19.8327273,16.3109091 C17.7504545,18.2077273 15.0681818,19.2590909 11.9090909,19.2590909 C7.27954545,19.2590909 3.28409091,16.4195455 1.515,12.3345455 L1.515,6.92454545 Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
