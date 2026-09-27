import React, { useState, useEffect } from 'react';
import { 
  X, 
  Moon, 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  ShieldAlert, 
  MessageSquare,
  Clock,
  Info,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';

export default function ReadinessCheckinModal({ isOpen, onClose }) {
  const { currentUser, getUserConsents, updateConsent } = useAuth();
  const { saveDailyReadiness, getTodayReadiness, isDeloadMode } = useWorkouts();

  // Consents from auth
  const userConsents = getUserConsents(currentUser?.id);
  const [healthConsentGiven, setHealthConsentGiven] = useState(!!userConsents.health_readiness);
  const [showLegalDetails, setShowLegalDetails] = useState(false);

  // Current values or defaults
  const todayEntry = getTodayReadiness(currentUser?.id);

  const [sleepHours, setSleepHours] = useState(todayEntry?.sleepHours || '7-8h');
  const [sleepScore, setSleepScore] = useState(todayEntry?.sleep || 4);
  const [sorenessScore, setSorenessScore] = useState(todayEntry?.soreness || 4);
  const [selectedAreas, setSelectedAreas] = useState(todayEntry?.sorenessAreas || ['Ninguna molestia']);
  const [energyScore, setEnergyScore] = useState(todayEntry?.energy || 4);
  const [notes, setNotes] = useState(todayEntry?.notes || '');
  const [activeDeload, setActiveDeload] = useState(isDeloadMode);

  useEffect(() => {
    if (currentUser?.id) {
      const current = getUserConsents(currentUser.id);
      setHealthConsentGiven(!!current.health_readiness);
    }
  }, [currentUser?.id, isOpen]);

  useEffect(() => {
    if (todayEntry) {
      setSleepHours(todayEntry.sleepHours || '7-8h');
      setSleepScore(todayEntry.sleep || 4);
      setSorenessScore(todayEntry.soreness || 4);
      setSelectedAreas(todayEntry.sorenessAreas || ['Ninguna molestia']);
      setEnergyScore(todayEntry.energy || 4);
      setNotes(todayEntry.notes || '');
      setActiveDeload(!!todayEntry.deloadMode);
    }
  }, [todayEntry, isOpen]);

  // Calculate live readiness score (0-100)
  // Max possible sum = 5 + 5 + 5 = 15. Min = 3.
  const rawSum = sleepScore + sorenessScore + energyScore;
  const readinessPercent = Math.round(((rawSum - 3) / 12) * 100);

  // Status classification
  let statusInfo = {
    level: 'optimal',
    color: '#22c55e',
    badge: '🟢 Estado Óptimo (Alta Capacidad)',
    message: '¡Tu cuerpo está recuperado y listo! Día ideal para empujar fuerte, buscar PRs o ir a por la versión RX del WOD.',
    alert: false
  };

  if (readinessPercent < 55) {
    statusInfo = {
      level: 'fatigue',
      color: '#ef4444',
      badge: '🔴 Alerta de Fatiga Alta',
      message: 'Tu sistema nervioso y muscular reportan fatiga acumulada o falta de descanso. Te recomendamos activar el Modo Descarga (-10% a -15% en las barras) o priorizar técnica.',
      alert: true
    };
  } else if (readinessPercent < 80) {
    statusInfo = {
      level: 'moderate',
      color: '#eab308',
      badge: '🟡 Recuperación Media / Regular',
      message: 'Capacidad funcional estable. Entrena con buena técnica, alarga el calentamiento y dosifica el ritmo en los metcons.',
      alert: false
    };
  }

  // Toggle soreness area tags
  const handleToggleArea = (area) => {
    if (area === 'Ninguna molestia') {
      setSelectedAreas(['Ninguna molestia']);
      return;
    }
    let updated = selectedAreas.filter(a => a !== 'Ninguna molestia');
    if (updated.includes(area)) {
      updated = updated.filter(a => a !== area);
      if (updated.length === 0) updated = ['Ninguna molestia'];
    } else {
      updated.push(area);
    }
    setSelectedAreas(updated);
  };

  // Add quick note tag
  const handleAddQuickNote = (tag) => {
    if (notes.includes(tag)) return;
    setNotes(prev => prev ? `${prev} • ${tag}` : tag);
  };

  const getSleepQualityText = (val) => {
    switch (val) {
      case 1: return 'Muy malo / Insomnio';
      case 2: return 'Inquieto / Despertares';
      case 3: return 'Normal / Descanso suficiente';
      case 4: return 'Profundo y reparador';
      case 5: return 'Óptimo al 100%';
      default: return 'Normal';
    }
  };

  const getSorenessText = (val) => {
    switch (val) {
      case 1: return 'Dolor severo / Rígido';
      case 2: return 'Bastantes agujetas';
      case 3: return 'Tensión moderada';
      case 4: return 'Apenas molestias';
      case 5: return 'Fresco / Cero dolor';
      default: return 'Normal';
    }
  };

  const getEnergyText = (val) => {
    switch (val) {
      case 1: return 'Agotado / Estrés alto';
      case 2: return 'Batería baja';
      case 3: return 'Energía media';
      case 4: return 'Motivado y con buen foco';
      case 5: return 'A tope de energía';
      default: return 'Normal';
    }
  };

  const handleSave = () => {
    if (!healthConsentGiven) {
      alert('Para registrar datos de bienestar, fatiga o salud física, la Ley de Protección de Datos (RGPD Art. 9) exige tu consentimiento explícito previo.');
      return;
    }

    // Persistir el consentimiento explícito de salud en la auditoría RGPD
    updateConsent('health_readiness', true, currentUser?.id);

    saveDailyReadiness(currentUser?.id, {
      sleep: sleepScore,
      sleepHours,
      sleepQualityText: getSleepQualityText(sleepScore),
      soreness: sorenessScore,
      sorenessAreas: selectedAreas,
      energy: energyScore,
      energyText: getEnergyText(energyScore),
      score: readinessPercent,
      level: statusInfo.level,
      deloadMode: activeDeload,
      notes: notes.trim(),
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
          maxWidth: '470px',
          maxHeight: '92vh',
          background: 'radial-gradient(circle at 50% 0%, #1e1333 0%, #0d0d14 100%)',
          borderRadius: '24px',
          border: statusInfo.alert ? '1.5px solid rgba(239, 68, 68, 0.6)' : '1.5px solid rgba(255, 45, 120, 0.4)',
          overflowY: 'auto',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)'
        }}
      >
        {/* Header with Privacy Guarantee */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
              border: '1px solid rgba(255, 45, 120, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-pink)'
            }}>
              <Moon size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: '800',
                  color: '#22c55e',
                  background: 'rgba(34, 197, 94, 0.15)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <Lock size={9} /> PRIVADO PARA TU COACH
                </span>
              </div>
              <h2 style={{ fontSize: '15.5px', fontWeight: '900', color: '#ffffff', margin: '2px 0 0 0' }}>
                Check-in de Sueño y Bienestar
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Privacy Note Banner */}
        <div style={{
          background: 'rgba(168, 85, 247, 0.08)',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--brand-lilac-light)'
        }}>
          <ShieldCheck size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Información confidencial:</strong> Solo tu Head Coach verá estos datos para planificar tus descansos y prevenir lesiones. Nadie más en el box tiene acceso.
          </span>
        </div>

        {/* Live Readiness Hero Result */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 'var(--radius-lg)',
          border: `1.5px solid ${statusInfo.color}55`,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: `0 4px 20px ${statusInfo.color}22`
        }}>
          <div>
            <span style={{
              fontSize: '11px',
              fontWeight: '800',
              color: statusInfo.color,
              display: 'block',
              marginBottom: '2px'
            }}>
              {statusInfo.badge}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', fontFamily: 'monospace' }}>
                {readinessPercent}%
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>
                Índice de Recuperación
              </span>
            </div>
          </div>

          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: `${statusInfo.color}22`,
            border: `2px solid ${statusInfo.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: statusInfo.color
          }}>
            {statusInfo.alert ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          </div>
        </div>

        {/* Questions Section - Detailed yet 1-Tap fast */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Question 1: Sleep Hours & Quality */}
          <div style={{
            background: 'var(--bg-surface)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Moon size={15} color="var(--brand-lilac-light)" />
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>
                  1. Sueño y Descanso Nocturno
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--brand-pink)' }}>
                {getSleepQualityText(sleepScore)}
              </span>
            </div>

            {/* Quick Sleep Hours Selector */}
            <div>
              <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                ¿Cuántas horas dormiste anoche?
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                {['< 5h', '5-6h', '6-7h', '7-8h', '> 8h'].map(hours => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setSleepHours(hours)}
                    style={{
                      padding: '6px 0',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '11px',
                      fontWeight: '800',
                      background: sleepHours === hours ? 'var(--brand-pink)' : 'var(--bg-secondary)',
                      color: sleepHours === hours ? '#ffffff' : 'var(--text-secondary)',
                      border: sleepHours === hours ? 'none' : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    {hours}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Quality (1 to 5) */}
            <div>
              <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Calidad del descanso (1=Insomnio, 5=Óptimo)
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSleepScore(val)}
                    style={{
                      padding: '7px 0',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '12px',
                      fontWeight: '900',
                      background: sleepScore === val ? 'var(--brand-gradient)' : 'var(--bg-secondary)',
                      color: sleepScore === val ? '#ffffff' : 'var(--text-secondary)',
                      border: sleepScore === val ? 'none' : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question 2: Muscle Soreness & Areas */}
          <div style={{
            background: 'var(--bg-surface)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} color="#38bdf8" />
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>
                  2. Dolor Muscular y Articulaciones
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8' }}>
                {getSorenessText(sorenessScore)}
              </span>
            </div>

            {/* Soreness Scale (1 to 5) */}
            <div>
              <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Nivel general de agujetas (1=Severo, 5=Cero dolor)
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSorenessScore(val)}
                    style={{
                      padding: '7px 0',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '12px',
                      fontWeight: '900',
                      background: sorenessScore === val ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' : 'var(--bg-secondary)',
                      color: sorenessScore === val ? '#ffffff' : 'var(--text-secondary)',
                      border: sorenessScore === val ? 'none' : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Soreness Areas (Multi-select 1-tap chips) */}
            <div>
              <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                ¿Zonas con molestia hoy? (Selección rápida)
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {[
                  'Ninguna molestia',
                  'Piernas / Rodillas',
                  'Espalda baja / Lumbar',
                  'Hombros / Trapecios',
                  'Brazos / Muñecas',
                  'Pectoral / Cuello'
                ].map(area => {
                  const isSelected = selectedAreas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleToggleArea(area)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '10.5px',
                        fontWeight: '700',
                        background: isSelected 
                          ? (area === 'Ninguna molestia' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.2)')
                          : 'var(--bg-secondary)',
                        color: isSelected 
                          ? (area === 'Ninguna molestia' ? '#22c55e' : '#38bdf8')
                          : 'var(--text-muted)',
                        border: isSelected 
                          ? (area === 'Ninguna molestia' ? '1px solid #22c55e' : '1px solid #38bdf8')
                          : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}{area}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Question 3: Energy & Stress */}
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
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>
                  3. Nivel de Energía y Estrés Diario
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#eab308' }}>
                {getEnergyText(energyScore)}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setEnergyScore(val)}
                  style={{
                    padding: '7px 0',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12px',
                    fontWeight: '900',
                    background: energyScore === val ? 'linear-gradient(135deg, #ca8a04 0%, #eab308 100%)' : 'var(--bg-secondary)',
                    color: energyScore === val ? '#ffffff' : 'var(--text-secondary)',
                    border: energyScore === val ? 'none' : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Question 4: Private Note to Coach (Quick tags + input) */}
          <div style={{
            background: 'var(--bg-surface)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} color="var(--brand-lilac-light)" />
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>
                4. Nota Privada para el Coach (Opcional)
              </span>
            </div>

            {/* Quick tags to tap in 1 second */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {[
                'Turno laboral duro',
                'Poco tiempo hoy',
                'Molestia al calentar',
                'Con ganas de buscar PR'
              ].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddQuickNote(tag)}
                  style={{
                    padding: '3px 7px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '10px',
                    fontWeight: '700',
                    background: notes.includes(tag) ? 'rgba(255, 45, 120, 0.2)' : 'var(--bg-secondary)',
                    color: notes.includes(tag) ? 'var(--brand-pink)' : 'var(--text-muted)',
                    border: notes.includes(tag) ? '1px solid var(--brand-pink)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  + {tag}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Dormí poco por el turno, pero sin molestias en piernas..."
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '8px 10px',
                fontSize: '12px',
                color: '#ffffff',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Deload Mode Switcher if High Fatigue */}
        {statusInfo.alert && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1.5px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="#ef4444" />
              <div>
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#ffffff', display: 'block' }}>
                  Activar Modo Descarga
                </span>
                <span style={{ fontSize: '10.5px', color: '#fca5a5' }}>
                  Ajusta las cargas un -15% automáticamente hoy.
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              checked={activeDeload}
              onChange={(e) => setActiveDeload(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: '#ef4444',
                cursor: 'pointer'
              }}
            />
          </div>
        )}

        {/* RGPD / LOPDGDD: Consentimiento Explícito de Datos de Salud (Art. 9.2.a) */}
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
            <span style={{ fontSize: '11px', color: '#e2e8f0', lineHeight: '1.4' }}>
              <strong>Consentimiento explícito (RGPD Art. 9):</strong> Autorizo de forma expresa el tratamiento de mis datos de descanso, fatiga física y posibles molestias musculares para que mi Head Coach personalice mis cargas deportivas y prevenga sobrecargas.
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
                fontSize: '10.5px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                padding: '0'
              }}
            >
              <Info size={12} />
              <span>{showLegalDetails ? 'Ocultar información legal' : 'Ver Cláusula Informativa AEPD (1ª Capa)'}</span>
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

          {/* Primera Capa Informativa (Directriz AEPD / Art. 11 LOPDGDD) */}
          {showLegalDetails && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-xs)',
              padding: '8px 10px',
              fontSize: '10px',
              color: '#cbd5e1',
              lineHeight: '1.45',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div><strong>Responsable del Tratamiento:</strong> Hift Iron Box S.L. / Titular del Box.</div>
              <div><strong>Finalidad:</strong> Ajuste técnico de intensidad de WODs, prevención de lesiones y seguimiento de fatiga.</div>
              <div><strong>Base Jurídica:</strong> Consentimiento explícito del interesado (Art. 9.2.a RGPD).</div>
              <div><strong>Destinatarios:</strong> Acceso reservado exclusivamente al Head Coach y titular. No se cederán a terceros.</div>
              <div><strong>Derechos:</strong> Acceso, rectificación, supresión, limitación y revocación desde tu Perfil &gt; Privacidad.</div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSave}
          className="btn-primary"
          disabled={!healthConsentGiven}
          style={{
            width: '100%',
            padding: '13px',
            fontSize: '13px',
            fontWeight: '900',
            borderRadius: 'var(--radius-sm)',
            marginTop: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            opacity: healthConsentGiven ? 1 : 0.5,
            cursor: healthConsentGiven ? 'pointer' : 'not-allowed'
          }}
        >
          <Lock size={15} />
          <span>Guardar Registro Privado para el Coach</span>
        </button>
      </div>
    </div>
  );
}
