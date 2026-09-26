import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_WORKOUTS, INITIAL_PRS } from '../data/initialWorkouts';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';
import { getWeekKey, shiftWeekKey } from '../utils/weekManager';

const WorkoutContext = createContext();

const INITIAL_ATHLETE_PLANS = {
  'user-athlete-1': {
    'mon': 'comp-mon-snatch-engine',
    'tue': 'comp-tue-clean-jerk-cycling',
    'wed': 'comp-wed-squat-engine',
    'thu': 'comp-thu-active-recovery',
    'fri': 'comp-fri-deadlift-benchmark',
    'sat': 'comp-sat-team-strongman',
    'sun': null
  },
  'user-athlete-2': {
    'mon': 'gym-chest-triceps-1',
    'tue': 'gym-back-shoulders-1',
    'wed': 'gym-legs-glutes-1',
    'thu': null,
    'fri': 'gym-biceps-triceps-1',
    'sat': 'gym-full-body-1',
    'sun': null
  },
  'user-athlete-3': {
    'mon': 'comp-mon-snatch-engine',
    'tue': 'gym-back-shoulders-1',
    'wed': 'gym-legs-glutes-1',
    'thu': 'comp-thu-active-recovery',
    'fri': 'gym-biceps-triceps-1',
    'sat': 'comp-sat-team-strongman',
    'sun': 'mob-recovery-1'
  }
};

