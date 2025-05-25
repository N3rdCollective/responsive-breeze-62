
import React from 'react';

interface StatsSectionProps {
  stats: {
    listeners: string;
    shows: string;
    members: string;
    broadcasts: string;
  };
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const statItems = [
    { label: "Live Broadcasting", value: stats.broadcasts },
    { label: "Weekly Shows", value: stats.shows },
    { label: "Monthly Listeners", value: stats.listeners },
    { label: "Community Members", value: stats.members },
  ];

  return (
    <section className="py-12 bg-muted/20 dark:bg-gray-800/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {statItems.map(stat => (
            <div className="text-center p-4 bg-card rounded-lg shadow-sm" key={stat.label}>
              <div className="text-3xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
