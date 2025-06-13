
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAnalytics } from '@/components/providers/AnalyticsProvider';
import { useToast } from '@/hooks/use-toast';

const PrivacyControls: React.FC = () => {
  const { isAnalyticsEnabled, setAnalyticsEnabled } = useAnalytics();
  const { toast } = useToast();

  const handleToggleAnalytics = (enabled: boolean) => {
    setAnalyticsEnabled(enabled);
    toast({
      title: enabled ? "Analytics Enabled" : "Analytics Disabled",
      description: enabled 
        ? "We'll track your usage to improve the site experience."
        : "Analytics tracking has been disabled. Your privacy is protected.",
      duration: 3000
    });
  };

  const clearAnalyticsData = () => {
    localStorage.removeItem('analytics_session_id');
    localStorage.removeItem('analytics_session_timestamp');
    toast({
      title: "Analytics Data Cleared",
      description: "All local analytics data has been removed.",
      duration: 3000
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Privacy Controls</CardTitle>
        </div>
        <CardDescription>
          Manage how we collect and use your data to improve your experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isAnalyticsEnabled ? (
                <Eye className="h-4 w-4 text-green-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-500" />
              )}
              <h4 className="font-medium">Analytics Tracking</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {isAnalyticsEnabled 
                ? "We're collecting anonymous usage data to improve the site."
                : "Analytics tracking is disabled. No usage data is being collected."
              }
            </p>
          </div>
          <Switch
            checked={isAnalyticsEnabled}
            onCheckedChange={handleToggleAnalytics}
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">What we collect when enabled:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Pages you visit and time spent</li>
            <li>• Device type (mobile, tablet, desktop)</li>
            <li>• Browser and operating system</li>
            <li>• Referrer information (where you came from)</li>
            <li>• Anonymous session data</li>
          </ul>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">What we DON'T collect:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Personal information or passwords</li>
            <li>• IP addresses or precise location</li>
            <li>• Content of your messages or posts</li>
            <li>• Data from third-party sites</li>
          </ul>
        </div>

        <div className="border-t pt-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAnalyticsData}
          >
            Clear Local Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacyControls;
