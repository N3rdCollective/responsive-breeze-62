
import React from 'react';
import EditPostDialog from "@/components/forum/TopicPage/EditPostDialog";
import DeletePostConfirmDialog from "@/components/forum/TopicPage/DeletePostConfirmDialog";
import { ForumPost } from "@/types/forum";

interface TopicDialogsProps {
  editingPost: ForumPost | null;
  showEditDialog: boolean;
  deletingPostId: string | null;
  showDeleteConfirmDialog: boolean;
  isProcessingPostAction: boolean;
  topicIsLocked: boolean;
  handleCloseEditDialog: () => void;
  handleSaveEditedPost: (newContent: string) => Promise<void>;
  handleCloseDeleteDialog: () => void;
  handleConfirmDeletePost: () => Promise<void>;
}

const TopicDialogs: React.FC<TopicDialogsProps> = ({
  editingPost,
  showEditDialog,
  deletingPostId,
  showDeleteConfirmDialog,
  isProcessingPostAction,
  topicIsLocked,
  handleCloseEditDialog,
  handleSaveEditedPost,
  handleCloseDeleteDialog,
  handleConfirmDeletePost,
}) => {
  return (
    <>
      {editingPost && (
        <EditPostDialog
          open={showEditDialog}
          onOpenChange={handleCloseEditDialog}
          postContent={editingPost.content}
          onSave={handleSaveEditedPost}
          isSaving={isProcessingPostAction}
          topicIsLocked={topicIsLocked}
        />
      )}

      {deletingPostId && (
        <DeletePostConfirmDialog
          open={showDeleteConfirmDialog}
          onOpenChange={handleCloseDeleteDialog}
          onConfirm={handleConfirmDeletePost}
          isDeleting={isProcessingPostAction}
          topicIsLocked={topicIsLocked}
        />
      )}
    </>
  );
};

export default TopicDialogs;
