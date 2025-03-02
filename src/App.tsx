import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import StaffPanel from "./pages/StaffPanel";
import StaffLogin from "./pages/StaffLogin";
import NewsBlogs from "./pages/NewsBlogs";
import StaffPersonalities from "./pages/StaffPersonalities";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/staff-panel" element={<StaffPanel />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/news-blogs" element={<NewsBlogs />} />
        <Route path="/staff-personalities" element={<StaffPersonalities />} />
      </Routes>
    </Router>
  );
}

export default App;
