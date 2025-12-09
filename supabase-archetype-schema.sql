-- ════════════════════════════════════════════════════════════════════
-- ALTERFOCUS - ARCHETYPE SYSTEM SCHEMA
-- ════════════════════════════════════════════════════════════════════
-- Ejecutar DESPUÉS del schema principal (supabase-schema.sql)
-- Este archivo añade las tablas del sistema de arquetipos
-- ════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════
-- TABLA 1: Definiciones de Arquetipos (Referencia)
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS archetype_definitions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  trigger_pattern TEXT,
  dopamine_impact INT CHECK (dopamine_impact >= -50 AND dopamine_impact <= 0),
  primary_intervention VARCHAR(100),
  embodied_action VARCHAR(100),
  emoji VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert arquetipos base
INSERT INTO archetype_definitions (name, description, trigger_pattern, dopamine_impact, primary_intervention, embodied_action, emoji)
VALUES 
  ('Fear', 'Procrastinación por miedo al fracaso o perfeccionismo', '¿Qué pasa si fallo?', -30, 'crappy_version', 'gesture_anchor', '😰'),
  ('LowEnergy', 'Procrastinación por baja dopamina o agotamiento', 'Es muy aburrido, sin energía', -50, 'movement_activation', 'jumping_jacks', '😴'),
  ('Confusion', 'Procrastinación por incertidumbre o sobrecarga', '¿Por dónde empiezo?', -20, 'breakdown_3steps', 'brain_dump', '🤔'),
  ('Chronic', 'Procrastinación como patrón de identidad', 'Siempre hago esto', 0, 'personal_contract', 'pattern_interrupt', '⚙️')
ON CONFLICT (name) DO NOTHING;

-- ════════════════════════════════════════════
-- TABLA 2: Arquetipo Actual del Usuario
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_archetype_current (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  primary_archetype VARCHAR(50) NOT NULL,
  secondary_archetype VARCHAR(50),
  confidence_primary FLOAT DEFAULT 0.5 CHECK (confidence_primary >= 0 AND confidence_primary <= 1),
  confidence_secondary FLOAT DEFAULT 0.0 CHECK (confidence_secondary >= 0 AND confidence_secondary <= 1),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  detection_method VARCHAR(50) CHECK (detection_method IN ('onboarding', 'session_inference', 'user_input', 'ai_detection')),
  user_confirmed BOOLEAN DEFAULT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_archetype_primary ON user_archetype_current(primary_archetype);

-- ════════════════════════════════════════════
-- TABLA 3: Historial de Detecciones
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS archetype_detection_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID,
  detected_primary VARCHAR(50) NOT NULL,
  detected_secondary VARCHAR(50),
  confidence_primary FLOAT,
  confidence_secondary FLOAT,
  signals JSONB DEFAULT '{}',
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archetype_history_user ON archetype_detection_history(user_id);
CREATE INDEX IF NOT EXISTS idx_archetype_history_date ON archetype_detection_history(detected_at DESC);

-- ════════════════════════════════════════════
-- TABLA 4: Intervenciones Ejecutadas (v2 con contexto)
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS executed_interventions_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID,
  archetype_at_time VARCHAR(50),
  intervention_type VARCHAR(100) NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_planned INT,
  duration_actual INT,
  user_completed BOOLEAN DEFAULT false,
  success_indicator BOOLEAN DEFAULT NULL,
  effectiveness_rating FLOAT DEFAULT 0.5 CHECK (effectiveness_rating >= 0 AND effectiveness_rating <= 1),
  points_awarded INT DEFAULT 0,
  user_feedback VARCHAR(50) CHECK (user_feedback IN ('helpful', 'not_helpful', 'partially', NULL)),
  notes JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_interventions_v2_user ON executed_interventions_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_interventions_v2_type ON executed_interventions_v2(intervention_type);
CREATE INDEX IF NOT EXISTS idx_interventions_v2_date ON executed_interventions_v2(triggered_at DESC);

-- ════════════════════════════════════════════
-- TABLA 5: Patrones Detectados Automáticamente
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS detected_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  pattern_name VARCHAR(100) NOT NULL,
  archetype_involved VARCHAR(50),
  trigger_context JSONB DEFAULT '{}',
  frequency INT DEFAULT 1,
  effectiveness_interventions FLOAT DEFAULT 0.5,
  last_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_chronic BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patterns_user ON detected_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_patterns_chronic ON detected_patterns(is_chronic) WHERE is_chronic = true;

-- ════════════════════════════════════════════
-- TABLA 6: Contratos Personales
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS personal_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES detected_patterns(id) ON DELETE SET NULL,
  contract_text TEXT NOT NULL,
  signature VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activation_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  success_rate FLOAT DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_contracts_user ON personal_contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_active ON personal_contracts(is_active) WHERE is_active = true;

-- ════════════════════════════════════════════
-- TABLA 7: Micro-Victorias
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS micro_victories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID,
  archetype_at_time VARCHAR(50),
  victory_type VARCHAR(100) NOT NULL,
  description TEXT,
  points INT DEFAULT 0,
  emotional_impact FLOAT DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_victories_user ON micro_victories(user_id);
CREATE INDEX IF NOT EXISTS idx_victories_date ON micro_victories(created_at DESC);

-- ════════════════════════════════════════════
-- TABLA 8: Efectividad de Intervenciones por Usuario
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS intervention_effectiveness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  intervention_type VARCHAR(100) NOT NULL,
  archetype_context VARCHAR(50),
  effectiveness_score FLOAT DEFAULT 0.5 CHECK (effectiveness_score >= 0 AND effectiveness_score <= 1),
  usage_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  avg_duration_completed INT,
  last_used TIMESTAMP WITH TIME ZONE,
  trend VARCHAR(20) CHECK (trend IN ('improving', 'stable', 'declining')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, intervention_type, archetype_context)
);

