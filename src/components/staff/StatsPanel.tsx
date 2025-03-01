
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsDashboard from "./AnalyticsDashboard";

const StatsPanel = () => {
  const [activeTab, setActiveTab] = useState("quick-stats");

  return (
    <div className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 rounded-lg mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-black dark:text-[#FFD700]">Station Insights</h3>
          <TabsList>
            <TabsTrigger value="quick-stats">Quick Stats</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="quick-stats">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#222222] p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-black dark:text-[#FFD700]">1.2M</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Listeners</div>
            </div>
            <div className="bg-white dark:bg-[#222222] p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-black dark:text-[#FFD700]">45</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Active Shows</div>
            </div>
            <div className="bg-white dark:bg-[#222222] p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-black dark:text-[#FFD700]">12</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Staff Members</div>
            </div>
            <div className="bg-white dark:bg-[#222222] p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-black dark:text-[#FFD700]">89%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Engagement Rate</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsPanel;
