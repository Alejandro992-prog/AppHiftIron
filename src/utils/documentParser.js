import mammoth from 'mammoth';
import { extractTextFromPdf } from './pdfParser.js';
import { generateSecureId } from './validators.js';

/**
 * Extrae texto de un archivo .docx usando Mammoth
 * @param {File} file 
 * @returns {Promise<string>}
 */
export async function extractTextFromDocx(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value || '');
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extrae texto unificado de cualquier documento soportado (PDF, Word .docx/.doc, TXT)
 * @param {File} file 
 * @returns {Promise<{ text: string, fileType: 'pdf'|'docx'|'txt' }>}
 */
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 Megabytes

export async function extractTextFromFile(file) {
  if (!file) {
    throw new Error('No se ha proporcionado ningún archivo.');
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error('El archivo excede el tamaño máximo permitido de 10 MB.');
  }

  const fileName = (file.name || '').toLowerCase();

  if (fileName.endsWith('.pdf')) {
    const text = await extractTextFromPdf(file);
    return { text, fileType: 'pdf' };
  }

  if (fileName.endsWith('.docx')) {
    const text = await extractTextFromDocx(file);
    return { text, fileType: 'docx' };
  }

  if (fileName.endsWith('.doc')) {
    throw new Error('El formato Word binario antiguo (.doc) no es compatible. Por favor guárdalo como .docx (Word moderno) o expórtalo a PDF.');
  }

  if (fileName.endsWith('.txt')) {
    const text = await file.text();
    return { text, fileType: 'txt' };
  }

  throw new Error('Formato no soportado. Por favor sube un documento PDF (.pdf) o Word (.docx).');
}

/**
 * Helper to clean text
 */
function cleanLineText(line = '') {
  return line.replace(/^[\s•*–—·-]+\s*/, '').trim();
}

/**
 * Helper to format seconds to MM:SS
 */
export function formatSecondsToTimer(sec = 0) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Parser inteligente de rutinas y entrenamientos para HIFT Iron Box
 * Soporta formato oficial HIFT: Every X'X" x R - T', E2MOM, Every S", Warm-up, WODs y Gimnasio tradicional.
 * @param {string} rawText 
 * @param {string} defaultDayId 
 * @returns {object} Rutina estructurada lista para publicar en la app
 */
