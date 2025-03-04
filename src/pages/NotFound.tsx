
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
      // Redirect to the new post editor
      console.log("Redirecting from /staff/news/edit to /staff/news/new");
      navigate("/staff/news/new");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 dark:text-white">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
