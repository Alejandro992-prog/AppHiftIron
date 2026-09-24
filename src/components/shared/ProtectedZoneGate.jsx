import React from 'react';
import { ShieldAlert, ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';

export default function ProtectedZoneGate({
  requiredZone = 'competitors',
  onReturnToDashboard
}) {
  const { currentUser } = useAuth();
  const { setActiveZone } = useWorkouts();

  const isCompetitorRequired = requiredZone === 'competitors';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 18px',
      textAlign: 'center',
      minHeight: '65vh'
    }}>
      <div style={{
        maxWidth: '380px',
        width: '100%',
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(255, 45, 120, 0.3)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 12px 32px rgba(255, 45, 120, 0.08)'
      }}>
        {/* Shield Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
          border: '1px solid rgba(255, 45, 120, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--brand-pink)'
        }}>
          <ShieldAlert size={28} />
        </div>

        <div>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--brand-pink)',
            background: 'rgba(255, 45, 120, 0.1)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)'
          }}>
            Acceso Restringido
          </span>

          <h2 style={{
            fontSize: '18px',
            fontWeight: '900',
            color: '#ffffff',
            marginTop: '8px',
            lineHeight: 1.3
          }}>
            {isCompetitorRequired 
              ? 'Zona Exclusiva de Atletas Competidores' 
              : 'Zona con Acceso Limitado'}
          </h2>

          <p style={{
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            marginTop: '6px',
            lineHeight: 1.45
          }}>
            Tu cuenta actual (<strong>{currentUser?.membership || 'Membresía General'}</strong>) no incluye la programación avanzada de CrossFit para Atletas.
          </p>
        </div>

        {/* Benefits List */}
        <div style={{
          width: '100%',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase' }}>
            ¿Qué incluye el Pase Competidor?
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={14} color="var(--brand-pink)" />
            <span>Halterofilia olímpica con porcentajes de 1RM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={14} color="var(--brand-pink)" />
            <span>Gimnásticos de alta demanda (BMU, HSPU, RMU)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={14} color="var(--brand-pink)" />
            <span>Metcons de alta intensidad & tracking de PRs</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={() => setActiveZone('traditional')}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '11px',
              fontSize: '12.5px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Zap size={15} />
            <span>Ir a Gimnasio Tradicional (Disponible)</span>
          </button>

          <button
            onClick={onReturnToDashboard || (() => setActiveZone('dashboard'))}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={14} />
            <span>Volver al Dashboard Selector</span>
          </button>
        </div>
      </div>
    </div>
  );
}
