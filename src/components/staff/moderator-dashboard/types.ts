
export interface DashboardStats {
  pendingReports: number;
  resolvedToday: number;
  newMembers: number;
  activeTopics: number;
  topCategories: Array<{
    name: string;
    count: number;
  }>;
  flaggedUsers: Array<{
    name: string;
    flags: number;
  }>;
}

export interface Report {
  id: string;
  contentType: 'post' | 'topic' | 'user';
  contentId: string;
  content: string;
  reportReason: string;
  status: 'pending' | 'resolved' | 'rejected';
  timestamp: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    joinDate: string;
    postCount: number;
    previousFlags: number;
  };
  reporter: {
    id: string;
    name: string;
    avatar: string;
  };
  topic: {
    id: string;
    title: string;
    category: string;
  };
  reportedUserId?: string;
  topicId?: string;
  resolution?: {
    action: string;
    moderator: string;
    timestamp: string;
    note: string;
  };
}
