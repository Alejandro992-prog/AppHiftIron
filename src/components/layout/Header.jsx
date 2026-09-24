import React from 'react';
import BrandLogo from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';
import { LogOut, Shield } from 'lucide-react';

export default function Header({ onOpenAuth }) {
  const { currentUser, isAdmin, logout } = useAuth();
  const { customLogoUrl } = useWorkouts();

  return (
    <header style={{
      height: '60px',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(13, 13, 20, 0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Brand Logo & Name */}
      <BrandLogo size="sm" customLogoUrl={customLogoUrl} showTagline={false} />

      {/* User Avatar & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px 4px 4px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: isAdmin ? 'var(--brand-gradient)' : 'linear-gradient(135deg, #a855f7, #ff2d78)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '900'
          }}>
            {isAdmin ? <Shield size={13} /> : (currentUser?.avatar || 'A')}
          </div>

          <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.name?.split(' ')[0]}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Cerrar sesión"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
