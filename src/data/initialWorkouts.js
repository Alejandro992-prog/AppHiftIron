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
  { id: 'core_mobility', label: 'Core y Movilidad' }
];

// ============================================================================
// 1. ZONA COMPETIDORES (CROSSFIT DE ALTO RENDIMIENTO)
// ============================================================================
export const COMPETITOR_WORKOUTS = [
  {
    id: 'comp-mon-snatch-engine',
    zone: 'competitors',
    dayId: 'mon',
    title: 'Snatch Wave & Gymnastic Density',
    category: 'crossfit_competitor',
    type: 'COMPETITORS / OLYMPIC LIFTING & METCON',
    duration: '85 MIN',
    level: 'Atletas Avanzados / Rx',
    description: 'Sesión de inicio de semana: Levantamiento olímpico de arrancada al 80-88% 1RM, volumen de Muscle-Ups en fatiga y metcon de capacidad aeróbica.',
    sections: [
      {
        name: 'BLOQUE 1: ACTIVACIÓN ARTICULAR & OLY WARM-UP',
        duration: '15 min',
        blockType: 'warmup',
        groupTimer: { seconds: 60, label: 'Descanso movilidad', type: 'rest' },
        exercises: [
          { name: '1000m Remo a ritmo suave + dislocaciones con PVC', sets: '1 set', reps: '1000m', notes: 'Pulsaciones en Zona 2' },
          { name: 'Snatch balance con barra vacía + OHS con pausa 3s', sets: '3 sets', reps: '5 reps', notes: 'Fijar estabilidad escapular en fondo' },
          { name: 'Drop Snatch dinámico', sets: '3 sets', reps: '3 reps', notes: 'Rapidez de pies y bloqueo de codos' }
        ]
      },
      {
        name: 'BLOQUE 2: HALTEROFILIA - SNATCH COMPLEX',
        duration: '25 min',
        blockType: 'weightlifting',
        groupTimer: { seconds: 120, label: 'Descanso entre levantamientos pesados (2 min)', type: 'rest' },
        exercises: [
          { 
            name: '1 Squat Snatch + 1 Hang Squat Snatch (desde rodillas) + 1 Overhead Squat', 
            sets: '6 sets', 
            reps: '1 complex', 
            notes: 'Subir progresivo: Set 1-2 al 75%, Set 3-4 al 80%, Set 5-6 al 85% de 1RM Snatch. Sin soltar barra.',
            rx: 'Hombre: 80-95 kg / Mujer: 55-65 kg'
          }
        ]
      },
      {
        name: 'BLOQUE 3: GIMNÁSTICOS DE ALTA DEMANDA (BMU DENSITY)',
        duration: '15 min',
        blockType: 'gymnastics',
        groupTimer: { seconds: 90, label: 'Descanso entre rondas (90s)', type: 'rest' },
        exercises: [
          { 
            name: 'Every 90s x 6 Rounds: 4 Bar Muscle-Ups unbroken + 15 Unbroken Double Unders', 
            sets: '6 rondas', 
            reps: '4 BMU + 15 DU', 
            notes: 'Cadencia controlada, transiciones directas a la comba sin tropiezos.',
            rx: 'Bar Muscle-Ups estrictos o con kipping limpio'
          }
        ]
      },
      {
        name: 'BLOQUE 4: METCON ENGINE - "OXYGEN DEBT" (FOR TIME)',
        duration: '20 min',
        blockType: 'metcon_wod',
        targetTimerType: 'for_time',
        timerMinutes: 20,
        groupTimer: { seconds: 1200, label: 'Time Cap: 20 MIN (Cronómetro WOD)', type: 'countdown' },
        exercises: [
          { name: '40 Cal Echo Bike / Assault Bike', sets: '1 ronda', reps: '40 Cal', rx: 'Ritmo sostenido >65 RPM' },
          { name: '30 Dumbbell Snatch alternados con 22.5kg / 15kg', sets: '1 ronda', reps: '30 reps', rx: '22.5kg / 15kg' },
          { name: '20 Burpees over the box jump (24" / 20")', sets: '1 ronda', reps: '20 reps', rx: 'Caja 60cm / 50cm' },
          { name: '30 Toes to Bar (T2B unbroken sets)', sets: '1 ronda', reps: '30 reps', rx: 'Series de 10-15 reps' },
          { name: '40 Cal Remo ergómetro', sets: '1 ronda', reps: '40 Cal', rx: 'Cierre al sprint' }
        ]
      },
      {
        name: 'BLOQUE 5: ACCESSORY & CORE DOWN-REGULATION',
        duration: '10 min',
        blockType: 'accessory',
        groupTimer: { seconds: 60, label: 'Descanso accesorios (60s)', type: 'rest' },
        exercises: [
          { name: 'GHD Sit-ups controlados', sets: '3 sets', reps: '15 reps', notes: 'Tocar suelo con las dos manos' },
          { name: 'Sorensen Hold en GHD (isometría lumbar)', sets: '3 sets', reps: '45 segundos', notes: 'Espalda neutra' }
        ]
      }
    ]
  },
  {
    id: 'comp-tue-clean-jerk-cycling',
    zone: 'competitors',
    dayId: 'tue',
    title: 'Clean & Jerk Cycling & HSPU Capacity',
    category: 'crossfit_competitor',
    type: 'COMPETITORS / BARBELL CYCLING & PUSH',
    duration: '80 MIN',
    level: 'Atletas Avanzados / Rx',
    description: 'Enfoque en ciclado de barra bajo fatiga cardíaca y capacidad vertical gimnástica (Handstand Push-ups con déficit).',
    sections: [
      {
        name: 'BLOQUE 1: CALENTAMIENTO ESPECÍFICO DE MUÑECAS Y HOMBROS',
        duration: '12 min',
        blockType: 'warmup',
        groupTimer: { seconds: 60, label: 'Descanso activación', type: 'rest' },
        exercises: [
          { name: 'Front rack mobility con bandas elásticas', sets: '2 sets', reps: '90s', notes: 'Liberar dorsal ancho y tríceps' },
          { name: 'Tall Cleans + Jerk Balance con barra', sets: '3 sets', reps: '5 reps', notes: 'Recepción firme en tijera' }
        ]
      },
      {
        name: 'BLOQUE 2: HALTEROFILIA - CLEAN & JERK PESADO',
        duration: '28 min',
        blockType: 'weightlifting',
        groupTimer: { seconds: 120, label: 'Descanso 2 min entre series pesadas', type: 'rest' },
        exercises: [
          { 
            name: 'Squat Clean + Push Jerk + Split Jerk', 
            sets: '5 sets', 
            reps: '1 complex', 
            notes: 'Progresión de cargas: 78%, 82%, 85%, 88%, 90% de 1RM',
            rx: 'Hombre: 100-120 kg / Mujer: 65-80 kg'
          }
        ]
      },
      {
        name: 'BLOQUE 3: GIMNÁSTICOS - STRICT DEFICIT HSPU',
        duration: '15 min',
        blockType: 'gymnastics',
        groupTimer: { seconds: 90, label: 'Descanso entre bloques', type: 'rest' },
        exercises: [
          { 
            name: 'Strict HSPU con déficit de 4" (discos de 20kg)', 
            sets: '5 sets', 
            reps: '6-8 reps', 
            notes: 'Cabeza toca la colchoneta con control, empuje explosivo sin arquear lumbar.',
            rx: 'Déficit 4 pulgadas para chicos, 2 pulgadas para chicas'
          }
        ]
      },
      {
        name: 'BLOQUE 4: METCON INTERVALS - "DOUBLE TROUBLE"',
        duration: '25 min',
        blockType: 'metcon_wod',
        targetTimerType: 'interval',
        timerMinutes: 20,
        groupTimer: { seconds: 240, label: 'Ronda de 4 min (trabajo + descanso)', type: 'countdown' },
        exercises: [
          { name: 'Cada 4 minutos x 4 Rondas:', sets: '4 rondas', reps: 'Sprint', notes: 'El tiempo sobrante de cada intervalo de 4 min es descanso puro' },
          { name: '12 Thrusters con barra (52.5kg / 35kg)', reps: '12 reps', rx: 'Sin partir la serie (unbroken)' },
          { name: '12 Chest to Bar Pull-ups (C2B)', reps: '12 reps', rx: 'Pecho a la barra' },
          { name: '15/12 Cal Echo Bike', reps: 'Sprint', rx: 'Máxima potencia' }
        ]
      }
    ]
  },
  {
    id: 'comp-wed-squat-engine',
    zone: 'competitors',
    dayId: 'wed',
    title: 'Heavy Front Squat & Midline Stamina',
    category: 'crossfit_competitor',
    type: 'COMPETITORS / SQUAT STRENGTH & RUN',
    duration: '75 MIN',
    level: 'Atletas Avanzados / Rx',
    description: 'Fuerza pura de sentadilla frontal combinada con capacidad aeróbica mixta en intervalos de carrera y remo.',
    sections: [
      {
        name: 'BLOQUE 1: PREPARACIÓN CADERA & TOBILLO',
        duration: '12 min',
        blockType: 'warmup',
        groupTimer: { seconds: 60, label: 'Descanso movilidad', type: 'rest' },
        exercises: [
          { name: 'Ankle dorsiflexion con banda en caja', sets: '2 sets', reps: '60s por pierna', notes: 'Permitir mayor avance de rodilla' },
          { name: 'Pause Goblet Squats con 24kg (5s pausa)', sets: '3 sets', reps: '8 reps', notes: 'Foco en verticalidad del torso' }
        ]
      },
      {
        name: 'BLOQUE 2: FUERZA - FRONT SQUAT (5 x 3 @ 84%)',
        duration: '25 min',
        blockType: 'weightlifting',
        groupTimer: { seconds: 150, label: 'Descanso 2:30 min entre series de sentadilla', type: 'rest' },
        exercises: [
          { 
            name: 'Sentadilla Frontal con barra olímpica', 
            sets: '5 sets', 
            reps: '3 reps pesadas', 
            notes: 'Todas las series al 84% de 1RM Front Squat. Codos arriba, rebote elástico controlado.',
            rx: 'Cargas sobre 120kg chicos / 80kg chicas'
          }
        ]
      },
      {
        name: 'BLOQUE 3: METCON AERÓBICO - 4 RONDAS POR TIEMPO',
        duration: '25 min',
        blockType: 'metcon_wod',
        targetTimerType: 'for_time',
        timerMinutes: 22,
        groupTimer: { seconds: 1320, label: 'Time Cap: 22 MIN', type: 'countdown' },
        exercises: [
          { name: '400m Carrera en cinta curvada (TrueForm / Woodway) o exterior', sets: '4 rondas', reps: '400m', rx: 'Ritmo 1:25-1:35' },
          { name: '500m Remo Concept2', sets: '4 rondas', reps: '500m', rx: 'Pace sub 1:45/500m' },
          { name: '15 D-Ball over shoulder (45kg / 30kg)', sets: '4 rondas', reps: '15 reps', rx: 'Carga pesada a un hombro' }
        ]
      }
    ]
  },
  {
    id: 'comp-thu-active-recovery',
    zone: 'competitors',
    dayId: 'thu',
    title: 'Aerobic Flush, Erg Flow & Thoracic Reset',
    category: 'crossfit_competitor',
    type: 'COMPETITORS / ACTIVE RECOVERY',
    duration: '50 MIN',
    level: 'Todos los niveles',
    description: 'Día de regeneración y bombeo metabólico en Zona 2: sin impacto articular, flujo continuo en ergómetros y liberación fascial.',
    sections: [
      {
        name: 'BLOQUE 1: FLUJO AERÓBICO ZONA 2 (30 MIN ROTATIVO)',
        duration: '30 min',
        blockType: 'endurance',
        groupTimer: { seconds: 1800, label: '30 MIN Flujo continuo', type: 'countdown' },
        exercises: [
          { name: '10 min SkiErg a ritmo regenerativo (<135 BPM)', sets: '1 bloque', reps: '10 min', notes: 'Capacidad aeróbica basal' },
          { name: '10 min Remo Concept2 con cadencia baja 20-22 s/m', sets: '1 bloque', reps: '10 min', notes: 'Oxigenación' },
          { name: '10 min Echo Bike cadencia suave 55 RPM', sets: '1 bloque', reps: '10 min', notes: 'Drenaje de lactato' }
        ]
      },
      {
        name: 'BLOQUE 2: PROTOCOLO DE MOVILIDAD Y CADENA POSTERIOR',
        duration: '20 min',
        blockType: 'accessory',
        groupTimer: { seconds: 90, label: 'Pausa de descarga', type: 'rest' },
        exercises: [
          { name: 'Pase de Lacrosse ball en pectoral menor y glúteo medio', sets: '2 sets', reps: '3 min por lado', notes: 'Presión en puntos gatillo' },
          { name: 'Thoracic Bridges y estiramiento de dorsales colgado', sets: '3 sets', reps: '60 segundos', notes: 'Descompresión espinal' }
        ]
      }
    ]
  },
  {
    id: 'comp-fri-deadlift-benchmark',
    zone: 'competitors',
    dayId: 'fri',
    title: 'Deadlift Wave & Benchmark "IRON CLASH"',
    category: 'crossfit_competitor',
    type: 'COMPETITORS / POWER & HIGH INTENSITY WOD',
    duration: '80 MIN',
    level: 'Atletas Avanzados / Rx',
    description: 'Sesión clásica de viernes competitivo: Peso muerto pesado con bandas de resistencia + Benchmark clásico de alta potencia.',
    sections: [
      {
        name: 'BLOQUE 1: CALENTAMIENTO Y POTENCIACIÓN NEUROMUSCULAR',
        duration: '15 min',
        blockType: 'warmup',
        groupTimer: { seconds: 60, label: 'Descanso 60s', type: 'rest' },
        exercises: [
          { name: 'Salto al cajón de 30" con caída controlada', sets: '4 sets', reps: '3 saltos', notes: 'Máxima explosividad' },
          { name: 'Kettlebell Swings pesados con 32kg / 24kg', sets: '3 sets', reps: '10 reps', notes: 'Bisagra de cadera limpia' }
        ]
      },
      {
        name: 'BLOQUE 2: FUERZA - PESO MUERTO CONVENCIONAL',
        duration: '25 min',
        blockType: 'weightlifting',
        groupTimer: { seconds: 150, label: 'Descanso 2:30 min', type: 'rest' },
        exercises: [
          { 
            name: 'Deadlift (5-4-3-2-2) Ramping Sets', 
            sets: '5 sets', 
            reps: '5-4-3-2-2 reps', 
            notes: 'Comenzar al 75% y terminar en doblete al 90-92% de 1RM. Espalda totalmente neutra.',
            rx: 'Último set sobre 190kg chicos / 130kg chicas'
          }
        ]
      },
      {
        name: 'BLOQUE 3: BENCHMARK WOD: "IRON CLASH" (21-15-9 FOR TIME)',
        duration: '18 min',
        blockType: 'metcon_wod',
        targetTimerType: 'for_time',
        timerMinutes: 15,
        groupTimer: { seconds: 900, label: 'Time Cap: 15 MIN (Sprint WOD)', type: 'countdown' },
        exercises: [
          { name: '21-15-9 Repeticiones por tiempo de:', sets: '3 rondas', reps: '21-15-9', rx: 'Sprint brutal' },
          { name: 'Thrusters pesados (60kg chicos / 42.5kg chicas)', reps: '21 - 15 - 9', rx: '60kg / 42.5kg' },
          { name: 'Ring Muscle-Ups (RMU en anillas)', reps: '7 - 5 - 3 (Escalado RMU)', rx: 'Transición profunda en anillas' },
          { name: 'Cal Remo Ergómetro', reps: '21 - 15 - 9', rx: 'Sprint final' }
        ]
      }
    ]
  },
  {
    id: 'comp-sat-team-strongman',
    zone: 'competitors',
    dayId: 'sat',
    title: 'Saturday Team Showdown & Strongman Grinder',
    category: 'crossfit_competitor',
    type: 'COMPETITORS / TEAM WOD & STRONGMAN',
    duration: '90 MIN',
    level: 'Atletas Avanzados / Rx',
    description: 'La sesión estelar del sábado: trabajo en parejas o individual de larga duración con implementos Strongman, trineos pesados y cardio.',
    sections: [
      {
        name: 'BLOQUE 1: STRONGMAN CARRY & SLED COMPLEX',
        duration: '30 min',
        blockType: 'weightlifting',
        groupTimer: { seconds: 120, label: 'Descanso entre paseos', type: 'rest' },
        exercises: [
          { name: 'Yoke Carry 25 metros pesado', sets: '4 paseos', reps: '25m', rx: '220kg chicos / 140kg chicas' },
          { name: 'Farmer Walk con mancuernas pesadas de 36kg c/u', sets: '4 paseos', reps: '50m', rx: 'Agarre de titanio sin soltar' },
          { name: 'Empuje de trineo pesado (Prowler Sled Push)', sets: '4 sprints', reps: '25m', rx: 'Peso corporal + trineo' }
        ]
      },
      {
        name: 'BLOQUE 2: GRINDER WOD (AMRAP 30 MIN EN EQUIPO / PAREJAS)',
        duration: '35 min',
        blockType: 'metcon_wod',
        targetTimerType: 'amrap',
        timerMinutes: 30,
        groupTimer: { seconds: 1800, label: 'AMRAP 30 MIN (Cronómetro Team WOD)', type: 'countdown' },
        exercises: [
          { name: '100 Cal Echo Bike (repartido en bloques de 15 cal)', reps: '100 Cal', rx: 'Cambios rápidos' },
          { name: '80 Burpees over the Worm o barra', reps: '80 reps', rx: 'Sincronizados o continuos' },
          { name: '60 Syncro Toes to Bar', reps: '60 reps', rx: 'Tocar barra a la vez' },
          { name: '40 Clean & Jerks con barra pesada (70kg / 47.5kg)', reps: '40 reps', rx: 'Repartidas de 2 en 2' },
          { name: '20 Rope Climbs (Subidas a la cuerda a 4.5m)', reps: '20 subidas', rx: 'Presa de pies J-Hook' }
        ]
      }
    ]
  }
];

