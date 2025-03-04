
import React from "react";

const StatsPanel = () => {
  return (
    <div className="bg-card border-border p-6 rounded-lg mt-8">
      <h3 className="text-xl font-semibold text-[#FFD700] mb-4">Quick Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background p-4 rounded-lg text-center border border-border">
          <div className="text-2xl font-bold text-foreground">1.2M</div>
          <div className="text-sm text-muted-foreground">Monthly Listeners</div>
        </div>
        <div className="bg-background p-4 rounded-lg text-center border border-border">
          <div className="text-2xl font-bold text-foreground">45</div>
          <div className="text-sm text-muted-foreground">Active Shows</div>
        </div>
        <div className="bg-background p-4 rounded-lg text-center border border-border">
          <div className="text-2xl font-bold text-foreground">12</div>
          <div className="text-sm text-muted-foreground">Staff Members</div>
        </div>
        <div className="bg-background p-4 rounded-lg text-center border border-border">
          <div className="text-2xl font-bold text-foreground">89%</div>
          <div className="text-sm text-muted-foreground">Engagement Rate</div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
