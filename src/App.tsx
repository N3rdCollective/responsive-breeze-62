import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import AuthProvider from '@/hooks/useAuth';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicPlayer from "@/components/MusicPlayer";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouteErrorElement from "@/components/RouteErrorElement";
import PageLoader from "@/components/general/PageLoader";
import StaffLayout from "@/components/layouts/StaffLayout";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const News = lazy(() => import("./pages/News"));
const NewsPost = lazy(() => import("./pages/NewsPost"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Personalities = lazy(() => import("./pages/Personalities"));
const ArtistsPage = lazy(() => import("./pages/ArtistsPage"));
const ArtistDetail = lazy(() => import("./pages/ArtistDetail"));
const ArtistsArchivePage = lazy(() => import("./pages/ArtistsArchivePage"));
const Auth = lazy(() => import("./pages/Auth"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const UnifiedMessagesPage = lazy(() => import("./pages/UnifiedMessagesPage"));
const MembersPage = lazy(() => import("./pages/MembersPage"));
const ForumCategoryPage = lazy(() => import("./pages/ForumCategoryPage"));
const ForumTopicPage = lazy(() => import("./pages/ForumTopicPage"));
const NewForumTopicPage = lazy(() => import("./pages/NewForumTopicPage"));
const ForumSearchResultsPage = lazy(() => import("./pages/ForumSearchResultsPage"));
const ForumInitiateSearchPage = lazy(() => import("./pages/ForumInitiateSearchPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RequestPasswordResetPage = lazy(() => import("./pages/RequestPasswordResetPage"));
const UpdatePasswordPage = lazy(() => import("./pages/UpdatePasswordPage"));

// Staff pages
const StaffLogin = lazy(() => import("./pages/StaffLogin"));
const StaffRegistration = lazy(() => import("./pages/StaffRegistration"));
const UnifiedStaffDashboard = lazy(() => import("./pages/UnifiedStaffDashboard"));
const StaffNewsPage = lazy(() => import("./pages/StaffNewsPage"));
const NewsEditor = lazy(() => import("./pages/NewsEditor"));
const StaffHomepageManager = lazy(() => import("./pages/StaffHomepageManager"));
const StaffPersonalities = lazy(() => import("./pages/StaffPersonalities"));
const StaffFeaturedArtists = lazy(() => import("./pages/StaffFeaturedArtists"));
const StaffShowsManager = lazy(() => import("./pages/StaffShowsManager"));
const StaffUserManager = lazy(() => import("./pages/StaffUserManager"));
const StaffForumManagementPage = lazy(() => import("./pages/StaffForumManagementPage"));
const StaffModeratorDashboard = lazy(() => import("./pages/StaffModeratorDashboard"));
const StaffActivityLogs = lazy(() => import("./pages/StaffActivityLogs"));
const StaffSponsors = lazy(() => import("./pages/StaffSponsors"));
const StaffSystemSettings = lazy(() => import("./pages/StaffSystemSettings"));
const StaffAboutEditor = lazy(() => import("./pages/StaffAboutEditor"));
const StaffAnalytics = lazy(() => import("./pages/StaffAnalytics"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <div className="min-h-screen bg-background flex flex-col w-full">
                <Routes>
                  {/* Staff Routes */}
                  <Route path="/staff/login" element={
                    <Suspense fallback={<PageLoader />}>
                      <StaffLogin />
                    </Suspense>
                  } />
                  <Route path="/staff/signup" element={
                    <Suspense fallback={<PageLoader />}>
                      <StaffRegistration />
                    </Suspense>
                  } />
                  <Route path="/staff/*" element={
                    <Suspense fallback={<PageLoader />}>
                      <StaffLayout />
                    </Suspense>
                  }>
                    <Route path="panel" element={<UnifiedStaffDashboard />} />
                    <Route path="analytics" element={<StaffAnalytics />} />
                    <Route path="news" element={<StaffNewsPage />} />
                    <Route path="news/editor" element={<NewsEditor />} />
                    <Route path="news/editor/:id" element={<NewsEditor />} />
                    <Route path="home" element={<StaffHomepageManager />} />
                    <Route path="personalities" element={<StaffPersonalities />} />
                    <Route path="featured-artists" element={<StaffFeaturedArtists />} />
                    <Route path="shows" element={<StaffShowsManager />} />
                    <Route path="users" element={<StaffUserManager />} />
                    <Route path="forum" element={<StaffForumManagementPage />} />
                    <Route path="moderation" element={<StaffModeratorDashboard />} />
                    <Route path="activity" element={<StaffActivityLogs />} />
                    <Route path="sponsors" element={<StaffSponsors />} />
                    <Route path="settings" element={<StaffSystemSettings />} />
                    <Route path="about" element={<StaffAboutEditor />} />
                  </Route>
                  
                  {/* Public Routes */}
                  <Route path="/*" element={
                    <>
                      <Navbar />
                      <main className="flex-1">
                        <ErrorBoundary>
                          <Suspense fallback={<PageLoader />}>
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/about" element={<About />} />
                              <Route path="/contact" element={<Contact />} />
                              <Route path="/news" element={<News />} />
                              <Route path="/news/:slug" element={<NewsPost />} />
                              <Route path="/schedule" element={<Schedule />} />
                              <Route path="/personalities" element={<Personalities />} />
                              <Route path="/artists" element={<ArtistsPage />} />
                              <Route path="/artists/:id" element={<ArtistDetail />} />
                              <Route path="/artists-archive" element={<ArtistsArchivePage />} />
                              <Route path="/auth" element={<Auth />} />
                              <Route path="/profile" element={<ProfilePage />} />
                              <Route path="/profile/:userId" element={<PublicProfilePage />} />
                              <Route path="/messages" element={<UnifiedMessagesPage />} />
                              <Route path="/members" element={<MembersPage />} />
                              <Route path="/members/forum/:categorySlug" element={<ForumCategoryPage />} />
                              <Route path="/members/forum/:categorySlug/:topicSlug" element={<ForumTopicPage />} />
                              <Route path="/forum/categories/:categorySlug/new-topic" element={<NewForumTopicPage />} />
                              <Route path="/forum/search" element={<ForumInitiateSearchPage />} />
                              <Route path="/forum/search/results" element={<ForumSearchResultsPage />} />
                              <Route path="/reset-password" element={<RequestPasswordResetPage />} />
                              <Route path="/update-password" element={<UpdatePasswordPage />} />
                              <Route path="*" element={<NotFound />} />
                              <Route path="/error" element={<RouteErrorElement />} />
                            </Routes>
                          </Suspense>
                        </ErrorBoundary>
                      </main>
                      <Footer />
                      <MusicPlayer />
                    </>
                  } />
                </Routes>
              </div>
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
