import React, { useState } from 'react';
import { 
  Dumbbell, 
  ArrowLeft, 
  Calendar, 
  Award, 
  Layers, 
  Plus, 
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';
import BaseCalendar from '../../components/shared/BaseCalendar';
import MuscleGroupSelector from '../../components/gym/MuscleGroupSelector';
import RoutineCard from '../../components/athlete/RoutineCard';
import PerformanceModal from '../../components/shared/PerformanceModal';

export default function TraditionalGymView() {
  const { currentUser } = useAuth();
  const { 
    setActiveZone, 
    viewMode, 
    setViewMode, 
    selectedMuscleGroup, 
    setSelectedMuscleGroup,
    selectedDay, 
    setSelectedDay,
    filteredTraditionalWorkouts,
    traditionalWorkouts,
    setActiveWorkoutDetail,
    athletePlans,
    activeAthleteId,
    performanceLogs
  } = useWorkouts();

  const [activeSubTab, setActiveSubTab] = useState('workouts'); // 'workouts' | 'strength_logs'
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState('');

  // Map of days with assigned workouts in personal plan
  const currentPlan = athletePlans[activeAthleteId] || {};
  const workoutMapForCalendar = Object.keys(currentPlan).reduce((acc, day) => {
    const wId = currentPlan[day];
    if (wId) {
      acc[day] = traditionalWorkouts.find(w => w.id === wId) || true;
    }
    return acc;
  }, {});

  const handleOpenPerformanceModal = (exerciseName = '') => {
    setSelectedExerciseForModal(exerciseName);
    setIsPerformanceModalOpen(true);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Navigation & Breadcrumb */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2px'
      }}>
        <button
          onClick={() => setActiveZone('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 12px',
            fontSize: '11.5px',
            fontWeight: '700',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={13} />
          <span>Cambiar de Zona</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            color: 'var(--brand-lilac-light)',
            background: 'rgba(168, 85, 247, 0.12)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Dumbbell size={12} color="var(--brand-lilac-light)" />
            <span>GIMNASIO FITNESS</span>
          </span>
        </div>
      </div>

      {/* Main Mode Toggle: Catálogo vs Plan Asignado */}
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
          onClick={() => {
            setViewMode('muscle_groups');
            setActiveSubTab('workouts');
          }}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: viewMode === 'muscle_groups' && activeSubTab === 'workouts' ? 'var(--brand-gradient)' : 'transparent',
            color: viewMode === 'muscle_groups' && activeSubTab === 'workouts' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Dumbbell size={14} />
          <span>Catálogo por Músculo</span>
        </button>

        <button
          onClick={() => {
            setViewMode('coach_plan');
            setActiveSubTab('workouts');
          }}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: viewMode === 'coach_plan' && activeSubTab === 'workouts' ? 'var(--brand-gradient)' : 'transparent',
            color: viewMode === 'coach_plan' && activeSubTab === 'workouts' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Calendar size={14} />
          <span>Mi Plan Personalizado</span>
        </button>
      </div>

      {/* Mode Specific Selector Header */}
      {viewMode === 'muscle_groups' ? (
        <MuscleGroupSelector 
          selectedGroup={selectedMuscleGroup} 
          onSelectGroup={setSelectedMuscleGroup} 
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 4px',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <UserCheck size={14} color="var(--brand-lilac-light)" />
            <span>Plan semanal individual fijado para <strong>{currentUser?.name}</strong>:</span>
          </div>

          <BaseCalendar 
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            zone="traditional"
            workoutMap={workoutMapForCalendar}
            title="Días de tu Plan Asignado"
          />
        </div>
      )}

      {/* Sub-bar with quick action to log series & loads */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px'
      }}>
        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
          {viewMode === 'muscle_groups' 
            ? `${filteredTraditionalWorkouts.length} rutinas en esta categoría`
            : `Rutina para este día`}
        </span>

        <button
          onClick={() => handleOpenPerformanceModal('')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--brand-lilac-light)',
            cursor: 'pointer'
          }}
        >
          <Plus size={12} />
          <span>Anotar Peso / Series</span>
        </button>
      </div>

      {/* Routines List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredTraditionalWorkouts.length > 0 ? (
          filteredTraditionalWorkouts.map(workout => (
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
              'No hay rutinas disponibles para este grupo muscular.'
            )}
          </div>
        )}
      </div>

      {/* Series & Load Tracker Snippet */}
      {performanceLogs.filter(l => l.zone === 'traditional').length > 0 && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginTop: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} color="var(--brand-lilac-light)" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase' }}>
              Tus Últimas Series Registradas (Gimnasio)
            </span>
          </div>

          {performanceLogs.filter(l => l.zone === 'traditional').slice(0, 3).map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                fontSize: '12px'
              }}
            >
              <div>
                <span style={{ fontWeight: '700', color: '#ffffff' }}>{log.exerciseName}</span>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{log.date} {log.notes && `• ${log.notes}`}</div>
              </div>
              <span style={{ fontWeight: '800', color: 'var(--brand-lilac-light)' }}>{log.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Performance Modal */}
      <PerformanceModal
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
        initialExerciseName={selectedExerciseForModal}
        initialZone="traditional"
        workoutId=""
      />
    </div>
  );
}
