import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function AppShell() {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();
  const notifications = useNotifications(loading ? null : profile);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Authenticating..." />
      </div>
    );
  }

  // Redirect to Auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // Redirect to onboarding if not complete
  const isOnboardingPage = location.pathname === '/onboarding';
  if ((!profile || !profile.onboarding_complete) && !isOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }

  // If profile is complete but user goes to onboarding, redirect to swipe
  if (profile?.onboarding_complete && isOnboardingPage) {
    return <Navigate to="/swipe" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col pb-20 md:pb-0">
      {/* Desktop Navigation */}
      <TopNav
        unreadNotificationsCount={notifications.unreadCount}
        onSignOut={signOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 flex flex-col">
        <Outlet context={{ notifications }} />
      </main>

      {/* Mobile Navigation */}
      <BottomNav unreadNotificationsCount={notifications.unreadCount} />
    </div>
  );
}
