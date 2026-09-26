import React, { useState, useEffect, useMemo } from 'react';
import { X, Percent, Dumbbell, Sparkles, Check, ChevronDown, RotateCcw, Plus, Minus, Info } from 'lucide-react';
import { useWorkouts } from '../../context/WorkoutContext';

// Color and size map for authentic Olympic bumper plates
const BUMPER_SPECS = [
  { weight: 25, color: '#dc2626', border: '#ef4444', text: '#ffffff', height: 110, width: 22, name: '25 kg' },
  { weight: 20, color: '#2563eb', border: '#3b82f6', text: '#ffffff', height: 110, width: 20, name: '20 kg' },
  { weight: 15, color: '#ca8a04', border: '#eab308', text: '#ffffff', height: 104, width: 17, name: '15 kg' },
  { weight: 10, color: '#16a34a', border: '#22c55e', text: '#ffffff', height: 96, width: 15, name: '10 kg' },
  { weight: 5,  color: '#f8fafc', border: '#cbd5e1', text: '#0f172a', height: 78, width: 13, name: '5 kg' },
  { weight: 2.5, color: '#1e293b', border: '#475569', text: '#ffffff', height: 64, width: 11, name: '2.5 kg' },
  { weight: 1.25, color: '#64748b', border: '#94a3b8', text: '#ffffff', height: 52, width: 9, name: '1.25 kg' },
  { weight: 0.5, color: '#94a3b8', border: '#cbd5e1', text: '#0f172a', height: 42, width: 7, name: '0.5 kg' }
];

