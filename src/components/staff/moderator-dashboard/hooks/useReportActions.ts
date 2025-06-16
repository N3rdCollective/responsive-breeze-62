
import { useState } from 'react';
import { useContentReports } from '@/hooks/moderation/useContentReports';
import { useModerationStats } from '@/hooks/moderation/useModerationStats';

export const useReportActions = () => {
  const [moderationNote, setModerationNote] = useState("");
  const { 
    updateReportStatus, 
    createModerationAction,
    removeContentOnDb,
    lockTopicOnDb,
    fetchReports 
  } = useContentReports();
  const { refreshStats } = useModerationStats();

  const handleReportAction = async (
    action: string, 
    reportId: string,
    details?: { 
      reportedUserId?: string;
      contentId?: string;
      contentType?: 'post' | 'topic';
      topicId?: string;
    }
  ) => {
    try {
      switch (action) {
        case 'dismiss':
        case 'reopen':
          const newStatus = action === 'dismiss' ? 'rejected' : 'pending';
          await updateReportStatus(reportId, newStatus);
          break;
          
        case 'remove_content':
          if (details?.contentId && details?.contentType) {
            await removeContentOnDb(details.contentId, details.contentType);
            await createModerationAction(reportId, 'content_removed', moderationNote);
            await updateReportStatus(reportId, 'resolved');
          }
          break;
          
        case 'lock_topic':
          if (details?.topicId) {
            await lockTopicOnDb(details.topicId);
            await createModerationAction(reportId, 'topic_locked', moderationNote);
            await updateReportStatus(reportId, 'resolved');
          }
          break;
          
        case 'warn_user':
          await createModerationAction(reportId, 'user_warned', moderationNote);
          await updateReportStatus(reportId, 'resolved');
          break;
          
        case 'ban_user':
          if (moderationNote.trim()) {
            await createModerationAction(reportId, 'user_banned', moderationNote);
            await updateReportStatus(reportId, 'resolved');
          }
          break;
          
        default:
          await createModerationAction(reportId, action, moderationNote);
          await updateReportStatus(reportId, 'resolved');
      }
      
      // Clear the moderation note and refresh data
      setModerationNote("");
      await fetchReports();
      await refreshStats();
      
    } catch (error) {
      console.error('Error handling report action:', error);
    }
  };

  return {
    moderationNote,
    setModerationNote,
    handleReportAction
  };
};
