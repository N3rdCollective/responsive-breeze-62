
import React from 'react';

interface PlaceholderSectionProps {
  sectionName: string;
}

const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({ sectionName }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}</h1>
      <p className="text-gray-600 dark:text-gray-400">This is a placeholder for the {sectionName} section. In a complete implementation, this would contain all the relevant controls and data.</p>
    </div>
  );
};

export default PlaceholderSection;
