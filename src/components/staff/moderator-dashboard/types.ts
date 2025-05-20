
export interface ReportAuthor {
  id: string;
  name: string;
  avatar: string;
  joinDate: string;
  postCount: number;
  previousFlags: number;
}

export interface ReportReporter {
  id: string;
  name: string;
  avatar: string;
}

export interface ReportTopic {
  id: string;
  title: string;
  category: string;
}

export interface ReportResolution {
  action: string;
  moderator: string;
  timestamp: string;
  note: string;
}

export interface Report {
  id: string;
  contentType: 'post' | 'topic';
  contentId: string;
  content: string;
  reportReason: string;
  reporter: ReportReporter;
  author: ReportAuthor;
  timestamp: string;
  topic: ReportTopic;
  status: 'pending' | 'resolved' | 'rejected';
  resolution?: ReportResolution;
}

export interface DashboardStats {
  pendingReports: number;
  resolvedToday: number;
  newMembers: number;
  activeTopics: number;
  topCategories: Array<{ name: string; count: number }>;
  flaggedUsers: Array<{ name: string; flags: number }>;
}

