
import { Post } from "./types/newsTypes";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import EmptyPostsState from "./table/EmptyPostsState";
import PostRow from "./table/PostRow";

interface NewsListTableProps {
  posts: Post[] | undefined;
  filteredPosts: Post[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refetch: () => void;
}

const NewsListTable = ({
  filteredPosts,
  isLoading,
  searchTerm,
  setSearchTerm,
  refetch
}: NewsListTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-medium">Title</TableHead>
            <TableHead className="font-medium">Category</TableHead>
            <TableHead className="font-medium">Date</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium w-[180px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPosts && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostRow key={post.id} post={post} refetch={refetch} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-60 text-center">
                <EmptyPostsState searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default NewsListTable;
