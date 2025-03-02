import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Pages
import Index from '@/pages/Index';
import About from '@/pages/About';
import News from '@/pages/News';
import NewsPost from '@/pages/NewsPost';
import Schedule from '@/pages/Schedule';
import Contact from '@/pages/Contact';
import StaffLogin from '@/pages/StaffLogin';
import StaffPanel from '@/pages/StaffPanel';
import StaffNews from '@/pages/StaffNews';
import NewsEditor from '@/pages/NewsEditor';
import Personalities from '@/pages/Personalities';
import Careers from '@/pages/Careers';
import NotFound from '@/pages/NotFound';
import StaffSignup from "./pages/StaffSignup";
import StaffRegistration from "./pages/StaffRegistration";

// Import the Toaster component
import { Toaster } from '@/components/ui/toaster';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsPost />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/personalities" element={<Personalities />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/staff-panel" element={<StaffPanel />} />
            <Route path="/staff/news" element={<StaffNews />} />
            <Route path="/staff/news/edit" element={<NewsEditor />} />
            <Route path="/staff/news/edit/:id" element={<NewsEditor />} />
            <Route path="/staff-signup" element={<StaffSignup />} />
            <Route path="/staff-registration" element={<StaffRegistration />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
