import React, { useState } from 'react';
import { X, Award, Check, Dumbbell, Timer } from 'lucide-react';
import { useWorkouts } from '../../context/WorkoutContext';

export default function PerformanceModal({
  isOpen,
  onClose,
  initialExerciseName = '',
  initialZone = 'competitors',
  workoutId = ''
}) {
  const { addPerformanceLog } = useWorkouts();
  const [exerciseName, setExerciseName] = useState(initialExerciseName);
  const [scoreType, setScoreType] = useState('weight'); // 'weight' | 'time' | 'reps'
  const [value, setValue] = useState('');
  const [rpe, setRpe] = useState('8');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;

    addPerformanceLog({
      workoutId,
      zone: initialZone,
      exerciseName: exerciseName.trim() || 'Entrenamiento general',
      scoreType,
      value: value.trim(),
      rpe: parseInt(rpe, 10) || 8,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 100
    }}>
      <div 
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: initialZone === 'competitors' 
                ? 'rgba(255, 45, 120, 0.15)' 
                : 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: initialZone === 'competitors' ? 'var(--brand-pink)' : 'var(--brand-lilac-light)'
            }}>
              <Award size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                Registrar Marca / Sesión
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {initialZone === 'competitors' ? 'Zona Competidores' : 'Gimnasio Tradicional'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Exercise / WOD Name */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              EJERCICIO O WOD
            </label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Ej: Snatch Complex, Press Banca, WOD Fran..."
              required
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#ffffff',
                outline: 'none'
              }}
            />
          </div>

          {/* Metric Type */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              TIPO DE REGISTRO
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setScoreType('weight')}
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  border: scoreType === 'weight' ? '1px solid var(--brand-pink)' : '1px solid var(--border-subtle)',
                  background: scoreType === 'weight' ? 'rgba(255, 45, 120, 0.15)' : 'var(--bg-surface)',
                  color: scoreType === 'weight' ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Dumbbell size={13} />
                <span>Carga (kg)</span>
              </button>

              <button
                type="button"
                onClick={() => setScoreType('time')}
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  border: scoreType === 'time' ? '1px solid var(--brand-pink)' : '1px solid var(--border-subtle)',
                  background: scoreType === 'time' ? 'rgba(255, 45, 120, 0.15)' : 'var(--bg-surface)',
                  color: scoreType === 'time' ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Timer size={13} />
                <span>Tiempo</span>
              </button>

              <button
                type="button"
                onClick={() => setScoreType('reps')}
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  border: scoreType === 'reps' ? '1px solid var(--brand-pink)' : '1px solid var(--border-subtle)',
                  background: scoreType === 'reps' ? 'rgba(255, 45, 120, 0.15)' : 'var(--bg-surface)',
                  color: scoreType === 'reps' ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Award size={13} />
                <span>Reps / Series</span>
              </button>
            </div>
          </div>

          {/* Value */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              VALOR ALCANZADO
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                scoreType === 'weight' 
                  ? 'Ej: 92.5 kg o 4x8 con 80 kg' 
                  : (scoreType === 'time' ? 'Ej: 14:28 RX' : 'Ej: 5 rondas + 12 reps')
              }
              required
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: '13.5px',
                fontWeight: '700',
                color: '#ffffff',
                outline: 'none'
              }}
            />
          </div>

          {/* RPE & Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                RPE (1-10)
              </label>
              <select
                value={rpe}
                onChange={(e) => setRpe(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 8px',
                  fontSize: '12px',
                  color: '#ffffff',
                  outline: 'none'
                }}
              >
                {[6, 7, 8, 9, 10].map(n => (
                  <option key={n} value={n} style={{ background: '#1c1b26' }}>RPE {n}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                SENSACIONES (OPCIONAL)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="RIR 1, bloqueo sólido..."
                style={{
                  width: '100%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 12px',
                  fontSize: '12px',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '13px',
              borderRadius: 'var(--radius-sm)',
              marginTop: '4px'
            }}
          >
            <Check size={16} />
            <span>Guardar en mi Historial</span>
          </button>
        </form>
      </div>
    </div>
  );
}
