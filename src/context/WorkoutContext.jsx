import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_WORKOUTS, INITIAL_PRS } from '../data/initialWorkouts';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';
import { getWeekKey, formatLocalDate } from '../utils/weekManager';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchWorkoutsFromSupabase,
  upsertWorkoutInSupabase,
  deleteWorkoutFromSupabase,
  fetchWeeklyPlansFromSupabase,
  saveWeeklyPlanInSupabase,
  fetchBoxScheduleFromSupabase,
  saveBoxScheduleInSupabase,
  fetchPrsFromSupabase,
  upsertPrInSupabase,
  deletePrFromSupabase,
  fetchPerformanceLogsFromSupabase,
  upsertPerformanceLogInSupabase,
  deletePerformanceLogFromSupabase,
  fetchReadinessLogsFromSupabase,
  upsertReadinessLogInSupabase,
  fetchCompletedExercisesFromSupabase,
  upsertCompletedExerciseInSupabase,
  syncSeedDataToSupabase,
  testSupabaseConnection
} from '../services/supabaseService';
import { generateSecureId } from '../utils/validators';

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

  // Multi-week assignments for individual athletes en memoria (nutrido desde Supabase)
  const [weeklyAthletePlans, setWeeklyAthletePlans] = useState(() => {
    const currentWk = getWeekKey(new Date());
    const initial = {};
    Object.keys(INITIAL_ATHLETE_PLANS).forEach(athleteId => {
      initial[athleteId] = {
        [currentWk]: { ...INITIAL_ATHLETE_PLANS[athleteId] }
      };
    });
    return initial;
  });

  // Multi-week assignments for general Box Competitors programming en memoria
  const [boxWeeklySchedule, setBoxWeeklySchedule] = useState({});

  // Selected athlete in Admin Plan Manager (default: 'user-athlete-1')
  const [managingAthleteId, setManagingAthleteId] = useState('user-athlete-1');

  // Workouts database en memoria
  const [workouts, setWorkouts] = useState(INITIAL_WORKOUTS);

  // PRs (Personal Records) en memoria
  const [prs, setPrs] = useState(INITIAL_PRS);

  // Daily performance logs en memoria
  const [performanceLogs, setPerformanceLogs] = useState([]);

  // Completed exercises checklist state en memoria
  const [completedExercises, setCompletedExercises] = useState({});

  // Currently opened workout detail
  const [activeWorkoutDetail, setActiveWorkoutDetail] = useState(null);

  // Readiness / RPE Daily check-in logs
  const getTodayKey = () => formatLocalDate(new Date());

  // Readiness / RPE Daily check-in logs (cargado de forma aislada y privada por cada atleta)
  const [readinessLogs, setReadinessLogs] = useState({});

  // Sincronización inicial de catálogos generales desde Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    fetchWorkoutsFromSupabase().then(remoteWorkouts => {
      if (remoteWorkouts && remoteWorkouts.length > 0) {
        setWorkouts(remoteWorkouts);
      }
    });

    fetchBoxScheduleFromSupabase().then(remoteSchedule => {
      if (remoteSchedule && Object.keys(remoteSchedule).length > 0) {
        setBoxWeeklySchedule(remoteSchedule);
      }
    });
  }, []);

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

  const openReadinessModal = useCallback(() => {
    setIsReadinessModalOpen(true);
  }, []);

  const closeReadinessModal = useCallback(() => {
    setIsReadinessModalOpen(false);
  }, []);

  const saveDailyReadiness = (userId, data) => {
    const today = getTodayKey();
    const key = `${today}_${userId}`;
    const entry = {
      userId,
      athleteId: userId,
      date: today,
      ...data,
      loggedAt: new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date())
    };

    setReadinessLogs(prev => ({ ...prev, [key]: entry }));

    // Solo persistir en Supabase si no estamos en previsualización de Coach
    if (isSupabaseConfigured && !currentUser?.isPreviewMode) {
      upsertReadinessLogInSupabase(key, entry);
    }

    if (data.deloadMode !== undefined) {
      setIsDeloadMode(data.deloadMode);
    }
  };

  const getTodayReadiness = (userId) => {
    if (!userId) return null;
    const today = getTodayKey();
    return readinessLogs[`${today}_${userId}`] || null;
  };

  const getAthleteReadinessHistory = (userId) => {
    if (!userId) return [];
    return Object.values(readinessLogs)
      .filter(entry => entry.userId === userId)
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
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

  const resetTodayReadiness = (userId) => {
    if (!userId) return;
    const today = getTodayKey();
    const key = `${today}_${userId}`;
    setReadinessLogs(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setIsDeloadMode(false);
  };

  // Custom logo URL en memoria
  const [customLogoUrl, setCustomLogoUrl] = useState(null);

  // Restablecer estado al cambiar de usuario o cerrar sesión (Prevención de fuga de datos en dispositivos compartidos - M4)
  const [prevLoggedUserId, setPrevLoggedUserId] = useState(currentUser?.id);
  if (currentUser?.id !== prevLoggedUserId) {
    setPrevLoggedUserId(currentUser?.id);
    setActiveZone('dashboard');
    setActiveWorkoutDetail(null);
    setCompletedExercises({});
    setPrs([]);
    setPerformanceLogs([]);
    setReadinessLogs({});
    setWeeklyAthletePlans({});
    setIsDeloadMode(false);
    if (!currentUser?.id) {
      setBoxWeeklySchedule({});
      setWorkouts(INITIAL_WORKOUTS.filter(w => w.zone === 'traditional'));
    }
  }

  // Cargar datos privados del usuario desde Supabase ÚNICAMENTE cuando está autenticado
  const currentUserId = currentUser?.id;
  const isCoach = currentUser?.role === 'admin';
  useEffect(() => {
    if (!isSupabaseConfigured || !currentUserId) return;

    // Si es Coach carga planes de todos los alumnos; si es atleta acota a su ID
    fetchWeeklyPlansFromSupabase(isCoach ? null : currentUserId).then(remotePlans => {
      if (remotePlans && Object.keys(remotePlans).length > 0) {
        setWeeklyAthletePlans(remotePlans);
      }
    });

    // Minimización RGPD Art. 9: Los atletas solo descargan su propio historial de fatiga y salud
    fetchReadinessLogsFromSupabase(isCoach ? null : currentUserId).then(remoteReadiness => {
      if (remoteReadiness && Object.keys(remoteReadiness).length > 0) {
        setReadinessLogs(prev => ({ ...prev, ...remoteReadiness }));
      }
    });

    fetchCompletedExercisesFromSupabase(currentUserId).then(remoteExercises => {
      if (remoteExercises) {
        setCompletedExercises(remoteExercises);
      }
    });

    fetchPrsFromSupabase(currentUserId).then(remotePrs => {
      if (remotePrs) {
        setPrs(remotePrs);
      }
    });

    fetchPerformanceLogsFromSupabase(currentUserId).then(remoteLogs => {
      if (remoteLogs) {
        setPerformanceLogs(remoteLogs);
      }
    });
  }, [currentUserId, isCoach]);

  // Toggle exercise checkbox y sincronizar en Supabase (sin localStorage)
  const toggleExercise = (key) => {
    setCompletedExercises(prev => {
      const nextVal = !prev[key];
      const updated = { ...prev, [key]: nextVal };
      if (isSupabaseConfigured && currentUser?.id && !currentUser?.isPreviewMode) {
        upsertCompletedExerciseInSupabase(currentUser.id, key, nextVal);
      }
      return updated;
    });
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
    if (isSupabaseConfigured) {
      upsertWorkoutInSupabase(workoutData);
    }
  };

  // Update existing workout
  const updateWorkout = (id, updatedData) => {
    setWorkouts(prev => {
      const next = prev.map(w => w.id === id ? { ...w, ...updatedData } : w);
      if (isSupabaseConfigured) {
        const item = next.find(w => w.id === id);
        if (item) upsertWorkoutInSupabase(item);
      }
      return next;
    });
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
    if (isSupabaseConfigured) {
      deleteWorkoutFromSupabase(id);
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
    if (isSupabaseConfigured) {
      saveWeeklyPlanInSupabase(athleteId, weekKey, dayId, workoutId);
    }
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
    if (isSupabaseConfigured) {
      saveBoxScheduleInSupabase(weekKey, dayId, workoutId);
    }
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

  // Add PR con ID criptoseguro
  const addPr = (newPr) => {
    const item = {
      id: generateSecureId('pr'),
      date: new Date().toLocaleDateString('es-ES'),
      ...newPr
    };
    setPrs(prev => [item, ...prev]);
    if (isSupabaseConfigured && currentUser?.id && !currentUser?.isPreviewMode) {
      upsertPrInSupabase(item, currentUser.id);
    }
    celebrateCompletion();
  };

  // Delete PR
  const deletePr = (id) => {
    if (currentUser?.isPreviewMode) return;
    setPrs(prev => prev.filter(p => p.id !== id));
    if (isSupabaseConfigured) {
      deletePrFromSupabase(id);
    }
  };

  // Add Performance Log con ID criptoseguro y fecha ISO
  const addPerformanceLog = (logData) => {
    const newLog = {
      id: generateSecureId('log'),
      userId: currentUser?.id || 'anonymous',
      athlete_id: currentUser?.id || null,
      date: new Date().toISOString(),
      ...logData
    };
    setPerformanceLogs(prev => [newLog, ...prev]);
    if (isSupabaseConfigured && currentUser?.id && !currentUser?.isPreviewMode) {
      upsertPerformanceLogInSupabase(newLog, currentUser.id);
    }
    celebrateCompletion();
    return newLog;
  };

  // Delete Performance Log
  const deletePerformanceLog = (id) => {
    if (currentUser?.isPreviewMode) return;
    setPerformanceLogs(prev => prev.filter(l => l.id !== id));
    if (isSupabaseConfigured) {
      deletePerformanceLogFromSupabase(id);
    }
  };

  // Update custom logo (en memoria)
  const updateCustomLogo = (dataUrl) => {
    setCustomLogoUrl(dataUrl);
  };

  // Reset to default workouts and plans (en memoria)
  const resetToDefaults = () => {
    setWorkouts(INITIAL_WORKOUTS);
    setWeeklyAthletePlans({});
    setBoxWeeklySchedule({});
    setPrs(INITIAL_PRS);
    setPerformanceLogs([]);
    setCompletedExercises({});
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
      // Supabase Cloud helpers
      isSupabaseConfigured,
      testSupabaseConnection,
      syncSeedDataToSupabase,
      // Readiness / RPE Daily check-in
      readinessLogs,
      saveDailyReadiness,
      getTodayReadiness,
      resetTodayReadiness,
      getAthleteReadinessHistory,
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
