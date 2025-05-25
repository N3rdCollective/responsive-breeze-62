
import { Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "@/hooks/useAuth"; 
import { StaffAuthProvider } from "@/hooks/useStaffAuth"; 

import HomePage from "@/pages/Index"; 
import PersonalitiesPage from "@/pages/Personalities"; 
import SchedulePage from "@/pages/Schedule"; 
import AboutPage from "@/pages/About"; 
import NewsPage from "@/pages/News"; 
import ContactPage from "@/pages/Contact"; 
import AuthPage from "@/pages/Auth"; 
import MembersPage from "@/pages/MembersPage";
import EnhancedProfilePage from "@/pages/ProfilePage"; 
import PublicProfilePage from "@/pages/PublicProfilePage"; 

{/* Forum Routes */}
import ForumCategoryPage from "@/pages/ForumCategoryPage"; 
import ForumTopicPage from "@/pages/ForumTopicPage"; 
import ForumNewTopicPage from "@/pages/NewForumTopicPage";

{/* Staff Pages */}
import StaffLogin from "@/pages/StaffLogin"; // Import the StaffLogin page
import StaffDashboard from "@/pages/StaffDashboard"; // Legacy, might be UnifiedStaffDashboard
import StaffNewsEditor from "@/pages/StaffNewsEditor"; 
import StaffShowsManager from "@/pages/StaffShowsManager"; 
import StaffForumManager from "@/pages/StaffForumManagementPage";
import StaffUserManager from "@/pages/StaffUserManager"; 
import StaffModerationDashboard from "@/pages/StaffModeratorDashboard";
import UnifiedStaffDashboard from "@/pages/UnifiedStaffDashboard";
import NotFoundPage from "@/pages/NotFound"; 

function App() {
  return (
    <AuthProvider>
      <StaffAuthProvider>
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
            <Route path="/u/:username" element={<PublicProfilePage />} />
            
            {/* Forum Routes */}
            <Route path="/forum" element={<MembersPage />} /> {/* Assuming MembersPage is the entry for forum */}
            <Route path="/forum/category/:categorySlug" element={<ForumCategoryPage />} />
            <Route path="/forum/topic/:topicId" element={<ForumTopicPage />} />
            <Route path="/forum/new-topic/:categoryId" element={<ForumNewTopicPage />} />
            
            {/* Staff Routes */}
            <Route path="/staff/login" element={<StaffLogin />} /> {/* Added staff login route */}
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
        </TooltipProvider>
      </StaffAuthProvider>
    </AuthProvider>
  );
}

export default App;
