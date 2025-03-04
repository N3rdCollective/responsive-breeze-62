import React from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Personalities from "@/pages/Personalities";
import News from "@/pages/News";
import NewsPost from "@/pages/NewsPost";
import Schedule from "@/pages/Schedule";
import Contact from "@/pages/Contact";
import Careers from "@/pages/Careers";
import StaffLogin from "@/pages/StaffLogin";
import StaffSignup from "@/pages/StaffSignup";
import StaffRegistration from "@/pages/StaffRegistration";
import StaffPanel from "@/pages/StaffPanel";
import StaffNews from "@/pages/StaffNews";
import NewsEditor from "@/pages/NewsEditor";
import StaffAboutEditor from "@/pages/StaffAboutEditor";
import StaffPersonalities from "@/pages/StaffPersonalities";
import NotFound from "@/pages/NotFound";
import MusicPlayer from "@/components/MusicPlayer";
import { Toaster } from "@/components/ui/toaster";
import StaffSponsors from "@/pages/StaffSponsors";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <div className="bg-background">
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/personalities" element={<Personalities />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsPost />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/careers" element={<Careers />} />

              {/* Staff Routes */}
              <Route path="/staff/login" element={<StaffLogin />} />
              <Route path="/staff/signup" element={<StaffSignup />} />
              <Route path="/staff/register/:token" element={<StaffRegistration />} />
              <Route path="/staff" element={<StaffPanel />} />
              <Route path="/staff/news" element={<StaffNews />} />
              <Route path="/staff/news/edit/:id" element={<NewsEditor />} />
              <Route path="/staff/news/new" element={<NewsEditor />} />
              <Route path="/staff/about-editor" element={<StaffAboutEditor />} />
              <Route path="/staff/personalities" element={<StaffPersonalities />} />
              <Route path="/staff/sponsors" element={<StaffSponsors />} />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MusicPlayer />
            <Toaster />
          </div>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
