/**
 * IRON PROGRAM - Sistema diario de evaluación de recuperación
 * Basado en la especificación funcional oficial para integración en la app.
 */

// Puntos de corte por defecto (configurables)
export const DEFAULT_SCORE_THRESHOLDS = {
  optimal: 8.0,   // 8.0 - 10.0
  adequate: 6.5,  // 6.5 - 7.9
  limited: 5.0    // 5.0 - 6.4 (por debajo de 5.0 es Baja)
};

// Textos e interpretaciones oficiales de las variables (Escala 1 a 5)
export const VARIABLE_INTERPRETATIONS = {
  sleep: {
    name: 'Sueño',
    scale: '1-5',
    weight: 0.20,
    labels: {
      1: 'Muy malo',
      2: 'Malo',
      3: 'Normal',
      4: 'Bueno',
      5: 'Muy bueno'
    }
  },
  fatigue: {
    name: 'Fatiga muscular',
    scale: '1-5',
    weight: 0.20,
    labels: {
      1: 'Muy fatigado',
      2: 'Bastante fatigado',
      3: 'Normal',
      4: 'Bastante fresco',
      5: 'Muy fresco'
    }
  },
  energy: {
    name: 'Energía',
    scale: '1-5',
    weight: 0.10,
    labels: {
      1: 'Muy baja',
      2: 'Baja',
      3: 'Normal',
      4: 'Alta',
      5: 'Muy alta'
    }
  },
  stress: {
    name: 'Estrés',
    scale: '1-5',
    weight: 0.10,
    labels: {
      1: 'Muy alto',
      2: 'Alto',
      3: 'Normal',
      4: 'Bajo',
      5: 'Muy bajo'
    }
  },
  prs: {
    name: 'PRS / Recuperación general',
    scale: '0-10',
    weight: 0.40,
    question: '¿Cómo de recuperado te sientes hoy para entrenar?'
  }
};

// 4 Estados y pautas automáticas oficiales
export const RECOVERY_STATES = {
  optimal: {
    id: 'optimal',
    name: 'ÓPTIMO',
    rangeLabel: '8,0 - 10',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: '#22c55e',
    iconEmoji: '🟢',
    headline: 'Entrena según lo programado.',
    shortAdvice: 'Seguir la sesión prevista y buscar rendimiento.',
    guidelines: [
      'Seguir la sesión prevista.',
      'Mantener cargas e intensidades programadas.',
      'Buscar rendimiento si las sensaciones durante el calentamiento son buenas.'
    ],
    volumeReduction: '0%'
  },
  adequate: {
    id: 'adequate',
    name: 'ADECUADO',
    rangeLabel: '6,5 - 7,9',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.12)',
    borderColor: '#eab308',
    iconEmoji: '🟡',
    headline: 'Entrena con normalidad, pero autorregula.',
    shortAdvice: 'Mantener estructura y priorizar calidad de ejecución.',
    guidelines: [
      'Mantener la estructura de la sesión.',
      'Evitar forzar cargas o ritmos si las sensaciones no acompañan.',
      'Usar el calentamiento como comprobación.',
      'Priorizar calidad de ejecución sobre rendimiento.'
    ],
    volumeReduction: '0%'
  },
  limited: {
    id: 'limited',
    name: 'RECUPERACIÓN LIMITADA',
    rangeLabel: '5,0 - 6,4',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.12)',
    borderColor: '#f97316',
    iconEmoji: '🟠',
    headline: 'Hoy conviene ajustar el entrenamiento.',
    shortAdvice: 'Reducir volumen un 10-20% y evitar esfuerzos máximos.',
    guidelines: [
      'Reducir aproximadamente un 10-20% el volumen total.',
      'Evitar RPE 9-10, fallo muscular y esfuerzos máximos.',
      'Mantener una intensidad moderada.',
      'Priorizar técnica, control y calidad.',
      'Si las sensaciones mejoran claramente tras el calentamiento, acercarse progresivamente a la sesión original.'
    ],
    volumeReduction: '10-20%'
  },
  low: {
    id: 'low',
    name: 'RECUPERACIÓN BAJA',
    rangeLabel: '< 5,0',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: '#ef4444',
    iconEmoji: '🔴',
    headline: 'Hoy la prioridad debe ser recuperar.',
    shortAdvice: 'Reducir volumen 20-40%, evitar cargas pesadas o valorar descanso.',
    guidelines: [
      'Reducir aproximadamente un 20-40% el volumen.',
      'Evitar cargas pesadas y esfuerzos máximos.',
      'Sustituir trabajo muy intenso por técnica, movilidad o aeróbico suave/moderado.',
      'Si la fatiga es muy alta, valorar recuperación activa o descanso.'
    ],
    volumeReduction: '20-40%'
  }
};

// Orden jerárquico de estados para descensos
const STATE_HIERARCHY = ['optimal', 'adequate', 'limited', 'low'];

