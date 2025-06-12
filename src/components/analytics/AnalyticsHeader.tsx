
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import LiveIndicator from './LiveIndicator';

interface AnalyticsHeaderProps {
  dateRange: string;
  setDateRange: (range: string) => void;
  isLive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastUpdated: Date | null;
  toggleLiveUpdates: () => void;
  handleRefresh: () => void;
  loading: boolean;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  dateRange,
  setDateRange,
  isLive,
  connectionStatus,
  lastUpdated,
  toggleLiveUpdates,
  handleRefresh,
  loading
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Website traffic and user analytics</p>
      </div>
      <div className="flex items-center gap-4">
        <LiveIndicator
          isLive={isLive}
          connectionStatus={connectionStatus}
          lastUpdated={lastUpdated}
          onToggle={toggleLiveUpdates}
        />
        <div className="flex items-center gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
