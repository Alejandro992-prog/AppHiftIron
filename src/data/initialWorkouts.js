export const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Lun', fullLabel: 'Lunes' },
  { id: 'tue', label: 'Mar', fullLabel: 'Martes' },
  { id: 'wed', label: 'Mié', fullLabel: 'Miércoles' },
  { id: 'thu', label: 'Jue', fullLabel: 'Jueves' },
  { id: 'fri', label: 'Vie', fullLabel: 'Viernes' },
  { id: 'sat', label: 'Sáb', fullLabel: 'Sábado' },
  { id: 'sun', label: 'Dom', fullLabel: 'Domingo' }
];

export const MUSCLE_GROUPS = [
  { id: 'all', label: 'Todos los Músculos' },
  { id: 'full_body', label: 'Full Body' },
  { id: 'biceps_triceps', label: 'Bíceps y Tríceps' },
  { id: 'back_shoulders', label: 'Espalda y Hombros' },
  { id: 'chest_triceps', label: 'Pecho y Tríceps' },
  { id: 'legs_glutes', label: 'Pierna y Glúteo' },
  { id: 'crossfit_wod', label: 'WOD CrossFit Box' }
];

export const INITIAL_WORKOUTS = [
  {
    id: 'gym-full-body-1',
    dayId: 'sat',
    muscleGroup: 'full_body',
    title: 'Full Body - Fuerza & Rendimiento Total',
    category: 'gym',
    type: 'GIMNASIO / FULL BODY',
    duration: '55 MIN',
    level: 'Intermedio / Avanzado',
    description: 'Rutina completa de cuerpo entero para máxima activación neuromuscular, densidad y desarrollo de fuerza global.',
    sections: [
      {
        name: 'GRUPO 1: ACTIVACIÓN & CALENTAMIENTO',
        duration: '8 min',
        groupTimer: { seconds: 60, label: 'Descanso de movilidad', type: 'rest' },
        exercises: [
          { name: 'Remo ergómetro a ritmo moderado', sets: '1 set', reps: '500m', notes: 'Activar ritmo cardíaco y temperatura' },
          { name: 'Rotaciones escapulares con goma elástica', sets: '2 sets', reps: '15 reps', notes: 'Foco en manguito rotador' },
          { name: 'Sentadilla profunda con peso corporal (pausa abajo)', sets: '2 sets', reps: '10 reps', notes: '2 segundos de pausa en fondo' }
        ]
      },
      {
        name: 'GRUPO 2: TREN INFERIOR PESADO (SENTADILLA)',
        duration: '15 min',
        groupTimer: { seconds: 120, label: 'Descanso entre series pesadas (2 min)', type: 'rest' },
        exercises: [
          { name: 'Sentadilla Trasera con barra (Back Squat)', sets: '4 sets', reps: '6-8 reps', notes: 'Carga pesada 75-80% 1RM. Romper paralelo con control.' },
          { name: 'Prensa de piernas inclinada 45°', sets: '3 sets', reps: '10-12 reps', notes: 'Pies a anchura de hombros, bajar profundo sin despegar lumbar.' }
        ]
      },
      {
        name: 'GRUPO 3: TREN SUPERIOR (EMPUJE Y TIRÓN)',
        duration: '18 min',
        groupTimer: { seconds: 90, label: 'Descanso torso (90 seg)', type: 'rest' },
        exercises: [
          { name: 'Press de Banca Plano con barra olímpica', sets: '4 sets', reps: '8 reps', notes: 'Retracción escapular, parada de 1 seg en pecho.' },
          { name: 'Remo con mancuerna a una mano en banco', sets: '4 sets', reps: '10 reps por brazo', notes: 'Tirar con el codo hacia la cadera, estiramiento completo.' },
          { name: 'Press Militar de pie con mancuernas', sets: '3 sets', reps: '10 reps', notes: 'Tronco firme y glúteos apretados.' }
        ]
      },
      {
        name: 'GRUPO 4: CORE Y BOMBEO FINAL',
        duration: '10 min',
        groupTimer: { seconds: 60, label: 'Descanso final (60 seg)', type: 'rest' },
        exercises: [
          { name: 'Elevaciones de piernas colgado en barra', sets: '3 sets', reps: '12-15 reps', notes: 'Sin balanceo, control abdominal.' },
          { name: 'Face Pulls en polea alta con cuerda', sets: '3 sets', reps: '15 reps', notes: 'Deltoides posterior y salud articular.' }
        ]
      }
    ]
  },
  {
    id: 'gym-biceps-triceps-1',
    dayId: 'fri',
    muscleGroup: 'biceps_triceps',
    title: 'Bíceps y Tríceps - Arm Day Superseries',
    category: 'gym',
    type: 'GIMNASIO / BRAZOS',
    duration: '45 MIN',
    level: 'Todos los niveles',
    description: 'Enfoque directo en brazos con combinaciones de superseries antagónicas para máximo bombeo y desarrollo de picos y tríceps.',
    sections: [
      {
        name: 'GRUPO 1: CALENTAMIENTO ARTICULAR DE CODOS',
        duration: '6 min',
        groupTimer: { seconds: 45, label: 'Descanso de activación (45s)', type: 'rest' },
        exercises: [
          { name: 'Extensiones de tríceps en polea con cuerda liviana', sets: '2 sets', reps: '20 reps', notes: 'Bombeo de líquido sinovial a los codos' },
          { name: 'Curl de bíceps con mancuernas ligeras', sets: '2 sets', reps: '20 reps', notes: 'Rango completo y control' }
        ]
      },
      {
        name: 'GRUPO 2: SUPERSERIE DE FUERZA (TRÍCEPS & BÍCEPS)',
        duration: '16 min',
        groupTimer: { seconds: 90, label: 'Descanso entre superseries (90s)', type: 'rest' },
        exercises: [
          { name: 'Press Francés con barra Z en banco plano', sets: '4 sets', reps: '8-10 reps', notes: 'Bajar hacia la frente manteniendo codos cerrados.' },
          { name: 'Curl con barra Z de pie (agarre medio)', sets: '4 sets', reps: '8-10 reps', notes: 'Sin balancear torso, apretar 1s en contracción máxima.' }
        ]
      },
      {
        name: 'GRUPO 3: SUPERSERIE DE AISLAMIENTO & BRAQUIAL',
        duration: '14 min',
        groupTimer: { seconds: 75, label: 'Descanso de aislamiento (75s)', type: 'rest' },
        exercises: [
          { name: 'Extensiones en polea alta con barra V', sets: '3 sets', reps: '12 reps', notes: 'Bloqueo completo abajo apretando tríceps.' },
          { name: 'Curl Martillo con mancuernas en banco inclinado', sets: '3 sets', reps: '10-12 reps', notes: 'Foco en braquial y antebrazo para mayor grosor de brazo.' }
        ]
      },
      {
        name: 'GRUPO 4: DROP SET FINAL AL FALLO',
        duration: '8 min',
        groupTimer: { seconds: 60, label: 'Descanso drop-set (60s)', type: 'rest' },
        exercises: [
          { name: 'Fondos en paralelas o entre bancos', sets: '3 sets', reps: 'Al fallo (12-15 reps)', notes: 'Cuerpo vertical para priorizar tríceps.' },
          { name: 'Curl concentrado a una mano en polea baja', sets: '3 sets', reps: '12 reps por brazo', notes: 'Apretar el pico del bíceps arriba.' }
        ]
      }
    ]
  },
  {
    id: 'gym-back-shoulders-1',
    dayId: 'tue',
    muscleGroup: 'back_shoulders',
    title: 'Espalda y Hombros - V-Taper & Densidad',
    category: 'gym',
    type: 'GIMNASIO / TIRÓN & HOMBRO',
    duration: '50 MIN',
    level: 'Intermedio / Avanzado',
    description: 'Combinación perfecta para lograr amplitud dorsal en V y hombros redondeados en 3D.',
    sections: [
      {
        name: 'GRUPO 1: ACTIVACIÓN ESCAPULAR Y HOMBROS',
        duration: '7 min',
        groupTimer: { seconds: 60, label: 'Descanso calentamiento (60s)', type: 'rest' },
        exercises: [
          { name: 'Dislocaciones de hombro con pica PVC', sets: '2 sets', reps: '12 reps', notes: 'Movilidad articular completa' },
          { name: 'Jalones al pecho en polea con agarre ancho (muy ligero)', sets: '2 sets', reps: '15 reps', notes: 'Apretar escápulas abajo' }
        ]
      },
      {
        name: 'GRUPO 2: FUERZA VERTICAL Y DENSIDAD DORSAL',
        duration: '16 min',
        groupTimer: { seconds: 90, label: 'Descanso de espalda (90s)', type: 'rest' },
        exercises: [
          { name: 'Dominadas con peso corporal o lastre', sets: '4 sets', reps: '6-8 reps', notes: 'Pecho a la barra, barbilla pasa la línea superior.' },
          { name: 'Remo con barra olímpica inclinada (agarre prono)', sets: '4 sets', reps: '8-10 reps', notes: 'Espalda recta a 45 grados, barra toca ombligo.' }
        ]
      },
      {
        name: 'GRUPO 3: HOMBROS PESADOS & REMO UNILATERAL',
        duration: '15 min',
        groupTimer: { seconds: 90, label: 'Descanso deltoides (90s)', type: 'rest' },
        exercises: [
          { name: 'Press Militar sentado con mancuernas', sets: '4 sets', reps: '8-10 reps', notes: 'Bajar hasta altura de orejas y empujar sin arquear espalda.' },
          { name: 'Remo en polea baja con agarre estrecho (gironda)', sets: '3 sets', reps: '10-12 reps', notes: 'Apretar dorsal 1 segundo en la máxima contracción.' }
        ]
      },
      {
        name: 'GRUPO 4: AISLAMIENTO DELTOIDES LATERAL Y POSTERIOR',
        duration: '10 min',
        groupTimer: { seconds: 60, label: 'Descanso lateral (60s)', type: 'rest' },
        exercises: [
          { name: 'Elevaciones laterales con mancuernas', sets: '4 sets', reps: '12-15 reps', notes: 'Codos ligeramente flexionados, control en la bajada.' },
          { name: 'Pájaros con mancuernas para deltoides posterior', sets: '3 sets', reps: '15 reps', notes: 'En banco inclinado, mirada al suelo.' }
        ]
      }
    ]
  },
  {
    id: 'gym-chest-triceps-1',
    dayId: 'mon',
    muscleGroup: 'chest_triceps',
    title: 'Pecho y Tríceps - Empuje & Cargas Pesadas',
    category: 'gym',
    type: 'GIMNASIO / EMPUJE',
    duration: '50 MIN',
    level: 'Todos los niveles',
    description: 'La clásica sesión de empuje para desarrollar un pecho denso y potente complementado con trabajo accesorio de tríceps.',
    sections: [
      {
        name: 'GRUPO 1: CALENTAMIENTO Y MANGUITO ROTADOR',
        duration: '7 min',
        groupTimer: { seconds: 45, label: 'Descanso activación (45s)', type: 'rest' },
        exercises: [
          { name: 'Rotaciones externas con mancuerna de 2kg', sets: '2 sets', reps: '15 reps por brazo', notes: 'Codo pegado al costado' },
          { name: 'Flexiones en suelo con pausa abajo', sets: '2 sets', reps: '10 reps', notes: 'Sentir apertura pectoral' }
        ]
      },
      {
        name: 'GRUPO 2: BÁSICO PESADO (PRESS DE BANCA)',
        duration: '16 min',
        groupTimer: { seconds: 120, label: 'Descanso entre series banca (2 min)', type: 'rest' },
        exercises: [
          { name: 'Press de Banca Plano con barra', sets: '4 sets', reps: '6-8 reps', notes: 'RIR 1-2. Pies clavados en el suelo, retracción escapular.' },
          { name: 'Press Inclinado con mancuernas a 30°', sets: '4 sets', reps: '8-10 reps', notes: 'Foco en la porción clavicular del pectoral.' }
        ]
      },
      {
        name: 'GRUPO 3: APERTURAS & FONDOS PECTORALES',
        duration: '15 min',
        groupTimer: { seconds: 75, label: 'Descanso aperturas (75s)', type: 'rest' },
        exercises: [
          { name: 'Cruces en polea alta hacia abajo', sets: '3 sets', reps: '12-15 reps', notes: 'Cruzar manos ligeramente para máxima contracción.' },
          { name: 'Fondos en paralelas con inclinación frontal', sets: '3 sets', reps: '10-12 reps', notes: 'Tronco inclinado hacia adelante para enfocar el pecho.' }
        ]
      },
      {
        name: 'GRUPO 4: TRÍCEPS DIRECTO (EMPUJE)',
        duration: '10 min',
        groupTimer: { seconds: 60, label: 'Descanso tríceps (60s)', type: 'rest' },
        exercises: [
          { name: 'Press de banca agarre cerrado con barra', sets: '3 sets', reps: '10 reps', notes: 'Manos a anchura de hombros, codos cerca del tronco.' },
          { name: 'Extensiones de tríceps tras nuca con mancuerna', sets: '3 sets', reps: '12 reps', notes: 'Estiramiento profundo de la cabeza larga.' }
        ]
      }
    ]
  },
  {
    id: 'gym-legs-glutes-1',
    dayId: 'wed',
    muscleGroup: 'legs_glutes',
    title: 'Pierna y Glúteo - Fuerza de Tren Inferior',
    category: 'gym',
    type: 'GIMNASIO / PIERNA',
    duration: '55 MIN',
    level: 'Intermedio / Avanzado',
    description: 'Desarrollo muscular integral de cuádriceps, glúteos, isquiotibiales y gemelos con ejercicios multiarticulares.',
    sections: [
      {
        name: 'GRUPO 1: MOVILIDAD DE TOBILLO Y CADERA',
        duration: '8 min',
        groupTimer: { seconds: 60, label: 'Descanso movilidad (60s)', type: 'rest' },
        exercises: [
          { name: 'Zancadas dinámicas con rotación de tronco', sets: '2 sets', reps: '10 reps por pierna', notes: 'Apertura de flexores de cadera' },
          { name: 'Sentadilla en copa con kettlebell (pausa)', sets: '2 sets', reps: '10 reps', notes: 'Foco en empuje de rodillas hacia afuera' }
        ]
      },
      {
        name: 'GRUPO 2: CONSTRUCTOR DE CUÁDRICEPS & FUERZA',
        duration: '18 min',
        groupTimer: { seconds: 120, label: 'Descanso de piernas pesadas (2 min)', type: 'rest' },
        exercises: [
          { name: 'Sentadilla Trasera con barra o Sentadilla Hack', sets: '4 sets', reps: '8 reps', notes: 'Profundidad limpia y subida explosiva.' },
          { name: 'Prensa de piernas con pies bajos (foco cuádriceps)', sets: '3 sets', reps: '10-12 reps', notes: 'Mantener tensión continua sin bloquear rodillas.' }
        ]
      },
      {
        name: 'GRUPO 3: CADENA POSTERIOR (ISQUIOS & GLÚTEOS)',
        duration: '16 min',
        groupTimer: { seconds: 90, label: 'Descanso isquios (90s)', type: 'rest' },
        exercises: [
          { name: 'Peso Muerto Rumano con barra o mancuernas', sets: '4 sets', reps: '8-10 reps', notes: 'Llevar cadera hacia atrás sintiendo tirón en isquiotibiales.' },
          { name: 'Hip Thrust con barra y almohadilla en banco', sets: '3 sets', reps: '10-12 reps', notes: 'Apretar glúteos 2 segundos arriba en cada repetición.' },
          { name: 'Curl femoral tumbado o sentado en máquina', sets: '3 sets', reps: '12-15 reps', notes: 'Control excéntrico de 3 segundos en bajada.' }
        ]
      },
      {
        name: 'GRUPO 4: GEMELOS Y ZANCADAS DE FINALIZACIÓN',
        duration: '10 min',
        groupTimer: { seconds: 60, label: 'Descanso final (60s)', type: 'rest' },
        exercises: [
          { name: 'Zancadas búlgaras con mancuernas', sets: '3 sets', reps: '10 reps por pierna', notes: 'Tronco ligeramente inclinado al frente.' },
          { name: 'Elevación de talones de pie con mancuernas', sets: '4 sets', reps: '15-20 reps', notes: 'Pausa de 1 segundo arriba en puntillas.' }
        ]
      }
    ]
  },
  {
    id: 'wod-crossfit-box-1',
    dayId: 'thu',
    muscleGroup: 'crossfit_wod',
    title: 'CrossFit WOD del Box: "IRON FURY"',
    category: 'crossfit',
    type: 'CROSSFIT WOD / AMRAP',
    duration: '40 MIN',
    level: 'Todos los niveles',
    description: 'Sesión clásica de CrossFit en el tatami del Box combinando levantamiento de barra, gimnásticos y cardio.',
    sections: [
      {
        name: 'GRUPO 1: CALENTAMIENTO WOD',
        duration: '10 min',
        groupTimer: { seconds: 60, label: 'Descanso calentamiento', type: 'rest' },
        exercises: [
          { name: '500m Remo ergómetro suave', sets: '1x', reps: '500m', notes: 'Activar pulsaciones' },
          { name: '10 Inchworms + 15 Air Squats', sets: '2 sets', reps: 'Continuo', notes: 'Calentar articulaciones' }
        ]
      },
      {
        name: 'GRUPO 2: FUERZA - CLEAN & JERK',
        duration: '15 min',
        groupTimer: { seconds: 90, label: 'Descanso levantamiento (90s)', type: 'rest' },
        exercises: [
          { name: 'Power Clean + Push Jerk', sets: '5 sets', reps: '3 reps', notes: '70% a 82.5% de 1RM' }
        ]
      },
      {
        name: 'GRUPO 3: METCON (AMRAP 18 MIN)',
        duration: '18 min',
        targetTimerType: 'amrap',
        timerMinutes: 18,
        groupTimer: { seconds: 1080, label: 'AMRAP 18 MIN (Cronómetro WOD)', type: 'countdown' },
        exercises: [
          { name: '15 Wall Ball Shots (9kg / 6kg)', reps: '15 reps', rx: 'Diana 3.05m' },
          { name: '12 Toes to Bar (T2B)', reps: '12 reps', rx: 'Puntas a la barra' },
          { name: '10 Dumbbell Snatch alterno (22.5kg / 15kg)', reps: '10 reps', rx: 'Salida desde suelo' },
          { name: '12 Cal Remo o Echo Bike', reps: '12 Cal', rx: 'Ritmo sostenido' }
        ]
      }
    ]
  },
  {
    id: 'mob-recovery-1',
    dayId: 'sun',
    muscleGroup: 'core_mobility',
    title: 'Recuperación Activa, Core & Movilidad',
    category: 'mobility',
    type: 'DESCARGA / MOVILIDAD',
    duration: '35 MIN',
    level: 'Todos los niveles',
    description: 'Protocolo de estiramientos, descarga muscular con foam roller y estabilidad del core para preparar la siguiente semana de entrenamiento.',
    sections: [
      {
        name: 'GRUPO 1: DESCARGA CON FOAM ROLLER',
        duration: '12 min',
        groupTimer: { seconds: 90, label: 'Descanso zona', type: 'rest' },
        exercises: [
          { name: 'Pase de Foam Roller en cuádriceps y banda iliotibial', sets: '2 sets', reps: '2 min', notes: 'Liberar puntos de tensión' },
          { name: 'Foam Roller en espalda dorsal y glúteos', sets: '2 sets', reps: '2 min', notes: 'Respiración diafragmática' }
        ]
      },
      {
        name: 'GRUPO 2: ESTIRAMIENTOS PROFUNDOS',
        duration: '15 min',
        groupTimer: { seconds: 60, label: 'Descanso estiramiento', type: 'rest' },
        exercises: [
          { name: 'Couch Stretch (Psoas e isquiotibiales)', sets: '2 sets', reps: '2 min por lado', notes: 'Tronco recto' },
          { name: 'Pigeon Pose para apertura de cadera', sets: '2 sets', reps: '90s por lado', notes: 'Descargar glúteo piramidal' }
        ]
      }
    ]
  }
];

