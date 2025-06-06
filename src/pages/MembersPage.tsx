
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ForumCategories from "@/components/forum/ForumCategories";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const MembersPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Rappin' Lounge Forum
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Connect with other members of the community</p>
          </div>
          
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-1 mb-6 bg-gray-100/70 dark:bg-gray-800/50 border border-primary/20">
              <TabsTrigger 
                value="categories"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Forum Categories
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories" className="animate-fadeIn">
              <ForumCategories />
            </TabsContent>
            
          </Tabs>

          {/* Link to the dedicated search page - MOVED TO BOTTOM */}
          <div className="mt-8 flex justify-center"> {/* Added mt-8 for spacing */}
            <Button asChild variant="default" size="lg">
              <Link to="/forum/initiate-search">
                <Search className="mr-2 h-5 w-5" />
                Search Forum Topics
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersPage;
