
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { FormValues } from "../types";
import PersonalityFormContent from "./PersonalityFormContent";

interface PersonalityFormProps {
  form: UseFormReturn<FormValues>;
  isSaving: boolean;
  selectedPersonality: string | null;
  onImageSelected: (file: File) => void;
  onSubmit: (values: FormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const PersonalityForm = ({ 
  form, 
  isSaving, 
  selectedPersonality, 
  onImageSelected, 
  onSubmit, 
  onDelete 
}: PersonalityFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{selectedPersonality ? "Edit Personality" : "Create New Personality"}</CardTitle>
        <CardDescription>
          {selectedPersonality ? "Update information for this personality" : "Fill in details to create a new personality"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...form.register("id")} />
            
            <PersonalityFormContent 
              form={form} 
              onImageSelected={onImageSelected} 
            />
            
            <CardFooter className="flex justify-between px-0">
              <div>
                {selectedPersonality && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => onDelete(selectedPersonality)}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Personality"
                    )}
                  </Button>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="bg-[#FFD700] text-black hover:bg-[#FFD700]/80"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  selectedPersonality ? "Update Personality" : "Create Personality"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PersonalityForm;
