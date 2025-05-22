
import { useState } from "react";
import { supabase } from '@/integrations/supabase/client'; // Added import
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
    editPost, 
    editing: submittingUpdatePost, 
    deletePost, 
    deleting: submittingDeletePost 
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

    const updatedPostData = await editPost(editingPost.id, newContent);

    if (updatedPostData) {
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
    
    let totalPostsInTopic = posts.length; 
    if (topic && topic.id) {
        // Ensure supabase is imported and used correctly here
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

    const success = await deletePost(deletingPostId); 

    if (success) {
      if (isFirstPost && totalPostsInTopic === 1 && topic?.category?.slug) {
        toast({ title: "Topic Deleted", description: "The topic has been deleted as its only post was removed.", variant: "default" });
         await fetchTopicData(1); 
      } else {
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
    submittingUpdatePost, 
    submittingDeletePost, 
  };
};
