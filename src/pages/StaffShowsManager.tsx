
import React from "react";
import { useNavigate } from "react-router-dom";
import { useStaffRole } from "@/hooks/useStaffRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Radio, 
  ArrowLeft,
  Upload,
  FileText,
  ClipboardCheck
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";
import { usePendingSubmissions } from "@/components/staff/shows/review/hooks/usePendingSubmissions";

const StaffShowsManager = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useStaffRole();
  const { data: pendingSubmissions } = usePendingSubmissions();
  
  const pendingCount = pendingSubmissions?.length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-128px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading Shows Management...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TitleUpdater />
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="order-2 sm:order-1">
            <Button variant="outline" size="sm" onClick={() => navigate('/staff/panel')} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Staff Panel
            </Button>
          </div>
          <div className="text-center sm:text-right order-1 sm:order-2 w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 justify-center sm:justify-end">
              <Radio className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="break-words">Shows Management Hub</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Submit shows, track submissions, and manage programming
            </p>
          </div>
        </div>

        {/* DJ Actions */}
        {!isAdmin && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              DJ Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate('/staff/shows/submit')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Submit New Show
                  </CardTitle>
                  <CardDescription>
                    Upload your show for review by program directors
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate('/staff/shows/submissions')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    My Submissions
                  </CardTitle>
                  <CardDescription>
                    View the status of your submitted shows
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}

        {/* Program Director Actions */}
        {isAdmin && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Program Director Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate('/staff/shows/review')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 justify-between">
                    <span className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-primary" />
                      Review Queue
                    </span>
                    {pendingCount > 0 && (
                      <Badge variant="destructive">{pendingCount}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Review and approve pending show submissions
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate('/staff/shows/submissions')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    All Submissions
                  </CardTitle>
                  <CardDescription>
                    View complete submission history and manage shows
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}

        {/* Published Shows Link */}
        <Card className="border-primary/50 bg-primary/5 dark:bg-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary text-lg">
              <Radio className="h-5 w-5 flex-shrink-0" />
              <span className="break-words">Published Shows Dashboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 text-sm sm:text-base leading-relaxed mb-4">
              View and manage the public show schedule, programming details, 
              and broadcasting coordination tools.
            </p>
            <Button 
              onClick={() => navigate('/staff/panel?tab=shows')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Radio className="h-4 w-4 mr-2" />
              Go to Shows Dashboard
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default StaffShowsManager;
