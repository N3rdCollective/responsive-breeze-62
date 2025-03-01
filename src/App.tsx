import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/hooks/use-toast';
import StaffPanel from '@/pages/StaffPanel';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import { usePageTracking } from './hooks/useAnalytics';
import './App.css';

function App() {
  usePageTracking();
  
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/staff-login" element={<Login />} />
          <Route path="/staff-panel" element={<StaffPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