export function parseWorkoutText(rawText, defaultDayId = 'mon') {
  if (!rawText || !rawText.trim()) {
    throw new Error('El documento está vacío o no contiene texto legible.');
  }

  const rawLines = rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (rawLines.length === 0) {
    throw new Error('No se detectaron líneas de texto para procesar.');
  }

  // Filtrar cabeceras y pies de página típicos de documentos impresos
  const filteredLines = [];
  let headerDescription = '';

  for (const line of rawLines) {
    // Descartar números de página y membretes
    if (/^hift iron box\s*[-–]\s*sesi[oó]n.*p[aá]gina/i.test(line) || /^p[aá]gina\s*\d+/i.test(line)) {
      continue;
    }
    // Guardar descripción metodológica si aparece
    if (/sesi[oó]n base generada siguiendo|metodolog[ií]a|criterios de calentamiento/i.test(line)) {
      headerDescription = line;
      continue;
    }
    filteredLines.push(line);
  }

  if (filteredLines.length === 0) {
    throw new Error('El documento no contiene contenido de entrenamiento válido.');
  }

  // Detectar Día de la Semana con límites de palabra estrictos para evitar falsos positivos
  // (por ejemplo: 'dominadas' no debe activar 'dom', ni 'martillo' debe activar 'mar')
  let detectedDayId = defaultDayId;
  const dayPatterns = [
    { regex: /\b(lunes|mon|lun)\b/i, id: 'mon' },
    { regex: /\b(martes|tue|mar)\b/i, id: 'tue' },
    { regex: /\b(mi[eé]rcoles|wed|mie)\b/i, id: 'wed' },
    { regex: /\b(jueves|thu|jue)\b/i, id: 'thu' },
    { regex: /\b(viernes|fri|vie)\b/i, id: 'fri' },
    { regex: /\b(s[aá]bado|sat|s[aá]b)\b/i, id: 'sat' },
    { regex: /\b(domingo|sun|dom)\b/i, id: 'sun' }
  ];

  let dayDetected = false;
  for (const line of filteredLines.slice(0, 10)) {
    for (const dp of dayPatterns) {
      if (dp.regex.test(line)) {
        detectedDayId = dp.id;
        dayDetected = true;
        break;
      }
    }
    if (dayDetected) break; // Detener una vez hallado el día para no sobreescribir con ejercicios posteriores
  }

  // Detectar Duración Estimada total
  let totalEstimatedDuration = '45 MIN';
  const durationMatch = rawText.match(/duraci[oó]n\s*estimada\s*:\s*(\d+)['\s*min]*/i);
  if (durationMatch) {
    totalEstimatedDuration = `${durationMatch[1]} MIN`;
  }

  // Detección de Título y Subtítulo
  let title = filteredLines[0].trim();
  let subtitle = '';

  if (filteredLines.length > 1 && !/warm-?up|calentamiento|every|emom|bloque|parte/i.test(filteredLines[1])) {
    if (/^[A-Z0-9-]+\s*[-–]\s*/i.test(filteredLines[1]) || filteredLines[1].length < 40) {
      subtitle = filteredLines[1].trim();
    }
  }

  // Detectar Zona, Categoría y Grupo Muscular
  const lowerText = rawText.toLowerCase();
  let detectedZone = 'traditional';
  let detectedCategory = 'gym';
  let detectedType = 'HIFT / HIPERTROFIA';
  let detectedMuscleGroup = 'full_body';

  if (lowerText.includes('competitor') || lowerText.includes('crossfit') || lowerText.includes('metcon') || lowerText.includes('halterofilia')) {
    detectedZone = 'competitors';
    detectedCategory = 'crossfit_competitor';
    detectedType = 'COMPETITORS / WOD';
  } else {
    detectedZone = 'traditional';
    detectedCategory = 'gym';
    detectedType = 'HIFT STRENGTH / HYPERTROPHY';
  }

  if (lowerText.includes('lower body') || lowerText.includes('lb-') || lowerText.includes('pierna') || lowerText.includes('glúteo') || lowerText.includes('gluteo')) {
    detectedMuscleGroup = 'legs_glutes';
  } else if (lowerText.includes('upper body') || lowerText.includes('ub-') || lowerText.includes('torso')) {
    detectedMuscleGroup = 'chest_triceps';
  } else if (lowerText.includes('core') && !lowerText.includes('lower body')) {
    detectedMuscleGroup = 'core_mobility';
  }

  // Parser de Bloques / Secciones
  const sections = [];
  let currentSection = null;

  // Regex para detectar cabeceras de bloque (soporta A -, A), Bloque A, 1 -, I -)
  // 1. Warm-up - 8'
  const warmupRegex = /^(?:warm-?up|calentamiento)(?:\s*[-–:]\s*(\d+)['\s*min]*)?/i;
  // 2. A - Every 2'30" x 4 - 10' o A) Every...
  const everyMinSecRegex = /^([A-Z\d]+|[IVX]+)[\s).–-]+\s*every\s*(\d+)'(?:(\d+)"?)?\s*x\s*(\d+)(?:\s*[-–:]\s*(\d+)['\s*min]*)?/i;
  // 3. C - E2MOM x 4 - 8' o EMOM x 4
  const emomRegex = /^([A-Z\d]+|[IVX]+)[\s).–-]+\s*e(\d*)mom\s*x\s*(\d+)(?:\s*[-–:]\s*(\d+)['\s*min]*)?/i;
  // 4. D - Every 90" x 4 - 6'
  const everySecRegex = /^([A-Z\d]+|[IVX]+)[\s).–-]+\s*every\s*(\d+)"\s*x\s*(\d+)(?:\s*[-–:]\s*(\d+)['\s*min]*)?/i;
  // 5. AMRAP X' o FOR TIME Cap X'
  const amrapRegex = /^(?:([A-Z\d]+)\s*[-–:)]\s*)?amrap\s*(\d+)['\s*min]*/i;
  const forTimeRegex = /^(?:([A-Z\d]+)\s*[-–:)]\s*)?for\s*time.*?(?:cap|tiempo)?\s*(\d+)['\s*min]*/i;
  // 6. Bloque tradicional / Grupo
  const genericBlockRegex = /^(?:bloque|parte|grupo)\s*([A-Z\d]+)[:\s-]*(.*)/i;

  const pushCurrentSection = () => {
    if (currentSection && (currentSection.exercises.length > 0 || currentSection.isSpecialBlock)) {
      sections.push({ ...currentSection });
    }
  };

  // Comenzar a escanear líneas a partir del final del encabezado
  let startIndex = 1;
  if (subtitle && filteredLines[1] === subtitle) {
    startIndex = 2;
  }

  for (let i = startIndex; i < filteredLines.length; i++) {
    const line = filteredLines[i].trim();

    // Descartar duración estimada (ya fue capturada)
    if (/^duraci[oó]n\s*estimada/i.test(line)) {
      continue;
    }

    // 1. Warm-up
    const warmMatch = line.match(warmupRegex);
    if (warmMatch) {
      pushCurrentSection();
      const minutes = parseInt(warmMatch[1]) || 8;
      currentSection = {
        name: `Warm-up (${minutes} min)`,
        blockLetter: 'W',
        duration: `${minutes} min`,
        blockType: 'warmup',
        targetTimerType: 'countdown',
        rounds: 2, // Por defecto calentamiento suele tener 2 rondas
        timerMinutes: minutes,
        groupTimer: {
          seconds: 60, // descanso o 60s entre rondas
          intervalSeconds: 60,
          label: `Calentamiento (${minutes} min) - 2 Rondas`,
          type: 'rest',
          rounds: 2,
          totalMinutes: minutes
        },
        exercises: []
      };
      continue;
    }

    // 2. Every M'S" x R - T' (Ej: A - Every 2'30" x 4 - 10')
    const everyMSMatch = line.match(everyMinSecRegex);
    if (everyMSMatch) {
      pushCurrentSection();
      const letter = everyMSMatch[1].toUpperCase();
      const intervalMin = parseInt(everyMSMatch[2]) || 0;
      const intervalSec = parseInt(everyMSMatch[3]) || 0;
      const intervalTotalSeconds = (intervalMin * 60) + intervalSec;
      const rounds = parseInt(everyMSMatch[4]) || 4;
      const totalMin = everyMSMatch[5] ? parseInt(everyMSMatch[5]) : Math.round((intervalTotalSeconds * rounds) / 60);

      const intervalLabel = `${intervalMin}'${intervalSec > 0 ? `${intervalSec.toString().padStart(2, '0')}"` : ''}`;

      currentSection = {
        name: `Bloque ${letter} - Every ${intervalLabel} x ${rounds} (${totalMin} min)`,
        blockLetter: letter,
        duration: `${totalMin} min`,
        blockType: 'interval',
        targetTimerType: 'interval',
        rounds: rounds,
        timerMinutes: totalMin,
        groupTimer: {
          seconds: intervalTotalSeconds,
          intervalSeconds: intervalTotalSeconds,
          label: `Every ${intervalLabel} (${rounds} rondas - ${totalMin} min)`,
          type: 'interval',
          rounds: rounds,
          totalMinutes: totalMin
        },
        exercises: []
      };
      continue;
    }

    // 3. E2MOM x R - T' (Ej: C - E2MOM x 4 - 8')
    const emomMatch = line.match(emomRegex);
    if (emomMatch) {
      pushCurrentSection();
      const letter = emomMatch[1].toUpperCase();
      const emomEveryMin = emomMatch[2] ? parseInt(emomMatch[2]) : 1;
      const rounds = parseInt(emomMatch[3]) || 4;
      const intervalTotalSeconds = emomEveryMin * 60;
      const totalMin = emomMatch[4] ? parseInt(emomMatch[4]) : emomEveryMin * rounds;
      const emomTitle = emomEveryMin > 1 ? `E${emomEveryMin}MOM` : 'EMOM';

      currentSection = {
        name: `Bloque ${letter} - ${emomTitle} x ${rounds} (${totalMin} min)`,
        blockLetter: letter,
        duration: `${totalMin} min`,
        blockType: 'emom',
        targetTimerType: 'emom',
        rounds: rounds,
        timerMinutes: totalMin,
        groupTimer: {
          seconds: intervalTotalSeconds,
          intervalSeconds: intervalTotalSeconds,
          label: `${emomTitle} (Cada ${emomEveryMin} min x ${rounds} rondas)`,
          type: 'emom',
          rounds: rounds,
          totalMinutes: totalMin
        },
        exercises: []
      };
      continue;
    }

    // 4. Every S" x R - T' (Ej: D - Every 90" x 4 - 6')
    const everySecMatch = line.match(everySecRegex);
    if (everySecMatch) {
      pushCurrentSection();
      const letter = everySecMatch[1].toUpperCase();
      const intervalSec = parseInt(everySecMatch[2]) || 90;
      const rounds = parseInt(everySecMatch[3]) || 4;
      const totalMin = everySecMatch[4] ? parseInt(everySecMatch[4]) : Math.round((intervalSec * rounds) / 60);

      currentSection = {
        name: `Bloque ${letter} - Every ${intervalSec}" x ${rounds} (${totalMin} min)`,
        blockLetter: letter,
        duration: `${totalMin} min`,
        blockType: 'interval',
        targetTimerType: 'interval',
        rounds: rounds,
        timerMinutes: totalMin,
        groupTimer: {
          seconds: intervalSec,
          intervalSeconds: intervalSec,
          label: `Every ${intervalSec}" (${rounds} rondas - ${totalMin} min)`,
          type: 'interval',
          rounds: rounds,
          totalMinutes: totalMin
        },
        exercises: []
      };
      continue;
    }

    // 5. AMRAP o FOR TIME
    const amrapMatch = line.match(amrapRegex);
    if (amrapMatch) {
      pushCurrentSection();
      const letter = amrapMatch[1] ? amrapMatch[1].toUpperCase() : 'WOD';
      const minutes = parseInt(amrapMatch[2]) || 15;
      currentSection = {
        name: `Bloque ${letter} - AMRAP ${minutes} MIN`,
        blockLetter: letter,
        duration: `${minutes} min`,
        blockType: 'metcon_wod',
        targetTimerType: 'amrap',
        timerMinutes: minutes,
        groupTimer: {
          seconds: minutes * 60,
          intervalSeconds: minutes * 60,
          label: `AMRAP ${minutes} MIN`,
          type: 'amrap',
          totalMinutes: minutes
        },
        exercises: []
      };
      continue;
    }

    const forTimeMatch = line.match(forTimeRegex);
    if (forTimeMatch) {
      pushCurrentSection();
      const letter = forTimeMatch[1] ? forTimeMatch[1].toUpperCase() : 'WOD';
      const minutes = parseInt(forTimeMatch[2]) || 20;
      currentSection = {
        name: `Bloque ${letter} - FOR TIME (Cap ${minutes}')`,
        blockLetter: letter,
        duration: `${minutes} min`,
        blockType: 'metcon_wod',
        targetTimerType: 'fortime',
        timerMinutes: minutes,
        groupTimer: {
          seconds: minutes * 60,
          intervalSeconds: minutes * 60,
          label: `FOR TIME (Time Cap: ${minutes} min)`,
          type: 'countdown',
          totalMinutes: minutes
        },
        exercises: []
      };
      continue;
    }

    // 6. Bloque tradicional / Grupo
    const genericMatch = line.match(genericBlockRegex);
    if (genericMatch) {
      pushCurrentSection();
      const blockId = genericMatch[1].toUpperCase();
      const blockTitle = genericMatch[2]?.trim() || `Bloque ${blockId}`;
      currentSection = {
        name: `Bloque ${blockId}: ${blockTitle}`,
        blockLetter: blockId,
        duration: '15 min',
        blockType: 'traditional',
        rounds: 4,
        groupTimer: {
          seconds: 90,
          intervalSeconds: 90,
          label: `Descanso Bloque ${blockId} (90s)`,
          type: 'rest',
          rounds: 4
        },
        exercises: []
      };
      continue;
    }

    // Si aún no se ha abierto ninguna sección y la línea no es una cabecera de bloque:
    // Podría ser un subtítulo adicional o descripción. NO crear sección falsa a menos que sea un ejercicio explícito con viñeta.
    if (!currentSection) {
      if (/^[•*–—·-]/.test(line)) {
        currentSection = {
          name: 'Bloque A - Principal',
          blockLetter: 'A',
          duration: '15 min',
          blockType: 'traditional',
          rounds: 4,
          groupTimer: {
            seconds: 90,
            intervalSeconds: 90,
            label: 'Descanso 90s',
            type: 'rest',
            rounds: 4
          },
          exercises: []
        };
      } else {
        // Línea informativa previa a los bloques (subtítulo o nota)
        if (!subtitle) {
          subtitle = line;
        }
        continue;
      }
    }

    // Detectar línea de rondas (ej: "2 rondas:" o "4 rondas")
    const rondasMatch = line.match(/^(\d+)\s*rondas?:?/i);
    if (rondasMatch) {
      const numRondas = parseInt(rondasMatch[1]);
      currentSection.rounds = numRondas;
      if (currentSection.groupTimer) {
        currentSection.groupTimer.rounds = numRondas;
      }
      continue;
    }

    // Detectar notas de fatiga/RIR al pie del bloque (ej: "RIR 2-3.")
    const standaloneRirMatch = line.match(/^RIR\s*([\d-]+)\.?/i);
    if (standaloneRirMatch) {
      const rirVal = `RIR ${standaloneRirMatch[1]}`;
      // Asignar a los ejercicios del bloque que no tengan RIR explícito
      currentSection.exercises.forEach(ex => {
        if (!ex.notes) ex.notes = rirVal;
      });
      continue;
    }

    // Parsear ejercicio individual
    const cleanLine = cleanLineText(line);
    if (cleanLine.length > 0) {
      let exerciseName = cleanLine;
      let reps = 'Completar';
      let rir = '';
      let notes = '';

      // 1. Extraer RIR si viene al final con guión: " - RIR 2" o "- RIR 1-2"
      const rirMatch = cleanLine.match(/[-–]\s*(RIR\s*[\d-]+)/i);
      if (rirMatch) {
        rir = rirMatch[1].trim();
        exerciseName = exerciseName.replace(rirMatch[0], '').trim();
      }

      // 2. Extraer notas entre paréntesis si existen: " (con pausa 3s)"
      const parenMatch = exerciseName.match(/\((.*?)\)/);
      if (parenMatch) {
        notes = parenMatch[1].trim();
        exerciseName = exerciseName.replace(parenMatch[0], '').trim();
      }

      // 3. Extraer repeticiones / tiempo:
      // Formatos soportados:
      // - "x 6-8"
      // - "x 8+8" o "x 6+6"
      // - "x 4 aproximación"
      // - "15"+15""
      // - "20""
      // - "x 10"
      // - "x 12-15"
      const repsXMatch = exerciseName.match(/\s*x\s*(\d+[\d-]*\s*aproximaci[oó]n|\d+[\d-]*\s*\+\s*\d+|\d+[\d-]*\s*reps?|\d+[\d-]*)/i);
      const timeRepsMatch = exerciseName.match(/(\d+["']?\s*\+\s*\d+["']?|\d+["'])$/);

      if (repsXMatch) {
        reps = repsXMatch[1].trim();
        exerciseName = exerciseName.substring(0, repsXMatch.index).trim();
      } else if (timeRepsMatch) {
        reps = timeRepsMatch[1].trim();
        exerciseName = exerciseName.substring(0, timeRepsMatch.index).trim();
      }

      const setsLabel = currentSection.rounds ? `${currentSection.rounds} rondas` : '4 series';
      const finalNotes = rir ? (notes ? `${notes} · ${rir}` : rir) : notes;

      currentSection.exercises.push({
        name: exerciseName || cleanLine,
        sets: setsLabel,
        reps: reps,
        rir: rir,
        notes: finalNotes
      });
    }
  }

  // Guardar última sección procesada
  pushCurrentSection();

  // Si no se detectó ninguna sección estructurada, crear bloque único fallback
  if (sections.length === 0) {
    sections.push({
      name: 'Bloque Principal',
      duration: totalEstimatedDuration,
      blockType: 'traditional',
      groupTimer: { seconds: 90, label: 'Descanso 90s', type: 'rest', rounds: 4 },
      exercises: filteredLines.slice(startIndex).map(l => ({
        name: cleanLineText(l),
        sets: '4 series',
        reps: 'Completar',
        notes: ''
      }))
    });
  }

  // Determinar timer principal de la rutina
  let workoutTargetTimerType = null;
  let workoutTimerMinutes = parseInt(totalEstimatedDuration) || 42;

  const firstIntervalSection = sections.find(s => s.targetTimerType && s.blockType !== 'warmup') || sections.find(s => s.targetTimerType);
  if (firstIntervalSection) {
    workoutTargetTimerType = firstIntervalSection.targetTimerType;
    workoutTimerMinutes = firstIntervalSection.timerMinutes || workoutTimerMinutes;
  }

  return {
    id: generateSecureId('wod'),
    dayId: detectedDayId,
    title: title || 'LOWER BODY + CORE',
    subtitle: subtitle || 'LB-2 - Bloques de 3',
    zone: detectedZone,
    category: detectedCategory,
    muscleGroup: detectedMuscleGroup,
    type: detectedType,
    duration: totalEstimatedDuration,
    level: 'Todos los niveles',
    description: headerDescription || `Sesión generada para HIFT Iron Box con temporizadores por intervalos.`,
    targetTimerType: workoutTargetTimerType,
    timerMinutes: workoutTimerMinutes,
    sections: sections,
    isImported: true,
    importedAt: new Date().toLocaleDateString('es-ES')
  };
}
