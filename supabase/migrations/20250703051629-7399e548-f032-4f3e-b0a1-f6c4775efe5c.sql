-- Insert the blogger job posting
INSERT INTO public.job_postings (
  title,
  description,
  requirements,
  location,
  employment_type,
  department,
  salary_range,
  created_by
) VALUES (
  'Content Writer & Blogger',
  'Are you passionate about music, community, and storytelling? Join Rappin'' Lounge Radio in our exciting startup phase as we build something special together!

We''re looking for a creative Content Writer & Blogger to help us craft compelling stories, engage our growing community, and establish our voice in the digital space. This is a unique opportunity to be part of a radio station''s journey from the ground up.

What You''ll Do:
• Create engaging blog content about music, artists, and community events
• Write artist spotlights and interview features
• Develop social media content that resonates with our audience
• Cover live shows and community events
• Help shape our brand voice and content strategy
• Collaborate with our team to create multimedia content

Startup Reality Check:
We''re in our building phase, which means:
• Compensation starts with revenue sharing as we grow our listener base and sponsorships
• Equity opportunities available for committed team members
• Flexible schedule that works around your current commitments
• Real opportunity to grow with us - as we succeed, you succeed
• Creative freedom to help define our content direction

Ready to Build Something Great Together?
If you''re excited about the opportunity to help build a radio station from the ground up and grow with us as we establish our place in the community, we''d love to hear from you!',
  'Requirements:
• Strong passion for music and community radio
• Excellent writing and storytelling skills
• Experience with blogging platforms and social media
• Basic understanding of SEO and content marketing
• Self-motivated and able to work independently
• Available for 10-15 hours per week initially
• Comfortable with our startup approach to compensation

Bonus Points:
• Experience in music journalism or entertainment writing
• Knowledge of hip-hop, R&B, and urban music culture
• Basic photo/video editing skills
• Understanding of radio/broadcasting industry',
  'Remote (with occasional on-site collaboration)',
  'part-time',
  'Content & Digital Media',
  'Revenue Share + Growth Equity (Building together as we grow)',
  (SELECT id FROM staff WHERE role IN ('admin', 'super_admin') LIMIT 1)
);