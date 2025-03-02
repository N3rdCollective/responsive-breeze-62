
import { Badge } from "@/components/ui/badge";

interface PostStatusBadgeProps {
  status: string;
}

const PostStatusBadge = ({ status }: PostStatusBadgeProps) => {
  return (
    <Badge 
      variant={status === "published" ? "default" : "secondary"}
      className={`${
        status === "published" 
          ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/30 dark:text-green-300" 
          : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-800/30 dark:text-amber-300"
      }`}
    >
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  );
};

export default PostStatusBadge;
