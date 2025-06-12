
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsPageDetailsProps {
  analytics: Array<{
    page_path?: string;
    visit_count?: number;
  }>;
}

const AnalyticsPageDetails: React.FC<AnalyticsPageDetailsProps> = ({ analytics }) => {
  const pageData = analytics.filter(item => item.page_path && item.visit_count).slice(0, 10);

  if (pageData.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Page Details</CardTitle>
        <CardDescription>Detailed breakdown of page visits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pageData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{item.page_path}</p>
              </div>
              <Badge variant="secondary">{item.visit_count} visits</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsPageDetails;
