import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  isValidUuid,
  formatSafeErrorMessage,
  validateAthletePayload,
  validatePrPayload,
  validatePerformanceLogPayload,
  validateReadinessLogPayload,
  validateWorkoutPayload,
  validateCompletedExercisePayload,
  validateUserConsentsPayload,
  safeLogger
} from '../utils/validators';

/**
 * Servicio de sincronización y persistencia con Supabase
 */

// 1. Probar conexión
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase no está configurado en .env' };
  }
  try {
    const { count, error } = await supabase
      .from('athletes')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return { success: true, count: count ?? 0 };
  } catch (err) {
    safeLogger.error('[Supabase Test Error]:', err);
    return { success: false, error: formatSafeErrorMessage(err, 'Error de conexión con la base de datos.') };
  }
}

// 2. ATLETAS
export async function fetchAthletesFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('athletes')
      .select('id, username, name, email, role, membership, access_zones, avatar, focus, phone, experience, injuries, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Normalizar a formato de la app (sin contraseñas)
    return data.map(item => ({
      id: item.id,
      username: item.username,
      name: item.name,
      email: item.email,
      role: item.role || 'athlete',
      membership: item.membership,
      accessZones: Array.isArray(item.access_zones) ? item.access_zones : ['traditional'],
      avatar: item.avatar || 'A',
      focus: item.focus || '',
      phone: item.phone || '',
      experience: item.experience || '',
      injuries: item.injuries || ''
    }));
  } catch (err) {
    safeLogger.error('[Supabase fetchAthletes]:', err);
    return null;
  }
}

export async function upsertAthleteInSupabase(athlete) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = validateAthletePayload(athlete);
    const { error } = await supabase.from('athletes').upsert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    safeLogger.error('[Supabase upsertAthlete]:', err);
    return false;
  }
}

// 3. RUTINAS Y ENTRENAMIENTOS (WODs)
export async function fetchWorkoutsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map(w => ({
      id: w.id,
      zone: w.zone,
      dayId: w.day_id,
      muscleGroup: w.muscle_group,
      title: w.title,
      category: w.category,
      type: w.type,
      duration: w.duration,
      level: w.level,
      description: w.description,
      sections: w.sections || []
    }));
  } catch (err) {
    safeLogger.error('[Supabase fetchWorkouts]:', err);
    return null;
  }
}

export async function upsertWorkoutInSupabase(workout) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = validateWorkoutPayload(workout);
    const { error } = await supabase.from('workouts').upsert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    safeLogger.error('[Supabase upsertWorkout]:', err);
    return false;
  }
}

export async function deleteWorkoutFromSupabase(workoutId) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
    if (error) throw error;
    return true;
  } catch (err) {
    safeLogger.error('[Supabase deleteWorkout]:', err);
    return false;
  }
}

// 4. PLANES SEMANALES DE ATLETAS
export async function fetchWeeklyPlansFromSupabase(athleteId = null) {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    let query = supabase.from('weekly_athlete_plans').select('*');
    if (athleteId && isValidUuid(athleteId)) {
      query = query.eq('athlete_id', athleteId);
    }
    const { data, error } = await query;

    if (error) throw error;
    if (!data) return null;

    // Convertir de filas planas al formato anidado de la app:
    // { [athleteId]: { [weekKey]: { [dayId]: workoutId } } }
    const plans = {};
    data.forEach(row => {
      if (!plans[row.athlete_id]) plans[row.athlete_id] = {};
      if (!plans[row.athlete_id][row.week_key]) plans[row.athlete_id][row.week_key] = {};
      plans[row.athlete_id][row.week_key][row.day_id] = row.workout_id;
    });

    return plans;
  } catch (err) {
    safeLogger.error('[Supabase fetchWeeklyPlans]:', err);
    return null;
  }
}

