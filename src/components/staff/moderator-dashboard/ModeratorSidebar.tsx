
import React from 'react';
import { BarChart2, Flag, Users, MessageSquare, Settings } from 'lucide-react';
import { DashboardStats } from './types';

interface ModeratorSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  dashboardStats: DashboardStats;
}

const ModeratorSidebar: React.FC<ModeratorSidebarProps> = ({ activeSection, setActiveSection, dashboardStats }) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: BarChart2 },
    { id: 'reported', label: 'Reported Content', icon: Flag, badge: dashboardStats.pendingReports > 0 ? dashboardStats.pendingReports : undefined },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content Management', icon: MessageSquare },
    { id: 'settings', label: 'Moderation Settings', icon: Settings },
  ];

  return (
    <div className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="font-medium text-gray-700 dark:text-gray-200">Moderation Tools</div>
      </div>
      
      <nav className="p-2 space-y-1">
        {navItems.map(item => (
          <button 
            key={item.id}
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${activeSection === item.id ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            onClick={() => setActiveSection(item.id)}
          >
            <item.icon size={18} className="mr-2" />
            {item.label}
            {item.badge !== undefined && (
              <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
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
            <span className="font-medium">1h 12m</span> {/* This could be dynamic */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorSidebar;
