
import { Post } from "./types/newsTypes";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import NewsTableContent from "./table/NewsTableContent";
import NewsPagination from "./table/NewsPagination";

interface NewsListTableProps {
  posts: Post[] | undefined;
  filteredPosts: Post[] | undefined;
  paginatedPosts: Post[] | undefined;
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

const NewsListTable = ({
  filteredPosts,
  paginatedPosts,
  pagination,
  isLoading,
  searchTerm,
  setSearchTerm,
  refetch,
  handlePageChange
}: NewsListTableProps) => {
  const { currentPage, totalPages } = pagination;

  console.log("NewsListTable render with refetch function:", !!refetch);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <NewsTableContent 
        filteredPosts={filteredPosts}
        paginatedPosts={paginatedPosts}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        refetch={refetch}
      />
      
      {filteredPosts && filteredPosts.length > 0 && totalPages > 1 && (
        <NewsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default NewsListTable;
