import React from 'react';
import { Flame, Dumbbell } from 'lucide-react';
import { getWeekDays } from '../../utils/weekManager';
import WeekNavigator from './WeekNavigator';

export default function BaseCalendar({
  selectedDay,
  onSelectDay,
  selectedWeek,
  onSelectWeek,
  zone = 'traditional',
  workoutMap = {}, // Map of dayId -> workout object or title
  title = 'Semana de Entrenamiento',
  showWeekNavigator = true,
  onCopyWeekToNext = null,
  showCopyButton = false
}) {
  const isCompetitor = zone === 'competitors';

  // Obtener los días de la semana seleccionada con fechas reales (ej. 28 Sep)
  const weekDays = selectedWeek ? getWeekDays(selectedWeek) : [
    { id: 'mon', label: 'Lun', fullLabel: 'Lunes', dayNumber: null },
    { id: 'tue', label: 'Mar', fullLabel: 'Martes', dayNumber: null },
    { id: 'wed', label: 'Mié', fullLabel: 'Miércoles', dayNumber: null },
    { id: 'thu', label: 'Jue', fullLabel: 'Jueves', dayNumber: null },
    { id: 'fri', label: 'Vie', fullLabel: 'Viernes', dayNumber: null },
    { id: 'sat', label: 'Sáb', fullLabel: 'Sábado', dayNumber: null },
    { id: 'sun', label: 'Dom', fullLabel: 'Domingo', dayNumber: null }
  ];

  const currentSelectedDayObj = weekDays.find(d => d.id === selectedDay);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Navegador de Semanas (si selectedWeek y onSelectWeek están presentes) */}
      {showWeekNavigator && selectedWeek && onSelectWeek && (
        <WeekNavigator 
          selectedWeek={selectedWeek} 
          onSelectWeek={onSelectWeek}
          onCopyWeekToNext={onCopyWeekToNext}
          showCopyButton={showCopyButton}
        />
      )}

      {/* Tira de Días de la Semana */}
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
            {currentSelectedDayObj?.fullLabel} {currentSelectedDayObj?.dateStr ? `(${currentSelectedDayObj.dateStr})` : ''}
          </span>
        </div>

        {/* Days Strip con número de día del calendario */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px'
        }}>
          {weekDays.map((day) => {
            const isSelected = selectedDay === day.id;
            const hasWorkout = !!workoutMap[day.id];
            const isToday = !!day.isToday;

            return (
              <button
                key={day.id}
                onClick={() => onSelectDay(day.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 2px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected 
                    ? (isCompetitor ? '1.5px solid var(--brand-pink)' : '1.5px solid var(--brand-lilac-light)')
                    : isToday
                      ? '1px dashed var(--brand-pink)'
                      : '1px solid var(--border-subtle)',
                  background: isSelected 
                    ? (isCompetitor 
                        ? 'linear-gradient(180deg, rgba(255, 45, 120, 0.25) 0%, rgba(255, 45, 120, 0.08) 100%)' 
                        : 'linear-gradient(180deg, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0.08) 100%)')
                    : 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  position: 'relative'
                }}
              >
                {/* Nombre corto del día */}
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: isSelected ? '900' : '600',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)'
                }}>
                  {day.label}
                </span>

                {/* Número del día del mes */}
                {day.dayNumber && (
                  <span style={{
                    fontSize: '13px',
                    fontWeight: isSelected || isToday ? '900' : '700',
                    color: isSelected 
                      ? '#ffffff' 
                      : isToday 
                        ? 'var(--brand-pink)' 
                        : 'var(--text-primary)',
                    marginTop: '2px',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {day.dayNumber}
                  </span>
                )}

                {/* Workout indicator dot */}
                <div style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  marginTop: '4px',
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
    </div>
  );
}
