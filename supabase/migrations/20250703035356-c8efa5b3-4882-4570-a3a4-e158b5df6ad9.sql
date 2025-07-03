-- Create job_postings table
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT,
  employment_type TEXT NOT NULL DEFAULT 'full-time',
  department TEXT,
  salary_range TEXT,
  posted_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  application_deadline TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_filename TEXT,
  resume_url TEXT,
  cover_letter TEXT NOT NULL,
  application_status TEXT NOT NULL DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_postings
CREATE POLICY "Public can view active job postings" 
ON public.job_postings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Staff can manage job postings" 
ON public.job_postings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM staff 
  WHERE staff.id = auth.uid() 
  AND staff.role IN ('admin', 'super_admin')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM staff 
  WHERE staff.id = auth.uid() 
  AND staff.role IN ('admin', 'super_admin')
));

-- RLS Policies for job_applications
CREATE POLICY "Anyone can submit job applications" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Staff can view all job applications" 
ON public.job_applications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM staff 
  WHERE staff.id = auth.uid() 
  AND staff.role IN ('admin', 'super_admin')
));

CREATE POLICY "Staff can update job applications" 
ON public.job_applications 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM staff 
  WHERE staff.id = auth.uid() 
  AND staff.role IN ('admin', 'super_admin')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM staff 
  WHERE staff.id = auth.uid() 
  AND staff.role IN ('admin', 'super_admin')
));

-- Create indexes for better performance
CREATE INDEX idx_job_postings_active ON public.job_postings(is_active);
CREATE INDEX idx_job_postings_posted_date ON public.job_postings(posted_date DESC);
CREATE INDEX idx_job_applications_job_posting_id ON public.job_applications(job_posting_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(application_status);

-- Create updated_at triggers
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();