import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';
import { RECOVERY_STATES } from '../../utils/recoveryScore';

export default function ReadinessBanner({ onOpenCheckin }) {
  const { currentUser } = useAuth();
  const { getTodayReadiness } = useWorkouts();

  const todayEntry = getTodayReadiness(currentUser?.id);

  const [isHovered, setIsHovered] = useState(false);

  if (!todayEntry) {
    // Has not completed check-in today: invite them
    return (
      <div 
        onClick={onOpenCheckin}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.12) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: `1.5px solid ${isHovered ? 'var(--brand-pink)' : 'rgba(255, 45, 120, 0.35)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isHovered ? '0 4px 20px rgba(255, 45, 120, 0.16)' : '0 4px 16px rgba(255, 45, 120, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'var(--brand-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
            boxShadow: '0 2px 10px rgba(255, 45, 120, 0.3)'
          }}>
            <Activity size={18} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--brand-pink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                IRON PROGRAM • EVALUACIÓN DIARIA
              </span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-pink)' }} />
            </div>
            <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff', margin: '2px 0 0 0' }}>
              ¿Cómo estás hoy? Haz tu test de recuperación
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
              Menos de 30 seg para calcular tu Recovery Score y recibir la pauta de hoy
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--brand-pink)',
          fontSize: '11.5px',
          fontWeight: '800',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(255, 45, 120, 0.15)',
          border: '1px solid rgba(255, 45, 120, 0.3)'
        }}>
          <span>Comenzar</span>
          <ChevronRight size={14} />
        </div>
      </div>
    );
  }

  // Has completed check-in today: Map to Iron Program official state
  let stateKey = todayEntry.finalState;
  if (!stateKey) {
    if (todayEntry.level === 'fatigue') stateKey = 'low';
    else if (todayEntry.level === 'moderate') stateKey = 'adequate';
    else stateKey = 'optimal';
  }

  const stateData = RECOVERY_STATES[stateKey] || RECOVERY_STATES.adequate;
  const statusColor = stateData.color;

  const scoreFormatted = todayEntry.scoreDisplay || 
    (typeof todayEntry.score === 'number' 
      ? (todayEntry.score > 10 ? (todayEntry.score / 10).toFixed(1) : todayEntry.score.toFixed(1)).replace('.', ',')
      : '7,5');

  const headline = todayEntry.headline || stateData.headline;

  return (
    <div 
      onClick={onOpenCheckin}
      style={{
        background: `linear-gradient(135deg, ${statusColor}18 0%, rgba(20, 20, 32, 0.85) 100%)`,
        border: `1.5px solid ${statusColor}66`,
        borderRadius: 'var(--radius-lg)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        boxShadow: `0 4px 16px ${statusColor}18`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: `${statusColor}22`,
          border: `1.5px solid ${statusColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: statusColor,
          flexShrink: 0
        }}>
          {stateKey === 'low' || stateKey === 'limited' ? (
            <AlertTriangle size={20} />
          ) : (
            <CheckCircle2 size={20} />
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '900', color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stateData.iconEmoji} {stateData.name} • {scoreFormatted} / 10
            </span>

            {todayEntry.downgraded && (
              <span style={{
                fontSize: '9px',
                fontWeight: '800',
                background: 'rgba(249, 115, 22, 0.2)',
                color: '#f97316',
                border: '1px solid #f97316',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)'
              }}>
                Regla Iron: Estadio Ajustado
              </span>
            )}

            {todayEntry.hasPain && (
              <span style={{
                fontSize: '9px',
                fontWeight: '800',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                border: '1px solid #ef4444',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)'
              }}>
                ⚠️ Molestia activa
              </span>
            )}

            {todayEntry.deloadMode && (
              <span style={{
                fontSize: '9px',
                fontWeight: '800',
                background: '#ef4444',
                color: '#ffffff',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)'
              }}>
                DESCARGA (-15%)
              </span>
            )}
          </div>

          <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff', margin: '2px 0 0 0' }}>
            {headline}
          </h4>

          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Pulsa para revisar pauta o editar valores
          </span>
        </div>
      </div>

      <div style={{
        fontSize: '11px',
        fontWeight: '800',
        color: statusColor,
        display: 'flex',
        alignItems: 'center',
        gap: '2px'
      }}>
        <span>Ver / Editar</span>
        <ChevronRight size={14} />
      </div>
    </div>
  );
}
