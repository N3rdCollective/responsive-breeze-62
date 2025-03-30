
import React from "react";

interface JsonDetailsViewProps {
  data: any;
}

const JsonDetailsView: React.FC<JsonDetailsViewProps> = ({ data }) => {
  if (!data) return <p>No details available</p>;
  
  try {
    // Try to parse if it's a string
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    
    return (
      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  } catch (e) {
    return <p>{String(data)}</p>;
  }
};

export default JsonDetailsView;
