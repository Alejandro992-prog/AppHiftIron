import React from 'react';
import { 
  Flame, 
  Dumbbell, 
  ArrowRight, 
  Lock, 
  CheckCircle, 
  Zap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';

export default function ZoneSelectorDashboard() {
  const { currentUser, canAccessZone, isAdmin } = useAuth();
  const { setActiveZone } = useWorkouts();

  const hasCompetitorsAccess = canAccessZone('competitors');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '6px 0' }}>
      {/* Friendly Greeting Header */}
      <div style={{
        textAlign: 'center',
        padding: '10px 0 6px 0'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          marginBottom: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <Sparkles size={13} color="var(--brand-pink)" />
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            ¡Hola, {currentUser?.name?.split(' ')[0]}!
          </span>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
          ¿Qué vas a entrenar hoy?
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Elige tu modalidad para acceder a tu sesión, calendario y rutinas:
        </p>
      </div>

      {/* 2 Main Big Buttons / Selection Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* OPTION 1: COMPETIDOR */}
        <div 
          onClick={() => setActiveZone('competitors')}
          style={{
            background: 'var(--bg-secondary)',
            border: hasCompetitorsAccess 
              ? '2px solid rgba(255, 45, 120, 0.4)' 
              : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: hasCompetitorsAccess ? '0 10px 28px rgba(255, 45, 120, 0.12)' : 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'var(--brand-pink)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = hasCompetitorsAccess ? 'rgba(255, 45, 120, 0.4)' : 'var(--border-subtle)';
          }}
        >
          {/* Subtle Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 45, 120, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.3) 0%, rgba(255, 45, 120, 0.1) 100%)',
                border: '1.5px solid rgba(255, 45, 120, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-pink)',
                boxShadow: '0 4px 14px rgba(255, 45, 120, 0.25)'
              }}>
                <Flame size={28} />
              </div>

              <div>
                <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--brand-pink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CrossFit & Alto Rendimiento
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', margin: '2px 0 0 0' }}>
                  COMPETIDOR
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Halterofilia, Gimnásticos y WODs programados
                </p>
              </div>
            </div>

            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-pink)'
            }}>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>

        {/* OPTION 2: GIMNASIO */}
        <div 
          onClick={() => setActiveZone('traditional')}
          style={{
            background: 'var(--bg-secondary)',
            border: '2px solid rgba(168, 85, 247, 0.4)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 28px rgba(168, 85, 247, 0.12)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'var(--brand-lilac-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
          }}
        >
          {/* Subtle Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)',
                border: '1.5px solid rgba(168, 85, 247, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-lilac-light)',
                boxShadow: '0 4px 14px rgba(168, 85, 247, 0.25)'
              }}>
                <Dumbbell size={28} />
              </div>

              <div>
                <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--brand-lilac-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Fitness, Fuerza & Salud
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', margin: '2px 0 0 0' }}>
                  GIMNASIO
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Catálogo por músculos y plan personalizado
                </p>
              </div>
            </div>

            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-lilac-light)'
            }}>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
