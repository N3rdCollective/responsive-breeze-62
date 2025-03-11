
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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white mb-1">
          {title || "Staff Control Panel"}
        </h1>
        {staffName && (
          <div className="flex items-center gap-2">
            <p className="text-gray-500 dark:text-gray-400">
              Welcome back, {staffName}
            </p>
            {isAdmin && (
              <div className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full text-xs">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Administrator
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 mt-4 sm:mt-0">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last login: {new Date().toLocaleDateString()}
        </div>
        
        {showLogoutButton && onLogout && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLogout}
            className="flex items-center gap-1"
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
