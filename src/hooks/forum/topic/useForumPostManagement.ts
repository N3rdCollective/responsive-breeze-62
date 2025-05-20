
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
  const { updatePost, submittingUpdate: submittingUpdatePost, deletePost, submittingDelete: submittingDeletePost } = useForumPostEditor();

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

    const updatedPostData = await updatePost(editingPost.id, newContent);

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
    const isFirstPost = postToDelete ? posts.indexOf(postToDelete) === 0 && currentPage === 1 : false;

    if (isFirstPost && posts.length > 1) { // Check against total posts in topic, not just current page. This logic might need refinement if posts.length is only for current page.
         toast({ title: "Action Denied", description: "The first post of a topic cannot be deleted if other replies exist. Consider editing it or contacting a moderator to delete the entire topic.", variant: "destructive" });
         handleCloseDeleteDialog();
         return;
    }

    const success = await deletePost(deletingPostId);

    if (success) {
      // After successful delete, refetch data for the current page
      await fetchTopicData(currentPage); 
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
    submittingUpdatePost,
    submittingDeletePost,
  };
};