/**
 * Convierte escalas 1-5 a 0-10: 1=2, 2=4, 3=6, 4=8, 5=10
 * @param {number} val 
 * @returns {number}
 */
export function scale1to5to10(val) {
  const num = Number(val) || 3;
  return Math.min(10, Math.max(0, num * 2));
}

/**
 * Calcula el Recovery Score oficial de Iron Program y determina el estado
 * Fórmula:
 * Recovery Score = PRS×0,40 + Sueño×0,20 + Fatiga×0,20 + Energía×0,10 + Estrés×0,10
 * 
 * Reglas con prioridad:
 * 1. Dolor o molestia = Sí -> Alerta independiente, no modifica la media pero exige aviso.
 * 2. Si 2 o más variables entre Sueño, Fatiga, Energía o Estrés están en 1/5 -> Bajar automáticamente un estadio.
 * 
 * @param {object} params
 * @param {number} params.sleep 1-5
 * @param {number} params.fatigue 1-5
 * @param {number} params.energy 1-5
 * @param {number} params.stress 1-5
 * @param {number} params.prs 0-10
 * @param {boolean} params.hasPain boolean
 * @param {string} params.painDescription string
 * @param {Array<string>} params.painAreas array
 * @returns {object}
 */
export function calculateIronRecoveryScore({
  sleep = 4,
  fatigue = 4,
  energy = 4,
  stress = 4,
  prs = 8,
  hasPain = false,
  painDescription = '',
  painAreas = []
}) {
  const prsVal = Math.min(10, Math.max(0, Number(prs)));
  const sleep10 = scale1to5to10(sleep);
  const fatigue10 = scale1to5to10(fatigue);
  const energy10 = scale1to5to10(energy);
  const stress10 = scale1to5to10(stress);

  // Recovery Score = PRS×0,40 + Sueño×0,20 + Fatiga×0,20 + Energía×0,10 + Estrés×0,10
  const rawScore = (prsVal * 0.40) +
                   (sleep10 * 0.20) +
                   (fatigue10 * 0.20) +
                   (energy10 * 0.10) +
                   (stress10 * 0.10);

  // Redondear a 1 decimal
  const score = Math.round(rawScore * 10) / 10;

  // Estado base según score
  let baseStateKey = 'low';
  if (score >= DEFAULT_SCORE_THRESHOLDS.optimal) {
    baseStateKey = 'optimal';
  } else if (score >= DEFAULT_SCORE_THRESHOLDS.adequate) {
    baseStateKey = 'adequate';
  } else if (score >= DEFAULT_SCORE_THRESHOLDS.limited) {
    baseStateKey = 'limited';
  } else {
    baseStateKey = 'low';
  }

  // Regla con prioridad: Si 2 o más variables entre Sueño, Fatiga, Energía o Estrés están en 1/5 -> bajar automáticamente un estadio
  const criticalVars = [
    { name: 'Sueño', val: Number(sleep) },
    { name: 'Fatiga', val: Number(fatigue) },
    { name: 'Energía', val: Number(energy) },
    { name: 'Estrés', val: Number(stress) }
  ];

  const criticalCount = criticalVars.filter(v => v.val === 1).length;
  let finalStateKey = baseStateKey;
  let downgraded = false;
  let downgradeReason = null;

  if (criticalCount >= 2) {
    const currentIndex = STATE_HIERARCHY.indexOf(baseStateKey);
    if (currentIndex < STATE_HIERARCHY.length - 1) {
      finalStateKey = STATE_HIERARCHY[currentIndex + 1];
      downgraded = true;
      const criticalNames = criticalVars.filter(v => v.val === 1).map(v => v.name).join(' y ');
      downgradeReason = `Regla Iron Program: ${criticalNames} en nivel mínimo (1/5) reducen automáticamente un estadio de entrenamiento.`;
    }
  }

  const stateData = RECOVERY_STATES[finalStateKey];

  return {
    score, // 0.0 - 10.0 (un decimal)
    scoreDisplay: score.toFixed(1).replace('.', ','),
    baseState: baseStateKey,
    finalState: finalStateKey,
    stateData,
    downgraded,
    downgradeReason,
    hasPain: Boolean(hasPain),
    painDescription: painDescription || '',
    painAreas: painAreas || [],
    painAlert: hasPain ? 'Aviso de molestia/dolor activo: adapta o consulta con tu coach antes de comenzar.' : null
  };
}

/**
 * Calcula la media móvil de los últimos 3 días (según Sección 8 del PDF)
 * @param {Array<object>} logs Historial de checkins ordenados por fecha
 * @returns {number|null}
 */
export function calculateThreeDayMovingAverage(logs) {
  if (!logs || logs.length === 0) return null;
  const recentLogs = logs.slice(-3);
  const sum = recentLogs.reduce((acc, log) => acc + (Number(log.score) || 0), 0);
  const avg = sum / recentLogs.length;
  return Math.round(avg * 10) / 10;
}