export const INITIAL_PRS = [
  { id: 'pr-1', exercise: 'Press de Banca Plano', weight: '110 kg', date: '18/09/2026', category: 'strength' },
  { id: 'pr-2', exercise: 'Sentadilla con Barra (Squat)', weight: '145 kg', date: '12/09/2026', category: 'strength' },
  { id: 'pr-3', exercise: 'Peso Muerto (Deadlift)', weight: '180 kg', date: '04/09/2026', category: 'strength' },
  { id: 'pr-4', exercise: 'Press Militar con Mancuernas', weight: '34 kg c/u', date: '28/08/2026', category: 'strength' },
  { id: 'pr-5', exercise: 'Curl de Bíceps con Barra Z', weight: '45 kg', date: '20/08/2026', category: 'strength' },
  { id: 'pr-6', exercise: 'Clean & Jerk (CrossFit)', weight: '95 kg', date: '10/08/2026', category: 'weightlifting' }
];

export const SAMPLE_WORD_TEXT = `
RUTINA DE GIMNASIO: ESPALDA Y HOMBROS
Grupo Muscular: Espalda y Hombros
Día asignado: Martes
Duración: 50 MIN

GRUPO 1: CALENTAMIENTO Y ACTIVACIÓN (Descanso: 60s)
- 10 Dislocaciones de hombro con pica
- 15 Face pulls ligeros en polea
- 12 Flexiones escapulares

GRUPO 2: BLOQUE PESADO DE ESPALDA (Descanso: 90s)
- Dominadas con peso corporal o lastre (4 series de 8 reps)
- Remo con barra inclinada a 45 grados (4 series de 8-10 reps)

GRUPO 3: HOMBROS EN 3D (Descanso: 90s)
- Press militar de pie con mancuernas (4 series de 10 reps)
- Remo unilateral con mancuerna en banco (3 series de 10 reps)

GRUPO 4: AISLAMIENTO LATERAL (Descanso: 60s)
- Elevaciones laterales en polea baja (4 series de 12 reps)
- Pájaros en máquina o banco inclinado (3 series de 15 reps)
`;
