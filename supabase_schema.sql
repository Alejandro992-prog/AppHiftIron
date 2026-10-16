-- ============================================================================
-- HIFT IRON BOX APP - ESQUEMA DEFINITIVO CON SUPABASE AUTH (RLS + BCRYPT)
-- ============================================================================
-- Este script es 100% IDEMPOTENTE: puedes ejecutarlo cuantas veces necesites
-- en el "SQL Editor" de Supabase sin que genere errores de duplicados ni
-- borre tus datos existentes.
-- ============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: ATLETAS (VINCULADA A auth.users)
CREATE TABLE IF NOT EXISTS public.athletes (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'athlete', -- 'admin' | 'athlete'
    membership TEXT DEFAULT 'Fitness & Musculación General',
    access_zones JSONB DEFAULT '["traditional"]'::jsonb,
    avatar TEXT DEFAULT 'AL',
    focus TEXT DEFAULT 'Entrenamiento General',
    phone TEXT,
    experience TEXT,
    injuries TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: CATÁLOGO DE RUTINAS Y ENTRENAMIENTOS (WODs & Gym)
CREATE TABLE IF NOT EXISTS public.workouts (
    id TEXT PRIMARY KEY,
    zone TEXT NOT NULL, -- 'competitors' | 'traditional'
    day_id TEXT,        -- 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'
    muscle_group TEXT,
    title TEXT NOT NULL,
    category TEXT,
    type TEXT,
    duration TEXT,
    level TEXT,
    description TEXT,
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: PLANES SEMANALES ASIGNADOS POR ATLETA
CREATE TABLE IF NOT EXISTS public.weekly_athlete_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    week_key TEXT NOT NULL, -- Ej: '2026-10-12'
    day_id TEXT NOT NULL,   -- 'mon', 'tue', etc.
    workout_id TEXT REFERENCES public.workouts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(athlete_id, week_key, day_id)
);

-- 5. TABLA: PROGRAMACIÓN GENERAL SEMANAL DEL BOX (Competitors Hub)
CREATE TABLE IF NOT EXISTS public.box_weekly_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_key TEXT NOT NULL,
    day_id TEXT NOT NULL,
    workout_id TEXT REFERENCES public.workouts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(week_key, day_id)
);

