import React, { useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  RotateCcw, 
  Copy, 
  Sparkles 
} from 'lucide-react';
import { 
  formatWeekRange, 
  shiftWeekKey, 
  isCurrentWeek, 
  getWeekKey 
} from '../../utils/weekManager';

export default function WeekNavigator({
  selectedWeek,
  onSelectWeek,
  onCopyWeekToNext = null,
  showCopyButton = false,
  compact = false
}) {
  const dateInputRef = useRef(null);
  const isCurrent = isCurrentWeek(selectedWeek);

  // Calcular la diferencia de semanas respecto a la actual
  const currentWeekKey = getWeekKey(new Date());
  const diffWeeks = Math.round(
    (new Date(selectedWeek).getTime() - new Date(currentWeekKey).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  const handlePrev = () => {
    onSelectWeek(shiftWeekKey(selectedWeek, -1));
  };

  const handleNext = () => {
    onSelectWeek(shiftWeekKey(selectedWeek, 1));
  };

  const handleResetToCurrent = () => {
    onSelectWeek(currentWeekKey);
  };

  const handleDateChange = (e) => {
    if (e.target.value) {
      onSelectWeek(getWeekKey(new Date(e.target.value)));
    }
  };

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: compact ? '8px 12px' : '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {/* Top Row: Navigation Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        {/* Prev Week Button */}
        <button
          onClick={handlePrev}
          title="Semana anterior"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Center: Week Info & Date Picker Trigger */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          cursor: 'pointer'
        }}
        onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click()}
        title="Haz clic para elegir cualquier fecha en el calendario"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarIcon size={14} style={{ color: 'var(--brand-pink)' }} />
            <span style={{
              fontSize: '13px',
              fontWeight: '800',
              color: '#ffffff',
              letterSpacing: '0.02em'
            }}>
              {formatWeekRange(selectedWeek)}
            </span>
          </div>

          {/* Hidden HTML5 date picker input for fast date selection */}
          <input
            ref={dateInputRef}
            type="date"
            onChange={handleDateChange}
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              width: '1px',
              height: '1px'
            }}
          />

          {/* Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isCurrent ? (
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                textTransform: 'uppercase',
                background: 'rgba(16, 185, 129, 0.18)',
                color: '#10b981',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                • Semana Actual
              </span>
            ) : diffWeeks > 0 ? (
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                textTransform: 'uppercase',
                background: 'rgba(56, 189, 248, 0.18)',
                color: '#38bdf8',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                Planificado (+{diffWeeks} sem)
              </span>
            ) : (
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                textTransform: 'uppercase',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-muted)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                Semana Pasada ({diffWeeks} sem)
              </span>
            )}

            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              (Elegir fecha ▾)
            </span>
          </div>
        </div>

        {/* Next Week Button */}
        <button
          onClick={handleNext}
          title="Semana siguiente"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Bottom Action Bar (Volver a hoy / Copiar semana) */}
      {(!isCurrent || showCopyButton) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {!isCurrent ? (
            <button
              onClick={handleResetToCurrent}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--brand-pink)',
                background: 'rgba(255, 45, 120, 0.1)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(255, 45, 120, 0.25)',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={12} />
              <span>Volver a Esta Semana</span>
            </button>
          ) : <div />}

          {showCopyButton && onCopyWeekToNext && (
            <button
              onClick={onCopyWeekToNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--brand-lilac-light)',
                background: 'rgba(168, 85, 247, 0.12)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                cursor: 'pointer'
              }}
              title="Copiar las rutinas de esta semana a la próxima semana"
            >
              <Copy size={12} />
              <span>Duplicar a Próxima Semana</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
