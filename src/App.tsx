
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import StaffPanel from "./pages/StaffPanel";
import StaffLogin from "./pages/StaffLogin";
import StaffPersonalities from "./pages/StaffPersonalities";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/staff-panel" element={<StaffPanel />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/staff-personalities" element={<StaffPersonalities />} />
      </Routes>
    </Router>
  );
}

export default App;
