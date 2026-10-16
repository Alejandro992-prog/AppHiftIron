import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  ArrowLeft, 
  Award, 
  Play, 
  Clock, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';
import BaseCalendar from '../../components/shared/BaseCalendar';
import ProtectedZoneGate from '../../components/shared/ProtectedZoneGate';
import PerformanceModal from '../../components/shared/PerformanceModal';
import RoutineCard from '../../components/athlete/RoutineCard';
import CompetitorReadinessGate from '../../components/competitors/CompetitorReadinessGate';
import CompetitorAdaptationCard from '../../components/competitors/CompetitorAdaptationCard';
import { shiftWeekKey } from '../../utils/weekManager';

export default function CompetitorsView({ onOpenTimerWithPreset: _onOpenTimerWithPreset }) {
  const { currentUser, canAccessZone, isAdmin } = useAuth();
  const { 
    setActiveZone, 
    workouts,
    competitorWorkouts, 
    competitorDayWorkout, 
    selectedWeek,
    setSelectedWeek,
    selectedDay, 
    setSelectedDay,
    setActiveWorkoutDetail,
    boxWeeklySchedule,
    assignBoxWorkoutToDay,
    copyBoxWeekPlan,
    getTodayReadiness,
    resetTodayReadiness,
    openReadinessModal
  } = useWorkouts();

  // The 3 required user tabs: 'daily_session' | 'calendar' | 'table_workouts'
  const [activeMenuTab, setActiveMenuTab] = useState('daily_session');
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState('');
  const [coachBypass, setCoachBypass] = useState(false);
  const autoOpenedRef = useRef(false);

  // Daily Fatigue / Readiness Check
  const todayEntry = getTodayReadiness(currentUser?.id);
  const isCoachOrAdmin = isAdmin || currentUser?.role === 'admin' || currentUser?.role === 'coach';
  const hasAccess = canAccessZone('competitors');
  const isWorkoutUnlocked = Boolean(todayEntry) || (isCoachOrAdmin && coachBypass);

  // Auto-open modal on first access if athlete has not completed today's test
  useEffect(() => {
    if (hasAccess && !todayEntry && !isCoachOrAdmin && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      openReadinessModal();
    }
  }, [hasAccess, todayEntry, isCoachOrAdmin, openReadinessModal]);

  // Access check
  if (!hasAccess) {
    return <ProtectedZoneGate requiredZone="competitors" onReturnToDashboard={() => setActiveZone('dashboard')} />;
  }

  // If workout is locked due to pending mandatory fatigue test
  if (!isWorkoutUnlocked) {
    return (
      <CompetitorReadinessGate
        onOpenTest={openReadinessModal}
        onReturnToDashboard={() => setActiveZone('dashboard')}
        isCoachOrAdmin={isCoachOrAdmin}
        onCoachBypass={() => setCoachBypass(true)}
      />
    );
  }

  // Map of days with competitor workouts for this week (sin falso positivo de || true)
  const competitorWorkoutMap = {};
  ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].forEach(d => {
    const scheduledId = boxWeeklySchedule[selectedWeek]?.[d];
    if (scheduledId) {
      competitorWorkoutMap[d] = workouts.find(w => w.id === scheduledId) || null;
    } else {
      competitorWorkoutMap[d] = competitorWorkouts.find(w => w.dayId === d) || null;
    }
  });

  // Today's workout (determined by today's day)
  const todayId = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()] || 'mon';
  const todaysWorkout = competitorWorkouts.find(w => w.dayId === todayId) || competitorDayWorkout || competitorWorkouts[0];

  const handleOpenPerformanceModal = (exerciseName = '') => {
    setSelectedExerciseForModal(exerciseName);
    setIsPerformanceModalOpen(true);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Clean Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2px 0'
      }}>
        <button
          onClick={() => setActiveZone('dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <ArrowLeft size={14} />
          <span>Inicio</span>
        </button>

        <span style={{
          fontSize: '11.5px',
          fontWeight: '900',
          color: 'var(--brand-pink)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Flame size={13} />
          <span>Competidores</span>
        </span>
      </div>

      {/* Simplified Segmented Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '4px',
        background: 'var(--bg-secondary)',
        padding: '3px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={() => setActiveMenuTab('daily_session')}
          style={{
            padding: '8px 4px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: activeMenuTab === 'daily_session' ? 'var(--brand-gradient)' : 'transparent',
            color: activeMenuTab === 'daily_session' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Sesión Hoy</span>
        </button>

        <button
          onClick={() => setActiveMenuTab('calendar')}
          style={{
            padding: '8px 4px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: activeMenuTab === 'calendar' ? 'var(--brand-gradient)' : 'transparent',
            color: activeMenuTab === 'calendar' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Calendario</span>
        </button>

        <button
          onClick={() => setActiveMenuTab('table_workouts')}
          style={{
            padding: '8px 4px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: activeMenuTab === 'table_workouts' ? 'var(--brand-gradient)' : 'transparent',
            color: activeMenuTab === 'table_workouts' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Biblioteca</span>
        </button>
      </div>

      {/* 1. SESIÓN HOY */}
      {activeMenuTab === 'daily_session' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Tarjeta Oficial de Adaptación según puntuación del test */}
          {todayEntry && (
            <CompetitorAdaptationCard 
              todayEntry={todayEntry}
              onEditTest={openReadinessModal}
              onResetTest={() => resetTodayReadiness(currentUser?.id)}
              variant="card"
            />
          )}

          {todaysWorkout ? (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
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

                  {todayEntry && todayEntry.volumeReduction !== '0%' && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      color: '#fb923c',
                      background: 'rgba(249, 115, 22, 0.18)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      Ajuste sugerido: {todayEntry.volumeReduction}
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', lineHeight: 1.3, margin: 0 }}>
                  {todaysWorkout.title}
                </h2>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {todaysWorkout.description}
                </p>
              </div>

              {/* Sections list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Bloques a Realizar ({todaysWorkout.sections.length})
                </span>

                {todaysWorkout.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveWorkoutDetail({ ...todaysWorkout, initialSectionIndex: idx })}
                    role="button"
                    tabIndex={0}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {sec.exercises.length} ejercicios
                      </span>
                      <ChevronRight size={14} color="var(--brand-pink)" />
                    </div>
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
          {todayEntry && (
            <CompetitorAdaptationCard 
              todayEntry={todayEntry}
              onEditTest={openReadinessModal}
              variant="compact"
            />
          )}

          <BaseCalendar 
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            selectedWeek={selectedWeek}
            onSelectWeek={setSelectedWeek}
            zone="competitors"
            workoutMap={competitorWorkoutMap}
            title="Calendario Semanal Competidores"
            showWeekNavigator={true}
            showCopyButton={currentUser?.role === 'admin' || currentUser?.role === 'coach'}
            onCopyWeekToNext={() => copyBoxWeekPlan(selectedWeek, shiftWeekKey(selectedWeek, 1))}
          />

          {/* Coach Quick WOD Override for this day & week */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'coach') && (
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--brand-pink)', textTransform: 'uppercase' }}>
                Coach: Cambiar WOD para {selectedDay.toUpperCase()} ({selectedWeek})
              </span>
              <select
                value={boxWeeklySchedule[selectedWeek]?.[selectedDay] || ''}
                onChange={(e) => assignBoxWorkoutToDay(selectedDay, e.target.value || null, selectedWeek)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '700',
                  outline: 'none',
                  flex: 1,
                  minWidth: '220px'
                }}
              >
                <option value="">(WOD por defecto del sistema)</option>
                {workouts.filter(w => w.zone === 'competitors').map(w => (
                  <option key={w.id} value={w.id}>
                    {w.title} ({w.duration})
                  </option>
                ))}
              </select>
            </div>
          )}

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
          {todayEntry && (
            <CompetitorAdaptationCard 
              todayEntry={todayEntry}
              onEditTest={openReadinessModal}
              variant="compact"
            />
          )}

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
