
import React from 'react';

interface StaffSectionHeaderProps {
  title: string;
}

const StaffSectionHeader: React.FC<StaffSectionHeaderProps> = ({ title }) => {
  return (
    <h3 className="text-lg font-medium border-b pb-2">{title}</h3>
  );
};

export default StaffSectionHeader;
