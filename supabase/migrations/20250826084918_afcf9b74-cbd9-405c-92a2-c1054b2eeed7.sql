-- Add a dummy test post to verify the news system is working
INSERT INTO public.posts (
  title,
  content,
  excerpt,
  status,
  category,
  author_name,
  post_date,
  tags,
  featured_image
) VALUES (
  'Test News Post - System Check',
  '<p>This is a test news post to verify that the news system is working correctly.</p><p>If you can see this post in the news section, then the system is functioning properly!</p>',
  'This is a test news post to verify that the news system is working correctly.',
  'published',
  'Announcement',
  'System Admin',
  NOW(),
  ARRAY['test', 'system', 'announcement'],
  NULL
);