export async function saveWeeklyPlanInSupabase(athleteId, weekKey, dayId, workoutId) {
  if (!isSupabaseConfigured || !supabase || !isValidUuid(athleteId)) return false;
  try {
    const { error } = await supabase
      .from('weekly_athlete_plans')
      .upsert({
        athlete_id: athleteId,
        week_key: weekKey,
        day_id: dayId,
        workout_id: workoutId || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'athlete_id,week_key,day_id'
      });

    if (error) throw error;
    return true;
  } catch (err) {
    safeLogger.error('[Supabase saveWeeklyPlan]:', err);
    return false;
  }
}

// 5. PROGRAMACIÓN GENERAL DEL BOX (Competitors Hub)
export async function fetchBoxScheduleFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('box_weekly_schedules')
      .select('*');

    if (error) throw error;
    if (!data) return null;

    // Convertir a { [weekKey]: { [dayId]: workoutId } }
    const schedule = {};
    data.forEach(row => {
      if (!schedule[row.week_key]) schedule[row.week_key] = {};
      schedule[row.week_key][row.day_id] = row.workout_id;
    });

    return schedule;
  } catch (err) {
    safeLogger.error('[Supabase fetchBoxSchedule]:', err);
    return null;
  }
}

export async function saveBoxScheduleInSupabase(weekKey, dayId, workoutId) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('box_weekly_schedules')
      .upsert({
        week_key: weekKey,
        day_id: dayId,
        workout_id: workoutId || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'week_key,day_id'
      });

    if (error) throw error;
    return true;
  } catch (err) {
    safeLogger.error('[Supabase saveBoxSchedule]:', err);
    return false;
  }
}

// 6. MARCAS PERSONALES (PRs)
export async function fetchPrsFromSupabase(athleteId = null) {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    let query = supabase.from('prs').select('*');
    if (athleteId && isValidUuid(athleteId)) {
      query = query.eq('athlete_id', athleteId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || null;
  } catch (err) {
    safeLogger.error('[Supabase fetchPrs]:', err);
    return null;
  }
}

export async function upsertPrInSupabase(pr, athleteId = null) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = validatePrPayload(pr, athleteId);
    const { error } = await supabase.from('prs').upsert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    safeLogger.error('[Supabase upsertPr]:', err);
    return false;
  }
}

export async function deletePrFromSupabase(prId) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('prs').delete().eq('id', prId);
    if (error) throw error;
    return true;
  } catch (err) {
    safeLogger.error('[Supabase deletePr]:', err);
    return false;
  }
}

// 6b. REGISTROS DE RENDIMIENTO (Performance Logs)
export async function fetchPerformanceLogsFromSupabase(athleteId = null) {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    let query = supabase.from('performance_logs').select('*').order('created_at', { ascending: false });
    if (athleteId && isValidUuid(athleteId)) {
      query = query.eq('athlete_id', athleteId);
    }
    const { data, error } = await query;
    if (error) throw error;
    if (!data) return [];
    return data.map(item => ({
      id: item.id,
      userId: item.athlete_id,
      athlete_id: item.athlete_id,
      zone: item.zone,
      workoutId: item.workout_id,
      exerciseName: item.exercise_name,
      scoreType: item.score_type,
      value: item.value,
      rpe: item.rpe,
      notes: item.notes,
      date: item.date
    }));
  } catch (err) {
    safeLogger.error('[Supabase fetchPerformanceLogs]:', err);
    return null;
  }
}

export async function upsertPerformanceLogInSupabase(log, athleteId = null) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = validatePerformanceLogPayload(log, athleteId);
    const { error } = await supabase.from('performance_logs').upsert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    safeLogger.error('[Supabase upsertPerformanceLog]:', err);
    return false;
  }
}

export async function deletePerformanceLogFromSupabase(logId) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('performance_logs').delete().eq('id', logId);
    if (error) throw error;
    return true;
  } catch (err) {
    safeLogger.error('[Supabase deletePerformanceLog]:', err);
    return false;
  }
}

