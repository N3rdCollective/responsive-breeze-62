
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "@/hooks/useAuth"; 

import HomePage from "@/pages/Index"; 
import PersonalitiesPage from "@/pages/Personalities"; 
import SchedulePage from "@/pages/Schedule"; 
import AboutPage from "@/pages/About"; 
import NewsPage from "@/pages/News"; 
import NewsPostPage from "@/pages/NewsPost"; // Added import for NewsPostPage
import ContactPage from "@/pages/Contact"; 
import AuthPage from "@/pages/Auth"; 
import MembersPage from "@/pages/MembersPage";
import EnhancedProfilePage from "@/pages/ProfilePage"; 
import PublicProfilePage from "@/pages/PublicProfilePage"; 
import MessagesPage from "@/pages/MessagesPage"; // Import the new MessagesPage

{/* Forum Routes */}
import ForumCategoryPage from "@/pages/ForumCategoryPage"; 
import ForumTopicPage from "@/pages/ForumTopicPage"; 
import ForumNewTopicPage from "@/pages/NewForumTopicPage";
import ForumInitiateSearchPage from "@/pages/ForumInitiateSearchPage"; // Import the new dedicated search page
import ForumSearchResultsPage from "@/pages/ForumSearchResultsPage"; // Import the new search results page

{/* Staff Pages */}
import StaffLogin from "@/pages/StaffLogin";
// import StaffDashboard from "@/pages/StaffDashboard"; // This line will be removed
import StaffNewsEditor from "@/pages/StaffNewsEditor"; 
import StaffShowsManager from "@/pages/StaffShowsManager"; 
import StaffForumManager from "@/pages/StaffForumManagementPage";
import StaffUserManager from "@/pages/StaffUserManager"; 
import StaffModerationDashboard from "@/pages/StaffModeratorDashboard";
import UnifiedStaffDashboard from "@/pages/UnifiedStaffDashboard";
import StaffHomepageManager from "@/pages/StaffHomepageManager"; // Added import
import NotFoundPage from "@/pages/NotFound"; 

// New StaffLayout component
import StaffLayout from "@/components/layouts/StaffLayout";
import MusicPlayer from "@/components/MusicPlayer";
import RedirectNewTopic from "@/components/utility/RedirectNewTopic"; // Added import for the redirect component

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
          <Route path="/news/:id" element={<NewsPostPage />} /> {/* Added route for individual news posts */}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Member & Forum Routes */}
          {/* Order matters: More specific routes first */}
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/forum/:categorySlug/new" element={<RedirectNewTopic />} /> 
          <Route path="/members/forum/:categorySlug" element={<ForumCategoryPage />} /> {/* New route for categories under /members/forum */}
          <Route path="/members/forum" element={<MembersPage />} /> {/* New route for base /members/forum path */}

          <Route path="/profile" element={<EnhancedProfilePage />} />
          <Route path="/u/:username" element={<PublicProfilePage />} />
          <Route path="/messages" element={<MessagesPage />} /> {/* Add MessagesPage route */}
          
          {/* Original Forum Routes (kept for direct access or other links) */}
          <Route path="/forum" element={<MembersPage />} /> 
          <Route path="/forum/initiate-search" element={<ForumInitiateSearchPage />} /> {/* Add dedicated search page route */}
          <Route path="/forum/search" element={<ForumSearchResultsPage />} /> {/* Add search results route */}
          <Route path="/forum/category/:categorySlug" element={<ForumCategoryPage />} />
          {/* Changed :topicId to :topicSlug */}
          <Route path="/forum/topic/:topicSlug" element={<ForumTopicPage />} /> 
          {/* Changed :categoryId to :categorySlug here */}
          <Route path="/forum/new-topic/:categorySlug" element={<ForumNewTopicPage />} />
          
          {/* Staff Routes - Wrapped with StaffLayout */}
          <Route element={<StaffLayout />}>
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/panel" element={<UnifiedStaffDashboard />} />
            <Route path="/staff/home" element={<StaffHomepageManager />} /> {/* Added route */}
            <Route path="/staff/news/editor" element={<StaffNewsEditor />} />
            <Route path="/staff/news/editor/:postId" element={<StaffNewsEditor />} />
            <Route path="/staff/shows" element={<StaffShowsManager />} />
            <Route path="/staff/forum" element={<StaffForumManager />} />
            <Route path="/staff/users" element={<StaffUserManager />} />
            <Route path="/staff/moderation" element={<StaffModerationDashboard />} />
            
            {/* Legacy Staff Dashboard - THIS LINE IS REMOVED */}
            {/* <Route path="/admin/dashboard" element={<StaffDashboard />} /> */}
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

