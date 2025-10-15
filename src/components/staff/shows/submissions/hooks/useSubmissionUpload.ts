import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubmissionFormData } from "../../types";

export const useSubmissionUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadAudioFile = async (file: File, userId: string, submissionId: string) => {
    const filePath = `${userId}/${submissionId}/audio.mp3`;
    
    const { data, error } = await supabase.storage
      .from('show-submissions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('show-submissions')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const uploadArtwork = async (file: File, userId: string, submissionId: string) => {
    const filePath = `${userId}/${submissionId}/artwork.jpg`;
    
    const { data, error } = await supabase.storage
      .from('show-submissions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('show-submissions')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const submitShow = async (formData: SubmissionFormData, userId: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create submission record first to get ID
      const { data: submission, error: submitError } = await supabase
        .from('show_submissions')
        .insert({
          submitted_by: userId,
          show_title: formData.show_title,
          show_description: formData.show_description,
          proposed_days: formData.proposed_days,
          proposed_start_time: formData.proposed_start_time,
          proposed_end_time: formData.proposed_end_time,
          episode_title: formData.episode_title,
          episode_description: formData.episode_description,
          submission_notes: formData.submission_notes,
          audio_file_url: '', // Temporary, will update after upload
          status: 'pending'
        })
        .select()
        .single();

      if (submitError) throw submitError;
      
      setUploadProgress(20);

      // Upload audio file
      if (!formData.audio_file) throw new Error('Audio file is required');
      
      const audioUrl = await uploadAudioFile(formData.audio_file, userId, submission.id);
      setUploadProgress(60);

      // Upload artwork if provided
      let artworkUrl = null;
      if (formData.artwork_file) {
        artworkUrl = await uploadArtwork(formData.artwork_file, userId, submission.id);
        setUploadProgress(80);
      }

      // Update submission with file URLs
      const { error: updateError } = await supabase
        .from('show_submissions')
        .update({
          audio_file_url: audioUrl,
          artwork_url: artworkUrl
        })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      setUploadProgress(100);

      toast({
        title: "Submission successful!",
        description: "Your show has been submitted for review.",
      });

      return submission.id;
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit show. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    submitShow,
    isUploading,
    uploadProgress
  };
};
