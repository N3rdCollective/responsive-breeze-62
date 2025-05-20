
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Schedule from "@/pages/Schedule";
import News from "@/pages/News";
import NewsPost from "@/pages/NewsPost";
import Personalities from "@/pages/Personalities";
import NotFound from "@/pages/NotFound";
import StaffLogin from "@/pages/StaffLogin";
import StaffSignup from "@/pages/StaffSignup";
import StaffRegistration from "@/pages/StaffRegistration";
import NewsEditor from "@/pages/NewsEditor";
import RouteErrorElement from "@/components/RouteErrorElement";
import StaffNews from "@/pages/StaffNews";
import StaffPanel from "@/pages/StaffPanel";
import StaffSponsors from "@/pages/StaffSponsors";
import StaffSystemSettings from "@/pages/StaffSystemSettings";
import StaffHomePage from "@/pages/StaffHomePage";
import StaffPersonalitiesPage from "@/pages/StaffPersonalitiesPage";
import StaffActivityLogs from "@/pages/StaffActivityLogs";
import StaffFeaturedArtists from "@/pages/StaffFeaturedArtists";
import ArtistsPage from "@/pages/ArtistsPage";
import ArtistsArchivePage from "@/pages/ArtistsArchivePage";
import ArtistDetail from "@/pages/ArtistDetail";
import MusicPlayer from "@/components/MusicPlayer";
// AuthPage import removed
import ProfilePage from "@/pages/ProfilePage";
import MembersPage from "@/pages/MembersPage";
import ForumCategoryPage from "@/pages/ForumCategoryPage";
import ForumTopicPage from "@/pages/ForumTopicPage";
import NewForumTopicPage from "@/pages/NewForumTopicPage";
import StaffForumManagementPage from "@/pages/StaffForumManagementPage";
import RequestPasswordResetPage from "@/pages/RequestPasswordResetPage";
import UpdatePasswordPage from "@/pages/UpdatePasswordPage";
import StaffModeratorDashboard from "@/pages/StaffModeratorDashboard";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} errorElement={<RouteErrorElement />} />
        <Route path="/about" element={<About />} errorElement={<RouteErrorElement />} />
        <Route path="/contact" element={<Contact />} errorElement={<RouteErrorElement />} />
        <Route path="/schedule" element={<Schedule />} errorElement={<RouteErrorElement />} />
        <Route path="/news" element={<News />} errorElement={<RouteErrorElement />} />
        <Route path="/news/:id" element={<NewsPost />} errorElement={<RouteErrorElement />} />
        <Route path="/personalities" element={<Personalities />} errorElement={<RouteErrorElement />} />
        <Route path="/artists" element={<ArtistsPage />} errorElement={<RouteErrorElement />} />
        <Route path="/artists/archive" element={<ArtistsArchivePage />} errorElement={<RouteErrorElement />} />
        <Route path="/artists/:id" element={<ArtistDetail />} errorElement={<RouteErrorElement />} />
        <Route path="/profile" element={<ProfilePage />} errorElement={<RouteErrorElement />} />
        <Route path="/members" element={<MembersPage />} errorElement={<RouteErrorElement />} />
        <Route path="/members/forum/:categorySlug" element={<ForumCategoryPage />} errorElement={<RouteErrorElement />} />
        <Route path="/members/forum/:categorySlug/new" element={<NewForumTopicPage />} errorElement={<RouteErrorElement />} />
        <Route path="/members/forum/:categorySlug/:topicId" element={<ForumTopicPage />} errorElement={<RouteErrorElement />} />
        
        <Route path="/staff" element={<Navigate to="/staff/panel" replace />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/panel" element={<StaffPanel />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/news" element={<StaffNews />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/login" element={<StaffLogin />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/signup" element={<StaffSignup />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/registration" element={<StaffRegistration />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/news/editor" element={<NewsEditor />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/news/editor/:id" element={<NewsEditor />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/news/edit/:id" element={<NewsEditor />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/sponsors" element={<StaffSponsors />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/system-settings" element={<StaffSystemSettings />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/home" element={<StaffHomePage />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/personalities" element={<StaffPersonalitiesPage />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/activity-logs" element={<StaffActivityLogs />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/featured-artists" element={<StaffFeaturedArtists />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/forum-management" element={<StaffForumManagementPage />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/moderator-dashboard" element={<StaffModeratorDashboard />} errorElement={<RouteErrorElement />} />
        
        {/* AuthPage route removed */}
        <Route path="/request-password-reset" element={<RequestPasswordResetPage />} errorElement={<RouteErrorElement />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} errorElement={<RouteErrorElement />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <MusicPlayer />
    </>
  );
}

export default App;
