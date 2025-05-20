
import { useState } from "react";
import { useToast } from '@/hooks/use-toast';
import { useForumPostEditor } from "../actions/useForumPostEditor";
import { ForumTopic, ForumPost } from "@/types/forum";

interface UseForumPostManagementProps {
  topic: ForumTopic | null;
  posts: ForumPost[];
  setPosts: React.Dispatch<React.SetStateAction<ForumPost[]>>;
  currentPage: number;
  fetchTopicData: (pageToFetch?: number) => Promise<boolean>;
}

export const useForumPostManagement = ({
  topic,
  posts,
  setPosts,
  currentPage,
  fetchTopicData,
}: UseForumPostManagementProps) => {
  const { toast } = useToast();
  // Correctly destructure from useForumPostEditor
  const { 
    editPost, // Renamed from updatePost for clarity and consistency
    editing: submittingUpdatePost, // Use 'editing' state for update submission status
    deletePost, // Use the new deletePost function
    deleting: submittingDeletePost // Use 'deleting' state for delete submission status
  } = useForumPostEditor();

  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  const handleOpenEditDialog = (postToEdit: ForumPost) => {
    if (topic?.is_locked) {
        toast({ title: "Topic Locked", description: "Cannot edit posts in a locked topic.", variant: "destructive" });
        return;
    }
    setEditingPost(postToEdit);
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setEditingPost(null);
  };

  const handleSaveEditedPost = async (newContent: string) => {
    if (!editingPost || !editingPost.id) return;
    if (topic?.is_locked) {
        toast({ title: "Topic Locked", description: "Cannot save edits in a locked topic.", variant: "destructive" });
        handleCloseEditDialog();
        return;
    }

    // Call editPost (renamed from updatePost)
    const updatedPostData = await editPost(editingPost.id, newContent);

    if (updatedPostData) {
      // Optimistically update the post in the local state
      setPosts(prevPosts => prevPosts.map(p => p.id === updatedPostData.id ? { ...p, ...updatedPostData, forum_post_reactions: p.forum_post_reactions || updatedPostData.forum_post_reactions } : p));
      handleCloseEditDialog();
    }
  };
  
  const handleOpenDeleteDialog = (postIdToDelete: string) => {
    if (topic?.is_locked) {
        toast({ title: "Topic Locked", description: "Cannot delete posts in a locked topic.", variant: "destructive" });
        return;
    }
    setDeletingPostId(postIdToDelete);
    setShowDeleteConfirmDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteConfirmDialog(false);
    setDeletingPostId(null);
  };

  const handleConfirmDeletePost = async () => {
    if (!deletingPostId) return;
    if (topic?.is_locked) {
        toast({ title: "Topic Locked", description: "Cannot delete posts in a locked topic.", variant: "destructive" });
        handleCloseDeleteDialog();
        return;
    }

    const postToDelete = posts.find(p => p.id === deletingPostId);
    // Ensure posts is not empty and postToDelete is found before accessing its index
    const isFirstPost = postToDelete ? posts.indexOf(postToDelete) === 0 && currentPage === 1 : false;
    
    // Fetch total post count for the topic to make a more accurate decision for deleting the first post
    let totalPostsInTopic = posts.length; // Default to current page length
    if (topic && topic.id) {
        const { count, error } = await supabase
            .from('forum_posts')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);
        if (!error && count !== null) {
            totalPostsInTopic = count;
        }
    }


    if (isFirstPost && totalPostsInTopic > 1) {
         toast({ title: "Action Denied", description: "The first post of a topic cannot be deleted if other replies exist. Consider editing it or contacting a moderator to delete the entire topic.", variant: "destructive" });
         handleCloseDeleteDialog();
         return;
    }
    // If it's the first post and the only post, deleting it effectively deletes the topic.
    // We might want to handle topic deletion separately or navigate away.
    // For now, allow deletion if it's the only post.

    const success = await deletePost(deletingPostId); // Use the deletePost from useForumPostEditor

    if (success) {
      if (isFirstPost && totalPostsInTopic === 1 && topic?.category?.slug) {
        // If the only post in the topic was deleted, the topic is effectively gone.
        // Navigate back to the category page.
        // This requires access to navigate, or this logic should be higher up.
        // For now, we'll just refetch, which might show an empty topic or error.
        // A better UX would be to navigate: navigate(`/members/forum/${topic.category.slug}`);
        toast({ title: "Topic Deleted", description: "The topic has been deleted as its only post was removed.", variant: "default" });
        // Potentially navigate away here. For now, refetch.
        // We'll assume fetchTopicData will handle the case of a non-existent topic.
         await fetchTopicData(1); // Go to first page, or handle navigation
      } else {
        // After successful delete, refetch data for the current page
        await fetchTopicData(currentPage); 
      }
      handleCloseDeleteDialog();
    }
  };

  return {
    editingPost,
    showEditDialog,
    deletingPostId,
    showDeleteConfirmDialog,
    handleOpenEditDialog,
    handleCloseEditDialog,
    handleSaveEditedPost,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDeletePost,
    submittingUpdatePost, // This now correctly refers to the 'editing' state from useForumPostEditor
    submittingDeletePost, // This now correctly refers to the 'deleting' state from useForumPostEditor
  };
};

