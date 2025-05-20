
import React from 'react';

const ModeratorHeader = () => {
  return (
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
              <span className="font-medium">Admin User</span> {/* This could be a prop in a real app */}
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
  );
};

export default ModeratorHeader;
