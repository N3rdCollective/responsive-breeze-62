
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

// Pages
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Schedule from "@/pages/Schedule";
import Personalities from "@/pages/Personalities";
import News from "@/pages/News";
import NotFound from "@/pages/NotFound";
import NewsPost from "@/pages/NewsPost";
import NewsEditor from "@/pages/NewsEditor";
import StaffLogin from "@/pages/StaffLogin";
import StaffRegistration from "@/pages/StaffRegistration";
import StaffPanel from "@/pages/StaffPanel";
import StaffNews from "@/pages/StaffNews";
import StaffPersonalities from "@/pages/StaffPersonalities";
import StaffPersonalityEdit from "@/pages/StaffPersonalityEdit";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="radio-theme">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/personalities" element={<Personalities />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsPost />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/staff-registration" element={<StaffRegistration />} />
          <Route path="/staff" element={<StaffPanel />} />
          <Route path="/staff/news" element={<StaffNews />} />
          <Route path="/staff/news/edit/:id" element={<NewsEditor />} />
          <Route path="/staff/news/create" element={<NewsEditor />} />
          <Route path="/staff/personalities" element={<StaffPersonalities />} />
          <Route path="/staff/personalities/edit/:id" element={<StaffPersonalityEdit />} />
        </Routes>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
