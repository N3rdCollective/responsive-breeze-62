-- Link existing news posts with their proper author UUIDs

-- Update posts by DJEpidemik
UPDATE public.posts 
SET author = 'ec35cd2b-7e2b-4b2c-973f-7f7669483d3e'
WHERE author_name = 'DJEpidemik' AND author IS NULL;

-- Update posts by Yungdigz (both name variants point to same person)
UPDATE public.posts 
SET author = '1a67f46b-2298-40aa-9a81-b2ef3b9adeeb'
WHERE author_name IN ('Yungdigz', 'yungdigz@gmail.com') AND author IS NULL;

-- Update posts by pauldavon@gmail.com (Carib Mix)
UPDATE public.posts 
SET author = 'a204d012-485c-4abc-9f1c-073060208634'
WHERE author_name = 'pauldavon@gmail.com' AND author IS NULL;

-- Add foreign key constraint to ensure data integrity
ALTER TABLE public.posts 
ADD CONSTRAINT posts_author_fkey 
FOREIGN KEY (author) REFERENCES public.profiles(id) ON DELETE SET NULL;