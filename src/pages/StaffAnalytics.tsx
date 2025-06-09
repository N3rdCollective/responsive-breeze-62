
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Eye, Globe, Smartphone, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import TitleUpdater from '@/components/TitleUpdater';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  total_visits: number;
  unique_visitors: number;
  page_path: string;
  visit_count: number;
  device_breakdown: {
    [key: string]: number;
  };
}

const StaffAnalytics = () => {
  const navigate = useNavigate();
  const { userRole, isLoading: authLoading } = useStaffAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      const { data, error } = await supabase.rpc('get_analytics_summary', {
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString()
      });

      if (error) {
        throw error;
      }

      setAnalytics(data || []);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error loading analytics",
        description: error.message || "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && userRole && ['admin', 'super_admin'].includes(userRole)) {
      fetchAnalytics();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, userRole, dateRange]);

  const handleRefresh = () => {
    fetchAnalytics();
    toast({
      title: "Analytics refreshed",
      description: "Data has been updated with the latest information.",
    });
  };

  // Check authorization
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to view analytics.</p>
          <Button onClick={() => navigate('/')}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  // Process analytics data for charts
  const totalVisits = analytics.reduce((sum, item) => sum + (item.total_visits || 0), 0);
  const totalUniqueVisitors = analytics.reduce((sum, item) => sum + (item.unique_visitors || 0), 0);
  
  // Top pages data
  const topPagesData = analytics
    .filter(item => item.page_path && item.visit_count)
    .slice(0, 10)
    .map(item => ({
      page: item.page_path.length > 20 ? item.page_path.substring(0, 20) + '...' : item.page_path,
      visits: item.visit_count
    }));

  // Device breakdown data
  const deviceData = analytics.length > 0 && analytics[0].device_breakdown 
    ? Object.entries(analytics[0].device_breakdown).map(([device, count]) => ({
        device: device.charAt(0).toUpperCase() + device.slice(1),
        count: count
      }))
    : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <>
      <TitleUpdater title="Analytics - Staff Panel" />
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/staff/panel')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Website traffic and user analytics</p>
              </div>
            </div>
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

          {loading ? (
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
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
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

                <Card>
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
                        <p className="text-2xl font-bold">{topPagesData.length}</p>
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
                        <p className="text-2xl font-bold">{deviceData.length}</p>
                      </div>
                      <Smartphone className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Pages</CardTitle>
                    <CardDescription>Most visited pages in the selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topPagesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topPagesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="page" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="visits" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No page data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Device Breakdown Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Device Breakdown</CardTitle>
                    <CardDescription>Visitor distribution by device type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {deviceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={deviceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {deviceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No device data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Page List */}
              {topPagesData.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Page Details</CardTitle>
                    <CardDescription>Detailed breakdown of page visits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.filter(item => item.page_path && item.visit_count).slice(0, 10).map((item, index) => (
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
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default StaffAnalytics;
