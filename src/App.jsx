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
import PercentageCalculatorModal from './components/calculator/PercentageCalculatorModal';
import InstagramStoryModal from './components/social/InstagramStoryModal';
import ReadinessCheckinModal from './components/readiness/ReadinessCheckinModal';
import PrivacyAndDataModal from './components/privacy/PrivacyAndDataModal';
import BrandLogo from './components/common/BrandLogo';
import { Sparkles } from 'lucide-react';

function MainApp() {
  const { 
    isAuthenticated, 
    currentUser, 
    isAdmin, 
    isLoadingAuth, 
    isImpersonatingAthlete, 
    revertToCoach,
    isRecoveryMode
  } = useAuth();
  const { 
    activeZone,
    setActiveZone,
    activeWorkoutDetail, 
    setActiveWorkoutDetail,
    isPercentageCalcOpen,
    percentageCalcPreset,
    closePercentageCalc,
    isStoryModalOpen,
    storyWorkoutData,
    closeStoryModal,
    isReadinessModalOpen,
    closeReadinessModal
  } = useWorkouts();

  // Active tab: 'admin' (default for coach) | 'hub' (default for athlete) | 'workouts' | 'timer'
  const [activeTab, setActiveTab] = useState(() => {
    return isAdmin ? 'admin' : 'hub';
  });
  const [timerPreset, setTimerPreset] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Limpiar cualquier parámetro residual de consulta en la URL por privacidad
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('invite')) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {}
  }, []);

  // When a new user logs in, ensure athletes land on 'hub' and coaches on 'admin'
  const [prevUserId, setPrevUserId] = useState(currentUser?.id);
  if (currentUser && currentUser.id !== prevUserId) {
    setPrevUserId(currentUser.id);
    setActiveTab(isAdmin ? 'admin' : 'hub');
  }

  // Historial y botón "Atrás" del móvil (Android/iOS Swipe): evita cerrar la app por error
  useEffect(() => {
    // Inicializar estado base en el historial
    window.history.replaceState({ screen: 'root' }, '');

    const handlePopState = () => {
      // Si hay un modal abierto, cerrarlo primero
      if (isProfileModalOpen) {
        setIsProfileModalOpen(false);
        return;
      }
      if (isPrivacyModalOpen) {
        setIsPrivacyModalOpen(false);
        return;
      }
      // Si hay un detalle de rutina abierto, volver a la lista
      if (activeWorkoutDetail) {
        setActiveWorkoutDetail(null);
        return;
      }
      // Si está en otra pestaña que no sea el hub principal, volver al hub
      if (activeTab !== 'hub') {
        setActiveTab('hub');
        setActiveZone('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeWorkoutDetail, isProfileModalOpen, isPrivacyModalOpen, activeTab, setActiveZone, setActiveWorkoutDetail]);

  // Pantalla de carga mientras se valida la sesión con Supabase Auth
  if (isLoadingAuth) {
    return (
      <div className="app-viewport-wrapper">
        <div className="mobile-app-container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          gap: '20px'
        }}>
          <BrandLogo size="lg" layout="vertical" />
          <div style={{
            width: '30px',
            height: '30px',
            border: '3px solid rgba(255, 45, 120, 0.2)',
            borderTopColor: 'var(--brand-pink)',
            borderRadius: '50%'
          }} className="animate-spin" />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
            Iniciando sesión segura...
          </span>
        </div>
      </div>
    );
  }

  // Si el usuario llega desde un enlace de recuperación de contraseña de Supabase
  if (isRecoveryMode) {
    return <LoginScreen initialView="reset_password" />;
  }

  // If not logged in, show the clean Login Screen where users enter email/user & password
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleOpenTimerWithPreset = (preset) => {
    setTimerPreset(preset);
    setActiveTab('timer');
    window.history.pushState({ screen: 'timer' }, '');
  };

  const handleNavigateToRoutineFromAdmin = (workout) => {
    setActiveWorkoutDetail(workout);
    setActiveTab('workouts');
    window.history.pushState({ screen: 'routineDetail' }, '');
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
        <Header onOpenPrivacy={() => {
          setIsPrivacyModalOpen(true);
          window.history.pushState({ screen: 'privacyModal' }, '');
        }} />

        {/* Coach Impersonation Banner */}
        {isImpersonatingAthlete && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)',
            borderBottom: '1px solid rgba(234, 179, 8, 0.4)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>👁️ <strong>Vista previa:</strong> {currentUser?.name}</span>
            </div>
            <button
              onClick={() => {
                revertToCoach();
                setActiveTab('admin');
              }}
              style={{
                fontSize: '10.5px',
                fontWeight: '800',
                background: '#eab308',
                color: '#000000',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '3px 8px',
                cursor: 'pointer'
              }}
            >
              Volver a Coach
            </button>
          </div>
        )}

        {/* Invited user profile completion alert banner */}
        {currentUser?.status === 'invited' && (
          <div 
            onClick={() => {
              setIsProfileModalOpen(true);
              window.history.pushState({ screen: 'profileModal' }, '');
            }}
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
              onBack={() => {
                setActiveWorkoutDetail(null);
                if (window.history.state?.screen === 'routineDetail') {
                  window.history.back();
                }
              }}
              onOpenTimerWithPreset={handleOpenTimerWithPreset}
            />
          ) : (
            /* Views depending on active tab and zone */
            <>
              {/* COACH ADMIN VIEW */}
              {activeTab === 'admin' && (
                isAdmin ? (
                  <AdminPanel 
                    onNavigateToRoutine={handleNavigateToRoutineFromAdmin}
                    onSwitchToStudentView={handleSwitchToStudentView}
                  />
                ) : (
                  <ZoneSelectorDashboard />
                )
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
            </>
          )}

          {/* TIMER TAB - Mantenido montado siempre para que no se resetee el cronómetro al cambiar de pestaña */}
          <div style={{ 
            display: activeTab === 'timer' && !activeWorkoutDetail ? 'block' : 'none',
            width: '100%'
          }}>
            <BoxTimer initialPreset={timerPreset} />
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            // Si cambia a 'timer', mantenemos el detalle en background
            // Si pulsa 'hub' explícitamente desde workouts, cerramos detalle
            if (tab === 'hub') {
              setActiveWorkoutDetail(null);
            }
            setActiveTab(tab);
          }} 
        />

        {/* Profile Completion Modal */}
        {isProfileModalOpen && (
          <CompleteProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
        )}

        {/* 1RM & Barbell Percentage Calculator Modal */}
        {isPercentageCalcOpen && (
          <PercentageCalculatorModal
            isOpen={isPercentageCalcOpen}
            onClose={closePercentageCalc}
            initialData={percentageCalcPreset}
          />
        )}

        {/* Instagram Stories Generator Modal */}
        {isStoryModalOpen && (
          <InstagramStoryModal
            isOpen={isStoryModalOpen}
            onClose={closeStoryModal}
            workoutData={storyWorkoutData}
          />
        )}

        {/* Daily Readiness & RPE Check-in Modal */}
        {isReadinessModalOpen && (
          <ReadinessCheckinModal
            isOpen={isReadinessModalOpen}
            onClose={closeReadinessModal}
          />
        )}

        {/* GDPR & LOPDGDD Privacy & Data Subject Rights Modal */}
        {isPrivacyModalOpen && (
          <PrivacyAndDataModal
            isOpen={isPrivacyModalOpen}
            onClose={() => setIsPrivacyModalOpen(false)}
          />
        )}
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
