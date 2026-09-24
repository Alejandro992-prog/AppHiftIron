import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_WORKOUTS, INITIAL_PRS, DAYS_OF_WEEK } from '../data/initialWorkouts';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

const WorkoutContext = createContext();

const INITIAL_ATHLETE_PLANS = {
  'user-athlete-1': {
    'mon': 'gym-chest-triceps-1',
    'tue': 'gym-back-shoulders-1',
    'wed': 'gym-legs-glutes-1',
    'thu': null,
    'fri': 'gym-biceps-triceps-1',
    'sat': 'gym-full-body-1',
    'sun': null
  },
  'user-athlete-2': {
    'mon': 'gym-legs-glutes-1',
    'tue': 'gym-full-body-1',
    'wed': null,
    'thu': 'gym-back-shoulders-1',
    'fri': 'gym-chest-triceps-1',
    'sat': 'wod-crossfit-box-1',
    'sun': null
  },
  'user-athlete-3': {
    'mon': 'gym-full-body-1',
    'tue': 'wod-crossfit-box-1',
    'wed': 'gym-biceps-triceps-1',
    'thu': 'gym-chest-triceps-1',
    'fri': null,
    'sat': 'gym-legs-glutes-1',
    'sun': 'mob-recovery-1'
  }
};

export function WorkoutProvider({ children }) {
  const { currentUser } = useAuth();

  // Mode: 'muscle_groups' (Catálogo libre de rutinas) vs 'coach_plan' (Mi plan asignado por el coach)
  const [viewMode, setViewMode] = useState('muscle_groups');

  // Selected muscle group filter
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
      const saved = localStorage.getItem('hift_athlete_plans_v1');
      return saved ? JSON.parse(saved) : INITIAL_ATHLETE_PLANS;
    } catch {
      return INITIAL_ATHLETE_PLANS;
    }
  });

  // Selected athlete in Admin Plan Manager (default: 'user-athlete-1')
  const [managingAthleteId, setManagingAthleteId] = useState('user-athlete-1');

  // Workouts database
  const [workouts, setWorkouts] = useState(() => {
    try {
      const saved = localStorage.getItem('hift_workouts_v2');
      return saved ? JSON.parse(saved) : INITIAL_WORKOUTS;
    } catch {
      return INITIAL_WORKOUTS;
    }
  });

  // PRs
  const [prs, setPrs] = useState(() => {
    try {
      const saved = localStorage.getItem('hift_prs_v2');
      return saved ? JSON.parse(saved) : INITIAL_PRS;
    } catch {
      return INITIAL_PRS;
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

  // Persist athlete plans
  useEffect(() => {
    try {
      localStorage.setItem('hift_athlete_plans_v1', JSON.stringify(athletePlans));
    } catch (e) {
      console.error(e);
    }
  }, [athletePlans]);

  // Persist workouts
  useEffect(() => {
    try {
      localStorage.setItem('hift_workouts_v2', JSON.stringify(workouts));
    } catch (e) {
      console.error(e);
    }
  }, [workouts]);

  // Persist PRs
  useEffect(() => {
    try {
      localStorage.setItem('hift_prs_v2', JSON.stringify(prs));
    } catch (e) {
      console.error(e);
    }
  }, [prs]);

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
    setCompletedExercises({});
    localStorage.removeItem('hift_workouts_v2');
    localStorage.removeItem('hift_athlete_plans_v1');
    localStorage.removeItem('hift_prs_v2');
    localStorage.removeItem('hift_completed_exercises');
  };

  // Calculate filtered workouts based on active viewMode:
  // In 'coach_plan': returns the workout assigned to the active athlete for the selected day!
  const activeAthleteId = currentUser?.role === 'athlete' 
    ? currentUser.id 
    : managingAthleteId;

  const currentAthletePlan = athletePlans[activeAthleteId] || {};
  const assignedWorkoutIdForSelectedDay = currentAthletePlan[selectedDay];

  const filteredWorkouts = workouts.filter(w => {
    if (viewMode === 'coach_plan') {
      return w.id === assignedWorkoutIdForSelectedDay;
    } else {
      // Muscle groups mode
      if (selectedMuscleGroup === 'all') return true;
      return w.muscleGroup === selectedMuscleGroup;
    }
  });

  return (
    <WorkoutContext.Provider value={{
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
      filteredWorkouts,
      completedExercises,
      toggleExercise,
      celebrateCompletion,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      prs,
      addPr,
      deletePr,
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
