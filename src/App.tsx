
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SharedLayout from '@/components/SharedLayout';

// Direct imports (not lazy loaded)
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import PricingPage from './pages/PricingPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import DashboardPage from './pages/DashboardPage';
import AccountPage from './pages/AccountPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import StaffLoginPage from "./pages/StaffLoginPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import StaffUsersPage from "./pages/StaffUsersPage";
import StaffSettingsPage from "./pages/StaffSettingsPage";
import StaffHelpPage from "./pages/StaffHelpPage";

// Lazy loaded pages
const RadioPage = lazy(() => import('./pages/RadioPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const StorePage = lazy(() => import('./pages/StorePage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NewsArticlePage = lazy(() => import('./pages/NewsArticlePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ArtistProfilePage = lazy(() => import('./pages/ArtistProfilePage'));
const SongSubmitPage = lazy(() => import('./pages/SongSubmitPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const PublicUserProfilePage = lazy(() => import('./pages/PublicUserProfilePage'));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route element={<SharedLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/staff/login" element={<StaffLoginPage />} />
            <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
            <Route path="/staff/users" element={<StaffUsersPage />} />
            <Route path="/staff/settings" element={<StaffSettingsPage />} />
            <Route path="/staff/help" element={<StaffHelpPage />} />
            <Route path="/radio" element={<RadioPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsArticlePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/artist/:id" element={<ArtistProfilePage />} />
            <Route path="/submit-song" element={<SongSubmitPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/user/:id" element={<PublicUserProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
