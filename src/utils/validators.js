import {
  AthletePayloadSchema,
  PrPayloadSchema,
  PerformanceLogPayloadSchema,
  ReadinessLogPayloadSchema,
  WorkoutPayloadSchema
} from './schemas';

export const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(val) {
  return typeof val === 'string' && UUID_V4_REGEX.test(val);
}

/**
 * Sanitiza texto eliminando caracteres de control y acotando longitud
 */
export function sanitizeText(input, maxLength = 255) {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') input = String(input);
  // Filtrar caracteres de control no imprimibles (manteniendo saltos de línea y tabuladores)
  const cleaned = Array.from(input)
    .filter(char => {
      const code = char.charCodeAt(0);
      return (code >= 32 && code !== 127) || code === 10 || code === 13 || code === 9;
    })
    .join('');

  return cleaned.trim().slice(0, maxLength);
}

/**
 * Generador criptográficamente seguro de contraseñas temporales
 */
export function generateSecureTemporaryPassword(length = 10) {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback seguro en entornos sin window (Node / SSR)
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  let password = 'Hift!';
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
}

/**
 * Genera un UUID v4 seguro
 */
export function generateSecureId(prefix = '') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    const uuid = crypto.randomUUID();
    return prefix ? `${prefix}_${uuid}` : uuid;
  }
  // Fallback con crypto.getRandomValues
  const rnd = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(rnd);
  }
  rnd[6] = (rnd[6] & 0x0f) | 0x40;
  rnd[8] = (rnd[8] & 0x3f) | 0x80;
  const hex = Array.from(rnd, b => b.toString(16).padStart(2, '0')).join('');
  const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  return prefix ? `${prefix}_${uuid}` : uuid;
}

/**
 * Formatea errores internos de base de datos/red en mensajes amigables y seguros para el usuario
 * Aplica whitelist estricta para evitar que trazas internas o detalles de DB se filtren al usuario
 */
export function formatSafeErrorMessage(err, fallback = 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.') {
  if (!err) return fallback;
  const msg = typeof err === 'string' ? err : (err.message || '');

  if (msg.includes('Invalid login credentials')) {
    return 'Correo electrónico o contraseña incorrectos.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
  }
  if (msg.includes('Too many requests') || msg.includes('rate limit')) {
    return 'Demasiados intentos erróneos. Por favor, espera unos minutos por seguridad.';
  }
  if (msg.includes('User already registered')) {
    return 'Ya existe una cuenta registrada con este correo electrónico.';
  }
  if (msg.includes('Password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msg.includes('row-level security') || msg.includes('permission denied')) {
    return 'No dispones de permisos suficientes para realizar esta operación.';
  }
  if (msg.includes('duplicate key') || msg.includes('unique constraint')) {
    return 'Ya existe un registro con estos datos identificativos.';
  }
  if (msg.includes('violates foreign key')) {
    return 'La operación hace referencia a un registro que no existe.';
  }

  // Whitelist estricta: si no es un error controlado y conocido, devolver fallback genérico
  return fallback;
}

/**
 * Escapado preventivo XSS para strings que puedan procesarse o exportarse
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  if (typeof str !== 'string') str = String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Logger seguro que silencia trazas técnicas sensibles de base de datos en producción
 */
export const safeLogger = {
  error: (...args) => {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.error(...args);
    }
  },
  warn: (...args) => {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.warn(...args);
    }
  },
  log: (...args) => {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.log(...args);
    }
  }
};

/**
 * Validador para marcas personales (PRs)
 */
/**
 * Validador para marcas personales (PRs) con Zod
 */
export function validatePrPayload(pr, athleteId) {
  const targetAthleteId = pr.athlete_id || athleteId;
  const raw = {
    id: pr.id ? sanitizeText(pr.id, 64) : generateSecureId('pr'),
    athlete_id: targetAthleteId,
    exercise: pr.exercise,
    weight: pr.weight,
    date: pr.date || new Date().toISOString().split('T')[0],
    category: pr.category || 'General',
    zone: ['traditional', 'competitors'].includes(pr.zone) ? pr.zone : 'traditional',
    notes: pr.notes || null
  };

  const parsed = PrPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Datos de PR no válidos.';
    throw new Error(errorMsg);
  }
  return parsed.data;
}

/**
 * Validador para registros diarios de rendimiento (Performance Logs) con Zod
 */
export function validatePerformanceLogPayload(log, athleteId) {
  const targetAthleteId = log.athlete_id || log.userId || athleteId;
  const raw = {
    id: log.id ? sanitizeText(log.id, 64) : generateSecureId('log'),
    athlete_id: targetAthleteId,
    zone: ['traditional', 'competitors'].includes(log.zone) ? log.zone : 'competitors',
    workout_id: log.workoutId || log.workout_id || null,
    exercise_name: log.exerciseName || log.exercise_name || 'Entrenamiento general',
    score_type: log.scoreType || log.score_type || 'weight',
    value: String(log.value ?? ''),
    rpe: log.rpe !== undefined && log.rpe !== null && log.rpe !== '' ? Number(log.rpe) : null,
    notes: log.notes || null,
    date: log.date || new Date().toISOString()
  };

  const parsed = PerformanceLogPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Datos de registro de rendimiento no válidos.';
    throw new Error(errorMsg);
  }
  return parsed.data;
}

/**
 * Validador para check-in de fatiga y salud (Readiness Logs - RGPD Art. 9) con Zod
 */
