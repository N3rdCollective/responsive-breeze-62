
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../types";
import PersonalityFormContent from "./PersonalityFormContent";
import { Loader2, Trash } from "lucide-react";

interface PersonalityFormProps {
  form: UseFormReturn<FormValues>;
  isSaving: boolean;
  isUploading?: boolean;
  selectedPersonality: string | null;
  previewUrl?: string;
  onSubmit: (values: FormValues) => void;
  onDelete: (id: string) => void;
  onImageSelected: (file: File) => void;
}

const PersonalityForm = ({ 
  form, 
  isSaving, 
  isUploading = false,
  selectedPersonality, 
  previewUrl,
  onSubmit, 
  onDelete,
  onImageSelected 
}: PersonalityFormProps) => {
  const isEditing = !!selectedPersonality;
  const title = isEditing ? "Edit Personality" : "Create New Personality";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <PersonalityFormContent 
              form={form} 
              onImageSelected={onImageSelected} 
              isUploading={isUploading}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            {isEditing && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => onDelete(selectedPersonality)}
                disabled={isSaving || isUploading}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <div className="ml-auto">
              <Button 
                type="submit" 
                disabled={isSaving || isUploading}
              >
                {(isSaving || isUploading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? 'Save Changes' : 'Create Personality'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default PersonalityForm;
