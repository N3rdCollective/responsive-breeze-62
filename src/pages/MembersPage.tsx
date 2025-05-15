
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ForumCategories from "@/components/forum/ForumCategories";
import ForumLatestPosts from "@/components/forum/ForumLatestPosts";

const MembersPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      console.log("User not authenticated, redirecting to auth page");
      navigate("/auth");
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Make sure we're logged in before showing the page
  if (!user) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rappin' Lounge Forum</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Connect with other members of the community</p>
          </div>
          
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="categories">Forum Categories</TabsTrigger>
              <TabsTrigger value="latest">Latest Posts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories">
              <ForumCategories />
            </TabsContent>
            
            <TabsContent value="latest">
              <ForumLatestPosts />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MembersPage;
