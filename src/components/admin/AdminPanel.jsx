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
  Dumbbell 
} from 'lucide-react';
import { useWorkouts } from '../../context/WorkoutContext';
import { useAuth } from '../../context/AuthContext';
import AthletePlanManager from './AthletePlanManager';
import WordImporter from './WordImporter';
import InviteAthleteModal from './InviteAthleteModal';
import CreateRoutineModal from './CreateRoutineModal';

export default function AdminPanel({ onNavigateToRoutine, onSwitchToStudentView }) {
  const { workouts, customLogoUrl, updateCustomLogo, setActiveZone } = useWorkouts();
  const { athletes } = useAuth();

  // Active admin tab: 'people' | 'plans' | 'importer' | 'branding'
  const [activeAdminTab, setActiveAdminTab] = useState('people');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateRoutineModalOpen, setIsCreateRoutineModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const totalAthletes = athletes.length;

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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Coach Header Hero */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.18) 0%, rgba(168, 85, 247, 0.18) 100%)',
        border: '1px solid rgba(255, 45, 120, 0.35)',
        boxShadow: '0 4px 20px rgba(255, 45, 120, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--brand-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 10px rgba(255, 45, 120, 0.35)'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--brand-pink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                PANEL DEL HEAD COACH
              </span>
            </div>
            <h2 style={{ fontSize: '17px', fontWeight: '900', color: '#ffffff', margin: 0 }}>
              Gestión de la App y Atletas
            </h2>
          </div>
        </div>

        {/* Switch to Student View Button */}
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
            gap: '6px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          <Eye size={13} color="var(--brand-lilac-light)" />
          <span>Vista Alumno</span>
        </button>
      </div>

      {/* Main Quick Actions Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="btn-primary"
          style={{
            padding: '12px 10px',
            fontSize: '12px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <UserPlus size={16} />
          <span>Dar de Alta Alumno</span>
        </button>

        <button
          onClick={() => setIsCreateRoutineModalOpen(true)}
          style={{
            padding: '12px 10px',
            fontSize: '12px',
            fontWeight: '800',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Plus size={16} color="var(--brand-lilac-light)" />
          <span>Añadir Rutina Manual</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '4px',
        background: 'var(--bg-secondary)',
        padding: '3px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)'
      }}>
        {[
          { id: 'people', label: `Alumnos (${totalAthletes})`, icon: Users },
          { id: 'plans', label: 'Programar', icon: Calendar },
          { id: 'importer', label: 'Word (.docx)', icon: UploadCloud },
          { id: 'branding', label: 'Logo', icon: ImageIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '8px 4px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: active ? '800' : '600',
                background: active ? 'var(--brand-gradient)' : 'transparent',
                color: active ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GESTIÓN DE LA GENTE (ALUMNOS) */}
      {activeAdminTab === 'people' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Listado de Alumnos y Clientes Registrados
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Total: {totalAthletes}
            </span>
          </div>

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
                        width: '36px',
                        height: '36px',
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

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <Mail size={11} />
                          <span>{athlete.email}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: '800',
                        color: isCompetitor ? 'var(--brand-pink)' : 'var(--brand-lilac-light)',
                        background: isCompetitor ? 'rgba(255, 45, 120, 0.12)' : 'rgba(168, 85, 247, 0.12)',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        {isCompetitor ? <Flame size={10} /> : <Dumbbell size={10} />}
                        <span>{isCompetitor ? 'Competidor' : 'Gimnasio'}</span>
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {athlete.focus || 'Enfoque general'}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons per athlete */}
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
                      onClick={() => setActiveAdminTab('plans')}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-full)',
                        padding: '3px 9px',
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

      {/* TAB 2: ASIGNACIÓN Y PLANIFICACIÓN SEMANAL */}
      {activeAdminTab === 'plans' && (
        <AthletePlanManager onNavigateToRoutine={onNavigateToRoutine} />
      )}

      {/* TAB 3: IMPORTADOR WORD */}
      {activeAdminTab === 'importer' && (
        <WordImporter onWorkoutImported={onNavigateToRoutine} />
      )}

      {/* TAB 4: BRANDING / LOGO */}
      {activeAdminTab === 'branding' && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 16px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
            Personalización del Logo del Box
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Sube el logotipo oficial de tu gimnasio o box de CrossFit para que aparezca en el encabezado de todos los atletas.
          </p>

          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            border: '2px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            cursor: 'pointer',
            gap: '8px'
          }}>
            <ImageIcon size={28} color="var(--brand-lilac-light)" />
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

      {/* Invite Athlete Modal */}
      <InviteAthleteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Create Routine Modal */}
      <CreateRoutineModal
        isOpen={isCreateRoutineModalOpen}
        onClose={() => setIsCreateRoutineModalOpen(false)}
      />
    </div>
  );
}
