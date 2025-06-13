
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StaffAuthProvider } from "@/hooks/useStaffAuth";
import { AuthProvider } from "@/hooks/useAuth";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import MusicPlayer from "@/components/MusicPlayer";
import Index from "./pages/Index";
import About from "./pages/About";
import News from "./pages/News";
import Auth from "./pages/Auth";
import RequestPasswordResetPage from "./pages/RequestPasswordResetPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import StaffRegistration from "./pages/StaffRegistration";
import StaffLoginPage from "./pages/StaffLoginPage";
import StaffPanel from "./pages/StaffPanel";
import StaffUserManager from "./pages/StaffUserManager";
import StaffAnalytics from "./pages/StaffAnalytics";
import StaffHomepageManager from "./pages/StaffHomepageManager";

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
              <StaffAuthProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
                  <Route path="/update-password" element={<UpdatePasswordPage />} />
                  <Route path="/staff/register" element={<StaffRegistration />} />
                  <Route path="/staff/login" element={<StaffLoginPage />} />
                  <Route path="/staff/panel" element={<StaffPanel />} />
                  <Route path="/staff/users" element={<StaffUserManager />} />
                  <Route path="/staff/analytics" element={<StaffAnalytics />} />
                  <Route path="/staff/homepage" element={<StaffHomepageManager />} />
                </Routes>
                <MusicPlayer />
              </StaffAuthProvider>
            </AuthProvider>
          </BrowserRouter>
        </SecurityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
