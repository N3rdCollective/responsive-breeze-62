import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import MusicPlayer from "./components/MusicPlayer";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import Schedule from "./pages/Schedule";
import News from "./pages/News";
import NewsPost from "./pages/NewsPost";
import Personalities from "./pages/Personalities";
import NotFound from "./pages/NotFound";
import StaffLogin from "./pages/StaffLogin";
import StaffPanel from "./pages/StaffPanel";
import StaffNews from "./pages/StaffNews";
import StaffPersonalities from "./pages/StaffPersonalities";
import StaffRegistration from "./pages/StaffRegistration";
import StaffSignup from "./pages/StaffSignup";
import NewsEditor from "./pages/NewsEditor";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsPost />} />
            <Route path="/personalities" element={<Personalities />} />
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/panel" element={<StaffPanel />} />
            <Route path="/staff/news" element={<StaffNews />} />
            <Route path="/staff/personalities" element={<StaffPersonalities />} />
            <Route path="/staff/news/edit/:id" element={<NewsEditor />} />
            <Route path="/staff/news/new" element={<NewsEditor />} />
            <Route path="/staff/registration" element={<StaffRegistration />} />
            <Route path="/staff/signup" element={<StaffSignup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MusicPlayer />
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
