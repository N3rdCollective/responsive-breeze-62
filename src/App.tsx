
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import StaffPanel from '@/pages/StaffPanel';
import StaffLogin from '@/pages/StaffLogin';
import NotFound from '@/pages/NotFound';
import './App.css';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/staff-panel" element={<StaffPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
