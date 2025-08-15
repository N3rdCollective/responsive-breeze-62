-- Fix security vulnerability: Remove public access to pending_staff table
-- and restrict access to only appropriate staff members

-- First, drop the overly permissive policy that allows anyone to read pending_staff
DROP POLICY IF EXISTS "Anyone can read pending_staff" ON public.pending_staff;

-- Create a more restrictive policy that only allows admin/super_admin staff to view pending staff
CREATE POLICY "Only admin staff can view pending staff applications" 
ON public.pending_staff 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.id = auth.uid() 
    AND staff.role IN ('admin', 'super_admin')
  )
);

-- Allow users to view their own pending application status (optional - only if this functionality is needed)
-- This allows someone to check if their email is in the pending list
CREATE POLICY "Users can view their own pending staff status" 
ON public.pending_staff 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

-- Update the insertion policy to be more specific about staff requests
-- Remove the old policy and create a more specific one
DROP POLICY IF EXISTS "Allow pending staff requests from unauthenticated users" ON public.pending_staff;

-- Allow unauthenticated users to submit staff applications with 'requested' status
CREATE POLICY "Allow public staff applications" 
ON public.pending_staff 
FOR INSERT 
WITH CHECK (
  status = 'requested' 
  AND invited_at IS NULL  -- Ensure this is a new request, not an invitation
);