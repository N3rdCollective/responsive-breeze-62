
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import CategoryDisplay from "./CategoryDisplay";
import PostStatusBadge from "./PostStatusBadge";
import NewsTableActions from "./NewsTableActions";
import { Badge } from "@/components/ui/badge";
import { Post } from "../types/newsTypes";

interface PostRowProps {
  post: Post;
  refetch: () => void;
}

const PostRow = ({ post, refetch }: PostRowProps) => {
  console.log("PostRow rendering with post:", post.id, "and refetch function type:", typeof refetch);
  
  const handleRefetch = async () => {
    console.log("PostRow: handleRefetch called for post:", post.id);
    try {
      await refetch();
      console.log("PostRow: refetch completed successfully");
    } catch (error) {
      console.error("PostRow: Error in refetch:", error);
    }
  };
  
  // Determine the author name to display
  const authorName = post.author_name || "Unknown";
  
  return (
    <TableRow key={post.id} className="hover:bg-muted/30">
      <TableCell className="font-medium">
        <div className="flex flex-col">
          {post.title}
          <span className="text-xs text-muted-foreground">
            By {authorName}
          </span>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {post.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <CategoryDisplay category={post.category} />
      </TableCell>
      <TableCell>
        <span className="text-sm">
          {format(new Date(post.post_date || post.created_at), "MMM dd, yyyy")}
        </span>
      </TableCell>
      <TableCell>
        <PostStatusBadge status={post.status} />
      </TableCell>
      <TableCell className="text-right">
        <NewsTableActions 
          post={post} 
          onRefetch={handleRefetch} 
        />
      </TableCell>
    </TableRow>
  );
};

export default PostRow;
