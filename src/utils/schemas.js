import { z } from 'zod';

const ZoneEnum = z.enum(['traditional', 'competitors']);
const UuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UuidSchema = z.string().regex(UuidRegex, 'Identificador UUID no válido');

// Sanitizador de texto: limpia caracteres de control y acota longitud
const cleanText = (max) =>
  z.string()
    .transform((str) =>
      str
        ? str
            // eslint-disable-next-line no-control-regex
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
            .trim()
        : ''
    )
    .pipe(z.string().max(max));

export const AthletePayloadSchema = z.object({
  id: UuidSchema,
  name: cleanText(100).refine((val) => val.length > 0, 'El nombre es obligatorio'),
  username: cleanText(50).optional().default(''),
  email: z.string().trim().toLowerCase().email('Email no válido').max(150),
  role: z.enum(['admin', 'athlete']).default('athlete'),
  membership: cleanText(80).default('Fitness & Musculación General'),
  access_zones: z
    .array(ZoneEnum)
    .default(['traditional']),
  avatar: cleanText(4).default('AL'),
  focus: cleanText(100).default(''),
  phone: cleanText(30).nullable().optional(),
  experience: cleanText(50).nullable().optional(),
  injuries: cleanText(200).nullable().optional()
});

export const PrPayloadSchema = z.object({
  id: cleanText(80).optional(),
  athlete_id: UuidSchema,
  exercise: cleanText(100).refine((val) => val.length > 0, 'El ejercicio es obligatorio'),
  weight: cleanText(50).refine((val) => val.length > 0, 'El valor del récord es obligatorio'),
  date: cleanText(30).optional(),
  category: cleanText(50).default('General'),
  zone: ZoneEnum.default('traditional'),
  notes: cleanText(500).nullable().optional()
});

export const PerformanceLogPayloadSchema = z.object({
  id: cleanText(80).optional(),
  athlete_id: UuidSchema,
  zone: ZoneEnum.default('competitors'),
  workout_id: cleanText(100).nullable().optional(),
  exercise_name: cleanText(100).refine((val) => val.length > 0, 'El nombre del ejercicio es obligatorio'),
  score_type: cleanText(50).default('weight'),
  value: cleanText(50).refine((val) => val.length > 0, 'El resultado es obligatorio'),
  rpe: z.coerce.number().min(1).max(10).nullable().optional(),
  notes: cleanText(500).nullable().optional(),
  date: cleanText(50).optional()
});

export const ReadinessDetailsSchema = z.object({
  sleep: z.number().min(0).max(10).optional().default(0),
  fatigue: z.number().min(0).max(10).optional().default(0),
  energy: z.number().min(0).max(10).optional().default(0),
  stress: z.number().min(0).max(10).optional().default(0),
  prs: z.number().optional().default(0),
  score: z.number().optional().default(0),
  scoreDisplay: cleanText(10).optional().default(''),
  sleepHours: cleanText(20).optional().default(''),
  sleepQualityText: cleanText(80).optional().default(''),
  sorenessAreas: z.array(cleanText(60)).max(20).optional().default([]),
  painAreas: z.array(cleanText(60)).max(20).optional().default([]),
  painDescription: cleanText(400).optional().default(''),
  headline: cleanText(120).optional().default(''),
  guidelines: z.array(cleanText(200)).max(20).optional().default([]),
  volumeReduction: cleanText(20).optional().default(''),
  deloadMode: z.boolean().optional().default(false),
  loggedAt: cleanText(20).optional().default('')
});

export const ReadinessLogPayloadSchema = z.object({
  id: cleanText(80),
  athlete_id: UuidSchema,
  date: cleanText(30),
  final_state: cleanText(30).default('adequate'),
  level: cleanText(30).default('moderate'),
  has_pain: z.boolean().default(false),
  details: ReadinessDetailsSchema.default({})
});

export const ExerciseBlockSchema = z.object({
  name: cleanText(120).refine((val) => val.length > 0, 'Nombre de ejercicio requerido'),
  sets: cleanText(40).default('3 series'),
  reps: cleanText(50).default('10 reps'),
  rir: cleanText(30).optional(),
  notes: cleanText(300).optional().default(''),
  rx: cleanText(100).optional()
});

export const SectionSchema = z.object({
  name: cleanText(100).default('BLOQUE 1'),
  duration: cleanText(40).default('15 min'),
  blockType: cleanText(40).default('traditional'),
  groupTimer: z.object({
    seconds: z.number().min(5).max(3600).default(60),
    label: cleanText(80).default('Descanso'),
    type: cleanText(30).default('rest'),
    rounds: z.number().optional(),
    intervalSeconds: z.number().optional()
  }).optional().default({ seconds: 60, label: 'Descanso 60s', type: 'rest' }),
  exercises: z.array(ExerciseBlockSchema).max(30).default([])
});

export const WorkoutPayloadSchema = z.object({
  id: cleanText(80),
  zone: ZoneEnum.default('traditional'),
  day_id: cleanText(20).nullable().optional(),
  muscle_group: cleanText(50).nullable().optional(),
  title: cleanText(120).refine((val) => val.length > 0, 'El título es obligatorio'),
  category: cleanText(50).default('gym'),
  type: cleanText(80).default('GIMNASIO / MUSCULACIÓN'),
  duration: cleanText(30).default('45 MIN'),
  level: cleanText(50).default('Todos los niveles'),
  description: cleanText(500).default(''),
  sections: z.array(SectionSchema).max(20).default([]),
  updated_at: cleanText(50).optional()
});
