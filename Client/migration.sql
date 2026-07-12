-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)

CREATE TABLE IF NOT EXISTS profile (
  id BIGINT PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  github TEXT NOT NULL DEFAULT '',
  linkedin TEXT NOT NULL DEFAULT '',
  twitter TEXT NOT NULL DEFAULT '',
  codepen TEXT NOT NULL DEFAULT '',
  bio_paragraphs TEXT NOT NULL DEFAULT '',
  tech_list TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS projects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT '',
  "desc" TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  github TEXT NOT NULL DEFAULT '',
  live TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  value INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiences (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  "desc" TEXT NOT NULL DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON profile FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON skills FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON experiences FOR SELECT USING (true);
-- NOTE: Dropped public read on contacts — only accessible via admin API

-- Clear existing records and reset IDENTITY sequences
TRUNCATE TABLE profile, projects, skills, experiences, contacts RESTART IDENTITY CASCADE;

-- Insert default profile row
INSERT INTO profile (id, name, title, intro, description, email, location, github, linkedin, twitter, codepen, bio_paragraphs, tech_list)
VALUES (
  1,
  'MD. TASVE AL SAMIR',
  'Software Engineer',
  'Hello World, I''m',
  'A highly motivated and dedicated Software Engineering student in 8th semester with a perfect CGPA of 4.00 and a consistent record of academic excellence, including multiple Dean''s List Awards. Proficient in a wide range of programming languages and modern technologies, with hands-on experience in developing full-stack applications, AI-based systems, and IoT solutions.',
  'tasvesamir15471@gmail.com',
  'Dhaka, Bangladesh',
  'https://github.com/tasvesamir07',
  'www.linkedin.com/in/tasve-al-samir',
  '#',
  '#',
  'A highly motivated and dedicated Software Engineering student in 8th semester with a perfect CGPA of 4.00 and a consistent record of academic excellence, including multiple Dean''s List Awards.
Proficient in a wide range of programming languages and modern technologies, with hands-on experience in developing full-stack applications, AI-based systems, and IoT solutions.
Seeking to leverage strong problem-solving, creative, and communication skills to contribute to innovative software development projects.',
  'Python, Java, JavaScript, C, SQL, Spring Boot, React, Node.js, TailwindCSS, Git, GitHub, Docker'
);

-- Seed experiences
INSERT INTO experiences (date, title, company, "desc", sort_order) VALUES
('October 2025 – July 2026', 'Web Developer', 'Royal Bengal AI', 'Designed the frontend and backend of a post-scheduler website, realizing a 9% performance improvement by optimizing PostgreSQL queries and implementing React lazy loading.
Introduced an Employee Management System for the company to track the work status.
Led frontend architecture decisions across 3 major internal projects, collaborating with cross-functional teams.', 1),
('May 2025 – September 2025', 'Content Writer Intern', 'Privatune', 'Designed Book layout and diagram for readers, increasing 11% design improvement.
Authored engaging and informative content related to academics.', 2);

-- Seed skills
INSERT INTO skills (category, name, value, sort_order) VALUES
('Programming Languages', 'Python', 90, 1),
('Programming Languages', 'Java', 85, 2),
('Programming Languages', 'JavaScript', 90, 3),
('Programming Languages', 'C', 80, 4),
('Programming Languages', 'SQL', 88, 5),
('Frameworks & Libraries', 'React', 92, 6),
('Frameworks & Libraries', 'Node.js', 90, 7),
('Frameworks & Libraries', 'Spring Boot', 85, 8),
('Frameworks & Libraries', 'TailwindCSS', 95, 9),
('Developer Tools', 'Git', 90, 10),
('Developer Tools', 'GitHub', 95, 11),
('Developer Tools', 'Docker', 80, 12),
('Design & Documentation', 'Adobe Photoshop', 85, 13),
('Design & Documentation', 'Adobe Illustrator', 80, 14),
('Design & Documentation', 'Canva', 90, 15),
('Design & Documentation', 'Microsoft Office Suite', 85, 16);

-- Seed projects
INSERT INTO projects (title, category, tag, "desc", tags, github, live, image, sort_order) VALUES
('Certificate Studio', 'fullstack', 'Featured', 'Engineered a dynamic web application that automates bulk certificate generation and secure, high-volume email distribution. Designed a responsive, intuitive frontend user interface paired with a robust backend service to streamline administrative academic workflows.', 'JavaScript, Node.js, React, TailwindCSS', 'https://github.com/tasvesamir07', '#', '', 1),
('Prachar AI', 'ai', 'AI Powered', 'Developed a robust application to automate and schedule posts across multiple social media platforms, improving content strategy and user engagement.', 'JavaScript, Node.js, React, Social Media APIs', 'https://github.com/tasvesamir07', '#', '', 2),
('Face Recognition Attendance System', 'iot', 'Computer Vision', 'Engineered an automated attendance system using facial recognition technology to ensure accurate and efficient tracking.', 'Python, OpenCV, ESP32-cam', 'https://github.com/tasvesamir07', '#', '', 3),
('OBE Assistant', 'ai', 'AI Assistant', 'Developed an AI-powered assistant to streamline and support Outcome-Based Education (OBE) processes, enhancing administrative efficiency.', 'Python, ESP32-cam, Gemini API', 'https://github.com/tasvesamir07', '#', '', 4);
