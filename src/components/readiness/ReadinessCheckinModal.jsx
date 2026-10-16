import React, { useState } from 'react';
import { 
  X, 
  Moon, 
  Activity, 
  Zap, 
  Brain, 
  Gauge, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  ShieldAlert, 
  Sparkles, 
  ArrowDown 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';
import { 
  calculateIronRecoveryScore, 
  VARIABLE_INTERPRETATIONS 
} from '../../utils/recoveryScore';

export default function ReadinessCheckinModal({ isOpen, onClose }) {
  const { currentUser, getUserConsents, updateConsent } = useAuth();
  const { saveDailyReadiness, getTodayReadiness, isDeloadMode } = useWorkouts();

  // Consents from auth
  const userConsents = getUserConsents(currentUser?.id);
  const [healthConsentGiven, setHealthConsentGiven] = useState(!!userConsents.health_readiness);
  const [showLegalDetails, setShowLegalDetails] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Today entry if previously filled
  const todayEntry = getTodayReadiness(currentUser?.id);

  // Form State according to Iron Program PDF
  const [sleepScore, setSleepScore] = useState(todayEntry?.sleep || 4);
  const [fatigueScore, setFatigueScore] = useState(todayEntry?.fatigue || todayEntry?.soreness || 4);
  const [energyScore, setEnergyScore] = useState(todayEntry?.energy || 4);
  const [stressScore, setStressScore] = useState(todayEntry?.stress || 3);
  const [prsScore, setPrsScore] = useState(todayEntry?.prs ?? (todayEntry?.score ? Math.round(todayEntry.score / 10) : 8));
  
  // Pain / Molestia independent alert
  const [hasPain, setHasPain] = useState(todayEntry?.hasPain || (todayEntry?.sorenessAreas && todayEntry.sorenessAreas[0] !== 'Ninguna molestia') || false);
  const [painAreas, setPainAreas] = useState(todayEntry?.painAreas || todayEntry?.sorenessAreas || []);
  const [painDescription, setPainDescription] = useState(todayEntry?.painDescription || todayEntry?.notes || '');
  const [activeDeload, setActiveDeload] = useState(isDeloadMode);

  // Track if user clicked "Ver mi estado" or viewing live
  const [hasReviewedState, setHasReviewedState] = useState(false);

  // Form is initialized directly on mount from todayEntry and userConsents

  // Compute live calculation using the Iron Program formula
  const evaluation = calculateIronRecoveryScore({
    sleep: sleepScore,
    fatigue: fatigueScore,
    energy: energyScore,
    stress: stressScore,
    prs: prsScore,
    hasPain,
    painDescription,
    painAreas
  });

  const { score, scoreDisplay, stateData, downgraded, downgradeReason } = evaluation;

  // Toggle quick pain area
  const handleTogglePainArea = (area) => {
    if (painAreas.includes(area)) {
      setPainAreas(painAreas.filter(a => a !== area));
    } else {
      setPainAreas([...painAreas, area]);
    }
  };

  const handleSave = () => {
    if (!healthConsentGiven) {
      setSaveError('Para registrar datos de bienestar, fatiga o salud física, la Ley de Protección de Datos (RGPD Art. 9) exige tu consentimiento explícito previo.');
      return;
    }
    setSaveError(null);

    // Persist health consent
    updateConsent('health_readiness', true, currentUser?.id);

    const isLimitedOrLow = evaluation.finalState === 'limited' || evaluation.finalState === 'low';

    saveDailyReadiness(currentUser?.id, {
      sleep: sleepScore,
      sleepText: VARIABLE_INTERPRETATIONS.sleep.labels[sleepScore],
      fatigue: fatigueScore,
      fatigueText: VARIABLE_INTERPRETATIONS.fatigue.labels[fatigueScore],
      soreness: fatigueScore, // compatibility alias
      energy: energyScore,
      energyText: VARIABLE_INTERPRETATIONS.energy.labels[energyScore],
      stress: stressScore,
      stressText: VARIABLE_INTERPRETATIONS.stress.labels[stressScore],
      prs: prsScore,
      // Main Iron Program Score
      score: score, // decimal 0-10
      scoreDisplay,
      baseState: evaluation.baseState,
      finalState: evaluation.finalState,
      level: evaluation.finalState === 'low' ? 'fatigue' : evaluation.finalState === 'limited' ? 'limited' : evaluation.finalState === 'adequate' ? 'moderate' : 'optimal', // compatibility
      statusLabel: stateData.name,
      headline: stateData.headline,
      guidelines: stateData.guidelines,
      volumeReduction: stateData.volumeReduction,
      downgraded,
      downgradeReason,
      // Pain & Molestias
      hasPain,
      painAreas,
      sorenessAreas: painAreas.length > 0 ? painAreas : ['Ninguna molestia'], // compatibility alias
      painDescription: painDescription.trim(),
      notes: painDescription.trim(),
      deloadMode: activeDeload || (isLimitedOrLow && activeDeload),
      isPrivate: true,
      gdprHealthConsentGranted: true,
      gdprConsentTimestamp: new Date().toISOString()
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 10, 0.90)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px'
      }}
    >
      <div 
        className="modal-content animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '510px',
          maxHeight: '94vh',
          background: 'radial-gradient(circle at 50% 0%, #1e1333 0%, #0d0d14 100%)',
          borderRadius: '24px',
          border: `1.5px solid ${stateData.borderColor}77`,
          overflowY: 'auto',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px ${stateData.color}22`
        }}
      >
        {/* Header: Iron Program Official Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
              border: '1px solid rgba(255, 45, 120, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-pink)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: '900',
                  color: 'var(--brand-pink)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  IRON PROGRAM
                </span>
                <span style={{
                  fontSize: '9px',
                  fontWeight: '800',
                  color: '#22c55e',
                  background: 'rgba(34, 197, 94, 0.15)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <Lock size={9} /> COACH PRIVADO
                </span>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff', margin: '2px 0 0 0' }}>
                Evaluación Diaria de Recuperación
              </h2>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            title="Cerrar test (puedes completarlo más tarde)"
            aria-label="Cerrar test"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 45, 120, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Objetivo < 30 seg banner */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          <span>Completa las 5 variables en menos de <strong>30 segundos</strong> para obtener tu pauta.</span>
          <span style={{ color: 'var(--brand-lilac-light)', fontWeight: '800' }}>⚡ Rápido</span>
        </div>

        {/* 5 Variables del Iron Program */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* 1. SUEÑO (1-5) */}
          <div style={{
            background: 'var(--bg-surface)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Moon size={15} color="var(--brand-lilac-light)" />
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#ffffff' }}>
                  1. Sueño
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(Escala 1-5)</span>
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--brand-pink)' }}>
                {sleepScore}/5 · {VARIABLE_INTERPRETATIONS.sleep.labels[sleepScore]}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSleepScore(val)}
                  style={{
                    padding: '8px 0',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12px',
                    fontWeight: '900',
                    background: sleepScore === val ? 'var(--brand-gradient)' : 'var(--bg-secondary)',
                    color: sleepScore === val ? '#ffffff' : 'var(--text-secondary)',
                    border: sleepScore === val ? '1px solid var(--brand-pink)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--text-muted)' }}>
              <span>1: Muy malo</span>
              <span>3: Normal</span>
              <span>5: Muy bueno</span>
            </div>
          </div>

          {/* 2. FATIGA MUSCULAR (1-5) */}
          <div style={{
            background: 'var(--bg-surface)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} color="#38bdf8" />
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#ffffff' }}>
                  2. Fatiga muscular
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(Escala 1-5)</span>
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#38bdf8' }}>
                {fatigueScore}/5 · {VARIABLE_INTERPRETATIONS.fatigue.labels[fatigueScore]}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFatigueScore(val)}
                  style={{
                    padding: '8px 0',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12px',
                    fontWeight: '900',
                    background: fatigueScore === val ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' : 'var(--bg-secondary)',
                    color: fatigueScore === val ? '#ffffff' : 'var(--text-secondary)',
                    border: fatigueScore === val ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--text-muted)' }}>
              <span>1: Muy fatigado</span>
              <span>3: Normal</span>
              <span>5: Muy fresco</span>
            </div>
          </div>

          {/* 3. ENERGÍA (1-5) */}
          <div style={{
            background: 'var(--bg-surface)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={15} color="#eab308" />
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#ffffff' }}>
                  3. Energía
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(Escala 1-5)</span>
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#eab308' }}>
                {energyScore}/5 · {VARIABLE_INTERPRETATIONS.energy.labels[energyScore]}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setEnergyScore(val)}
                  style={{
                    padding: '8px 0',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12px',
                    fontWeight: '900',
                    background: energyScore === val ? 'linear-gradient(135deg, #ca8a04 0%, #eab308 100%)' : 'var(--bg-secondary)',
                    color: energyScore === val ? '#ffffff' : 'var(--text-secondary)',
                    border: energyScore === val ? '1px solid #eab308' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--text-muted)' }}>
              <span>1: Muy baja</span>
              <span>3: Normal</span>
              <span>5: Muy alta</span>
            </div>
          </div>

          {/* 4. ESTRÉS (1-5) */}
          <div style={{
            background: 'var(--bg-surface)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Brain size={15} color="#a855f7" />
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#ffffff' }}>
                  4. Estrés
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(Escala 1-5)</span>
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--brand-lilac-light)' }}>
                {stressScore}/5 · {VARIABLE_INTERPRETATIONS.stress.labels[stressScore]}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStressScore(val)}
                  style={{
                    padding: '8px 0',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12px',
                    fontWeight: '900',
                    background: stressScore === val ? 'linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)' : 'var(--bg-secondary)',
                    color: stressScore === val ? '#ffffff' : 'var(--text-secondary)',
                    border: stressScore === val ? '1px solid #a855f7' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--text-muted)' }}>
              <span>1: Muy alto</span>
              <span>3: Normal</span>
              <span>5: Muy bajo</span>
            </div>
          </div>

          {/* 5. PRS / RECUPERACIÓN GENERAL (0-10) */}
          <div style={{
            background: 'var(--bg-surface)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gauge size={15} color="#22c55e" />
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#ffffff' }}>
                  5. PRS / Recuperación general
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(0-10)</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '900', color: '#22c55e', fontFamily: 'monospace' }}>
                {prsScore} / 10
              </span>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
              "¿Cómo de recuperado te sientes hoy para entrenar?" (Laurent et al. 2011)
            </p>

            {/* Slider 0-10 */}
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={prsScore}
              onChange={(e) => setPrsScore(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#22c55e',
                cursor: 'pointer',
                margin: '4px 0'
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: '2px' }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPrsScore(val)}
                  style={{
                    padding: '4px 0',
                    fontSize: '10px',
                    fontWeight: '800',
                    borderRadius: '3px',
                    background: prsScore === val ? '#22c55e' : 'var(--bg-secondary)',
                    color: prsScore === val ? '#000000' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* PREGUNTA ADICIONAL DE DOLOR / MOLESTIA (Sí / No) */}
          <div style={{
            background: hasPain ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: hasPain ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>
                ¿Tienes alguna molestia o dolor que pueda afectar al entrenamiento de hoy?
              </span>

              {/* Sí / No Toggles */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => {
                    setHasPain(false);
                    setPainAreas([]);
                    setPainDescription('');
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '11px',
                    fontWeight: '800',
                    background: !hasPain ? '#22c55e' : 'var(--bg-secondary)',
                    color: !hasPain ? '#000000' : 'var(--text-secondary)',
                    border: !hasPain ? 'none' : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  No
                </button>

                <button
                  type="button"
                  onClick={() => setHasPain(true)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '11px',
                    fontWeight: '800',
                    background: hasPain ? '#ef4444' : 'var(--bg-secondary)',
                    color: hasPain ? '#ffffff' : 'var(--text-secondary)',
                    border: hasPain ? 'none' : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  Sí
                </button>
              </div>
            </div>

            {/* Si responde Sí: mostrar campo ¿Dónde y qué notas? */}
            {hasPain && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '11px', fontWeight: '700' }}>
                  <AlertTriangle size={13} />
                  <span>¿Dónde y qué notas? (Alerta independiente para el Coach)</span>
                </div>

                {/* Zonas rápidas con un toque */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {[
                    'Hombros / Trapecios',
                    'Espalda baja / Lumbar',
                    'Rodillas / Cuádriceps',
                    'Brazos / Muñecas',
                    'Tobillos / Gemelos',
                    'Isquios / Glúteos',
                    'Cuello / Cervicales'
                  ].map(area => {
                    const isSelected = painAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleTogglePainArea(area)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '10.5px',
                          fontWeight: '700',
                          background: isSelected ? 'rgba(239, 68, 68, 0.25)' : 'var(--bg-secondary)',
                          color: isSelected ? '#fca5a5' : 'var(--text-muted)',
                          border: isSelected ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{area}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={painDescription}
                  onChange={(e) => setPainDescription(e.target.value)}
                  placeholder="Describe la molestia (ej: pinchazo leve en hombro al subir la barra)..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    fontSize: '11.5px',
                    color: '#ffffff'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Botón [ VER MI ESTADO ] según Interfaz recomendada del PDF */}
        {!hasReviewedState ? (
          <button
            type="button"
            onClick={() => setHasReviewedState(true)}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '13.5px',
              fontWeight: '900',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>[ VER MI ESTADO ]</span>
            <ArrowDown size={16} />
          </button>
        ) : null}

        {/* TARJETA DE ESTADO AUTOMÁTICO (Estructura exacta recomendada por el PDF) */}
        {hasReviewedState && (
          <div 
            className="animate-fade-in"
            style={{
              background: stateData.bgColor,
              borderRadius: 'var(--radius-lg)',
              border: `1.5px solid ${stateData.borderColor}`,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: `0 4px 20px ${stateData.color}25`
            }}
          >
            {/* Header del Estado: EMOJI + NOMBRE + PUNTUACIÓN */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{stateData.iconEmoji}</span>
                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '900',
                    color: stateData.color,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}>
                    {stateData.name} ({stateData.rangeLabel})
                  </span>
                  <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                    {stateData.headline}
                  </h3>
                </div>
              </div>

              {/* Recovery Score con un decimal */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '900', color: stateData.color, fontFamily: 'monospace' }}>
                    {scoreDisplay}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800' }}>
                    / 10
                  </span>
                </div>
                <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>
                  Recovery Score
                </span>
              </div>
            </div>

            {/* Pautas Concretas para ese día (Texto oficial del PDF) */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '10.5px', fontWeight: '800', color: stateData.color, textTransform: 'uppercase' }}>
                Pautas automáticas para hoy:
              </span>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px', color: '#f1f5f9', lineHeight: '1.45' }}>
                {stateData.guidelines.map((point, idx) => (
                  <li key={idx} style={{ marginBottom: '3px' }}>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Regla con prioridad: Aviso si se bajó de estadio */}
            {downgraded && (
              <div style={{
                background: 'rgba(249, 115, 22, 0.15)',
                border: '1px solid #f97316',
                borderRadius: 'var(--radius-xs)',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                color: '#fdba74'
              }}>
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Regla con prioridad sobre el score:</strong> 2 o más variables entre Sueño, Fatiga, Energía o Estrés están en 1/5. Se ha bajado automáticamente un estadio de entrenamiento por seguridad.
                </span>
              </div>
            )}

            {/* Regla con prioridad: Aviso de dolor si responde Sí */}
            {hasPain && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                borderRadius: 'var(--radius-xs)',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                color: '#fca5a5'
              }}>
                <ShieldAlert size={15} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Aviso específico de dolor/molestia:</strong> Recomienda adaptar o consultar con el coach antes de empezar. El dolor funciona como alerta independiente y no altera la media matemática.
                </span>
              </div>
            )}

            {/* Toggle de Modo Descarga en caso de reducción de volumen sugerida */}
            {(evaluation.finalState === 'limited' || evaluation.finalState === 'low') && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 'var(--radius-xs)',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={15} color="#ef4444" />
                  <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: '700' }}>
                    Activar Modo Descarga (-15% en barras hoy)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={activeDeload}
                  onChange={(e) => setActiveDeload(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--brand-pink)', cursor: 'pointer' }}
                />
              </div>
            )}
          </div>
        )}

        {/* RGPD Art. 9: Consentimiento explícito de datos de salud */}
        <div style={{
          background: healthConsentGiven ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 45, 120, 0.09)',
          border: healthConsentGiven ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 45, 120, 0.35)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '9px',
            cursor: 'pointer',
            userSelect: 'none'
          }}>
            <input
              type="checkbox"
              checked={healthConsentGiven}
              onChange={(e) => {
                const val = e.target.checked;
                setHealthConsentGiven(val);
                updateConsent('health_readiness', val, currentUser?.id);
              }}
              style={{
                marginTop: '2px',
                width: '16px',
                height: '16px',
                accentColor: 'var(--brand-pink)',
                cursor: 'pointer',
                flexShrink: 0
              }}
            />
            <span style={{ fontSize: '10.5px', color: '#e2e8f0', lineHeight: '1.4' }}>
              <strong>Consentimiento explícito (RGPD Art. 9):</strong> Autorizo de forma expresa el tratamiento de mis datos de descanso, fatiga física y posibles molestias musculares para que mi Head Coach adapte mis cargas y prevenga sobrecargas.
            </span>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
            <button
              type="button"
              onClick={() => setShowLegalDetails(!showLegalDetails)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--brand-lilac-light)',
                fontSize: '10px',
                fontWeight: '700',
                cursor: 'pointer',
                padding: '0'
              }}
            >
              {showLegalDetails ? 'Ocultar información legal' : 'Ver Cláusula Informativa AEPD (1ª Capa)'}
            </button>

            <span style={{
              fontSize: '9.5px',
              fontWeight: '800',
              color: healthConsentGiven ? '#22c55e' : '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <ShieldCheck size={11} /> {healthConsentGiven ? 'Consentimiento Otorgado' : 'Consentimiento Requerido'}
            </span>
          </div>

          {showLegalDetails && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-xs)',
              padding: '8px 10px',
              fontSize: '9.5px',
              color: '#cbd5e1',
              lineHeight: '1.4',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px'
            }}>
              <div><strong>Responsable del Tratamiento:</strong> Hift Iron Box S.L. / Titular del Box.</div>
              <div><strong>Finalidad:</strong> Ajuste de intensidad de WODs, prevención de sobrecargas y seguimiento de fatiga.</div>
              <div><strong>Base Jurídica:</strong> Consentimiento explícito del interesado (Art. 9.2.a RGPD).</div>
              <div><strong>Destinatarios:</strong> Acceso reservado exclusivamente al Head Coach. No se ceden a terceros.</div>
              <div><strong>Nota metodológica:</strong> La PRS (Laurent et al. 2011) es una herramienta interna de autorregulación y no una escala clínica validada.</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
          {saveError && (
            <div style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-xs)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#ef4444',
              fontSize: '11.5px',
              fontWeight: '600'
            }}>
              {saveError}
            </div>
          )}
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={!healthConsentGiven}
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '13.5px',
              fontWeight: '900',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: healthConsentGiven ? 1 : 0.5,
              cursor: healthConsentGiven ? 'pointer' : 'not-allowed'
            }}
          >
            <Lock size={15} />
            <span>Guardar en Historial y Aplicar Pauta ⚡</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <span>Hacer el test más tarde / Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
