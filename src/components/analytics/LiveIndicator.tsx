
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, RadioOff, Wifi, WifiOff } from 'lucide-react';

interface LiveIndicatorProps {
  isLive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastUpdated: Date | null;
  onToggle: () => void;
}

const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  isLive,
  connectionStatus,
  lastUpdated,
  onToggle
}) => {
  const getStatusIcon = () => {
    if (!isLive) return <RadioOff className="h-3 w-3" />;
    
    switch (connectionStatus) {
      case 'connected':
        return <Radio className="h-3 w-3 text-green-500" />;
      case 'connecting':
        return <Wifi className="h-3 w-3 text-yellow-500 animate-pulse" />;
      case 'disconnected':
        return <WifiOff className="h-3 w-3 text-red-500" />;
      default:
        return <RadioOff className="h-3 w-3" />;
    }
  };

  const getStatusText = () => {
    if (!isLive) return 'Offline';
    
    switch (connectionStatus) {
      case 'connected':
        return 'LIVE';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Offline';
    }
  };

  const getStatusColor = () => {
    if (!isLive) return 'secondary';
    
    switch (connectionStatus) {
      case 'connected':
        return 'default';
      case 'connecting':
        return 'secondary';
      case 'disconnected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
      return lastUpdated.toLocaleTimeString();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Badge 
          variant={getStatusColor()} 
          className={`flex items-center gap-1 ${
            isLive && connectionStatus === 'connected' 
              ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse' 
              : ''
          }`}
        >
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
        
        {lastUpdated && (
          <span className="text-xs text-muted-foreground">
            Last updated: {formatLastUpdated()}
          </span>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className={`${
          isLive && connectionStatus === 'connected'
            ? 'border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
            : ''
        }`}
      >
        {isLive ? 'Stop Live' : 'Go Live'}
      </Button>
    </div>
  );
};

export default LiveIndicator;
