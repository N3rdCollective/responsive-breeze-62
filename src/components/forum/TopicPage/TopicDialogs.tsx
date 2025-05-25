
import React from 'react';
import EditPostDialog from './EditPostDialog';
import DeletePostConfirmDialog from './DeletePostConfirmDialog';
import PostEditHistoryDialog from './PostEditHistoryDialog'; // Import new dialog
import { ForumPost } from '@/types/forum';

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

  // Props for PostEditHistoryDialog
  showPostHistoryDialog: boolean;
  postHistoryPostId: string | null;
  postHistoryTitle?: string;
  handleClosePostHistoryDialog: () => void;
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
  // Destructure new props
  showPostHistoryDialog,
  postHistoryPostId,
  postHistoryTitle,
  handleClosePostHistoryDialog,
}) => {
  return (
    <>
      {editingPost && (
        <EditPostDialog
          open={showEditDialog}
          onOpenChange={(open) => !open && handleCloseEditDialog()}
          postContent={editingPost.content}
          onSave={handleSaveEditedPost}
          isSaving={isProcessingPostAction}
          topicIsLocked={topicIsLocked}
        />
      )}
      <DeletePostConfirmDialog
        open={showDeleteConfirmDialog}
        onOpenChange={(open) => !open && handleCloseDeleteDialog()}
        onConfirm={handleConfirmDeletePost}
        isDeleting={isProcessingPostAction}
        topicIsLocked={topicIsLocked}
      />
      <PostEditHistoryDialog
        open={showPostHistoryDialog}
        onOpenChange={(open) => !open && handleClosePostHistoryDialog()}
        postId={postHistoryPostId}
        postTitle={postHistoryTitle}
      />
    </>
  );
};

export default TopicDialogs;
