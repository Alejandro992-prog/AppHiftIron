import React, { useState } from 'react';
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

function MainApp() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { 
    activeZone,
    activeWorkoutDetail, 
    setActiveWorkoutDetail 
  } = useWorkouts();

  // Active tab: 'hub' | 'workouts' | 'timer' | 'admin'
  const [activeTab, setActiveTab] = useState('hub');
  const [timerPreset, setTimerPreset] = useState(null);

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

  return (
    <div className="app-viewport-wrapper">
      <div className="mobile-app-container">
        {/* Top Header with Brand and Zone Hub Switcher */}
        <Header />

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

              {/* ADMIN TAB */}
              {activeTab === 'admin' && isAdmin && (
                <AdminPanel onNavigateToRoutine={handleNavigateToRoutineFromAdmin} />
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
