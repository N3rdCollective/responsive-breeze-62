
import { Personality } from "./types/personalitiesTypes";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import EmptyPersonalitiesState from "./table/EmptyPersonalitiesState";
import PersonalityRow from "./table/PersonalityRow";

interface PersonalitiesListTableProps {
  personalities: Personality[] | undefined;
  filteredPersonalities: Personality[] | undefined;
  paginatedPersonalities: Personality[] | undefined;
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  };
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refetch: () => void;
  handlePageChange: (page: number) => void;
}

const PersonalitiesListTable = ({
  filteredPersonalities,
  paginatedPersonalities,
  pagination,
  isLoading,
  searchTerm,
  setSearchTerm,
  refetch,
  handlePageChange
}: PersonalitiesListTableProps) => {
  const { currentPage, totalPages } = pagination;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Generate pagination numbers
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          isActive={currentPage === 1}
          onClick={() => handlePageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed after first page
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Calculate range of visible page numbers
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust range if at the beginning or end
    if (currentPage <= 3) {
      endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - (maxVisiblePages - 2));
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) { // Skip first and last page as they're handled separately
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    // Show ellipsis if needed before last page
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-medium">Name</TableHead>
              <TableHead className="font-medium">Role</TableHead>
              <TableHead className="font-medium">Start Date</TableHead>
              <TableHead className="font-medium w-[180px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPersonalities && filteredPersonalities.length > 0 ? (
              paginatedPersonalities && paginatedPersonalities.map((personality) => (
                <PersonalityRow key={personality.id} personality={personality} refetch={refetch} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-60 text-center">
                  <EmptyPersonalitiesState searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredPersonalities && filteredPersonalities.length > 0 && totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {renderPaginationItems()}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default PersonalitiesListTable;
