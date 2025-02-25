
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import News from "@/pages/News";
import NotFound from "@/pages/NotFound";
import Personalities from "@/pages/Personalities";
import Schedule from "@/pages/Schedule";
import StaffLogin from "@/pages/StaffLogin";
import StaffPanel from "@/pages/StaffPanel";
import EditHomePage from "@/pages/EditHomePage";
import StaffRegistration from "@/pages/StaffRegistration";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/news" element={<News />} />
          <Route path="/personalities" element={<Personalities />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/staff-panel" element={<StaffPanel />} />
          <Route path="/staff-register" element={<StaffRegistration />} />
          <Route path="/edit-home" element={<EditHomePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
