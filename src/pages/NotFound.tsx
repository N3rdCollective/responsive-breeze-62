
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Handle specific route cases
    if (location.pathname === "/staff/news/edit") {
      // Redirect to the news editor
      console.log("Redirecting from /staff/news/edit to /staff/news/create");
      navigate("/staff/news/create");
      return;
    }
    
    // Handle the /staff/news/new route
    if (location.pathname === "/staff/news/new") {
      console.log("Redirecting from /staff/news/new to /staff/news/create");
      navigate("/staff/news/create");
      return;
    }
    
    // Redirect /staff/panel to /staff
    if (location.pathname === "/staff/panel") {
      console.log("Redirecting from /staff/panel to /staff");
      navigate("/staff");
      return;
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-20">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">404</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">Page not found</p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