export function WorkoutProvider({ children }) {
  const { currentUser } = useAuth();

  // Navigation Zone: Always starts on 'dashboard' so the user always chooses Competidor vs Gimnasio first
  const [activeZone, setActiveZone] = useState('dashboard');

  // Mode for Traditional Gym: 'muscle_groups' (Catálogo libre) vs 'coach_plan' (Plan personalizado asignado)
  const [viewMode, setViewMode] = useState('muscle_groups');

  // Selected muscle group filter for traditional gym
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');

  // Selected week key: e.g. "2026-09-28" (Monday date of the selected week)
  const [selectedWeek, setSelectedWeek] = useState(() => getWeekKey(new Date()));

  // Selected day for weekly plan
  const [selectedDay, setSelectedDay] = useState(() => {
    const dayIndex = new Date().getDay();
    const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return map[dayIndex] || 'mon';
  });

  // Multi-week assignments for individual athletes: { [athleteId]: { [weekKey]: { [dayId]: workoutId } } }
  const [weeklyAthletePlans, setWeeklyAthletePlans] = useState(() => {
    try {
      const saved = localStorage.getItem('hift_weekly_athlete_plans_v1');
      if (saved) return JSON.parse(saved);

      // Migrar o inicializar con INITIAL_ATHLETE_PLANS para la semana actual
      const currentWk = getWeekKey(new Date());
      const oldPlans = localStorage.getItem('hift_athlete_plans_v2');
      const base = oldPlans ? JSON.parse(oldPlans) : INITIAL_ATHLETE_PLANS;
      const initial = {};
      Object.keys(base).forEach(athleteId => {
        initial[athleteId] = {
          [currentWk]: { ...base[athleteId] }
        };
      });
      return initial;
    } catch {
      return {};
    }
  });

  // Multi-week assignments for general Box Competitors programming: { [weekKey]: { [dayId]: workoutId } }
  const [boxWeeklySchedule, setBoxWeeklySchedule] = useState(() => {
    try {
      const saved = localStorage.getItem('hift_box_weekly_schedule_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Guardar en localStorage al cambiar
  useEffect(() => {
    try {
      localStorage.setItem('hift_weekly_athlete_plans_v1', JSON.stringify(weeklyAthletePlans));
    } catch {
      // Ignorar si cuota excedida
    }
  }, [weeklyAthletePlans]);

  useEffect(() => {
    try {
      localStorage.setItem('hift_box_weekly_schedule_v1', JSON.stringify(boxWeeklySchedule));
    } catch {
      // Ignorar si cuota excedida
    }
  }, [boxWeeklySchedule]);

  // Selected athlete in Admin Plan Manager (default: 'user-athlete-1')
  const [managingAthleteId, setManagingAthleteId] = useState('user-athlete-1');

  // Workouts database (ensuring competitor workouts exist)
  const [workouts, setWorkouts] = useState(() => {
    try {
      const saved = localStorage.getItem('hift_workouts_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If saved workouts don't have competitors zone yet, refresh
        if (parsed.some(w => w.zone === 'competitors')) {
          return parsed;
        }
      }
      return INITIAL_WORKOUTS;
    } catch {
      return INITIAL_WORKOUTS;
    }
  });

  // PRs (Personal Records)
  const [prs, setPrs] = useState(() => {
    try {
      const saved = localStorage.getItem('hift_prs_v3');
      return saved ? JSON.parse(saved) : INITIAL_PRS;
    } catch {
      return INITIAL_PRS;
    }
  });

  // Daily performance logs (e.g. weights lifted, times recorded, series completed)
  const [performanceLogs, setPerformanceLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('hift_performance_logs_v1');
      return saved ? JSON.parse(saved) : [
        {
          id: 'log-demo-1',
          userId: 'user-athlete-1',
          zone: 'competitors',
          workoutId: 'comp-mon-snatch-engine',
          exerciseName: 'Snatch Complex (1 Squat + 1 Hang + 1 OHS)',
          scoreType: 'weight',
          value: '87.5 kg',
          rpe: 9,
          notes: 'Bloqueo sólido en overhead squat, sintiendo buena velocidad',
          date: 'Hoy, 10:30'
        },
        {
          id: 'log-demo-2',
          userId: 'user-athlete-1',
          zone: 'competitors',
          workoutId: 'comp-mon-snatch-engine',
          exerciseName: 'Metcon "Oxygen Debt"',
          scoreType: 'time',
          value: '16:42 RX',
          rpe: 10,
          notes: 'Echo bike a 68 rpm sostenido, ritmo fuerte',
          date: 'Hoy, 11:15'
        },
        {
          id: 'log-demo-3',
          userId: 'user-athlete-2',
          zone: 'traditional',
          workoutId: 'gym-chest-triceps-1',
          exerciseName: 'Press de Banca Plano con barra',
          scoreType: 'weight',
          value: '4 series x 8 reps con 75 kg',
          rpe: 8,
          notes: 'RIR 2 en todas las series, buen control en la bajada',
          date: 'Ayer'
        }
      ];
    } catch {
      return [];
    }
  });

  // Completed exercises checklist state
  const [completedExercises, setCompletedExercises] = useState(() => {
    try {
      const saved = localStorage.getItem('hift_completed_exercises');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Currently opened workout detail
  const [activeWorkoutDetail, setActiveWorkoutDetail] = useState(null);

  // Readiness / RPE Daily check-in logs
  const getTodayKey = () => new Date().toISOString().split('T')[0];

  const [readinessLogs, setReadinessLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('hift_readiness_logs_v1');
      if (saved) return JSON.parse(saved);
      const today = getTodayKey();
      return {
        [`${today}_user-athlete-1`]: {
          userId: 'user-athlete-1',
          date: today,
          sleep: 5,
          sleepHours: '8h',
          sleepQualityText: 'Profundo / Recuperación total',
          soreness: 4,
          sorenessAreas: ['Ninguna'],
          energy: 5,
          energyText: 'A tope / Máxima motivación',
          score: 92,
          level: 'optimal',
          deloadMode: false,
          notes: 'Descanso de 8 horas, sin molestias articulares.',
          isPrivate: true,
          loggedAt: '08:15'
        },
        [`${today}_user-athlete-2`]: {
          userId: 'user-athlete-2',
          date: today,
          sleep: 2,
          sleepHours: '5h',
          sleepQualityText: 'Inquieto con despertares',
          soreness: 1,
          sorenessAreas: ['Espalda baja / Lumbar', 'Piernas / Rodillas'],
          energy: 2,
          energyText: 'Poca energía / Pesadez',
          score: 42,
          level: 'fatigue',
          deloadMode: true,
          notes: 'Insomnio por turno laboral y dolor lumbar fuerte tras día de sentadillas.',
          isPrivate: true,
          loggedAt: '07:45'
        },
        [`${today}_user-athlete-3`]: {
          userId: 'user-athlete-3',
          date: today,
          sleep: 4,
          sleepHours: '7h',
          sleepQualityText: 'Bueno / Reparador',
          soreness: 3,
          sorenessAreas: ['Hombros / Trapecios'],
          energy: 3,
          energyText: 'Energía neutra / Normal',
          score: 75,
          level: 'moderate',
          deloadMode: false,
          notes: 'Energía media, buen calentamiento requerido.',
          isPrivate: true,
          loggedAt: '09:00'
        }
      };
    } catch {
      return {};
    }
  });

  // Deload mode flag for active user
  const [isDeloadMode, setIsDeloadMode] = useState(false);

  // Global Modals State
  const [isPercentageCalcOpen, setIsPercentageCalcOpen] = useState(false);
  const [percentageCalcPreset, setPercentageCalcPreset] = useState({});

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyWorkoutData, setStoryWorkoutData] = useState({});

  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState(false);

  const openPercentageCalc = (preset = {}) => {
    setPercentageCalcPreset(preset);
    setIsPercentageCalcOpen(true);
  };

  const closePercentageCalc = () => {
    setIsPercentageCalcOpen(false);
  };

  const openStoryModal = (workoutData = {}) => {
    setStoryWorkoutData(workoutData);
    setIsStoryModalOpen(true);
  };

  const closeStoryModal = () => {
    setIsStoryModalOpen(false);
  };

  const openReadinessModal = () => {
    setIsReadinessModalOpen(true);
  };

  const closeReadinessModal = () => {
    setIsReadinessModalOpen(false);
  };

  const saveDailyReadiness = (userId, data) => {
    const today = getTodayKey();
    const key = `${today}_${userId}`;
    const entry = {
      userId,
      date: today,
      ...data,
      loggedAt: new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date())
    };

    setReadinessLogs(prev => {
      const updated = { ...prev, [key]: entry };
      try {
        localStorage.setItem('hift_readiness_logs_v1', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    if (data.deloadMode !== undefined) {
      setIsDeloadMode(data.deloadMode);
    }
  };

  const getTodayReadiness = (userId) => {
    if (!userId) return null;
    const today = getTodayKey();
    return readinessLogs[`${today}_${userId}`] || null;
  };

  const toggleDeloadMode = (userId) => {
    const today = getTodayKey();
    const key = `${today}_${userId}`;
    const current = readinessLogs[key];
    const newDeload = !isDeloadMode;
    setIsDeloadMode(newDeload);

    if (current) {
      saveDailyReadiness(userId, { ...current, deloadMode: newDeload });
    }
  };

  // Custom logo URL
  const [customLogoUrl, setCustomLogoUrl] = useState(() => {
    try {
      return localStorage.getItem('hift_custom_logo') || null;
    } catch {
      return null;
    }
  });

  // Clean up any stale activeZone from localStorage and reset to 'dashboard' on login
  useEffect(() => {
    try {
      localStorage.removeItem('hift_active_zone_v3');
    } catch (e) {
      console.error(e);
    }
    setActiveZone('dashboard');
    setActiveWorkoutDetail(null);
  }, [currentUser?.id]);

  // Persist athlete plans
  useEffect(() => {
    try {
      localStorage.setItem('hift_athlete_plans_v2', JSON.stringify(athletePlans));
    } catch (e) {
      console.error(e);
    }
  }, [athletePlans]);

  // Persist workouts
  useEffect(() => {
    try {
      localStorage.setItem('hift_workouts_v3', JSON.stringify(workouts));
    } catch (e) {
      console.error(e);
    }
  }, [workouts]);

  // Persist PRs
  useEffect(() => {
    try {
      localStorage.setItem('hift_prs_v3', JSON.stringify(prs));
    } catch (e) {
      console.error(e);
    }
  }, [prs]);

  // Persist performance logs
  useEffect(() => {
    try {
      localStorage.setItem('hift_performance_logs_v1', JSON.stringify(performanceLogs));
    } catch (e) {
      console.error(e);
    }
  }, [performanceLogs]);

  // Persist completed exercises
  useEffect(() => {
    try {
      localStorage.setItem('hift_completed_exercises', JSON.stringify(completedExercises));
    } catch (e) {
      console.error(e);
    }
  }, [completedExercises]);

  // Toggle exercise checkbox
  const toggleExercise = (key) => {
    setCompletedExercises(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const celebrateCompletion = () => {
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#ff2d78', '#a855f7', '#ffffff']
    });
  };

  // Add new workout
  const addWorkout = (workoutData) => {
    setWorkouts(prev => [workoutData, ...prev]);
  };

  // Update existing workout
  const updateWorkout = (id, updatedData) => {
    setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...updatedData } : w));
    if (activeWorkoutDetail && activeWorkoutDetail.id === id) {
      setActiveWorkoutDetail(prev => ({ ...prev, ...updatedData }));
    }
  };

  // Delete workout
  const deleteWorkout = (id) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
    if (activeWorkoutDetail && activeWorkoutDetail.id === id) {
      setActiveWorkoutDetail(null);
    }
  };

  // Asignar rutina a un alumno para un día y semana específicos
  const assignWorkoutToAthleteDay = (athleteId, dayId, workoutId, weekKey = selectedWeek) => {
    setWeeklyAthletePlans(prev => {
      const athleteWeeks = prev[athleteId] || {};
      const targetWeek = athleteWeeks[weekKey] || {};
      return {
        ...prev,
        [athleteId]: {
          ...athleteWeeks,
          [weekKey]: {
            ...targetWeek,
            [dayId]: workoutId
          }
        }
      };
    });
  };

  // Copiar la programación de una semana entera de un alumno a otra semana
  const copyAthleteWeekPlan = (athleteId, fromWeekKey, toWeekKey) => {
    setWeeklyAthletePlans(prev => {
      const athleteWeeks = prev[athleteId] || {};
      const sourcePlan = athleteWeeks[fromWeekKey] || INITIAL_ATHLETE_PLANS[athleteId] || {};
      return {
        ...prev,
        [athleteId]: {
          ...athleteWeeks,
          [toWeekKey]: { ...sourcePlan }
        }
      };
    });
    celebrateCompletion();
  };

  // Asignar rutina a la programación general del Box (Competidores) para un día y semana específicos
  const assignBoxWorkoutToDay = (dayId, workoutId, weekKey = selectedWeek) => {
    setBoxWeeklySchedule(prev => {
      const targetWeek = prev[weekKey] || {};
      return {
        ...prev,
        [weekKey]: {
          ...targetWeek,
          [dayId]: workoutId
        }
      };
    });
  };

  // Copiar la programación de competidores de una semana a otra
  const copyBoxWeekPlan = (fromWeekKey, toWeekKey) => {
    setBoxWeeklySchedule(prev => {
      const sourceWeek = prev[fromWeekKey] || {};
      const populated = { ...sourceWeek };
      // Si la semana origen usaba rutinas por defecto, extraer sus IDs
      ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].forEach(d => {
        if (!populated[d]) {
          const def = competitorWorkouts.find(w => w.dayId === d);
          if (def) populated[d] = def.id;
        }
      });
      return {
        ...prev,
        [toWeekKey]: { ...populated }
      };
    });
    celebrateCompletion();
  };

  // Add PR
  const addPr = (newPr) => {
    const item = {
      id: `pr-${Date.now()}`,
      date: new Date().toLocaleDateString('es-ES'),
      ...newPr
    };
    setPrs(prev => [item, ...prev]);
    celebrateCompletion();
  };

  // Delete PR
  const deletePr = (id) => {
    setPrs(prev => prev.filter(p => p.id !== id));
  };

  // Add Performance Log
  const addPerformanceLog = (logData) => {
    const newLog = {
      id: `log-${Date.now()}`,
      userId: currentUser?.id || 'anonymous',
      date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...logData
    };
    setPerformanceLogs(prev => [newLog, ...prev]);
    celebrateCompletion();
    return newLog;
  };

  // Delete Performance Log
  const deletePerformanceLog = (id) => {
    setPerformanceLogs(prev => prev.filter(l => l.id !== id));
  };

  // Update custom logo
  const updateCustomLogo = (dataUrl) => {
    setCustomLogoUrl(dataUrl);
    if (dataUrl) {
      localStorage.setItem('hift_custom_logo', dataUrl);
    } else {
      localStorage.removeItem('hift_custom_logo');
    }
  };

  // Reset to default workouts and plans
  const resetToDefaults = () => {
    setWorkouts(INITIAL_WORKOUTS);
    setWeeklyAthletePlans({});
    setBoxWeeklySchedule({});
    setPrs(INITIAL_PRS);
    setPerformanceLogs([]);
    setCompletedExercises({});
    localStorage.removeItem('hift_workouts_v3');
    localStorage.removeItem('hift_athlete_plans_v2');
    localStorage.removeItem('hift_weekly_athlete_plans_v1');
    localStorage.removeItem('hift_box_weekly_schedule_v1');
    localStorage.removeItem('hift_prs_v3');
    localStorage.removeItem('hift_performance_logs_v1');
    localStorage.removeItem('hift_completed_exercises');
  };

  // Active athlete id
  const activeAthleteId = currentUser?.role === 'athlete' 
    ? currentUser.id 
    : managingAthleteId;

  // Plan del atleta activo para la semana seleccionada
  const currentAthletePlan = (weeklyAthletePlans[activeAthleteId] && weeklyAthletePlans[activeAthleteId][selectedWeek]) 
    || INITIAL_ATHLETE_PLANS[activeAthleteId] 
    || {};

  const assignedWorkoutIdForSelectedDay = currentAthletePlan[selectedDay];

  // Workouts for Traditional Gym
  const traditionalWorkouts = workouts.filter(w => w.zone === 'traditional');

  // Filtered workouts in traditional gym based on viewMode
  const filteredTraditionalWorkouts = traditionalWorkouts.filter(w => {
    if (viewMode === 'coach_plan') {
      return w.id === assignedWorkoutIdForSelectedDay;
    } else {
      // Muscle groups mode
      if (selectedMuscleGroup === 'all') return true;
      return w.muscleGroup === selectedMuscleGroup;
    }
  });

  // Workouts for Competitors zone
  const competitorWorkouts = workouts.filter(w => w.zone === 'competitors');

  // Competitor workout for the currently selected week and day
  const scheduledCompetitorWorkoutId = boxWeeklySchedule[selectedWeek]?.[selectedDay];
  const competitorDayWorkout = scheduledCompetitorWorkoutId 
    ? (workouts.find(w => w.id === scheduledCompetitorWorkoutId) || null)
    : (competitorWorkouts.find(w => w.dayId === selectedDay) || null);

  return (
    <WorkoutContext.Provider value={{
      activeZone,
      setActiveZone,
      viewMode,
      setViewMode,
      selectedMuscleGroup,
      setSelectedMuscleGroup,
      selectedWeek,
      setSelectedWeek,
      selectedDay,
      setSelectedDay,
      athletePlans: currentAthletePlan,
      weeklyAthletePlans,
      boxWeeklySchedule,
      assignWorkoutToAthleteDay,
      copyAthleteWeekPlan,
      assignBoxWorkoutToDay,
      copyBoxWeekPlan,
      managingAthleteId,
      setManagingAthleteId,
      activeAthleteId,
      workouts,
      traditionalWorkouts,
      filteredTraditionalWorkouts,
      competitorWorkouts,
      competitorDayWorkout,
      completedExercises,
      toggleExercise,
      celebrateCompletion,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      prs,
      addPr,
      deletePr,
      performanceLogs,
      addPerformanceLog,
      deletePerformanceLog,
      activeWorkoutDetail,
      setActiveWorkoutDetail,
      customLogoUrl,
      updateCustomLogo,
      resetToDefaults,
      // Readiness / RPE Daily check-in
      readinessLogs,
      saveDailyReadiness,
      getTodayReadiness,
      isDeloadMode,
      toggleDeloadMode,
      // Global Modals
      isPercentageCalcOpen,
      percentageCalcPreset,
      openPercentageCalc,
      closePercentageCalc,
      isStoryModalOpen,
      storyWorkoutData,
      openStoryModal,
      closeStoryModal,
      isReadinessModalOpen,
      openReadinessModal,
      closeReadinessModal
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkouts() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkouts must be used within a WorkoutProvider');
  return ctx;
}
