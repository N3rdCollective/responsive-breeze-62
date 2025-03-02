
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Personalities from "./pages/Personalities";
import Schedule from "./pages/Schedule";
import News from "./pages/News";
import NewsPost from "./pages/NewsPost";
import NewsEditor from "./pages/NewsEditor";
import NotFound from "./pages/NotFound";
import StaffPanel from "./pages/StaffPanel";
import StaffLogin from "./pages/StaffLogin";
import StaffRegistration from "./pages/StaffRegistration";
import StaffSignup from "./pages/StaffSignup";
import StaffNews from "./pages/StaffNews";
import StaffPersonalities from "./pages/StaffPersonalities";
import StaffPersonalityEdit from "./pages/StaffPersonalityEdit";
import Careers from "./pages/Careers";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="theme">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/personalities" element={<Personalities />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsPost />} />
          <Route path="/news-editor" element={<NewsEditor />} />
          <Route path="/news-editor/:id" element={<NewsEditor />} />
          <Route path="/careers" element={<Careers />} />
          
          {/* Staff Routes */}
          <Route path="/staff-panel" element={<StaffPanel />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/staff-registration" element={<StaffRegistration />} />
          <Route path="/staff-signup" element={<StaffSignup />} />
          <Route path="/staff/news" element={<StaffNews />} />
          <Route path="/staff/personalities" element={<StaffPersonalities />} />
          <Route path="/staff/personalities/edit/:id" element={<StaffPersonalityEdit />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <SonnerToaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
