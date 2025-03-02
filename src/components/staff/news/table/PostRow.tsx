
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import CategoryDisplay from "./CategoryDisplay";
import PostStatusBadge from "./PostStatusBadge";
import NewsTableActions from "./NewsTableActions";

interface Post {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  post_date: string;
  category: string | null;
  author: string | null;
  status: string;
  created_at: string;
}

interface PostRowProps {
  post: Post;
  refetch: () => void;
}

const PostRow = ({ post, refetch }: PostRowProps) => {
  return (
    <TableRow key={post.id} className="hover:bg-muted/30">
      <TableCell className="font-medium">
        <div className="flex flex-col">
          {post.title}
          <span className="text-xs text-muted-foreground">
            By {post.author || "Unknown"}
          </span>
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
          postId={post.id} 
          status={post.status} 
          refetch={refetch} 
        />
      </TableCell>
    </TableRow>
  );
};

export default PostRow;