export function validateReadinessLogPayload(key, log) {
  const athleteId = log.athlete_id || log.athleteId || log.userId;
  const cleanDate = sanitizeText(log.date || new Date().toISOString().split('T')[0], 30);
  const cleanKey = `${cleanDate}_${athleteId}`; // B3: ID canónico vinculado al atleta

  const raw = {
    id: cleanKey,
    athlete_id: athleteId,
    date: cleanDate,
    final_state: log.finalState || log.final_state || 'adequate',
    level: log.level || 'moderate',
    has_pain: Boolean(log.hasPain ?? log.has_pain),
    details: {
      sleep: Number(log.sleep) || 0,
      fatigue: Number(log.fatigue ?? log.soreness) || 0,
      energy: Number(log.energy) || 0,
      stress: Number(log.stress) || 0,
      prs: Number(log.prs) || 0,
      score: Number(log.score) || 0,
      scoreDisplay: String(log.scoreDisplay || ''),
      sleepHours: String(log.sleepHours || ''),
      sleepQualityText: String(log.sleepQualityText || ''),
      sorenessAreas: Array.isArray(log.sorenessAreas) ? log.sorenessAreas : [],
      painAreas: Array.isArray(log.painAreas) ? log.painAreas : [],
      painDescription: String(log.painDescription || log.notes || ''),
      headline: String(log.headline || ''),
      guidelines: Array.isArray(log.guidelines) ? log.guidelines : [],
      volumeReduction: String(log.volumeReduction || ''),
      deloadMode: Boolean(log.deloadMode),
      loggedAt: String(log.loggedAt || '')
    }
  };

  const parsed = ReadinessLogPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Datos de fatiga y recuperación no válidos.';
    throw new Error(errorMsg);
  }
  return parsed.data;
}

/**
 * Validador de esquema de rutinas (Workouts / WODs) con Zod
 */
export function validateWorkoutPayload(workout) {
  if (!workout || typeof workout !== 'object') {
    throw new Error('Datos de rutina inválidos.');
  }

  const rawSections = Array.isArray(workout.sections) ? workout.sections : [];
  const cleanSections = rawSections.slice(0, 20).map((sec, idx) => {
    const rawExercises = Array.isArray(sec.exercises) ? sec.exercises : [];
    const cleanExercises = rawExercises
      .filter(ex => ex && (ex.name || '').trim().length > 0)
      .slice(0, 30)
      .map(ex => ({
        name: ex.name,
        sets: ex.sets || '3 series',
        reps: ex.reps || '10 reps',
        rir: ex.rir || undefined,
        notes: ex.notes || '',
        rx: ex.rx || undefined
      }));

    return {
      name: sec.name || `BLOQUE ${idx + 1}`,
      duration: sec.duration || '15 min',
      blockType: sec.blockType || 'traditional',
      groupTimer: sec.groupTimer && typeof sec.groupTimer === 'object' ? {
        seconds: Math.max(5, Math.min(3600, Number(sec.groupTimer.seconds) || 60)),
        label: sec.groupTimer.label || 'Descanso',
        type: sec.groupTimer.type || 'rest',
        rounds: Number(sec.groupTimer.rounds) || undefined,
        intervalSeconds: Number(sec.groupTimer.intervalSeconds) || undefined
      } : { seconds: 60, label: 'Descanso 60s', type: 'rest' },
      exercises: cleanExercises
    };
  });

  const raw = {
    id: workout.id ? sanitizeText(workout.id, 80) : generateSecureId('wod'),
    zone: ['traditional', 'competitors'].includes(workout.zone) ? workout.zone : 'traditional',
    day_id: workout.dayId || workout.day_id || null,
    muscle_group: workout.muscleGroup || workout.muscle_group || null,
    title: workout.title,
    category: workout.category || 'gym',
    type: workout.type || 'GIMNASIO / MUSCULACIÓN',
    duration: workout.duration || '45 MIN',
    level: workout.level || 'Todos los niveles',
    description: workout.description || '',
    sections: cleanSections,
    updated_at: new Date().toISOString()
  };

  const parsed = WorkoutPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Esquema de rutina no válido.';
    throw new Error(errorMsg);
  }
  return parsed.data;
}

/**
 * Validador y sanitizador para datos de perfil de atleta con Zod
 */
export function validateAthletePayload(athlete) {
  if (!athlete || !isValidUuid(athlete.id)) {
    throw new Error('Identificador de atleta no válido.');
  }

  const raw = {
    id: athlete.id,
    name: athlete.name,
    username: athlete.username || (athlete.email ? athlete.email.split('@')[0] : ''),
    email: athlete.email,
    role: athlete.role === 'admin' ? 'admin' : 'athlete',
    membership: athlete.membership || 'Fitness & Musculación General',
    access_zones: Array.isArray(athlete.accessZones || athlete.access_zones)
      ? (athlete.accessZones || athlete.access_zones).filter(z => ['competitors', 'traditional'].includes(z))
      : ['traditional'],
    avatar: athlete.avatar || 'AL',
    focus: athlete.focus || '',
    phone: athlete.phone || null,
    experience: athlete.experience || null,
    injuries: athlete.injuries || null
  };

  const parsed = AthletePayloadSchema.safeParse(raw);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Datos de atleta no válidos.';
    throw new Error(errorMsg);
  }
  return {
    ...parsed.data,
    updated_at: new Date().toISOString()
  };
}


