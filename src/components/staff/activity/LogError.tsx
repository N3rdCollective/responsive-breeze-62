
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LogErrorProps {
  error: string;
  onRefresh: () => void;
}

const LogError: React.FC<LogErrorProps> = ({ error, onRefresh }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-200">
          <p className="font-medium">Error loading activity logs</p>
          <p className="text-sm mt-1">{error}</p>
          <Button variant="outline" className="mt-2" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogError;
