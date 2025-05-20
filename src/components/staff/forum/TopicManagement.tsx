import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useStaffActivityLogger } from "@/hooks/useStaffActivityLogger";
import { ForumTopic, ForumCategory } from "@/types/forum";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Unlock, Trash2, PinOff, Pin } from "lucide-react";

interface TopicManagementProps {
  userRole: string;
}

const TopicManagement: React.FC<TopicManagementProps> = ({ userRole }) => {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  const { toast } = useToast();
  const { logActivity } = useStaffActivityLogger();
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<ForumTopic | null>(null);
  
  const canModifyTopics = userRole === 'admin' || userRole === 'super_admin' || userRole === 'moderator';

  // Fetch categories and topics on load
  useEffect(() => {
    fetchCategories();
    fetchTopics();
  }, []);
  
  // Fetch topics when selected category changes
  useEffect(() => {
    fetchTopics();
  }, [selectedCategory]);
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      setCategories(data);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
    }
  };
  
  const fetchTopics = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("forum_topics")
        .select(`
          *,
          category:forum_categories(name, slug),
          profile:profiles!forum_topics_user_id_fkey(username, display_name, profile_picture:avatar_url),
          _count:forum_posts(count)
        `)
        .order("is_sticky", { ascending: false })
        .order("last_post_at", { ascending: false });
      
      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const typedData = (data || []) as unknown as ForumTopic[];
      setTopics(typedData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to load topics: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleTopicSticky = async (topic: ForumTopic) => {
    if (!canModifyTopics) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to modify topics",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newStatus = !topic.is_sticky;
      
      const { error } = await supabase
        .from("forum_topics")
        .update({ is_sticky: newStatus })
        .eq("id", topic.id);
      
      if (error) throw error;
      
      await logActivity(
        newStatus ? "sticky_forum_topic" : "unsticky_forum_topic",
        `${newStatus ? "Stickied" : "Unstickied"} forum topic: ${topic.title}`,
        "forum_topic",
        topic.id
      );
      
      toast({
        title: "Success",
        description: `Topic ${newStatus ? "pinned" : "unpinned"} successfully`,
      });
      
      await fetchTopics();
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to update topic: ${err.message}`,
        variant: "destructive",
      });
    }
  };
  
  const toggleTopicLocked = async (topic: ForumTopic) => {
    if (!canModifyTopics) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to modify topics",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newStatus = !topic.is_locked;
      
      const { error } = await supabase
        .from("forum_topics")
        .update({ is_locked: newStatus })
        .eq("id", topic.id);
      
      if (error) throw error;
      
      await logActivity(
        newStatus ? "lock_forum_topic" : "unlock_forum_topic",
        `${newStatus ? "Locked" : "Unlocked"} forum topic: ${topic.title}`,
        "forum_topic",
        topic.id
      );
      
      toast({
        title: "Success",
        description: `Topic ${newStatus ? "locked" : "unlocked"} successfully`,
      });
      
      await fetchTopics();
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to update topic: ${err.message}`,
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteTopic = async () => {
    if (!canModifyTopics || !topicToDelete) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete topics",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Delete topic (cascade will delete related posts)
      const { error } = await supabase
        .from("forum_topics")
        .delete()
        .eq("id", topicToDelete.id);
      
      if (error) throw error;
      
      await logActivity(
        "delete_forum_topic",
        `Deleted forum topic: ${topicToDelete.title}`,
        "forum_topic",
        topicToDelete.id
      );
      
      toast({
        title: "Success",
        description: "Topic deleted successfully",
      });
      
      // Close dialog and refresh topics
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
      await fetchTopics();
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to delete topic: ${err.message}`,
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Manage Forum Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Filter by Category</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
              {error}
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No topics found.</p>
              {selectedCategory !== "all" && (
                <p className="text-sm mt-1">Try selecting a different category.</p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Posts</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium">
                      {topic.is_sticky && <span className="text-primary mr-1">📌</span>}
                      {topic.title}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {topic.category?.name || "Unknown"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{topic._count?.posts || 0}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(topic.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {topic.is_locked && (
                          <span className="inline-flex h-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 text-xs text-amber-600 dark:text-amber-400">
                            Locked
                          </span>
                        )}
                        {topic.is_sticky && (
                          <span className="inline-flex h-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 text-xs text-blue-600 dark:text-blue-400">
                            Pinned
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {canModifyTopics && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleTopicSticky(topic)}
                            title={topic.is_sticky ? "Unpin topic" : "Pin topic"}
                          >
                            {topic.is_sticky ? <PinOff size={16} /> : <Pin size={16} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleTopicLocked(topic)}
                            title={topic.is_locked ? "Unlock topic" : "Lock topic"}
                          >
                            {topic.is_locked ? <Unlock size={16} /> : <Lock size={16} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setTopicToDelete(topic);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete topic"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the topic "{topicToDelete?.title}" and all its posts.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTopic}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TopicManagement;
