import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import AppShell from './components/layout/AppShell';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy loaded pages
const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Swipe = lazy(() => import('./pages/Swipe'));
const Matches = lazy(() => import('./pages/Matches'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileView = lazy(() => import('./pages/ProfileView'));
const Team = lazy(() => import('./pages/Team'));

export default function App() {
  return (
    <Router>
      <AuthProvider>
        {/* React Hot Toast Config */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 1500,
            style: {
              background: '#111827', // gray-900
              color: '#fff',
              border: '1px solid #374151', // gray-700
              borderRadius: '16px',
            },
          }}
        />

        <Suspense
          fallback={
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
              <LoadingSpinner size="lg" message="Loading page..." />
            </div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected Routes (nested inside AppShell) */}
            <Route element={<AppShell />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/swipe" element={<Swipe />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/team" element={<Team />} />
              <Route path="/view-profile/:profileId" element={<ProfileView />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}