CREATE INDEX IF NOT EXISTS idx_effectiveness_user ON intervention_effectiveness(user_id);
CREATE INDEX IF NOT EXISTS idx_effectiveness_score ON intervention_effectiveness(effectiveness_score DESC);

-- ════════════════════════════════════════════
-- TABLA 9: Predicción de Recaída (P1)
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS relapse_prediction (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  risk_level FLOAT DEFAULT 0.0 CHECK (risk_level >= 0 AND risk_level <= 1),
  risk_signals JSONB DEFAULT '{}',
  predicted_archetype VARCHAR(50),
  recommended_intervention VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_current BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_relapse_user ON relapse_prediction(user_id);
CREATE INDEX IF NOT EXISTS idx_relapse_risk ON relapse_prediction(risk_level DESC);

-- ════════════════════════════════════════════
-- RLS POLICIES para Arquetipos
-- ════════════════════════════════════════════

-- Enable RLS
ALTER TABLE user_archetype_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetype_detection_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE executed_interventions_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_victories ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_effectiveness ENABLE ROW LEVEL SECURITY;
ALTER TABLE relapse_prediction ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can access own archetype" ON user_archetype_current
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own detection history" ON archetype_detection_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own interventions v2" ON executed_interventions_v2
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own patterns" ON detected_patterns
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own contracts" ON personal_contracts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own victories" ON micro_victories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own effectiveness" ON intervention_effectiveness
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own relapse data" ON relapse_prediction
  FOR ALL USING (auth.uid() = user_id);

-- ════════════════════════════════════════════
-- FUNCTIONS
-- ════════════════════════════════════════════

-- Function to update effectiveness after feedback
CREATE OR REPLACE FUNCTION update_intervention_effectiveness()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO intervention_effectiveness (
    user_id,
    intervention_type,
    archetype_context,
    effectiveness_score,
    usage_count,
    success_count,
    last_used
  )
  VALUES (
    NEW.user_id,
    NEW.intervention_type,
    NEW.archetype_at_time,
    CASE WHEN NEW.success_indicator THEN 0.6 ELSE 0.4 END,
    1,
    CASE WHEN NEW.success_indicator THEN 1 ELSE 0 END,
    NOW()
  )
  ON CONFLICT (user_id, intervention_type, archetype_context) DO UPDATE SET
    usage_count = intervention_effectiveness.usage_count + 1,
    success_count = intervention_effectiveness.success_count + CASE WHEN NEW.success_indicator THEN 1 ELSE 0 END,
    effectiveness_score = (
      (intervention_effectiveness.effectiveness_score * intervention_effectiveness.usage_count) + 
      CASE WHEN NEW.success_indicator THEN 1 ELSE 0 END
    ) / (intervention_effectiveness.usage_count + 1),
    last_used = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_update_effectiveness
AFTER INSERT ON executed_interventions_v2
FOR EACH ROW
WHEN (NEW.success_indicator IS NOT NULL)
EXECUTE FUNCTION update_intervention_effectiveness();

-- ════════════════════════════════════════════
-- DONE! ✅
-- ════════════════════════════════════════════
-- Archetype system tables are ready.
-- Run this AFTER the main supabase-schema.sql
