
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import Index from './pages/Index.tsx'
import About from './pages/About.tsx'
import Personalities from './pages/Personalities.tsx'
import Contact from './pages/Contact.tsx'
import Schedule from './pages/Schedule.tsx'
import News from './pages/News.tsx'
import NewsPost from './pages/NewsPost.tsx'
import NewsEditor from './pages/NewsEditor.tsx'
import NotFound from './pages/NotFound.tsx'
import StaffLogin from './pages/StaffLogin.tsx'
import StaffNews from './pages/StaffNews.tsx'
import StaffPanel from './pages/StaffPanel.tsx'
import StaffPersonalities from './pages/StaffPersonalities.tsx'
import StaffPersonalityEdit from './pages/StaffPersonalityEdit.tsx'
import StaffRegistration from './pages/StaffRegistration.tsx'
import StaffSignup from './pages/StaffSignup.tsx'
import Careers from './pages/Careers.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/personalities" element={<Personalities />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsPost />} />
          <Route path="/news/edit/:id?" element={<NewsEditor />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/staff-registration" element={<StaffRegistration />} />
          <Route path="/staff-signup/:token" element={<StaffSignup />} />
          <Route path="/staff-panel" element={<StaffPanel />} />
          <Route path="/staff/news" element={<StaffNews />} />
          <Route path="/staff/personalities" element={<StaffPersonalities />} />
          <Route path="/staff/personalities/edit/:id?" element={<StaffPersonalityEdit />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
