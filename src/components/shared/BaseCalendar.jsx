import React from 'react';
import { DAYS_OF_WEEK } from '../../data/initialWorkouts';
import { Flame, Dumbbell } from 'lucide-react';

export default function BaseCalendar({
  selectedDay,
  onSelectDay,
  zone = 'traditional',
  workoutMap = {}, // Map of dayId -> workout object or title
  title = 'Semana de Entrenamiento'
}) {
  const isCompetitor = zone === 'competitors';

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isCompetitor ? (
            <Flame size={15} color="var(--brand-pink)" />
          ) : (
            <Dumbbell size={15} color="var(--brand-lilac-light)" />
          )}
          <span style={{
            fontSize: '12px',
            fontWeight: '800',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#ffffff'
          }}>
            {title}
          </span>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          color: isCompetitor ? 'var(--brand-pink)' : 'var(--brand-lilac-light)',
          background: isCompetitor ? 'rgba(255, 45, 120, 0.12)' : 'rgba(168, 85, 247, 0.12)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)'
        }}>
          {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.fullLabel || 'Hoy'}
        </span>
      </div>

      {/* Days Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '6px'
      }}>
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day.id;
          const hasWorkout = !!workoutMap[day.id];

          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px 2px',
                borderRadius: 'var(--radius-sm)',
                border: isSelected 
                  ? (isCompetitor ? '1.5px solid var(--brand-pink)' : '1.5px solid var(--brand-lilac-light)')
                  : '1px solid var(--border-subtle)',
                background: isSelected 
                  ? (isCompetitor 
                      ? 'linear-gradient(180deg, rgba(255, 45, 120, 0.22) 0%, rgba(255, 45, 120, 0.08) 100%)' 
                      : 'linear-gradient(180deg, rgba(168, 85, 247, 0.22) 0%, rgba(168, 85, 247, 0.08) 100%)')
                  : 'var(--bg-surface)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
            >
              <span style={{
                fontSize: '11px',
                fontWeight: isSelected ? '900' : '600',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)'
              }}>
                {day.label}
              </span>

              {/* Workout indicator dot */}
              <div style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                marginTop: '5px',
                background: hasWorkout
                  ? (isCompetitor ? 'var(--brand-pink)' : 'var(--brand-lilac-light)')
                  : (isSelected ? 'rgba(255, 255, 255, 0.3)' : 'transparent'),
                boxShadow: hasWorkout && isSelected 
                  ? (isCompetitor ? '0 0 6px var(--brand-pink)' : '0 0 6px var(--brand-lilac-light)') 
                  : 'none'
              }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
