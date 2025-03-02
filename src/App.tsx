
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

// Import pages
import Index from "./pages/Index";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Schedule from "./pages/Schedule";
import Personalities from "./pages/Personalities";
import Contact from "./pages/Contact";
import News from "./pages/News";
import NewsPost from "./pages/NewsPost";
import Careers from "./pages/Careers";
import StaffLogin from "./pages/StaffLogin";
import StaffPanel from "./pages/StaffPanel";
import StaffSignup from "./pages/StaffSignup";
import StaffRegistration from "./pages/StaffRegistration";
import StaffNews from "./pages/StaffNews";
import NewsEditor from "./pages/NewsEditor";
import StaffPersonalities from "./pages/StaffPersonalities";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="rapping-lounge-theme">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/personalities" element={<Personalities />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsPost />} />
          <Route path="/careers" element={<Careers />} />
          
          {/* Staff routes */}
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/staff-signup/:inviteId" element={<StaffSignup />} />
          <Route path="/staff-signup" element={<StaffSignup />} />
          <Route path="/staff-panel" element={<StaffPanel />} />
          <Route path="/staff-registration" element={<StaffRegistration />} />
          
          {/* Staff content management routes */}
          <Route path="/staff/news" element={<StaffNews />} />
          <Route path="/staff/news/edit/:id" element={<NewsEditor />} />
          <Route path="/staff/news/edit" element={<NewsEditor />} />
          <Route path="/staff/personalities" element={<StaffPersonalities />} />
          <Route path="/staff/personalities/edit/:id" element={<NewsEditor />} />
          <Route path="/staff/personalities/edit" element={<NewsEditor />} />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
