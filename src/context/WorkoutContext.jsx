import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_WORKOUTS, INITIAL_PRS } from '../data/initialWorkouts';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

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

  // Selected day for weekly plan
  const [selectedDay, setSelectedDay] = useState(() => {
    const dayIndex = new Date().getDay();
    const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return map[dayIndex] || 'mon';
  });

  // Individual athlete weekly assignments: { [athleteId]: { [dayId]: workoutId } }
  const [athletePlans, setAthletePlans] = useState(() => {
    try {
      const saved = localStorage.getItem('hift_athlete_plans_v2');
      return saved ? JSON.parse(saved) : INITIAL_ATHLETE_PLANS;
    } catch {
      return INITIAL_ATHLETE_PLANS;
    }
  });

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

  // Assign workout to an athlete for a specific day
  const assignWorkoutToAthleteDay = (athleteId, dayId, workoutId) => {
    setAthletePlans(prev => ({
      ...prev,
      [athleteId]: {
        ...(prev[athleteId] || {}),
        [dayId]: workoutId
      }
    }));
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
    setAthletePlans(INITIAL_ATHLETE_PLANS);
    setPrs(INITIAL_PRS);
    setPerformanceLogs([]);
    setCompletedExercises({});
    localStorage.removeItem('hift_workouts_v3');
    localStorage.removeItem('hift_athlete_plans_v2');
    localStorage.removeItem('hift_prs_v3');
    localStorage.removeItem('hift_performance_logs_v1');
    localStorage.removeItem('hift_completed_exercises');
  };

  // Active athlete id
  const activeAthleteId = currentUser?.role === 'athlete' 
    ? currentUser.id 
    : managingAthleteId;

  const currentAthletePlan = athletePlans[activeAthleteId] || {};
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

  // Competitor workout for the currently selected day
  const competitorDayWorkout = competitorWorkouts.find(w => w.dayId === selectedDay) || null;

  return (
    <WorkoutContext.Provider value={{
      activeZone,
      setActiveZone,
      viewMode,
      setViewMode,
      selectedMuscleGroup,
      setSelectedMuscleGroup,
      selectedDay,
      setSelectedDay,
      athletePlans,
      assignWorkoutToAthleteDay,
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
      resetToDefaults
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
