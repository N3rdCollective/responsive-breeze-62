
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { QueryProvider } from "./components/providers/QueryProvider";
import { AnalyticsProvider } from "./components/providers/AnalyticsProvider";
import { AuthProvider } from "./hooks/useAuth";
import { Toaster } from "./components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteErrorElement from "./components/RouteErrorElement";
import News from "./pages/News";

function App() {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="App min-h-screen bg-background text-foreground">
          <Router>
            <AuthProvider>
              <AnalyticsProvider>
                <ErrorBoundary>
                  <Navbar />
                  <main className="min-h-screen">
                    <Routes>
                      <Route path="/" element={<div>Home Page</div>} />
                      <Route path="/about" element={<div>About Page</div>} />
                      <Route path="/news" element={<News />} />
                      <Route path="*" element={<RouteErrorElement />} />
                    </Routes>
                  </main>
                  <Footer />
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
