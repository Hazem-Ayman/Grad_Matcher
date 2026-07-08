import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Flame, Users, Zap, Compass } from 'lucide-react';

export default function Landing() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (profile?.onboarding_complete) {
        navigate('/swipe', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between overflow-x-hidden relative">
      {/* Background radial glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none"></div>

      {/* Header / Logo */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
            G
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            GradMatch
          </span>
        </div>
        <Link
          to="/auth?mode=login"
          className="text-sm font-semibold text-gray-300 hover:text-white bg-gray-900 border border-gray-800 hover:border-gray-700 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          Log In
        </Link>
      </header>

      {/* Hero section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 py-12 lg:py-20 z-10">
        {/* Left column: Tagline & description */}
        <div className="flex-1 text-center lg:text-left space-y-6 lg:max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
            <Flame className="w-3.5 h-3.5" />
            <span>Tinder for Graduation Projects</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Find your perfect{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
              graduation project
            </span>{' '}
            team.
          </h1>

          <p className="text-sm md:text-base text-gray-400 leading-relaxed">
            Match with other students based on shared skills, interests, and project ideas. Skip the awkward classroom search and swipe your way to a complete team.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              to="/auth"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Get Started
            </Link>
            <Link
              to="/auth?mode=login"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-gray-900 hover:bg-gray-850 text-gray-300 hover:text-white rounded-2xl font-bold text-sm tracking-wide border border-gray-800 hover:border-gray-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Log in to account
            </Link>
          </div>
        </div>

        {/* Right column: Interactive mockup display or premium visuals */}
        <div className="flex-1 w-full max-w-sm lg:max-w-none flex justify-center relative">
          {/* Card overlay effect */}
          <div className="relative w-full max-w-[320px] aspect-[4/5] bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl transform lg:rotate-3 hover:rotate-0 transition-transform duration-500 group">
            {/* Top row */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg">
                JS
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-base">John Smith</h3>
                <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-semibold">ML Engineer</span>
              </div>
            </div>
            {/* Middle row */}
            <div className="bg-gray-950/50 border border-gray-850 p-4 rounded-2xl my-4 text-left">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block mb-1">Looking to build:</span>
              <p className="text-xs italic text-gray-300 line-clamp-3">
                "An AI-driven assistant that helps students optimize their class schedules and find group-study partners."
              </p>
            </div>
            {/* Bottom tags */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="text-[9px] font-semibold px-2 py-1 rounded bg-gray-800 text-gray-300">Python</span>
              <span className="text-[9px] font-semibold px-2 py-1 rounded bg-gray-800 text-gray-300">PyTorch</span>
              <span className="text-[9px] font-semibold px-2 py-1 rounded bg-gray-800 text-gray-300">FastAPI</span>
            </div>
            {/* Badge overlay */}
            <span className="absolute top-4 right-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
              🔍 Full Team
            </span>
          </div>

          {/* Underlay card */}
          <div className="absolute w-full max-w-[320px] aspect-[4/5] bg-gray-900/60 border border-gray-800/60 rounded-3xl -z-10 transform -rotate-3 translate-x-4 translate-y-2 pointer-events-none hidden sm:block"></div>
        </div>
      </main>

      {/* Feature values banner */}
      <section className="bg-gray-900/40 border-t border-gray-900 py-12 z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white">1. Swipe Profiles</h3>
            <p className="text-xs text-gray-400 max-w-xs">
              Browse profiles detailing majors, skills, and project blueprints.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white">2. Mutual Matches</h3>
            <p className="text-xs text-gray-400 max-w-xs">
              If both students show interest, we establish a link instantly.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white">3. Connect Instantly</h3>
            <p className="text-xs text-gray-400 max-w-xs">
              Gain access to emails, phone numbers, or social tags to begin working.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-6 border-t border-gray-900 flex items-center justify-between text-xs text-gray-500 z-10">
        <span>© {new Date().getFullYear()} GradMatch. All rights reserved.</span>
        <span>Made for university students.</span>
      </footer>
    </div>
  );
}
