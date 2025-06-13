
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StaffAuthProvider } from "@/hooks/useStaffAuth";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import Index from "./pages/Index";
import About from "./pages/About";
import Forum from "./pages/Forum";
import ForumTopic from "./pages/ForumTopic";
import ForumCategory from "./pages/ForumCategory";
import Timeline from "./pages/Timeline";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Auth from "./pages/Auth";
import RequestPasswordResetPage from "./pages/RequestPasswordResetPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Conversation from "./pages/Conversation";
import StaffRegistration from "./pages/StaffRegistration";
import StaffLoginPage from "./pages/StaffLoginPage";
import StaffPanel from "./pages/StaffPanel";
import StaffUserManager from "./pages/StaffUserManager";
import StaffContentManager from "./pages/StaffContentManager";
import StaffAnalytics from "./pages/StaffAnalytics";
import StaffNewsManager from "./pages/StaffNewsManager";
import StaffCreateNews from "./pages/StaffCreateNews";
import StaffEditNews from "./pages/StaffEditNews";
import StaffReportManager from "./pages/StaffReportManager";
import StaffHomepageManager from "./pages/StaffHomepageManager";
import StaffPersonalityManager from "./pages/StaffPersonalityManager";
import StaffScheduleManager from "./pages/StaffScheduleManager";
import StaffSettings from "./pages/StaffSettings";
import PersonalityProfile from "./pages/PersonalityProfile";
import Schedule from "./pages/Schedule";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SecurityProvider>
          <StaffAuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/forum/topic/:slug" element={<ForumTopic />} />
                <Route path="/forum/category/:slug" element={<ForumCategory />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:slug" element={<NewsDetail />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
                <Route path="/update-password" element={<UpdatePasswordPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/conversation/:id" element={<Conversation />} />
                <Route path="/staff/register" element={<StaffRegistration />} />
                <Route path="/staff/login" element={<StaffLoginPage />} />
                <Route path="/staff/panel" element={<StaffPanel />} />
                <Route path="/staff/users" element={<StaffUserManager />} />
                <Route path="/staff/content" element={<StaffContentManager />} />
                <Route path="/staff/analytics" element={<StaffAnalytics />} />
                <Route path="/staff/news" element={<StaffNewsManager />} />
                <Route path="/staff/news/create" element={<StaffCreateNews />} />
                <Route path="/staff/news/edit/:id" element={<StaffEditNews />} />
                <Route path="/staff/reports" element={<StaffReportManager />} />
                <Route path="/staff/homepage" element={<StaffHomepageManager />} />
                <Route path="/staff/personalities" element={<StaffPersonalityManager />} />
                <Route path="/staff/schedule" element={<StaffScheduleManager />} />
                <Route path="/staff/settings" element={<StaffSettings />} />
                <Route path="/personality/:id" element={<PersonalityProfile />} />
                <Route path="/schedule" element={<Schedule />} />
              </Routes>
            </BrowserRouter>
          </StaffAuthProvider>
        </SecurityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
