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
