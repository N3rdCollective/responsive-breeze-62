
import React from 'react';
import { XCircle, Trash2, Edit, Move, Lock, AlertTriangle, UserX, CheckCircle, RefreshCw } from 'lucide-react';
import { Report } from './types';
import { formatDate } from '@/utils/moderatorUtils';

interface ReportDetailsProps {
  reportData: Report;
  onClose: () => void;
  onAction: (action: string, reportId: string) => void;
  moderationNote: string;
  setModerationNote: (note: string) => void;
}

const ReportDetails: React.FC<ReportDetailsProps> = ({ 
  reportData, 
  onClose, 
  onAction, 
  moderationNote, 
  setModerationNote 
}) => {
  const actionButtons = [
    { label: 'Remove Content', action: 'remove_content', icon: Trash2, color: 'red' },
    { label: 'Edit Content', action: 'edit_content', icon: Edit, color: 'blue' },
    ...(reportData.contentType === 'topic' ? [{ label: 'Move Topic', action: 'move_topic', icon: Move, color: 'yellow' }] : []),
    { label: 'Lock Thread', action: 'lock_topic', icon: Lock, color: 'purple' },
    { label: 'Warn User', action: 'warn_user', icon: AlertTriangle, color: 'orange' },
    { label: 'Ban User', action: 'ban_user', icon: UserX, color: 'red', variant: 'destructive' },
    { label: 'Dismiss Report', action: 'dismiss', icon: XCircle, color: 'gray' },
  ];

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/50 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-medium text-gray-900 dark:text-gray-100">Report Details: {reportData.id}</h2>
        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          <XCircle size={18} />
        </button>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reported Content:</div>
          <div className="p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            {reportData.content}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Content Author</h3>
            <div className="border dark:border-gray-600 rounded-md overflow-hidden">
              <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <div className="flex items-center">
                  <img src={reportData.author.avatar} alt={reportData.author.name} className="h-10 w-10 rounded-full mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{reportData.author.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Joined {new Date(reportData.author.joinDate).toLocaleDateString()} • {reportData.author.postCount} posts
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-700">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Previous flags:</span>
                  <span className={`font-medium ${reportData.author.previousFlags > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                    {reportData.author.previousFlags}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Account age:</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {Math.floor((new Date().getTime() - new Date(reportData.author.joinDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Report Information</h3>
            <div className="border dark:border-gray-600 rounded-md overflow-hidden">
              <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <div className="flex items-center">
                  <img src={reportData.reporter.avatar} alt={reportData.reporter.name} className="h-10 w-10 rounded-full mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{reportData.reporter.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Reported on {formatDate(reportData.timestamp)}</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-700">
                <div className="text-sm mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Reason: </span>
                  <span className="text-gray-700 dark:text-gray-300">{reportData.reportReason}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Location: </span>
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">{reportData.topic.title}</a>
                  <span className="text-gray-500 dark:text-gray-400"> in {reportData.topic.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {reportData.status === 'pending' ? (
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Take Action</h3>
            <div className="mb-4">
              <label htmlFor="moderation-note" className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Moderation Note:</label>
              <textarea
                id="moderation-note"
                rows={3}
                className="w-full border dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add additional notes about your decision..."
                value={moderationNote}
                onChange={(e) => setModerationNote(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {actionButtons.map(btn => (
                <button 
                  key={btn.action}
                  className={`flex items-center bg-${btn.color}-100 dark:bg-${btn.color}-900/60 text-${btn.color}-800 dark:text-${btn.color}-200 px-3 py-2 rounded-md text-sm hover:bg-${btn.color}-200 dark:hover:bg-${btn.color}-800/80`}
                  onClick={() => onAction(btn.action, reportData.id)}
                >
                  <btn.icon size={16} className="mr-1" />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Resolution</h3>
            <div className="border dark:border-gray-600 rounded-md overflow-hidden">
              <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-1.5 rounded-full mr-2 ${
                      reportData.status === 'resolved' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-600'
                    }`}>
                      {reportData.status === 'resolved' ? (
                        <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                      ) : (
                        <XCircle className="text-gray-600 dark:text-gray-300" size={16} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {reportData.status === 'resolved' ? 'Report Resolved' : 'Report Rejected'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Action: {reportData.resolution?.action.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(reportData.resolution?.timestamp ?? new Date().toISOString())}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-700">
                <div className="text-sm mb-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Moderator: </span>
                  <span className="text-gray-700 dark:text-gray-300">{reportData.resolution?.moderator}</span>
                </div>
                {reportData.resolution?.note && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Note: </span>
                    {reportData.resolution?.note}
                  </div>
                )}
              </div>
            </div>
            <div className="flex mt-4">
              <button 
                className="flex items-center bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800/80 mr-2"
                onClick={() => onAction('reopen', reportData.id)}
              >
                <RefreshCw size={16} className="mr-1" />
                Reopen Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetails;
