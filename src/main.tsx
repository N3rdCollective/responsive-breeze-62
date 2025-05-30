
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers/QueryProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="radio-theme">
      <QueryProvider>
        <ErrorBoundary>
          <App />
          <Toaster />
        </ErrorBoundary>
      </QueryProvider>
    </ThemeProvider>
  </React.StrictMode>
);
