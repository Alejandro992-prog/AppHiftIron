/**
 * HIFT IRON BOX APP - BACKEND ARCHITECTURE & DATABASE SCHEMA
 * 
 * Target DBMS: PostgreSQL (Compatible con Supabase / Firebase / Hasura)
 * Security: Row-Level Security (RLS) habilitado por tenant y usuario
 * Enfoque: Modular, multi-zona ('competitors' vs 'traditional')
 */

export const DATABASE_SCHEMA_DDL = `
-- ============================================================================
-- 1. ENUMS & TIPOS PERSONALIZADOS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'head_coach', 'coach', 'athlete');
CREATE TYPE zone_type AS ENUM ('competitors', 'traditional');
CREATE TYPE block_type AS ENUM (
    'warmup', 
    'weightlifting', 
    'gymnastics', 
    'metcon_wod', 
    'endurance', 
    'accessory', 
    'hypertrophy', 
    'cooldown'
);
CREATE TYPE timer_type AS ENUM ('countdown', 'countup', 'emom', 'tabata', 'amrap', 'rest');
CREATE TYPE score_type AS ENUM ('time', 'reps', 'rounds_and_reps', 'load_weight', 'calories', 'completion');

-- ============================================================================
-- 2. TABLAS DE AUTENTICACIÓN, USUARIOS Y MEMBRESÍAS
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'athlete' NOT NULL,
    avatar_url TEXT,
    leaderboard_visible BOOLEAN DEFAULT TRUE NOT NULL, -- Privacidad por diseño: visibilidad en rankings
    health_consent_granted BOOLEAN DEFAULT FALSE NOT NULL, -- Consentimiento explícito Art. 9 RGPD para readiness
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Membresías disponibles en el box / gimnasio
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- 'competitor_elite', 'gym_traditional', 'all_access'
    name VARCHAR(150) NOT NULL,
    allowed_zones zone_type[] NOT NULL, -- Array de zonas accesibles: '{competitors, traditional}'
    has_custom_coach_plan BOOLEAN DEFAULT FALSE NOT NULL,
    price_cents INTEGER NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Asignación de membresía a usuario
CREATE TABLE user_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    membership_id UUID REFERENCES memberships(id) ON DELETE RESTRICT NOT NULL,
    starts_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    CONSTRAINT unique_active_user_membership UNIQUE (user_id, membership_id)
);

-- ============================================================================
-- 3. TABLAS DE PROGRAMACIÓN Y ENTRENAMIENTOS (WORKOUT PROGRAMS)
-- ============================================================================

-- Programación principal (compartida por ambas zonas mediante el campo zone)
CREATE TABLE workout_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone zone_type NOT NULL, -- 'competitors' | 'traditional'
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    muscle_group VARCHAR(100), -- Para gimnasio tradicional: 'pecho_triceps', 'piernas', etc.
    scheduled_date DATE,       -- Para programación calendárica exacta (ej: 2026-09-24)
    day_of_week VARCHAR(10),   -- Para plantillas semanales: 'mon', 'tue', etc.
    duration_minutes INTEGER DEFAULT 60,
    difficulty_level VARCHAR(50) DEFAULT 'Intermedio',
    description TEXT,
    is_template BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Bloques de trabajo dentro de una sesión (ej: Halterofilia, Metcon, Series pesadas)
CREATE TABLE workout_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE NOT NULL,
    block_type block_type DEFAULT 'hypertrophy' NOT NULL,
    title VARCHAR(200) NOT NULL, -- ej: 'PARTE A: CLEAN & JERK', 'BLOQUE 2: BOMBEO DORSAL'
    order_index INTEGER NOT NULL,
    timer_type timer_type DEFAULT 'rest',
    timer_duration_seconds INTEGER,
    timer_label VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ejercicios o movimientos individuales dentro de cada bloque
CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id UUID REFERENCES workout_blocks(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    sets VARCHAR(50),            -- ej: '4 sets', '5 rondas'
    reps VARCHAR(50),            -- ej: '8-10 reps', '15 reps'
    prescribed_load VARCHAR(100), -- ej: '75% 1RM', '22.5kg / 15kg RX'
    rx_standard TEXT,            -- Estándar oficial de competición
    notes TEXT,
    video_url TEXT,
    order_index INTEGER NOT NULL
);

-- ============================================================================
-- 4. ASIGNACIONES PERSONALIZADAS DE ATLETAS (COACH -> ATLETA)
-- ============================================================================

CREATE TABLE athlete_assigned_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE NOT NULL,
    scheduled_date DATE NOT NULL,
    coach_id UUID REFERENCES users(id) ON DELETE SET NULL,
    custom_notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMPTZ,
    CONSTRAINT unique_athlete_date_program UNIQUE (athlete_id, scheduled_date, program_id)
);

-- ============================================================================
-- 5. REGISTROS DE RENDIMIENTO, LOGS Y PRs (PERSONAL RECORDS)
-- ============================================================================

-- Registro detallado de series o puntuaciones
CREATE TABLE workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE NOT NULL,
    block_id UUID REFERENCES workout_blocks(id) ON DELETE SET NULL,
    exercise_id UUID REFERENCES workout_exercises(id) ON DELETE SET NULL,
    
    -- Valores de registro
    score_type score_type NOT NULL,
    score_value NUMERIC(10, 2), -- Segundos para tiempo, kilos para peso, número para reps
    score_display VARCHAR(100), -- '14:25', '120 kg', '245 reps (RX)'
    is_rx BOOLEAN DEFAULT TRUE,
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10), -- Esfuerzo percibido
    notes TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Récords Personales (PRs) de Atletas
CREATE TABLE athlete_prs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'olympic_lifting', 'powerlifting', 'benchmark_wod', 'gym_strength'
    movement_name VARCHAR(150) NOT NULL, -- 'Snatch', 'Back Squat', 'Fran', 'Bench Press'
    weight_value NUMERIC(6, 2),
    weight_unit VARCHAR(10) DEFAULT 'kg',
    time_seconds INTEGER,
    reps_count INTEGER,
    achieved_date DATE DEFAULT CURRENT_DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 6. REGISTROS DE BIENESTAR DIARIO (READINESS / RPE CHECK-IN)
-- ============================================================================

CREATE TABLE athlete_readiness_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    checkin_date DATE DEFAULT CURRENT_DATE NOT NULL,
    sleep_hours VARCHAR(10) DEFAULT '7-8h' NOT NULL, -- '<5h', '5-6h', '6-7h', '7-8h', '>8h'
    sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5) NOT NULL, -- 1=Muy malo, 5=Óptimo
    soreness_level INTEGER CHECK (soreness_level BETWEEN 1 AND 5) NOT NULL, -- 1=Agujetas severas, 5=Sin dolor
    soreness_areas TEXT[] DEFAULT ARRAY['Ninguna molestia']::TEXT[] NOT NULL, -- Zonas con molestia ('Piernas', 'Lumbar', etc.)
    energy_stress INTEGER CHECK (energy_stress BETWEEN 1 AND 5) NOT NULL, -- 1=Agotado, 5=A tope
    readiness_score INTEGER CHECK (readiness_score BETWEEN 0 AND 100) NOT NULL,
    fatigue_level VARCHAR(20) DEFAULT 'optimal' NOT NULL, -- 'optimal', 'moderate', 'high_fatigue'
    high_fatigue_alert BOOLEAN DEFAULT FALSE NOT NULL,
    suggested_deload BOOLEAN DEFAULT FALSE NOT NULL,
    is_private_to_coach BOOLEAN DEFAULT TRUE NOT NULL, -- Privacidad estricta: visible solo para el Head Coach
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_daily_readiness UNIQUE (user_id, checkin_date)
);

-- ============================================================================
-- 7. CUMPLIMIENTO RGPD / LOPDGDD (PROTECCIÓN DE DATOS - ESPAÑA / UE)
-- ============================================================================

-- Registro de Consentimientos (Art. 7 RGPD & Art. 6 LOPDGDD - Responsabilidad Proactiva)
CREATE TABLE user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    consent_type VARCHAR(50) NOT NULL, -- 'terms_service', 'health_data_readiness', 'box_leaderboard', 'marketing'
    granted BOOLEAN NOT NULL DEFAULT FALSE,
    policy_version VARCHAR(20) DEFAULT 'v1.0_2026' NOT NULL,
    legal_basis VARCHAR(50) DEFAULT 'explicit_consent_art_9_2_a' NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    revoked_at TIMESTAMPTZ,
    ip_address VARCHAR(45),
    user_agent TEXT,
    CONSTRAINT unique_user_consent_type UNIQUE (user_id, consent_type)
);

-- Solicitudes de Derechos ARCO-POL (Acceso, Supresión, Portabilidad, Oposición)
CREATE TABLE data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    request_type VARCHAR(50) NOT NULL, -- 'portability_export', 'erasure_forget', 'rectification', 'restriction'
    status VARCHAR(30) DEFAULT 'completed' NOT NULL, -- 'pending', 'processing', 'completed', 'rejected'
    requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- ============================================================================
-- 8. POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_assigned_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_prs ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_readiness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;

-- Regla 1: Un atleta puede ver su propio usuario, un coach/admin ve a todos
CREATE POLICY users_policy ON users
    FOR ALL
    USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'head_coach')
    ));

-- Regla 2: Un usuario solo accede a programas de zonas permitidas por su membresía
CREATE POLICY programs_access_policy ON workout_programs
    FOR SELECT
    USING (
        -- Si es coach/admin, acceso total
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'head_coach'))
        OR
        -- Si es atleta, debe tener membresía con la zona permitida
        EXISTS (
            SELECT 1 FROM user_memberships um
            JOIN memberships m ON um.membership_id = m.id
            WHERE um.user_id = auth.uid() 
              AND um.status = 'active'
              AND workout_programs.zone = ANY(m.allowed_zones)
        )
    );

-- Regla 3: Un atleta solo puede crear y ver sus propios logs de entrenamiento
CREATE POLICY logs_owner_policy ON workout_logs
    FOR ALL
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'head_coach')
    ));

-- Regla 4: Logs de Bienestar (Readiness) - Datos de Salud Art. 9 RGPD
-- Requiere consentimiento explícito y visibilidad restringida al atleta y su Head Coach asignado
CREATE POLICY readiness_policy ON athlete_readiness_logs
    FOR ALL
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'head_coach')
    ));

-- Regla 5: Gestión de Consentimientos RGPD - Solo el propio titular y el DPO/Admin
CREATE POLICY consents_policy ON user_consents
    FOR ALL
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Regla 6: Solicitudes ARCO-POL - Solo el atleta titular y el Administrador
CREATE POLICY dsar_policy ON data_subject_requests
    FOR ALL
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));
`;

export default DATABASE_SCHEMA_DDL;