// 7. READINESS CHECK-INS (Iron Program)
export async function fetchReadinessLogsFromSupabase(athleteId = null) {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    let query = supabase.from('readiness_logs').select('*');
    if (athleteId && isValidUuid(athleteId)) {
      query = query.eq('athlete_id', athleteId);
    }
    const { data, error } = await query;
    if (error) throw error;
    if (!data) return null;

    const map = {};
    data.forEach(row => {
      map[row.id] = {
        userId: row.athlete_id,
        athleteId: row.athlete_id,
        date: row.date,
        finalState: row.final_state,
        level: row.level,
        hasPain: row.has_pain,
        ...(row.details || {})
      };
    });
    return map;
  } catch (err) {
    safeLogger.error('[Supabase fetchReadinessLogs]:', err);
    return null;
  }
}

export async function upsertReadinessLogInSupabase(key, log) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = validateReadinessLogPayload(key, log);
    const { error } = await supabase.from('readiness_logs').upsert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    safeLogger.error('[Supabase upsertReadinessLog]:', err);
    return false;
  }
}

// 8. HERRAMIENTA DE SEMILLADO / SINCRONIZACIÓN INICIAL (SEED COMPLETO)
export async function syncSeedDataToSupabase({ athletes, workouts, prs }) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase no está configurado.' };
  }

  try {
    let syncedAthletes = 0;
    let syncedWorkouts = 0;
    let syncedPrs = 0;

    // Sincronizar Atletas con UUID válido y esquema verificado
    if (athletes && athletes.length > 0) {
      const validAthletes = athletes.filter(a => isValidUuid(a.id));
      if (validAthletes.length > 0) {
        const athletePayload = validAthletes.map(a => validateAthletePayload(a));
        const { error: aErr } = await supabase.from('athletes').upsert(athletePayload);
        if (aErr) safeLogger.warn('Error subiendo atletas:', aErr);
        else syncedAthletes = athletePayload.length;
      }
    }

    // Sincronizar Rutinas con esquema verificado
    if (workouts && workouts.length > 0) {
      const workoutPayload = workouts.map(w => validateWorkoutPayload(w));
      const { error: wErr } = await supabase.from('workouts').upsert(workoutPayload);
      if (wErr) safeLogger.warn('Error subiendo workouts:', wErr);
      else syncedWorkouts = workoutPayload.length;
    }

    // Sincronizar PRs con UUID de atleta válido y esquema verificado
    if (prs && prs.length > 0) {
      const validPrs = prs.filter(p => isValidUuid(p.athlete_id));
      if (validPrs.length > 0) {
        const prPayload = validPrs.map(p => validatePrPayload(p, p.athlete_id));
        const { error: pErr } = await supabase.from('prs').upsert(prPayload);
        if (pErr) safeLogger.warn('Error subiendo prs:', pErr);
        else syncedPrs = prPayload.length;
      }
    }

    return {
      success: true,
      syncedAthletes,
      syncedWorkouts,
      syncedPrs
    };
  } catch (err) {
    safeLogger.error('[Supabase syncSeedData Error]:', err);
    return { success: false, error: formatSafeErrorMessage(err, 'Error al sincronizar datos con Supabase.') };
  }
}

// 9. AUTENTICACIÓN SEGURA OFICIAL CON SUPABASE AUTH (Bcrypt + JWT)

export async function loginWithSupabaseAuth(email, password) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase no está configurado en .env' };
  }
  try {
    const emailToUse = (email || '').trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password
    });

    if (error) {
      return { success: false, error: formatSafeErrorMessage(error, 'Error al iniciar sesión.') };
    }

    // Obtener el perfil del atleta desde public.athletes (fuente de verdad verificada por RLS)
    const profile = await fetchAthleteProfile(data.user.id);

    if (!profile) {
      // Cuenta sin perfil registrado en la base de datos: desloguear inmediatamente por seguridad
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Tu perfil de atleta no se encuentra activo en el sistema. Contacta con tu coach.'
      };
    }

    return {
      success: true,
      session: data.session,
      user: profile
    };
  } catch (err) {
    safeLogger.error('[Supabase Auth Login Error]:', err);
    return { success: false, error: formatSafeErrorMessage(err, 'Error al conectar con Supabase Auth.') };
  }
}

