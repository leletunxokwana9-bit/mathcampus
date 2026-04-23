-- ============================================================
-- MathCampus — PostgreSQL Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

BEGIN;

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- full-text search

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255),
  google_id       VARCHAR(100) UNIQUE,
  avatar          TEXT,
  role            VARCHAR(20) NOT NULL DEFAULT 'student'
                    CHECK (role IN ('student', 'tutor', 'admin')),
  xp              INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ── Campuses ──────────────────────────────────────────────────
CREATE TABLE campuses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           VARCHAR(200) NOT NULL,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  icon            VARCHAR(10) NOT NULL DEFAULT '📚',
  color           VARCHAR(20) NOT NULL DEFAULT '#00D4FF',
  tag             VARCHAR(30) NOT NULL DEFAULT 'Core',
  tag_color       VARCHAR(20) NOT NULL DEFAULT '#00D4FF',
  description     TEXT,
  difficulty      VARCHAR(20) NOT NULL DEFAULT 'Medium'
                    CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  estimated_hours INT NOT NULL DEFAULT 20,
  rating          NUMERIC(3,1) NOT NULL DEFAULT 4.5,
  student_count   INT NOT NULL DEFAULT 0,
  sort_order      INT NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campuses_slug      ON campuses(slug);
CREATE INDEX idx_campuses_published ON campuses(is_published);

-- ── Campus Topics (sub-topics list shown on campus page) ──────
CREATE TABLE campus_topics (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id   UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_campus_topics_campus ON campus_topics(campus_id);

-- ── Enrollments ───────────────────────────────────────────────
CREATE TABLE enrollments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campus_id     UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  progress_pct  INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, campus_id)
);

CREATE INDEX idx_enrollments_user   ON enrollments(user_id);
CREATE INDEX idx_enrollments_campus ON enrollments(campus_id);

-- ── Lessons ───────────────────────────────────────────────────
CREATE TABLE lessons (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id        UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  title            VARCHAR(300) NOT NULL,
  type             VARCHAR(20) NOT NULL DEFAULT 'video'
                     CHECK (type IN ('video', 'quiz', 'notes', 'pdf')),
  video_url        TEXT,
  video_provider   VARCHAR(20) DEFAULT 'youtube'
                     CHECK (video_provider IN ('youtube', 'vimeo', 's3')),
  notes_content    TEXT,
  duration_minutes INT NOT NULL DEFAULT 15,
  sort_order       INT NOT NULL DEFAULT 0,
  is_premium       BOOLEAN NOT NULL DEFAULT false,
  is_published     BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_campus    ON lessons(campus_id);
CREATE INDEX idx_lessons_published ON lessons(is_published);

-- ── Lesson Completions ────────────────────────────────────────
CREATE TABLE lesson_completions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_comp_user   ON lesson_completions(user_id);
CREATE INDEX idx_lesson_comp_lesson ON lesson_completions(lesson_id);

-- ── Quizzes ───────────────────────────────────────────────────
CREATE TABLE quizzes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id    UUID REFERENCES campuses(id) ON DELETE CASCADE,
  lesson_id    UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title        VARCHAR(300) NOT NULL,
  description  TEXT,
  pass_mark    INT NOT NULL DEFAULT 60,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quizzes_campus ON quizzes(campus_id);

-- ── Quiz Questions ────────────────────────────────────────────
CREATE TABLE quiz_questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id       UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  options       JSONB NOT NULL,      -- ["option A", "option B", ...]
  correct_index INT NOT NULL,
  explanation   TEXT,
  difficulty    VARCHAR(20) DEFAULT 'Medium'
                  CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  sort_order    INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);

-- ── Quiz Attempts ─────────────────────────────────────────────
CREATE TABLE quiz_attempts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id    UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  answers    JSONB NOT NULL,
  score      INT NOT NULL,
  total      INT NOT NULL,
  score_pct  INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);

-- ── Resources ─────────────────────────────────────────────────
CREATE TABLE resources (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id      UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  title          VARCHAR(300) NOT NULL,
  type           VARCHAR(20) NOT NULL DEFAULT 'PDF'
                   CHECK (type IN ('PDF', 'DOCX', 'VIDEO', 'LINK')),
  file_url       TEXT,
  file_size      VARCHAR(20),
  download_count INT NOT NULL DEFAULT 0,
  is_premium     BOOLEAN NOT NULL DEFAULT false,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resources_campus ON resources(campus_id);

-- ── Discussion Posts ──────────────────────────────────────────
CREATE TABLE posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id   UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  likes_count INT NOT NULL DEFAULT 0,
  is_solved   BOOLEAN NOT NULL DEFAULT false,
  is_pinned   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_campus     ON posts(campus_id);
CREATE INDEX idx_posts_user       ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Full-text search on posts
CREATE INDEX idx_posts_content_fts ON posts USING GIN (to_tsvector('english', content));

-- ── Post Replies ──────────────────────────────────────────────
CREATE TABLE post_replies (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_replies_post ON post_replies(post_id);

-- ── Post Likes ────────────────────────────────────────────────
CREATE TABLE post_likes (
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

-- ── Activity Log ──────────────────────────────────────────────
CREATE TABLE activity_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_user       ON activity_log(user_id);
CREATE INDEX idx_activity_created_at ON activity_log(created_at DESC);

-- ── User Streaks ──────────────────────────────────────────────
CREATE TABLE user_streaks (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak      INT NOT NULL DEFAULT 0,
  best_streak         INT NOT NULL DEFAULT 0,
  last_activity_date  DATE
);

-- ── User Badges ───────────────────────────────────────────────
CREATE TABLE user_badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_label VARCHAR(100) NOT NULL,
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_label)
);

CREATE INDEX idx_badges_user ON user_badges(user_id);

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(user_id);

-- ── Updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at     BEFORE UPDATE ON users     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER campuses_updated_at  BEFORE UPDATE ON campuses  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER lessons_updated_at   BEFORE UPDATE ON lessons   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER posts_updated_at     BEFORE UPDATE ON posts     FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
