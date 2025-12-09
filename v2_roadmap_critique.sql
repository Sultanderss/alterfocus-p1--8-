-- CRITIQUE LOG: Hallazgos para V2 (Scientific Validation)
-- Severidad: CRITICAL, HIGH, MEDIUM
-- Estado: PENDING, IN_PROGRESS, RESOLVED

CREATE TABLE IF NOT EXISTS system_critique_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM')),
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar los 10 hallazgos "Brutales"
INSERT INTO system_critique_log (finding, severity, status) VALUES
('Validación psicológica débil (4 arquetipos)', 'CRITICAL', 'PENDING'),
('Intervenciones sin evidencia científica', 'CRITICAL', 'PENDING'),
('Detección multi-signal frágil (sin comorbilidades)', 'CRITICAL', 'PENDING'),
('Modelo de persistencia simple', 'HIGH', 'PENDING'),
('Gamificación extrinseca (puntos)', 'MEDIUM', 'PENDING'),
('Feedback corrupto (usuario miente)', 'CRITICAL', 'PENDING'),
('Seguridad incompleta (sin audit/GDPR)', 'HIGH', 'PENDING'),
('Sin re-detección dinámica', 'HIGH', 'PENDING'),
('Sin caso control (Hawthorne effect)', 'CRITICAL', 'PENDING'),
('Escalabilidad psicológica dudosa', 'HIGH', 'PENDING');
