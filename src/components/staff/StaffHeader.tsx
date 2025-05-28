
import React from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut } from "lucide-react";

interface StaffHeaderProps {
  staffName?: string;
  isAdmin?: boolean;
  title?: string;
  showLogoutButton?: boolean;
  onLogout?: () => void;
}

const StaffHeader: React.FC<StaffHeaderProps> = ({ 
  staffName, 
  isAdmin = false, 
  title,
  showLogoutButton = false,
  onLogout
}) => {
  return (
    <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2 break-words">
          {title || "Staff Control Panel"}
        </h1>
        {staffName && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Welcome back, <span className="font-medium">{staffName}</span>
            </p>
            {isAdmin && (
              <div className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-full text-xs w-fit">
                <ShieldCheck className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>Administrator</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
          Last login: {new Date().toLocaleDateString()}
        </div>
        
        {showLogoutButton && onLogout && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLogout}
            className="flex items-center gap-1 w-full sm:w-auto order-1 sm:order-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
};

export default StaffHeader;
