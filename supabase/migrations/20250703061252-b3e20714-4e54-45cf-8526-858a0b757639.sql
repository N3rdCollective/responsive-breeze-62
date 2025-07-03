-- Insert the Graphic Design Intern job posting
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
  'Graphic Design Intern',
  'Are you a creative student or emerging designer passionate about music and visual storytelling? Join Rappin'' Lounge Radio as we build our brand identity from the ground up!

We''re seeking a talented Graphic Design Intern to help shape our visual presence and create compelling graphics that resonate with our growing community. This is an incredible opportunity to build your portfolio while gaining real-world experience in the music and media industry.

What You''ll Do:
• Design eye-catching social media graphics and promotional content
• Create visual assets for shows, events, and artist features
• Help develop and maintain consistent brand identity across all platforms
• Design web graphics, banners, and digital marketing materials
• Collaborate on merchandise concepts and promotional materials
• Support marketing campaigns with creative visual solutions
• Work with our team to create multimedia content packages

Startup Reality Check:
We''re in our building phase, which means:
• This is primarily a portfolio-building opportunity with potential for revenue sharing as we grow
• Flexible 10-15 hours per week that works around your school schedule
• Creative freedom to help define our visual direction and brand voice
• Mentorship and real-world experience you can''t get in a classroom
• Opportunity to see your designs reach thousands of music lovers
• Potential for ongoing collaboration as we expand our creative team

Ready to Design the Future of Radio?
If you''re excited about creating visuals that connect with music lovers and building a brand from the ground up, we want to see your work!',
  'Requirements:
• Currently pursuing or recently completed degree in Graphic Design, Visual Arts, Marketing, or related field
• Proficiency in Adobe Creative Suite (Photoshop, Illustrator, InDesign required)
• Strong portfolio demonstrating design skills and creativity
• Understanding of social media design best practices and platform specifications
• Passion for music, especially hip-hop, R&B, and urban culture
• Self-motivated with ability to work independently and meet deadlines
• Available for 10-15 hours per week with flexible scheduling
• Strong communication skills and ability to take creative direction

Bonus Points:
• Experience with motion graphics or video editing (After Effects, Premiere Pro)
• Basic web design knowledge (HTML/CSS fundamentals)
• Photography and photo editing skills
• Knowledge of music industry trends and visual culture
• Previous internship, freelance, or volunteer design experience
• Familiarity with brand development and marketing principles

Portfolio Submission Required:
Please include 3-5 design samples that showcase your style and would be appropriate for a community radio station brand.',
  'Remote (with occasional virtual collaboration sessions)',
  'internship',
  'Creative & Marketing',
  'Portfolio Building Opportunity + Revenue Share Potential',
  (SELECT id FROM staff WHERE role IN ('admin', 'super_admin') LIMIT 1)
);