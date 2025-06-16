
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
  reportReason: string;
  status: 'pending' | 'resolved' | 'rejected';
  timestamp: string;
  author: {
    name: string;
    avatar: string;
  };
  reporter: {
    name: string;
    avatar: string;
  };
  topic: {
    title: string;
  };
}
