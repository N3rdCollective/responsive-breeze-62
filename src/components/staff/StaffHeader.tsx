
import React from "react";

interface StaffHeaderProps {
  staffName: string;
}

const StaffHeader = ({ staffName }: StaffHeaderProps) => {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tighter text-black dark:text-[#FFD700] sm:text-4xl">
        Staff Control Panel
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        Welcome{staffName ? `, ${staffName}` : ""}! Manage your radio station content here.
      </p>
    </div>
  );
};

export default StaffHeader;
