
import React from "react";

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
      <span className="ml-2">Loading activity logs...</span>
    </div>
  );
};

export default LoadingIndicator;
