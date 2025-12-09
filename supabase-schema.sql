-- ════════════════════════════════════════════════════════════════════
-- ALTERFOCUS MVP - DATABASE SCHEMA
-- ════════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- Project → SQL Editor → New Query → Paste & Run
-- ════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ════════════════════════════════════════════
-- TABLE 1: User Profiles
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  light_minutes INTEGER DEFAULT 0,
  base_level INTEGER DEFAULT 1,
  total_sessions INTEGER DEFAULT 0,
  first_time BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ════════════════════════════════════════════
-- TABLE 2: Student Schedule (Clases, Entregas, Exámenes)
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS student_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  event_title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  professor_name VARCHAR(255),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  type VARCHAR(50) CHECK (type IN ('clase', 'entrega', 'examen', 'estudio', 'descanso')),
  priority VARCHAR(20) CHECK (priority IN ('rojo', 'amarillo', 'verde')),
  source VARCHAR(50) CHECK (source IN ('outlook', 'brightspace', 'manual', 'google', 'upload')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  course_code VARCHAR(50),
  course_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_schedule_user ON student_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_student_schedule_date ON student_schedule(start_time);
CREATE INDEX IF NOT EXISTS idx_student_schedule_type ON student_schedule(type);
CREATE INDEX IF NOT EXISTS idx_student_schedule_priority ON student_schedule(priority);

-- ════════════════════════════════════════════
-- TABLE 3: Sessions (Focus sessions recorded)
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('flipphone', 'deepfocus', 'breathing', 'offline', 'pomodoro', 'community')),
  duration INTEGER NOT NULL,
  light_earned INTEGER NOT NULL,
  context TEXT,
  emoji VARCHAR(10),
  tags JSONB DEFAULT '[]',
  focus_score INTEGER,
  distractions_blocked INTEGER,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(session_type);

-- ════════════════════════════════════════════
-- TABLE 4: User Preferences
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  peak_procrastination_hour INTEGER,
  peak_procrastination_day VARCHAR(20),
  top_distractions JSONB DEFAULT '[]',
  weekly_goal TEXT,
  preferred_session_type VARCHAR(50),
  do_not_disturb_hours JSONB DEFAULT '{"start": 22, "end": 6}',
  outlook_token TEXT,
  brightspace_token TEXT,
  google_token TEXT,
  notification_enabled BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ════════════════════════════════════════════
-- TABLE 5: Daily Statistics
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  stat_date DATE NOT NULL,
  total_focus_time INTEGER DEFAULT 0,
  sessions_completed INTEGER DEFAULT 0,
  light_earned INTEGER DEFAULT 0,
  distractions_count INTEGER DEFAULT 0,
  focus_quality INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, stat_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_stats_unique ON daily_stats(user_id, stat_date);

-- ════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can view own schedule" ON student_schedule
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own schedule" ON student_schedule
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own schedule" ON student_schedule
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own schedule" ON student_schedule
  FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own stats" ON daily_stats
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own stats" ON daily_stats
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own stats" ON daily_stats
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- ════════════════════════════════════════════
-- FUNCTIONS
-- ════════════════════════════════════════════

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_schedule_updated_at
  BEFORE UPDATE ON student_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ════════════════════════════════════════════
-- TABLE 6: Community Virtual Rooms
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS community_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR(20) CHECK (category IN ('focus', 'topic')) DEFAULT 'focus',
  name VARCHAR(255) NOT NULL,
  topic VARCHAR(255),
  max_participants INTEGER DEFAULT 10 CHECK (max_participants >= 1 AND max_participants <= 100),
  platform VARCHAR(20) CHECK (platform IN ('Teams', 'Meet', 'Zoom', 'Discord')) DEFAULT 'Meet',
  link TEXT NOT NULL,
  is_live BOOLEAN DEFAULT true,
  duration_minutes INTEGER DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_rooms_live ON community_rooms(is_live);
CREATE INDEX IF NOT EXISTS idx_community_rooms_host ON community_rooms(host_id);

-- ════════════════════════════════════════════
-- TABLE 7: Community Room Participants
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS community_room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES community_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_participants_room ON community_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user ON community_room_participants(user_id);

