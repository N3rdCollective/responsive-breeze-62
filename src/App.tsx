import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { StaffAuthProvider } from "@/hooks/useStaffAuth";

import HomePage from "@/pages/HomePage";
import PersonalitiesPage from "@/pages/PersonalitiesPage";
import SchedulePage from "@/pages/SchedulePage";
import AboutPage from "@/pages/AboutPage";
import NewsPage from "@/pages/NewsPage";
import ContactPage from "@/pages/ContactPage";
import AuthPage from "@/pages/AuthPage";
import MembersPage from "@/pages/MembersPage";
import EnhancedProfilePage from "@/pages/ProfilePage"; // User's own profile
import PublicProfilePage from "@/pages/PublicProfilePage"; // Page for viewing other users' profiles
import ForumHomePage from "@/pages/forum/ForumHomePage";
import ForumCategoryPage from "@/pages/forum/ForumCategoryPage";
import ForumTopicPage from "@/pages/forum/ForumTopicPage";
import ForumNewTopicPage from "@/pages/forum/ForumNewTopicPage";
import StaffDashboard from "@/pages/StaffDashboard";
import StaffNewsEditor from "@/pages/StaffNewsEditor";
import StaffShowsManager from "@/pages/StaffShowsManager";
import StaffForumManager from "@/pages/StaffForumManager";
import StaffUserManager from "@/pages/StaffUserManager";
import StaffModerationDashboard from "@/pages/StaffModerationDashboard";
import UnifiedStaffDashboard from "@/pages/UnifiedStaffDashboard";
import NotFoundPage from "@/pages/NotFoundPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <StaffAuthProvider> {/* Ensure StaffAuthProvider wraps routes that need it */}
          <TooltipProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/personalities" element={<PersonalitiesPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/profile" element={<EnhancedProfilePage />} />
              <Route path="/u/:username" element={<PublicProfilePage />} /> {/* New Public Profile Route */}
              
              {/* Forum Routes */}
              <Route path="/forum" element={<ForumHomePage />} />
              <Route path="/forum/category/:categoryId" element={<ForumCategoryPage />} />
              <Route path="/forum/topic/:topicId" element={<ForumTopicPage />} />
              <Route path="/forum/new-topic/:categoryId" element={<ForumNewTopicPage />} />
              
              {/* Staff Routes */}
              <Route path="/staff/panel" element={<UnifiedStaffDashboard />} />
              <Route path="/staff/news/editor" element={<StaffNewsEditor />} />
              <Route path="/staff/news/editor/:postId" element={<StaffNewsEditor />} />
              <Route path="/staff/shows" element={<StaffShowsManager />} />
              <Route path="/staff/forum" element={<StaffForumManager />} />
              <Route path="/staff/users" element={<StaffUserManager />} />
              <Route path="/staff/moderation" element={<StaffModerationDashboard />} />
              
              {/* Legacy Staff Dashboard - can be removed once Unified is complete */}
              <Route path="/admin/dashboard" element={<StaffDashboard />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster />
          </TooltipProvider>
        </StaffAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