// ============================================================================
// 2. ZONA GIMNASIO TRADICIONAL (FITNESS & HIPERTROFIA)
// ============================================================================
export const TRADITIONAL_WORKOUTS = [
  {
    id: 'gym-chest-triceps-1',
    zone: 'traditional',
    dayId: 'mon',
    muscleGroup: 'chest_triceps',
    title: 'Pecho y Tríceps - Empuje & Cargas Pesadas',
    category: 'gym',
    type: 'GIMNASIO / HIPERTROFIA & FUERZA',
    duration: '50 MIN',
    level: 'Todos los niveles',
    description: 'La clásica sesión de empuje para desarrollar un pecho denso y potente complementado con trabajo accesorio de tríceps en poleas y barras.',
    sections: [
      {
        name: 'BLOQUE 1: CALENTAMIENTO Y MANGUITO ROTADOR',
        duration: '7 min',
        blockType: 'warmup',
        groupTimer: { seconds: 45, label: 'Descanso activación (45s)', type: 'rest' },
        exercises: [
          { name: 'Rotaciones externas con mancuerna de 2kg', sets: '2 series', reps: '15 reps por brazo', notes: 'Codo pegado al costado' },
          { name: 'Flexiones en suelo con pausa abajo', sets: '2 series', reps: '10 reps', notes: 'Sentir apertura pectoral' }
        ]
      },
      {
        name: 'BLOQUE 2: BÁSICO PESADO (PRESS DE BANCA)',
        duration: '16 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 120, label: 'Descanso entre series banca (2 min)', type: 'rest' },
        exercises: [
          { name: 'Press de Banca Plano con barra olímpica', sets: '4 series', reps: '6-8 reps', notes: 'RIR 1-2. Pies clavados en el suelo, retracción escapular.' },
          { name: 'Press Inclinado con mancuernas a 30°', sets: '4 series', reps: '8-10 reps', notes: 'Foco en la porción clavicular del pectoral.' }
        ]
      },
      {
        name: 'BLOQUE 3: APERTURAS & FONDOS PECTORALES',
        duration: '15 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 75, label: 'Descanso aperturas (75s)', type: 'rest' },
        exercises: [
          { name: 'Cruces en polea alta hacia abajo', sets: '3 series', reps: '12-15 reps', notes: 'Cruzar manos ligeramente para máxima contracción.' },
          { name: 'Fondos en paralelas con inclinación frontal', sets: '3 series', reps: '10-12 reps', notes: 'Tronco inclinado hacia adelante para enfocar el pecho.' }
        ]
      },
      {
        name: 'BLOQUE 4: TRÍCEPS DIRECTO (EMPUJE)',
        duration: '10 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 60, label: 'Descanso tríceps (60s)', type: 'rest' },
        exercises: [
          { name: 'Press de banca agarre cerrado con barra', sets: '3 series', reps: '10 reps', notes: 'Manos a anchura de hombros, codos cerca del tronco.' },
          { name: 'Extensiones de tríceps tras nuca en polea con cuerda', sets: '3 series', reps: '12 reps', notes: 'Estiramiento profundo de la cabeza larga.' }
        ]
      }
    ]
  },
  {
    id: 'gym-back-shoulders-1',
    zone: 'traditional',
    dayId: 'tue',
    muscleGroup: 'back_shoulders',
    title: 'Espalda y Hombros - V-Taper & Densidad',
    category: 'gym',
    type: 'GIMNASIO / TIRÓN & DELTOIDES',
    duration: '50 MIN',
    level: 'Intermedio / Avanzado',
    description: 'Combinación óptima para conseguir una espalda en V amplia y densa con hombros redondos y buena salud escapular.',
    sections: [
      {
        name: 'BLOQUE 1: ACTIVACIÓN ESCAPULAR Y HOMBROS',
        duration: '7 min',
        blockType: 'warmup',
        groupTimer: { seconds: 60, label: 'Descanso calentamiento (60s)', type: 'rest' },
        exercises: [
          { name: 'Dislocaciones de hombro con pica PVC', sets: '2 series', reps: '12 reps', notes: 'Movilidad articular completa' },
          { name: 'Jalones al pecho en polea con agarre ancho (muy ligero)', sets: '2 series', reps: '15 reps', notes: 'Apretar escápulas abajo' }
        ]
      },
      {
        name: 'BLOQUE 2: FUERZA VERTICAL Y DENSIDAD DORSAL',
        duration: '16 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 90, label: 'Descanso de espalda (90s)', type: 'rest' },
        exercises: [
          { name: 'Dominadas con peso corporal o lastre', sets: '4 series', reps: '6-8 reps', notes: 'Pecho a la barra, barbilla pasa la línea superior.' },
          { name: 'Remo con barra olímpica inclinada (agarre prono)', sets: '4 series', reps: '8-10 reps', notes: 'Espalda recta a 45 grados, barra toca ombligo.' }
        ]
      },
      {
        name: 'BLOQUE 3: HOMBROS PESADOS & REMO UNILATERAL',
        duration: '15 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 90, label: 'Descanso deltoides (90s)', type: 'rest' },
        exercises: [
          { name: 'Press Militar sentado con mancuernas', sets: '4 series', reps: '8-10 reps', notes: 'Bajar hasta altura de orejas y empujar sin arquear espalda.' },
          { name: 'Remo en polea baja con agarre estrecho (gironda)', sets: '3 series', reps: '10-12 reps', notes: 'Apretar dorsal 1 segundo en la máxima contracción.' }
        ]
      },
      {
        name: 'BLOQUE 4: AISLAMIENTO DELTOIDES LATERAL Y POSTERIOR',
        duration: '10 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 60, label: 'Descanso lateral (60s)', type: 'rest' },
        exercises: [
          { name: 'Elevaciones laterales con mancuernas', sets: '4 series', reps: '12-15 reps', notes: 'Codos ligeramente flexionados, control en la bajada.' },
          { name: 'Pájaros con mancuernas para deltoides posterior', sets: '3 series', reps: '15 reps', notes: 'En banco inclinado, mirada al suelo.' }
        ]
      }
    ]
  },
  {
    id: 'gym-legs-glutes-1',
    zone: 'traditional',
    dayId: 'wed',
    muscleGroup: 'legs_glutes',
    title: 'Pierna y Glúteo - Fuerza de Tren Inferior',
    category: 'gym',
    type: 'GIMNASIO / PIERNA & GLÚTEO',
    duration: '55 MIN',
    level: 'Intermedio / Avanzado',
    description: 'Desarrollo muscular integral de cuádriceps, glúteos, isquiotibiales y gemelos combinando sentadillas, peso muerto y máquinas.',
    sections: [
      {
        name: 'BLOQUE 1: MOVILIDAD DE TOBILLO Y CADERA',
        duration: '8 min',
        blockType: 'warmup',
        groupTimer: { seconds: 60, label: 'Descanso movilidad (60s)', type: 'rest' },
        exercises: [
          { name: 'Zancadas dinámicas con rotación de tronco', sets: '2 series', reps: '10 reps por pierna', notes: 'Apertura de flexores de cadera' },
          { name: 'Sentadilla en copa con kettlebell (pausa abajo)', sets: '2 series', reps: '10 reps', notes: 'Foco en empuje de rodillas hacia afuera' }
        ]
      },
      {
        name: 'BLOQUE 2: CONSTRUCTOR DE CUÁDRICEPS & FUERZA',
        duration: '18 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 120, label: 'Descanso de piernas pesadas (2 min)', type: 'rest' },
        exercises: [
          { name: 'Sentadilla Trasera con barra o Sentadilla Hack', sets: '4 series', reps: '8 reps', notes: 'Profundidad limpia y subida explosiva.' },
          { name: 'Prensa de piernas con pies bajos (foco cuádriceps)', sets: '3 series', reps: '10-12 reps', notes: 'Mantener tensión continua sin bloquear rodillas.' }
        ]
      },
      {
        name: 'BLOQUE 3: CADENA POSTERIOR (ISQUIOS & GLÚTEOS)',
        duration: '16 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 90, label: 'Descanso isquios (90s)', type: 'rest' },
        exercises: [
          { name: 'Peso Muerto Rumano con barra o mancuernas', sets: '4 series', reps: '8-10 reps', notes: 'Llevar cadera hacia atrás sintiendo tirón en isquiotibiales.' },
          { name: 'Hip Thrust con barra y almohadilla en banco', sets: '3 series', reps: '10-12 reps', notes: 'Apretar glúteos 2 segundos arriba en cada repetición.' },
          { name: 'Curl femoral tumbado o sentado en máquina', sets: '3 series', reps: '12-15 reps', notes: 'Control excéntrico de 3 segundos en bajada.' }
        ]
      },
      {
        name: 'BLOQUE 4: GEMELOS Y ZANCADAS DE FINALIZACIÓN',
        duration: '10 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 60, label: 'Descanso final (60s)', type: 'rest' },
        exercises: [
          { name: 'Zancadas búlgaras con mancuernas', sets: '3 series', reps: '10 reps por pierna', notes: 'Tronco ligeramente inclinado al frente.' },
          { name: 'Elevación de talones de pie en máquina', sets: '4 series', reps: '15-20 reps', notes: 'Pausa de 1 segundo arriba en puntillas.' }
        ]
      }
    ]
  },
  {
    id: 'gym-biceps-triceps-1',
    zone: 'traditional',
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
        name: 'BLOQUE 1: CALENTAMIENTO ARTICULAR DE CODOS',
        duration: '6 min',
        blockType: 'warmup',
        groupTimer: { seconds: 45, label: 'Descanso de activación (45s)', type: 'rest' },
        exercises: [
          { name: 'Extensiones de tríceps en polea con cuerda liviana', sets: '2 series', reps: '20 reps', notes: 'Bombeo de líquido sinovial a los codos' },
          { name: 'Curl de bíceps con mancuernas ligeras', sets: '2 series', reps: '20 reps', notes: 'Rango completo y control' }
        ]
      },
      {
        name: 'BLOQUE 2: SUPERSERIE DE FUERZA (TRÍCEPS & BÍCEPS)',
        duration: '16 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 90, label: 'Descanso entre superseries (90s)', type: 'rest' },
        exercises: [
          { name: 'Press Francés con barra Z en banco plano', sets: '4 series', reps: '8-10 reps', notes: 'Bajar hacia la frente manteniendo codos cerrados.' },
          { name: 'Curl con barra Z de pie (agarre medio)', sets: '4 series', reps: '8-10 reps', notes: 'Sin balancear torso, apretar 1s en contracción máxima.' }
        ]
      },
      {
        name: 'BLOQUE 3: SUPERSERIE DE AISLAMIENTO & BRAQUIAL',
        duration: '14 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 75, label: 'Descanso de aislamiento (75s)', type: 'rest' },
        exercises: [
          { name: 'Extensiones en polea alta con barra V', sets: '3 series', reps: '12 reps', notes: 'Bloqueo completo abajo apretando tríceps.' },
          { name: 'Curl Martillo con mancuernas en banco inclinado', sets: '3 series', reps: '10-12 reps', notes: 'Foco en braquial y antebrazo para mayor grosor de brazo.' }
        ]
      },
      {
        name: 'BLOQUE 4: DROP SET FINAL AL FALLO',
        duration: '8 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 60, label: 'Descanso drop-set (60s)', type: 'rest' },
        exercises: [
          { name: 'Fondos en paralelas o entre bancos', sets: '3 series', reps: 'Al fallo (12-15 reps)', notes: 'Cuerpo vertical para priorizar tríceps.' },
          { name: 'Curl concentrado a una mano en polea baja', sets: '3 series', reps: '12 reps por brazo', notes: 'Apretar el pico del bíceps arriba.' }
        ]
      }
    ]
  },
  {
    id: 'gym-full-body-1',
    zone: 'traditional',
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
        name: 'BLOQUE 1: ACTIVACIÓN & CALENTAMIENTO',
        duration: '8 min',
        blockType: 'warmup',
        groupTimer: { seconds: 60, label: 'Descanso de movilidad', type: 'rest' },
        exercises: [
          { name: 'Remo ergómetro a ritmo moderado', sets: '1 serie', reps: '500m', notes: 'Activar ritmo cardíaco y temperatura' },
          { name: 'Rotaciones escapulares con goma elástica', sets: '2 series', reps: '15 reps', notes: 'Foco en manguito rotador' },
          { name: 'Sentadilla profunda con peso corporal (pausa abajo)', sets: '2 series', reps: '10 reps', notes: '2 segundos de pausa en fondo' }
        ]
      },
      {
        name: 'BLOQUE 2: TREN INFERIOR PESADO (SENTADILLA)',
        duration: '15 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 120, label: 'Descanso entre series pesadas (2 min)', type: 'rest' },
        exercises: [
          { name: 'Sentadilla Trasera con barra (Back Squat)', sets: '4 series', reps: '6-8 reps', notes: 'Carga pesada 75-80% 1RM. Romper paralelo con control.' },
          { name: 'Prensa de piernas inclinada 45°', sets: '3 series', reps: '10-12 reps', notes: 'Pies a anchura de hombros, bajar profundo sin despegar lumbar.' }
        ]
      },
      {
        name: 'BLOQUE 3: TREN SUPERIOR (EMPUJE Y TIRÓN)',
        duration: '18 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 90, label: 'Descanso torso (90 seg)', type: 'rest' },
        exercises: [
          { name: 'Press de Banca Plano con barra olímpica', sets: '4 series', reps: '8 reps', notes: 'Retracción escapular, parada de 1 seg en pecho.' },
          { name: 'Remo con mancuerna a una mano en banco', sets: '4 series', reps: '10 reps por brazo', notes: 'Tirar con el codo hacia la cadera, estiramiento completo.' },
          { name: 'Press Militar de pie con mancuernas', sets: '3 series', reps: '10 reps', notes: 'Tronco firme y glúteos apretados.' }
        ]
      },
      {
        name: 'BLOQUE 4: CORE Y BOMBEO FINAL',
        duration: '10 min',
        blockType: 'hypertrophy',
        groupTimer: { seconds: 60, label: 'Descanso final (60 seg)', type: 'rest' },
        exercises: [
          { name: 'Elevaciones de piernas colgado en barra', sets: '3 series', reps: '12-15 reps', notes: 'Sin balanceo, control abdominal.' },
          { name: 'Face Pulls en polea alta con cuerda', sets: '3 series', reps: '15 reps', notes: 'Deltoides posterior y salud articular.' }
        ]
      }
    ]
  },
  {
    id: 'mob-recovery-1',
    zone: 'traditional',
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
        name: 'BLOQUE 1: DESCARGA CON FOAM ROLLER',
        duration: '12 min',
        blockType: 'warmup',
        groupTimer: { seconds: 90, label: 'Descanso zona', type: 'rest' },
        exercises: [
          { name: 'Pase de Foam Roller en cuádriceps y banda iliotibial', sets: '2 series', reps: '2 min', notes: 'Liberar puntos de tensión' },
          { name: 'Foam Roller en espalda dorsal y glúteos', sets: '2 series', reps: '2 min', notes: 'Respiración diafragmática' }
        ]
      },
      {
        name: 'BLOQUE 2: ESTIRAMIENTOS PROFUNDOS',
        duration: '15 min',
        blockType: 'warmup',
        groupTimer: { seconds: 60, label: 'Descanso estiramiento', type: 'rest' },
        exercises: [
          { name: 'Couch Stretch (Psoas e isquiotibiales)', sets: '2 series', reps: '2 min por lado', notes: 'Tronco recto' },
          { name: 'Pigeon Pose para apertura de cadera', sets: '2 series', reps: '90s por lado', notes: 'Descargar glúteo piramidal' }
        ]
      }
    ]
  }
];

