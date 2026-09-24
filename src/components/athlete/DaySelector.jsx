import React from 'react';
import { DAYS_OF_WEEK } from '../../data/initialWorkouts';
import { useWorkouts } from '../../context/WorkoutContext';

export default function DaySelector() {
  const { selectedDay, setSelectedDay, workouts } = useWorkouts();

  // Get today's day ID
  const dayIndex = new Date().getDay();
  const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayId = map[dayIndex] || 'mon';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px'
      }}>
        <span style={{
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-secondary)'
        }}>
          PROGRAMACIÓN SEMANAL
        </span>
        <span style={{
          fontSize: '11px',
          fontWeight: '600',
          color: 'var(--brand-lilac-light)'
        }}>
          {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.fullLabel}
        </span>
      </div>

      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day.id;
          const isToday = todayId === day.id;
          const count = workouts.filter(w => w.dayId === day.id).length;

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              style={{
                flex: '1 0 46px',
                minWidth: '46px',
                padding: '10px 4px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: isSelected 
                  ? 'var(--brand-gradient)' 
                  : 'var(--bg-secondary)',
                border: isSelected 
                  ? '1px solid rgba(255, 255, 255, 0.3)' 
                  : isToday 
                    ? '1px solid rgba(255, 45, 120, 0.4)' 
                    : '1px solid var(--border-subtle)',
                color: isSelected ? '#ffffff' : 'var(--text-primary)',
                boxShadow: isSelected ? 'var(--brand-gradient-glow)' : 'none',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
            >
              {isToday && !isSelected && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'var(--brand-pink)'
                }} />
              )}
              
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                opacity: isSelected ? 1 : 0.7
              }}>
                {day.label}
              </span>

              <span style={{
                fontSize: '14px',
                fontWeight: '800',
                fontFamily: 'var(--font-heading)'
              }}>
                {count > 0 ? `${count}w` : '-'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
