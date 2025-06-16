
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import MusicPlayer from "@/components/MusicPlayer";
import StaffLayout from "@/components/layouts/StaffLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import News from "./pages/News";
import NewsPostPage from "./pages/NewsPost";
import Auth from "./pages/Auth";
import ProfilePage from "./pages/ProfilePage";
import RequestPasswordResetPage from "./pages/RequestPasswordResetPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import StaffRegistration from "./pages/StaffRegistration";
import StaffLoginPage from "./pages/StaffLoginPage";
import StaffPanel from "./pages/StaffPanel";
import StaffUserManager from "./pages/StaffUserManager";
import StaffAnalytics from "./pages/StaffAnalytics";
import StaffHomepageManager from "./pages/StaffHomepageManager";
import StaffNewsPage from "./pages/StaffNewsPage";
import NewsEditor from "./pages/NewsEditor";
import MembersPage from "./pages/MembersPage";
import ForumCategoryPage from "./pages/ForumCategoryPage";
import ForumTopicPage from "./pages/ForumTopicPage";
import NewForumTopicPage from "./pages/NewForumTopicPage";
import ForumSearchResultsPage from "./pages/ForumSearchResultsPage";
import ForumInitiateSearchPage from "./pages/ForumInitiateSearchPage";
import StaffVideosPage from "./pages/StaffVideosPage";
import StaffForumManagementPage from "./pages/StaffForumManagementPage";
import StaffShowsManager from "./pages/StaffShowsManager";
import StaffModerationPage from "./pages/StaffModerationPage";
import UnifiedMessagesPage from "./pages/UnifiedMessagesPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SecurityProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsPostPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/messages" element={<UnifiedMessagesPage />} />
                <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
                <Route path="/update-password" element={<UpdatePasswordPage />} />
                <Route path="/members" element={<MembersPage />} />
                <Route path="/members/forum" element={<MembersPage />} />
                <Route path="/members/forum/:categorySlug" element={<ForumCategoryPage />} />
                <Route path="/members/forum/:categorySlug/:topicSlug" element={<ForumTopicPage />} />
                <Route path="/forum/new-topic/:categorySlug" element={<NewForumTopicPage />} />
                <Route path="/forum/search-results" element={<ForumSearchResultsPage />} />
                <Route path="/forum/initiate-search" element={<ForumInitiateSearchPage />} />
                
                {/* Staff authentication routes (outside StaffLayout) */}
                <Route path="/staff/register" element={<StaffRegistration />} />
                <Route path="/staff/login" element={<StaffLoginPage />} />
                
                {/* Staff dashboard routes (nested under StaffLayout) */}
                <Route path="/staff/*" element={<StaffLayout />}>
                  <Route index element={<Navigate to="panel" replace />} />
                  <Route path="panel" element={<StaffPanel />} />
                  <Route path="users" element={<StaffUserManager />} />
                  <Route path="analytics" element={<StaffAnalytics />} />
                  <Route path="homepage" element={<StaffHomepageManager />} />
                  <Route path="news" element={<StaffNewsPage />} />
                  <Route path="news/editor" element={<NewsEditor />} />
                  <Route path="news/editor/:id" element={<NewsEditor />} />
                  <Route path="videos" element={<StaffVideosPage />} />
                  <Route path="forum" element={<StaffForumManagementPage />} />
                  <Route path="shows" element={<StaffShowsManager />} />
                  <Route path="moderation" element={<StaffModerationPage />} />
                </Route>
              </Routes>
              <MusicPlayer />
            </AuthProvider>
          </BrowserRouter>
        </SecurityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