// Mantener retrocompatibilidad para invocaciones existentes
export const loginAthleteViaSupabase = loginWithSupabaseAuth;

export async function logoutSupabaseAuth() {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    safeLogger.error('[Supabase Logout Error]:', err);
  }
}

// Solicitar correo de restablecimiento de contraseña
export async function requestPasswordReset(email) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase no está configurado en .env' };
  }
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Introduce un correo electrónico válido.' };
    }
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo
    });

    if (error) {
      return { success: false, error: formatSafeErrorMessage(error, 'Error al enviar el correo de recuperación.') };
    }

    return { success: true };
  } catch (err) {
    safeLogger.error('[Supabase requestPasswordReset Error]:', err);
    return { success: false, error: formatSafeErrorMessage(err, 'Error al procesar la solicitud.') };
  }
}

// Actualizar contraseña de usuario autenticado o en flujo de recuperación
export async function updateUserPassword(newPassword) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase no está configurado en .env' };
  }
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'La contraseña debe contener al menos 6 caracteres.' };
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: formatSafeErrorMessage(error, 'Error al actualizar la contraseña.') };
    }

    return { success: true, user: data.user };
  } catch (err) {
    safeLogger.error('[Supabase updateUserPassword Error]:', err);
    return { success: false, error: formatSafeErrorMessage(err, 'Error al actualizar la contraseña.') };
  }
}

// Obtener perfil detallado de atleta por UUID
export async function fetchAthleteProfile(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      username: data.username,
      name: data.name,
      email: data.email,
      role: data.role || 'athlete',
      membership: data.membership,
      accessZones: Array.isArray(data.access_zones) ? data.access_zones : ['traditional'],
      avatar: data.avatar || 'AL',
      focus: data.focus || '',
      phone: data.phone || '',
      experience: data.experience || '',
      injuries: data.injuries || ''
    };
  } catch (err) {
    safeLogger.error('[Supabase fetchAthleteProfile]:', err);
    return null;
  }
}

// Dar de alta o invitar un atleta de forma segura desde el panel del Coach
export async function registerAthleteInSupabaseAuth({ email, name, role = 'athlete', membership, accessZones, focus }) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase no está configurado.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const safeRole = role === 'admin' ? 'athlete' : 'athlete'; // Siempre forzar 'athlete' desde este endpoint de cliente
  const safeZones = Array.isArray(accessZones)
    ? accessZones.filter(z => ['competitors', 'traditional'].includes(z))
    : ['traditional'];
  const isCompetitor = safeZones.includes('competitors');
  const assignedMembership = membership || (isCompetitor ? 'CrossFit Competitors' : 'Gimnasio Fitness');

  // Invocar la Edge Function oficial 'invite-athlete' en el servidor
  try {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('invite-athlete', {
      body: {
        name: cleanName,
        email: cleanEmail,
        zone: isCompetitor ? 'competitors' : 'traditional',
        focus: focus || (isCompetitor ? 'Halterofilia & WODs' : 'Hipertrofia & Fuerza')
      }
    });

    if (edgeError) {
      safeLogger.warn('Edge function invite-athlete devolvió un error:', edgeError);
      return {
        success: false,
        error: formatSafeErrorMessage(edgeError, 'No se pudo crear la invitación. Verifica los permisos de administrador.')
      };
    }

    if (edgeData?.error) {
      return { success: false, error: edgeData.error };
    }

    if (edgeData?.id) {
      return {
        success: true,
        user: {
          id: edgeData.id,
          email: cleanEmail,
          name: cleanName,
          username: cleanEmail.split('@')[0],
          role: safeRole,
          membership: assignedMembership,
          accessZones: safeZones,
          avatar: cleanName.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AL',
          focus: focus
        }
      };
    }

    return { success: false, error: 'Respuesta inesperada al generar la invitación.' };
  } catch (fnErr) {
    safeLogger.error('[registerAthleteInSupabaseAuth error]:', fnErr);
    return {
      success: false,
      error: formatSafeErrorMessage(fnErr, 'Error al contactar con el servicio de invitaciones del Box.')
    };
  }
}