export default function PercentageCalculatorModal({ isOpen, onClose, initialData = {} }) {
  const { prs } = useWorkouts();

  // Extract preset values or defaults
  const [exerciseName, setExerciseName] = useState(initialData.exercise || 'Squat Snatch');
  const [oneRepMax, setOneRepMax] = useState(() => {
    if (initialData.oneRepMax) return parseFloat(initialData.oneRepMax);
    return 85;
  });
  const [selectedPercentage, setSelectedPercentage] = useState(initialData.percentage || 80);
  const [barWeight, setBarWeight] = useState(20); // 20kg (men) | 15kg (women) | 10kg (technique)
  const [roundingStep, setRoundingStep] = useState(2.5); // Round to nearest 2.5kg or 1kg

  // Look up if user has a PR for current exercise
  useEffect(() => {
    if (initialData.exercise) {
      setExerciseName(initialData.exercise);
    }
    if (initialData.percentage) {
      setSelectedPercentage(parseFloat(initialData.percentage));
    }
    if (initialData.oneRepMax) {
      setOneRepMax(parseFloat(initialData.oneRepMax));
      return;
    }

    // Try finding matching PR in context
    const matchingPr = prs.find(p => 
      p.exercise.toLowerCase().includes((initialData.exercise || exerciseName).toLowerCase()) ||
      (initialData.exercise || exerciseName).toLowerCase().includes(p.exercise.toLowerCase())
    );

    if (matchingPr) {
      const parsed = parseFloat(matchingPr.weight);
      if (!isNaN(parsed) && parsed > 0) {
        setOneRepMax(parsed);
      }
    }
  }, [isOpen, initialData, prs]);

  // Common benchmark movements with PR autofill
  const standardExercises = useMemo(() => [
    { name: 'Squat Snatch (Arrancada)', default1RM: 82.5, category: 'olympic' },
    { name: 'Clean & Jerk (Dos Tiempos)', default1RM: 100, category: 'olympic' },
    { name: 'Back Squat (Sentadilla)', default1RM: 140, category: 'power' },
    { name: 'Front Squat (Sentadilla Frontal)', default1RM: 115, category: 'power' },
    { name: 'Deadlift (Peso Muerto)', default1RM: 175, category: 'power' },
    { name: 'Bench Press (Banca)', default1RM: 105, category: 'gym' },
    { name: 'Push Press / Jerk', default1RM: 90, category: 'olympic' },
    { name: 'Overhead Squat', default1RM: 85, category: 'olympic' }
  ], []);

  // When exercise changes from selector, try to find user's PR or fallback
  const handleSelectExercise = (name) => {
    setExerciseName(name);
    const cleanSearch = name.split('(')[0].trim().toLowerCase();
    const userPr = prs.find(p => p.exercise.toLowerCase().includes(cleanSearch));
    if (userPr) {
      const parsed = parseFloat(userPr.weight);
      if (!isNaN(parsed) && parsed > 0) {
        setOneRepMax(parsed);
        return;
      }
    }
    const standard = standardExercises.find(e => e.name === name);
    if (standard) {
      setOneRepMax(standard.default1RM);
    }
  };

  // Calculate target weight based on percentage and rounding
  const rawTargetWeight = (oneRepMax * (selectedPercentage / 100));
  
  // Rounded target weight
  const roundedTargetWeight = useMemo(() => {
    if (rawTargetWeight <= 0) return 0;
    const rounded = Math.round(rawTargetWeight / roundingStep) * roundingStep;
    return Math.max(rounded, barWeight);
  }, [rawTargetWeight, roundingStep, barWeight]);

  // Calculate plates required on ONE side of the barbell
  const plateCalculation = useMemo(() => {
    let weightPerSide = (roundedTargetWeight - barWeight) / 2;
    if (weightPerSide <= 0) {
      return { plates: [], weightPerSide: 0, remaining: 0 };
    }

    const plates = [];
    let remaining = Math.round(weightPerSide * 100) / 100;

    for (const spec of BUMPER_SPECS) {
      while (remaining >= spec.weight - 0.001) {
        plates.push(spec);
        remaining = Math.round((remaining - spec.weight) * 100) / 100;
      }
    }

    return {
      plates,
      weightPerSide: Math.round(weightPerSide * 100) / 100,
      remaining: Math.max(0, remaining)
    };
  }, [roundedTargetWeight, barWeight]);

  if (!isOpen) return null;

  const percentages = [50, 55, 60, 65, 70, 75, 80, 82.5, 85, 87.5, 90, 92.5, 95, 100, 105];

  return (
    <div 
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0
      }}
    >
      <div 
        className="modal-content animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          background: 'radial-gradient(circle at 50% 0%, #1e132e 0%, #0d0d14 100%)',
          borderRadius: '24px 24px 0 0',
          borderTop: '2px solid rgba(255, 45, 120, 0.4)',
          borderLeft: '1px solid var(--border-subtle)',
          borderRight: '1px solid var(--border-subtle)',
          overflowY: 'auto',
          padding: '20px 18px 30px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
              border: '1px solid rgba(255, 45, 120, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-pink)'
            }}>
              <Percent size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '900', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                Calculadora % 1RM & Discos
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                HIFT Iron Box • Asistente de Carga
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
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
            <X size={18} />
          </button>
        </div>

        {/* Exercise & 1RM Config Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div>
            <label style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
              Movimiento / Levantamiento
            </label>
            <select
              value={exerciseName}
              onChange={(e) => handleSelectExercise(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                color: '#ffffff',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: '700',
                outline: 'none'
              }}
            >
              {standardExercises.map((ex, idx) => (
                <option key={idx} value={ex.name}>
                  {ex.name}
                </option>
              ))}
              <option value="Personalizado">Otro / Personalizado</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
            {/* 1RM Input */}
            <div>
              <label style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
                Tu 1RM (Marca Máxima)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  step="0.5"
                  value={oneRepMax}
                  onChange={(e) => setOneRepMax(parseFloat(e.target.value) || 0)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-surface)',
                    border: '1.5px solid var(--brand-pink)',
                    color: '#ffffff',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '16px',
                    fontWeight: '900',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--brand-pink)' }}>kg</span>
              </div>
            </div>

            {/* Barbell Weight */}
            <div>
              <label style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
                Barra Olímpica
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[
                  { wt: 20, label: '20 kg (H)' },
                  { wt: 15, label: '15 kg (M)' },
                  { wt: 10, label: '10 kg' }
                ].map(bar => (
                  <button
                    key={bar.wt}
                    type="button"
                    onClick={() => setBarWeight(bar.wt)}
                    style={{
                      flex: 1,
                      padding: '7px 2px',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '11px',
                      fontWeight: '800',
                      background: barWeight === bar.wt ? 'var(--brand-gradient)' : 'var(--bg-surface)',
                      color: barWeight === bar.wt ? '#ffffff' : 'var(--text-secondary)',
                      border: barWeight === bar.wt ? 'none' : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    {bar.wt}k
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Result Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: '1.5px solid rgba(255, 45, 120, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.08em', color: 'var(--brand-pink)', textTransform: 'uppercase' }}>
              CARGA OBJETIVO AL {selectedPercentage}% DE {oneRepMax} KG
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{
              fontSize: '44px',
              fontWeight: '900',
              fontFamily: 'monospace, var(--font-heading)',
              color: '#ffffff',
              lineHeight: 1
            }}>
              {roundedTargetWeight}
            </span>
            <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--brand-pink)' }}>
              KG
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>Exacto: <strong>{rawTargetWeight.toFixed(1)} kg</strong></span>
            <span>•</span>
            <span>Por cada lado: <strong>{plateCalculation.weightPerSide} kg</strong> + barra {barWeight}kg</span>
          </div>

          {/* Quick +/- micro adjustments */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={() => setSelectedPercentage(prev => Math.max(30, prev - 2.5))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Minus size={12} /> 2.5%
            </button>
            <button
              onClick={() => setSelectedPercentage(prev => Math.min(120, prev + 2.5))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Plus size={12} /> 2.5%
            </button>
          </div>
        </div>

        {/* Olympic Barbell Plate Visualizer */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.45)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: '14px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              DISTRIBUCIÓN EN LA BARRA (1 LADO)
            </span>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--brand-lilac-light)' }}>
              {plateCalculation.plates.length > 0 
                ? plateCalculation.plates.map(p => `${p.weight}k`).join(' + ') 
                : 'Barra vacía'}
            </span>
          </div>

          {/* Barbell Sleeve Graphic */}
          <div style={{
            height: '125px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'radial-gradient(ellipse at center, rgba(30, 20, 50, 0.5) 0%, transparent 80%)',
            overflowX: 'auto',
            padding: '0 10px'
          }}>
            {/* Center Bar shaft */}
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '14px',
              background: 'linear-gradient(180deg, #94a3b8 0%, #475569 50%, #1e293b 100%)',
              zIndex: 1,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.7)'
            }} />

            {/* Bar Collar (Stop ring) */}
            <div style={{
              position: 'absolute',
              left: '18%',
              width: '18px',
              height: '68px',
              background: 'linear-gradient(180deg, #cbd5e1 0%, #64748b 50%, #334155 100%)',
              borderRadius: '4px',
              zIndex: 3,
              border: '1px solid #1e293b'
            }} />

            {/* Stacked Plates on the sleeve */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              marginLeft: '26%',
              zIndex: 4,
              paddingRight: '20px'
            }}>
              {plateCalculation.plates.length === 0 ? (
                <div style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                  fontSize: '11.5px',
                  fontWeight: '700'
                }}>
                  Sólo barra de {barWeight} kg (sin discos adicionales)
                </div>
              ) : (
                plateCalculation.plates.map((plate, pIdx) => (
                  <div
                    key={pIdx}
                    title={`${plate.weight} kg`}
                    style={{
                      height: `${plate.height}px`,
                      width: `${plate.width}px`,
                      backgroundColor: plate.color,
                      border: `1.5px solid ${plate.border}`,
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.6)',
                      position: 'relative'
                    }}
                  >
                    <span style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      fontSize: '9px',
                      fontWeight: '900',
                      color: plate.text,
                      letterSpacing: '-0.02em',
                      userSelect: 'none'
                    }}>
                      {plate.weight}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Plate Legend */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            justifyContent: 'center',
            paddingTop: '4px'
          }}>
            {BUMPER_SPECS.map(b => (
              <div 
                key={b.weight}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  fontWeight: '800',
                  color: 'var(--text-secondary)'
                }}
              >
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: b.color,
                  border: `1px solid ${b.border}`
                }} />
                <span>{b.weight}k</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Percentages Grid Table */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              TABLA RÁPIDA DE PORCENTAJES
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Paso:</span>
              <button
                onClick={() => setRoundingStep(roundingStep === 2.5 ? 1 : 2.5)}
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--brand-lilac-light)',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {roundingStep === 2.5 ? '±2.5kg' : '±1kg'}
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '6px'
          }}>
            {percentages.map(pct => {
              const wt = Math.round((oneRepMax * (pct / 100)) / roundingStep) * roundingStep;
              const isSelected = selectedPercentage === pct;

              return (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setSelectedPercentage(pct)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--brand-gradient)' : 'var(--bg-secondary)',
                    border: isSelected ? '1px solid transparent' : '1px solid var(--border-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--text-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: isSelected ? 'var(--brand-gradient-glow)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: '900', opacity: isSelected ? 1 : 0.8 }}>
                    {pct}%
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '900', color: isSelected ? '#ffffff' : 'var(--brand-pink)' }}>
                    {wt} kg
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '13px',
            fontSize: '13px',
            fontWeight: '800',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          Aplicar Carga y Volver al WOD
        </button>
      </div>
    </div>
  );
}
