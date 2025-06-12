
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Eye, Globe, Smartphone } from 'lucide-react';

interface AnalyticsStatsCardsProps {
  totalVisits: number;
  totalUniqueVisitors: number;
  topPagesCount: number;
  deviceTypesCount: number;
  isLive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  loading: boolean;
}

const AnalyticsStatsCards: React.FC<AnalyticsStatsCardsProps> = ({
  totalVisits,
  totalUniqueVisitors,
  topPagesCount,
  deviceTypesCount,
  isLive,
  connectionStatus,
  loading
}) => {
  const liveCardClass = `transition-all duration-300 ${
    isLive && connectionStatus === 'connected' 
      ? 'ring-2 ring-green-500/20 shadow-lg' 
      : ''
  }`;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className={liveCardClass}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
              <p className="text-2xl font-bold">{totalVisits.toLocaleString()}</p>
            </div>
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card className={liveCardClass}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unique Visitors</p>
              <p className="text-2xl font-bold">{totalUniqueVisitors.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Top Pages</p>
              <p className="text-2xl font-bold">{topPagesCount}</p>
            </div>
            <Globe className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Device Types</p>
              <p className="text-2xl font-bold">{deviceTypesCount}</p>
            </div>
            <Smartphone className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsStatsCards;
