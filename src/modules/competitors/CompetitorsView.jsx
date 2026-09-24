import React, { useState } from 'react';
import { 
  Flame, 
  ArrowLeft, 
  Timer, 
  Award, 
  Layers, 
  Play, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  TrendingUp,
  Dumbbell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';
import BaseCalendar from '../../components/shared/BaseCalendar';
import ProtectedZoneGate from '../../components/shared/ProtectedZoneGate';
import PerformanceModal from '../../components/shared/PerformanceModal';
import PRTracker from '../../components/athlete/PRTracker';

export default function CompetitorsView({ onOpenTimerWithPreset }) {
  const { canAccessZone } = useAuth();
  const { 
    setActiveZone, 
    competitorWorkouts, 
    competitorDayWorkout, 
    selectedDay, 
    setSelectedDay,
    setActiveWorkoutDetail,
    performanceLogs
  } = useWorkouts();

  // Sub-tabs: 'session' | 'prs' | 'logs'
  const [activeSubTab, setActiveSubTab] = useState('session');
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState('');

  // Access check
  if (!canAccessZone('competitors')) {
    return <ProtectedZoneGate requiredZone="competitors" onReturnToDashboard={() => setActiveZone('dashboard')} />;
  }

  // Map of days with competitor workouts
  const competitorWorkoutMap = competitorWorkouts.reduce((acc, w) => {
    acc[w.dayId] = w;
    return acc;
  }, {});

  const handleOpenPerformanceModal = (exerciseName = '') => {
    setSelectedExerciseForModal(exerciseName);
    setIsPerformanceModalOpen(true);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Navigation & Breadcrumb */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2px'
      }}>
        <button
          onClick={() => setActiveZone('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 12px',
            fontSize: '11.5px',
            fontWeight: '700',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={13} />
          <span>Cambiar de Zona</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            color: 'var(--brand-pink)',
            background: 'rgba(255, 45, 120, 0.12)',
            border: '1px solid rgba(255, 45, 120, 0.25)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Flame size={12} color="var(--brand-pink)" />
            <span>CROSSFIT ATLETAS</span>
          </span>
        </div>
      </div>

      {/* Interactive Base Calendar */}
      <BaseCalendar 
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        zone="competitors"
        workoutMap={competitorWorkoutMap}
        title="Calendario Competidores"
      />

      {/* Sub-tabs Selector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '4px',
        background: 'var(--bg-secondary)',
        padding: '3px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={() => setActiveSubTab('session')}
          style={{
            padding: '8px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11.5px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: activeSubTab === 'session' ? 'linear-gradient(135deg, #ff2d78 0%, #a855f7 100%)' : 'transparent',
            color: activeSubTab === 'session' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Layers size={13} />
          <span>Sesión del Día</span>
        </button>

        <button
          onClick={() => setActiveSubTab('prs')}
          style={{
            padding: '8px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11.5px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: activeSubTab === 'prs' ? 'linear-gradient(135deg, #ff2d78 0%, #a855f7 100%)' : 'transparent',
            color: activeSubTab === 'prs' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Award size={13} />
          <span>PRs & Benchmarks</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          style={{
            padding: '8px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11.5px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: activeSubTab === 'logs' ? 'linear-gradient(135deg, #ff2d78 0%, #a855f7 100%)' : 'transparent',
            color: activeSubTab === 'logs' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <TrendingUp size={13} />
          <span>Historial ({performanceLogs.filter(l => l.zone === 'competitors').length})</span>
        </button>
      </div>

      {/* TAB 1: WORKOUT OF THE DAY */}
      {activeSubTab === 'session' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {competitorDayWorkout ? (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: 'var(--shadow-md)',
              position: 'relative'
            }}>
              {/* Header Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    color: 'var(--brand-pink)',
                    background: 'rgba(255, 45, 120, 0.15)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase'
                  }}>
                    {competitorDayWorkout.type}
                  </span>

                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={12} />
                    {competitorDayWorkout.duration}
                  </span>
                </div>

                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', lineHeight: 1.3 }}>
                  {competitorDayWorkout.title}
                </h2>

                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.45 }}>
                  {competitorDayWorkout.description}
                </p>
              </div>

              {/* Blocks Preview List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Estructura de la Programación ({competitorDayWorkout.sections.length} Bloques)
                </span>

                {competitorDayWorkout.sections.map((section, idx) => {
                  const isMetcon = section.blockType === 'metcon_wod';
                  const isOly = section.blockType === 'weightlifting';

                  return (
                    <div 
                      key={idx}
                      style={{
                        background: 'var(--bg-surface)',
                        border: isMetcon 
                          ? '1px solid rgba(255, 45, 120, 0.35)' 
                          : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: isMetcon ? 'var(--brand-pink)' : (isOly ? '#eab308' : 'rgba(255, 255, 255, 0.1)'),
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: '900',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {idx + 1}
                          </span>

                          <span style={{ fontSize: '12.5px', fontWeight: '800', color: isMetcon ? 'var(--brand-pink)' : '#ffffff' }}>
                            {section.name}
                          </span>
                        </div>

                        {section.groupTimer && (
                          <button
                            onClick={() => onOpenTimerWithPreset && onOpenTimerWithPreset({
                              type: section.groupTimer.type || 'rest',
                              seconds: section.groupTimer.seconds,
                              label: section.groupTimer.label
                            })}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(255, 45, 120, 0.12)',
                              border: '1px solid rgba(255, 45, 120, 0.25)',
                              borderRadius: 'var(--radius-full)',
                              padding: '3px 8px',
                              fontSize: '10.5px',
                              fontWeight: '700',
                              color: 'var(--brand-pink)',
                              cursor: 'pointer'
                            }}
                          >
                            <Timer size={11} />
                            <span>{Math.round(section.groupTimer.seconds / 60)} min</span>
                          </button>
                        )}
                      </div>

                      {/* Exercises bullets */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px', paddingLeft: '26px' }}>
                        {section.exercises.map((ex, exIdx) => (
                          <div key={exIdx} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: '#ffffff' }}>{ex.name}</strong>
                            {ex.rx && <span style={{ color: 'var(--brand-pink)', marginLeft: '6px', fontWeight: '700', fontSize: '11px' }}>[{ex.rx}]</span>}
                            {ex.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ex.notes}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Main Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => setActiveWorkoutDetail(competitorDayWorkout)}
                  className="btn-primary"
                  style={{
                    padding: '12px',
                    fontSize: '12.5px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <Play size={14} />
                  <span>Iniciar Sesión</span>
                </button>

                <button
                  onClick={() => handleOpenPerformanceModal(competitorDayWorkout.title)}
                  style={{
                    padding: '12px',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Award size={14} color="var(--brand-pink)" />
                  <span>Registrar Marca</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '36px 16px',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={32} color="#22c55e" />
              <div style={{ fontWeight: '800', color: '#ffffff' }}>Día de Descanso Programado</div>
              <span style={{ fontSize: '12px' }}>Recuperación activa recomendada para atletas de competición.</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRS & BENCHMARKS */}
      {activeSubTab === 'prs' && (
        <div>
          <PRTracker />
        </div>
      )}

      {/* TAB 3: LOGS & MARCAS */}
      {activeSubTab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase' }}>
              Historial de Marcas Competidores
            </span>
            <button
              onClick={() => handleOpenPerformanceModal('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--brand-gradient)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '800',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <Plus size={12} />
              <span>Añadir Registro</span>
            </button>
          </div>

          {performanceLogs.filter(l => l.zone === 'competitors').length > 0 ? (
            performanceLogs.filter(l => l.zone === 'competitors').map((log) => (
              <div
                key={log.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>{log.exerciseName}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{log.date}</span>
                    {log.rpe && <span>• RPE {log.rpe}</span>}
                    {log.notes && <span>• {log.notes}</span>}
                  </div>
                </div>

                <div style={{
                  fontSize: '13px',
                  fontWeight: '900',
                  color: 'var(--brand-pink)',
                  background: 'rgba(255, 45, 120, 0.12)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  {log.value}
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: '30px 16px',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '12.5px'
            }}>
              No tienes marcas registradas todavía en la Zona de Competidores.
            </div>
          )}
        </div>
      )}

      {/* Performance Modal */}
      <PerformanceModal
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
        initialExerciseName={selectedExerciseForModal}
        initialZone="competitors"
        workoutId={competitorDayWorkout?.id || ''}
      />
    </div>
  );
}
