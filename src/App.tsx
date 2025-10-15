
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MusicPlayer from "./components/MusicPlayer";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { QueryProvider } from "./components/providers/QueryProvider";
import { AnalyticsProvider } from "./components/providers/AnalyticsProvider";
import { AuthProvider } from "./hooks/useAuth";
import { Toaster } from "./components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteErrorElement from "./components/RouteErrorElement";
import StaffLayout from "./components/layouts/StaffLayout";
import RedirectNewTopic from "./components/utility/RedirectNewTopic";
import Index from "./pages/Index";
import About from "./pages/About";
import News from "./pages/News";
import Schedule from "./pages/Schedule";
import Personalities from "./pages/Personalities";
import ArtistsPage from "./pages/ArtistsPage";
import MembersPage from "./pages/MembersPage";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ProfilePage from "./pages/ProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import UnifiedMessagesPage from "./pages/UnifiedMessagesPage";
import ChatPage from "./pages/ChatPage";
import StaffPanel from "./pages/StaffPanel";
import StaffAnalytics from "./pages/StaffAnalytics";
import StaffNewsPage from "./pages/StaffNewsPage";
import StaffUserManager from "./pages/StaffUserManager";
import StaffSystemSettings from "./pages/StaffSystemSettings";
import StaffForumManagementPage from "./pages/StaffForumManagementPage";
import StaffModerationPage from "./pages/StaffModerationPage";
import StaffActivityLogs from "./pages/StaffActivityLogs";
import StaffSponsors from "./pages/StaffSponsors";
import StaffJobsPage from "./pages/StaffJobsPage";
import StaffPersonalities from "./pages/StaffPersonalities";
import StaffHomePage from "./pages/StaffHomePage";
import StaffShowsManager from "./pages/StaffShowsManager";
import StaffUserEditor from "./pages/StaffUserEditor";
import { SubmissionForm } from "./components/staff/shows/submissions/SubmissionForm";
import { MySubmissions } from "./components/staff/shows/submissions/MySubmissions";
import { SubmissionReviewQueue } from "./components/staff/shows/review/SubmissionReviewQueue";
import ForumCategoryPage from "./pages/ForumCategoryPage";
import ForumTopicPage from "./pages/ForumTopicPage";
import NewForumTopicPage from "./pages/NewForumTopicPage";
import ForumInitiateSearchPage from "./pages/ForumInitiateSearchPage";
import ForumSearchResultsPage from "./pages/ForumSearchResultsPage";
import ArtistsArchivePage from "./pages/ArtistsArchivePage";
import ArtistDetail from "./pages/ArtistDetail";
import NewsPost from "./pages/NewsPost";
import NewsEditor from "./pages/NewsEditor";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Careers from "./pages/Careers";
import JobPostingDetail from "./pages/JobPostingDetail";
import RequestPasswordResetPage from "./pages/RequestPasswordResetPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";

function App() {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="App min-h-screen bg-background text-foreground">
          <Router>
            <AuthProvider>
              <AnalyticsProvider>
                <ErrorBoundary>
                  <Routes>
                    {/* Staff routes with layout */}
                    <Route path="/staff/*" element={<StaffLayout />}>
                      <Route path="panel" element={<StaffPanel />} />
                      <Route path="analytics" element={<StaffAnalytics />} />
                      <Route path="news" element={<StaffNewsPage />} />
                      <Route path="news/editor/:id?" element={<NewsEditor />} />
                      <Route path="videos" element={<Navigate to="/staff/homepage" replace />} />
                      <Route path="users" element={<StaffUserManager />} />
                      <Route path="users/edit/:userId" element={<StaffUserEditor />} />
                      <Route path="sponsors" element={<StaffSponsors />} />
                      <Route path="personalities" element={<StaffPersonalities />} />
                      <Route path="homepage" element={<StaffHomePage />} />
                      <Route path="settings" element={<StaffSystemSettings />} />
                      <Route path="forum" element={<StaffForumManagementPage />} />
                      <Route path="moderation" element={<StaffModerationPage />} />
                      <Route path="activity" element={<StaffActivityLogs />} />
                      <Route path="jobs" element={<StaffJobsPage />} />
                      <Route path="shows" element={<StaffShowsManager />} />
                      <Route path="shows/submit" element={<SubmissionForm />} />
                      <Route path="shows/submissions" element={<MySubmissions />} />
                      <Route path="shows/review" element={<SubmissionReviewQueue />} />
                    </Route>

                    {/* Regular routes with navbar and footer */}
                    <Route path="/*" element={
                      <>
                        <Navbar />
                        <main className="min-h-screen">
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/news" element={<News />} />
                            <Route path="/news/:id" element={<NewsPost />} />
                            <Route path="/schedule" element={<Schedule />} />
                            <Route path="/personalities" element={<Personalities />} />
                            <Route path="/artists" element={<ArtistsPage />} />
                            <Route path="/artists/archive" element={<ArtistsArchivePage />} />
                            <Route path="/artists/:id" element={<ArtistDetail />} />
                            <Route path="/members" element={<MembersPage />} />
                            <Route path="/members/forum" element={<MembersPage />} />
                            <Route path="/members/forum/:categorySlug" element={<ForumCategoryPage />} />
                            <Route path="/members/forum/:categorySlug/:topicSlug" element={<ForumTopicPage />} />
                            <Route path="/members/forum/:categorySlug/new-topic" element={<NewForumTopicPage />} />
                            <Route path="/members/forum/:categorySlug/new" element={<RedirectNewTopic />} />
                            <Route path="/forum/:categorySlug" element={<ForumCategoryPage />} />
                            <Route path="/forum/:categorySlug/:topicSlug" element={<ForumTopicPage />} />
                            <Route path="/forum/:categorySlug/new-topic" element={<NewForumTopicPage />} />
                            <Route path="/forum/:categorySlug/new" element={<RedirectNewTopic />} />
                            <Route path="/forum/initiate-search" element={<ForumInitiateSearchPage />} />
                            <Route path="/forum/search" element={<ForumSearchResultsPage />} />
                            <Route path="/chat" element={<ChatPage />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/careers" element={<Careers />} />
                            <Route path="/careers/:id" element={<JobPostingDetail />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
                            <Route path="/update-password" element={<UpdatePasswordPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/profile/:userId" element={<PublicProfilePage />} />
                            <Route path="/messages" element={<UnifiedMessagesPage />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/terms-of-service" element={<TermsOfService />} />
                            <Route path="*" element={<RouteErrorElement />} />
                          </Routes>
                        </main>
                        <Footer />
                      </>
                    } />
                  </Routes>
                  <MusicPlayer />
                  <Toaster />
                </ErrorBoundary>
              </AnalyticsProvider>
            </AuthProvider>
          </Router>
        </div>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
