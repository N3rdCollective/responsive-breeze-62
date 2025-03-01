
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  total_visits: number;
  unique_visitors: number;
  page_path: string;
  visit_count: number;
  device_breakdown: Record<string, number>;
}

interface PageData {
  name: string;
  value: number;
}

interface DeviceData {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState<string>("7days");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<PageData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      
      let startDate;
      const endDate = new Date().toISOString();
      
      switch (timeRange) {
        case "7days":
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "30days":
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "90days":
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default:
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      }
      
      try {
        const { data, error } = await supabase.rpc('get_analytics_summary', {
          start_date: startDate,
          end_date: endDate
        });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setAnalyticsData(data[0]);
          
          // Prepare page data for chart
          const pagesData = Object.entries(data)
            .filter(([key]) => key === 'page_path')
            .map(([_, val]) => ({ name: val as string, value: data[0].visit_count }));
          
          setPageData(pagesData);
          
          // Prepare device data for chart
          if (data[0].device_breakdown) {
            const devicesData = Object.entries(data[0].device_breakdown)
              .map(([name, value]) => ({ name, value: value as number }));
            
            setDeviceData(devicesData);
          }
        } else {
          setAnalyticsData(null);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeRange]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  return (
    <Card className="p-6 bg-white dark:bg-[#222222]">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-black dark:text-[#FFD700]">Website Analytics</h3>
        <Tabs defaultValue="7days" onValueChange={setTimeRange} value={timeRange}>
          <TabsList>
            <TabsTrigger value="7days">7 Days</TabsTrigger>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
            <TabsTrigger value="90days">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="h-64 flex items-center justify-center text-red-500">
          {error}
        </div>
      ) : !analyticsData ? (
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No analytics data available for this period
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-[#333333] p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Visitors</p>
              <p className="text-2xl font-bold text-black dark:text-[#FFD700]">
                {formatNumber(analyticsData.total_visits || 0)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-[#333333] p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Unique Visitors</p>
              <p className="text-2xl font-bold text-black dark:text-[#FFD700]">
                {formatNumber(analyticsData.unique_visitors || 0)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Popular Pages</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pageData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Device Types</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AnalyticsDashboard;
