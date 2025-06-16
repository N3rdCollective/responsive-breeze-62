
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const ModerationPageHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
      <div className="order-2 sm:order-1">
        <Button variant="outline" size="sm" onClick={() => navigate('/staff/panel')} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Staff Panel
        </Button>
      </div>
      <div className="text-center sm:text-right order-1 sm:order-2 w-full sm:w-auto">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 justify-center sm:justify-end">
          <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <span className="break-words">Moderation Dashboard</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Monitor and moderate community content and user behavior.
        </p>
      </div>
    </div>
  );
};

export default ModerationPageHeader;
