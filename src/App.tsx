
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import News from "./pages/News";
import Personalities from "./pages/Personalities";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import StaffLogin from "./pages/StaffLogin";
import StaffPanel from "./pages/StaffPanel";
import Schedule from "./pages/Schedule";
import NotFound from "./pages/NotFound";
import MusicPlayer from "./components/MusicPlayer";

const App = () => {
  // Create a new QueryClient instance
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/news" element={<News />} />
              <Route path="/personalities" element={<Personalities />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/staff-login" element={<StaffLogin />} />
              <Route path="/staff-panel" element={<StaffPanel />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MusicPlayer />
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
