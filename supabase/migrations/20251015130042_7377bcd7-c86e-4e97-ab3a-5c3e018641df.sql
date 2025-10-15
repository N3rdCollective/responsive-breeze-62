-- Create show_submissions table for DJ submissions
CREATE TABLE public.show_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by uuid NOT NULL,
  
  -- Show details
  show_title text NOT NULL,
  show_description text,
  proposed_days text[] NOT NULL,
  proposed_start_time time NOT NULL,
  proposed_end_time time NOT NULL,
  
  -- Episode/recording details
  episode_title text,
  episode_description text,
  audio_file_url text NOT NULL,
  artwork_url text,
  duration_seconds integer,
  
  -- Submission metadata
  submission_notes text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  reviewer_notes text,
  
  -- Download tracking
  downloaded_by uuid,
  downloaded_at timestamp with time zone,
  
  -- Timestamps
  submitted_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.show_submissions ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_show_submissions_status ON public.show_submissions(status);
CREATE INDEX idx_show_submissions_submitted_by ON public.show_submissions(submitted_by);
CREATE INDEX idx_show_submissions_downloaded ON public.show_submissions(downloaded_by, downloaded_at);

-- Add columns to existing shows table
ALTER TABLE public.shows 
ADD COLUMN IF NOT EXISTS created_from_submission_id uuid REFERENCES public.show_submissions(id),
ADD COLUMN IF NOT EXISTS host_id uuid,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create storage bucket for submissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'show-submissions', 
  'show-submissions', 
  false,
  524288000,
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for show_submissions table
CREATE POLICY "Staff can view all submissions" ON public.show_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

CREATE POLICY "Staff can submit shows" ON public.show_submissions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
  AND submitted_by = auth.uid()
  AND status = 'pending'
);

CREATE POLICY "Staff can update own pending submissions" ON public.show_submissions
FOR UPDATE
TO authenticated
USING (
  submitted_by = auth.uid() 
  AND status IN ('pending', 'needs_revision')
)
WITH CHECK (
  submitted_by = auth.uid()
);

CREATE POLICY "Admins can review submissions" ON public.show_submissions
FOR UPDATE
TO authenticated
USING (
  get_user_staff_role_simple(auth.uid()) IN ('admin', 'super_admin')
)
WITH CHECK (
  get_user_staff_role_simple(auth.uid()) IN ('admin', 'super_admin')
);

CREATE POLICY "Admins can delete submissions" ON public.show_submissions
FOR DELETE
TO authenticated
USING (
  get_user_staff_role_simple(auth.uid()) IN ('admin', 'super_admin')
);

-- Storage policies for show-submissions bucket
CREATE POLICY "Staff can upload show submissions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'show-submissions' 
  AND EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Staff can read own submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'show-submissions' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR get_user_staff_role_simple(auth.uid()) IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can read all submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'show-submissions' 
  AND get_user_staff_role_simple(auth.uid()) IN ('admin', 'super_admin')
);

CREATE POLICY "Staff can update own submission files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'show-submissions' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Staff can delete own pending submission files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'show-submissions' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.show_submissions
    WHERE audio_file_url LIKE '%' || name || '%'
    AND submitted_by = auth.uid()
    AND status IN ('pending', 'needs_revision')
  )
);

CREATE POLICY "Admins can delete any submission files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'show-submissions' 
  AND get_user_staff_role_simple(auth.uid()) IN ('admin', 'super_admin')
);

-- Helper function to check if file can be deleted
CREATE OR REPLACE FUNCTION public.can_delete_submission_file(
  submission_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_downloaded_at timestamp with time zone;
  v_user_role text;
BEGIN
  v_user_role := get_user_staff_role_simple(auth.uid());
  
  IF v_user_role IN ('admin', 'super_admin') THEN
    RETURN TRUE;
  END IF;
  
  SELECT downloaded_at INTO v_downloaded_at
  FROM show_submissions
  WHERE id = submission_id;
  
  RETURN v_downloaded_at IS NOT NULL;
END;
$$;

-- Function to approve submission and create show
CREATE OR REPLACE FUNCTION public.approve_submission_and_create_show(
  submission_id uuid,
  reviewer_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_show_id uuid;
  v_submission record;
BEGIN
  IF get_user_staff_role_simple(auth.uid()) NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can approve submissions';
  END IF;
  
  SELECT * INTO v_submission 
  FROM show_submissions 
  WHERE id = submission_id 
  AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or not pending';
  END IF;
  
  INSERT INTO shows (
    title,
    description,
    days,
    start_time,
    end_time,
    host_id,
    artwork_url,
    created_from_submission_id,
    is_active
  ) VALUES (
    v_submission.show_title,
    v_submission.show_description,
    v_submission.proposed_days,
    v_submission.proposed_start_time,
    v_submission.proposed_end_time,
    v_submission.submitted_by,
    v_submission.artwork_url,
    submission_id,
    true
  )
  RETURNING id INTO v_show_id;
  
  UPDATE show_submissions
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    reviewer_notes = reviewer_notes,
    updated_at = NOW()
  WHERE id = submission_id;
  
  RETURN v_show_id;
END;
$$;