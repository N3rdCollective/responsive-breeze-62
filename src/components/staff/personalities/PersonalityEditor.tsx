
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import { BasicInfoFields } from "./components/BasicInfoFields";
import { SocialMediaFields } from "./components/SocialMediaFields";
import { usePersonalityEditor } from "./hooks/usePersonalityEditor";

const PersonalityEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  console.log("PersonalityEditor: Personality ID from params:", id);
  
  const {
    form,
    personality,
    isLoading,
    error,
    isSubmitting,
    onSubmit
  } = usePersonalityEditor(id || "");

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    console.error("Error in PersonalityEditor:", error);
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              Error loading personality. Please try again later.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!personality) {
    console.error("No personality data found for ID:", id);
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              Personality not found. Please check the URL and try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("PersonalityEditor: Rendering form with data:", personality);

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Personality: {personality?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <BasicInfoFields 
                form={form} 
                currentImageUrl={personality?.image_url || ""} 
              />
              <SocialMediaFields form={form} />
              
              <CardFooter className="flex justify-end space-x-4 px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/staff/personalities")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalityEditor;
