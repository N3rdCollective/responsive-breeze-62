
import { Button } from "@/components/ui/button";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import PersonalityList from "./components/PersonalityList";
import PersonalityForm from "./components/PersonalityForm";
import { usePersonalityEditor } from "./hooks/usePersonalityEditor";
import { FormValues } from "./types";

export const PersonalityEditor = () => {
  const { userRole } = useStaffAuth();
  
  // Check if user has permissions
  const canEdit = userRole === "admin" || userRole === "super_admin" || userRole === "moderator";

  const { 
    form,
    personalities,
    loading,
    selectedPersonality,
    isSaving,
    handleSelectPersonality,
    handleImageSelected,
    handleSubmit,
    handleCreateNew,
    handleSaveNew,
    handleDelete
  } = usePersonalityEditor(canEdit);

  // Handle form submission based on whether we're creating or editing
  const onSubmit = (values: FormValues) => {
    return selectedPersonality ? handleSubmit(values) : handleSaveNew(values);
  };

  if (!canEdit) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
        <p className="text-gray-500 dark:text-gray-400">
          You don't have permission to edit personalities.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Personalities</h2>
        <Button 
          onClick={handleCreateNew} 
          variant="outline"
          className="bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
        >
          Create New Personality
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <PersonalityList 
          personalities={personalities}
          loading={loading}
          selectedPersonality={selectedPersonality}
          onSelectPersonality={handleSelectPersonality}
        />

        <div className="lg:col-span-3">
          <PersonalityForm 
            form={form}
            isSaving={isSaving}
            selectedPersonality={selectedPersonality}
            onImageSelected={handleImageSelected}
            onSubmit={onSubmit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalityEditor;
