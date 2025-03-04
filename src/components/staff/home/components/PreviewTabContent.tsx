
import React from "react";
import { useHomeSettings } from "../context/HomeSettingsContext";

const PreviewTabContent: React.FC = () => {
  const { settings } = useHomeSettings();
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium text-lg">Home Page Structure</h3>
      <div className="mt-4 space-y-2">
        <div className={`p-3 rounded-lg border ${settings.show_hero ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800/50 dark:border-gray-700'}`}>
          Hero Section {!settings.show_hero && '(Hidden)'}
        </div>
        
        <div className="p-3 rounded-lg border bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800">
          Featured Videos Section ({settings.featured_videos.length} videos)
        </div>
        
        <div className={`p-3 rounded-lg border ${settings.show_live_banner ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800/50 dark:border-gray-700'}`}>
          Live Show Banner {!settings.show_live_banner && '(Hidden)'}
        </div>
        
        <div className={`p-3 rounded-lg border ${settings.show_news_section ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800/50 dark:border-gray-700'}`}>
          Latest News Section {!settings.show_news_section && '(Hidden)'}
        </div>
        
        <div className={`p-3 rounded-lg border ${settings.show_personalities ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800/50 dark:border-gray-700'}`}>
          Personalities Slider {!settings.show_personalities && '(Hidden)'}
        </div>
      </div>
    </div>
  );
};

export default PreviewTabContent;
