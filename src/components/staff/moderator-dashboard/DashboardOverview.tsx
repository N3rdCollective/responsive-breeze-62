
import React from 'react';
import { Flag, CheckCircle, Users, MessageSquare } from 'lucide-react';
import { DashboardStats } from './types';

interface DashboardOverviewProps {
  dashboardStats: DashboardStats;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ dashboardStats }) => {
  const statsCards = [
    { icon: Flag, color: 'red', label: 'Pending Reports', value: dashboardStats.pendingReports },
    { icon: CheckCircle, color: 'green', label: 'Resolved Today', value: dashboardStats.resolvedToday },
    { icon: Users, color: 'blue', label: 'New Members', value: dashboardStats.newMembers },
    { icon: MessageSquare, color: 'purple', label: 'Active Topics', value: dashboardStats.activeTopics },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map(stat => (
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
  );
};

export default DashboardOverview;
