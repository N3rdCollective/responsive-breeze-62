
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { FeaturedArtist } from "@/components/news/types/newsTypes";

import FormHeader from "./FormHeader";
import BasicDetailsSection from "./BasicDetailsSection";
import ImageSection from "./ImageSection";
import SocialLinksSection from "../SocialLinksSection";
import FormActions from "./FormActions";
import { FormValues } from "./types";

interface UploadProgress {
  percentage: number;
  fileName: string;
  bytesUploaded?: number;
  totalBytes?: number;
}

interface ArtistFormProps {
  selectedArtist: FeaturedArtist | null;
  onSave: (values: FormValues) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  isSaving: boolean;
  isUploading?: boolean;
  uploadProgress?: UploadProgress | null;
  uploadError?: string | null;
  onImageSelected: (file: File) => Promise<string | null>;
}

const ArtistForm: React.FC<ArtistFormProps> = ({
  selectedArtist,
  onSave,
  onDelete,
  onArchive,
  onRestore,
  isSaving,
  isUploading = false,
  uploadProgress = null,
  uploadError = null,
  onImageSelected
}) => {
  const defaultValues: FormValues = {
    name: "",
    bio: "",
    image_url: "",
    website: "",
    spotify: "",
    instagram: "",
    twitter: "",
    youtube: ""
  };

  const form = useForm<FormValues>({
    defaultValues
  });

  // Update form when selectedArtist changes
  useEffect(() => {
    if (selectedArtist) {
      console.log("Populating form with artist data:", selectedArtist);
      
      form.reset({
        id: selectedArtist.id,
        name: selectedArtist.name || "",
        bio: selectedArtist.bio || "",
        image_url: selectedArtist.image_url || "",
        website: selectedArtist.website || "",
        spotify: selectedArtist.social_links?.spotify || "",
        instagram: selectedArtist.social_links?.instagram || "",
        twitter: selectedArtist.social_links?.twitter || "",
        youtube: selectedArtist.social_links?.youtube || ""
      });
    } else {
      form.reset(defaultValues);
    }
  }, [selectedArtist, form]);

  const isEditing = !!selectedArtist;
  const isArchived = selectedArtist?.is_archived;
  const title = isEditing 
    ? isArchived 
      ? "Archived Artist" 
      : "Edit Featured Artist" 
    : "Create New Featured Artist";

  return (
    <Card>
      <FormHeader title={title} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)}>
          <CardContent className="space-y-6">
            <BasicDetailsSection form={form} isArchived={!!isArchived} />
            
            <ImageSection 
              form={form} 
              isArchived={!!isArchived} 
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              uploadError={uploadError}
              onImageSelected={onImageSelected} 
            />

            <SocialLinksSection 
              spotifyValue={form.watch("spotify")}
              onSpotifyChange={(value) => form.setValue("spotify", value)}
              instagramValue={form.watch("instagram")}
              onInstagramChange={(value) => form.setValue("instagram", value)}
              twitterValue={form.watch("twitter")}
              onTwitterChange={(value) => form.setValue("twitter", value)}
              youtubeValue={form.watch("youtube")}
              onYoutubeChange={(value) => form.setValue("youtube", value)}
              disabled={!!isArchived}
            />
          </CardContent>
          
          <FormActions 
            isEditing={isEditing}
            isArchived={!!isArchived}
            isSaving={isSaving}
            isUploading={isUploading}
            selectedArtist={selectedArtist}
            onDelete={onDelete}
            onArchive={onArchive}
            onRestore={onRestore}
          />
        </form>
      </Form>
    </Card>
  );
};

export default ArtistForm;
