import mammoth from 'mammoth';

/**
 * Extracts plain text from an uploaded .docx file using Mammoth
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
 * Intelligent workout text parser for CrossFit / Gym Word documents
 * @param {string} rawText 
 * @param {string} defaultDayId 
 * @returns {object} Structured workout object
 */
export function parseWorkoutText(rawText, defaultDayId = 'mon') {
  if (!rawText || !rawText.trim()) {
    throw new Error('El documento está vacío o no contiene texto legible.');
  }

  const lines = rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    throw new Error('No se detectaron líneas de texto para procesar.');
  }

  // Detect day of week from text
  let detectedDayId = defaultDayId;
  const dayPatterns = [
    { regex: /lunes|mon|lun/i, id: 'mon' },
    { regex: /martes|tue|mar/i, id: 'tue' },
    { regex: /mi[eé]rcoles|wed|mie/i, id: 'wed' },
    { regex: /jueves|thu|jue/i, id: 'thu' },
    { regex: /viernes|fri|vie/i, id: 'fri' },
    { regex: /s[aá]bado|sat|sab/i, id: 'sat' },
    { regex: /domingo|sun|dom/i, id: 'sun' }
  ];

  for (const line of lines.slice(0, 5)) {
    for (const dp of dayPatterns) {
      if (dp.regex.test(line)) {
        detectedDayId = dp.id;
        break;
      }
    }
  }

  // Detect Workout Type
  let detectedType = 'CROSSFIT';
  if (/amrap/i.test(rawText)) detectedType = 'AMRAP';
  else if (/for time|por tiempo/i.test(rawText)) detectedType = 'FOR TIME';
  else if (/emom/i.test(rawText)) detectedType = 'EMOM';
  else if (/tabata/i.test(rawText)) detectedType = 'TABATA';
  else if (/hipertrofia|torso|pierna|gym/i.test(rawText)) detectedType = 'HIPERTROFIA';
  else if (/fuerza|strength/i.test(rawText)) detectedType = 'FUERZA';

  // Detect Category
  let detectedCategory = 'crossfit';
  if (/gym|gimnasio|hipertrofia|mancuerna|banca|polea/i.test(rawText)) {
    detectedCategory = 'gym';
  } else if (/hyrox|endurance|skierg|sled|trineo/i.test(rawText)) {
    detectedCategory = 'hyrox';
  } else if (/movilidad|estiramiento|mobility|foam roller/i.test(rawText)) {
    detectedCategory = 'mobility';
  }

  // Title extraction: First non-metadata line or standard title
  let title = lines[0].replace(/^(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\s*[-:]?\s*/i, '');
  if (title.length < 4 || /categor[ií]a|tipo/i.test(title)) {
    title = `Entrenamiento HIFT ${detectedType}`;
  }

  // Detect sections (e.g. 1. WARM-UP, 2. FUERZA, 3. WOD, etc.)
  const sectionHeaderRegex = /^(\d+[\.\)]|\#+|[A-D]\))\s*(.*)|^(warm-?up|calentamiento|fuerza|strength|skill|metcon|wod|cool-?down|vuelta a la calma|accesorios|bloque\s*\w+)/i;

  const sections = [];
  let currentSection = {
    name: '1. GENERAL / WARM-UP',
    duration: '10 min',
    exercises: []
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is category/type metadata
    if (/^categor[ií]a\s*:/i.test(line) || /^tipo\s*:/i.test(line) || /^nivel\s*:/i.test(line)) {
      continue;
    }

    const isHeader = sectionHeaderRegex.test(line) || (line.endsWith(':') && line.length < 45);

    if (isHeader) {
      if (currentSection.exercises.length > 0) {
        sections.push({ ...currentSection });
      }
      currentSection = {
        name: line.replace(/^[-*•]\s*/, '').replace(/:$/, '').trim(),
        duration: '15 min',
        exercises: []
      };
    } else {
      // It's an exercise or detail line
      const cleanLine = line.replace(/^[-*•–\d+\.]\s*/, '').trim();
      if (cleanLine.length > 0) {
        // Try parsing reps / sets
        let sets = '1x';
        let reps = '';
        let name = cleanLine;
        let notes = '';

        // Match patterns like "4 series de 8 reps" or "3x12" or "15 Wall balls (9kg)"
        const seriesMatch = cleanLine.match(/(\d+)\s*(?:series|sets|x)\s*(?:de\s*)?(\d+[\-\d]*\s*reps?|[^\(\)]+)?/i);
        const parenMatch = cleanLine.match(/\((.*?)\)/);

        if (parenMatch) {
          notes = parenMatch[1];
        }

        if (seriesMatch) {
          sets = `${seriesMatch[1]} sets`;
          if (seriesMatch[2]) reps = seriesMatch[2].trim();
        }

        currentSection.exercises.push({
          name: cleanLine.split('(')[0].trim(),
          sets: sets,
          reps: reps || 'Según prescripción',
          notes: notes
        });
      }
    }
  }

  // Push final section
  if (currentSection.exercises.length > 0) {
    sections.push(currentSection);
  }

  // Fallback if no sections were parsed
  if (sections.length === 0) {
    sections.push({
      name: 'BLOQUE PRINCIPAL',
      duration: '45 min',
      exercises: lines.slice(1).map(l => ({
        name: l.replace(/^[-*•\d+\.]\s*/, '').trim(),
        sets: '1x',
        reps: 'Completar',
        notes: ''
      }))
    });
  }

  return {
    id: `custom-wod-${Date.now()}`,
    dayId: detectedDayId,
    title: title,
    category: detectedCategory,
    type: detectedType,
    duration: '45 MIN',
    level: 'Todos los niveles',
    description: `Rutina importada desde documento Word para HIFT Iron Box.`,
    sections: sections,
    isImported: true,
    importedAt: new Date().toLocaleDateString('es-ES')
  };
}
