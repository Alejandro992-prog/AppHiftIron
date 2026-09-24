import React from 'react';
import { User, Shield, Award, Calendar, LogOut, Lock, ChevronRight, Dumbbell, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';

export default function ProfileView({ onOpenAuth }) {
  const { currentUser, logout } = useAuth();
  const { prs, workouts } = useWorkouts();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Profile Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-secondary) 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--brand-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: '900',
          color: '#ffffff',
          boxShadow: 'var(--brand-gradient-glow)',
          flexShrink: 0
        }}>
          {currentUser?.avatar || 'CM'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
            {currentUser?.name || 'Carlos Mendoza'}
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--brand-pink)', fontWeight: '700' }}>
            {currentUser?.membership || 'Membresía Atleta HIFT'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Miembro desde: {currentUser?.since || '2024'}
          </span>
        </div>
      </div>

      {/* Activity Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 8px',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center'
        }}>
          <Flame size={18} color="var(--brand-pink)" style={{ margin: '0 auto 4px auto' }} />
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            18
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>
            WODs este mes
          </span>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 8px',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center'
        }}>
          <Award size={18} color="var(--brand-lilac-light)" style={{ margin: '0 auto 4px auto' }} />
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            {prs.length}
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>
            PRs Guardados
          </span>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 8px',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center'
        }}>
          <Calendar size={18} color="var(--color-info)" style={{ margin: '0 auto 4px auto' }} />
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            4 días
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>
            Racha actual
          </span>
        </div>
      </div>

      {/* Coach/Staff Access Banner */}
      <div 
        onClick={onOpenAuth}
        className="card-dark card-interactive"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          border: '1px solid rgba(255, 45, 120, 0.3)',
          background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--bg-surface)',
            border: '1px solid rgba(255, 45, 120, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-pink)'
          }}>
            <Lock size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
              ¿Eres Coach o Administrador del Box?
            </h4>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Accede al panel para importar rutinas desde Word (.docx).
            </p>
          </div>
        </div>

        <ChevronRight size={16} color="var(--brand-pink)" />
      </div>

      {/* Logout button */}
      <button
        onClick={onOpenAuth}
        className="btn-secondary"
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginTop: '8px'
        }}
      >
        <LogOut size={16} />
        <span>Cambiar de Usuario / Salir</span>
      </button>
    </div>
  );
}
