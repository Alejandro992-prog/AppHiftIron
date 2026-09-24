import React from 'react';
import { Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useWorkouts } from '../../context/WorkoutContext';
import { DAYS_OF_WEEK } from '../../data/initialWorkouts';

export default function RoutineCard({ workout, onSelect }) {
  const { completedExercises } = useWorkouts();

  // Progress count
  let totalExercises = 0;
  let doneCount = 0;
  workout.sections?.forEach((sec, sIdx) => {
    sec.exercises?.forEach((_, eIdx) => {
      totalExercises++;
      if (completedExercises[`${workout.id}_${sIdx}_${eIdx}`]) doneCount++;
    });
  });

  const isAllDone = totalExercises > 0 && doneCount === totalExercises;
  const assignedDay = DAYS_OF_WEEK.find(d => d.id === workout.dayId)?.fullLabel;

  return (
    <div 
      onClick={() => onSelect(workout)}
      className="card-dark card-interactive animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderLeft: '3px solid var(--brand-pink)',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '10px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--brand-pink)'
          }}>
            {workout.type || 'GIMNASIO'}
          </span>

          {assignedDay && (
            <span style={{ fontSize: '10.5px', color: 'var(--brand-lilac-light)', fontWeight: '700' }}>
              • {assignedDay}
            </span>
          )}

          {isAllDone && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--color-success)', fontWeight: '700' }}>
              <CheckCircle2 size={11} /> Hecho
            </span>
          )}
        </div>

        <h3 style={{
          fontSize: '15px',
          fontWeight: '800',
          color: '#ffffff',
          lineHeight: 1.3
        }}>
          {workout.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', marginTop: '2px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={11} /> {workout.duration}
          </span>
          <span>•</span>
          <span>{workout.sections?.length || 0} grupos de ejercicios</span>
        </div>
      </div>

      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--brand-pink)',
        flexShrink: 0
      }}>
        <ChevronRight size={16} />
      </div>
    </div>
  );
}
