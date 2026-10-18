import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchAthletesFromSupabase, 
  loginWithSupabaseAuth,
  logoutSupabaseAuth,
  fetchAthleteProfile,
  registerAthleteInSupabaseAuth,
  deleteAthleteFromSupabase,
  fetchConsentsFromSupabase,
  upsertConsentsInSupabase,
  requestPasswordReset,
  updateUserPassword
} from '../services/supabaseService';
import { supabase, isSupabaseConfigured, initialAuthFlowType } from '../lib/supabase';
import { safeLogger } from '../utils/validators';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Lista de atletas sincronizados desde Supabase
  const [athletes, setAthletes] = useState([]);

  // Sesión activa del usuario autenticado
  const [currentUser, setCurrentUser] = useState(null);

  // Estado de carga inicial mientras se verifica la sesión en Supabase Auth
  const [isLoadingAuth, setIsLoadingAuth] = useState(() => Boolean(isSupabaseConfigured && supabase));

  // Modo de recuperación de contraseña (activado por enlace con hash recovery)
  const [isRecoveryMode, setIsRecoveryMode] = useState(() => initialAuthFlowType === 'recovery');

  // Sesión de coach original cuando se previsualiza la app como alumno
  const [coachSessionUser, setCoachSessionUser] = useState(null);

  // RGPD & LOPDGDD Consents state: { [userId]: { terms: true, health_readiness: bool, leaderboard: bool, updatedAt: string } }
  const [consents, setConsents] = useState({});

  // Limpieza de claves obsoletas que pudieran existir de versiones anteriores
  useEffect(() => {
    try {
      [
        'hift_athletes_list_v2',
        'hift_current_session',
        'hift_user_consents_v1',
        'hift_workouts_v3',
        'hift_athlete_plans_v2',
        'hift_weekly_athlete_plans_v1',
        'hift_box_weekly_schedule_v1',
        'hift_prs_v3',
        'hift_athlete_prs_v1',
        'hift_performance_logs_v1',
        'hift_completed_exercises',
        'hift_readiness_logs_v1',
        'hift_custom_logo',
        'hift_active_zone_v3'
      ].forEach(k => localStorage.removeItem(k));
    } catch (e) {
      safeLogger.warn('Error limpiando almacenamiento local anterior:', e);
    }
  }, []);

  // Función auxiliar para cargar atletas
  const refreshAthletes = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const remoteAthletes = await fetchAthletesFromSupabase();
      if (remoteAthletes) {
        setAthletes(remoteAthletes);
      }
    } catch (err) {
      safeLogger.error('Error refrescando atletas:', err);
    }
  };

  // Helper para normalizar el usuario según su rol estricto verificado
  const buildUserObject = (sessionUser, profile) => {
    const isStrictAdmin = Boolean(
      profile?.role === 'admin' ||
      sessionUser?.app_metadata?.role === 'admin'
    );

    if (profile) {
      return {
        ...profile,
        role: isStrictAdmin ? 'admin' : (profile.role || 'athlete'),
        accessZones: Array.isArray(profile.accessZones) ? profile.accessZones : ['traditional']
      };
    }

    const verifiedZones = Array.isArray(sessionUser.app_metadata?.access_zones)
      ? sessionUser.app_metadata.access_zones
      : ['traditional'];

    return {
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.user_metadata?.name || sessionUser.email.split('@')[0],
      role: isStrictAdmin ? 'admin' : 'athlete',
      membership: isStrictAdmin ? 'Head Coach & Administrador' : (sessionUser.app_metadata?.membership || 'Atleta Hift Box'),
      accessZones: isStrictAdmin ? ['competitors', 'traditional'] : verifiedZones,
      avatar: isStrictAdmin ? 'HC' : (sessionUser.user_metadata?.avatar || 'A'),
      focus: isStrictAdmin ? 'Gestión Global del Box' : (sessionUser.user_metadata?.focus || '')
    };
  };

  // 1. Escuchar el estado de autenticación oficial de Supabase Auth
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    let isMounted = true;

    // Verificar si ya existe una sesión guardada y válida al cargar la aplicación
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error) {
        safeLogger.warn('Error recuperando sesión Supabase:', error);
        setIsLoadingAuth(false);
        return;
      }

      if (session?.user) {
        const profile = await fetchAthleteProfile(session.user.id);
        if (isMounted) {
          const userObj = buildUserObject(session.user, profile);
          setCurrentUser(userObj);

          // Cargar consentimientos
          fetchConsentsFromSupabase(userObj.id).then(userConsent => {
            if (userConsent && isMounted) {
              setConsents(prev => ({ ...prev, [userObj.id]: userConsent }));
            }
          });

          // Si el usuario es Coach/Admin, cargar lista completa de atletas
          if (userObj.role === 'admin') {
            refreshAthletes();
          }
        }
      }
      if (isMounted) setIsLoadingAuth(false);
    });

    // Suscribirse a cambios en tiempo real (login, logout, refresh de token, recuperación)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      } else if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchAthleteProfile(session.user.id);
        const userObj = buildUserObject(session.user, profile);
        setCurrentUser(userObj);
        if (userObj.role === 'admin') {
          refreshAthletes();
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setAthletes([]);
        setCoachSessionUser(null);
        setIsRecoveryMode(false);
      }
      setIsLoadingAuth(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Login Seguro contra Supabase Auth (Bcrypt en servidor + JWT)
  const loginWithCredentials = async (identifier, password) => {
    if (!isSupabaseConfigured) {
      return { 
        success: false, 
        error: 'Supabase no está configurado en .env. Verifica tus claves.' 
      };
    }

    const res = await loginWithSupabaseAuth(identifier, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      
      // Cargar consentimientos del usuario
      fetchConsentsFromSupabase(res.user.id).then(userConsent => {
        if (userConsent) {
          setConsents(prev => ({ ...prev, [res.user.id]: userConsent }));
        }
      });

      // Si es admin, refrescar catálogo de atletas
      if (res.user.role === 'admin') {
        refreshAthletes();
      }

      return { success: true, user: res.user };
    }

    return { 
      success: false, 
      error: res.error || 'Credenciales no válidas.' 
    };
  };

  // Alta de nuevo atleta mediante invitación criptográfica oficial de Supabase Auth
  const addAthlete = async (name, email = '', membershipZone = 'traditional', focus = 'Musculación General') => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('El correo electrónico es obligatorio para generar la invitación.');
    }
    const isCompetitor = membershipZone === 'competitors';

    const res = await registerAthleteInSupabaseAuth({
      name: cleanName,
      email: cleanEmail,
      role: 'athlete',
      membership: isCompetitor ? 'CrossFit Competitors' : 'Gimnasio Fitness',
      accessZones: isCompetitor ? ['competitors', 'traditional'] : ['traditional'],
      focus: focus || (isCompetitor ? 'Halterofilia & WODs' : 'Hipertrofia & Fuerza')
    });

    if (res.success && res.user) {
      // Refrescar lista de atletas
      await refreshAthletes();
      return res.user;
    } else {
      safeLogger.error('Error registrando atleta:', res.error);
      throw new Error(res.error || 'No se pudo crear la invitación para el atleta.');
    }
  };

  const completeProfile = (athleteId, profileData) => {
    // Proteger contra manipulación: solo el propio atleta o un administrador pueden actualizar el perfil
    const isSelf = currentUser && currentUser.id === athleteId;
    const isCoach = currentUser && (currentUser.role === 'admin' || Boolean(coachSessionUser));

    if (!isSelf && !isCoach) {
      safeLogger.warn('Violación de autorización: No tienes permisos para actualizar este perfil de atleta.');
      return;
    }

    // Proteger contra escalada de privilegios: los atletas no pueden modificar rol ni zonas
    const { role: _r, accessZones: _az, membership: _m, id: _i, email: _e, ...safeProfileData } = profileData || {};

    let updatedTarget = null;
    setAthletes(prev => prev.map(a => {
      if (a.id === athleteId) {
        updatedTarget = {
          ...a,
          ...safeProfileData,
          status: 'active'
        };
        return updatedTarget;
      }
      return a;
    }));

    if (isSupabaseConfigured && supabase && athleteId) {
      // Persistir perfil completo en la base de datos
      supabase
        .from('athletes')
        .update({
          focus: safeProfileData.focus || safeProfileData.goal || 'Entrenamiento General',
          phone: safeProfileData.phone || null,
          experience: safeProfileData.experience || null,
          injuries: safeProfileData.injuries || null
        })
        .eq('id', athleteId)
        .then(({ error }) => {
          if (error) safeLogger.warn('Aviso persistiendo perfil de atleta:', error);
        });
    }

    if (currentUser && currentUser.id === athleteId) {
      setCurrentUser(prev => ({
        ...prev,
        ...safeProfileData,
        status: 'active'
      }));
    }
  };

  // Check if current user has access to a specific zone ('competitors' | 'traditional')
  const canAccessZone = (zone) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || Boolean(coachSessionUser)) return true;
    
    // Verificación estricta alineada con el RLS de PostgreSQL
    if (currentUser.accessZones && Array.isArray(currentUser.accessZones)) {
      return currentUser.accessZones.includes(zone);
    }

    return zone === 'traditional';
  };

  const DEFAULT_CONSENTS = Object.freeze({
    terms: true,
    health_readiness: false,
    leaderboard: false, // RGPD Art. 25: Privacidad desde el diseño (Opt-in estricto)
    policyVersion: 'v1.0_2026_ES'
  });

  const isEffectiveAdmin = currentUser?.role === 'admin' || Boolean(coachSessionUser);

  // RGPD & LOPDGDD Consents helpers
  const getUserConsents = (userId = currentUser?.id) => {
    if (!userId) return { ...DEFAULT_CONSENTS };
    return consents[userId] || { ...DEFAULT_CONSENTS };
  };

  const updateConsent = async (consentKey, value, userId = currentUser?.id) => {
    if (!userId) return false;
    const newConsentData = {
      ...(consents[userId] || DEFAULT_CONSENTS),
      [consentKey]: value,
      updatedAt: new Date().toISOString(),
      policyVersion: 'v1.0_2026_ES'
    };
    setConsents(prev => ({ ...prev, [userId]: newConsentData }));
    if (isSupabaseConfigured) {
      return await upsertConsentsInSupabase(userId, newConsentData);
    }
    return true;
  };

  // Portabilidad de Datos (Art. 20 RGPD): Genera y descarga un JSON con todos los datos personales
  const exportUserData = (userId = currentUser?.id) => {
    if (!userId) return;
    try {
      const athleteInfo = athletes.find(a => a.id === userId) || currentUser;
      const userConsentData = consents[userId] || {};

      const exportPayload = {
        title: 'Copia de Seguridad y Portabilidad de Datos Personales (RGPD Art. 20)',
        source: 'Hift Iron Box App',
        exportedAt: new Date().toISOString(),
        regulation: 'Reglamento General de Protección de Datos (UE 2016/679) & LOPDGDD 3/2018 (España)',
        dataSubject: {
          id: athleteInfo.id,
          name: athleteInfo.name,
          username: athleteInfo.username,
          email: athleteInfo.email,
          membership: athleteInfo.membership,
          role: athleteInfo.role,
          focus: athleteInfo.focus || null,
          phone: athleteInfo.phone || null,
          injuriesReported: athleteInfo.injuries || 'Ninguna'
        },
        consentsAuditLog: userConsentData
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      const safeName = (athleteInfo.username || athleteInfo.name || 'usuario').replace(/[^a-zA-Z0-9_-]/g, '_');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `mis_datos_hift_box_${safeName}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return true;
    } catch (err) {
      safeLogger.error('Error al exportar datos RGPD:', err);
      return false;
    }
  };

  // Derecho de Supresión / "Derecho al Olvido" (Art. 17 RGPD)
  const deleteUserAccount = async (userId = currentUser?.id) => {
    // Si el Coach está previsualizando a un alumno, bloquear para no borrarlo por error
    if (coachSessionUser || currentUser?.isPreviewMode) {
      safeLogger.warn('Operación bloqueada: No se puede eliminar una cuenta en modo previsualización.');
      return false;
    }

    if (!userId) return false;

    // Control de acceso: solo el propio titular o un administrador pueden solicitar la supresión
    const isSelf = currentUser && currentUser.id === userId;
    if (!isSelf && !isEffectiveAdmin) {
      safeLogger.warn('Violación de autorización: No tienes permisos para eliminar la cuenta de otro atleta.');
      return false;
    }

    // Eliminar de lista de atletas
    setAthletes(prev => prev.filter(a => a.id !== userId));
    
    // Purgar consentimientos
    setConsents(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });

    // Purgar en Supabase (ejecuta RPC delete_own_account o admin_delete_athlete que purga auth.users en cascada)
    if (isSupabaseConfigured) {
      try {
        await deleteAthleteFromSupabase(userId);
      } catch (err) {
        safeLogger.warn('Error purgando cuenta en Supabase:', err);
      }
    }

    // Si es el usuario activo actual, cerrar sesión y purgar JWT
    if (currentUser?.id === userId) {
      await logoutSupabaseAuth();
      setCurrentUser(null);
    }
    return true;
  };

  // Previsualizar programación como alumno desde el panel de Coach sin perder la sesión original
  const loginAsAthlete = (athleteId) => {
    // Verificación de control de acceso: solo administradores pueden suplantar la vista previa
    if (!isEffectiveAdmin) {
      safeLogger.warn('Violación de autorización: Se requieren privilegios de Administrador / Head Coach para previsualizar como alumno.');
      return false;
    }

    const target = athletes.find(a => a.id === athleteId);
    if (target) {
      if (currentUser?.role === 'admin' && !coachSessionUser) {
        setCoachSessionUser(currentUser);
      }
      setCurrentUser({
        ...target,
        isPreviewMode: true // Flag de seguridad para prevenir mutación de datos reales en previsualización
      });
      return true;
    }
    return false;
  };

  // Volver a la sesión de Coach tras previsualizar
  const revertToCoach = () => {
    if (coachSessionUser) {
      setCurrentUser(coachSessionUser);
      setCoachSessionUser(null);
      return true;
    }
    return false;
  };

  const logout = async () => {
    setCoachSessionUser(null);
    await logoutSupabaseAuth();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      athletes,
      isSupabaseConfigured,
      isLoadingAuth,
      isAuthenticated: !!currentUser,
      isAdmin: isEffectiveAdmin,
      isImpersonatingAthlete: Boolean(coachSessionUser),
      revertToCoach,
      canAccessZone,
      loginWithCredentials,
      loginAsAthlete,
      logout,
      addAthlete,
      refreshAthletes,
      completeProfile,
      setCurrentUser,
      getUserConsents,
      updateConsent,
      exportUserData,
      deleteUserAccount,
      isRecoveryMode,
      setIsRecoveryMode,
      requestPasswordReset,
      updateUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