export const INITIAL_WORKOUTS = [
  ...COMPETITOR_WORKOUTS,
  ...TRADITIONAL_WORKOUTS
];

export const INITIAL_PRS = [
  { id: 'pr-1', exercise: 'Press de Banca Plano', weight: '110 kg', date: '18/09/2026', category: 'gym_strength', zone: 'traditional' },
  { id: 'pr-2', exercise: 'Sentadilla con Barra (Squat)', weight: '145 kg', date: '12/09/2026', category: 'gym_strength', zone: 'traditional' },
  { id: 'pr-3', exercise: 'Peso Muerto (Deadlift)', weight: '180 kg', date: '04/09/2026', category: 'gym_strength', zone: 'traditional' },
  { id: 'pr-4', exercise: 'Press Militar con Mancuernas', weight: '34 kg c/u', date: '28/08/2026', category: 'gym_strength', zone: 'traditional' },
  { id: 'pr-5', exercise: 'Curl de Bíceps con Barra Z', weight: '45 kg', date: '20/08/2026', category: 'gym_strength', zone: 'traditional' },
  { id: 'pr-6', exercise: 'Clean & Jerk (CrossFit)', weight: '95 kg', date: '10/08/2026', category: 'olympic_lifting', zone: 'competitors' },
  { id: 'pr-7', exercise: 'Squat Snatch (Arrancada)', weight: '82.5 kg', date: '15/09/2026', category: 'olympic_lifting', zone: 'competitors' },
  { id: 'pr-8', exercise: 'WOD Fran (21-15-9)', weight: '3:18 RX', date: '01/09/2026', category: 'benchmark_wod', zone: 'competitors' }
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
