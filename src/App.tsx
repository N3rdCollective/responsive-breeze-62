
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MusicPlayer from "@/components/MusicPlayer";

// Import Components
import Index from "@/pages/Index";
import About from "@/pages/About";
import Personalities from "@/pages/Personalities";
import News from "@/pages/News";
import NewsPost from "@/pages/NewsPost";
import Schedule from "@/pages/Schedule";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";

// Import Staff Components
import StaffLogin from "@/pages/StaffLogin";
import StaffSignup from "@/pages/StaffSignup";
import StaffRegistration from "@/pages/StaffRegistration";
import StaffPanel from "@/pages/StaffPanel";
import StaffPersonalities from "@/pages/StaffPersonalities";
import StaffNews from "@/pages/StaffNews";
import NewsEditor from "@/pages/NewsEditor";
import StaffHomePage from "@/pages/StaffHomePage";
import StaffAboutEditor from "@/pages/StaffAboutEditor";
import StaffSponsors from "@/pages/StaffSponsors";

// Import UI Components
import { Toaster } from "@/components/ui/sonner"
import StaffSystemSettings from './pages/StaffSystemSettings';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/personalities" element={<Personalities />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:postId" element={<NewsPost />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Staff Routes */}
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/signup" element={<StaffSignup />} />
            <Route path="/staff/registration" element={<StaffRegistration />} />
            <Route path="/staff" element={<StaffPanel />} />
            <Route path="/staff/personalities" element={<StaffPersonalities />} />
            <Route path="/staff/news" element={<StaffNews />} />
            <Route path="/staff/news/edit/:postId" element={<NewsEditor />} />
            <Route path="/staff/news/create" element={<NewsEditor />} />
            <Route path="/staff/home-editor" element={<StaffHomePage />} />
            <Route path="/staff/about-editor" element={<StaffAboutEditor />} />
            <Route path="/staff/sponsors" element={<StaffSponsors />} />
            <Route path="/staff/system-settings" element={<StaffSystemSettings />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MusicPlayer />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
