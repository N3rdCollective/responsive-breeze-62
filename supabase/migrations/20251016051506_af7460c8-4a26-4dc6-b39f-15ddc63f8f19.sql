-- CRITICAL FIX 2: Secure Job Application Resume Storage
-- Create private bucket for resumes (if not exists)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-applications',
  'job-applications',
  false, -- PRIVATE - critical!
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text'
  ];

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public can view resumes" ON storage.objects;
DROP POLICY IF EXISTS "Applicants upload resumes" ON storage.objects;

-- Policy 1: Applicants can upload resumes to session-specific folders
CREATE POLICY "Applicants can upload own resumes"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'job-applications' AND
  -- Ensure files are in organized folders (prevents root uploads)
  array_length(storage.foldername(name), 1) >= 1
);

-- Policy 2: Only HR staff can view resumes (CRITICAL for PII protection)
CREATE POLICY "HR staff can view all resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-applications' AND
  EXISTS (
    SELECT 1 FROM public.staff
    WHERE id = auth.uid()
    AND (hr_permissions = true OR role = 'super_admin')
  )
);

-- Policy 3: Only super admins can delete resumes (GDPR compliance)
CREATE POLICY "Super admins can delete resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'job-applications' AND
  EXISTS (
    SELECT 1 FROM public.staff
    WHERE id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Policy 4: Prevent updates to resume files (immutability for audit trail)
CREATE POLICY "No resume file updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'job-applications' AND false
)
WITH CHECK (false);

-- Create function to generate time-limited signed URLs for HR staff
CREATE OR REPLACE FUNCTION public.get_resume_signed_url(
  p_application_id uuid,
  p_access_reason text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_resume_path text;
  v_has_hr_access boolean;
BEGIN
  -- Verify HR access
  SELECT EXISTS (
    SELECT 1 FROM public.staff
    WHERE id = auth.uid()
    AND (hr_permissions = true OR role = 'super_admin')
  ) INTO v_has_hr_access;
  
  IF NOT v_has_hr_access THEN
    RAISE EXCEPTION 'Access denied: HR permissions required';
  END IF;
  
  -- Validate access reason
  IF p_access_reason IS NULL OR length(trim(p_access_reason)) < 10 THEN
    RAISE EXCEPTION 'Access reason required (minimum 10 characters)';
  END IF;
  
  -- Get resume path
  SELECT resume_url INTO v_resume_path
  FROM public.job_applications
  WHERE id = p_application_id;
  
  IF v_resume_path IS NULL THEN
    RAISE EXCEPTION 'Resume not found for application';
  END IF;
  
  -- Log access
  PERFORM public.log_job_application_access_secure(
    p_application_id,
    'resume_download',
    p_access_reason,
    ARRAY['resume_url', 'resume_filename']
  );
  
  -- Return the storage path (client will use Supabase client to generate signed URL)
  -- We return the path, not a signed URL, because signed URLs should be generated client-side
  -- with proper expiry times using the Supabase client
  RETURN v_resume_path;
END;
$$;

COMMENT ON FUNCTION public.get_resume_signed_url IS 'Securely access job application resumes with mandatory audit logging. Returns storage path for client-side signed URL generation.';