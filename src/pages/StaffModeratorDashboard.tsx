
import React from "react";
import { useNavigate } from "react-router-dom";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";

const StaffModerationDashboard = () => {
  const navigate = useNavigate();
  const { staffName, userRole } = useStaffAuth();

  return (
    <>
      <TitleUpdater title="Moderation Dashboard - Staff Panel" />
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between mb-8 flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/staff/panel')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Staff Panel
              </Button>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold flex items-center gap-2 justify-center sm:justify-start">
              <Shield className="h-8 w-8 text-primary" />
              Moderation Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Content moderation and community management tools.
            </p>
          </div>
        </div>

        {/* Notice Card */}
        <Card className="border-primary/50 bg-primary/5 dark:bg-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              Enhanced Moderation Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 mb-4">
              Advanced moderation features are now integrated into the Unified Staff Dashboard. 
              This includes real-time reporting, user management, and content review tools.
            </p>
            <Button 
              onClick={() => navigate('/staff/panel?tab=moderation')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Go to Unified Moderation
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default StaffModerationDashboard;
