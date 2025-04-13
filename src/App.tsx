import { Routes, Route, Navigate } from "react-router-dom";
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
import StaffPanel from "@/pages/StaffPanel";
import StaffSponsors from "@/pages/StaffSponsors";
import StaffSystemSettings from "@/pages/StaffSystemSettings";
import StaffHomePage from "@/pages/StaffHomePage";
import StaffPersonalitiesPage from "@/pages/StaffPersonalitiesPage";
import StaffActivityLogs from "@/pages/StaffActivityLogs";
import StaffFeaturedArtists from "@/pages/StaffFeaturedArtists";
import ArtistsPage from "@/pages/ArtistsPage";
import ArtistsArchivePage from "@/pages/ArtistsArchivePage";
import ArtistDetail from "@/pages/ArtistDetail";
import MusicPlayer from "@/components/MusicPlayer";
import BookingRequests from "@/pages/BookingRequests";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} errorElement={<RouteErrorElement />} />
        <Route path="/about" element={<About />} errorElement={<RouteErrorElement />} />
        <Route path="/contact" element={<Contact />} errorElement={<RouteErrorElement />} />
        <Route path="/schedule" element={<Schedule />} errorElement={<RouteErrorElement />} />
        <Route path="/news" element={<News />} errorElement={<RouteErrorElement />} />
        <Route path="/news/:id" element={<NewsPost />} errorElement={<RouteErrorElement />} />
        <Route path="/personalities" element={<Personalities />} errorElement={<RouteErrorElement />} />
        <Route path="/artists" element={<ArtistsPage />} errorElement={<RouteErrorElement />} />
        <Route path="/artists/archive" element={<ArtistsArchivePage />} errorElement={<RouteErrorElement />} />
        <Route path="/artists/:id" element={<ArtistDetail />} errorElement={<RouteErrorElement />} />
        <Route path="/staff" element={<Navigate to="/staff/panel" replace />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/panel" element={<StaffPanel />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/news" element={<StaffNews />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/login" element={<StaffLogin />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/signup" element={<StaffSignup />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/registration" element={<StaffRegistration />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/news/editor" element={<NewsEditor />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/news/editor/:id" element={<NewsEditor />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/news/edit/:id" element={<NewsEditor />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/sponsors" element={<StaffSponsors />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/system-settings" element={<StaffSystemSettings />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/home" element={<StaffHomePage />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/personalities" element={<StaffPersonalitiesPage />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/activity-logs" element={<StaffActivityLogs />} errorElement={<RouteErrorElement />} />
        <Route path="/staff/featured-artists" element={<StaffFeaturedArtists />} errorElement={<RouteErrorElement />} />
        <Route path="/booking-requests" element={<BookingRequests />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Always render the MusicPlayer outside of routes to ensure it's always visible */}
      <MusicPlayer />
    </>
  );
}

export default App;
