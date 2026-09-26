import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UploadCloud, 
  Users, 
  Image as ImageIcon, 
  UserPlus, 
  Plus, 
  Eye, 
  Mail, 
  Calendar, 
  Copy, 
  Check, 
  Flame, 
  Dumbbell,
  Activity,
  AlertTriangle,
  Moon,
  Zap,
  CheckCircle2,
  ShieldAlert,
  ChevronRight,
  ArrowLeft,
  Lock,
  Settings,
  Sparkles,
  FileText
} from 'lucide-react';
import { useWorkouts } from '../../context/WorkoutContext';
import { useAuth } from '../../context/AuthContext';
import AthletePlanManager from './AthletePlanManager';
import WordImporter from './WordImporter';
import InviteAthleteModal from './InviteAthleteModal';
import CreateRoutineModal from './CreateRoutineModal';

export default function AdminPanel({ onNavigateToRoutine, onSwitchToStudentView }) {
  const { 
    workouts, 
    customLogoUrl, 
    updateCustomLogo, 
    setActiveZone, 
    readinessLogs,
    setManagingAthleteId 
  } = useWorkouts();
  const { athletes } = useAuth();

  // Navigation state: null = Hub de Opciones | 'athletes' | 'readiness' | 'plans' | 'importer' | 'branding'
  const [currentSection, setCurrentSection] = useState(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateRoutineModalOpen, setIsCreateRoutineModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [athleteFilter, setAthleteFilter] = useState('all'); // for athletes section

  const totalAthletes = athletes.length;

  // Process today's readiness reports for all athletes
  const todayDateStr = new Date().toISOString().split('T')[0];
  const athletesWithReadiness = athletes.map(ath => {
    const key = `${todayDateStr}_${ath.id}`;
    const log = readinessLogs[key];
    return { ...ath, readiness: log || null };
  });

  const highFatigueAthletes = athletesWithReadiness.filter(a => a.readiness && a.readiness.level === 'fatigue');
  const loggedTodayCount = athletesWithReadiness.filter(a => a.readiness !== null).length;

  const handleCopyLink = (athlete) => {
    const link = athlete.inviteLink || `${window.location.origin}/?invite=${athlete.id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(athlete.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      updateCustomLogo(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // =========================================================================
  // VIEW: HUB PRINCIPAL DEL COACH (MENÚ MODULAR DE OPCIONES)
  // =========================================================================
  if (currentSection === null) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Header Hero */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: '1px solid rgba(255, 45, 120, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(255, 45, 120, 0.35)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--brand-pink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                PANEL DEL HEAD COACH
              </span>
              <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                Menú de Gestión del Box
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              if (onSwitchToStudentView) {
                onSwitchToStudentView();
              } else {
                setActiveZone('dashboard');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <Eye size={13} color="var(--brand-lilac-light)" />
            <span>Vista Alumno</span>
          </button>
        </div>

        {/* High Fatigue Alert Banner if any */}
        {highFatigueAthletes.length > 0 && (
          <div 
            onClick={() => setCurrentSection('readiness')}
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(20, 20, 32, 0.95) 100%)',
              border: '1.5px solid #ef4444',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              gap: '10px',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={20} color="#ef4444" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: '900', color: '#ef4444', display: 'block' }}>
                  ⚠️ {highFatigueAthletes.length} Atleta en Fatiga Alta Hoy
                </span>
                <span style={{ fontSize: '11px', color: '#ffffff' }}>
                  {highFatigueAthletes.map(a => a.name).join(', ')} reporta falta de descanso o dolor
                </span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '800',
              color: '#ef4444'
            }}>
              <span>Ver Radar</span>
              <ChevronRight size={14} />
            </div>
          </div>
        )}

        {/* Section title */}
        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '4px' }}>
          Elige una función
        </span>

        {/* The 6 Clean, Distinct Function Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          
          {/* Card 1: Alumnos y Altas */}
          <div
            onClick={() => setCurrentSection('athletes')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-pink)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.2) 0%, rgba(255, 45, 120, 0.05) 100%)',
                border: '1px solid rgba(255, 45, 120, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-pink)',
                flexShrink: 0
              }}>
                <Users size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  Gestión de Alumnos y Altas
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Listado de inscritos, dar de alta y copiar enlaces de invitación
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                color: 'var(--brand-pink)',
                background: 'rgba(255, 45, 120, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                {totalAthletes} atletas
              </span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </div>

          {/* Card 2: Radar de Sueño & Bienestar (Privado) */}
          <div
            onClick={() => setCurrentSection('readiness')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0.05) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                flexShrink: 0
              }}>
                <Moon size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                    Radar de Sueño & Recuperación
                  </h3>
                  <Lock size={12} color="#22c55e" />
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Informes privados de descanso, zonas con dolor y notas confidenciales
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                color: highFatigueAthletes.length > 0 ? '#ef4444' : '#22c55e',
                background: highFatigueAthletes.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                {highFatigueAthletes.length > 0 ? `${highFatigueAthletes.length} en fatiga` : `${loggedTodayCount} hoy`}
              </span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </div>

          {/* Card 3: Planificación Semanal */}
          <div
            onClick={() => setCurrentSection('plans')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-lilac-light)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.05) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-lilac-light)',
                flexShrink: 0
              }}>
                <Calendar size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  Planificador Semanal
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Asignar entrenamientos y WODs día a día a cada alumno
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                color: 'var(--brand-lilac-light)',
                background: 'rgba(168, 85, 247, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                Semana
              </span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </div>

          {/* Card 4: Añadir Rutina Manual */}
          <div
            onClick={() => setIsCreateRoutineModalOpen(true)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-pink)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(234, 179, 8, 0.05) 100%)',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#eab308',
                flexShrink: 0
              }}>
                <Plus size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  Crear Rutina Manual
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Diseñar una nueva sesión paso a paso con ejercicios y series
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                color: '#eab308',
                background: 'rgba(234, 179, 8, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                + Nueva
              </span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </div>

          {/* Card 5: Importador Word (.docx) */}
          <div
            onClick={() => setCurrentSection('importer')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#22c55e'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22c55e',
                flexShrink: 0
              }}>
                <UploadCloud size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  Importador desde Word (.docx)
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Cargar documentos de Word y convertirlos automáticamente en WODs
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                color: '#22c55e',
                background: 'rgba(34, 197, 94, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                .docx
              </span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </div>

          {/* Card 6: Personalización & Logo */}
          <div
            onClick={() => setCurrentSection('branding')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                flexShrink: 0
              }}>
                <ImageIcon size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  Marca & Logo del Box
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Subir el escudo o logotipo oficial para la app de los alumnos
                </p>
              </div>
            </div>

            <ChevronRight size={16} color="var(--text-muted)" />
          </div>

        </div>

        {/* Modals */}
        <InviteAthleteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />

        <CreateRoutineModal
          isOpen={isCreateRoutineModalOpen}
          onClose={() => setIsCreateRoutineModalOpen(false)}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW: PANTALLA ESPECÍFICA CON BOTÓN DE REGRESO
  // =========================================================================
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Universal Top Return Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <button
          onClick={() => setCurrentSection(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: 'var(--brand-pink)',
            fontSize: '12.5px',
            fontWeight: '800',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <ArrowLeft size={16} />
          <span>← Volver al Menú Principal</span>
        </button>

        <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-muted)' }}>
          {currentSection === 'athletes' && 'Gestión de Alumnos'}
          {currentSection === 'readiness' && 'Radar de Sueño & Bienestar'}
          {currentSection === 'plans' && 'Planificación Semanal'}
          {currentSection === 'importer' && 'Importador Word (.docx)'}
          {currentSection === 'branding' && 'Marca & Logotipo'}
        </span>
      </div>

      {/* ===================================================================== */}
      {/* 1. SECCIÓN: ALUMNOS Y ALTAS */}
      {/* ===================================================================== */}
      {currentSection === 'athletes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Header row with Add Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                Alumnos Registrados ({totalAthletes})
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Controla los accesos y copia el enlace de alta personalizada
              </p>
            </div>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11.5px'
              }}
            >
              <UserPlus size={14} />
              <span>Dar de Alta Alumno</span>
            </button>
          </div>

          {/* Athletes List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {athletes.map(athlete => {
              const isCompetitor = athlete.membership?.toLowerCase().includes('competitor') || athlete.membership?.toLowerCase().includes('crossfit');
              const isPending = athlete.status === 'invited';

              return (
                <div
                  key={athlete.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: isCompetitor 
                          ? 'linear-gradient(135deg, rgba(255, 45, 120, 0.3) 0%, rgba(255, 45, 120, 0.1) 100%)' 
                          : 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)',
                        border: isCompetitor ? '1px solid rgba(255, 45, 120, 0.4)' : '1px solid rgba(168, 85, 247, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isCompetitor ? 'var(--brand-pink)' : 'var(--brand-lilac-light)',
                        fontSize: '12px',
                        fontWeight: '900'
                      }}>
                        {athlete.avatar || 'AL'}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                            {athlete.name}
                          </h4>
                          {isPending && (
                            <span style={{
                              fontSize: '9.5px',
                              fontWeight: '700',
                              color: '#eab308',
                              background: 'rgba(234, 179, 8, 0.12)',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-full)'
                            }}>
                              Alta pendiente
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {athlete.email}
                        </span>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: '800',
                      color: isCompetitor ? 'var(--brand-pink)' : 'var(--brand-lilac-light)',
                      background: isCompetitor ? 'rgba(255, 45, 120, 0.12)' : 'rgba(168, 85, 247, 0.12)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {isCompetitor ? 'Competidor' : 'Gimnasio'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '11px'
                  }}>
                    <button
                      onClick={() => handleCopyLink(athlete)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: copiedId === athlete.id ? '#22c55e' : 'var(--brand-lilac-light)',
                        cursor: 'pointer',
                        fontWeight: '700'
                      }}
                    >
                      {copiedId === athlete.id ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedId === athlete.id ? '¡Enlace Copiado!' : 'Copiar Enlace de Alta'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (setManagingAthleteId) setManagingAthleteId(athlete.id);
                        setCurrentSection('plans');
                      }}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-full)',
                        padding: '4px 10px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '10.5px'
                      }}
                    >
                      Asignar Plan Semanal
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. SECCIÓN: RADAR DE SUEÑO & RECUPERACIÓN (EXCLUSIVO Y PRIVADO) */}
      {/* ===================================================================== */}
      {currentSection === 'readiness' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Privacy Guarantee Header Banner */}
          <div style={{
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '11.5px',
            color: '#22c55e'
          }}>
            <Lock size={18} style={{ flexShrink: 0 }} />
            <span>
              <strong>Área Privada del Coach:</strong> Los informes de descanso, horas de sueño y notas que ves aquí son 100% confidenciales y ningún atleta puede ver los datos de los demás.
            </span>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#22c55e', textTransform: 'uppercase' }}>Óptimos</span>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                {athletesWithReadiness.filter(a => a.readiness?.level === 'optimal').length}
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#eab308', textTransform: 'uppercase' }}>Moderados</span>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                {athletesWithReadiness.filter(a => a.readiness?.level === 'moderate').length}
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase' }}>Fatiga Alta</span>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#ef4444', marginTop: '2px' }}>
                {highFatigueAthletes.length}
              </div>
            </div>
          </div>

          {/* Athletes Detailed Recovery Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {athletesWithReadiness.map(athlete => {
              const log = athlete.readiness;
              const isFatigue = log?.level === 'fatigue';
              const isModerate = log?.level === 'moderate';
              const isOptimal = log?.level === 'optimal';
              const statusColor = isFatigue ? '#ef4444' : isModerate ? '#eab308' : isOptimal ? '#22c55e' : 'var(--text-muted)';

              return (
                <div
                  key={athlete.id}
                  style={{
                    background: isFatigue ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, var(--bg-secondary) 100%)' : 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    border: isFatigue ? '1.5px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-subtle)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Top: Athlete & Score */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: `${statusColor}22`,
                        border: `1.5px solid ${statusColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: statusColor,
                        fontWeight: '900',
                        fontSize: '13px'
                      }}>
                        {athlete.avatar || 'AL'}
                      </div>

                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                          {athlete.name}
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {athlete.email}
                        </span>
                      </div>
                    </div>

                    {/* Readiness Pill */}
                    {log ? (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                          <span style={{ fontSize: '18px', fontWeight: '900', color: statusColor, fontFamily: 'monospace' }}>
                            {log.score}%
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: statusColor }}>
                            {isFatigue ? 'FATIGA' : isModerate ? 'MODERADO' : 'ÓPTIMO'}
                          </span>
                        </div>
                        <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
                          Hoy, {log.loggedAt || '08:00'}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Sin check-in hoy
                      </span>
                    )}
                  </div>

                  {/* Private Details Breakdown */}
                  {log && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '6px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)', fontSize: '10.5px' }}>
                          <Moon size={11} color="var(--brand-lilac-light)" />
                          <span>Sueño:</span>
                        </div>
                        <strong style={{ color: '#ffffff', fontSize: '12px', display: 'block', marginTop: '2px' }}>
                          {log.sleepHours || `${log.sleep}/5`}
                        </strong>
                        <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>
                          {log.sleepQualityText || 'Descanso normal'}
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)', fontSize: '10.5px' }}>
                          <Activity size={11} color="#38bdf8" />
                          <span>Dolor:</span>
                        </div>
                        <strong style={{ color: '#ffffff', fontSize: '12px', display: 'block', marginTop: '2px' }}>
                          {log.soreness}/5
                        </strong>
                        <span style={{ fontSize: '9.5px', color: '#38bdf8' }}>
                          {log.sorenessAreas?.join(', ') || 'Sin molestias'}
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)', fontSize: '10.5px' }}>
                          <Zap size={11} color="#eab308" />
                          <span>Energía:</span>
                        </div>
                        <strong style={{ color: '#ffffff', fontSize: '12px', display: 'block', marginTop: '2px' }}>
                          {log.energy}/5
                        </strong>
                        <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>
                          {log.energyText || 'Energía media'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Athlete Note to Coach */}
                  {log?.notes && (
                    <div style={{
                      fontSize: '11px',
                      color: isFatigue ? '#fca5a5' : 'var(--text-secondary)',
                      background: isFatigue ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-xs)',
                      borderLeft: `2.5px solid ${statusColor}`,
                      fontStyle: 'italic'
                    }}>
                      💬 "{log.notes}"
                    </div>
                  )}

                  {/* Fatigue Action */}
                  {isFatigue && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(239, 68, 68, 0.18)',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '11px',
                      color: '#ffffff'
                    }}>
                      <span>⚠️ <strong>Ajuste Coach:</strong> Reducir -15% peso o adaptar volumen hoy</span>
                      {log.deloadMode && (
                        <span style={{ background: '#ef4444', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontSize: '9px', fontWeight: '800' }}>
                          DESCARGA CONFIRMADA
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. SECCIÓN: PLANIFICACIÓN SEMANAL */}
      {/* ===================================================================== */}
      {currentSection === 'plans' && (
        <AthletePlanManager onNavigateToRoutine={onNavigateToRoutine} />
      )}

      {/* ===================================================================== */}
      {/* 4. SECCIÓN: IMPORTADOR WORD (.DOCX) */}
      {/* ===================================================================== */}
      {currentSection === 'importer' && (
        <WordImporter onWorkoutImported={onNavigateToRoutine} />
      )}

      {/* ===================================================================== */}
      {/* 5. SECCIÓN: BRANDING Y LOGO */}
      {/* ===================================================================== */}
      {currentSection === 'branding' && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
              Personalización del Logotipo del Box
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '4px 0 0 0' }}>
              Sube el logotipo oficial de tu gimnasio o box para que aparezca en la cabecera de la aplicación de todos tus atletas.
            </p>
          </div>

          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px',
            border: '2px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            cursor: 'pointer',
            gap: '10px',
            textAlign: 'center'
          }}>
            <ImageIcon size={30} color="var(--brand-lilac-light)" />
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#ffffff' }}>
              Haz clic para seleccionar imagen (PNG, JPG, SVG)
            </span>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </label>

          {customLogoUrl && (
            <button
              onClick={() => updateCustomLogo(null)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px',
                color: 'var(--color-danger)',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Restablecer Logo por Defecto
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <InviteAthleteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <CreateRoutineModal
        isOpen={isCreateRoutineModalOpen}
        onClose={() => setIsCreateRoutineModalOpen(false)}
      />
    </div>
  );
}
