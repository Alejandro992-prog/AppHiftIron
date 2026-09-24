import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkoutProvider, useWorkouts } from './context/WorkoutContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import RoutineDetail from './components/athlete/RoutineDetail';
import BoxTimer from './components/timer/BoxTimer';
import AdminPanel from './components/admin/AdminPanel';
import LoginScreen from './components/auth/LoginScreen';
import ZoneSelectorDashboard from './modules/dashboard/ZoneSelectorDashboard';
import CompetitorsView from './modules/competitors/CompetitorsView';
import TraditionalGymView from './modules/traditional/TraditionalGymView';
import CompleteProfileModal from './components/athlete/CompleteProfileModal';
import { Sparkles } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, currentUser, isAdmin } = useAuth();
  const { 
    activeZone,
    setActiveZone,
    activeWorkoutDetail, 
    setActiveWorkoutDetail 
  } = useWorkouts();

  // Active tab: 'admin' (default for coach) | 'hub' (default for athlete) | 'workouts' | 'timer'
  const [activeTab, setActiveTab] = useState(() => {
    return isAdmin ? 'admin' : 'hub';
  });
  const [timerPreset, setTimerPreset] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync default tab if user role changes
  useEffect(() => {
    if (isAdmin && activeTab !== 'admin' && activeZone === 'dashboard') {
      setActiveTab('admin');
    }
  }, [isAdmin]);

  // Check URL for invite token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('invite') && currentUser) {
      setIsProfileModalOpen(true);
    }
  }, [currentUser]);

  // If not logged in, show the clean Login Screen where users enter email/user & password
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleOpenTimerWithPreset = (preset) => {
    setTimerPreset(preset);
    setActiveWorkoutDetail(null);
    setActiveTab('timer');
  };

  const handleNavigateToRoutineFromAdmin = (workout) => {
    setActiveWorkoutDetail(workout);
    setActiveTab('workouts');
  };

  const handleSwitchToStudentView = () => {
    setActiveWorkoutDetail(null);
    setActiveZone('dashboard');
    setActiveTab('hub');
  };

  return (
    <div className="app-viewport-wrapper">
      <div className="mobile-app-container">
        {/* Top Header with Brand and Zone Hub Switcher */}
        <Header />

        {/* Invited user profile completion alert banner */}
        {currentUser?.status === 'invited' && (
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
              borderBottom: '1px solid rgba(255, 45, 120, 0.3)',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontSize: '11.5px',
              color: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="var(--brand-pink)" />
              <span><strong>¡Bienvenido/a!</strong> Pulsa aquí para completar tu perfil deportivo.</span>
            </div>
            <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--brand-pink)' }}>Completar</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="app-content" style={{ padding: '14px 16px calc(var(--bottom-nav-height) + 16px) 16px', gap: '14px' }}>
          {activeWorkoutDetail ? (
            /* Routine Detail with Step-by-Step Exercises and Timers */
            <RoutineDetail 
              workout={activeWorkoutDetail}
              onBack={() => setActiveWorkoutDetail(null)}
              onOpenTimerWithPreset={handleOpenTimerWithPreset}
            />
          ) : (
            /* Views depending on active tab and zone */
            <>
              {/* COACH ADMIN VIEW */}
              {activeTab === 'admin' && isAdmin && (
                <AdminPanel 
                  onNavigateToRoutine={handleNavigateToRoutineFromAdmin}
                  onSwitchToStudentView={handleSwitchToStudentView}
                />
              )}

              {/* HUB & WORKOUTS TAB */}
              {(activeTab === 'hub' || activeTab === 'workouts') && (
                <>
                  {activeZone === 'dashboard' && (
                    <ZoneSelectorDashboard />
                  )}

                  {activeZone === 'competitors' && (
                    <CompetitorsView 
                      onOpenTimerWithPreset={handleOpenTimerWithPreset} 
                    />
                  )}

                  {activeZone === 'traditional' && (
                    <TraditionalGymView />
                  )}
                </>
              )}

              {/* TIMER TAB */}
              {activeTab === 'timer' && (
                <BoxTimer initialPreset={timerPreset} />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveWorkoutDetail(null);
            setActiveTab(tab);
          }} 
        />

        {/* Profile Completion Modal */}
        <CompleteProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <MainApp />
      </WorkoutProvider>
    </AuthProvider>
  );
}
