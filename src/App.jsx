import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkoutProvider, useWorkouts } from './context/WorkoutContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import MuscleGroupSelector from './components/gym/MuscleGroupSelector';
import DaySelector from './components/athlete/DaySelector';
import RoutineCard from './components/athlete/RoutineCard';
import RoutineDetail from './components/athlete/RoutineDetail';
import BoxTimer from './components/timer/BoxTimer';
import AdminPanel from './components/admin/AdminPanel';
import LoginScreen from './components/auth/LoginScreen';
import { Dumbbell, Calendar } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, currentUser, isAdmin } = useAuth();
  const { 
    viewMode,
    setViewMode,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    filteredWorkouts, 
    activeWorkoutDetail, 
    setActiveWorkoutDetail 
  } = useWorkouts();

  // Active tab: 'workouts' | 'timer' | 'admin'
  const [activeTab, setActiveTab] = useState('workouts');
  const [timerPreset, setTimerPreset] = useState(null);

  // If not logged in, show the clean Login Screen where users enter email/user & password
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleOpenTimerWithPreset = (preset) => {
    setTimerPreset(preset);
    setActiveWorkoutDetail(null);
    setActiveTab('timer');
  };

  const handleNavigateToRoutineFromAdmin = (workout) => {
    setActiveWorkoutDetail(workout);
    setActiveTab('workouts');
  };

  return (
    <div className="app-viewport-wrapper">
      <div className="mobile-app-container">
        {/* Minimal Header */}
        <Header />

        {/* Main Content */}
        <main className="app-content" style={{ padding: '14px 16px calc(var(--bottom-nav-height) + 16px) 16px', gap: '14px' }}>
          {activeWorkoutDetail ? (
            /* Routine Detail with Step-by-Step Exercises and Group Timers */
            <RoutineDetail 
              workout={activeWorkoutDetail}
              onBack={() => setActiveWorkoutDetail(null)}
              onOpenTimerWithPreset={handleOpenTimerWithPreset}
            />
          ) : (
            /* Tab Views */
            <>
              {activeTab === 'workouts' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Clean Mode Toggle */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4px',
                    background: 'var(--bg-secondary)',
                    padding: '3px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <button
                      onClick={() => setViewMode('muscle_groups')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: viewMode === 'muscle_groups' ? 'var(--brand-gradient)' : 'transparent',
                        color: viewMode === 'muscle_groups' ? '#ffffff' : 'var(--text-secondary)',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <Dumbbell size={14} />
                      <span>Catálogo Gym</span>
                    </button>

                    <button
                      onClick={() => setViewMode('coach_plan')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: viewMode === 'coach_plan' ? 'var(--brand-gradient)' : 'transparent',
                        color: viewMode === 'coach_plan' ? '#ffffff' : 'var(--text-secondary)',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <Calendar size={14} />
                      <span>Plan Asignado</span>
                    </button>
                  </div>

                  {/* Mode Specific Selector */}
                  {viewMode === 'muscle_groups' ? (
                    <MuscleGroupSelector 
                      selectedGroup={selectedMuscleGroup} 
                      onSelectGroup={setSelectedMuscleGroup} 
                    />
                  ) : (
                    <div>
                      {/* Personalized Header Indicator */}
                      <div style={{
                        padding: '0 4px 6px 4px',
                        fontSize: '11.5px',
                        color: 'var(--text-secondary)'
                      }}>
                        Tu plan semanal personalizado:
                      </div>

                      <DaySelector />
                    </div>
                  )}

                  {/* Routines List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
                    {filteredWorkouts.length > 0 ? (
                      filteredWorkouts.map(workout => (
                        <RoutineCard 
                          key={workout.id} 
                          workout={workout} 
                          onSelect={(w) => setActiveWorkoutDetail(w)} 
                        />
                      ))
                    ) : (
                      <div style={{
                        padding: '30px 16px',
                        textAlign: 'center',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        fontSize: '13px'
                      }}>
                        {viewMode === 'coach_plan' ? (
                          <>
                            <div style={{ fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
                              Día de descanso programado
                            </div>
                            <span style={{ fontSize: '12px' }}>
                              Tu coach no ha fijado rutina para este día o toca recuperación activa.
                            </span>
                          </>
                        ) : (
                          'No hay rutinas para esta selección.'
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'timer' && (
                <BoxTimer initialPreset={timerPreset} />
              )}

              {activeTab === 'admin' && isAdmin && (
                <AdminPanel onNavigateToRoutine={handleNavigateToRoutineFromAdmin} />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveWorkoutDetail(null);
            setActiveTab(tab);
          }} 
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <MainApp />
      </WorkoutProvider>
    </AuthProvider>
  );
}
