
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AdminCardProps {
  onManageStaff: () => void;
  onLogout: () => void;
}

const AdminCard = ({ onManageStaff, onLogout }: AdminCardProps) => {
  const { toast } = useToast();

  const handleViewAnalytics = () => {
    // Find the StatsPanel in the DOM and click the Analytics tab
    const analyticsTab = document.querySelector('[value="analytics"]') as HTMLElement;
    if (analyticsTab) {
      analyticsTab.click();
      // Scroll to the stats panel
      const statsPanel = document.querySelector('.bg-\\[\\#F5F5F5\\].dark\\:bg-\\[\\#333333\\]');
      if (statsPanel) {
        statsPanel.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      toast({
        title: "Analytics Dashboard",
        description: "Navigate to the Analytics tab in the Station Insights section below.",
      });
    }
  };

  return (
    <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 space-y-4">
      <h3 className="text-xl font-semibold text-black dark:text-[#FFD700]">Administration</h3>
      <p className="text-gray-500 dark:text-gray-400">Manage staff and view analytics.</p>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
          onClick={onManageStaff}
        >
          Manage Staff
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
          onClick={handleViewAnalytics}
        >
          View Analytics
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={onLogout}
        >
          Logout
        </Button>
      </div>
    </Card>
  );
};

export default AdminCard;
