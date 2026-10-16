import React from 'react';
import { 
  Lock, 
  Activity, 
  ArrowLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

export default function CompetitorReadinessGate({ 
  onOpenTest, 
  onReturnToDashboard,
  isCoachOrAdmin = false,
  onCoachBypass
}) {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Clean Back Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onReturnToDashboard}
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
            padding: '4px 0'
          }}
        >
          <ArrowLeft size={14} />
          <span>Volver al inicio</span>
        </button>

        <span style={{
          fontSize: '10.5px',
          fontWeight: '800',
          color: 'var(--brand-pink)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Lock size={12} />
          <span>Zona Competidor</span>
        </span>
      </div>

      {/* Simplified Clean Gate Card */}
      <div style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(255, 45, 120, 0.12) 0%, rgba(18, 18, 26, 0.95) 85%)',
        border: '1px solid rgba(255, 45, 120, 0.35)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '16px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
          border: '1px solid rgba(255, 45, 120, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--brand-pink)'
        }}>
          <Lock size={24} />
        </div>

        <div>
          <h2 style={{
            fontSize: '19px',
            fontWeight: '900',
            color: '#ffffff',
            lineHeight: 1.25,
            margin: '0 0 6px 0'
          }}>
            Test de Recuperación Requerido
          </h2>

          <p style={{
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            margin: 0,
            maxWidth: '360px'
          }}>
            Para acceder al entrenamiento de hoy, responde a las preguntas rápidas de sueño y fatiga (menos de 30 seg). 
            Tu sesión se adaptará automáticamente a tu estado físico.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenTest}
          className="btn-primary"
          style={{
            width: '100%',
            maxWidth: '340px',
            padding: '13px',
            fontSize: '13.5px',
            fontWeight: '900',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 6px 20px rgba(255, 45, 120, 0.35)',
            cursor: 'pointer'
          }}
        >
          <Activity size={16} />
          <span>Realizar Test de Fatiga (30 seg)</span>
          <ChevronRight size={16} />
        </button>

        {/* Coach Preview Bypass Option */}
        {isCoachOrAdmin && (
          <button
            onClick={onCoachBypass}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            <Eye size={12} />
            <span>Modo Coach: Ver programación sin completar test</span>
          </button>
        )}
      </div>
    </div>
  );
}