/**
 * Normaliza y devuelve toda la información de adaptación de un registro de recuperación
 * @param {object} todayEntry 
 * @returns {object|null}
 */
export function getRecoveryStateInfo(todayEntry) {
  if (!todayEntry) return null;
  let stateKey = todayEntry.finalState || todayEntry.baseState;
  if (!stateKey || !RECOVERY_STATES[stateKey]) {
    const rawScore = Number(todayEntry.score) || 7.0;
    const normalizedScore = rawScore > 10 ? rawScore / 10 : rawScore;
    if (todayEntry.level === 'fatigue' || normalizedScore < 5.0) stateKey = 'low';
    else if (todayEntry.level === 'limited' || (normalizedScore >= 5.0 && normalizedScore < 6.5)) stateKey = 'limited';
    else if (todayEntry.level === 'moderate' || (normalizedScore >= 6.5 && normalizedScore < 8.0)) stateKey = 'adequate';
    else stateKey = 'optimal';
  }

  const stateData = RECOVERY_STATES[stateKey] || RECOVERY_STATES.adequate;
  const rawScore = Number(todayEntry.score) || 7.0;
  const scoreNum = rawScore > 10 ? rawScore / 10 : rawScore;
  const scoreDisplay = todayEntry.scoreDisplay || scoreNum.toFixed(1).replace('.', ',');

  return {
    stateKey,
    stateData,
    score: scoreNum,
    scoreDisplay,
    statusLabel: todayEntry.statusLabel || stateData.name,
    headline: todayEntry.headline || stateData.headline,
    shortAdvice: todayEntry.shortAdvice || stateData.shortAdvice,
    guidelines: (Array.isArray(todayEntry.guidelines) && todayEntry.guidelines.length > 0) 
      ? todayEntry.guidelines 
      : stateData.guidelines,
    volumeReduction: todayEntry.volumeReduction || stateData.volumeReduction,
    downgraded: Boolean(todayEntry.downgraded),
    downgradeReason: todayEntry.downgradeReason || null,
    hasPain: Boolean(todayEntry.hasPain),
    painAreas: todayEntry.painAreas || todayEntry.sorenessAreas || [],
    painDescription: todayEntry.painDescription || '',
    deloadMode: Boolean(todayEntry.deloadMode)
  };
}

/**
 * Calcula la adaptación específica de un ejercicio (series, repeticiones y carga)
 * manteniendo la prescripción original intacta para mostrarlas una al lado de la otra.
 * @param {object} exercise 
 * @param {string} stateKey 'optimal' | 'adequate' | 'limited' | 'low'
 * @param {string} volumeReduction '0%' | '10-20%' | '20-40%'
 * @returns {object|null}
 */
export function getExerciseAdaptation(exercise, stateKey, volumeReduction) {
  if (!stateKey || stateKey === 'optimal') {
    return null;
  }

  // Parse sets if numeric
  let setsMatch = null;
  if (exercise?.sets) {
    setsMatch = String(exercise.sets).match(/(\d+)/);
  }

  let origSets = setsMatch ? parseInt(setsMatch[1], 10) : null;
  let adaptedSets = null;

  if (origSets && origSets >= 2) {
    if (volumeReduction === '10-20%') {
      adaptedSets = Math.max(1, origSets - 1);
    } else if (volumeReduction === '20-40%') {
      adaptedSets = Math.max(1, Math.round(origSets * 0.67));
      if (adaptedSets === origSets && origSets > 1) {
        adaptedSets = origSets - 1;
      }
    }
  }

  let recommendationBadge = '';
  let recommendationText = '';
  let intensityNote = '';
  let pctDiscount = 0;

  if (stateKey === 'low') {
    recommendationBadge = 'Reducción -20-40%';
    pctDiscount = 15;
    recommendationText = adaptedSets 
      ? `${adaptedSets} series recomendadas (en vez de ${origSets})` 
      : 'Reducir 1-2 series del bloque';
    intensityNote = 'Cargas suaves/moderadas • RPE 6-7 máx';
  } else if (stateKey === 'limited') {
    recommendationBadge = 'Reducción -10-20%';
    pctDiscount = 10;
    recommendationText = adaptedSets 
      ? `${adaptedSets} series recomendadas (en vez de ${origSets})` 
      : 'Reducir 1 serie del bloque';
    intensityNote = 'Carga moderada • Evitar RPE 9-10 o fallo';
  } else if (stateKey === 'adequate') {
    recommendationBadge = 'Autorregular';
    recommendationText = 'Mantener series originales';
    intensityNote = 'Ajustar carga según sensaciones';
  }

  return {
    origSets,
    adaptedSets,
    adaptedSetsText: adaptedSets ? `${adaptedSets} series` : null,
    recommendationBadge,
    recommendationText,
    intensityNote,
    pctDiscount,
    volumeReduction
  };
}

