export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision';

export interface ShowSubmission {
  id: string;
  submitted_by: string;
  show_title: string;
  show_description?: string;
  proposed_days: string[];
  proposed_start_time: string;
  proposed_end_time: string;
  episode_title?: string;
  episode_description?: string;
  audio_file_url: string;
  artwork_url?: string;
  duration_seconds?: number;
  submission_notes?: string;
  status: SubmissionStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  downloaded_by?: string;
  downloaded_at?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFormData {
  show_title: string;
  show_description: string;
  proposed_days: string[];
  proposed_start_time: string;
  proposed_end_time: string;
  episode_title: string;
  episode_description: string;
  audio_file: File | null;
  artwork_file: File | null;
  submission_notes: string;
}
