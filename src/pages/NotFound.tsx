
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
    
    // Handle edit route pattern to redirect to editor
    if (location.pathname.startsWith("/staff/news/edit/")) {
      const postId = location.pathname.split("/").pop();
      console.log(`Redirecting from /staff/news/edit/${postId} to /staff/news/editor/${postId}`);
      navigate(`/staff/news/editor/${postId}`);
      return;
    }
    
    // Handle specific route cases for news creation/editing
    if (location.pathname === "/staff/news/edit") {
      console.log("Redirecting from /staff/news/edit to /staff/news/editor");
      navigate("/staff/news/editor"); // Corrected to /staff/news/editor
      return;
    }
    
    if (location.pathname === "/staff/news/new") {
      console.log("Redirecting from /staff/news/new to /staff/news/editor");
      navigate("/staff/news/editor"); // Corrected to /staff/news/editor
      return;
    }
    
    // Handle legacy routes for sponsors or system settings if needed
    if (location.pathname === "/staff/sponsor") {
      console.log("Redirecting from /staff/sponsor to /staff/sponsors");
      navigate("/staff/sponsors"); // Ensure /staff/sponsors exists or remove
      return;
    }

    if (location.pathname === "/staff/settings") {
      console.log("Redirecting from /staff/settings to /staff/system-settings");
      navigate("/staff/system-settings"); // Ensure /staff/system-settings exists or remove
      return;
    }
    
    // Handle old personalities route
    if (location.pathname === "/staff/personality") {
      console.log("Redirecting from /staff/personality to /staff/personalities");
      navigate("/staff/personalities"); // Ensure /staff/personalities exists or remove
      return;
    }
    
    // Handle old homepage content route
    if (location.pathname === "/staff/homepage") {
      console.log("Redirecting from /staff/homepage to /staff/home");
      navigate("/staff/home"); // Ensure /staff/home exists or remove
      return;
    }
    
    // Handle old activity logs route
    if (location.pathname === "/staff/activity") {
      console.log("Redirecting from /staff/activity to /staff/activity-logs");
      navigate("/staff/activity-logs"); // Ensure /staff/activity-logs exists or remove
      return;
    }
  }, [location.pathname, navigate]);

  return (
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
  );
};

export default NotFound;
