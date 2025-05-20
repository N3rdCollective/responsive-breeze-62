
import { Report, DashboardStats } from '@/components/staff/moderator-dashboard/types';

export const reportedContent: Report[] = [
  {
    id: 'report-1',
    contentType: 'post',
    contentId: 'post-123',
    content: 'This is absolutely ridiculous! Your product is garbage and your support team is incompetent. Don\'t waste your money on this trash.',
    reportReason: 'Inappropriate language/Hostile',
    reporter: {
      id: 'user-456',
      name: 'Michael Johnson',
      avatar: 'https://avatar.iran.liara.run/public/boy?username=MichaelJ'
    },
    author: {
      id: 'user-789',
      name: 'Robert Davis',
      avatar: 'https://avatar.iran.liara.run/public/boy?username=RobertD',
      joinDate: '2024-12-10T08:00:00Z',
      postCount: 27,
      previousFlags: 2
    },
    timestamp: '2025-05-19T14:23:00Z',
    topic: {
      id: 'topic-456',
      title: 'Product Review Discussion',
      category: 'Reviews'
    },
    status: 'pending'
  },
  {
    id: 'report-2',
    contentType: 'post',
    contentId: 'post-456',
    content: 'Check out my website for amazing deals on these products: www.suspicious-looking-link.com',
    reportReason: 'Spam/Advertising',
    reporter: {
      id: 'user-101',
      name: 'Sarah Wilson',
      avatar: 'https://avatar.iran.liara.run/public/girl?username=SarahW'
    },
    author: {
      id: 'user-102',
      name: 'New User',
      avatar: 'https://avatar.iran.liara.run/public/boy?username=NewUser',
      joinDate: '2025-05-15T10:30:00Z',
      postCount: 3,
      previousFlags: 0
    },
    timestamp: '2025-05-18T09:45:00Z',
    topic: {
      id: 'topic-789',
      title: 'Product Recommendations',
      category: 'General Discussion'
    },
    status: 'pending'
  },
  {
    id: 'report-3',
    contentType: 'topic',
    contentId: 'topic-101',
    content: 'Off-topic discussion about politics that violates forum rules about keeping discussions related to the forum\'s main purpose.',
    reportReason: 'Off-topic/Not relevant',
    reporter: {
      id: 'user-103',
      name: 'Emily Thompson',
      avatar: 'https://avatar.iran.liara.run/public/girl?username=EmilyT'
    },
    author: {
      id: 'user-104',
      name: 'Regular Member',
      avatar: 'https://avatar.iran.liara.run/public/boy?username=RegularM',
      joinDate: '2024-06-22T14:20:00Z',
      postCount: 156,
      previousFlags: 0
    },
    timestamp: '2025-05-17T16:10:00Z',
    topic: {
      id: 'topic-101',
      title: 'Political Discussion Thread',
      category: 'General Discussion'
    },
    status: 'resolved',
    resolution: {
      action: 'moved',
      moderator: 'Admin User',
      timestamp: '2025-05-17T17:30:00Z',
      note: 'Moved to appropriate category'
    }
  },
  {
    id: 'report-4',
    contentType: 'post',
    contentId: 'post-789',
    content: 'Content that contains questionable external links that might be malicious or unsafe.',
    reportReason: 'Suspicious links',
    reporter: {
      id: 'user-105',
      name: 'David Brown',
      avatar: 'https://avatar.iran.liara.run/public/boy?username=DavidB'
    },
    author: {
      id: 'user-106',
      name: 'John Smith',
      avatar: 'https://avatar.iran.liara.run/public/boy?username=JohnS',
      joinDate: '2024-08-05T11:15:00Z',
      postCount: 42,
      previousFlags: 1
    },
    timestamp: '2025-05-16T08:20:00Z',
    topic: {
      id: 'topic-102',
      title: 'Useful Resources Collection',
      category: 'Resources'
    },
    status: 'rejected',
    resolution: {
      action: 'no_action',
      moderator: 'Admin User',
      timestamp: '2025-05-16T10:45:00Z',
      note: 'Links verified as safe'
    }
  },
  {
    id: 'report-5',
    contentType: 'post',
    contentId: 'post-901',
    content: 'User repeatedly posting the same response across multiple threads to promote their content.',
    reportReason: 'Spam/Repetitive',
    reporter: {
      id: 'user-107',
      name: 'Jennifer Lee',
      avatar: 'https://avatar.iran.liara.run/public/girl?username=JenniferL'
    },
    author: {
      id: 'user-108',
      name: 'Spammer Account',
      avatar: 'https://avatar.iran.liara.run/public/boy?username=SpammerA',
      joinDate: '2025-05-10T09:30:00Z',
      postCount: 15,
      previousFlags: 8
    },
    timestamp: '2025-05-15T14:50:00Z',
    topic: {
      id: 'topic-103',
      title: 'Multiple Threads',
      category: 'Various'
    },
    status: 'resolved',
    resolution: {
      action: 'removed_banned',
      moderator: 'Senior Mod',
      timestamp: '2025-05-15T16:20:00Z',
      note: 'Content removed and user banned for repeated spam'
    }
  },
];

export const dashboardStats: DashboardStats = {
  pendingReports: reportedContent.filter(r => r.status === 'pending').length,
  resolvedToday: 4,
  newMembers: 12,
  activeTopics: 35,
  topCategories: [
    { name: 'Technical Support', count: 45 },
    { name: 'General Discussion', count: 32 },
    { name: 'Product Reviews', count: 28 }
  ],
  flaggedUsers: [
    { name: 'Spammer Account', flags: 8 },
    { name: 'Robert Davis', flags: 2 },
    { name: 'John Smith', flags: 1 }
  ]
};

