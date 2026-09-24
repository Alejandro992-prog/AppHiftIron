import React from 'react';
import { 
  Flame, 
  Dumbbell, 
  ArrowRight, 
  Lock, 
  CheckCircle, 
  Calendar, 
  Award, 
  Activity, 
  ShieldCheck, 
  Zap,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';

export default function ZoneSelectorDashboard() {
  const { currentUser, canAccessZone, isAdmin } = useAuth();
  const { 
    setActiveZone, 
    competitorWorkouts, 
    traditionalWorkouts, 
    performanceLogs,
    selectedDay 
  } = useWorkouts();

  const hasCompetitorsAccess = canAccessZone('competitors');
  const hasTraditionalAccess = canAccessZone('traditional');

  // Competitor workout preview for today
  const competitorToday = competitorWorkouts.find(w => w.dayId === selectedDay) || competitorWorkouts[0];
  const traditionalCount = traditionalWorkouts.length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '18px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: isAdmin ? 'var(--brand-gradient)' : 'linear-gradient(135deg, #a855f7, #ff2d78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: '900',
            fontSize: '16px',
            boxShadow: '0 4px 14px rgba(255, 45, 120, 0.3)'
          }}>
            {isAdmin ? <ShieldCheck size={24} /> : (currentUser?.avatar || 'A')}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                {isAdmin ? 'Panel de Control' : 'Bienvenido/a'}
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                background: isAdmin ? 'rgba(255, 45, 120, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                color: isAdmin ? 'var(--brand-pink)' : 'var(--brand-lilac-light)'
              }}>
                {currentUser?.membership || 'Atleta'}
              </span>
            </div>

            <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', margin: '2px 0 0 0' }}>
              {currentUser?.name}
            </h1>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          textAlign: 'right'
        }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Selecciona tu zona</span>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--brand-lilac-light)' }}>
            2 Módulos
          </span>
        </div>
      </div>

      {/* Main Choice Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* CARD 1: ZONA DE COMPETIDORES */}
        <div 
          onClick={() => setActiveZone('competitors')}
          style={{
            background: 'var(--bg-secondary)',
            border: hasCompetitorsAccess 
              ? '1.5px solid rgba(255, 45, 120, 0.35)' 
              : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '20px 18px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: hasCompetitorsAccess ? '0 8px 24px rgba(255, 45, 120, 0.08)' : 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'var(--brand-pink)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = hasCompetitorsAccess ? 'rgba(255, 45, 120, 0.35)' : 'var(--border-subtle)';
          }}
        >
          {/* Subtle Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 45, 120, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.25) 0%, rgba(255, 45, 120, 0.1) 100%)',
                border: '1px solid rgba(255, 45, 120, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-pink)'
              }}>
                <Flame size={22} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--brand-pink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    CrossFit Box & WODs
                  </span>
                </div>
                <h2 style={{ fontSize: '17px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em' }}>
                  Zona de Competidores
                </h2>
              </div>
            </div>

            {/* Access Badge */}
            {hasCompetitorsAccess ? (
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#22c55e',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <span>Habilitado</span>
              </span>
            ) : (
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Lock size={11} />
                <span>Plan Atleta</span>
              </span>
            )}
          </div>

          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '14px' }}>
            Programación de alto rendimiento enviada por el coach. Diseñada para atletas de CrossFit con sesiones estructuradas en bloques técnicos.
          </p>

          {/* Features Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Calendar size={12} color="var(--brand-pink)" />
              <span>Calendario de Sesiones</span>
            </span>

            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Activity size={12} color="var(--brand-pink)" />
              <span>Halterofilia & Metcons</span>
            </span>

            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Award size={12} color="var(--brand-pink)" />
              <span>Tracking de PRs & Marcas</span>
            </span>
          </div>

          {/* Bottom Action Line */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Sesión de hoy: <strong style={{ color: '#ffffff' }}>{competitorToday?.title || 'Programada'}</strong>
            </span>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12.5px',
              fontWeight: '800',
              color: 'var(--brand-pink)'
            }}>
              <span>{hasCompetitorsAccess ? 'Entrar a la Zona' : 'Ver Requisitos'}</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>

        {/* CARD 2: ZONA DE GIMNASIO TRADICIONAL */}
        <div 
          onClick={() => setActiveZone('traditional')}
          style={{
            background: 'var(--bg-secondary)',
            border: hasTraditionalAccess 
              ? '1.5px solid rgba(168, 85, 247, 0.35)' 
              : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '20px 18px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: hasTraditionalAccess ? '0 8px 24px rgba(168, 85, 247, 0.08)' : 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'var(--brand-lilac-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = hasTraditionalAccess ? 'rgba(168, 85, 247, 0.35)' : 'var(--border-subtle)';
          }}
        >
          {/* Subtle Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0.1) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-lilac-light)'
              }}>
                <Dumbbell size={22} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--brand-lilac-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Fitness & Hipertrofia
                  </span>
                </div>
                <h2 style={{ fontSize: '17px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em' }}>
                  Gimnasio Tradicional
                </h2>
              </div>
            </div>

            {/* Access Badge */}
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#22c55e',
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle size={12} color="#22c55e" />
              <span>Acceso Libre</span>
            </span>
          </div>

          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '14px' }}>
            Rutinas orientadas a hipertrofia, tonificación y salud. Catálogo completo por grupos musculares y acceso exclusivo a tu plan personalizado.
          </p>

          {/* Features Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Dumbbell size={12} color="var(--brand-lilac-light)" />
              <span>Catálogo Muscular</span>
            </span>

            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Zap size={12} color="var(--brand-lilac-light)" />
              <span>Plan Personalizado Asignado</span>
            </span>

            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <TrendingUp size={12} color="var(--brand-lilac-light)" />
              <span>Registro de Cargas y Series</span>
            </span>
          </div>

          {/* Bottom Action Line */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Catálogo: <strong style={{ color: '#ffffff' }}>{traditionalCount} rutinas disponibles</strong>
            </span>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12.5px',
              fontWeight: '800',
              color: 'var(--brand-lilac-light)'
            }}>
              <span>Entrar a la Zona</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Performance Quick View */}
      {performanceLogs.length > 0 && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Última Marca Registrada
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {performanceLogs[0].date}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>
                {performanceLogs[0].exerciseName}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {performanceLogs[0].notes || 'Completado con éxito'}
              </span>
            </div>

            <div style={{
              fontSize: '13px',
              fontWeight: '900',
              color: performanceLogs[0].zone === 'competitors' ? 'var(--brand-pink)' : 'var(--brand-lilac-light)',
              background: performanceLogs[0].zone === 'competitors' ? 'rgba(255, 45, 120, 0.12)' : 'rgba(168, 85, 247, 0.12)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)'
            }}>
              {performanceLogs[0].value}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
