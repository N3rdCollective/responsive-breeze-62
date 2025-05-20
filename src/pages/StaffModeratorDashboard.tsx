import React, { useState, useEffect } from 'react';
import TitleUpdater from '@/components/TitleUpdater';
import ModeratorHeader from '@/components/staff/moderator-dashboard/ModeratorHeader';
import ModeratorSidebar from '@/components/staff/moderator-dashboard/ModeratorSidebar';
import DashboardOverview from '@/components/staff/moderator-dashboard/DashboardOverview';
import ReportedContentSection from '@/components/staff/moderator-dashboard/ReportedContentSection';
import ReportDetails from '@/components/staff/moderator-dashboard/ReportDetails';
import PlaceholderSection from '@/components/staff/moderator-dashboard/PlaceholderSection';
import { reportedContent as allReports, dashboardStats as initialDashboardStats } from '@/data/mockModeratorData';
import { Report } from '@/components/staff/moderator-dashboard/types';

const ModeratorDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [moderationNote, setModerationNote] = useState('');
  
  // For this example, we'll use the imported mock data directly.
  // In a real app, this would likely come from a fetch hook (e.g., useQuery)
  const [reportsData, setReportsData] = useState<Report[]>(allReports);
  const [dashboardStats, setDashboardStats] = useState(initialDashboardStats);

  // Update dashboardStats if reportsData changes (e.g., after an action)
  useEffect(() => {
    setDashboardStats(prevStats => ({
      ...prevStats,
      pendingReports: reportsData.filter(r => r.status === 'pending').length,
    }));
  }, [reportsData]);

  const filteredReports = reportsData.filter(report => {
    const statusMatch = filterStatus === 'all' || report.status === filterStatus;
    
    const searchLower = searchTerm.toLowerCase();
    const termMatch = searchTerm === '' || 
                      report.content.toLowerCase().includes(searchLower) ||
                      report.reportReason.toLowerCase().includes(searchLower) ||
                      report.reporter.name.toLowerCase().includes(searchLower) ||
                      report.author.name.toLowerCase().includes(searchLower) ||
                      report.topic.title.toLowerCase().includes(searchLower);

    return statusMatch && termMatch;
  });
  
  const handleAction = (action: string, reportId: string) => {
    console.log(`Taking action "${action}" on report ${reportId}`);
    console.log(`Moderation note: ${moderationNote}`);
    // Example: Update report status (this is a mock, real app would update backend)
    // This is a simplified example. A real implementation would be more robust.
    if (action === 'dismiss') {
        setReportsData(prevReports => 
            prevReports.map(r => r.id === reportId ? {...r, status: 'rejected', resolution: { action: 'dismiss', moderator: 'Admin User', timestamp: new Date().toISOString(), note: moderationNote || 'Dismissed without note' }} : r)
        );
    } else if (action === 'remove_content') {
         setReportsData(prevReports => 
            prevReports.map(r => r.id === reportId ? {...r, status: 'resolved', resolution: { action: 'remove_content', moderator: 'Admin User', timestamp: new Date().toISOString(), note: moderationNote || 'Content removed' }} : r)
        );
    }
    // Add more action handlers as needed...

    setSelectedFlagId(null);
    setModerationNote('');
  };
  
  const selectedReportData = selectedFlagId ? reportsData.find(r => r.id === selectedFlagId) : null;

  useEffect(() => {
    document.title = "Moderator Dashboard - Staff Panel";
  }, []);

  return (
    <>
      <TitleUpdater />
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
        <ModeratorHeader />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            <ModeratorSidebar 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              dashboardStats={dashboardStats}
            />
            
            <div className="flex-1">
              {activeSection === 'overview' && (
                <DashboardOverview dashboardStats={dashboardStats} />
              )}
              
              {activeSection === 'reported' && (
                <ReportedContentSection
                  filteredReports={filteredReports}
                  selectedFlag={selectedFlagId}
                  setSelectedFlag={setSelectedFlagId}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              )}
              
              {(activeSection === 'users' || activeSection === 'content' || activeSection === 'settings') && (
                <PlaceholderSection sectionName={activeSection} />
              )}
              
              {selectedReportData && (
                <ReportDetails
                  reportData={selectedReportData}
                  onClose={() => setSelectedFlagId(null)}
                  onAction={handleAction}
                  moderationNote={moderationNote}
                  setModerationNote={setModerationNote}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModeratorDashboard;
