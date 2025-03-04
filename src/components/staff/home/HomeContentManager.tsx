
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X } from "lucide-react";
import { HomeSettingsProvider } from "./context/HomeSettingsContext";
import { useHomeSettingsData } from "./hooks/useHomeSettingsData";
import SectionsTabContent from "./components/SectionsTabContent";
import PreviewTabContent from "./components/PreviewTabContent";
import { useNavigate } from "react-router-dom";

const HomeContentManagerContent: React.FC = () => {
  const { isLoading, handleSaveSettings, isSaving } = useHomeSettingsData();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Home Page Components</CardTitle>
          <CardDescription>
            Toggle visibility of different sections on the home page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
              <TabsTrigger value="sections">Section Visibility</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sections" className="space-y-4 pt-4">
              <SectionsTabContent />
            </TabsContent>
            
            <TabsContent value="preview" className="pt-4">
              <PreviewTabContent />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate("/staff")} 
          className="gap-2"
        >
          <X className="h-4 w-4" /> Cancel
        </Button>
        
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

const HomeContentManager: React.FC = () => {
  return (
    <HomeSettingsProvider>
      <HomeContentManagerContent />
    </HomeSettingsProvider>
  );
};

export default HomeContentManager;
