import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UploadCloud, 
  Users, 
  Image as ImageIcon, 
  UserPlus, 
  Plus, 
  Eye, 
  Calendar, 
  Copy, 
  Check, 
  ShieldAlert, 
  ChevronRight, 
  ArrowLeft, 
  Lock, 
  Database,
  Moon,
  Activity,
  Zap
} from 'lucide-react';
import { useWorkouts } from '../../context/WorkoutContext';
import { useAuth } from '../../context/AuthContext';
import AthletePlanManager from './AthletePlanManager';
import WordImporter from './WordImporter';
import InviteAthleteModal from './InviteAthleteModal';
import CreateRoutineModal from './CreateRoutineModal';
import SupabaseSyncModal from './SupabaseSyncModal';
import { RECOVERY_STATES, calculateThreeDayMovingAverage } from '../../utils/recoveryScore';
import { formatLocalDate } from '../../utils/weekManager';

export default function AdminPanel({ onNavigateToRoutine, onSwitchToStudentView }) {
  const { 
    customLogoUrl, 
    updateCustomLogo, 
    setActiveZone, 
    readinessLogs,
    getAthleteReadinessHistory,
    setManagingAthleteId,
    isSupabaseConfigured
  } = useWorkouts();
  const { athletes } = useAuth();

  // Navigation state: null = Hub de Opciones | 'athletes' | 'readiness' | 'plans' | 'importer' | 'branding'
  const [currentSection, setCurrentSection] = useState(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateRoutineModalOpen, setIsCreateRoutineModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [readinessFilter, setReadinessFilter] = useState('all'); // 'all' | 'attention' | 'pain'

  const totalAthletes = athletes.length;

  // Process today's readiness reports for all athletes according to Iron Program
  const todayDateStr = formatLocalDate(new Date());
  const athletesWithReadiness = athletes.map(ath => {
    const key = `${todayDateStr}_${ath.id}`;
    const log = readinessLogs[key] || null;
    const history = getAthleteReadinessHistory ? getAthleteReadinessHistory(ath.id) : [];
    const threeDayAvg = calculateThreeDayMovingAverage(history);

    // Map state key
    let stateKey = log?.finalState;
    if (!stateKey && log) {
      if (log.level === 'fatigue') stateKey = 'low';
      else if (log.level === 'moderate') stateKey = 'adequate';
      else stateKey = 'optimal';
    }

    const stateData = stateKey ? RECOVERY_STATES[stateKey] : null;
    const isAttentionRequired = stateKey === 'limited' || stateKey === 'low' || Boolean(log?.hasPain);

    return { 
      ...ath, 
      readiness: log,
      stateKey,
      stateData,
      threeDayAvg,
      historyCount: history.length,
      isAttentionRequired
    };
  });

  // Atletas destacados en Naranja / Rojo o con Molestia (según especificación del PDF)
  const highFatigueAthletes = athletesWithReadiness.filter(a => a.stateKey === 'low' || a.stateKey === 'limited');
  const athletesWithPain = athletesWithReadiness.filter(a => a.readiness?.hasPain);
  const athletesRequiringAttention = athletesWithReadiness.filter(a => a.isAttentionRequired);
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

    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      alert('Por seguridad, solo se admiten imágenes en formato PNG, JPEG o WEBP.');
      return;
    }

    const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      alert('La imagen no puede superar los 2 MB de tamaño.');
      return;
    }

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

        {/* High Fatigue / Alert Banner for Coach (destacados según Iron Program) */}
        {athletesRequiringAttention.length > 0 && (
          <div 
            onClick={() => {
              setReadinessFilter('attention');
              setCurrentSection('readiness');
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(249, 115, 22, 0.15) 100%)',
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
                  ⚠️ {athletesRequiringAttention.length} Atleta{athletesRequiringAttention.length > 1 ? 's' : ''} Requiere{athletesRequiringAttention.length > 1 ? 'n' : ''} Ajuste (Naranja / Rojo / Dolor)
                </span>
                <span style={{ fontSize: '11px', color: '#ffffff' }}>
                  {athletesRequiringAttention.map(a => a.name).join(', ')}: Conviene ajustar volumen o adaptar cargas hoy según el Iron Program
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
                    Radar Iron Program (Recuperación)
                  </h3>
                  <Lock size={12} color="#22c55e" />
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Sistema diario de evaluación, pautas automáticas y alertas de dolor
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                color: athletesRequiringAttention.length > 0 ? '#ef4444' : '#22c55e',
                background: athletesRequiringAttention.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                {athletesRequiringAttention.length > 0 ? `${athletesRequiringAttention.length} requieren ajuste` : `${loggedTodayCount} hoy`}
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

          {/* Card 5: Importador PDF y Word */}
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
                  Importador de Rutinas (PDF &amp; Word)
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Cargar documentos PDF (.pdf) o Word (.docx) y convertirlos automáticamente en WODs
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
                .pdf / .docx
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

          {/* Card 7: Base de Datos Supabase (Cloud Sync) */}
          <div
            onClick={() => setIsSupabaseModalOpen(true)}
            style={{
              background: 'var(--bg-secondary)',
              border: isSupabaseConfigured 
                ? '1px solid rgba(62, 207, 142, 0.4)' 
                : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3ECF8E'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = isSupabaseConfigured ? 'rgba(62, 207, 142, 0.4)' : 'var(--border-subtle)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(62, 207, 142, 0.2) 0%, rgba(62, 207, 142, 0.05) 100%)',
                border: '1px solid rgba(62, 207, 142, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3ECF8E',
                flexShrink: 0
              }}>
                <Database size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  Base de Datos Cloud (Supabase)
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Estado en la nube, diagnóstico de conexión y sincronización completa
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                color: isSupabaseConfigured ? '#3ECF8E' : '#f97316',
                background: isSupabaseConfigured ? 'rgba(62, 207, 142, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                {isSupabaseConfigured ? '🟢 Conectado' : '🟠 Modo Local'}
              </span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
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

        <SupabaseSyncModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
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
      {/* 2. SECCIÓN: RADAR IRON PROGRAM - SISTEMA DIARIO DE RECUPERACIÓN */}
      {/* ===================================================================== */}
      {currentSection === 'readiness' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Privacy Guarantee Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(168, 85, 247, 0.1) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={18} color="#22c55e" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff', display: 'block' }}>
                  Área Exclusiva y Confidencial del Head Coach (Iron Program)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Evaluaciones diarias según PRS (Laurent et al. 2011), 5 variables de recuperación y alertas independientes de dolor.
                </span>
              </div>
            </div>

            <div style={{
              fontSize: '10.5px',
              fontWeight: '800',
              padding: '4px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(34, 197, 94, 0.2)',
              color: '#22c55e',
              border: '1px solid #22c55e',
              whiteSpace: 'nowrap'
            }}>
              RGPD Art. 9 Válido
            </div>
          </div>

          {/* 4 Official States Metric Bar (Iron Program) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
            {/* Óptimo */}
            <div style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid rgba(34, 197, 94, 0.3)', 
              borderRadius: 'var(--radius-md)', 
              padding: '10px', 
              textAlign: 'center' 
            }}>
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#22c55e', textTransform: 'uppercase' }}>
                🟢 ÓPTIMO
              </span>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                {athletesWithReadiness.filter(a => a.stateKey === 'optimal').length}
              </div>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>8,0 - 10</span>
            </div>

            {/* Adecuado */}
            <div style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid rgba(234, 179, 8, 0.3)', 
              borderRadius: 'var(--radius-md)', 
              padding: '10px', 
              textAlign: 'center' 
            }}>
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#eab308', textTransform: 'uppercase' }}>
                🟡 ADECUADO
              </span>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                {athletesWithReadiness.filter(a => a.stateKey === 'adequate').length}
              </div>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>6,5 - 7,9</span>
            </div>

            {/* Recuperación Limitada */}
            <div style={{ 
              background: 'rgba(249, 115, 22, 0.08)', 
              border: '1.5px solid rgba(249, 115, 22, 0.45)', 
              borderRadius: 'var(--radius-md)', 
              padding: '10px', 
              textAlign: 'center' 
            }}>
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#f97316', textTransform: 'uppercase' }}>
                🟠 LIMITADA
              </span>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#f97316', marginTop: '2px' }}>
                {athletesWithReadiness.filter(a => a.stateKey === 'limited').length}
              </div>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>5,0 - 6,4</span>
            </div>

            {/* Recuperación Baja */}
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.08)', 
              border: '1.5px solid rgba(239, 68, 68, 0.45)', 
              borderRadius: 'var(--radius-md)', 
              padding: '10px', 
              textAlign: 'center' 
            }}>
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#ef4444', textTransform: 'uppercase' }}>
                🔴 BAJA
              </span>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#ef4444', marginTop: '2px' }}>
                {athletesWithReadiness.filter(a => a.stateKey === 'low').length}
              </div>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>&lt; 5,0</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Filtrar vista:
            </span>

            <button
              type="button"
              onClick={() => setReadinessFilter('all')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: '800',
                background: readinessFilter === 'all' ? 'var(--brand-pink)' : 'var(--bg-secondary)',
                color: readinessFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer'
              }}
            >
              Todos ({athletesWithReadiness.length})
            </button>

            <button
              type="button"
              onClick={() => setReadinessFilter('attention')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: '800',
                background: readinessFilter === 'attention' ? '#f97316' : 'var(--bg-secondary)',
                color: readinessFilter === 'attention' ? '#ffffff' : '#f97316',
                border: readinessFilter === 'attention' ? 'none' : '1px solid rgba(249, 115, 22, 0.4)',
                cursor: 'pointer'
              }}
            >
              ⚠️ Destacados: Naranja / Rojo ({highFatigueAthletes.length})
            </button>

            <button
              type="button"
              onClick={() => setReadinessFilter('pain')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: '800',
                background: readinessFilter === 'pain' ? '#ef4444' : 'var(--bg-secondary)',
                color: readinessFilter === 'pain' ? '#ffffff' : '#ef4444',
                border: readinessFilter === 'pain' ? 'none' : '1px solid rgba(239, 68, 68, 0.4)',
                cursor: 'pointer'
              }}
            >
              🚨 Con Molestia / Dolor ({athletesWithPain.length})
            </button>
          </div>

          {/* Athletes Detailed Recovery Cards (Destacando en Naranja/Rojo primero) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {athletesWithReadiness
              .filter(athlete => {
                if (readinessFilter === 'attention') return athlete.stateKey === 'limited' || athlete.stateKey === 'low' || athlete.readiness?.hasPain;
                if (readinessFilter === 'pain') return Boolean(athlete.readiness?.hasPain);
                return true;
              })
              // Ordenar: primero los atletas con atención requerida (naranja / rojo / dolor)
              .sort((a, b) => {
                if (a.isAttentionRequired && !b.isAttentionRequired) return -1;
                if (!a.isAttentionRequired && b.isAttentionRequired) return 1;
                return (b.readiness ? 1 : 0) - (a.readiness ? 1 : 0);
              })
              .map(athlete => {
                const log = athlete.readiness;
                const stateData = athlete.stateData || RECOVERY_STATES.adequate;
                const statusColor = stateData.color;
                const isAttention = athlete.isAttentionRequired;

                const scoreFormatted = log?.scoreDisplay || 
                  (log?.score !== undefined 
                    ? (log.score > 10 ? (log.score / 10).toFixed(1) : log.score.toFixed(1)).replace('.', ',')
                    : null);

                return (
                  <div
                    key={athlete.id}
                    style={{
                      background: isAttention 
                        ? (athlete.stateKey === 'low' 
                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, var(--bg-secondary) 100%)' 
                            : 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, var(--bg-secondary) 100%)')
                        : 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-lg)',
                      border: isAttention ? `1.5px solid ${statusColor}` : '1px solid var(--border-subtle)',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: isAttention ? `0 4px 16px ${statusColor}22` : 'none'
                    }}
                  >
                    {/* Top: Athlete Avatar, Name, and Recovery Score */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: `${statusColor}25`,
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                              {athlete.name}
                            </h4>
                            {isAttention && (
                              <span style={{
                                fontSize: '9px',
                                fontWeight: '900',
                                background: statusColor,
                                color: '#000000',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-full)'
                              }}>
                                DESTACADO HOY
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {athlete.email}
                          </span>
                        </div>
                      </div>

                      {/* Score & State Badge */}
                      {log ? (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '13px' }}>{stateData.iconEmoji}</span>
                            <span style={{ fontSize: '11px', fontWeight: '900', color: statusColor, textTransform: 'uppercase' }}>
                              {stateData.name}
                            </span>
                            <span style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', fontFamily: 'monospace' }}>
                              {scoreFormatted} / 10
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            <span>Hoy, {log.loggedAt || '08:00'}</span>
                            {athlete.threeDayAvg && (
                              <span>• Media 3 días: <strong>{athlete.threeDayAvg.toFixed(1).replace('.', ',')}/10</strong></span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Sin evaluación completada hoy
                        </span>
                      )}
                    </div>

                    {/* Headline and Guidelines */}
                    {log && (
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.35)',
                        borderLeft: `3px solid ${statusColor}`,
                        borderRadius: 'var(--radius-xs)',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>
                            {log.headline || stateData.headline}
                          </span>
                          <span style={{ fontSize: '10px', color: statusColor, fontWeight: '800' }}>
                            Reducción sugerida: {stateData.volumeReduction}
                          </span>
                        </div>

                        {/* Guidelines points */}
                        <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
                          {(log.guidelines || stateData.guidelines)?.map((g, idx) => (
                            <li key={idx}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 5 Variables Breakdown (Sueño, Fatiga, Energía, Estrés, PRS) */}
                    {log && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                        gap: '6px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Moon size={11} color="var(--brand-lilac-light)" />
                            <span>Sueño:</span>
                          </div>
                          <strong style={{ color: '#ffffff', fontSize: '11.5px' }}>
                            {log.sleep}/5
                          </strong>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block' }}>
                            {log.sleepText || 'Descanso'}
                          </span>
                        </div>

                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Activity size={11} color="#38bdf8" />
                            <span>Fatiga musc.:</span>
                          </div>
                          <strong style={{ color: '#ffffff', fontSize: '11.5px' }}>
                            {log.fatigue || log.soreness}/5
                          </strong>
                          <span style={{ fontSize: '9px', color: '#38bdf8', display: 'block' }}>
                            {log.fatigueText || 'Muscular'}
                          </span>
                        </div>

                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Zap size={11} color="#eab308" />
                            <span>Energía:</span>
                          </div>
                          <strong style={{ color: '#ffffff', fontSize: '11.5px' }}>
                            {log.energy}/5
                          </strong>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block' }}>
                            {log.energyText || 'Energía'}
                          </span>
                        </div>

                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <span>🧠</span>
                            <span>Estrés:</span>
                          </div>
                          <strong style={{ color: '#ffffff', fontSize: '11.5px' }}>
                            {log.stress || 3}/5
                          </strong>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block' }}>
                            {log.stressText || 'Estrés'}
                          </span>
                        </div>

                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <span>🎯</span>
                            <span>PRS (Laurent):</span>
                          </div>
                          <strong style={{ color: '#22c55e', fontSize: '11.5px' }}>
                            {log.prs ?? 8}/10
                          </strong>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block' }}>
                            Recup. general
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Independent Pain / Molestia Alert */}
                    {log?.hasPain && (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1.5px solid #ef4444',
                        borderRadius: 'var(--radius-xs)',
                        padding: '8px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        fontSize: '11px',
                        color: '#fca5a5'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: '#ef4444' }}>
                          <ShieldAlert size={14} />
                          <span>¡ALERTA DE MOLESTIA / DOLOR ACTIVA!</span>
                        </div>
                        <div>
                          <strong>Zonas reportadas:</strong> {log.painAreas?.join(', ') || log.sorenessAreas?.join(', ') || 'No especificada'}
                        </div>
                        {log.painDescription && (
                          <div>
                            <strong>Detalle del atleta:</strong> "{log.painDescription}"
                          </div>
                        )}
                      </div>
                    )}

                    {/* Downgrade rule notice */}
                    {log?.downgraded && (
                      <div style={{
                        background: 'rgba(249, 115, 22, 0.12)',
                        border: '1px solid #f97316',
                        borderRadius: 'var(--radius-xs)',
                        padding: '6px 10px',
                        fontSize: '10.5px',
                        color: '#fdba74'
                      }}>
                        ⚠️ <strong>Regla Iron Program aplicada:</strong> Dos o más variables en 1/5 han degradado automáticamente un estadio de entrenamiento para proteger las articulaciones del atleta.
                      </div>
                    )}

                    {/* Athlete Note to Coach */}
                    {log?.notes && (
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-xs)',
                        fontStyle: 'italic'
                      }}>
                        💬 Nota del alumno: "{log.notes}"
                      </div>
                    )}

                    {/* Action pill if deload is active */}
                    {log?.deloadMode && (
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
                        <span>⚠️ <strong>Modo Descarga Activo:</strong> El sistema aplica -15% en las barras a este atleta hoy.</span>
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

      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
