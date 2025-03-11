
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Schedule from "@/pages/Schedule";
import News from "@/pages/News";
import NewsPost from "@/pages/NewsPost";
import Personalities from "@/pages/Personalities";
import NotFound from "@/pages/NotFound";
import StaffLogin from "@/pages/StaffLogin";
import StaffSignup from "@/pages/StaffSignup";
import StaffRegistration from "@/pages/StaffRegistration";
import NewsEditor from "@/pages/NewsEditor";
import RouteErrorElement from "@/components/RouteErrorElement";
import StaffNews from "@/pages/StaffNews";
import StaffDashboard from "@/pages/StaffDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} errorElement={<RouteErrorElement />} />
      <Route path="/about" element={<About />} errorElement={<RouteErrorElement />} />
      <Route path="/contact" element={<Contact />} errorElement={<RouteErrorElement />} />
      <Route path="/schedule" element={<Schedule />} errorElement={<RouteErrorElement />} />
      <Route path="/news" element={<News />} errorElement={<RouteErrorElement />} />
      <Route path="/news/:id" element={<NewsPost />} errorElement={<RouteErrorElement />} />
      <Route path="/personalities" element={<Personalities />} errorElement={<RouteErrorElement />} />
      <Route path="/staff" element={<StaffDashboard />} errorElement={<RouteErrorElement />} />
      <Route path="/staff/news" element={<StaffNews />} errorElement={<RouteErrorElement />} />
      <Route path="/staff/login" element={<StaffLogin />} errorElement={<RouteErrorElement />} />
      <Route path="/staff/signup" element={<StaffSignup />} errorElement={<RouteErrorElement />} />
      <Route path="/staff/registration" element={<StaffRegistration />} errorElement={<RouteErrorElement />} />
      <Route path="/staff/news/editor" element={<NewsEditor />} errorElement={<RouteErrorElement />} />
      <Route path="/staff/news/editor/:id" element={<NewsEditor />} errorElement={<RouteErrorElement />} />
      {/* Add the new route for the edit feature */}
      <Route path="/staff/news/edit/:id" element={<NewsEditor />} errorElement={<RouteErrorElement />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
