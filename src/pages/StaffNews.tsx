
import { useStaffAuth } from "@/hooks/useStaffAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import NewsHeader from "@/components/staff/news/NewsHeader";
import NewsTableHeader from "@/components/staff/news/NewsTableHeader";
import NewsListTable from "@/components/staff/news/NewsListTable";
import AccessDenied from "@/components/staff/news/AccessDenied";
import { useNewsManagement } from "@/components/staff/news/useNewsManagement";

const StaffNews = () => {
  const { userRole, isLoading: authLoading } = useStaffAuth();
  const isAdmin = userRole === "admin";
  const isModerator = userRole === "moderator";
  const isSuperAdmin = userRole === "super_admin";
  
  const {
    posts,
    filteredPosts,
    paginatedPosts,
    pagination,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    handlePageChange
  } = useNewsManagement();

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin && !isModerator && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <AccessDenied />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 container mx-auto px-4 max-w-7xl">
        <NewsHeader />
        
        <Card className="bg-card shadow-sm border-border/40">
          <CardHeader className="pb-2">
            <NewsTableHeader 
              postsCount={filteredPosts?.length} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
          </CardHeader>
          
          <CardContent className="p-0">
            <NewsListTable 
              posts={posts}
              filteredPosts={filteredPosts}
              paginatedPosts={paginatedPosts}
              pagination={pagination}
              isLoading={isLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              refetch={refetch}
              handlePageChange={handlePageChange}
            />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default StaffNews;
