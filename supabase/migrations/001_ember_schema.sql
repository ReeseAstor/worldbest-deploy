-- Ember Database Schema Migration
-- Creates core tables for the romantasy ghostwriting platform

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  pen_name TEXT,
  bio TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'spark', 'flame', 'inferno')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS (Books/Series)
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  genre TEXT DEFAULT 'romantasy',
  subgenres TEXT[] DEFAULT '{}',
  tropes TEXT[] DEFAULT '{}',
  steam_level INTEGER DEFAULT 3 CHECK (steam_level BETWEEN 1 AND 5),
  target_word_count INTEGER DEFAULT 80000,
  current_word_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'drafting' CHECK (status IN ('planning', 'drafting', 'editing', 'complete', 'published')),
  series_name TEXT,
  series_number INTEGER,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);

-- ============================================
-- CHAPTERS
-- ============================================

CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  content TEXT DEFAULT '',
  content_html TEXT DEFAULT '',
  word_count INTEGER DEFAULT 0,
  summary TEXT,
  pov_character_id UUID,
  status TEXT DEFAULT 'draft' CHECK (status IN ('outline', 'draft', 'revision', 'complete')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, chapter_number)
);

CREATE INDEX idx_chapters_project_id ON chapters(project_id);

-- ============================================
-- SERIES BIBLE: CHARACTERS
-- ============================================

CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'supporting' CHECK (role IN ('FMC', 'MMC', 'love-interest', 'rival', 'best-friend', 'antagonist', 'supporting')),
  
  -- Basic Info
  age TEXT,
  occupation TEXT,
  physical_description TEXT,
  
  -- Personality
  personality_traits TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  flaws TEXT[] DEFAULT '{}',
  fears TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  
  -- Speech & Voice
  speech_patterns JSONB DEFAULT '{}',
  -- Structure: { sentenceStyle, vocabularyLevel, commonPhrases[], avoidedWords[], dialectMarkers[], emotionalRange }
  
  -- Romance Attributes
  romance_attributes JSONB DEFAULT '{}',
  -- Structure: { loveLanguage, attachmentStyle, relationshipBaggage[], dealbreakers[] }
  
  -- Backstory
  backstory TEXT,
  secrets TEXT[] DEFAULT '{}',
  
  -- POV Notes (for when writing from this character's POV)
  pov_notes TEXT,
  internal_voice_sample TEXT,
  
  -- Media
  image_url TEXT,
  
  -- Vector embedding for semantic search
  embedding vector(1536),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_characters_project_id ON characters(project_id);
CREATE INDEX idx_characters_embedding ON characters USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================
-- SERIES BIBLE: RELATIONSHIPS
-- ============================================

CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  character1_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  character2_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('romantic', 'tension', 'adversarial', 'familial', 'alliance', 'friendship')),
  
  -- Romance-specific fields
  romance_stage TEXT CHECK (romance_stage IN ('strangers', 'enemies', 'acquaintances', 'tension', 'attraction', 'denial', 'first-kiss', 'exploration', 'commitment', 'conflict', 'separation', 'reconciliation', 'hea')),
  
  description TEXT,
  dynamics TEXT,
  tension_points TEXT[] DEFAULT '{}',
  history TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate relationships
  CONSTRAINT unique_relationship UNIQUE (project_id, character1_id, character2_id)
);

CREATE INDEX idx_relationships_project_id ON relationships(project_id);

-- ============================================
-- SERIES BIBLE: LOCATIONS/WORLD
-- ============================================

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_type TEXT DEFAULT 'place' CHECK (location_type IN ('realm', 'kingdom', 'city', 'building', 'place', 'other')),
  description TEXT,
  atmosphere TEXT,
  sensory_details JSONB DEFAULT '{}',
  -- Structure: { sights[], sounds[], smells[], textures[] }
  
  significance TEXT,
  connected_characters UUID[] DEFAULT '{}',
  
  -- For fantasy settings
  magic_rules TEXT,
  cultural_notes TEXT,
  
  embedding vector(1536),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_locations_project_id ON locations(project_id);

-- ============================================
-- SERIES BIBLE: TIMELINE EVENTS
-- ============================================

CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  event_name TEXT NOT NULL,
  description TEXT,
  event_date TEXT, -- Flexible date format for fantasy calendars
  event_order INTEGER, -- For ordering events
  
  -- References
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  involved_characters UUID[] DEFAULT '{}',
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  
  -- Categorization
  event_type TEXT CHECK (event_type IN ('backstory', 'plot', 'romance', 'conflict', 'resolution')),
  significance TEXT CHECK (significance IN ('minor', 'moderate', 'major', 'climactic')),
  
  embedding vector(1536),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_events_project_id ON timeline_events(project_id);

-- ============================================
-- CONTINUITY RULES
-- ============================================

CREATE TABLE IF NOT EXISTS continuity_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  rule_text TEXT NOT NULL,
  category TEXT CHECK (category IN ('character', 'world', 'magic', 'relationship', 'timeline', 'other')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('critical', 'high', 'normal', 'low')),
  
  -- What this rule references
  related_entity_type TEXT,
  related_entity_id UUID,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_continuity_rules_project_id ON continuity_rules(project_id);

-- ============================================
-- BEAT SHEETS
-- ============================================

CREATE TABLE IF NOT EXISTS beat_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  template_type TEXT DEFAULT 'custom' CHECK (template_type IN ('romancing-the-beat', 'save-the-cat-romance', 'dark-romance-arc', 'epic-fantasy-romance', 'custom')),
  name TEXT NOT NULL,
  description TEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_sheet_id UUID NOT NULL REFERENCES beat_sheets(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  beat_type TEXT NOT NULL CHECK (beat_type IN ('setup', 'meet-cute', 'first-spark', 'resistance', 'deepening', 'first-kiss', 'false-victory', 'black-moment', 'grand-gesture', 'hea', 'custom')),
  description TEXT,
  
  beat_order INTEGER NOT NULL,
  target_word_count INTEGER,
  actual_word_count INTEGER DEFAULT 0,
  
  -- Linking to chapters
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  scene_reference TEXT,
  
  emotional_goal TEXT,
  steam_level INTEGER CHECK (steam_level BETWEEN 1 AND 5),
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'drafting', 'complete')),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_beats_beat_sheet_id ON beats(beat_sheet_id);

-- ============================================
-- VOICE PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS voice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  name TEXT DEFAULT 'Default Voice',
  
  -- Quantified metrics
  metrics JSONB NOT NULL DEFAULT '{}',
  -- Structure: { avgSentenceLength, avgParagraphLength, dialogueToNarrationRatio, contractionFrequency, passiveVoicePercentage, metaphorDensity, adverbUsage, showVsTellRatio }
  
  -- Patterns
  patterns JSONB NOT NULL DEFAULT '{}',
  -- Structure: { commonPhrases[], avoidedWords[], signatureStyles[], dialogueTags[], povDepthPreference }
  
  -- Prompt constraints
  prompt_constraints JSONB DEFAULT '{}',
  
  -- Analysis metadata
  sample_word_count INTEGER DEFAULT 0,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  deviation_threshold INTEGER DEFAULT 15,
  
  last_analyzed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_profiles_project_id ON voice_profiles(project_id);

-- ============================================
-- STEAM SETTINGS (Per Project)
-- ============================================

CREATE TABLE IF NOT EXISTS steam_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  level INTEGER NOT NULL DEFAULT 3 CHECK (level BETWEEN 1 AND 5),
  
  -- Vocabulary constraints
  vocabulary_allowed TEXT[] DEFAULT '{}',
  vocabulary_forbidden TEXT[] DEFAULT '{}',
  
  -- Scene guidelines
  explicitness TEXT DEFAULT 'moderate' CHECK (explicitness IN ('fade-to-black', 'suggestive', 'moderate', 'explicit', 'graphic')),
  emotion_focus INTEGER DEFAULT 60 CHECK (emotion_focus BETWEEN 0 AND 100),
  
  -- Custom modifiers for prompts
  custom_guidelines TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_id)
);

-- ============================================
-- AI GENERATION HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  task_type TEXT NOT NULL CHECK (task_type IN ('creative-drafting', 'steam-scene', 'dialogue', 'line-editing', 'developmental-edit', 'beat-advance')),
  
  -- Input context
  prompt_used TEXT,
  context_tokens INTEGER,
  
  -- Output
  generated_text TEXT,
  output_tokens INTEGER,
  
  -- Quality metrics
  voice_deviation_score NUMERIC(5,2),
  was_accepted BOOLEAN,
  user_edits TEXT,
  
  -- Model info
  model_used TEXT,
  generation_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_generations_project_id ON ai_generations(project_id);
CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);

-- ============================================
-- SUBSCRIPTIONS & BILLING
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  
  tier TEXT NOT NULL CHECK (tier IN ('free', 'spark', 'flame', 'inferno')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  
  -- Limits
  monthly_ai_words_limit INTEGER DEFAULT 0,
  monthly_ai_words_used INTEGER DEFAULT 0,
  projects_limit INTEGER DEFAULT 1,
  
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE continuity_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE steam_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Project policies
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Chapter policies (via project ownership)
CREATE POLICY "Users can manage own chapters" ON chapters FOR ALL 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = chapters.project_id AND projects.user_id = auth.uid()));

-- Character policies
CREATE POLICY "Users can manage own characters" ON characters FOR ALL 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = characters.project_id AND projects.user_id = auth.uid()));

-- Relationship policies
CREATE POLICY "Users can manage own relationships" ON relationships FOR ALL 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = relationships.project_id AND projects.user_id = auth.uid()));

-- Location policies
CREATE POLICY "Users can manage own locations" ON locations FOR ALL 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = locations.project_id AND projects.user_id = auth.uid()));

-- Timeline policies
CREATE POLICY "Users can manage own timeline events" ON timeline_events FOR ALL 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = timeline_events.project_id AND projects.user_id = auth.uid()));

-- Continuity rules policies
CREATE POLICY "Users can manage own continuity rules" ON continuity_rules FOR ALL 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = continuity_rules.project_id AND projects.user_id = auth.uid()));

-- Beat sheet policies
CREATE POLICY "Users can manage own beat sheets" ON beat_sheets FOR ALL 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = beat_sheets.project_id AND projects.user_id = auth.uid()));

-- Beats policies
CREATE POLICY "Users can manage own beats" ON beats FOR ALL 
  USING (EXISTS (SELECT 1 FROM beat_sheets WHERE beat_sheets.id = beats.beat_sheet_id 
    AND EXISTS (SELECT 1 FROM projects WHERE projects.id = beat_sheets.project_id AND projects.user_id = auth.uid())));

-- Voice profile policies
CREATE POLICY "Users can manage own voice profiles" ON voice_profiles FOR ALL 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = voice_profiles.project_id AND projects.user_id = auth.uid()));

-- Steam settings policies
CREATE POLICY "Users can manage own steam settings" ON steam_settings FOR ALL 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = steam_settings.project_id AND projects.user_id = auth.uid()));

-- AI generations policies
CREATE POLICY "Users can view own AI generations" ON ai_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create AI generations" ON ai_generations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscription policies
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timeline_events_updated_at BEFORE UPDATE ON timeline_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_continuity_rules_updated_at BEFORE UPDATE ON continuity_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_beat_sheets_updated_at BEFORE UPDATE ON beat_sheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_beats_updated_at BEFORE UPDATE ON beats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voice_profiles_updated_at BEFORE UPDATE ON voice_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_steam_settings_updated_at BEFORE UPDATE ON steam_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update project word count from chapters
CREATE OR REPLACE FUNCTION update_project_word_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET current_word_count = (
    SELECT COALESCE(SUM(word_count), 0)
    FROM chapters
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
  )
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_word_count_on_chapter_change
AFTER INSERT OR UPDATE OR DELETE ON chapters
FOR EACH ROW EXECUTE FUNCTION update_project_word_count();

-- Function to get relevant bible entries for AI context (vector search)
CREATE OR REPLACE FUNCTION search_bible_entries(
  p_project_id UUID,
  p_query_embedding vector(1536),
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  entity_name TEXT,
  entity_content TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'character'::TEXT, c.id, c.name, c.description, 1 - (c.embedding <=> p_query_embedding) as sim
  FROM characters c
  WHERE c.project_id = p_project_id AND c.embedding IS NOT NULL
  UNION ALL
  SELECT 'location'::TEXT, l.id, l.name, l.description, 1 - (l.embedding <=> p_query_embedding) as sim
  FROM locations l
  WHERE l.project_id = p_project_id AND l.embedding IS NOT NULL
  UNION ALL
  SELECT 'event'::TEXT, t.id, t.event_name, t.description, 1 - (t.embedding <=> p_query_embedding) as sim
  FROM timeline_events t
  WHERE t.project_id = p_project_id AND t.embedding IS NOT NULL
  ORDER BY sim DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
