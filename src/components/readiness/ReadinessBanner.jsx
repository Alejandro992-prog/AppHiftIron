import React from 'react';
import { Activity, Sparkles, AlertTriangle, CheckCircle2, ChevronRight, Moon, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';

export default function ReadinessBanner({ onOpenCheckin }) {
  const { currentUser } = useAuth();
  const { getTodayReadiness, isDeloadMode } = useWorkouts();

  const todayEntry = getTodayReadiness(currentUser?.id);

  if (!todayEntry) {
    // Has not completed check-in today: invite them
    return (
      <div 
        onClick={onOpenCheckin}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.12) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: '1.5px solid rgba(255, 45, 120, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 16px rgba(255, 45, 120, 0.08)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-pink)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 45, 120, 0.35)'}
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
                🔒 SUEÑO & READINESS • PRIVADO COACH
              </span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-pink)' }} />
            </div>
            <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff', margin: '2px 0 0 0' }}>
              ¿Cómo has descansado hoy para entrenar?
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
              Respuestas confidenciales que solo ve tu coach para cuidar tus cargas
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

  // Has completed check-in today: show status
  const isFatigue = todayEntry.level === 'fatigue';
  const isModerate = todayEntry.level === 'moderate';
  const statusColor = isFatigue ? '#ef4444' : isModerate ? '#eab308' : '#22c55e';

  return (
    <div 
      onClick={onOpenCheckin}
      style={{
        background: isFatigue 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(20, 20, 32, 0.8) 100%)' 
          : 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(20, 20, 32, 0.8) 100%)',
        border: `1.5px solid ${statusColor}55`,
        borderRadius: 'var(--radius-lg)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        boxShadow: `0 4px 16px ${statusColor}15`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: `${statusColor}22`,
          border: `1.5px solid ${statusColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: statusColor,
          flexShrink: 0
        }}>
          {isFatigue ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '800', color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              READINESS HOY: {todayEntry.score}% • {isFatigue ? 'ALERTA FATIGA' : isModerate ? 'MODERADO' : 'ÓPTIMO'}
            </span>
            {todayEntry.deloadMode && (
              <span style={{
                fontSize: '9.5px',
                fontWeight: '800',
                background: '#ef4444',
                color: '#ffffff',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)'
              }}>
                DESCARGA ACTIVA (-15%)
              </span>
            )}
          </div>
          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', margin: '2px 0 0 0' }}>
            {isFatigue 
              ? 'Fatiga alta detectada: ajusta los kilos de hoy'
              : isModerate
              ? 'Nivel de energía estable: entrena a buen ritmo'
              : '¡Cuerpo al 100%! Día para buscar récords y RX'}
          </h4>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Pulsa para revisar o ajustar
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
        <span>Editar</span>
        <ChevronRight size={14} />
      </div>
    </div>
  );
}
