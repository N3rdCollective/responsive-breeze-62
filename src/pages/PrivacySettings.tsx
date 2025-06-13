
import React from 'react';
import TitleUpdater from '@/components/TitleUpdater';
import PrivacyControls from '@/components/analytics/PrivacyControls';

const PrivacySettings = () => {
  return (
    <>
      <TitleUpdater title="Privacy Settings" />
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Privacy Settings</h1>
            <p className="text-muted-foreground">
              Control how your data is collected and used
            </p>
          </div>
          <PrivacyControls />
        </div>
      </div>
    </>
  );
};

export default PrivacySettings;
