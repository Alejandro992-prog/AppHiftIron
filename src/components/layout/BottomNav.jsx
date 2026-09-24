import React from 'react';
import { Dumbbell, Timer, ShieldCheck, LayoutGrid, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';

export default function BottomNav({ activeTab, setActiveTab }) {
  const { isAdmin } = useAuth();
  const { activeZone, setActiveZone, setActiveWorkoutDetail } = useWorkouts();

  const handleTabClick = (tabId) => {
    if (tabId === 'hub') {
      setActiveWorkoutDetail(null);
      setActiveZone('dashboard');
      setActiveTab('hub');
    } else {
      setActiveWorkoutDetail(null);
      setActiveTab(tabId);
    }
  };

  const isHubActive = activeTab === 'hub' || activeZone === 'dashboard';
  const isWorkoutsActive = activeTab === 'workouts' && activeZone !== 'dashboard';

  const tabs = [
    { 
      id: 'hub', 
      label: 'Zonas Hub', 
      icon: LayoutGrid, 
      isActive: isHubActive 
    },
    { 
      id: 'workouts', 
      label: activeZone === 'competitors' ? 'Competidores' : 'Gimnasio', 
      icon: activeZone === 'competitors' ? Flame : Dumbbell,
      isActive: isWorkoutsActive 
    },
    { 
      id: 'timer', 
      label: 'Cronómetro', 
      icon: Timer,
      isActive: activeTab === 'timer'
    },
    ...(isAdmin ? [
      { 
        id: 'admin', 
        label: 'Admin Word', 
        icon: ShieldCheck,
        isActive: activeTab === 'admin'
      }
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
      gap: '12px',
      zIndex: 50,
      maxWidth: 'inherit',
      margin: '0 auto',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)'
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.isActive;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-full)',
              background: isActive 
                ? 'linear-gradient(135deg, rgba(255, 45, 120, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)' 
                : 'transparent',
              border: isActive ? '1px solid rgba(255, 45, 120, 0.35)' : '1px solid transparent',
              color: isActive ? '#ffffff' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
              cursor: 'pointer'
            }}
          >
            <Icon 
              size={17} 
              color={isActive ? 'var(--brand-pink)' : 'currentColor'} 
              strokeWidth={isActive ? 2.4 : 1.8}
            />
            <span style={{
              fontSize: '11.5px',
              fontWeight: isActive ? '800' : '600',
              letterSpacing: '0.02em',
              color: isActive ? '#ffffff' : 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
