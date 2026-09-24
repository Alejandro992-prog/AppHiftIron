import React from 'react';
import { Dumbbell, Timer, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav({ activeTab, setActiveTab }) {
  const { isAdmin } = useAuth();

  const tabs = [
    { id: 'workouts', label: 'Rutinas', icon: Dumbbell },
    { id: 'timer', label: 'Cronómetro', icon: Timer },
    ...(isAdmin ? [
      { id: 'admin', label: 'Admin Word', icon: ShieldCheck }
    ] : [])
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '62px',
      background: 'rgba(13, 13, 20, 0.96)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      zIndex: 50,
      maxWidth: 'inherit',
      margin: '0 auto',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)'
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: isActive 
                ? 'linear-gradient(135deg, rgba(255, 45, 120, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)' 
                : 'transparent',
              border: isActive ? '1px solid rgba(255, 45, 120, 0.35)' : '1px solid transparent',
              color: isActive ? '#ffffff' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Icon 
              size={18} 
              color={isActive ? '#ff2d78' : 'currentColor'} 
              strokeWidth={isActive ? 2.4 : 1.8}
            />
            <span style={{
              fontSize: '12px',
              fontWeight: isActive ? '800' : '600',
              letterSpacing: '0.02em',
              color: isActive ? '#ffffff' : 'var(--text-muted)'
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