-- 6. TABLA: MARCAS PERSONALES (PRs / Records)
CREATE TABLE IF NOT EXISTS public.prs (
    id TEXT PRIMARY KEY,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    exercise TEXT NOT NULL,
    weight TEXT NOT NULL,
    date TEXT,
    category TEXT,
    zone TEXT DEFAULT 'traditional',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA: REGISTROS DE RENDIMIENTO DIARIO (Logs de entreno)
CREATE TABLE IF NOT EXISTS public.performance_logs (
    id TEXT PRIMARY KEY,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    zone TEXT NOT NULL,
    workout_id TEXT,
    exercise_name TEXT NOT NULL,
    score_type TEXT,
    value TEXT NOT NULL,
    rpe NUMERIC,
    notes TEXT,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA: CHECK-IN DE RECUPERACIÓN Y READINESS (Iron Program - Datos de salud)
CREATE TABLE IF NOT EXISTS public.readiness_logs (
    id TEXT PRIMARY KEY, -- formato: `${date}_${athleteId}`
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    final_state TEXT,
    level TEXT,
    has_pain BOOLEAN DEFAULT FALSE,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA: EJERCICIOS COMPLETADOS (Checkmarks de rutinas)
CREATE TABLE IF NOT EXISTS public.completed_exercises (
    id TEXT PRIMARY KEY, -- formato: `${athlete_id}_${exercise_key}`
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    exercise_key TEXT NOT NULL,
    completed BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLA: CONSENTIMIENTOS RGPD / PRIVACIDAD
CREATE TABLE IF NOT EXISTS public.user_consents (
    athlete_id UUID PRIMARY KEY REFERENCES public.athletes(id) ON DELETE CASCADE,
    terms BOOLEAN DEFAULT TRUE,
    health_readiness BOOLEAN DEFAULT FALSE,
    leaderboard BOOLEAN DEFAULT TRUE,
    policy_version TEXT DEFAULT 'v1.0_2026_ES',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABLA: RESERVAS DE CLASES
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    zone TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. FUNCIÓN AUXILIAR: DETERMINAR SI EL USUARIO ES ADMIN / COACH
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- 0. Comprobación rápida: si no hay usuario autenticado, nunca es admin
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 1. Solo confiar en app_metadata (gestionado exclusivamente en el servidor/dashboard de Supabase)
  IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- 2. Consultar public.athletes con privilegios de definidor (bypassa RLS de forma segura)
  SELECT role INTO v_role FROM public.athletes WHERE id = auth.uid();
  RETURN COALESCE(v_role = 'admin', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE;

-- ============================================================================
-- 13. SEGURIDAD: PREVENCIÓN DE ENUMERACIÓN DE EMAILS
-- ============================================================================
-- Se elimina cualquier función pública que permita a usuarios anónimos resolver
-- emails mediante nombres de usuario (vector de enumeración y recolección de PII)
DROP FUNCTION IF EXISTS public.get_email_by_username(TEXT);

-- ============================================================================
-- 14. TRIGGER: PROTECCIÓN DE ROL EN public.athletes (ANTI-ESCALADA DE PRIVILEGIOS)
-- ============================================================================
-- ============================================================================
-- 14. TRIGGER: PROTECCIÓN DE ROL EN public.athletes (ANTI-ESCALADA DE PRIVILEGIOS)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.protect_athlete_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la llamada proviene de service_role (Edge Functions / Admin API) o admin, permitir
  IF auth.role() = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Si es un usuario ordinario autenticado:
  -- En UPDATE: no puede modificar id, email, rol, membresía ni zonas de acceso
  IF TG_OP = 'UPDATE' THEN
    NEW.id           := OLD.id;
    NEW.email        := OLD.email;
    NEW.role         := OLD.role;
    NEW.membership   := OLD.membership;
    NEW.access_zones := OLD.access_zones;
    NEW.created_at   := OLD.created_at;
  -- En INSERT: forzar rol 'athlete' y zona base 'traditional'
  ELSIF TG_OP = 'INSERT' THEN
    NEW.role         := 'athlete';
    NEW.access_zones := '["traditional"]'::jsonb;
    NEW.membership   := 'Fitness & Musculación General';
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_protect_athlete_role ON public.athletes;
CREATE TRIGGER tr_protect_athlete_role
  BEFORE INSERT OR UPDATE ON public.athletes
  FOR EACH ROW EXECUTE FUNCTION public.protect_athlete_role();

-- ============================================================================
-- 14.1 SINCRONIZACIÓN AUTOMÁTICA DE ROLES: public.athletes -> auth.users
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_athlete_role_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Mantener sincronizado raw_app_meta_data en auth.users para Edge Functions y JWT claims
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'role', NEW.role,
      'access_zones', NEW.access_zones,
      'membership', NEW.membership
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS tr_sync_athlete_role_to_auth ON public.athletes;
CREATE TRIGGER tr_sync_athlete_role_to_auth
  AFTER UPDATE OF role, access_zones, membership ON public.athletes
  FOR EACH ROW EXECUTE FUNCTION public.sync_athlete_role_to_auth();

-- Función administrativa segura para promover formalmente al Head Coach
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(trim(target_email));
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario con email % no encontrado.', target_email;
  END IF;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    '{"role": "admin", "access_zones": ["competitors", "traditional"], "membership": "Head Coach & Administrador"}'::jsonb
  WHERE id = v_user_id;

  UPDATE public.athletes
  SET role = 'admin',
      access_zones = '["competitors", "traditional"]'::jsonb,
      membership = 'Head Coach & Administrador',
      updated_at = NOW()
  WHERE id = v_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- ============================================================================
-- 14b. FUNCIÓN SEGURA: DERECHO AL OLVIDO Y SUPRESIÓN DE CUENTA PROPIA (RGPD ART. 17)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado.';
  END IF;

  -- Borrar de auth.users (cascada hacia public.athletes, logs, prs, etc.)
  DELETE FROM auth.users WHERE id = v_user_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

-- ============================================================================
-- 14c. FUNCIÓN SEGURA: ELIMINACIÓN DE ATLETA POR PARTE DEL COACH / ADMIN
-- ============================================================================
CREATE OR REPLACE FUNCTION public.admin_delete_athlete(target_athlete_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- 1. Validar estrictamente privilegios de Administrador / Coach
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: únicamente administradores pueden dar de baja a usuarios.';
  END IF;

  -- 2. Impedir que el administrador se elimine por error a sí mismo
  IF target_athlete_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes eliminar tu propia cuenta de administrador mediante esta acción.';
  END IF;

  -- 3. Impedir que un administrador elimine a otro administrador
  IF EXISTS (SELECT 1 FROM public.athletes WHERE id = target_athlete_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Operación no permitida: no se puede eliminar a otro administrador del Box.';
  END IF;

  -- 4. Borrar de auth.users (el ON DELETE CASCADE purga public.athletes y dependencias)
  DELETE FROM auth.users WHERE id = target_athlete_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

REVOKE ALL ON FUNCTION public.admin_delete_athlete(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_athlete(UUID) TO authenticated;

-- ============================================================================
-- 15. TRIGGER: CREAR PERFIL DE ATLETA AUTOMÁTICAMENTE AL CREAR USUARIO EN AUTH
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin   BOOLEAN := (NEW.raw_app_meta_data->>'role') = 'admin';
  v_zones      JSONB   := COALESCE(NEW.raw_app_meta_data->'access_zones', '["traditional"]'::jsonb);
  v_membership TEXT    := COALESCE(NEW.raw_app_meta_data->>'membership', 'Fitness & Box General');
  v_name       TEXT    := LEFT(COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), split_part(NEW.email, '@', 1)), 100);
BEGIN
  -- Validar formato de access_zones
  IF jsonb_typeof(v_zones) <> 'array'
     OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(v_zones) z WHERE z NOT IN ('traditional', 'competitors')) THEN
    v_zones := '["traditional"]'::jsonb;
  END IF;

  IF v_is_admin THEN
    v_membership := 'Head Coach & Administrador';
    v_zones := '["competitors", "traditional"]'::jsonb;
  END IF;

  INSERT INTO public.athletes (
    id,
    email,
    name,
    username,
    role,
    membership,
    access_zones,
    avatar,
    focus
  ) VALUES (
    NEW.id,
    NEW.email,
    v_name,
    LEFT(COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''), split_part(NEW.email, '@', 1)), 50),
    CASE WHEN v_is_admin THEN 'admin' ELSE 'athlete' END,
    v_membership,
    v_zones,
    CASE WHEN v_is_admin THEN 'HC' ELSE UPPER(LEFT(split_part(NEW.email, '@', 1), 2)) END,
    CASE WHEN v_is_admin THEN 'Gestión Global del Box' ELSE 'Entrenamiento General' END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.athletes.name),
    updated_at = NOW();

  -- Consentimientos RGPD iniciales: leaderboard en false por defecto según principio de privacidad por diseño
  INSERT INTO public.user_consents (athlete_id, terms, health_readiness, leaderboard, policy_version)
  VALUES (NEW.id, true, false, false, 'v1.0_2026_ES')
  ON CONFLICT (athlete_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 16. ACTIVAR ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- ============================================================================
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_athlete_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.box_weekly_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 17. POLÍTICAS RLS IDEMPOTENTES (CON DROP POLICY IF EXISTS)
-- ============================================================================

-- A. WORKOUTS (Rutinas del Box - Zonificación Segura por Membresía)
DROP POLICY IF EXISTS "Public access for workouts" ON public.workouts;
DROP POLICY IF EXISTS "workouts_read" ON public.workouts;
CREATE POLICY "workouts_read" ON public.workouts
  FOR SELECT TO authenticated USING (
    public.is_admin()
    OR zone = 'traditional'
    OR (
      zone = 'competitors' 
      AND EXISTS (
        SELECT 1 FROM public.athletes 
        WHERE id = auth.uid() 
        AND access_zones ? 'competitors'
      )
    )
  );

DROP POLICY IF EXISTS "workouts_admin_manage" ON public.workouts;
CREATE POLICY "workouts_admin_manage" ON public.workouts
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- B. BOX WEEKLY SCHEDULES (Programación semanal general - Exclusiva Competitors)
DROP POLICY IF EXISTS "Public access for box_weekly_schedules" ON public.box_weekly_schedules;
DROP POLICY IF EXISTS "box_schedule_read" ON public.box_weekly_schedules;
CREATE POLICY "box_schedule_read" ON public.box_weekly_schedules
  FOR SELECT TO authenticated USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.athletes 
      WHERE id = auth.uid() 
      AND access_zones ? 'competitors'
    )
  );

DROP POLICY IF EXISTS "box_schedule_admin_manage" ON public.box_weekly_schedules;
CREATE POLICY "box_schedule_admin_manage" ON public.box_weekly_schedules
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- C. ATLETAS (Perfiles de usuario)
DROP POLICY IF EXISTS "Public access for athletes" ON public.athletes;
DROP POLICY IF EXISTS "athletes_select" ON public.athletes;
CREATE POLICY "athletes_select" ON public.athletes
  FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "athletes_insert" ON public.athletes;
CREATE POLICY "athletes_insert" ON public.athletes
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "athletes_update" ON public.athletes;
CREATE POLICY "athletes_update" ON public.athletes
  FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "athletes_delete" ON public.athletes;
CREATE POLICY "athletes_delete" ON public.athletes
  FOR DELETE TO authenticated USING (public.is_admin());

-- D. PLANES ASIGNADOS POR ATLETA
DROP POLICY IF EXISTS "Public access for weekly_athlete_plans" ON public.weekly_athlete_plans;
DROP POLICY IF EXISTS "weekly_plans_select" ON public.weekly_athlete_plans;
CREATE POLICY "weekly_plans_select" ON public.weekly_athlete_plans
  FOR SELECT TO authenticated USING (athlete_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "weekly_plans_admin_manage" ON public.weekly_athlete_plans;
CREATE POLICY "weekly_plans_admin_manage" ON public.weekly_athlete_plans
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- E. MARCAS PERSONALES (PRs)
DROP POLICY IF EXISTS "Public access for prs" ON public.prs;
DROP POLICY IF EXISTS "prs_select" ON public.prs;
CREATE POLICY "prs_select" ON public.prs
  FOR SELECT TO authenticated USING (athlete_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "prs_insert" ON public.prs;
CREATE POLICY "prs_insert" ON public.prs
  FOR INSERT TO authenticated WITH CHECK (athlete_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "prs_update" ON public.prs;
CREATE POLICY "prs_update" ON public.prs
  FOR UPDATE TO authenticated USING (athlete_id = auth.uid() OR public.is_admin()) WITH CHECK (athlete_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "prs_delete" ON public.prs;
CREATE POLICY "prs_delete" ON public.prs
  FOR DELETE TO authenticated USING (athlete_id = auth.uid() OR public.is_admin());

-- F. LOGS DE RENDIMIENTO
DROP POLICY IF EXISTS "Public access for performance_logs" ON public.performance_logs;
DROP POLICY IF EXISTS "perf_logs_select" ON public.performance_logs;
CREATE POLICY "perf_logs_select" ON public.performance_logs
  FOR SELECT TO authenticated USING (athlete_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "perf_logs_manage" ON public.performance_logs;
CREATE POLICY "perf_logs_manage" ON public.performance_logs
  FOR ALL TO authenticated USING (athlete_id = auth.uid() OR public.is_admin()) WITH CHECK (athlete_id = auth.uid() OR public.is_admin());

-- G. READINESS CHECK-INS (Datos de salud RGPD Art. 9 - Escritura y borrado exclusivo del titular)
DROP POLICY IF EXISTS "Public access for readiness_logs" ON public.readiness_logs;
DROP POLICY IF EXISTS "readiness_select" ON public.readiness_logs;
CREATE POLICY "readiness_select" ON public.readiness_logs
  FOR SELECT TO authenticated USING (
    -- 1. El propio atleta siempre tiene derecho a consultar su historial (RGPD Art. 15)
    athlete_id = auth.uid()
    OR (
      -- 2. El Coach solo puede acceder si es admin Y el atleta ha otorgado consentimiento explícito
      public.is_admin()
      AND EXISTS (
        SELECT 1 FROM public.user_consents
        WHERE public.user_consents.athlete_id = public.readiness_logs.athlete_id
        AND public.user_consents.health_readiness = TRUE
      )
    )
  );

DROP POLICY IF EXISTS "readiness_insert" ON public.readiness_logs;
CREATE POLICY "readiness_insert" ON public.readiness_logs
  FOR INSERT TO authenticated WITH CHECK (
    athlete_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.user_consents
      WHERE public.user_consents.athlete_id = auth.uid()
      AND public.user_consents.health_readiness = TRUE
    )
  );

DROP POLICY IF EXISTS "readiness_update" ON public.readiness_logs;
CREATE POLICY "readiness_update" ON public.readiness_logs
  FOR UPDATE TO authenticated USING (athlete_id = auth.uid()) WITH CHECK (athlete_id = auth.uid());

DROP POLICY IF EXISTS "readiness_delete" ON public.readiness_logs;
CREATE POLICY "readiness_delete" ON public.readiness_logs
  FOR DELETE TO authenticated USING (athlete_id = auth.uid());

-- H. EJERCICIOS COMPLETADOS
DROP POLICY IF EXISTS "Public access for completed_exercises" ON public.completed_exercises;
DROP POLICY IF EXISTS "completed_ex_select" ON public.completed_exercises;
CREATE POLICY "completed_ex_select" ON public.completed_exercises
  FOR SELECT TO authenticated USING (athlete_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "completed_ex_manage" ON public.completed_exercises;
CREATE POLICY "completed_ex_manage" ON public.completed_exercises
  FOR ALL TO authenticated USING (athlete_id = auth.uid() OR public.is_admin()) WITH CHECK (athlete_id = auth.uid() OR public.is_admin());

-- I. CONSENTIMIENTOS RGPD (Modificación exclusiva del titular de los datos)
DROP POLICY IF EXISTS "Public access for user_consents" ON public.user_consents;
DROP POLICY IF EXISTS "consents_select" ON public.user_consents;
CREATE POLICY "consents_select" ON public.user_consents
  FOR SELECT TO authenticated USING (athlete_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "consents_manage" ON public.user_consents;
DROP POLICY IF EXISTS "consents_insert_own" ON public.user_consents;
CREATE POLICY "consents_insert_own" ON public.user_consents
  FOR INSERT TO authenticated WITH CHECK (athlete_id = auth.uid());

DROP POLICY IF EXISTS "consents_update_own" ON public.user_consents;
CREATE POLICY "consents_update_own" ON public.user_consents
  FOR UPDATE TO authenticated USING (athlete_id = auth.uid()) WITH CHECK (athlete_id = auth.uid());

-- J. RESERVAS
DROP POLICY IF EXISTS "Public access for reservations" ON public.reservations;
DROP POLICY IF EXISTS "reservations_select" ON public.reservations;
CREATE POLICY "reservations_select" ON public.reservations
  FOR SELECT TO authenticated USING (athlete_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "reservations_manage" ON public.reservations;
DROP POLICY IF EXISTS "reservations_insert" ON public.reservations;
CREATE POLICY "reservations_insert" ON public.reservations
  FOR INSERT TO authenticated WITH CHECK (
    public.is_admin()
    OR (
      athlete_id = auth.uid() 
      AND reservation_date >= CURRENT_DATE 
      AND status = 'confirmed'
      AND (
        zone = 'traditional'
        OR (
          zone = 'competitors'
          AND EXISTS (
            SELECT 1 FROM public.athletes 
            WHERE id = auth.uid() 
            AND access_zones ? 'competitors'
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS "reservations_update" ON public.reservations;
CREATE POLICY "reservations_update" ON public.reservations
  FOR UPDATE TO authenticated USING (athlete_id = auth.uid() OR public.is_admin())
  WITH CHECK (athlete_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "reservations_delete" ON public.reservations;
CREATE POLICY "reservations_delete" ON public.reservations
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================================
-- 18. REVOCAR PRIVILEGIOS AL ROL ANÓNIMO EN TABLAS PRIVADAS (DEFENSA EN PROFUNDIDAD)
-- ============================================================================
REVOKE ALL ON public.athletes FROM anon;
REVOKE ALL ON public.workouts FROM anon;
REVOKE ALL ON public.box_weekly_schedules FROM anon;
REVOKE ALL ON public.readiness_logs FROM anon;
REVOKE ALL ON public.user_consents FROM anon;
REVOKE ALL ON public.prs FROM anon;
REVOKE ALL ON public.performance_logs FROM anon;
REVOKE ALL ON public.reservations FROM anon;
REVOKE ALL ON public.weekly_athlete_plans FROM anon;
REVOKE ALL ON public.completed_exercises FROM anon;

-- ============================================================================
-- 19. INTEGRIDAD Y VALIDACIÓN EN EL SERVIDOR (CHECK CONSTRAINTS)
-- ============================================================================
DO $$ BEGIN
  ALTER TABLE public.athletes ADD CONSTRAINT athletes_role_chk
    CHECK (role IN ('admin', 'athlete')) NOT VALID;
  ALTER TABLE public.athletes ADD CONSTRAINT athletes_len_chk
    CHECK (
      char_length(name) <= 100 
      AND char_length(coalesce(username, '')) <= 50
      AND char_length(coalesce(focus, '')) <= 100 
      AND char_length(coalesce(avatar, '')) <= 4
      AND char_length(coalesce(phone, '')) <= 30
      AND char_length(coalesce(experience, '')) <= 50
      AND char_length(coalesce(injuries, '')) <= 300
      AND jsonb_typeof(access_zones) = 'array'
    ) NOT VALID;
  ALTER TABLE public.workouts ADD CONSTRAINT workouts_chk
    CHECK (
      zone IN ('competitors', 'traditional')
      AND (day_id IS NULL OR day_id IN ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'))
      AND char_length(title) <= 120 
      AND char_length(coalesce(description, '')) <= 500
      AND jsonb_typeof(sections) = 'array'
      AND pg_column_size(sections) < 200000
    ) NOT VALID;
  ALTER TABLE public.prs ADD CONSTRAINT prs_chk
    CHECK (
      zone IN ('competitors', 'traditional') 
      AND char_length(exercise) <= 100
      AND char_length(weight) <= 50 
      AND char_length(coalesce(notes, '')) <= 500
    ) NOT VALID;
  ALTER TABLE public.performance_logs ADD CONSTRAINT perf_chk
    CHECK (
      zone IN ('competitors', 'traditional') 
      AND char_length(exercise_name) <= 100
      AND char_length(value) <= 50 
      AND (rpe IS NULL OR (rpe >= 1 AND rpe <= 10))
      AND char_length(coalesce(notes, '')) <= 500
    ) NOT VALID;
  ALTER TABLE public.readiness_logs ADD CONSTRAINT readiness_chk
    CHECK (
      jsonb_typeof(details) = 'object' 
      AND pg_column_size(details) < 8192
      AND id = date || '_' || athlete_id::text
    ) NOT VALID;
  ALTER TABLE public.completed_exercises ADD CONSTRAINT completed_chk
    CHECK (
      char_length(exercise_key) <= 200 
      AND id = athlete_id::text || '_' || exercise_key
    ) NOT VALID;
  ALTER TABLE public.weekly_athlete_plans ADD CONSTRAINT wap_day_chk
    CHECK (day_id IN ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')) NOT VALID;
  ALTER TABLE public.box_weekly_schedules ADD CONSTRAINT bws_day_chk
    CHECK (day_id IN ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')) NOT VALID;
  ALTER TABLE public.reservations ADD CONSTRAINT reservations_chk
    CHECK (
      zone IN ('competitors', 'traditional') 
      AND status IN ('confirmed', 'cancelled')
    ) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


