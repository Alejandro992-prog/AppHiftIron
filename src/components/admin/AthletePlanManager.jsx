import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';
import { DAYS_OF_WEEK } from '../../data/initialWorkouts';
import { User, Plus, Calendar, Check, Eye } from 'lucide-react';

export default function AthletePlanManager({ onNavigateToRoutine }) {
  const { athletes, addAthlete, loginAsAthlete } = useAuth();
  const { 
    workouts, 
    athletePlans, 
    assignWorkoutToAthleteDay, 
    managingAthleteId, 
    setManagingAthleteId,
    setViewMode,
    setSelectedDay
  } = useWorkouts();

  const [showAddAthleteModal, setShowAddAthleteModal] = useState(false);
  const [newAthleteName, setNewAthleteName] = useState('');
  const [newAthleteFocus, setNewAthleteFocus] = useState('Musculación General');

  // Currently managed athlete object
  const currentAthlete = athletes.find(a => a.id === managingAthleteId) || athletes[0];
  const currentPlan = athletePlans[currentAthlete?.id] || {};

  const handleAddAthleteSubmit = (e) => {
    e.preventDefault();
    if (!newAthleteName.trim()) return;

    const created = addAthlete(newAthleteName, '', newAthleteFocus);
    setManagingAthleteId(created.id);
    setNewAthleteName('');
    setShowAddAthleteModal(false);
  };

  const handlePreviewAsAthlete = (dayId) => {
    loginAsAthlete(currentAthlete.id);
    setViewMode('coach_plan');
    setSelectedDay(dayId || 'mon');
  };

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
            onClick={() => setShowAddAthleteModal(true)}
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

      {/* Weekly Plan Matrix for the Selected Athlete */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff', padding: '0 4px' }}>
          Programación Semanal de {currentAthlete?.name}
        </span>

        {DAYS_OF_WEEK.map(day => {
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
              {/* Day Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '70px' }}>
                <Calendar size={14} color="var(--brand-lilac-light)" />
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#ffffff' }}>
                  {day.fullLabel}
                </span>
              </div>

              {/* Routine Dropdown for this day */}
              <select
                value={assignedId || ''}
                onChange={(e) => assignWorkoutToAthleteDay(currentAthlete.id, day.id, e.target.value || null)}
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
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface)',
                    color: 'var(--brand-pink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Eye size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Athlete Modal */}
      {showAddAthleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            width: '100%',
            maxWidth: '360px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
              Añadir Nuevo Alumno
            </h3>

            <form onSubmit={handleAddAthleteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  NOMBRE Y APELLIDOS DEL ALUMNO
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sofía Navarro"
                  value={newAthleteName}
                  onChange={(e) => setNewAthleteName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  ENFOQUE / OBJETIVO PRINCIPAL
                </label>
                <input
                  type="text"
                  placeholder="Ej: Hipertrofia de torso, pérdida grasa, fuerza..."
                  value={newAthleteFocus}
                  onChange={(e) => setNewAthleteFocus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddAthleteModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Guardar Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
