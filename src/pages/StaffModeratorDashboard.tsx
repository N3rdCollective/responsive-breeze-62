import React, { useState } from 'react';
import { Shield, Flag, UserX, MessageSquare, Eye, CheckCircle, XCircle, AlertTriangle, Clock, Filter, Search, RefreshCw, ChevronDown, Settings, Users, BarChart2, Trash2, Edit, Lock, Move } from 'lucide-react';
import TitleUpdater from '@/components/TitleUpdater';

const ModeratorDashboard = () => {
  // States for dashboard functionality
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedFlag, setSelectedFlag] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [moderationNote, setModerationNote] = useState('');
  
  // Mock data for reported content
  const reportedContent = [
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
  
  // Filter reported content based on status
  const filteredReports = reportedContent.filter(report => {
    if (filterStatus === 'all') return true;
    return report.status === filterStatus;
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle resolution actions
  const handleAction = (action: string, reportId: string) => {
    console.log(`Taking action "${action}" on report ${reportId}`);
    console.log(`Moderation note: ${moderationNote}`);
    setSelectedFlag(null);
    setModerationNote('');
  };
  
  // Dashboard overview stats
  const dashboardStats = {
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
  
  const selectedReportData = selectedFlag ? reportedContent.find(r => r.id === selectedFlag) : null;

  return (
    <>
      <TitleUpdater>Moderator Dashboard - Staff Panel</TitleUpdater>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="font-bold text-xl text-blue-600 dark:text-blue-400">Forum<span className="text-gray-800 dark:text-gray-200">Plus</span></div>
                <div className="ml-6 text-sm font-medium text-gray-500 dark:text-gray-400">Moderator Dashboard</div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Logged in as </span>
                  <span className="font-medium">Admin User</span>
                </div>
                <img 
                  src="https://avatar.iran.liara.run/public/boy?username=Admin"
                  alt="Admin User" 
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b dark:border-gray-700">
                <div className="font-medium text-gray-700 dark:text-gray-200">Moderation Tools</div>
              </div>
              
              <nav className="p-2 space-y-1">
                <button 
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${activeSection === 'overview' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveSection('overview')}
                >
                  <BarChart2 size={18} className="mr-2" />
                  Dashboard Overview
                </button>
                
                <button 
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${activeSection === 'reported' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveSection('reported')}
                >
                  <Flag size={18} className="mr-2" />
                  Reported Content
                  {dashboardStats.pendingReports > 0 && (
                    <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium px-2 py-0.5 rounded-full">
                      {dashboardStats.pendingReports}
                    </span>
                  )}
                </button>
                
                <button 
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${activeSection === 'users' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveSection('users')}
                >
                  <Users size={18} className="mr-2" />
                  User Management
                </button>
                
                <button 
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${activeSection === 'content' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveSection('content')}
                >
                  <MessageSquare size={18} className="mr-2" />
                  Content Management
                </button>
                
                <button 
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${activeSection === 'settings' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveSection('settings')}
                >
                  <Settings size={18} className="mr-2" />
                  Moderation Settings
                </button>
              </nav>
              
              <div className="p-4 mt-4 bg-blue-50 dark:bg-blue-900/30 mx-2 rounded-md">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Moderator Activity</div>
                <div className="text-xs text-blue-700 dark:text-blue-400">
                  <div className="flex items-center justify-between mb-1">
                    <span>Reports resolved today:</span>
                    <span className="font-medium">{dashboardStats.resolvedToday}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Your response time:</span>
                    <span className="font-medium">1h 12m</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1">
              {activeSection === 'overview' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { icon: Flag, color: 'red', label: 'Pending Reports', value: dashboardStats.pendingReports },
                      { icon: CheckCircle, color: 'green', label: 'Resolved Today', value: dashboardStats.resolvedToday },
                      { icon: Users, color: 'blue', label: 'New Members', value: dashboardStats.newMembers },
                      { icon: MessageSquare, color: 'purple', label: 'Active Topics', value: dashboardStats.activeTopics },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className={`p-2 bg-${stat.color}-100 dark:bg-${stat.color}-900/50 rounded-md mr-4`}>
                            <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={20} />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg p-4">
                      <h2 className="font-medium mb-4 text-gray-900 dark:text-gray-100">Most Active Categories</h2>
                      <div className="space-y-3">
                        {dashboardStats.topCategories.map((category, index) => (
                          <div key={index} className="flex items-center">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{category.name}</div>
                              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${(category.count / Math.max(...dashboardStats.topCategories.map(c => c.count))) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="ml-4 text-sm font-medium text-gray-900 dark:text-gray-200">{category.count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg p-4">
                      <h2 className="font-medium mb-4 text-gray-900 dark:text-gray-100">Users with Multiple Flags</h2>
                      <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                          <thead className="bg-gray-50 dark:bg-gray-750">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Flags</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                            {dashboardStats.flaggedUsers.map((user, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.flags >= 5 ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'}`}>
                                    {user.flags}
                                  </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">View</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeSection === 'reported' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="p-6 border-b dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Reported Content</h1>
                      <div className="flex flex-wrap gap-2">
                        <div className="relative">
                          <select
                            className="appearance-none bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md px-3 py-1.5 pr-8 text-sm text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <option value="all">All Reports</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                            <ChevronDown size={16} />
                          </div>
                        </div>
                        <div className="relative flex-grow max-w-xs">
                          <input
                            type="text"
                            className="w-full border dark:border-gray-600 rounded-md pl-8 pr-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search reports..."
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 dark:text-gray-400">
                            <Search size={16} />
                          </div>
                        </div>
                        <button className="flex items-center text-gray-700 dark:text-gray-300 border dark:border-gray-600 rounded-md px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                          <RefreshCw size={16} className="mr-1" />
                          Refresh
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-750">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Content</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reported</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredReports.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No reported content found</td>
                          </tr>
                        ) : (
                          filteredReports.map((report) => (
                            <tr 
                              key={report.id} 
                              className={`${selectedFlag === report.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'} cursor-pointer`}
                              onClick={() => setSelectedFlag(selectedFlag === report.id ? null : report.id)}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-start">
                                  <img src={report.author.avatar} alt={report.author.name} className="h-8 w-8 rounded-full mr-3" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {report.contentType === 'topic' ? 'Topic: ' : ''}
                                      {report.topic.title.length > 30 ? report.topic.title.substring(0, 30) + '...' : report.topic.title}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">by {report.author.name} • {report.contentType}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-gray-100">{report.reportReason}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Reported by {report.reporter.name}</div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(report.timestamp)}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  report.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 
                                  report.status === 'resolved' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 
                                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                }`}>
                                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                <button 
                                   onClick={(e) => { e.stopPropagation(); setSelectedFlag(report.id); }}
                                   className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-2"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="px-6 py-3 flex items-center justify-between border-t dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredReports.length}</span> of <span className="font-medium">{filteredReports.length}</span> results
                    </div>
                    <div className="flex-1 flex justify-end space-x-2">
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">Previous</button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
                    </div>
                  </div>
                </div>
              )}
              
              {(activeSection === 'users' || activeSection === 'content' || activeSection === 'settings') && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
                  <p className="text-gray-600 dark:text-gray-400">This is a placeholder for the {activeSection} section. In a complete implementation, this would contain all the relevant controls and data.</p>
                </div>
              )}
              
              {selectedReportData && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/50 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="font-medium text-gray-900 dark:text-gray-100">Report Details: {selectedReportData.id}</h2>
                    <button onClick={() => setSelectedFlag(null)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      <XCircle size={18} />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reported Content:</div>
                      <div className="p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        {selectedReportData.content}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Content Author</h3>
                        <div className="border dark:border-gray-600 rounded-md overflow-hidden">
                          <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                            <div className="flex items-center">
                              <img src={selectedReportData.author.avatar} alt={selectedReportData.author.name} className="h-10 w-10 rounded-full mr-3" />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">{selectedReportData.author.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Joined {new Date(selectedReportData.author.joinDate).toLocaleDateString()} • {selectedReportData.author.postCount} posts
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-700">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500 dark:text-gray-400">Previous flags:</span>
                              <span className={`font-medium ${selectedReportData.author.previousFlags > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                {selectedReportData.author.previousFlags}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Account age:</span>
                              <span className="text-gray-600 dark:text-gray-300">
                                {Math.floor((new Date().getTime() - new Date(selectedReportData.author.joinDate).getTime()) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Report Information</h3>
                        <div className="border dark:border-gray-600 rounded-md overflow-hidden">
                          <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                            <div className="flex items-center">
                              <img src={selectedReportData.reporter.avatar} alt={selectedReportData.reporter.name} className="h-10 w-10 rounded-full mr-3" />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">{selectedReportData.reporter.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Reported on {formatDate(selectedReportData.timestamp)}</div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-700">
                            <div className="text-sm mb-2">
                              <span className="font-medium text-gray-900 dark:text-gray-100">Reason: </span>
                              <span className="text-gray-700 dark:text-gray-300">{selectedReportData.reportReason}</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900 dark:text-gray-100">Location: </span>
                              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">{selectedReportData.topic.title}</a>
                              <span className="text-gray-500 dark:text-gray-400"> in {selectedReportData.topic.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedReportData.status === 'pending' ? (
                      <div>
                        <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Take Action</h3>
                        <div className="mb-4">
                          <label htmlFor="moderation-note" className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Moderation Note:</label>
                          <textarea
                            id="moderation-note"
                            rows={3}
                            className="w-full border dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add additional notes about your decision..."
                            value={moderationNote}
                            onChange={(e) => setModerationNote(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: 'Remove Content', action: 'remove_content', icon: Trash2, color: 'red' },
                            { label: 'Edit Content', action: 'edit_content', icon: Edit, color: 'blue' },
                            ...(selectedReportData.contentType === 'topic' ? [{ label: 'Move Topic', action: 'move_topic', icon: Move, color: 'yellow' }] : []),
                            { label: 'Lock Thread', action: 'lock_topic', icon: Lock, color: 'purple' },
                            { label: 'Warn User', action: 'warn_user', icon: AlertTriangle, color: 'orange' },
                            { label: 'Ban User', action: 'ban_user', icon: UserX, color: 'red', variant: 'destructive' },
                            { label: 'Dismiss Report', action: 'dismiss', icon: XCircle, color: 'gray' },
                          ].map(btn => (
                            <button 
                              key={btn.action}
                              className={`flex items-center bg-${btn.color}-100 dark:bg-${btn.color}-900/60 text-${btn.color}-800 dark:text-${btn.color}-200 px-3 py-2 rounded-md text-sm hover:bg-${btn.color}-200 dark:hover:bg-${btn.color}-800/80`}
                              onClick={() => handleAction(btn.action, selectedReportData.id)}
                            >
                              <btn.icon size={16} className="mr-1" />
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Resolution</h3>
                        <div className="border dark:border-gray-600 rounded-md overflow-hidden">
                          <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`p-1.5 rounded-full mr-2 ${
                                  selectedReportData.status === 'resolved' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-600'
                                }`}>
                                  {selectedReportData.status === 'resolved' ? (
                                    <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                                  ) : (
                                    <XCircle className="text-gray-600 dark:text-gray-300" size={16} />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {selectedReportData.status === 'resolved' ? 'Report Resolved' : 'Report Rejected'}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Action: {selectedReportData.resolution?.action.split('_').map(word => 
                                      word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(selectedReportData.resolution?.timestamp ?? new Date().toISOString())}
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-700">
                            <div className="text-sm mb-1">
                              <span className="font-medium text-gray-900 dark:text-gray-100">Moderator: </span>
                              <span className="text-gray-700 dark:text-gray-300">{selectedReportData.resolution?.moderator}</span>
                            </div>
                            {selectedReportData.resolution?.note && (
                              <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                <span className="font-medium text-gray-900 dark:text-gray-100">Note: </span>
                                {selectedReportData.resolution?.note}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex mt-4">
                          <button 
                            className="flex items-center bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800/80 mr-2"
                            onClick={() => handleAction('reopen', selectedReportData.id)}
                          >
                            <RefreshCw size={16} className="mr-1" />
                            Reopen Report
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModeratorDashboard;
