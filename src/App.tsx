
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "@/hooks/useAuth"; 

import HomePage from "@/pages/Index"; 
import PersonalitiesPage from "@/pages/Personalities"; 
import SchedulePage from "@/pages/Schedule"; 
import AboutPage from "@/pages/About"; 
import NewsPage from "@/pages/News"; 
import NewsPostPage from "@/pages/NewsPost";
import ContactPage from "@/pages/Contact"; 
import AuthPage from "@/pages/Auth"; 
import MembersPage from "@/pages/MembersPage";
import EnhancedProfilePage from "@/pages/ProfilePage"; 
import PublicProfilePage from "@/pages/PublicProfilePage"; 
import MessagesPage from "@/pages/MessagesPage";

{/* Forum Routes */}
import ForumCategoryPage from "@/pages/ForumCategoryPage"; 
import ForumTopicPage from "@/pages/ForumTopicPage"; 
import ForumNewTopicPage from "@/pages/NewForumTopicPage";
import ForumInitiateSearchPage from "@/pages/ForumInitiateSearchPage";
import ForumSearchResultsPage from "@/pages/ForumSearchResultsPage";

{/* Staff Pages */}
import StaffLogin from "@/pages/StaffLogin";
import NewsEditor from "@/pages/NewsEditor"; 
import StaffNewsPage from "@/pages/StaffNewsPage"; 
import StaffShowsManager from "@/pages/StaffShowsManager"; 
import StaffForumManager from "@/pages/StaffForumManagementPage";
import StaffUserManager from "@/pages/StaffUserManager"; 
import StaffModerationDashboard from "@/pages/StaffModeratorDashboard";
import UnifiedStaffDashboard from "@/pages/UnifiedStaffDashboard";
import StaffHomepageManager from "@/pages/StaffHomepageManager";
import NotFoundPage from "@/pages/NotFound"; 

// New StaffLayout component
import StaffLayout from "@/components/layouts/StaffLayout";
import MusicPlayer from "@/components/MusicPlayer";
import RedirectNewTopic from "@/components/utility/RedirectNewTopic";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Routes>
          {/* Public and General User Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/personalities" element={<PersonalitiesPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsPostPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Member & Forum Routes */}
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/forum/:categorySlug/new" element={<RedirectNewTopic />} /> 
          <Route path="/members/forum/:categorySlug" element={<ForumCategoryPage />} />
          <Route path="/members/forum" element={<MembersPage />} />

          <Route path="/profile" element={<EnhancedProfilePage />} />
          <Route path="/u/:username" element={<PublicProfilePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          
          {/* Original Forum Routes */}
          <Route path="/forum" element={<MembersPage />} /> 
          <Route path="/forum/initiate-search" element={<ForumInitiateSearchPage />} />
          <Route path="/forum/search" element={<ForumSearchResultsPage />} />
          <Route path="/forum/category/:categorySlug" element={<ForumCategoryPage />} />
          <Route path="/forum/topic/:topicSlug" element={<ForumTopicPage />} /> 
          <Route path="/forum/new-topic/:categorySlug" element={<ForumNewTopicPage />} />
          
          {/* Staff Routes - Wrapped with StaffLayout */}
          <Route element={<StaffLayout />}>
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/panel" element={<UnifiedStaffDashboard />} />
            <Route path="/staff/home" element={<StaffHomepageManager />} />
            <Route path="/staff/news" element={<StaffNewsPage />} />
            <Route path="/staff/news/editor" element={<NewsEditor />} />
            <Route path="/staff/news/editor/:postId" element={<NewsEditor />} />
            <Route path="/staff/shows" element={<StaffShowsManager />} />
            <Route path="/staff/forum" element={<StaffForumManager />} />
            <Route path="/staff/users" element={<StaffUserManager />} />
            <Route path="/staff/moderation" element={<StaffModerationDashboard />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <MusicPlayer />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
