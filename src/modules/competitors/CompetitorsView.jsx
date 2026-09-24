import React, { useState } from 'react';
import { 
  Flame, 
  ArrowLeft, 
  Timer, 
  Award, 
  Layers, 
  Play, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon,
  TableProperties,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';
import BaseCalendar from '../../components/shared/BaseCalendar';
import ProtectedZoneGate from '../../components/shared/ProtectedZoneGate';
import PerformanceModal from '../../components/shared/PerformanceModal';
import RoutineCard from '../../components/athlete/RoutineCard';

export default function CompetitorsView({ onOpenTimerWithPreset }) {
  const { canAccessZone } = useAuth();
  const { 
    setActiveZone, 
    competitorWorkouts, 
    competitorDayWorkout, 
    selectedDay, 
    setSelectedDay,
    setActiveWorkoutDetail
  } = useWorkouts();

  // The 3 required user tabs: 'daily_session' | 'calendar' | 'table_workouts'
  const [activeMenuTab, setActiveMenuTab] = useState('daily_session');
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState('');

  // Access check
  if (!canAccessZone('competitors')) {
    return <ProtectedZoneGate requiredZone="competitors" onReturnToDashboard={() => setActiveZone('dashboard')} />;
  }

  // Map of days with competitor workouts
  const competitorWorkoutMap = competitorWorkouts.reduce((acc, w) => {
    acc[w.dayId] = w;
    return acc;
  }, {});

  // Today's workout (determined by today's day)
  const todayId = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()] || 'mon';
  const todaysWorkout = competitorWorkouts.find(w => w.dayId === todayId) || competitorDayWorkout || competitorWorkouts[0];

  const handleOpenPerformanceModal = (exerciseName = '') => {
    setSelectedExerciseForModal(exerciseName);
    setIsPerformanceModalOpen(true);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Header & Breadcrumb */}
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

        <span style={{
          fontSize: '11px',
          fontWeight: '800',
          color: 'var(--brand-pink)',
          background: 'rgba(255, 45, 120, 0.12)',
          border: '1px solid rgba(255, 45, 120, 0.25)',
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <Flame size={12} color="var(--brand-pink)" />
          <span>ZONA COMPETIDOR</span>
        </span>
      </div>

      {/* 3 Main Required Menu Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '4px',
        background: 'var(--bg-secondary)',
        padding: '3px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={() => setActiveMenuTab('daily_session')}
          style={{
            padding: '9px 6px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            background: activeMenuTab === 'daily_session' ? 'linear-gradient(135deg, #ff2d78 0%, #a855f7 100%)' : 'transparent',
            color: activeMenuTab === 'daily_session' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Zap size={13} />
          <span>Sesión Diaria</span>
        </button>

        <button
          onClick={() => setActiveMenuTab('calendar')}
          style={{
            padding: '9px 6px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            background: activeMenuTab === 'calendar' ? 'linear-gradient(135deg, #ff2d78 0%, #a855f7 100%)' : 'transparent',
            color: activeMenuTab === 'calendar' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <CalendarIcon size={13} />
          <span>Calendario</span>
        </button>

        <button
          onClick={() => setActiveMenuTab('table_workouts')}
          style={{
            padding: '9px 6px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            background: activeMenuTab === 'table_workouts' ? 'linear-gradient(135deg, #ff2d78 0%, #a855f7 100%)' : 'transparent',
            color: activeMenuTab === 'table_workouts' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <TableProperties size={13} />
          <span>Tabla Entrenos</span>
        </button>
      </div>

      {/* 1. SESIÓN DIARIA */}
      {activeMenuTab === 'daily_session' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {todaysWorkout ? (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    color: 'var(--brand-pink)',
                    background: 'rgba(255, 45, 120, 0.15)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase'
                  }}>
                    {todaysWorkout.type}
                  </span>

                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {todaysWorkout.duration}
                  </span>
                </div>

                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', lineHeight: 1.3 }}>
                  {todaysWorkout.title}
                </h2>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {todaysWorkout.description}
                </p>
              </div>

              {/* Sections summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Bloques a Realizar Hoy ({todaysWorkout.sections.length})
                </span>

                {todaysWorkout.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'var(--brand-pink)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '900',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#ffffff' }}>
                        {sec.name}
                      </span>
                    </div>

                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {sec.exercises.length} ejercicios
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => setActiveWorkoutDetail(todaysWorkout)}
                  className="btn-primary"
                  style={{
                    padding: '12px',
                    fontSize: '12.5px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <Play size={14} />
                  <span>Empezar Entreno</span>
                </button>

                <button
                  onClick={() => handleOpenPerformanceModal(todaysWorkout.title)}
                  style={{
                    padding: '12px',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Award size={14} color="var(--brand-pink)" />
                  <span>Registrar Marca</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No hay sesión programada para hoy.
            </div>
          )}
        </div>
      )}

      {/* 2. CALENDARIO PROGRAMADO */}
      {activeMenuTab === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <BaseCalendar 
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            zone="competitors"
            workoutMap={competitorWorkoutMap}
            title="Calendario Semanal Competidores"
          />

          {competitorDayWorkout ? (
            <RoutineCard 
              workout={competitorDayWorkout} 
              onSelect={(w) => setActiveWorkoutDetail(w)} 
            />
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
              Día de descanso programado o recuperación activa.
            </div>
          )}
        </div>
      )}

      {/* 3. TABLA DE ENTRENAMIENTOS (BIBLIOTECA COMPLETA) */}
      {activeMenuTab === 'table_workouts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Biblioteca de Rutinas Competidores ({competitorWorkouts.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {competitorWorkouts.map(workout => (
              <RoutineCard 
                key={workout.id} 
                workout={workout} 
                onSelect={(w) => setActiveWorkoutDetail(w)} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Performance Modal */}
      <PerformanceModal
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
        initialExerciseName={selectedExerciseForModal}
        initialZone="competitors"
        workoutId={todaysWorkout?.id || ''}
      />
    </div>
  );
}
