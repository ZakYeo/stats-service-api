DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS courses (
  course_id UUID PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id UUID PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id),
  total_modules INTEGER NOT NULL,
  average_score FLOAT NOT NULL,
  time_studied INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
-- Insert sample users
INSERT INTO users (user_id) VALUES 
('e8df5aae-870e-46d7-a62b-57b8c6a129a2'),
('d3b07384-d9a1-4e21-bd7f-662b933ad1af'),
('123e4567-e89b-12d3-a456-426614174000');

-- Insert sample courses
INSERT INTO courses (course_id) VALUES 
('c0a80102-0000-0000-0000-000000000001'),
('c0a80102-0000-0000-0000-000000000002'),
('7baaeaa2-07c3-49b6-a57e-59b07d86e137');