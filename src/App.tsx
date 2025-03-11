
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Index from "@/pages/Index";
import Schedule from "@/pages/Schedule";
import StaffDashboard from "@/pages/StaffDashboard";
import StaffHomePage from "@/pages/StaffHomePage";
import StaffNewsPage from "@/pages/StaffNewsPage";
import StaffLoginPage from "@/pages/StaffLoginPage";
import StaffPersonalitiesPage from "@/pages/StaffPersonalitiesPage";
import AboutEditor from "@/pages/AboutEditor";
import StaffFeaturedArtistsPage from "@/pages/StaffFeaturedArtists";
import ArtistDetail from "@/pages/ArtistDetail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/schedule",
    element: <Schedule />,
  },
  {
    path: "/staff",
    element: <StaffDashboard />,
  },
  {
    path: "/staff/home-editor",
    element: <StaffHomePage />,
  },
  {
    path: "/staff/news",
    element: <StaffNewsPage />,
  },
  {
    path: "/staff/login",
    element: <StaffLoginPage />,
  },
  {
    path: "/staff/personalities",
    element: <StaffPersonalitiesPage />,
  },
  {
    path: "/staff/about-editor",
    element: <AboutEditor />,
  },
  {
    path: "/staff/featured-artists",
    element: <StaffFeaturedArtistsPage />,
  },
  {
    path: "/artists/:id",
    element: <ArtistDetail />,
  },
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