// Supresión de cuenta y datos bajo RGPD Art. 17 ("Derecho al Olvido")
export async function deleteOwnAccountViaRpc() {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.rpc('delete_own_account');
    if (error) throw error;
    await supabase.auth.signOut();
    return true;
  } catch (err) {
    safeLogger.error('[Supabase deleteOwnAccountViaRpc]:', err);
    return false;
  }
}

export async function deleteAthleteFromSupabase(athleteId) {
  if (!isSupabaseConfigured || !supabase || !athleteId) return false;
  try {
    // Si el usuario autenticado está borrando su propia cuenta, ejecutar la RPC completa de usuario
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;
    if (currentUserId && currentUserId === athleteId) {
      return await deleteOwnAccountViaRpc();
    }

    // Si un Coach/Admin borra a un atleta, usar la RPC administrativa segura para purga en auth.users
    const { error: rpcError } = await supabase.rpc('admin_delete_athlete', {
      target_athlete_id: athleteId
    });

    if (rpcError) {
      safeLogger.error('[admin_delete_athlete RPC falló]:', rpcError);
      throw rpcError;
    }

    return true;
  } catch (err) {
    safeLogger.error('[Supabase deleteAthlete]:', err);
    return false;
  }
}

// 10. EJERCICIOS COMPLETADOS EN LA NUBE
export async function fetchCompletedExercisesFromSupabase(athleteId) {
  if (!isSupabaseConfigured || !supabase || !athleteId) return {};
  try {
    const { data, error } = await supabase
      .from('completed_exercises')
      .select('exercise_key, completed')
      .eq('athlete_id', athleteId);

    if (error) throw error;
    if (!data) return {};

    const map = {};
    data.forEach(item => {
      map[item.exercise_key] = item.completed;
    });
    return map;
  } catch (err) {
    safeLogger.error('[Supabase fetchCompletedExercises]:', err);
    return {};
  }
}

export async function upsertCompletedExerciseInSupabase(athleteId, exerciseKey, isCompleted) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = validateCompletedExercisePayload(athleteId, exerciseKey, isCompleted);
    const { error } = await supabase.from('completed_exercises').upsert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    safeLogger.error('[Supabase upsertCompletedExercise]:', err);
    return false;
  }
}

// 11. CONSENTIMIENTOS RGPD EN LA NUBE
export async function fetchConsentsFromSupabase(athleteId) {
  if (!isSupabaseConfigured || !supabase || !isValidUuid(athleteId)) return null;
  try {
    const { data, error } = await supabase
      .from('user_consents')
      .select('*')
      .eq('athlete_id', athleteId)
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    const row = data[0];
    return {
      terms: row.terms,
      health_readiness: row.health_readiness,
      leaderboard: row.leaderboard,
      policyVersion: row.policy_version,
      updatedAt: row.updated_at
    };
  } catch (err) {
    safeLogger.error('[Supabase fetchConsents]:', err);
    return null;
  }
}

export async function upsertConsentsInSupabase(athleteId, consents) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = validateUserConsentsPayload(athleteId, consents);
    const { error } = await supabase.from('user_consents').upsert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    safeLogger.error('[Supabase upsertConsents]:', err);
    return false;
  }
}
