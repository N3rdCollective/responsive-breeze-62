
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SharedLayout from '@/components/SharedLayout'; // Assuming you have a SharedLayout
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import PricingPage from './pages/PricingPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import DashboardPage from './pages/DashboardPage';
import AccountPage from './pages/AccountPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage'; // Ensure this exists or handle 404 differently
import StaffLoginPage from "./pages/StaffLoginPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import StaffUsersPage from "./pages/StaffUsersPage";
import StaffSettingsPage from "./pages/StaffSettingsPage";
import StaffHelpPage from "./pages/StaffHelpPage";
// Removed forum page imports

// Lazy load pages for better performance
const RadioPage = lazy(() => import('./pages/RadioPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const StorePage = lazy(() => import('./pages/StorePage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NewsArticlePage = lazy(() => import('./pages/NewsArticlePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ArtistProfilePage = lazy(() => import('./pages/ArtistProfilePage')); // Assuming this exists
const SongSubmitPage = lazy(() => import('./pages/SongSubmitPage')); // Assuming this exists
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage')); // Assuming this exists
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage')); // Assuming this exists
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
            
            <Route path="/radio" element={<RadioPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:articleSlug" element={<NewsArticlePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/artists/:artistId" element={<ArtistProfilePage />} />
            <Route path="/submit-song" element={<SongSubmitPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />

            {/* User Profile Routes */}
            <Route path="/profile/me" element={<UserProfilePage />} />
            <Route path="/profile/:username" element={<PublicUserProfilePage />} />

            {/* Removed forum routes:
            <Route path="/members" element={<MembersPage />} />
            <Route path="/members/forum/:categorySlug" element={<ForumCategoryPage />} />
            <Route path="/members/forum/:categorySlug/new" element={<NewForumTopicPage />} />
            <Route path="/members/forum/:categorySlug/:topicId" element={<ForumTopicPage />} />
            */}

            {/* Staff Routes */}
            <Route path="/staff/login" element={<StaffLoginPage />} />
            <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
            <Route path="/staff/users" element={<StaffUsersPage />} />
            <Route path="/staff/settings" element={<StaffSettingsPage />} />
            {/* Removed staff forum management route:
            <Route path="/staff/forum-management" element={<StaffForumManagementPage />} /> 
            */}
            <Route path="/staff/help" element={<StaffHelpPage />} />
            
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
