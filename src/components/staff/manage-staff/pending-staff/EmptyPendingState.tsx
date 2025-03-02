
import React from 'react';

const EmptyPendingState: React.FC = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Pending Staff</h3>
      <p className="text-sm text-gray-500">No pending staff invitations</p>
    </div>
  );
};

export default EmptyPendingState;