-- ════════════════════════════════════════════
-- TABLE 8: Community Physical Sessions
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS community_physical_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR(20) CHECK (category IN ('focus', 'topic')) DEFAULT 'focus',
  name VARCHAR(255) NOT NULL,
  topic VARCHAR(255),
  location_name VARCHAR(255) NOT NULL,
  address TEXT,
  map_link TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  max_participants INTEGER DEFAULT 5 CHECK (max_participants >= 1 AND max_participants <= 20),
  amenities JSONB DEFAULT '[]',
  edit_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_physical_sessions_active ON community_physical_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_physical_sessions_host ON community_physical_sessions(host_id);

-- ════════════════════════════════════════════
-- TABLE 9: Physical Session Participants
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS physical_session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES community_physical_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed BOOLEAN DEFAULT false,
  UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_physical_participants_session ON physical_session_participants(session_id);

-- ════════════════════════════════════════════
-- RLS FOR COMMUNITY TABLES
-- ════════════════════════════════════════════

ALTER TABLE community_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_physical_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_session_participants ENABLE ROW LEVEL SECURITY;

-- Community Rooms: Everyone can view, only host can modify
CREATE POLICY "Anyone can view live rooms" ON community_rooms
  FOR SELECT USING (is_live = true);

CREATE POLICY "Host can manage own rooms" ON community_rooms
  FOR ALL USING (auth.uid()::text = host_id::text);

-- Room Participants: Users can join/leave rooms
CREATE POLICY "Anyone can view participants" ON community_room_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join rooms" ON community_room_participants
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can leave rooms" ON community_room_participants
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Physical Sessions: Everyone can view, only host can modify
CREATE POLICY "Anyone can view active sessions" ON community_physical_sessions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Host can manage own sessions" ON community_physical_sessions
  FOR ALL USING (auth.uid()::text = host_id::text);

-- Physical Participants: Users can join/leave
CREATE POLICY "Anyone can view physical participants" ON physical_session_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join physical sessions" ON physical_session_participants
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can leave physical sessions" ON physical_session_participants
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- ════════════════════════════════════════════
-- TRIGGERS FOR COMMUNITY TABLES
-- ════════════════════════════════════════════

CREATE TRIGGER update_community_rooms_updated_at
  BEFORE UPDATE ON community_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_physical_sessions_updated_at
  BEFORE UPDATE ON community_physical_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ════════════════════════════════════════════
-- VIEWS FOR EASY QUERYING
-- ════════════════════════════════════════════

-- View: Rooms with participant count
CREATE OR REPLACE VIEW community_rooms_with_count AS
SELECT 
  cr.*,
  COALESCE(COUNT(crp.id), 0) as participant_count,
  up.display_name as host_name
FROM community_rooms cr
LEFT JOIN community_room_participants crp ON cr.id = crp.room_id AND crp.left_at IS NULL
LEFT JOIN user_profiles up ON cr.host_id = up.id
WHERE cr.is_live = true
GROUP BY cr.id, up.display_name;

-- View: Physical sessions with participant count
CREATE OR REPLACE VIEW physical_sessions_with_count AS
SELECT 
  cps.*,
  COALESCE(COUNT(psp.id), 0) as participant_count,
  up.display_name as host_name
FROM community_physical_sessions cps
LEFT JOIN physical_session_participants psp ON cps.id = psp.session_id
LEFT JOIN user_profiles up ON cps.host_id = up.id
WHERE cps.is_active = true
GROUP BY cps.id, up.display_name;

-- ════════════════════════════════════════════
-- SEED DATA (Optional - for testing)
-- ════════════════════════════════════════════

-- Uncomment to add test data:
/*
INSERT INTO user_profiles (id, email, display_name, light_minutes, total_sessions)
VALUES (
  'test-user-id',
  'test@uninorte.edu.co',
  'Estudiante Test',
  120,
  5
);

INSERT INTO student_schedule (user_id, event_title, start_time, end_time, type, priority, source)
VALUES
  ('test-user-id', 'Cálculo II', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '4 hours', 'clase', 'verde', 'manual'),
  ('test-user-id', 'Entrega Proyecto Final', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day', 'entrega', 'rojo', 'manual'),
  ('test-user-id', 'Parcial de Física', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days', 'examen', 'amarillo', 'manual');
*/

-- ════════════════════════════════════════════
-- DONE! ✅
-- ════════════════════════════════════════════
-- Your AlterFocus database is ready.
-- Next steps:
-- 1. Copy your Supabase URL and anon key to .env.local
-- 2. Run npm run dev
-- 3. Start using AlterFocus!
