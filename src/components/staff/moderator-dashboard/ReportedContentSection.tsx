import React from 'react';
import { ChevronDown, Search, RefreshCw } from 'lucide-react';
import { Report } from './types';
import { formatDate } from '@/utils/moderatorUtils';

interface ReportedContentSectionProps {
  filteredReports: Report[];
  selectedFlag: string | null;
  setSelectedFlag: (id: string | null) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh?: () => void;
}

const ReportedContentSection: React.FC<ReportedContentSectionProps> = ({
  filteredReports,
  selectedFlag,
  setSelectedFlag,
  filterStatus,
  setFilterStatus,
  searchTerm,
  setSearchTerm,
  onRefresh,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Reported Content</h1>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                className="appearance-none bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md px-3 py-1.5 pr-8 text-sm text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Reports</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                <ChevronDown size={16} />
              </div>
            </div>
            <div className="relative flex-grow max-w-xs">
              <input
                type="text"
                className="w-full border dark:border-gray-600 rounded-md pl-8 pr-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 dark:text-gray-400">
                <Search size={16} />
              </div>
            </div>
            {onRefresh && (
              <button 
                className="flex items-center text-gray-700 dark:text-gray-300 border dark:border-gray-600 rounded-md px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={onRefresh}
              >
                <RefreshCw size={16} className="mr-1" />
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Content</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reported</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? `No reports found for "${searchTerm}"` : "No reported content found"}
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr 
                  key={report.id} 
                  className={`${selectedFlag === report.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'} cursor-pointer`}
                  onClick={() => setSelectedFlag(selectedFlag === report.id ? null : report.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <img src={report.author.avatar} alt={report.author.name} className="h-8 w-8 rounded-full mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {report.contentType === 'topic' ? 'Topic: ' : ''}
                          {report.topic.title.length > 30 ? report.topic.title.substring(0, 30) + '...' : report.topic.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">by {report.author.name} • {report.contentType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{report.reportReason}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Reported by {report.reporter.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(report.timestamp)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 
                      report.status === 'resolved' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button 
                       onClick={(e) => { e.stopPropagation(); setSelectedFlag(report.id); }}
                       className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-2"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-3 flex items-center justify-between border-t dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredReports.length}</span> of <span className="font-medium">{filteredReports.length}</span> results
        </div>
        <div className="flex-1 flex justify-end space-x-2">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">Previous</button>
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
        </div>
      </div>
    </div>
  );
};

export default ReportedContentSection;
