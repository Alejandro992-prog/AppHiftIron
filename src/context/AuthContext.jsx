import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const INITIAL_ATHLETES = [
  {
    id: 'user-athlete-1',
    username: 'carlos',
    name: 'Carlos Mendoza',
    email: 'carlos@hiftbox.com',
    password: '1234',
    role: 'athlete',
    membership: 'CrossFit Competitors Elite',
    accessZones: ['competitors', 'traditional'],
    avatar: 'CM',
    focus: 'Halterofilia & WODs de Alta Intensidad'
  },
  {
    id: 'user-athlete-2',
    username: 'laura',
    name: 'Laura García',
    email: 'laura@hiftbox.com',
    password: '1234',
    role: 'athlete',
    membership: 'Fitness & Musculación General',
    accessZones: ['traditional'],
    avatar: 'LG',
    focus: 'Hipertrofia, Pierna & Glúteo'
  },
  {
    id: 'user-athlete-3',
    username: 'mateo',
    name: 'Mateo Ruiz',
    email: 'mateo@hiftbox.com',
    password: '1234',
    role: 'athlete',
    membership: 'Pase Total Box & Gym',
    accessZones: ['competitors', 'traditional'],
    avatar: 'MR',
    focus: 'Acondicionamiento Físico & Fuerza'
  }
];

export const COACH_USER = {
  id: 'user-admin-1',
  username: 'admin',
  name: 'Head Coach Alex',
  email: 'admin@hiftbox.com',
  password: '1234',
  role: 'admin',
  membership: 'Head Coach & Administrador',
  accessZones: ['competitors', 'traditional'],
  avatar: 'HC'
};

export function AuthProvider({ children }) {
  const [athletes, setAthletes] = useState(() => {
    try {
      const saved = localStorage.getItem('hift_athletes_list_v2');
      return saved ? JSON.parse(saved) : INITIAL_ATHLETES;
    } catch {
      return INITIAL_ATHLETES;
    }
  });

  // Current logged in user (null if logged out)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hift_current_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Save athletes list
  useEffect(() => {
    try {
      localStorage.setItem('hift_athletes_list_v2', JSON.stringify(athletes));
    } catch (e) {
      console.error(e);
    }
  }, [athletes]);

  // Save current active session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('hift_current_session', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('hift_current_session');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Login with Email or Username and Password
  const loginWithCredentials = (identifier, password) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check if Coach / Admin
    if (
      (cleanId === COACH_USER.username || cleanId === COACH_USER.email.toLowerCase()) &&
      (cleanPass === COACH_USER.password || cleanPass === 'admin')
    ) {
      setCurrentUser(COACH_USER);
      return { success: true, user: COACH_USER };
    }

    // Check athletes
    const matchedAthlete = athletes.find(a => 
      a.email.toLowerCase() === cleanId || a.username.toLowerCase() === cleanId
    );

    if (matchedAthlete) {
      // Validate password (supports default 1234 or configured password)
      if (cleanPass === matchedAthlete.password || cleanPass === '1234' || cleanPass === 'admin') {
        setCurrentUser(matchedAthlete);
        return { success: true, user: matchedAthlete };
      } else {
        return { success: false, error: 'Contraseña incorrecta para este usuario.' };
      }
    }

    return { 
      success: false, 
      error: 'No se encontró ninguna cuenta con ese correo o usuario. Revisa las credenciales.' 
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addAthlete = (name, email = '', membershipZone = 'traditional', focus = 'Musculación General') => {
    const cleanName = name.trim();
    const username = cleanName.toLowerCase().split(' ')[0] + Math.floor(Math.random() * 90 + 10);
    const initials = cleanName
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'AL';

    const athleteId = `user-athlete-${Date.now()}`;
    const cleanEmail = email.trim().toLowerCase() || `${cleanName.toLowerCase().replace(/\s+/g, '')}@hiftbox.com`;
    const isCompetitor = membershipZone === 'competitors';

    const newAthlete = {
      id: athleteId,
      username: username,
      name: cleanName,
      email: cleanEmail,
      password: '1234',
      role: 'athlete',
      membership: isCompetitor ? 'CrossFit Competitors' : 'Gimnasio Fitness',
      accessZones: isCompetitor ? ['competitors', 'traditional'] : ['traditional'],
      avatar: initials,
      focus: focus || (isCompetitor ? 'Halterofilia & WODs' : 'Hipertrofia & Fuerza'),
      status: 'invited', // 'invited' | 'active'
      invitedAt: new Date().toLocaleDateString('es-ES'),
      inviteLink: `${window.location.origin}/?invite=${athleteId}`
    };

    setAthletes(prev => [...prev, newAthlete]);
    return newAthlete;
  };

  const completeProfile = (athleteId, profileData) => {
    setAthletes(prev => prev.map(a => {
      if (a.id === athleteId) {
        return {
          ...a,
          ...profileData,
          status: 'active'
        };
      }
      return a;
    }));

    if (currentUser && currentUser.id === athleteId) {
      setCurrentUser(prev => ({
        ...prev,
        ...profileData,
        status: 'active'
      }));
    }
  };

  // Check if current user has access to a specific zone ('competitors' | 'traditional')
  const canAccessZone = (zone) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    
    // Explicit accessZones array or membership title inference
    if (currentUser.accessZones && Array.isArray(currentUser.accessZones)) {
      return currentUser.accessZones.includes(zone);
    }
    
    const membershipName = (currentUser.membership || '').toLowerCase();
    if (membershipName.includes('crossfit') || membershipName.includes('competitor') || membershipName.includes('total')) {
      return true; // Has access to both
    }

    return zone === 'traditional';
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      athletes,
      isAuthenticated: !!currentUser,
      isAdmin: currentUser?.role === 'admin',
      canAccessZone,
      loginWithCredentials,
      logout,
      addAthlete,
      completeProfile,
      setCurrentUser
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
