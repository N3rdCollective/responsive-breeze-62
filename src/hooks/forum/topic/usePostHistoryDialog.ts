
import { useState } from 'react';

export interface PostHistoryDialogState {
  showPostHistoryDialog: boolean;
  postHistoryPostId: string | null;
  postHistoryTitle?: string;
}

export interface PostHistoryDialogActions {
  handleOpenPostHistoryDialog: (postId: string, postTitle?: string) => void;
  handleClosePostHistoryDialog: () => void;
}

export const usePostHistoryDialog = (): PostHistoryDialogState & PostHistoryDialogActions => {
  const [showPostHistoryDialog, setShowPostHistoryDialog] = useState(false);
  const [postHistoryPostId, setPostHistoryPostId] = useState<string | null>(null);
  const [postHistoryTitle, setPostHistoryTitle] = useState<string | undefined>(undefined);

  const handleOpenPostHistoryDialog = (postId: string, postTitle?: string) => {
    setPostHistoryPostId(postId);
    setPostHistoryTitle(postTitle);
    setShowPostHistoryDialog(true);
  };

  const handleClosePostHistoryDialog = () => {
    setShowPostHistoryDialog(false);
    setPostHistoryPostId(null);
    setPostHistoryTitle(undefined);
  };

  return {
    showPostHistoryDialog,
    postHistoryPostId,
    postHistoryTitle,
    handleOpenPostHistoryDialog,
    handleClosePostHistoryDialog,
  };
};
