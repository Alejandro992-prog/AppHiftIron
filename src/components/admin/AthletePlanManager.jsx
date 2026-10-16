import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';
import { Plus, Calendar, Eye } from 'lucide-react';
import WeekNavigator from '../shared/WeekNavigator';
import { getWeekDays, shiftWeekKey } from '../../utils/weekManager';
import InviteAthleteModal from './InviteAthleteModal';

export default function AthletePlanManager({ onNavigateToRoutine }) {
  const { athletes, loginAsAthlete } = useAuth();
  const { 
    workouts, 
    weeklyAthletePlans,
    selectedWeek,
    setSelectedWeek,
    assignWorkoutToAthleteDay, 
    copyAthleteWeekPlan,
    managingAthleteId, 
    setManagingAthleteId,
    setViewMode,
    setSelectedDay
  } = useWorkouts();

  const [showInviteModal, setShowInviteModal] = useState(false);

  // Currently managed athlete object
  const currentAthlete = athletes.find(a => a.id === managingAthleteId) || athletes[0];
  
  // Plan de la semana actualmente seleccionada para el alumno
  const currentPlan = (weeklyAthletePlans[currentAthlete?.id] && weeklyAthletePlans[currentAthlete?.id][selectedWeek]) || {};

  const handlePreviewAsAthlete = (dayId) => {
    if (!currentAthlete?.id) return;
    loginAsAthlete(currentAthlete.id);
    setViewMode('coach_plan');
    setSelectedDay(dayId || 'mon');
  };

  const handleCopyWeek = () => {
    if (!currentAthlete?.id) return;
    const nextWeekKey = shiftWeekKey(selectedWeek, 1);
    copyAthleteWeekPlan(currentAthlete.id, selectedWeek, nextWeekKey);
  };

  const weekDays = getWeekDays(selectedWeek);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Athlete Selector Header */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-pink)' }}>
            SELECCIONA EL ALUMNO A PROGRAMAR:
          </span>

          <button
            onClick={() => setShowInviteModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--brand-lilac-light)',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Plus size={13} />
            <span>Añadir Alumno</span>
          </button>
        </div>

        {/* Athlete Selection Chips */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          paddingBottom: '2px'
        }}>
          {athletes.map(a => {
            const isSelected = a.id === currentAthlete?.id;

            return (
              <button
                key={a.id}
                onClick={() => setManagingAthleteId(a.id)}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: isSelected ? 'var(--brand-gradient)' : 'var(--bg-surface)',
                  border: isSelected ? '1px solid transparent' : '1px solid var(--border-subtle)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: '700',
                  boxShadow: isSelected ? 'var(--brand-gradient-glow)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--brand-gradient)',
                  fontSize: '9px',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  {a.avatar}
                </div>
                <span>{a.name}</span>
              </button>
            );
          })}
        </div>

        {currentAthlete && (
          <div style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            paddingTop: '4px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Objetivo: <strong style={{ color: 'var(--brand-lilac-light)' }}>{currentAthlete.focus}</strong></span>
            <button
              onClick={() => handlePreviewAsAthlete('mon')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: 'var(--brand-pink)',
                fontWeight: '700'
              }}
            >
              <Eye size={12} />
              <span>Ver como {currentAthlete.name.split(' ')[0]}</span>
            </button>
          </div>
        )}
      </div>

      {/* Selector de Semana en el Calendario */}
      <WeekNavigator
        selectedWeek={selectedWeek}
        onSelectWeek={setSelectedWeek}
        showCopyButton={true}
        onCopyWeekToNext={handleCopyWeek}
      />

      {/* Weekly Plan Matrix for the Selected Athlete */}
      {!currentAthlete ? (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '28px 16px',
          textAlign: 'center',
          border: '1px dashed var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Aún no tienes alumnos registrados en el Box.
          </span>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary"
            style={{ fontSize: '12px', padding: '8px 16px' }}
          >
            <Plus size={14} />
            <span>Dar de alta al primer alumno</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>
              Plan de {currentAthlete.name} para esta semana
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Semana: {selectedWeek}
            </span>
          </div>

          {weekDays.map(day => {
            const assignedId = currentPlan[day.id];
            const assignedWorkout = workouts.find(w => w.id === assignedId);

            return (
              <div
                key={day.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
              {/* Day Label con Fecha Real */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '110px' }}>
                <Calendar size={14} color="var(--brand-lilac-light)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#ffffff' }}>
                    {day.fullLabel}
                  </span>
                  <span style={{ fontSize: '10px', color: day.isToday ? 'var(--brand-pink)' : 'var(--text-muted)', fontWeight: day.isToday ? '800' : '500' }}>
                    {day.dateStr} {day.isToday ? '• Hoy' : ''}
                  </span>
                </div>
              </div>

              {/* Routine Dropdown for this day */}
              <select
                value={assignedId || ''}
                onChange={(e) => assignWorkoutToAthleteDay(currentAthlete.id, day.id, e.target.value || null, selectedWeek)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: assignedId ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: assignedId ? '700' : '500',
                  outline: 'none',
                  maxWidth: '220px'
                }}
              >
                <option value="">(Descanso / Sin rutina)</option>
                {workouts.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.title} ({w.duration})
                  </option>
                ))}
              </select>

              {/* View / Action */}
              {assignedWorkout && (
                <button
                  onClick={() => onNavigateToRoutine(assignedWorkout)}
                  title="Ver rutina"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'rgba(255, 45, 120, 0.1)',
                    border: '1px solid rgba(255, 45, 120, 0.2)',
                    color: 'var(--brand-pink)',
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    )}

      {/* Modal Seguro de Alta con Entrega de Credenciales */}
      <InviteAthleteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
}
