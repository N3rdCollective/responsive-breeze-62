
import { useStaffAuth } from "@/hooks/useStaffAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import PersonalitiesHeader from "@/components/staff/personalities/PersonalitiesHeader";
import PersonalitiesTableHeader from "@/components/staff/personalities/PersonalitiesTableHeader";
import PersonalitiesListTable from "@/components/staff/personalities/PersonalitiesListTable";
import AccessDenied from "@/components/staff/news/AccessDenied";
import { usePersonalitiesManagement } from "@/components/staff/personalities/usePersonalitiesManagement";

const StaffPersonalities = () => {
  const { userRole, isLoading: authLoading } = useStaffAuth();
  const isAdmin = userRole === "admin";
  const isModerator = userRole === "moderator";
  const isSuperAdmin = userRole === "super_admin";
  
  const {
    personalities,
    filteredPersonalities,
    paginatedPersonalities,
    pagination,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    handlePageChange
  } = usePersonalitiesManagement();

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
        <PersonalitiesHeader />
        
        <Card className="bg-card shadow-sm border-border/40">
          <CardHeader className="pb-2">
            <PersonalitiesTableHeader 
              personalitiesCount={filteredPersonalities?.length} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
            />
          </CardHeader>
          
          <CardContent className="p-0">
            <PersonalitiesListTable 
              personalities={personalities}
              filteredPersonalities={filteredPersonalities}
              paginatedPersonalities={paginatedPersonalities}
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

export default StaffPersonalities;
