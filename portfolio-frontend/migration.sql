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
  desc TEXT NOT NULL DEFAULT '',
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
  desc TEXT NOT NULL DEFAULT '',
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
CREATE POLICY "Allow public read" ON contacts FOR SELECT USING (true);

-- Insert default profile row
INSERT INTO profile (id, name, title, intro, description, email, location, github, linkedin, twitter, codepen, bio_paragraphs, tech_list)
VALUES (
  1,
  'Samir Anik',
  'Full Stack Engineer',
  'Hello World, I''m',
  'I build highly interactive, responsive, and visually stunning digital products.',
  'samir.anik.dev@gmail.com',
  'Dhaka, Bangladesh',
  'https://github.com',
  'https://linkedin.com',
  'https://twitter.com',
  'https://codepen.io',
  'Hello! I''m Samir, a software engineer with a deep passion for designing interfaces that feel alive.\nToday, I specialize in crafting robust web architectures and clean APIs.',
  'JavaScript (ES6+), React & Next.js, Node.js & Express, Python & Flask, PostgreSQL, GCP'
)
ON CONFLICT (id) DO NOTHING;
