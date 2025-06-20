
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsPageDetailsProps {
  analytics: Array<{
    page: string;
    visits: number;
  }>;
}

const AnalyticsPageDetails: React.FC<AnalyticsPageDetailsProps> = ({ analytics }) => {
  if (analytics.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Page Details</CardTitle>
          <CardDescription>Detailed breakdown of page visits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No page data available for the selected time period.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Page Details</CardTitle>
        <CardDescription>Detailed breakdown of page visits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {analytics.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{item.page}</p>
              </div>
              <Badge variant="secondary">{item.visits} visits</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsPageDetails;
