
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../types";
import PersonalityFormContent from "./PersonalityFormContent";
import { Loader2, Save, Trash } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PersonalityFormProps {
  form: UseFormReturn<FormValues>;
  isSaving: boolean;
  selectedPersonality: string | null;
  onImageSelected: (file: File) => void;
  onSubmit: (values: FormValues) => void;
  onDelete: (id: string) => void;
}

const PersonalityForm = ({ 
  form, 
  isSaving, 
  selectedPersonality, 
  onImageSelected, 
  onSubmit, 
  onDelete
}: PersonalityFormProps) => {
  const handleSubmit = form.handleSubmit(onSubmit);

  const isNewPersonality = !selectedPersonality;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isNewPersonality ? "Create New Personality" : "Edit Personality"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <PersonalityFormContent 
              form={form} 
              onImageSelected={onImageSelected} 
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {!isNewPersonality && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => selectedPersonality && onDelete(selectedPersonality)}
                  disabled={isSaving}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isNewPersonality ? "Create Personality" : "Save Changes"}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default PersonalityForm;
